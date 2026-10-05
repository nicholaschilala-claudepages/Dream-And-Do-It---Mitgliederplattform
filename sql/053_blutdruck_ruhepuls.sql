-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 20: Blutdruck & Ruhepuls im Präventionscheck
--
-- prevention_test_results.test_key: drei neue Testschlüssel
--   bp_systolic   Blutdruck systolisch (mmHg)
--   bp_diastolic  Blutdruck diastolisch (mmHg)
--                 Beide Werte einer Messung werden in EINER Anfrage mit
--                 identischem Datum/created_at gespeichert (Paarung im Frontend).
--   resting_hr    Ruhepuls (Schläge pro Minute)
-- measured_by unterscheidet bereits 'client' (Selbsttest) und 'trainer'
-- (vom Trainer/Coach gemessen) – keine Schemaänderung nötig.
--
-- Hinweis Sit-and-Reach (sit_reach_cm, aus 052): Der Wert ist ab Runde 20 der
-- Abstand zu den Fußsohlen in cm (0 = Fußsohlen, vor den Fußsohlen negativ,
-- darüber hinaus positiv; Quelle: IAT Leipzig, Testothek). Zuvor eingetragene
-- Werte (Annahme "Fußsohlen = 25 cm") lassen sich bei Bedarf umrechnen:
--   update public.prevention_test_results
--      set value = value - 25
--    where test_key = 'sit_reach_cm' and measured_at < date '2026-10-05';
-- (nur ausführen, falls vor dieser Runde bereits echte Werte erfasst wurden)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-052 bereits liefen.
-- ============================================================================

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
    'sit_reach_cm',
    'bp_systolic', 'bp_diastolic', 'resting_hr'
  ));

comment on column public.prevention_test_results.measured_by is
  'Wer gemessen/eingetragen hat: client (Kunde selbst / Selbsttest) oder trainer (Trainer/Coach).';
