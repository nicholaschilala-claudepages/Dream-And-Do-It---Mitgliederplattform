-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 15: 4 weitere Coaching-Content-PDFs (Habit-Loop, Resilienz/Rückschläge,
-- WOOP/Mental Contrasting, Schlaf & Regeneration) sowie 4 neue validierte
-- Fragebogen-Skalen in js/coaching.js (Stages of Change, WHO-5, PSS-4, BREQ —
-- diese benötigen KEINE eigene SQL-Migration, da sie wie GSE-10 direkt im
-- Frontend definiert sind und über die bereits bestehende Tabelle
-- public.questionnaire_responses gespeichert werden).
--
-- WICHTIG: setzt voraus, dass die 4 neuen PDFs aus content/coaching/ ins
-- Repository hochgeladen wurden (gleiche Ebene wie die bestehenden 3
-- Coaching-Content-PDFs).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-014 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
('Gewohnheiten aufbauen: der Habit-Loop', 'Wie Gewohnheiten neurowissenschaftlich entstehen (Cue-Routine-Reward) und wie du gezielt neue Routinen etablierst.', 'Mentalcoaching', 'content/coaching/gewohnheiten-aufbauen.pdf'),
('Rückschläge & Resilienz', 'Wie du Rückschläge einordnest, mit Growth Mindset und Selbstmitgefühl gestärkt aus ihnen hervorgehst.', 'Mentalcoaching', 'content/coaching/resilienz-und-rueckschlaege.pdf'),
('Zielklarheit mit WOOP', 'Die wissenschaftlich geprüfte Methode Wish-Outcome-Obstacle-Plan, um Wünsche in einen wirksamen Plan zu überführen.', 'Mentalcoaching', 'content/coaching/ziele-mit-woop.pdf'),
('Schlaf & Regeneration', 'Warum Schlaf über Muskelaufbau, Hormonhaushalt und Verletzungsrisiko mitentscheidet, plus konkrete Schlafhygiene-Tipps.', 'Mentalcoaching', 'content/coaching/schlaf-und-regeneration.pdf');
