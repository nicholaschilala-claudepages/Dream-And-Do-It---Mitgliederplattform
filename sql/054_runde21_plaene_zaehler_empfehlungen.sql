-- ============================================================================
-- Migration 054 (Runde 21): Plan-Editor, Live-Zahlen, Interessen & Empfehlungen
--
-- 1) Q11 – Trainer bearbeitet zugewiesene Pläne: Wird eine Übung oder ein
--    Trainingstag aus einem Kundenplan entfernt, dürfen bereits geloggte Sätze
--    bzw. Einheiten NICHT daran scheitern (Fremdschlüssel ohne ON DELETE).
--    Die Verknüpfung wird stattdessen gelöst (SET NULL); die Logs bleiben mit
--    exercise_id/performed_at/Werten vollständig im Trainingstagebuch erhalten.
-- 2) Q12 – Live-Zahlen: section_counts() liefert Anzahlen (Übungen, Rezepte,
--    Lebensmittel, Coaching-Content, Themengruppen) unabhängig von der
--    Rubrik-Freigabe des Kunden (SECURITY DEFINER, nur Zahlen, keine Inhalte).
-- 3) Q13 – Interessen & Empfehlungen: client_interests (vom Kunden angeklickte
--    Interessen-Kategorien) und client_recommendation_overrides (Trainer
--    blendet Empfehlungen aus/ergänzt eigene mit persönlicher Notiz).
--
-- Rein additiv und idempotent (mehrfaches Ausführen ist unschädlich).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Fremdschlüssel auf "ON DELETE SET NULL" umstellen
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname, a.attname as col, c.confrelid::regclass as reftbl
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and array_length(c.conkey, 1) = 1
      and c.confdeltype <> 'n'
      and (
        (c.conrelid = 'public.training_logs'::regclass and a.attname = 'plan_exercise_id')
        or (c.conrelid = 'public.training_sessions'::regclass and a.attname in ('plan_id', 'plan_day_id'))
      )
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format('alter table %s add constraint %I foreign key (%I) references %s(id) on delete set null',
                   r.tbl, r.conname, r.col, r.reftbl);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Live-Zahlen für die Rubrik-Erklärungen
-- ---------------------------------------------------------------------------
create or replace function public.section_counts()
returns jsonb
language sql
security definer set search_path = public
stable
as $$
  select jsonb_build_object(
    'exercises',       (select count(*) from public.exercises),
    'recipes',         (select count(*) from public.recipes),
    'food_items',      (select count(*) from public.food_items),
    'coaching_content',(select count(*) from public.coaching_content),
    'coaching_groups', (select count(distinct theme_group) from public.coaching_content where theme_group is not null)
  );
$$;

comment on function public.section_counts() is
  'Anzahlen für die Rubrik-Erklärungen (Übungen, Rezepte, Lebensmittel, Coaching-Content). Nur Zahlen, unabhängig von der Freigabe des Kunden.';

revoke all on function public.section_counts() from public;
grant execute on function public.section_counts() to authenticated;

-- ---------------------------------------------------------------------------
-- 3a) Interessen-Kategorien des Kunden (zum Anklicken)
-- ---------------------------------------------------------------------------
create table if not exists public.client_interests (
  client_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in (
    'abnehmen', 'muskelaufbau', 'fitness_ausdauer', 'stress_schlaf', 'gesundheit_praevention', 'mindset_gewohnheiten'
  )),
  created_at timestamptz not null default now(),
  primary key (client_id, category)
);

comment on table public.client_interests is
  'Interessen-Kategorien, die ein Kunde angeklickt hat, um passende Hinweise zur Nutzung der Plattform und Leistungen zu erhalten (Runde 21).';

alter table public.client_interests enable row level security;

drop policy if exists "client_interests_select" on public.client_interests;
create policy "client_interests_select"
  on public.client_interests for select
  using ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

drop policy if exists "client_interests_insert" on public.client_interests;
create policy "client_interests_insert"
  on public.client_interests for insert
  with check ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

drop policy if exists "client_interests_delete" on public.client_interests;
create policy "client_interests_delete"
  on public.client_interests for delete
  using ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

grant select, insert, delete on public.client_interests to authenticated;

-- ---------------------------------------------------------------------------
-- 3b) Trainer-Überschreibung der automatischen Empfehlungen
-- ---------------------------------------------------------------------------
create table if not exists public.client_recommendation_overrides (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  item_key text not null,
  mode text not null check (mode in ('add', 'hide')),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (client_id, item_key)
);

comment on table public.client_recommendation_overrides is
  'Trainer-Überschreibung je Kunde: mode=hide blendet eine automatische Empfehlung aus, mode=add ergänzt eine Empfehlung (optional mit persönlicher Notiz).';

alter table public.client_recommendation_overrides enable row level security;

drop policy if exists "client_reco_overrides_select" on public.client_recommendation_overrides;
create policy "client_reco_overrides_select"
  on public.client_recommendation_overrides for select
  using ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

drop policy if exists "client_reco_overrides_admin_write" on public.client_recommendation_overrides;
create policy "client_reco_overrides_admin_write"
  on public.client_recommendation_overrides for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.client_recommendation_overrides to authenticated;
grant insert, update, delete on public.client_recommendation_overrides to authenticated;
