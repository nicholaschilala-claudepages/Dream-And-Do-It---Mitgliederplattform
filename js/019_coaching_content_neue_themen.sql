-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 16: 4 weitere Coaching-Content-PDFs (Zielsetzungstheorie,
-- Achtsamkeit & Stressregulation, Mindset & Erwartungseffekt, Soziale
-- Unterstützung & Accountability).
--
-- WICHTIG: setzt sql/018 voraus (image_url-Spalte bei coaching_content).
-- image_url bleibt hier zunächst null — Bilder werden nachträglich über die
-- Admin-Oberfläche ergänzt (siehe Bildbedarfs-Liste).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-018 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
('Zielsetzungstheorie (SMART-Ziele)', 'Locke & Lathams fünf Prinzipien wirksamer Ziele — warum konkrete, herausfordernde Ziele mehr bewirken als "gib dein Bestes".', 'Mentalcoaching', 'content/coaching/zielsetzungstheorie.pdf'),
('Achtsamkeit & Stressregulation', 'MBSR nach Kabat-Zinn sowie eine wissenschaftlich geprüfte Atemtechnik zur akuten Stressregulation.', 'Mentalcoaching', 'content/coaching/achtsamkeit-und-stressregulation.pdf'),
('Mindset & Erwartungseffekt', 'Crum & Langers Forschung zum Mind-Body-Effekt — wie deine Erwartungshaltung dein Trainingsergebnis mitbestimmt.', 'Mentalcoaching', 'content/coaching/mindset-und-erwartungseffekt.pdf'),
('Soziale Unterstützung & Accountability', 'Warum soziale Einbindung und regelmäßige Rechenschaft die Trainings-Adhärenz deutlich erhöhen.', 'Mentalcoaching', 'content/coaching/soziale-unterstuetzung-accountability.pdf');
