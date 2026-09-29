-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 20 weitere Coaching-Content-Themen (Runde 15)
--
-- Vier neue Kategorien, die bislang nicht abgedeckte, für Premium-Coaching-
-- Kunden aber hochrelevante Bereiche erschließen:
--   - "Ernährungspsychologie" (ergänzt die bestehende Ernährungs-/Tracking-
--     Funktion um die psychologische Seite des Essverhaltens)
--   - "Langlebigkeit & gesundes Altern"
--   - "Emotionale Kompetenz"
--   - "Kommunikation & Beziehungen"
--
-- Alle 20 Themen sind gegen Primärquellen geprüft (mehrere Kernaussagen
-- zusätzlich per Websuche verifiziert, u.a. Mandsager 2018 JAMA Network Open,
-- Laukkanen 2015 JAMA Internal Medicine, Jacka/SMILES 2017 BMC Medicine,
-- Leong/PURE 2015 The Lancet, Lieberman 2007 Psychological Science) und
-- folgen exakt demselben visuellen und inhaltlichen Format wie die
-- bisherigen Coaching-Content-PDFs (Navy/Gold/Cinzel-Template, 2
-- Inhaltsseiten, Quellenbox).
--
-- Zugriff auf diese neuen Dokumente folgt automatisch der Opt-in-Logik aus
-- sql/024_dokument_freigabe.sql: KEIN Kunde sieht diese neuen Dokumente
-- automatisch. Der Admin muss sie über die Dokumente-Freigabe in der
-- Betrieb-Ansicht pro Kunde einzeln freischalten.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-037 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
-- Ernährungspsychologie
('Achtsames Essen (Mindful Eating)', 'Warum bewusstes statt automatisches Essen der erste Hebel ist — nach Kristellers MB-EAT und Triboles Intuitive Eating.', 'Ernährungspsychologie', 'content/coaching/achtsames-essen.pdf'),
('Emotionales Essen erkennen und regulieren', 'Warum Essen manchmal ein Gefühl beruhigen soll — und was stattdessen hilft (van Strien, DEBQ).', 'Ernährungspsychologie', 'content/coaching/emotionales-essen.pdf'),
('Zucker, Belohnung & Heißhunger', 'Warum manches Verlangen nichts mit echtem Hunger zu tun hat — hedonischer Hunger nach Lowe & Butryn.', 'Ernährungspsychologie', 'content/coaching/zucker-belohnung-heisshunger.pdf'),
('Die Sättigungs-Formel: Volumen statt Kalorien', 'Warum zwei Mahlzeiten mit gleicher Kalorienzahl unterschiedlich satt machen — Rolls'' Sättigungsindex.', 'Ernährungspsychologie', 'content/coaching/saettigung-volumen-statt-kalorien.pdf'),
('Ernährung & Stimmung: die Darm-Hirn-Achse', 'Was die SMILES-Studie (Jacka 2017) über Essen und psychisches Wohlbefinden zeigt.', 'Ernährungspsychologie', 'content/coaching/ernaehrung-darm-hirn-achse.pdf'),
-- Langlebigkeit & gesundes Altern
('Muskelmasse & Greifkraft als Langlebigkeitsfaktor', 'Was die PURE-Studie über Kraft und Sterblichkeitsrisiko zeigt (Leong et al. 2015, The Lancet).', 'Langlebigkeit & gesundes Altern', 'content/coaching/muskelmasse-langlebigkeit.pdf'),
('VO2max und die Fitness-Alters-Uhr', 'Warum kardiorespiratorische Fitness der stärkste Sterblichkeitsprädiktor ist (Mandsager et al. 2018, JAMA Network Open).', 'Langlebigkeit & gesundes Altern', 'content/coaching/vo2max-fitness-altersuhr.pdf'),
('Zone-2-Training & metabolische Gesundheit', 'Warum niedrige Trainingsintensität ein eigenständiges Ziel ist — nach San-Millán & Brooks.', 'Langlebigkeit & gesundes Altern', 'content/coaching/zone2-training-metabolische-gesundheit.pdf'),
('Hormesis: Kälte, Wärme & kontrollierter Stress', 'Warum eine dosierte Belastung den Körper widerstandsfähiger macht — inkl. der finnischen Sauna-Kohortenstudie.', 'Langlebigkeit & gesundes Altern', 'content/coaching/hormesis-kaelte-waerme.pdf'),
('Inflammaging: chronischer Entzündung vorbeugen', 'Der stille Alterungsprozess nach Franceschi (2000) — und die bereits bekannten Hebel dagegen.', 'Langlebigkeit & gesundes Altern', 'content/coaching/inflammaging-entzuendung-vorbeugen.pdf'),
-- Emotionale Kompetenz
('Gefühle benennen, um sie zu regulieren', '"Name it to tame it" — was Liebermans Affect-Labeling-Forschung neurowissenschaftlich zeigt.', 'Emotionale Kompetenz', 'content/coaching/gefuehle-benennen-affect-labeling.pdf'),
('Psychologische Flexibilität statt Vermeidung', 'Was Acceptance and Commitment Therapy (ACT) nach Hayes über den Umgang mit unangenehmen Gefühlen zeigt.', 'Emotionale Kompetenz', 'content/coaching/psychologische-flexibilitaet-act.pdf'),
('Dankbarkeit als trainierbare Fähigkeit', 'Was die Forschung von Emmons & McCullough über Wohlbefinden zeigt.', 'Emotionale Kompetenz', 'content/coaching/dankbarkeit-trainierbare-faehigkeit.pdf'),
('Optimismus als erlernbarer Stil', 'Was Seligmans Forschung zum Erklärungsstil über Resilienz gegenüber Rückschlägen zeigt.', 'Emotionale Kompetenz', 'content/coaching/optimismus-erlernbarer-stil.pdf'),
('Emotionale Granularität: je präziser, desto stabiler', 'Warum die feine Unterscheidung von Gefühlen die Regulation erleichtert (Kashdan, Barrett & McKnight).', 'Emotionale Kompetenz', 'content/coaching/emotionale-granularitaet.pdf'),
-- Kommunikation & Beziehungen
('Aktives Zuhören als Schlüsselkompetenz', 'Was Rogers & Farson über wirkliches Verstehen zeigten.', 'Kommunikation & Beziehungen', 'content/coaching/aktives-zuhoeren.pdf'),
('Grenzen setzen ohne schlechtes Gewissen', 'Was Assertivitätsforschung (Alberti & Emmons) über klare Kommunikation zeigt.', 'Kommunikation & Beziehungen', 'content/coaching/grenzen-setzen.pdf'),
('Micro-Moments: die Kraft kleiner Gesten', 'Was Gottmans Forschung zu "Bids for Connection" über Beziehungsqualität zeigt.', 'Kommunikation & Beziehungen', 'content/coaching/micro-moments-beziehungen.pdf'),
('Soziales Kapital: die Stärke loser Kontakte', 'Was Granovetters "Strength of Weak Ties" für Karriere und Alltag bedeutet.', 'Kommunikation & Beziehungen', 'content/coaching/soziales-kapital-lose-kontakte.pdf'),
('Gewaltfreie Kommunikation in Konfliktgesprächen', 'Was Rosenbergs Vier-Schritte-Modell (Beobachtung, Gefühl, Bedürfnis, Bitte) im Alltag leisten kann.', 'Kommunikation & Beziehungen', 'content/coaching/gewaltfreie-kommunikation.pdf');
