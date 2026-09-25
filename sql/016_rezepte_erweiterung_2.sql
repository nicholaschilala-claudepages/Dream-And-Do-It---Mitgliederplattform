-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 16: 10 weitere Rezepte (gleiche Systematik wie die bestehenden 24),
-- inkl. vollständiger Makros. Setzt sql/012 (Makro-Spalten) voraus.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-015 bereits liefen.
-- ============================================================================

insert into public.recipes (title, description, category, pdf_url, protein_g, carbs_g, fat_g, kcal_per_portion) values
('Falafel-Bowl mit Joghurt-Dip', 'Vegetarische Bowl mit ofengebackener Falafel, 15 Min. · ca. 35 g Eiweiß', null, 'content/rezepte/falafel-bowl-joghurt-dip.pdf', 35, 118, 28, 865),
('Ofenlachs mit Quinoa und Brokkoli', 'Omega-3-reiches Ofengericht mit pflanzlichem Zusatzprotein, 25 Min. · ca. 49 g Eiweiß', null, 'content/rezepte/ofenlachs-quinoa-brokkoli.pdf', 49, 45, 38, 717),
('Putenburger mit Vollkornbrötchen', 'Selbstgemachte, magere Burger-Variante, 20 Min. · ca. 49 g Eiweiß', null, 'content/rezepte/putenburger-vollkornbroetchen.pdf', 49, 36, 19, 517),
('Vollkorn-Pizza mit Hähnchen & Gemüse', 'Selbstgemachte High-Protein-Pizza statt Fertigprodukt, 30 Min. · ca. 70 g Eiweiß', null, 'content/rezepte/vollkorn-pizza-haehnchen-gemuese.pdf', 70, 108, 23, 908),
('Tofu-Süßkartoffel-Pfanne mit Erdnuss-Sauce', 'Vegane Pfanne mit Erdnuss-Sauce, 25 Min. · ca. 40 g Eiweiß', null, 'content/rezepte/tofu-suesskartoffel-erdnuss-sauce.pdf', 40, 55, 27, 613),
('Hähnchen-Kokos-Curry mit Reis', 'Cremiges Curry mit Light-Kokosmilch, 25 Min. · ca. 49 g Eiweiß', null, 'content/rezepte/haehnchen-kokos-curry-reis.pdf', 49, 58, 19, 593),
('Vegetarisches Bohnen-Chili mit Vollkornreis', 'Veganes Chili mit zwei Hülsenfrucht-Proteinquellen, 25 Min. · ca. 39 g Eiweiß', null, 'content/rezepte/bohnen-chili-vollkornreis.pdf', 39, 146, 8, 829),
('Gemüse-Omelett mit Feta & Spinat', 'Kräftiges Omelett mit viel Spinat, 15 Min. · ca. 39 g Eiweiß', null, 'content/rezepte/gemuese-omelett-feta-spinat.pdf', 39, 8, 39, 535),
('Energy Balls mit Datteln & Nüssen', 'Süßer Snack ohne Verarbeitung, ca. 12-14 Kugeln, 10 Min. (kein Kochen) · ca. 29 g Eiweiß', null, 'content/rezepte/energy-balls-datteln-nuesse.pdf', 29, 151, 53, 1162),
('Schoko-Protein-Overnight-Oats', 'Schoko-Variante der Overnight Oats mit Whey Protein, 5 Min. Vorbereitung · ca. 43 g Eiweiß', null, 'content/rezepte/schoko-protein-overnight-oats.pdf', 43, 75, 16, 609);
