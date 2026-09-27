-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 22 weitere Coaching-Content-Themen (Nutzer-Feedback-Runde 3)
--
-- Fünf neue Themenfelder, abgestimmt mit dem Kunden per Rückfragen:
-- Selbstorganisation, Persönlichkeitsentwicklung, Leadership (universell für
-- die App, nicht nur B2B-Führungskräfte), Atomic Habits (Gewohnheitsaufbau
-- nach James Clear) und Konsum (digitaler Konsum, Social Media, Nachrichten,
-- Materialismus). Zusätzlich 2 Themen aus der Ideenbox, die der Kunde
-- ausdrücklich wieder aufgenommen haben wollte (Einsamkeit, Naturkontakt) —
-- Kategorie "Gesundheit & Bewegung".
--
-- Alle 22 Themen sind wissenschaftlich sauber belegt (Primärquellen bzw.
-- Metaanalysen in den jeweiligen PDFs) und folgen exakt demselben visuellen
-- und inhaltlichen Format wie die bisherigen Coaching-Content-PDFs
-- (Navy/Gold/Cinzel-Template, 2 Inhaltsseiten, Quellenbox).
--
-- Neue Kategorien: "Selbstorganisation", "Persönlichkeitsentwicklung",
-- "Leadership", "Atomic Habits", "Konsum" — reine Anzeige-Labels
-- (coaching_content.category), keine Auswirkung auf Zugriffslogik.
--
-- Zugriff auf diese neuen Dokumente folgt automatisch der Opt-in-Logik aus
-- sql/024_dokument_freigabe.sql: KEIN Kunde sieht diese neuen Dokumente
-- automatisch. Der Admin muss sie über die Dokumente-Freigabe in der
-- Betrieb-Ansicht pro Kunde einzeln freischalten.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-027 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
-- Selbstorganisation
('Eisenhower-Prinzip', 'Warum Dringendes das Wichtige verdrängt — und wie die Vier-Quadranten-Matrix bei der Priorisierung hilft.', 'Selbstorganisation', 'content/coaching/eisenhower-prinzip.pdf'),
('Termine mit dir selbst', 'Warum wichtige Vorhaben wie Training oder Atemübungen als feste Kalendertermine deutlich zuverlässiger umgesetzt werden.', 'Selbstorganisation', 'content/coaching/termine-mit-dir-selbst.pdf'),
('Deep Work & Fokus-Blöcke', 'Wie ungestörte Fokuszeit entsteht — und warum ständiges Umschalten zwischen Aufgaben mehr kostet, als es scheint.', 'Selbstorganisation', 'content/coaching/deep-work-fokus-bloecke.pdf'),
('Chronotyp & Leistungskurve', 'Warum die eigene innere Uhr bestimmt, wann Training und Fokusarbeit am leichtesten fallen.', 'Selbstorganisation', 'content/coaching/chronotyp-leistungskurve.pdf'),
-- Persönlichkeitsentwicklung
('Werteklärung als Kompass', 'Was dich wirklich antreibt — und warum Werte anders wirken als klassische Ziele.', 'Persönlichkeitsentwicklung', 'content/coaching/werteklaerung-als-kompass.pdf'),
('Innerer Kritiker vs. innerer Coach', 'Wie die Art deines Selbstgesprächs deine Leistung unter Druck tatsächlich beeinflusst.', 'Persönlichkeitsentwicklung', 'content/coaching/innerer-kritiker-vs-coach.pdf'),
('Kognitive Verzerrungen', 'Wie du typische Denkfehler erkennst und bewusster entscheidest — von Kahnemans System 1 & 2.', 'Persönlichkeitsentwicklung', 'content/coaching/kognitive-verzerrungen.pdf'),
('Sinn & Bedeutung', 'Was die Forschung wirklich zeigt — jenseits des populären Ikigai-Mythos.', 'Persönlichkeitsentwicklung', 'content/coaching/sinn-und-bedeutung.pdf'),
-- Leadership (self & others, universell für die App)
('Self-Leadership', 'Führung beginnt bei dir selbst — drei Strategien aus der Forschung von Manz & Neck.', 'Leadership', 'content/coaching/self-leadership.pdf'),
('Situatives Führen', 'Warum ein Führungsstil nicht auf jede Person und Aufgabe passt.', 'Leadership', 'content/coaching/situatives-fuehren.pdf'),
('Psychologische Sicherheit im Team', 'Warum der stärkste Erfolgsfaktor von Teams oft übersehen wird — nach Amy Edmondson und Googles "Project Aristotle".', 'Leadership', 'content/coaching/psychologische-sicherheit-im-team.pdf'),
('Feedback geben und nehmen', 'Wie ehrliche und wohlwollende Rückmeldung gleichzeitig gelingt — Radical Candor nach Kim Scott.', 'Leadership', 'content/coaching/feedback-geben-und-nehmen.pdf'),
-- Atomic Habits
('Die vier Gesetze des Verhaltenswandels', 'Wie Gewohnheiten entstehen — und sich mit den vier Gesetzen aus Atomic Habits gezielt verändern lassen.', 'Atomic Habits', 'content/coaching/vier-gesetze-verhaltenswandel.pdf'),
('Identitätsbasierte Gewohnheiten', 'Werde die Person, die die gewünschte Gewohnheit bereits lebt.', 'Atomic Habits', 'content/coaching/identitaetsbasierte-gewohnheiten.pdf'),
('Habit Stacking & Umgebungsgestaltung', 'Wie Ankerpunkte und eine klug gestaltete Umgebung Willenskraft überflüssig machen.', 'Atomic Habits', 'content/coaching/habit-stacking-umgebungsgestaltung.pdf'),
('Das Tal der Enttäuschung', 'Warum Fortschritt zunächst unsichtbar bleibt — und wie lange Gewohnheitsbildung wirklich dauert.', 'Atomic Habits', 'content/coaching/tal-der-enttaeuschung.pdf'),
-- Konsum
('Digitaler Konsum & Dopamin-Regulation', 'Wie ständige digitale Reize das Belohnungssystem aus der Balance bringen — nach Anna Lembkes "Dopamine Nation".', 'Konsum', 'content/coaching/digitaler-konsum-dopamin.pdf'),
('Social Media & der Vergleich mit anderen', 'Warum ständiger Aufwärtsvergleich der mentalen Gesundheit schadet.', 'Konsum', 'content/coaching/social-comparison-mentale-gesundheit.pdf'),
('Informationsflut & Nachrichten-Diät', 'Wie bewusste Auswahl statt Dauerverfügbarkeit den Kopf entlastet.', 'Konsum', 'content/coaching/informationsflut-nachrichten-diaet.pdf'),
('Materialismus vs. Wohlbefinden', 'Was Konsum wirklich zur Lebenszufriedenheit beiträgt — und was nicht.', 'Konsum', 'content/coaching/materialismus-vs-wohlbefinden.pdf'),
-- Gesundheit & Bewegung (aus der Ideenbox, auf Kundenwunsch wieder aufgenommen)
('Einsamkeit als Gesundheitsrisiko', 'Warum soziale Verbindung ein unterschätzter Gesundheitsfaktor ist — nach Holt-Lunstads Metaanalysen.', 'Gesundheit & Bewegung', 'content/coaching/einsamkeit-als-gesundheitsrisiko.pdf'),
('Naturkontakt & mentale Erholung', 'Wie schon kleine Naturdosen Kopf und Nervensystem regenerieren.', 'Gesundheit & Bewegung', 'content/coaching/naturkontakt-mentale-erholung.pdf');
