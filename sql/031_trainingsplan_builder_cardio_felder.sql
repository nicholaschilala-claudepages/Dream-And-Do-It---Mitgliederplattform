-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 31: Trainingsplan-Builder-Überarbeitung – Cardio-spezifische
--            Zielwerte (Geschwindigkeit, Watt, Herzfrequenz % vom Maximum).
--            target_distance_meters existiert bereits (siehe sql/011).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-030 bereits liefen.
-- ============================================================================

alter table public.plan_template_exercises
  add column if not exists target_speed_kmh numeric,
  add column if not exists target_watt numeric,
  add column if not exists target_heart_rate_percent numeric;

alter table public.plan_exercises
  add column if not exists target_speed_kmh numeric,
  add column if not exists target_watt numeric,
  add column if not exists target_heart_rate_percent numeric;

comment on column public.plan_template_exercises.target_speed_kmh is 'Cardio-Zielwert: Geschwindigkeit in km/h (z.B. Laufband, Fahrrad-Ergometer).';
comment on column public.plan_template_exercises.target_watt is 'Cardio-Zielwert: Leistung in Watt (z.B. Fahrrad-Ergometer, Crosstrainer).';
comment on column public.plan_template_exercises.target_heart_rate_percent is 'Cardio-Zielwert: Herzfrequenz in % der individuellen Maximalherzfrequenz.';
comment on column public.plan_exercises.target_speed_kmh is 'Cardio-Zielwert: Geschwindigkeit in km/h (z.B. Laufband, Fahrrad-Ergometer).';
comment on column public.plan_exercises.target_watt is 'Cardio-Zielwert: Leistung in Watt (z.B. Fahrrad-Ergometer, Crosstrainer).';
comment on column public.plan_exercises.target_heart_rate_percent is 'Cardio-Zielwert: Herzfrequenz in % der individuellen Maximalherzfrequenz.';
