-- ============================================================================
-- 056 – Sicherheitsprüfung Runde 22
-- Schließt Lücken, die bei der Prüfung der Zugriffsregeln gefunden wurden:
--   1) Kunden konnten sich über ihr eigenes Profil selbst Module freischalten
--      (training_enabled / nutrition_enabled / coaching_enabled), die Geräte-
--      grenze (max_devices) erhöhen oder die E-Mail / "neu angemeldet"-Markierung
--      ändern. Jetzt dürfen Nicht-Admins nur noch ihre persönlichen Angaben
--      ändern (Name, Geburtsdatum, Größe, Geschlecht, Onboarding-Hinweis).
--   2) Gesperrte Kunden konnten einzelne Daten noch ändern (Ziele, Ernährungs-
--      protokoll, Präventionstests, Handlungsschritte). Jetzt überall gesperrt.
--   3) Nachrichten: Empfänger durften den gesamten Inhalt ändern. Jetzt darf
--      ein Nicht-Admin nur noch den Gelesen-Status ändern.
--   4) Funktionen und Tabellen waren ohne Anmeldung (Rolle "anon") erreichbar.
--      Jetzt nur noch für angemeldete Nutzer.
--   5) Längenbegrenzungen für Freitext (Nachrichten, Name).
-- Alles idempotent und rückwärtskompatibel (Bestandsdaten werden nicht verändert).
-- ============================================================================

-- 1) Profil-Schutz --------------------------------------------------------
-- Hinweis: auth.uid() ist NULL bei SQL-Editor / Service-Rolle / Wiederherstellung.
-- Dort darf weiterhin alles geändert werden (z. B. erster Admin per SQL).
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.id is distinct from old.id then
      raise exception 'Die Profil-ID darf nicht geändert werden.';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Nur Admins dürfen die Rolle ändern.';
    end if;
    if new.access_locked is distinct from old.access_locked then
      raise exception 'Nur Admins dürfen den Zugriffsstatus ändern.';
    end if;
    if new.max_devices is distinct from old.max_devices then
      raise exception 'Nur Admins dürfen die Geräteanzahl ändern.';
    end if;
    if new.training_enabled is distinct from old.training_enabled
       or new.nutrition_enabled is distinct from old.nutrition_enabled
       or new.coaching_enabled is distinct from old.coaching_enabled then
      raise exception 'Nur Admins dürfen Bereiche freischalten.';
    end if;
    if new.new_signup_seen is distinct from old.new_signup_seen then
      raise exception 'Nur Admins dürfen diese Markierung ändern.';
    end if;
    if new.email is distinct from old.email
       or new.created_at is distinct from old.created_at then
      raise exception 'E-Mail-Adresse und Anlagedatum sind schreibgeschützt.';
    end if;
    if coalesce(current_setting('dadi.consent_rpc', true), '') <> '1' and (
         new.consent_terms_at is distinct from old.consent_terms_at
      or new.consent_health_at is distinct from old.consent_health_at
      or new.consent_version is distinct from old.consent_version
    ) then
      raise exception 'Einwilligungen werden nur über die Plattform erfasst.';
    end if;
  end if;
  return new;
end;
$$;

-- 2) Gesperrte Kunden: Änderungsrechte konsequent schließen -----------------
drop policy if exists coaching_goals_update on public.coaching_goals;
create policy coaching_goals_update on public.coaching_goals
  for update
  using (is_admin() or (client_id = auth.uid() and not is_locked()))
  with check (is_admin() or (client_id = auth.uid() and not is_locked()));

drop policy if exists nutrition_logs_update on public.nutrition_logs;
create policy nutrition_logs_update on public.nutrition_logs
  for update
  using (is_admin() or (client_id = auth.uid() and not is_locked()))
  with check (is_admin() or (client_id = auth.uid() and not is_locked()));

drop policy if exists prevention_test_results_update on public.prevention_test_results;
create policy prevention_test_results_update on public.prevention_test_results
  for update
  using (is_admin() or (client_id = auth.uid() and not is_locked()))
  with check (is_admin() or (client_id = auth.uid() and not is_locked()));

drop policy if exists goal_will_actions_update on public.goal_will_actions;
create policy goal_will_actions_update on public.goal_will_actions
  for update
  using (
    is_admin() or (not is_locked() and exists (
      select 1 from public.coaching_goals g
      where g.id = goal_will_actions.goal_id and g.client_id = auth.uid()))
  )
  with check (
    is_admin() or (not is_locked() and exists (
      select 1 from public.coaching_goals g
      where g.id = goal_will_actions.goal_id and g.client_id = auth.uid()))
  );

-- 3) Nachrichten: Nicht-Admins dürfen nur den Gelesen-Status ändern ----------
create or replace function public.messages_protect_content()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.id is distinct from old.id
       or new.sender_id is distinct from old.sender_id
       or new.recipient_id is distinct from old.recipient_id
       or new.service_context is distinct from old.service_context
       or new.body is distinct from old.body
       or new.created_at is distinct from old.created_at then
      raise exception 'Nachrichten können nicht nachträglich geändert werden.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_messages_protect_content on public.messages;
create trigger trg_messages_protect_content
  before update on public.messages
  for each row execute procedure public.messages_protect_content();

-- 4) Rechte für nicht angemeldete Besucher (Rolle "anon") entziehen ----------
-- Die App benötigt vor der Anmeldung nur die Supabase-Anmeldefunktion, keine
-- Datenbanktabellen oder eigenen Funktionen.
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from public, anon;
grant  execute on all functions in schema public to authenticated, service_role;
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from public, anon;

-- Interne Trigger-Funktionen müssen auch für angemeldete Nutzer nicht per RPC
-- aufrufbar sein.
revoke execute on function public.handle_new_user() from authenticated, public;
revoke execute on function public.prevent_self_privilege_escalation() from authenticated, public;
revoke execute on function public.messages_protect_content() from authenticated, public;

-- 5) Längenbegrenzungen (NOT VALID: Bestandsdaten bleiben unangetastet) ------
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'messages_body_length') then
    alter table public.messages
      add constraint messages_body_length check (char_length(body) <= 5000) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_full_name_length') then
    alter table public.profiles
      add constraint profiles_full_name_length check (char_length(full_name) <= 120) not valid;
  end if;
end $$;

-- 6) Herkunftsangaben nicht fälschbar ----------------------------------------
-- Trainer-Kommentare und "gemessen vom Trainer" dürfen nur Admins setzen.
-- Bei Kunden werden diese Felder serverseitig zurückgesetzt / festgelegt.
create or replace function public.enforce_provenance()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_table_name = 'nutrition_logs' then
    if tg_op = 'INSERT' then
      new.trainer_comment := null;
      new.trainer_comment_by := null;
      new.trainer_comment_at := null;
    else
      new.trainer_comment := old.trainer_comment;
      new.trainer_comment_by := old.trainer_comment_by;
      new.trainer_comment_at := old.trainer_comment_at;
    end if;
  elsif tg_table_name in ('body_measurements', 'prevention_test_results') then
    new.measured_by := 'client';
  elsif tg_table_name = 'goal_options' then
    if tg_op = 'INSERT' then
      new.coach_comment := null;
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_provenance() from authenticated, public;

drop trigger if exists trg_provenance on public.nutrition_logs;
create trigger trg_provenance before insert or update on public.nutrition_logs
  for each row execute procedure public.enforce_provenance();

drop trigger if exists trg_provenance on public.body_measurements;
create trigger trg_provenance before insert or update on public.body_measurements
  for each row execute procedure public.enforce_provenance();

drop trigger if exists trg_provenance on public.prevention_test_results;
create trigger trg_provenance before insert or update on public.prevention_test_results
  for each row execute procedure public.enforce_provenance();

drop trigger if exists trg_provenance on public.goal_options;
create trigger trg_provenance before insert on public.goal_options
  for each row execute procedure public.enforce_provenance();
