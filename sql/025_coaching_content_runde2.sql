-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 5 weitere Coaching-Content-Themen (Nutzer-Feedback nach Etappe 19)
--
-- 1 Thema war ausdrücklich vom Kunden vorgegeben (Sitzen & Seitenschlafen —
-- Risiken für Muskeln/Skelett, "Sitting is the new smoking"), die anderen 4
-- wurden ergänzt: alle wissenschaftlich fundiert und bislang nicht durch
-- bestehende Coaching-Content-Themen abgedeckt.
--
-- Zwei Kategorien: "Mentalcoaching" (wie bisher) für die psychologischen
-- Themen, neu "Gesundheit & Bewegung" für die eher körperlich/physiologisch
-- ausgerichteten Themen (Sitzen/Seitenschlafen, Stress & Cortisol). Die
-- Kategorie ist reines Anzeige-Label (siehe coaching_content.category) und
-- beeinflusst keine Zugriffslogik.
--
-- Zugriff auf diese neuen Dokumente folgt automatisch der Opt-in-Logik aus
-- sql/024_dokument_freigabe.sql: KEIN Kunde — auch kein "grandfathered"
-- Bestandskunde mit voller Freigabe zum Zeitpunkt von 024 — sieht diese neuen
-- Dokumente automatisch. Der Admin muss sie über die Dokumente-Freigabe in
-- der Betrieb-Ansicht pro Kunde einzeln freischalten.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-024 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
('Sitzen & Seitenschlafen', 'Warum langes Sitzen und einseitiger Seitenschlaf Muskeln und Skelett belasten — und was wissenschaftlich nachweislich hilft.', 'Gesundheit & Bewegung', 'content/coaching/sitzen-und-seitenschlafen.pdf'),
('Willenskraft: Kopfsache?', 'Begrenzte Ressource oder Frage der eigenen Einstellung — was Ego-Depletion-Forschung und ihre Kritik zeigen.', 'Mentalcoaching', 'content/coaching/willenskraft-kopfsache.pdf'),
('Bewegung als Antidepressivum', 'Warum Training in Studien nachweislich stimmungsaufhellend wirkt — teils auf Augenhöhe mit Medikamenten.', 'Mentalcoaching', 'content/coaching/bewegung-als-antidepressivum.pdf'),
('Stress, Cortisol & Bauchfett', 'Wie chronischer Stress über das Hormon Cortisol Körperfettverteilung und Essverhalten beeinflusst.', 'Gesundheit & Bewegung', 'content/coaching/stress-cortisol-bauchfett.pdf'),
('Perfektionismus & Selbstmitgefühl', 'Warum hohe Ansprüche allein oft zum Trainingsabbruch führen — und wie Selbstmitgefühl nachweislich mehr trägt.', 'Mentalcoaching', 'content/coaching/perfektionismus-und-selbstmitgefuehl.pdf');
