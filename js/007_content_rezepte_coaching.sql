-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 6: Erstbefüllung Rezepte & Coaching-Content
--
-- WICHTIG: Die pdf_url-Werte gehen davon aus, dass die PDFs aus dem Ordner
-- "content/rezepte/" bzw. "content/coaching/" in dein GitHub-Repository
-- hochgeladen wurden (gleiche Ebene wie dashboard.html) und damit über
-- GitHub Pages unter genau diesem relativen Pfad erreichbar sind.
--
-- Falls du die Dateien an einer anderen Stelle im Repo ablegst, bitte die
-- pdf_url-Werte unten entsprechend anpassen, bevor du das Skript ausführst.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-006 bereits liefen und die
-- PDF-Dateien im Repository liegen.
-- ============================================================================

-- 1) Rezepte
-- ----------------------------------------------------------------------------
-- HINWEIS: category ist bewusst NULL — die Rezepte sind nicht mehr nach
-- Frühstück/Mittag/Abend/Pre-/Post-Training vorsortiert, der Kunde wählt
-- frei. Jedes Rezept-PDF enthält jetzt Gramm- und Kalorienangaben je Zutat
-- sowie die Eiweißmenge pro Portion (Richtwert 30-50 g, mit einer bewusst
-- ausgewiesenen Ausnahme beim kleinen Pre-Training-Snack).
insert into public.recipes (title, description, category, pdf_url) values
('Overnight Oats mit Beeren', 'Proteinreiches Gericht zum Vorbereiten am Vorabend, 5 Min. · ca. 40 g Eiweiß', null, 'content/rezepte/overnight-oats-beeren.pdf'),
('Rührei mit Vollkorntoast', 'Klassiker mit Ei, Gemüse und Vollkorn, 10 Min. · ca. 35 g Eiweiß', null, 'content/rezepte/ruehrei-vollkorntoast.pdf'),
('Skyr-Bowl mit Obst & Nüssen', 'Schnelle Bowl ganz ohne Kochen, 5 Min. · ca. 42 g Eiweiß', null, 'content/rezepte/skyr-bowl-obst-nuesse.pdf'),
('Hähnchen-Reis-Bowl', 'Klassischer Dream-And-Do-It-Teller zum Vorkochen, 20 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/haehnchen-reis-bowl.pdf'),
('Vollkornwrap mit Pute', 'Kompakter, reisetauglicher Wrap für unterwegs, 10 Min. · ca. 38 g Eiweiß', null, 'content/rezepte/vollkornwrap-pute.pdf'),
('Linsen-Quinoa-Salat', 'Vegetarischer Salat mit pflanzlichem Protein, meal-prep-geeignet, 15 Min. · ca. 37 g Eiweiß', null, 'content/rezepte/linsen-quinoa-salat.pdf'),
('Lachs mit Ofengemüse', 'Omega-3-reiches Gericht, der Ofen macht die Arbeit, 25 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/lachs-ofengemuese.pdf'),
('Putengeschnetzeltes & Nudeln', 'Ausgewogenes Gericht mit magerem Protein, 20 Min. · ca. 48 g Eiweiß', null, 'content/rezepte/putengeschnetzeltes-nudeln.pdf'),
('Gefüllte Süßkartoffel', 'Praktische Resteverwertung als Ofengericht, 30-40 Min. · ca. 43 g Eiweiß', null, 'content/rezepte/gefuellte-suesskartoffel.pdf'),
('Banane mit Erdnussbutter', 'Schnelle Energie kurz vor dem Training, 2 Min. (bewusst leichter Snack)', null, 'content/rezepte/banane-erdnussbutter.pdf'),
('Proteinshake mit Haferflocken', 'Schnelles Protein & Kohlenhydrate direkt nach dem Training, 3 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/proteinshake-haferflocken.pdf'),
('Magerquark mit Honig', 'Langsamer verdauliches Protein zur Regeneration, 5 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/magerquark-honig.pdf');

-- 2) Coaching-Content
-- ----------------------------------------------------------------------------
insert into public.coaching_content (title, description, category, pdf_url) values
('Der innere Dialog: Selbstgespräche & Vorbilder', 'Wie du deine Selbstgespräche gezielt nutzt, plus vier historische Geschichten, die Mut machen.', 'Mentalcoaching', 'content/coaching/selbstgespraeche-und-vorbilder.pdf'),
('Musik, BPM & Flow', 'Erregung gezielt über Musik steuern und die Bedingungen für den Flow-Zustand verstehen.', 'Mentalcoaching', 'content/coaching/musik-bpm-und-flow.pdf'),
('Selbstwirksamkeit verstehen und stärken', 'Was Selbstwirksamkeit ist, wie sie sich gezielt aufbauen lässt, plus Atemübung gegen akute Überforderung.', 'Mentalcoaching', 'content/coaching/selbstwirksamkeit-verstehen-und-staerken.pdf');
