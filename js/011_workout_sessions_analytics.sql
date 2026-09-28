-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 11: Trainingseinheiten (Sessions), Distanz-Tracking, Bewegte-Kilos-
--            Auswertung & Dysbalance-Erkennung
--
-- Hintergrund (Nutzer-Feedback vom 26.09.2026):
--   - Kunden sollen Sätze/Wdh./Gewicht/Distanz beim Tracken frei manuell
--     eingeben können, so wie es an dem Tag tatsächlich war.
--   - Die App soll insgesamt bewegte Kilos je Übung und je Workout
--     dokumentieren sowie Steigerungen über die Zeit grafisch mit
--     Filteroptionen darstellen (Kunde + Trainer-Einsicht).
--   - Trainer soll erkennen können, ob Dysbalancen (z.B. Vorder-/Rückseite
--     nicht im adäquaten Verhältnis trainiert) gefördert werden.
--
-- Entscheidung (26.09.2026): Eine "Trainingseinheit" wird explizit gestartet
-- und beendet (nicht aus dem Kalendertag abgeleitet) – das ergibt eine exakte
-- Einheiten-Zählung und eine saubere Grundlage für die Kilos-je-Workout-
-- Auswertung.
-- Entscheidung (26.09.2026): Dysbalance-Schema = Push/Pull (Oberkörper) +
-- vordere/hintere Beinkette + Rumpf vorne/hinten, abgeleitet aus den
-- vorhandenen 44 Übungen (siehe Zuordnung unten, zur Kontrolle).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-010 bereits liefen.
-- ============================================================================

-- 1) Trainingseinheiten (Workout-Sessions, expliziter Start/Ende)
-- ----------------------------------------------------------------------------
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.training_plans(id),
  plan_day_id uuid references public.training_plan_days(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.training_sessions is 'Vom Kunden explizit gestartete/beendete Trainingseinheiten – Grundlage für Einheiten-Zählung und bewegte Kilos je Workout.';

alter table public.training_sessions enable row level security;

drop policy if exists "training_sessions_select" on public.training_sessions;
create policy "training_sessions_select"
  on public.training_sessions for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "training_sessions_insert" on public.training_sessions;
create policy "training_sessions_insert"
  on public.training_sessions for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "training_sessions_update" on public.training_sessions;
create policy "training_sessions_update"
  on public.training_sessions for update
  using (client_id = auth.uid() and not public.is_locked())
  with check (client_id = auth.uid());

drop policy if exists "training_sessions_delete" on public.training_sessions;
create policy "training_sessions_delete"
  on public.training_sessions for delete
  using (client_id = auth.uid() and not public.is_locked());

grant select, insert, update, delete on public.training_sessions to authenticated;


-- 2) training_logs: Zuordnung zur Trainingseinheit + Distanz (Ist)
-- ----------------------------------------------------------------------------
alter table public.training_logs
  add column if not exists session_id uuid references public.training_sessions(id) on delete set null;

alter table public.training_logs
  add column if not exists distance_meters numeric;

comment on column public.training_logs.session_id is
  'Die Trainingseinheit, zu der dieser Satz gehört (siehe training_sessions). NULL bei älteren Einträgen vor Einführung der Sessions.';
comment on column public.training_logs.distance_meters is
  'Tatsächlich zurückgelegte Distanz in Metern, z.B. bei Ruder-Intervallen.';


-- 3) plan_exercises / plan_template_exercises: Soll-Distanz
-- ----------------------------------------------------------------------------
alter table public.plan_exercises
  add column if not exists target_distance_meters numeric;

alter table public.plan_template_exercises
  add column if not exists target_distance_meters numeric;


-- 4) exercises: Bewegungsmuster-Klassifikation für die Dysbalance-Erkennung
-- ----------------------------------------------------------------------------
alter table public.exercises add column if not exists movement_pattern text;

comment on column public.exercises.movement_pattern is
  'Für die Dysbalance-Auswertung: push_oberkoerper, pull_oberkoerper, vordere_beinkette, hintere_beinkette, rumpf_vorne, rumpf_hinten oder sonstige (nicht eindeutig zuordenbar, z.B. Ganzkörper-Cardio).';

update public.exercises set movement_pattern = 'sonstige' where name = 'Armkreisen mit Ausfallschritt & Rotation';
update public.exercises set movement_pattern = 'sonstige' where name = 'Hüftkreisen & Beinpendel';
update public.exercises set movement_pattern = 'sonstige' where name = 'Katze-Kuh-Mobilisation';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Hip Bridge';
update public.exercises set movement_pattern = 'rumpf_hinten' where name = 'Bird Dog';
update public.exercises set movement_pattern = 'sonstige' where name = 'Skipping & Kniehebelauf';
update public.exercises set movement_pattern = 'sonstige' where name = 'Jumping Jacks';

update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'BWS-Rotation mit Medizinball';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Ausfallschritt mit explosivem Ausstoßen';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Standwaage auf instabiler Unterlage';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Kreuzheben';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'Aufrechtes Rudern (Langhantel)';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Seitliches Gleiten im Ausfallschritt';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'Latzug frontal';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Seitstütz mit Hüftbeuger-Anzug';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Wirbelsäulen-Rotation am Seilzug';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Seitlicher Ausfallschritt (stehend)';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Kniebeuge (Langhantel)';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'BWS-Extension mit Ruderzug (instabil)';
update public.exercises set movement_pattern = 'push_oberkoerper' where name = 'Schulterdrücken (Langhantel, stehend)';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Bulgarian Split Squat (Langhantel)';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Unterarmstütz (Plank)';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Unterarmstütz auf dem Gymnastikball';
update public.exercises set movement_pattern = 'push_oberkoerper' where name = 'Bankdrücken (Flachbank)';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Beckenlift mit Beinbeuge am Ball';
update public.exercises set movement_pattern = 'push_oberkoerper' where name = 'Schrägbankdrücken';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'Vorgebeugtes Rudern (Langhantel)';
update public.exercises set movement_pattern = 'push_oberkoerper' where name = 'Trizepsstrecken am Seil (über Kopf)';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'Bizepscurls (Langhantel)';

update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Bulgarian Split Squat (Bodyweight)';
update public.exercises set movement_pattern = 'push_oberkoerper' where name = 'Liegestütz-Varianten';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Good Mornings (Bodyweight)';
update public.exercises set movement_pattern = 'rumpf_hinten' where name = 'Superman';
update public.exercises set movement_pattern = 'sonstige' where name = 'Schulterkreisen mit Wasserflaschen';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Plyo-Ausfallschritte';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Unterarmstütz-Varianten auf dem Ball';
update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Standwaage (ohne Zusatzgerät)';
update public.exercises set movement_pattern = 'sonstige' where name = 'HIIT-Zirkel (freie Übungsauswahl)';

update public.exercises set movement_pattern = 'hintere_beinkette' where name = 'Kettlebell Swings';
update public.exercises set movement_pattern = 'vordere_beinkette' where name = 'Step-Ups';
update public.exercises set movement_pattern = 'pull_oberkoerper' where name = 'Ruder-Intervalle';
update public.exercises set movement_pattern = 'sonstige' where name = 'Battle Ropes';
update public.exercises set movement_pattern = 'rumpf_vorne' where name = 'Mountain Climbers';
update public.exercises set movement_pattern = 'sonstige' where name = 'Burpees';
