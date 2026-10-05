-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 19: Testüberarbeitung Präventionscheck + zentrale Geschlechtsangabe
--
-- 1) profiles.sex ('male' | 'female', NULL = nicht angegeben)
--    Einmalig auf der Startseite gepflegt; Training (Präventionscheck,
--    Benchmarks) und Ernährung (PAL-/Körperfett-Rechner) lesen den Wert
--    nur noch von dort. Bewusst keine Option "divers": für geschlechts-
--    spezifische Vergleichswerte existieren keine belastbaren Normdaten
--    (siehe Erklärtext auf der Startseite). Ohne Angabe werden
--    geschlechtsabhängige Einstufungen ausgeblendet und ein Hinweis gezeigt.
--    Kein automatisches Befüllen aus body_measurements.sex.
--
-- 2) prevention_test_results.test_key: fünf neue Testschlüssel
--      chair_pickup   Chair-Pick-up-Test (Ellbogen), seitengetrennt, -1/0/+1
--      phalen_test    Phalen-Test (Handgelenk), seitengetrennt, -1/0/+1
--      heel_raise     Einbeiniges Fersenheben (Fußgelenk/Waden), seitengetrennt,
--                     Wiederholungen
--      wall_angel     Seated Wall Angel (Oberer Rücken), seitengetrennt, 0-3 Punkte
--      sit_reach_cm   Sit-and-Reach in cm (Beinrückseite, ein Wert für beide Seiten);
--                     eigener Schlüssel, damit die alten Bewertungen (-1/0/+1) unter
--                     hamstring_mobility nicht mit cm-Werten vermischt werden
--    Die alten Schlüssel (wrist_extension, elbow_extension, ake_hamstring …)
--    bleiben erlaubt, damit vorhandene Messwerte erhalten bleiben.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-051 bereits liefen.
-- ============================================================================

alter table public.profiles
  add column if not exists sex text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_sex_check' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_sex_check check (sex is null or sex in ('male', 'female'));
  end if;
end $$;

comment on column public.profiles.sex is
  'Biologisches Geschlecht für geschlechtsspezifische Vergleichswerte (male/female). NULL = nicht angegeben. Einmalig vom Kunden auf der Startseite gepflegt; gelesen von training.html und nutrition.html.';

-- test_key-Constraint dynamisch ersetzen (Muster aus sql/037)
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
    'cardio_fitness',
    'chair_pickup', 'phalen_test', 'heel_raise', 'wall_angel',
    'sit_reach_cm'
  ));

comment on column public.prevention_test_results.side is
  'Nur bei Tests mit Seitenbezug gesetzt (shoulder_mobility, thomas_mobility, chair_pickup, phalen_test, heel_raise, wall_angel sowie die älteren wrist_extension, elbow_extension, ake_hamstring): left/right, oder both falls beidseitig identisch erfasst.';
