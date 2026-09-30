-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 44: Filter-Clusterung für die Rezeptbibliothek ("Rezepte"-Reiter)
--
-- Auf ausdrücklichen Wunsch des Inhabers bekommt jedes Rezept vier neue
-- Klassifizierungs-Dimensionen, über die Kund:innen die Rezeptbibliothek
-- filtern können:
--
--   1) Zubereitungszeit   -> prep_minutes   (Minuten, ganzzahlig, z.B. 15, 25, 40)
--   2) Ernährungsform      -> diet_type      ('vegan' | 'vegetarisch' | 'fleisch' | 'fisch')
--   3) Geschmacksrichtung  -> flavor_profile ('suess' | 'deftig')
--   4) Mahlzeit-Typ        -> meal_type      ('fruehstueck' | 'hauptgericht' | 'snack')
--
-- Klassifizierungs-Logik (für zukünftige Sessions, die neue Rezepte pflegen):
--   - prep_minutes: die in der Rezept-Beschreibung genannte Zubereitungszeit
--     (bei Zeitspannen wie "30-40 Min." wurde ein realistischer Einzelwert
--     innerhalb der Spanne gewählt).
--   - diet_type: 'fleisch' bei Rind/Huhn/Pute/Schwein etc., 'fisch' bei
--     Fisch/Meeresfrüchten (auch Lachs, Thunfisch, Garnelen, Kabeljau),
--     'vegan' wenn weder Fleisch/Fisch noch Milchprodukte/Ei enthalten sind,
--     sonst 'vegetarisch' (kein Fleisch/Fisch, aber Milchprodukte/Ei möglich).
--   - flavor_profile: 'suess' für süße Frühstücks-/Snack-Gerichte (Porridge,
--     Smoothie Bowls, Pancakes/Waffeln, Quark-/Skyr-Süßspeisen, Energy Balls),
--     sonst 'deftig'.
--   - meal_type: 'fruehstueck' für klassische Frühstücks-/Brunch-Gerichte
--     (Porridge, Rührei, Omelett/Frittata, Pancakes/Waffeln, Smoothie Bowls,
--     belegtes Brot), 'snack' für kleine, schnelle Zwischenmahlzeiten ohne
--     nennenswerten Kochaufwand (<=10 Min., z.B. Shake, Obst, Energy Balls),
--     sonst 'hauptgericht' für vollständige Mittag-/Abend-Mahlzeiten.
--
-- Alle 54 zum Zeitpunkt dieser Migration bestehenden Rezepte (aus sql/007,
-- sql/014, sql/016 und sql/039) werden unten rückwirkend klassifiziert.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-043 bereits liefen.
-- ============================================================================

alter table public.recipes add column if not exists prep_minutes integer;
alter table public.recipes add column if not exists diet_type text check (diet_type in ('vegan', 'vegetarisch', 'fleisch', 'fisch'));
alter table public.recipes add column if not exists flavor_profile text check (flavor_profile in ('suess', 'deftig'));
alter table public.recipes add column if not exists meal_type text check (meal_type in ('fruehstueck', 'hauptgericht', 'snack'));

comment on column public.recipes.prep_minutes is 'Zubereitungszeit in Minuten (Filter-Dimension "Zubereitungszeit").';
comment on column public.recipes.diet_type is 'Ernährungsform: vegan / vegetarisch / fleisch / fisch (Filter-Dimension "Ernährungsform").';
comment on column public.recipes.flavor_profile is 'Geschmacksrichtung: suess / deftig (Filter-Dimension "Geschmacksrichtung").';
comment on column public.recipes.meal_type is 'Mahlzeit-Typ: fruehstueck / hauptgericht / snack (Filter-Dimension "Mahlzeit-Typ").';

-- 1) Rezepte aus sql/007_content_rezepte_coaching.sql (12) -------------------
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Overnight Oats mit Beeren';
update public.recipes set prep_minutes = 10, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Rührei mit Vollkorntoast';
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Skyr-Bowl mit Obst & Nüssen';
update public.recipes set prep_minutes = 20, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Hähnchen-Reis-Bowl';
update public.recipes set prep_minutes = 10, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Vollkornwrap mit Pute';
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Linsen-Quinoa-Salat';
update public.recipes set prep_minutes = 25, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Lachs mit Ofengemüse';
update public.recipes set prep_minutes = 20, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Putengeschnetzeltes & Nudeln';
update public.recipes set prep_minutes = 35, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Gefüllte Süßkartoffel';
update public.recipes set prep_minutes = 2, diet_type = 'vegan', flavor_profile = 'suess', meal_type = 'snack' where title = 'Banane mit Erdnussbutter';
update public.recipes set prep_minutes = 3, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'snack' where title = 'Proteinshake mit Haferflocken';
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'snack' where title = 'Magerquark mit Honig';

-- 2) Rezepte aus sql/014_rezepte_erweiterung.sql (12) -------------------------
update public.recipes set prep_minutes = 15, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Griechischer Hähnchensalat';
update public.recipes set prep_minutes = 20, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Shakshuka mit Vollkorntoast';
update public.recipes set prep_minutes = 20, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Thunfisch-Vollkornnudel-Salat';
update public.recipes set prep_minutes = 25, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Rinderhack-Gemüsepfanne mit Reis';
update public.recipes set prep_minutes = 20, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Kichererbsen-Bowl mit Hummus';
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Protein-Pancakes mit Beeren';
update public.recipes set prep_minutes = 20, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Tofu-Gemüsepfanne mit Reis';
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'snack' where title = 'Cottage Cheese mit Ananas & Nüssen';
update public.recipes set prep_minutes = 10, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Vollkorntoast mit Ei & Avocado';
update public.recipes set prep_minutes = 25, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Linsen-Bolognese mit Vollkornnudeln';
update public.recipes set prep_minutes = 10, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'snack' where title = 'Gefrorener Magerquark-Beeren-Crunch';
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'snack' where title = 'Reiswaffeln mit Magerquark & Honig';

-- 3) Rezepte aus sql/016_rezepte_erweiterung_2.sql (10) -----------------------
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Falafel-Bowl mit Joghurt-Dip';
update public.recipes set prep_minutes = 25, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Ofenlachs mit Quinoa und Brokkoli';
update public.recipes set prep_minutes = 20, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Putenburger mit Vollkornbrötchen';
update public.recipes set prep_minutes = 30, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Vollkorn-Pizza mit Hähnchen & Gemüse';
update public.recipes set prep_minutes = 25, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Tofu-Süßkartoffel-Pfanne mit Erdnuss-Sauce';
update public.recipes set prep_minutes = 25, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Hähnchen-Kokos-Curry mit Reis';
update public.recipes set prep_minutes = 25, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Vegetarisches Bohnen-Chili mit Vollkornreis';
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Gemüse-Omelett mit Feta & Spinat';
update public.recipes set prep_minutes = 10, diet_type = 'vegan', flavor_profile = 'suess', meal_type = 'snack' where title = 'Energy Balls mit Datteln & Nüssen';
update public.recipes set prep_minutes = 5, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Schoko-Protein-Overnight-Oats';

-- 4) Rezepte aus sql/039_rezepte_runde15.sql (20) -----------------------------
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Frühstücks-Burrito mit Rührei & schwarzen Bohnen';
update public.recipes set prep_minutes = 20, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Garnelen-Gemüse-Pfanne mit Vollkornreis';
update public.recipes set prep_minutes = 20, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Linsen-Dal mit Vollkornreis';
update public.recipes set prep_minutes = 25, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Hähnchen-Gemüse-Spieße mit Couscous';
update public.recipes set prep_minutes = 30, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Kabeljau im Ofen mit Kartoffeln & Brokkoli';
update public.recipes set prep_minutes = 20, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Erdnuss-Nudeln mit Hähnchen';
update public.recipes set prep_minutes = 20, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Quinoa-Salat mit Feta & Granatapfelkernen';
update public.recipes set prep_minutes = 20, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Gebratener Reis mit Ei & Gemüse';
update public.recipes set prep_minutes = 15, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Big Salad mit Hähnchen, Ei & Avocado';
update public.recipes set prep_minutes = 25, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Gemüse-Frittata mit Ziegenkäse';
update public.recipes set prep_minutes = 30, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Süßkartoffel-Pommes mit Kräuterquark';
update public.recipes set prep_minutes = 10, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Beeren-Smoothie-Bowl mit Chiasamen';
update public.recipes set prep_minutes = 10, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'fruehstueck' where title = 'Räucherlachs-Vollkornbrot mit Frischkäse & Gurke';
update public.recipes set prep_minutes = 25, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Putenspieße mit Joghurt-Marinade & Bulgur';
update public.recipes set prep_minutes = 15, diet_type = 'vegetarisch', flavor_profile = 'suess', meal_type = 'fruehstueck' where title = 'Protein-Waffeln mit Skyr & Beeren';
update public.recipes set prep_minutes = 40, diet_type = 'fleisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Gefüllte Paprika mit Rinderhack & Vollkornreis';
update public.recipes set prep_minutes = 25, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Linsen-Gemüse-Suppe mit Vollkornbrot';
update public.recipes set prep_minutes = 45, diet_type = 'fisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Thunfisch-Ofenkartoffel mit Frischkäse-Dip';
update public.recipes set prep_minutes = 20, diet_type = 'vegetarisch', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Griechischer Bulgur-Salat mit Feta & Oliven';
update public.recipes set prep_minutes = 20, diet_type = 'vegan', flavor_profile = 'deftig', meal_type = 'hauptgericht' where title = 'Kichererbsen-Curry mit Spinat';
