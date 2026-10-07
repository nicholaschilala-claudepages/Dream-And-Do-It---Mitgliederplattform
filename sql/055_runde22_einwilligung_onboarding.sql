-- ============================================================================
-- Migration 055 (Runde 22): Einwilligungen und Willkommens-Ablauf
--
-- 1) Einwilligungen (DSGVO): Zeitpunkt, zu dem ein Kunde die Nutzungs-
--    bedingungen/Datenschutzhinweise akzeptiert und der Verarbeitung seiner
--    Gesundheitsdaten (Art. 9 Abs. 2 lit. a DSGVO) zugestimmt hat, plus die
--    Version der Texte (js/legal-content.js, LEGAL_VERSION).
--      - Bei der Registrierung übergibt die App die Zustimmungen als
--        Metadaten; der Trigger handle_new_user() übernimmt sie mit dem
--        SERVER-Zeitstempel now() (nicht der Uhrzeit des Geräts).
--      - Bestehende Kunden (vor dieser Migration registriert) werden beim
--        nächsten Login einmalig gefragt; die App ruft dazu
--        record_my_consent() auf.
--      - Kunden können die Einwilligungsspalten NICHT direkt per API ändern
--        (Trigger), sondern nur über record_my_consent(); Admins dürfen alles.
-- 2) onboarding_seen_at: Zeitpunkt, an dem der Willkommens-Ablauf (3 Schritte)
--    abgeschlossen oder übersprungen wurde.
--
-- Rein additiv und idempotent (mehrfaches Ausführen ist unschädlich).
-- ============================================================================

alter table public.profiles add column if not exists consent_terms_at timestamptz;
alter table public.profiles add column if not exists consent_health_at timestamptz;
alter table public.profiles add column if not exists consent_version text;
alter table public.profiles add column if not exists onboarding_seen_at timestamptz;

comment on column public.profiles.consent_terms_at is 'Zeitpunkt (Server), zu dem Nutzungsbedingungen und Datenschutzhinweise akzeptiert wurden.';
comment on column public.profiles.consent_health_at is 'Zeitpunkt (Server) der ausdrücklichen Einwilligung in die Verarbeitung von Gesundheitsdaten (Art. 9 Abs. 2 lit. a DSGVO).';
comment on column public.profiles.consent_version is 'Version der Rechtstexte, auf die sich die Einwilligung bezieht (LEGAL_VERSION in js/legal-content.js).';
comment on column public.profiles.onboarding_seen_at is 'Willkommens-Ablauf abgeschlossen oder übersprungen.';

-- 1a) Registrierung: Einwilligungen aus den Anmelde-Metadaten übernehmen
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_terms boolean := coalesce(new.raw_user_meta_data->>'consent_terms', '') = 'true';
  v_health boolean := coalesce(new.raw_user_meta_data->>'consent_health', '') = 'true';
begin
  insert into public.profiles (id, email, full_name, role, consent_terms_at, consent_health_at, consent_version)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'client',
    case when v_terms then now() end,
    case when v_health then now() end,
    case when v_terms or v_health then left(new.raw_user_meta_data->>'consent_version', 40) end
  );
  return new;
end;
$$;

-- 1b) Bestehende Kunden: Einwilligung einmalig nachholen (nur über diese Funktion)
create or replace function public.record_my_consent(p_version text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet.';
  end if;
  perform set_config('dadi.consent_rpc', '1', true);
  update public.profiles
     set consent_terms_at = now(),
         consent_health_at = now(),
         consent_version = left(p_version, 40)
   where id = auth.uid();
end;
$$;

revoke all on function public.record_my_consent(text) from public;
grant execute on function public.record_my_consent(text) to authenticated;

-- 1c) Schutz: Kunden dürfen Einwilligungsspalten nicht direkt verändern
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Nur Admins dürfen die Rolle ändern.';
    end if;
    if new.access_locked is distinct from old.access_locked then
      raise exception 'Nur Admins dürfen den Zugriffsstatus ändern.';
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
