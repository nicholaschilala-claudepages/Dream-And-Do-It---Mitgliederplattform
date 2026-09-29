-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 16: Cardio-Fitness-Test (Cooper/Rockport → geschätzter VO2max) als
-- weiterer Präventionscheck-Test, plus neues Achievements-/Erfolge-System.
--
-- Der Griffkraft-Test (ursprünglich mit vorgeschlagen) wurde auf Wunsch des
-- Nutzers NICHT umgesetzt, da er kein Messgerät anschaffen möchte und eine
-- seriöse Null-Geräte-Alternative (Dead Hang, Farmer's Carry) laut Recherche
-- keine belastbare Entsprechung zur dynamometrisch gemessenen Griffkraft ist.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-039 bereits liefen.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Cardio-Fitness-Test: neuer test_key in der bestehenden, generischen
-- prevention_test_results-Tabelle (gleiches Muster wie Etappe 14/037 für die
-- drei neuen Beweglichkeitstests) – kein neues Schema nötig. value = der
-- client-seitig berechnete geschätzte VO2max (ml/kg/min); die Rohdaten des
-- gewählten Protokolls (Cooper-Distanz bzw. Rockport-Zeit/Puls/Gewicht)
-- werden zusätzlich als Klartext in notes gespeichert.
-- ---------------------------------------------------------------------------

do $$
declare
  v_constraint_name text;
begin
  select con.conname
    into v_constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'prevention_test_results'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%test_key%';

  if v_constraint_name is not null then
    execute format('alter table public.prevention_test_results drop constraint %I', v_constraint_name);
  end if;
end $$;

alter table public.prevention_test_results
  add constraint prevention_test_results_test_key_check
  check (test_key in (
    'plank', 'pushup', 'squat',
    'shoulder_mobility', 'hamstring_mobility', 'thomas_mobility',
    'sitting_hours', 'sleep_side',
    'nutrition_quality', 'smoking_status', 'alcohol_weekly_drinks',
    'wrist_extension', 'elbow_extension', 'ake_hamstring',
    'cardio_fitness'
  ));

-- ---------------------------------------------------------------------------
-- 2) Achievements/Erfolge – schlanke Zusatztabelle, rein additiv zu bereits
-- vorhandenen Daten (Streak, persönliche Rekorde, Ernährungsprotokoll,
-- Präventionscheck-Vollständigkeit). Wird client-seitig ausgewertet (js/
-- achievements.js), genau wie der Präventions-Score und die Trainings-Streak
-- bereits jetzt ohne Server-Funktionen berechnet werden – hier wird nur das
-- Ergebnis (welcher Erfolg wann freigeschaltet wurde) persistiert, damit
-- Kunde und Trainer denselben Stand sehen und "neu freigeschaltet"-Hinweise
-- nicht bei jedem Laden erneut auftauchen.
-- ---------------------------------------------------------------------------

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (client_id, achievement_key)
);

comment on table public.achievements is 'Freigeschaltete Erfolge/Badges je Kunde (Streak-Meilensteine, persönliche Rekorde, Ernährungsprotokoll-Konsistenz, Präventionscheck-Vollständigkeit u.ä.) – wird client-seitig aus bereits vorhandenen Daten berechnet und hier nur zwecks Persistenz/"neu freigeschaltet"-Erkennung gespeichert.';
comment on column public.achievements.achievement_key is 'Schlüssel aus dem Katalog ACHIEVEMENT_DEFINITIONS in js/achievements.js.';
comment on column public.achievements.meta is 'Optionale Zusatzinfos zum Zeitpunkt des Freischaltens (z.B. erreichter Wert), rein informativ.';

alter table public.achievements enable row level security;

drop policy if exists "achievements_select" on public.achievements;
create policy "achievements_select"
  on public.achievements for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "achievements_insert" on public.achievements;
create policy "achievements_insert"
  on public.achievements for insert
  with check (
    (client_id = auth.uid() and not public.is_locked())
    or public.is_admin()
  );

-- Kein Update-Recht: ein einmal freigeschalteter Erfolg wird nicht nachträglich
-- verändert, nur ggf. gelöscht (z.B. Datenkorrektur durch einen Admin).
drop policy if exists "achievements_delete" on public.achievements;
create policy "achievements_delete"
  on public.achievements for delete
  using (public.is_admin());

grant select, insert, delete on public.achievements to authenticated;
