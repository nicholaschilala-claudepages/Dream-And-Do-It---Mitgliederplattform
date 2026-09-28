-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 29: Präventionscheck – Geburtsdatum, Fitness-/Beweglichkeitstests,
--            Lebensstil-Selbstauskünfte (Sitzzeit, Schlafseite)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-028 bereits liefen.
-- ============================================================================

-- 1) Geburtsdatum für die Altersbestimmung im Präventionscheck
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists birth_date date;
comment on column public.profiles.birth_date is 'Geburtsdatum des Kunden – Grundlage für die Altersbestimmung im Präventionscheck (Auswahl der altersspezifischen Benchmark-Tabellen).';


-- 2) Präventionscheck: Test- und Lebensstil-Ergebnisse
-- ----------------------------------------------------------------------------
-- Eine flexible Tabelle für alle Einzeltests des Präventionschecks (statt einer
-- Tabelle je Testart), da Struktur und Auswertung (Wert + wer gemessen hat +
-- wann) für alle Tests identisch sind. test_key unterscheidet die Testart,
-- side wird nur bei Tests gebraucht, die je Körperseite erhoben werden
-- (Schulter-Nacken-/Rückgriff-Test, Thomas-Test/Iliopsoas – siehe Athletik-
-- konzept: "Schulter und Iliopsoas beide Seiten nacheinander testen").
--
-- Bedeutung von "value" je test_key:
--   plank                 Sekunden bis Formverlust (Zeit)
--   pushup / squat        maximale saubere Wiederholungen ohne Pause
--   shoulder_mobility     Bewertung -1 (schlecht) / 0 (normal) / 1 (gut)
--   hamstring_mobility    Bewertung -1 / 0 / 1 (kein Seitenbezug, bilateral)
--   thomas_mobility       Bewertung -1 / 0 / 1 (Iliopsoas-Verkürzung je Seite)
--   sitting_hours         durchschnittliche Sitzstunden pro Tag (Selbstauskunft)
--   sleep_side            überwiegende Schlafseite: -1 links / 0 wechselnd-Rücken / 1 rechts
--   nutrition_quality     Ernährungsqualitäts-Score 0-100 aus 5-Fragen-Kurzselbsteinschätzung
--                         (Obst/Gemüse, Vollkorn, verarbeitete Lebensmittel, Zucker, Wasser)
--   smoking_status        Raucherstatus-Kategorie: 0 nie geraucht / 1 Ex-Raucher >12 Monate
--                         rauchfrei / 2 Ex-Raucher <12 Monate rauchfrei / 3 gelegentlich bzw.
--                         <10 Zigaretten/Tag / 4 regelmäßig ≥10 Zigaretten/Tag
--   alcohol_weekly_drinks Alkoholkonsum in Standarddrinks pro Woche (Selbstauskunft)
create table if not exists public.prevention_test_results (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  test_key text not null check (test_key in (
    'plank', 'pushup', 'squat',
    'shoulder_mobility', 'hamstring_mobility', 'thomas_mobility',
    'sitting_hours', 'sleep_side',
    'nutrition_quality', 'smoking_status', 'alcohol_weekly_drinks'
  )),
  side text check (side in ('left', 'right', 'both')),
  value numeric not null,
  measured_by text not null default 'client' check (measured_by in ('client', 'trainer')),
  measured_at date not null default current_date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.prevention_test_results is 'Präventionscheck: Einzelergebnisse der Kraftausdauer-/Beweglichkeitstests sowie Lebensstil-Selbstauskünfte (Sitzzeit, Schlafseite) je Kunde, Grundlage für den Präventions-Score und die Dysbalance-/Risikoübersicht.';
comment on column public.prevention_test_results.side is 'Nur bei Tests mit Seitenbezug gesetzt (shoulder_mobility, thomas_mobility): left/right, oder both falls beidseitig identisch erfasst.';
comment on column public.prevention_test_results.measured_by is 'Wer den Test durchgeführt/eingetragen hat: client (Kunde selbst) oder trainer.';

alter table public.prevention_test_results enable row level security;

drop policy if exists "prevention_test_results_select" on public.prevention_test_results;
create policy "prevention_test_results_select"
  on public.prevention_test_results for select
  using (client_id = auth.uid() or public.is_admin());

-- Hinweis: measured_by ist bewusst NICHT an auth.uid()/is_admin() gekoppelt –
-- wer den Test technisch einträgt (Kunde oder Trainer-Account) muss nicht
-- identisch sein mit wer ihn durchgeführt hat (z.B. Trainer misst während
-- einer Coaching-Session, Kunde trägt es später selbst in der App nach).
-- Gleiches Muster wie bei body_measurements.measured_by (Etappe 12).
drop policy if exists "prevention_test_results_insert" on public.prevention_test_results;
create policy "prevention_test_results_insert"
  on public.prevention_test_results for insert
  with check (
    (client_id = auth.uid() and not public.is_locked())
    or public.is_admin()
  );

drop policy if exists "prevention_test_results_update" on public.prevention_test_results;
create policy "prevention_test_results_update"
  on public.prevention_test_results for update
  using (client_id = auth.uid() or public.is_admin())
  with check (client_id = auth.uid() or public.is_admin());

drop policy if exists "prevention_test_results_delete" on public.prevention_test_results;
create policy "prevention_test_results_delete"
  on public.prevention_test_results for delete
  using ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

grant select, insert, update, delete on public.prevention_test_results to authenticated;
