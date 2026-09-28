-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 19: Neue Kunden starten ohne Reiter-Zugriff (nur Startseite),
-- bis der Admin gezielt freischaltet.
--
-- Hintergrund: Bisher wurden training_enabled/nutrition_enabled/
-- coaching_enabled bei der Registrierung automatisch auf true gesetzt
-- (Default aus sql/020), d.h. jede neue Person hätte sofort vollen Zugriff
-- auf die komplette Content-Bibliothek (Übungen, Rezepte, Coaching-Content).
-- Das öffnet ein Zeitfenster, in dem sich jemand registrieren und an einem
-- einzigen Tag den gesamten Content herunterladen könnte, bevor der Admin
-- überhaupt reagieren kann.
--
-- Ab jetzt: Default = false. Neue Kunden sehen nach der Registrierung nur
-- ihre Startseite (siehe dashboard.html) mit den "auf Anfrage"-Hinweisen zu
-- Training/Ernährung/Coaching; der Admin schaltet jeden Bereich im
-- Trainer-Dashboard (betrieb.html) bewusst frei (siehe sql/020,
-- has_module_access()).
--
-- WICHTIG (bewusste Entscheidung, siehe Rückfrage vom 26.09.2026):
-- Bestehende Kunden/Test-Accounts werden hier NICHT rückwirkend gesperrt.
-- Nur der Default für zukünftige Registrierungen ändert sich – wer heute
-- schon training_enabled/nutrition_enabled/coaching_enabled = true hat,
-- behält diesen Zugriff unverändert. Falls einzelne bestehende Kunden
-- doch gesperrt werden sollen, geschieht das gezielt über die Schalter in
-- betrieb.html, nicht über dieses Skript.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-021 bereits liefen.
-- ============================================================================

alter table public.profiles alter column training_enabled set default false;
alter table public.profiles alter column nutrition_enabled set default false;
alter table public.profiles alter column coaching_enabled set default false;

comment on column public.profiles.training_enabled is 'Ob dieser Kunde den Trainingsbereich (Übungsbibliothek/Pläne) nutzen darf. Von einem Admin gesetzt. Neue Kunden starten mit false (siehe sql/022) und werden bewusst vom Admin freigeschaltet.';
comment on column public.profiles.nutrition_enabled is 'Ob dieser Kunde den Ernährungsbereich (Rezepte/PAL/Protokoll) nutzen darf. Von einem Admin gesetzt. Neue Kunden starten mit false (siehe sql/022) und werden bewusst vom Admin freigeschaltet.';
comment on column public.profiles.coaching_enabled is 'Ob dieser Kunde den Coaching-Bereich (Content/Fragebögen/Ziele) nutzen darf. Von einem Admin gesetzt. Neue Kunden starten mit false (siehe sql/022) und werden bewusst vom Admin freigeschaltet.';
