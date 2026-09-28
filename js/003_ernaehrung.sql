-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 3: Ernährung & Körperzusammensetzung
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001_fundament.sql und
-- 002_training.sql bereits liefen.
-- ============================================================================

-- 1) Körpermaße / Navy-Methode Verlauf
-- ----------------------------------------------------------------------------
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  measured_at date not null default current_date,
  sex text not null check (sex in ('male', 'female')),
  height_cm numeric not null,
  neck_cm numeric not null,
  waist_cm numeric not null,
  hip_cm numeric,
  weight_kg numeric,
  body_fat_percent numeric,
  waist_to_hip_ratio numeric,
  created_at timestamptz not null default now()
);

comment on table public.body_measurements is 'Verlauf der Körpermaße/Körperfett-Schätzung (Navy-Methode) je Kunde, ohne Fotos.';

alter table public.body_measurements enable row level security;

drop policy if exists "body_measurements_select" on public.body_measurements;
create policy "body_measurements_select"
  on public.body_measurements for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "body_measurements_insert" on public.body_measurements;
create policy "body_measurements_insert"
  on public.body_measurements for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "body_measurements_update" on public.body_measurements;
create policy "body_measurements_update"
  on public.body_measurements for update
  using (client_id = auth.uid() and not public.is_locked())
  with check (client_id = auth.uid());

drop policy if exists "body_measurements_delete" on public.body_measurements;
create policy "body_measurements_delete"
  on public.body_measurements for delete
  using (client_id = auth.uid() and not public.is_locked());


-- 2) Rezepte (PDF-Downloads im Corporate Design)
-- ----------------------------------------------------------------------------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  pdf_url text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.recipes is 'Von Admin/Coach gepflegte Rezept-PDFs, für alle nicht gesperrten Kunden lesbar.';

alter table public.recipes enable row level security;

drop policy if exists "recipes_select" on public.recipes;
create policy "recipes_select"
  on public.recipes for select
  using (auth.uid() is not null and not public.is_locked());

drop policy if exists "recipes_admin_insert" on public.recipes;
create policy "recipes_admin_insert"
  on public.recipes for insert
  with check (public.is_admin());

drop policy if exists "recipes_admin_update" on public.recipes;
create policy "recipes_admin_update"
  on public.recipes for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipes_admin_delete" on public.recipes;
create policy "recipes_admin_delete"
  on public.recipes for delete
  using (public.is_admin());


-- 3) Basis-Zugriffsrechte
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.body_measurements to authenticated;
grant select, insert, update, delete on public.recipes to authenticated;
