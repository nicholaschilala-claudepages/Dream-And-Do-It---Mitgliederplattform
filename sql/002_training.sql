-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 2: Trainingsbereich (Übungsbibliothek, Trainingspläne, Tracking)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001_fundament.sql bereits lief.
-- ============================================================================

-- 1) Übungsbibliothek
-- ----------------------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  muscle_group text,
  image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.exercises is 'Übungsbibliothek: von Admin/Coach gepflegt, von allen Kunden lesbar.';

alter table public.exercises enable row level security;

drop policy if exists "exercises_select" on public.exercises;
create policy "exercises_select"
  on public.exercises for select
  using (auth.uid() is not null and not public.is_locked());

drop policy if exists "exercises_admin_insert" on public.exercises;
create policy "exercises_admin_insert"
  on public.exercises for insert
  with check (public.is_admin());

drop policy if exists "exercises_admin_update" on public.exercises;
create policy "exercises_admin_update"
  on public.exercises for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "exercises_admin_delete" on public.exercises;
create policy "exercises_admin_delete"
  on public.exercises for delete
  using (public.is_admin());


-- 2) Trainingspläne (ein Plan gehört zu genau einem Kunden)
-- ----------------------------------------------------------------------------
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.training_plans is 'Von Admin/Coach erstellte, personalisierte Trainingspläne je Kunde.';

alter table public.training_plans enable row level security;

drop policy if exists "training_plans_select" on public.training_plans;
create policy "training_plans_select"
  on public.training_plans for select
  using (
    (client_id = auth.uid() and not public.is_locked())
    or public.is_admin()
  );

drop policy if exists "training_plans_admin_insert" on public.training_plans;
create policy "training_plans_admin_insert"
  on public.training_plans for insert
  with check (public.is_admin());

drop policy if exists "training_plans_admin_update" on public.training_plans;
create policy "training_plans_admin_update"
  on public.training_plans for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "training_plans_admin_delete" on public.training_plans;
create policy "training_plans_admin_delete"
  on public.training_plans for delete
  using (public.is_admin());


-- 3) Übungen innerhalb eines Plans (Soll-Werte: Sätze, Wiederholungen, Hinweise)
-- ----------------------------------------------------------------------------
create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  target_sets int,
  target_reps text,
  target_weight_hint text,
  sort_order int not null default 0,
  notes text
);

comment on table public.plan_exercises is 'Soll-Vorgaben je Übung innerhalb eines Trainingsplans.';

alter table public.plan_exercises enable row level security;

drop policy if exists "plan_exercises_select" on public.plan_exercises;
create policy "plan_exercises_select"
  on public.plan_exercises for select
  using (
    exists (
      select 1 from public.training_plans tp
      where tp.id = plan_exercises.plan_id
        and ((tp.client_id = auth.uid() and not public.is_locked()) or public.is_admin())
    )
  );

drop policy if exists "plan_exercises_admin_insert" on public.plan_exercises;
create policy "plan_exercises_admin_insert"
  on public.plan_exercises for insert
  with check (public.is_admin());

drop policy if exists "plan_exercises_admin_update" on public.plan_exercises;
create policy "plan_exercises_admin_update"
  on public.plan_exercises for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "plan_exercises_admin_delete" on public.plan_exercises;
create policy "plan_exercises_admin_delete"
  on public.plan_exercises for delete
  using (public.is_admin());


-- 4) Trainingstagebuch (Ist-Werte: was der Kunde tatsächlich gemacht hat)
-- ----------------------------------------------------------------------------
create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  plan_exercise_id uuid references public.plan_exercises(id),
  performed_at timestamptz not null default now(),
  set_number int,
  reps int,
  weight_kg numeric,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.training_logs is 'Vom Kunden selbst erfasste Trainingsdaten (Ist-Werte je Satz).';

alter table public.training_logs enable row level security;

drop policy if exists "training_logs_select" on public.training_logs;
create policy "training_logs_select"
  on public.training_logs for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "training_logs_insert" on public.training_logs;
create policy "training_logs_insert"
  on public.training_logs for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "training_logs_update" on public.training_logs;
create policy "training_logs_update"
  on public.training_logs for update
  using (client_id = auth.uid() and not public.is_locked())
  with check (client_id = auth.uid());

drop policy if exists "training_logs_delete" on public.training_logs;
create policy "training_logs_delete"
  on public.training_logs for delete
  using (client_id = auth.uid() and not public.is_locked());


-- 5) Basis-Zugriffsrechte (nicht vergessen – siehe Lektion aus Etappe 1!)
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, update, delete on public.training_plans to authenticated;
grant select, insert, update, delete on public.plan_exercises to authenticated;
grant select, insert, update, delete on public.training_logs to authenticated;
