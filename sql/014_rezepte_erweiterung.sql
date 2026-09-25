-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 14: 12 weitere Rezepte (gleiche Systematik/Teller-Prinzip wie die
-- bestehenden 12), inkl. vollständiger Makros (Eiweiß/Kohlenhydrate/Fett/kcal),
-- berechnet nach denselben Referenzwerten wie die bestehenden Rezepte
-- (siehe nutrient_calc.py-Dokumentation in den PDFs selbst).
--
-- WICHTIG: setzt voraus, dass sql/012 bereits gelaufen ist (protein_g/carbs_g/
-- fat_g/kcal_per_portion-Spalten). Setzt außerdem voraus, dass die 12 neuen
-- PDFs aus content/rezepte/ sowie die aktualisierten 12 bestehenden PDFs ins
-- Repo hochgeladen wurden (Logo-Kontrast-Fix betrifft auch die bestehenden).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-013 bereits liefen.
-- ============================================================================

insert into public.recipes (title, description, category, pdf_url, protein_g, carbs_g, fat_g, kcal_per_portion) values
('Griechischer Hähnchensalat', 'Magerer Salat mit viel Gemüse und Feta, 15 Min. · ca. 54 g Eiweiß', null, 'content/rezepte/griechischer-haehnchensalat.pdf', 54, 9, 26, 481),
('Shakshuka mit Vollkorntoast', 'Pochierte Eier in Tomaten-Paprika-Sauce, 20 Min. · ca. 37 g Eiweiß', null, 'content/rezepte/shakshuka.pdf', 37, 45, 36, 657),
('Thunfisch-Vollkornnudel-Salat', 'Praktischer Nudelsalat zum Vorbereiten für mehrere Tage, 20 Min. · ca. 47 g Eiweiß', null, 'content/rezepte/thunfisch-vollkornnudel-salat.pdf', 47, 80, 15, 648),
('Rinderhack-Gemüsepfanne mit Reis', 'Mageres Rinderhack mit reichlich Gemüse und Vollkornreis, 25 Min. · ca. 42 g Eiweiß', null, 'content/rezepte/rinderhack-gemuesepfanne-reis.pdf', 42, 69, 26, 688),
('Kichererbsen-Bowl mit Hummus', 'Vegetarische Bowl mit pflanzlichem Protein, 20 Min. · ca. 35 g Eiweiß', null, 'content/rezepte/kichererbsen-bowl-hummus.pdf', 35, 82, 32, 759),
('Protein-Pancakes mit Beeren', 'Pancakes aus Haferflocken, Ei und Skyr statt klassischem Mehlteig, 15 Min. · ca. 40 g Eiweiß', null, 'content/rezepte/protein-pancakes-beeren.pdf', 40, 63, 16, 577),
('Tofu-Gemüsepfanne mit Reis', 'Vollständig pflanzliche Pfanne mit Tofu und Vollkornreis, 20 Min. · ca. 42 g Eiweiß', null, 'content/rezepte/tofu-gemuesepfanne-reis.pdf', 42, 71, 28, 697),
('Cottage Cheese mit Ananas & Nüssen', 'Schneller proteinreicher Snack ganz ohne Kochen, 5 Min. · ca. 37 g Eiweiß', null, 'content/rezepte/cottage-cheese-ananas-nuesse.pdf', 37, 33, 21, 464),
('Vollkorntoast mit Ei & Avocado', 'Klassiker mit Ei, Avocado und Vollkorn, 10 Min. · ca. 36 g Eiweiß', null, 'content/rezepte/vollkorntoast-ei-avocado.pdf', 36, 38, 40, 651),
('Linsen-Bolognese mit Vollkornnudeln', 'Vegane Bolognese-Variante mit Linsen statt Hackfleisch, 25 Min. · ca. 38 g Eiweiß', null, 'content/rezepte/linsen-bolognese-vollkornnudeln.pdf', 38, 121, 13, 773),
('Gefrorener Magerquark-Beeren-Crunch', 'Proteinreiche, gefrorene Alternative zu klassischen Süßigkeiten, 10 Min. + Gefrierzeit · ca. 40 g Eiweiß', null, 'content/rezepte/magerquark-beeren-crunch.pdf', 40, 36, 9, 385),
('Reiswaffeln mit Magerquark & Honig', 'Schnelle Kohlenhydrat-Protein-Kombination nach dem Training, 5 Min. · ca. 33 g Eiweiß', null, 'content/rezepte/reiswaffeln-magerquark-honig.pdf', 33, 52, 2, 358);
