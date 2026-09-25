-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 4: Coaching (Content-Downloads, Fragebögen, Ziel-Modul nach GROW)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001_fundament.sql, 002_training.sql
-- und 003_ernaehrung.sql bereits liefen.
-- ============================================================================

-- 1) Coaching-Content (PDF-Downloads: Persönlichkeitsentwicklung etc.)
-- ----------------------------------------------------------------------------
create table if not exists public.coaching_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  pdf_url text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.coaching_content is 'Von Admin/Coach gepflegte PDF-Inhalte zu persönlicher Entwicklung/Coaching.';

alter table public.coaching_content enable row level security;

drop policy if exists "coaching_content_select" on public.coaching_content;
create policy "coaching_content_select"
  on public.coaching_content for select
  using (auth.uid() is not null and not public.is_locked());

drop policy if exists "coaching_content_admin_insert" on public.coaching_content;
create policy "coaching_content_admin_insert"
  on public.coaching_content for insert
  with check (public.is_admin());

drop policy if exists "coaching_content_admin_update" on public.coaching_content;
create policy "coaching_content_admin_update"
  on public.coaching_content for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "coaching_content_admin_delete" on public.coaching_content;
create policy "coaching_content_admin_delete"
  on public.coaching_content for delete
  using (public.is_admin());


-- 2) Fragebögen: Ergebnisse validierter (sport-)psychologischer Skalen
-- ----------------------------------------------------------------------------
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  questionnaire_key text not null,
  answers jsonb not null,
  score numeric,
  max_score numeric,
  interpretation text,
  completed_at timestamptz not null default now()
);

comment on table public.questionnaire_responses is 'Ausgefüllte (sport-)psychologische Fragebögen je Kunde. Auswertung wird clientseitig berechnet und hier nur gespeichert.';

alter table public.questionnaire_responses enable row level security;

drop policy if exists "questionnaire_responses_select" on public.questionnaire_responses;
create policy "questionnaire_responses_select"
  on public.questionnaire_responses for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "questionnaire_responses_insert" on public.questionnaire_responses;
create policy "questionnaire_responses_insert"
  on public.questionnaire_responses for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "questionnaire_responses_delete" on public.questionnaire_responses;
create policy "questionnaire_responses_delete"
  on public.questionnaire_responses for delete
  using (public.is_admin() or (client_id = auth.uid() and not public.is_locked()));


-- 3) Ziel-Modul nach dem GROW-Modell (Goal, Reality, Options, Will)
-- ----------------------------------------------------------------------------
create table if not exists public.coaching_goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  goal_text text not null,
  reality_text text,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.coaching_goals is 'Ziele im GROW-Modell: Goal (title/goal_text) und Reality (reality_text). Options/Will in eigenen Tabellen.';

alter table public.coaching_goals enable row level security;

drop policy if exists "coaching_goals_select" on public.coaching_goals;
create policy "coaching_goals_select"
  on public.coaching_goals for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "coaching_goals_insert" on public.coaching_goals;
create policy "coaching_goals_insert"
  on public.coaching_goals for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "coaching_goals_update" on public.coaching_goals;
create policy "coaching_goals_update"
  on public.coaching_goals for update
  using (client_id = auth.uid() or public.is_admin())
  with check (client_id = auth.uid() or public.is_admin());

drop policy if exists "coaching_goals_delete" on public.coaching_goals;
create policy "coaching_goals_delete"
  on public.coaching_goals for delete
  using (public.is_admin() or (client_id = auth.uid() and not public.is_locked()));


create table if not exists public.goal_options (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.coaching_goals(id) on delete cascade,
  author_role text not null check (author_role in ('client', 'coach')),
  option_text text not null,
  coach_comment text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.goal_options is 'Options-Phase (GROW): vom Kunden gesammelte Optionen, vom Coach kommentiert und für die Will-Phase ausgewählt.';

alter table public.goal_options enable row level security;

drop policy if exists "goal_options_select" on public.goal_options;
create policy "goal_options_select"
  on public.goal_options for select
  using (
    public.is_admin()
    or exists (select 1 from public.coaching_goals g where g.id = goal_options.goal_id and g.client_id = auth.uid())
  );

drop policy if exists "goal_options_insert" on public.goal_options;
create policy "goal_options_insert"
  on public.goal_options for insert
  with check (
    not public.is_locked()
    and (
      (author_role = 'coach' and public.is_admin())
      or (
        author_role = 'client'
        and exists (select 1 from public.coaching_goals g where g.id = goal_options.goal_id and g.client_id = auth.uid())
      )
    )
  );

drop policy if exists "goal_options_update" on public.goal_options;
create policy "goal_options_update"
  on public.goal_options for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "goal_options_delete" on public.goal_options;
create policy "goal_options_delete"
  on public.goal_options for delete
  using (
    public.is_admin()
    or (
      author_role = 'client'
      and not is_selected
      and exists (select 1 from public.coaching_goals g where g.id = goal_options.goal_id and g.client_id = auth.uid() and not public.is_locked())
    )
  );


create table if not exists public.goal_will_actions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.coaching_goals(id) on delete cascade,
  option_id uuid references public.goal_options(id) on delete set null,
  description text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

comment on table public.goal_will_actions is 'Will-Phase (GROW): konkrete, terminierte Maßnahmen aus den ausgewählten Optionen.';

alter table public.goal_will_actions enable row level security;

drop policy if exists "goal_will_actions_select" on public.goal_will_actions;
create policy "goal_will_actions_select"
  on public.goal_will_actions for select
  using (
    public.is_admin()
    or exists (select 1 from public.coaching_goals g where g.id = goal_will_actions.goal_id and g.client_id = auth.uid())
  );

drop policy if exists "goal_will_actions_insert" on public.goal_will_actions;
create policy "goal_will_actions_insert"
  on public.goal_will_actions for insert
  with check (
    not public.is_locked()
    and (
      public.is_admin()
      or exists (select 1 from public.coaching_goals g where g.id = goal_will_actions.goal_id and g.client_id = auth.uid())
    )
  );

drop policy if exists "goal_will_actions_update" on public.goal_will_actions;
create policy "goal_will_actions_update"
  on public.goal_will_actions for update
  using (
    public.is_admin()
    or exists (select 1 from public.coaching_goals g where g.id = goal_will_actions.goal_id and g.client_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.coaching_goals g where g.id = goal_will_actions.goal_id and g.client_id = auth.uid())
  );

drop policy if exists "goal_will_actions_delete" on public.goal_will_actions;
create policy "goal_will_actions_delete"
  on public.goal_will_actions for delete
  using (
    public.is_admin()
    or exists (select 1 from public.coaching_goals g where g.id = goal_will_actions.goal_id and g.client_id = auth.uid() and not public.is_locked())
  );


-- 4) Basis-Zugriffsrechte
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.coaching_content to authenticated;
grant select, insert, update, delete on public.questionnaire_responses to authenticated;
grant select, insert, update, delete on public.coaching_goals to authenticated;
grant select, insert, update, delete on public.goal_options to authenticated;
grant select, insert, update, delete on public.goal_will_actions to authenticated;
