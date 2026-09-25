-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 10: Trainingsplan-Vorlagen, Trainingstage & Ist/Soll-Tracking
--
-- Hintergrund:
--   - Der Coach soll Trainingsplan-VORLAGEN aus der Übungsbibliothek bauen
--     können (mehrere Trainingstage je Vorlage), unabhängig von einem
--     konkreten Kunden.
--   - Eine Vorlage wird einem Kunden zugewiesen, indem sie in einen
--     eigenständigen, individuellen Plan KOPIERT wird (keine Live-Verknüpfung
--     – spätere Änderungen an der Vorlage wirken sich nicht rückwirkend auf
--     bereits zugewiesene Kundenpläne aus).
--   - Zusätzlich zu einer Vorlage können einem Kunden weiterhin auch einzelne
--     Übungen direkt zugewiesen bzw. in einen bestehenden Tag seines Plans
--     integriert werden.
--   - Cardio-Übungen bekommen eine Soll-Dauer (target_duration_seconds), die
--     Ist-Erfassung im Trainingstagebuch bekommt ein Gegenstück
--     (duration_seconds), damit dokumentiert werden kann, ob nach Plan, oder
--     unter/über Vorgabe (Sätze, Wiederholungen, Gewicht oder Dauer)
--     trainiert wurde.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-009 bereits liefen.
-- ============================================================================

-- 1) Trainingsplan-Vorlagen (wiederverwendbare Baupläne, kundenunabhängig)
-- ----------------------------------------------------------------------------
create table if not exists public.plan_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.plan_templates is 'Wiederverwendbare Trainingsplan-Vorlagen (Bauplan), von Admin/Coach gepflegt, unabhängig von einzelnen Kunden.';

alter table public.plan_templates enable row level security;

drop policy if exists "plan_templates_admin_select" on public.plan_templates;
create policy "plan_templates_admin_select"
  on public.plan_templates for select
  using (public.is_admin());

drop policy if exists "plan_templates_admin_insert" on public.plan_templates;
create policy "plan_templates_admin_insert"
  on public.plan_templates for insert
  with check (public.is_admin());

drop policy if exists "plan_templates_admin_update" on public.plan_templates;
create policy "plan_templates_admin_update"
  on public.plan_templates for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "plan_templates_admin_delete" on public.plan_templates;
create policy "plan_templates_admin_delete"
  on public.plan_templates for delete
  using (public.is_admin());


-- 2) Trainingstage innerhalb einer Vorlage (z.B. "Tag 1 – Oberkörper")
-- ----------------------------------------------------------------------------
create table if not exists public.plan_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.plan_templates(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

comment on table public.plan_template_days is 'Trainingstage innerhalb einer Trainingsplan-Vorlage.';

alter table public.plan_template_days enable row level security;

drop policy if exists "plan_template_days_admin_all" on public.plan_template_days;
create policy "plan_template_days_admin_all"
  on public.plan_template_days for all
  using (public.is_admin())
  with check (public.is_admin());


-- 3) Übungen innerhalb eines Vorlagen-Trainingstages (Soll-Werte)
-- ----------------------------------------------------------------------------
create table if not exists public.plan_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_day_id uuid not null references public.plan_template_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  target_sets int,
  target_reps text,
  target_weight_hint text,
  target_duration_seconds int,
  sort_order int not null default 0,
  notes text
);

comment on table public.plan_template_exercises is 'Soll-Vorgaben je Übung innerhalb eines Vorlagen-Trainingstages, inkl. Ziel-Dauer für Cardio-Übungen.';

alter table public.plan_template_exercises enable row level security;

drop policy if exists "plan_template_exercises_admin_all" on public.plan_template_exercises;
create policy "plan_template_exercises_admin_all"
  on public.plan_template_exercises for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4) Trainingstage innerhalb eines zugewiesenen Kundenplans
-- ----------------------------------------------------------------------------
create table if not exists public.training_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

comment on table public.training_plan_days is 'Trainingstage innerhalb eines konkreten, einem Kunden zugewiesenen Trainingsplans.';

alter table public.training_plan_days enable row level security;

drop policy if exists "training_plan_days_select" on public.training_plan_days;
create policy "training_plan_days_select"
  on public.training_plan_days for select
  using (
    exists (
      select 1 from public.training_plans tp
      where tp.id = training_plan_days.plan_id
        and ((tp.client_id = auth.uid() and not public.is_locked()) or public.is_admin())
    )
  );

drop policy if exists "training_plan_days_admin_insert" on public.training_plan_days;
create policy "training_plan_days_admin_insert"
  on public.training_plan_days for insert
  with check (public.is_admin());

drop policy if exists "training_plan_days_admin_update" on public.training_plan_days;
create policy "training_plan_days_admin_update"
  on public.training_plan_days for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "training_plan_days_admin_delete" on public.training_plan_days;
create policy "training_plan_days_admin_delete"
  on public.training_plan_days for delete
  using (public.is_admin());


-- 5) training_plans: Referenz auf die Ursprungs-Vorlage (rein informativ)
-- ----------------------------------------------------------------------------
alter table public.training_plans
  add column if not exists template_source_id uuid references public.plan_templates(id);

comment on column public.training_plans.template_source_id is
  'Vorlage, aus der dieser Plan beim Zuweisen kopiert wurde. Rein informativ – keine Live-Verknüpfung, spätere Änderungen an der Vorlage wirken sich nicht auf bereits zugewiesene Pläne aus.';


-- 6) plan_exercises: Tag-Zuordnung (optional) + Soll-Dauer für Cardio
-- ----------------------------------------------------------------------------
alter table public.plan_exercises
  add column if not exists plan_day_id uuid references public.training_plan_days(id) on delete cascade;

alter table public.plan_exercises
  add column if not exists target_duration_seconds int;

comment on column public.plan_exercises.plan_day_id is
  'Optionaler Trainingstag, dem diese Übung zugeordnet ist. NULL = einzeln zugewiesene Übung ohne festen Tag.';
comment on column public.plan_exercises.target_duration_seconds is
  'Soll-Dauer in Sekunden, z.B. für Cardio-Übungen (alternativ oder zusätzlich zu target_sets/target_reps).';


-- 7) training_logs: Ist-Dauer für Cardio-Übungen
-- ----------------------------------------------------------------------------
alter table public.training_logs
  add column if not exists duration_seconds int;

comment on column public.training_logs.duration_seconds is
  'Tatsächlich absolvierte Dauer in Sekunden, z.B. bei Cardio-Übungen oder wenn länger/kürzer als die Vorgabe trainiert wurde.';


-- 8) Basis-Zugriffsrechte
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.plan_templates to authenticated;
grant select, insert, update, delete on public.plan_template_days to authenticated;
grant select, insert, update, delete on public.plan_template_exercises to authenticated;
grant select, insert, update, delete on public.training_plan_days to authenticated;
