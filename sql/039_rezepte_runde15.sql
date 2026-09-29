-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 20 weitere Rezepte (Runde 15), gleiche Systematik wie die bestehenden 34
-- (Dream-And-Do-It-Teller-Prinzip, Eiweiß-Zielkorridor 30-50 g/Portion,
-- dokumentierte Ausnahmen bei Snacks/leichten Gerichten bzw. leicht über der
-- Spanne bei proteinreicheren Hauptgerichten, analog zu bereits bestehenden
-- Ausnahmen wie dem Griechischen Hähnchensalat).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-038 bereits liefen.
-- ============================================================================

insert into public.recipes (title, description, category, pdf_url, protein_g, carbs_g, fat_g, kcal_per_portion) values
('Frühstücks-Burrito mit Rührei & schwarzen Bohnen', '15 Min. · ca. 39 g Eiweiß', null, 'content/rezepte/fruehstuecks-burrito-bohnen.pdf', 39, 60, 34, 698),
('Garnelen-Gemüse-Pfanne mit Vollkornreis', '20 Min. · ca. 45 g Eiweiß', null, 'content/rezepte/garnelen-gemuese-pfanne-reis.pdf', 45, 73, 14, 605),
('Linsen-Dal mit Vollkornreis', '20 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/rote-linsen-dal-reis.pdf', 47, 121, 15, 816),
('Hähnchen-Gemüse-Spieße mit Couscous', '25 Min. · ca. 53 g Eiweiß', null, 'content/rezepte/haehnchenspiesse-couscous.pdf', 53, 59, 17, 616),
('Kabeljau im Ofen mit Kartoffeln & Brokkoli', '30 Min. · ca. 51 g Eiweiß', null, 'content/rezepte/kabeljau-ofen-kartoffeln-brokkoli.pdf', 51, 60, 18, 612),
('Erdnuss-Nudeln mit Hähnchen', '20 Min. · ca. 50 g Eiweiß', null, 'content/rezepte/erdnuss-nudeln-haehnchen.pdf', 50, 64, 21, 654),
('Quinoa-Salat mit Feta & Granatapfelkernen', '20 Min. (kein aktives Kochen) · ca. 29 g Eiweiß', null, 'content/rezepte/quinoa-salat-feta-granatapfel.pdf', 29, 79, 37, 762),
('Gebratener Reis mit Ei & Gemüse', '20 Min. · ca. 34 g Eiweiß', null, 'content/rezepte/gebratener-reis-ei-gemuese.pdf', 34, 86, 31, 757),
('Big Salad mit Hähnchen, Ei & Avocado', '15 Min. (kein Kochen, wenn Hähnchen bereits gegart) · ca. 49 g Eiweiß', null, 'content/rezepte/big-salad-haehnchen-ei-avocado.pdf', 49, 15, 33, 542),
('Gemüse-Frittata mit Ziegenkäse', '25 Min. · ca. 44 g Eiweiß', null, 'content/rezepte/gemuese-frittata-ziegenkaese.pdf', 44, 11, 46, 624),
('Süßkartoffel-Pommes mit Kräuterquark', '30 Min. · ca. 29 g Eiweiß', null, 'content/rezepte/suesskartoffel-pommes-kraeuterquark.pdf', 29, 68, 11, 480),
('Beeren-Smoothie-Bowl mit Chiasamen', '10 Min. · ca. 33 g Eiweiß', null, 'content/rezepte/beeren-smoothie-bowl-chia.pdf', 33, 46, 12, 422),
('Räucherlachs-Vollkornbrot mit Frischkäse & Gurke', '10 Min. (kein Kochen) · ca. 35 g Eiweiß', null, 'content/rezepte/raeucherlachs-vollkornbrot-frischkaese.pdf', 35, 43, 14, 459),
('Putenspieße mit Joghurt-Marinade & Bulgur', '25 Min. (plus Marinierzeit) · ca. 54 g Eiweiß', null, 'content/rezepte/putenspiesse-bulgur.pdf', 54, 63, 14, 580),
('Protein-Waffeln mit Skyr & Beeren', '15 Min. · ca. 50 g Eiweiß', null, 'content/rezepte/protein-waffeln-joghurt-beeren.pdf', 50, 51, 17, 576),
('Gefüllte Paprika mit Rinderhack & Vollkornreis', '40 Min. · ca. 52 g Eiweiß', null, 'content/rezepte/gefuellte-paprika-rinderhack-reis.pdf', 52, 79, 23, 754),
('Linsen-Gemüse-Suppe mit Vollkornbrot', '25 Min. · ca. 38 g Eiweiß', null, 'content/rezepte/linsen-gemuese-suppe-vollkornbrot.pdf', 38, 103, 6, 634),
('Thunfisch-Ofenkartoffel mit Frischkäse-Dip', '45 Min. (überwiegend Ofenzeit) · ca. 48 g Eiweiß', null, 'content/rezepte/thunfisch-ofenkartoffel-frischkaese.pdf', 48, 74, 8, 560),
('Griechischer Bulgur-Salat mit Feta & Oliven', '20 Min. (kein aktives Kochen) · ca. 27 g Eiweiß', null, 'content/rezepte/bulgur-salat-feta-oliven.pdf', 27, 81, 38, 752),
('Kichererbsen-Curry mit Spinat', '20 Min. · ca. 35 g Eiweiß', null, 'content/rezepte/kichererbsen-curry-spinat.pdf', 35, 133, 16, 814);
