-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 14 (Nachtrag): drei neue, vom Nutzer abgesegnete Beweglichkeitstests
-- ("Beide anpassen (empfohlen)" – wandgestützter AKE-Test + Spiegel-/Handyfoto-
-- Hinweis beim bestehenden Thomas-Test):
--
--   wrist_extension   Handgelenk-Streck-Test (Wandtest), seitengetrennt
--   elbow_extension   Ellbogen-Streckungs-Test, seitengetrennt
--   ake_hamstring     Beinrückseite je Seite, wandgestützter Active-Knee-
--                     Extension-Test (ergänzt den bestehenden bilateralen
--                     hamstring_mobility-Test, ersetzt ihn nicht)
--
-- Alle drei sind so gestaltet, dass sie ohne Hilfsperson durchführbar sind
-- (Wand-/Türrahmen-Fixierung statt jemandem, der das Bein hält; Spiegel-/
-- Handyfoto-Hinweis, wo man die eigene Position sonst schlecht sieht).
--
-- Diese Migration erweitert nur den bestehenden CHECK-Constraint auf
-- prevention_test_results.test_key (aus Etappe 29) um die drei neuen
-- Testschlüssel – Tabelle, Policies und übrige Struktur bleiben unverändert.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-036 bereits liefen.
-- ============================================================================

-- Der ursprüngliche CHECK wurde inline in der CREATE TABLE-Anweisung von
-- Etappe 29 definiert, ohne expliziten Namen – Postgres vergibt dafür
-- automatisch den Namen "<tabelle>_<spalte>_check". Um nicht von dieser
-- Namenskonvention abhängig zu sein, wird der Constraint hier dynamisch über
-- den Systemkatalog gesucht und ersetzt.

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
    'wrist_extension', 'elbow_extension', 'ake_hamstring'
  ));

comment on column public.prevention_test_results.side is 'Nur bei Tests mit Seitenbezug gesetzt (shoulder_mobility, thomas_mobility, wrist_extension, elbow_extension, ake_hamstring): left/right, oder both falls beidseitig identisch erfasst.';
