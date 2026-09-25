-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 19: Bild-URLs für Übungen, Rezepte und Coaching-Content
--
-- Setzt image_url für alle Übungen/Rezepte/Coaching-Inhalte, für die Nicholas
-- inzwischen KI-generierte Bilder geliefert hat (siehe gemini-bildprompts.md).
-- Bilder liegen unter content/uebungen/, content/rezepte-bilder/ bzw. neu
-- content/coaching-bilder/ und müssen zusammen mit dieser Migration ins
-- GitHub-Repo hochgeladen werden.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-020 bereits liefen.
-- ============================================================================

-- Übungen (40 von 50 — die restlichen 10 folgen, sobald
-- die passenden Bilder nachgereicht wurden)
update public.exercises set image_url = 'content/uebungen/armkreisen-ausfallschritt-rotation.jpg' where name = 'Armkreisen mit Ausfallschritt & Rotation';
update public.exercises set image_url = 'content/uebungen/hueftkreisen-beinpendel.jpg' where name = 'Hüftkreisen & Beinpendel';
update public.exercises set image_url = 'content/uebungen/katze-kuh-mobilisation.jpg' where name = 'Katze-Kuh-Mobilisation';
update public.exercises set image_url = 'content/uebungen/hip-bridge.jpg' where name = 'Hip Bridge';
update public.exercises set image_url = 'content/uebungen/bird-dog.jpg' where name = 'Bird Dog';
update public.exercises set image_url = 'content/uebungen/skipping-kniehebelauf.jpg' where name = 'Skipping & Kniehebelauf';
update public.exercises set image_url = 'content/uebungen/jumping-jacks.jpg' where name = 'Jumping Jacks';
update public.exercises set image_url = 'content/uebungen/kettlebell-swings.jpg' where name = 'Kettlebell Swings';
update public.exercises set image_url = 'content/uebungen/step-ups.jpg' where name = 'Step-Ups';
update public.exercises set image_url = 'content/uebungen/ruder-intervalle.jpg' where name = 'Ruder-Intervalle';
update public.exercises set image_url = 'content/uebungen/battle-ropes.jpg' where name = 'Battle Ropes';
update public.exercises set image_url = 'content/uebungen/mountain-climbers.jpg' where name = 'Mountain Climbers';
update public.exercises set image_url = 'content/uebungen/burpees.jpg' where name = 'Burpees';
update public.exercises set image_url = 'content/uebungen/brustpresse-maschine.jpg' where name = 'Brustpresse an der Maschine';
update public.exercises set image_url = 'content/uebungen/kurzhantel-bankdruecken-flachbank.jpg' where name = 'Kurzhantel-Bankdrücken (Flachbank)';
update public.exercises set image_url = 'content/uebungen/kurzhantel-fliegende-flachbank.jpg' where name = 'Kurzhantel-Fliegende (Flachbank)';
update public.exercises set image_url = 'content/uebungen/butterfly-maschine.jpg' where name = 'Butterfly an der Maschine';
update public.exercises set image_url = 'content/uebungen/kabelzug-fliegende-cable-crossover.jpg' where name = 'Kabelzug-Fliegende (Cable Crossover)';
update public.exercises set image_url = 'content/uebungen/rudermaschine-sitzend.jpg' where name = 'Rudermaschine sitzend';
update public.exercises set image_url = 'content/uebungen/einarmiges-kurzhantelrudern.jpg' where name = 'Einarmiges Kurzhantelrudern';
update public.exercises set image_url = 'content/uebungen/klimmzuege-assistenzmaschine.jpg' where name = 'Klimmzüge an der Assistenzmaschine';
update public.exercises set image_url = 'content/uebungen/ruckenstrecker-maschine.jpg' where name = 'Rückenstrecker an der Maschine';
update public.exercises set image_url = 'content/uebungen/seitheben-kurzhanteln.jpg' where name = 'Seitheben mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/frontheben-kurzhanteln.jpg' where name = 'Frontheben mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/face-pulls-kabelzug.jpg' where name = 'Face Pulls am Kabelzug';
update public.exercises set image_url = 'content/uebungen/reverse-butterfly-maschine.jpg' where name = 'Reverse Butterfly an der Maschine';
update public.exercises set image_url = 'content/uebungen/bizepscurls-kurzhanteln.jpg' where name = 'Bizepscurls mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/bizepscurls-kabelzug.jpg' where name = 'Bizepscurls am Kabelzug';
update public.exercises set image_url = 'content/uebungen/kurzhantel-trizepsstrecken-ueberkopf.jpg' where name = 'Kurzhantel-Trizepsstrecken (über Kopf)';
update public.exercises set image_url = 'content/uebungen/trizeps-pushdown-kabelzug.jpg' where name = 'Trizeps-Pushdown am Kabelzug';
update public.exercises set image_url = 'content/uebungen/beinpresse.jpg' where name = 'Beinpresse';
update public.exercises set image_url = 'content/uebungen/hueftstossen-langhantel-hip-thrust.jpg' where name = 'Hüftstoßen mit der Langhantel (Hip Thrust)';
update public.exercises set image_url = 'content/uebungen/kabelzug-kickback.jpg' where name = 'Kabelzug-Kickback';
update public.exercises set image_url = 'content/uebungen/kabel-crunches-kniend.jpg' where name = 'Kabel-Crunches (kniend)';
update public.exercises set image_url = 'content/uebungen/beinheben-haengend.jpg' where name = 'Beinheben hängend';
update public.exercises set image_url = 'content/uebungen/laufband.jpg' where name = 'Laufband';
update public.exercises set image_url = 'content/uebungen/crosstrainer-ellipsentrainer.jpg' where name = 'Crosstrainer (Ellipsentrainer)';
update public.exercises set image_url = 'content/uebungen/stairmaster-treppensteiger.jpg' where name = 'Stairmaster (Treppensteiger)';
update public.exercises set image_url = 'content/uebungen/liegerad-recumbent-bike.jpg' where name = 'Liegerad (Recumbent Bike)';
update public.exercises set image_url = 'content/uebungen/fahrrad-ergometer.jpg' where name = 'Fahrrad-Ergometer';

-- Rezepte (22 von 22 neu bebilderte Rezepte aus Etappe 14+16)
update public.recipes set image_url = 'content/rezepte-bilder/griechischer-haehnchensalat.jpg' where title = 'Griechischer Hähnchensalat';
update public.recipes set image_url = 'content/rezepte-bilder/shakshuka-vollkorntoast.jpg' where title = 'Shakshuka mit Vollkorntoast';
update public.recipes set image_url = 'content/rezepte-bilder/thunfisch-vollkornnudel-salat.jpg' where title = 'Thunfisch-Vollkornnudel-Salat';
update public.recipes set image_url = 'content/rezepte-bilder/rinderhack-gemuesepfanne-reis.jpg' where title = 'Rinderhack-Gemüsepfanne mit Reis';
update public.recipes set image_url = 'content/rezepte-bilder/kichererbsen-bowl-hummus.jpg' where title = 'Kichererbsen-Bowl mit Hummus';
update public.recipes set image_url = 'content/rezepte-bilder/protein-pancakes-beeren.jpg' where title = 'Protein-Pancakes mit Beeren';
update public.recipes set image_url = 'content/rezepte-bilder/tofu-gemuesepfanne-reis.jpg' where title = 'Tofu-Gemüsepfanne mit Reis';
update public.recipes set image_url = 'content/rezepte-bilder/cottage-cheese-ananas-nuesse.jpg' where title = 'Cottage Cheese mit Ananas & Nüssen';
update public.recipes set image_url = 'content/rezepte-bilder/vollkorntoast-ei-avocado.jpg' where title = 'Vollkorntoast mit Ei & Avocado';
update public.recipes set image_url = 'content/rezepte-bilder/linsen-bolognese-vollkornnudeln.jpg' where title = 'Linsen-Bolognese mit Vollkornnudeln';
update public.recipes set image_url = 'content/rezepte-bilder/gefrorener-magerquark-beeren-crunch.jpg' where title = 'Gefrorener Magerquark-Beeren-Crunch';
update public.recipes set image_url = 'content/rezepte-bilder/reiswaffeln-magerquark-honig.jpg' where title = 'Reiswaffeln mit Magerquark & Honig';
update public.recipes set image_url = 'content/rezepte-bilder/falafel-bowl-joghurt-dip.jpg' where title = 'Falafel-Bowl mit Joghurt-Dip';
update public.recipes set image_url = 'content/rezepte-bilder/ofenlachs-quinoa-brokkoli.jpg' where title = 'Ofenlachs mit Quinoa und Brokkoli';
update public.recipes set image_url = 'content/rezepte-bilder/putenburger-vollkornbroetchen.jpg' where title = 'Putenburger mit Vollkornbrötchen';
update public.recipes set image_url = 'content/rezepte-bilder/vollkorn-pizza-haehnchen-gemuese.jpg' where title = 'Vollkorn-Pizza mit Hähnchen & Gemüse';
update public.recipes set image_url = 'content/rezepte-bilder/tofu-suesskartoffel-erdnuss-sauce.jpg' where title = 'Tofu-Süßkartoffel-Pfanne mit Erdnuss-Sauce';
update public.recipes set image_url = 'content/rezepte-bilder/haehnchen-kokos-curry-reis.jpg' where title = 'Hähnchen-Kokos-Curry mit Reis';
update public.recipes set image_url = 'content/rezepte-bilder/bohnen-chili-vollkornreis.jpg' where title = 'Vegetarisches Bohnen-Chili mit Vollkornreis';
update public.recipes set image_url = 'content/rezepte-bilder/gemuese-omelett-feta-spinat.jpg' where title = 'Gemüse-Omelett mit Feta & Spinat';
update public.recipes set image_url = 'content/rezepte-bilder/energy-balls-datteln-nuesse.jpg' where title = 'Energy Balls mit Datteln & Nüssen';
update public.recipes set image_url = 'content/rezepte-bilder/schoko-protein-overnight-oats.jpg' where title = 'Schoko-Protein-Overnight-Oats';

-- Coaching-Content-Titelbilder (11 von 11)
update public.coaching_content set image_url = 'content/coaching-bilder/selbstgespraeche-und-vorbilder.jpg' where title = 'Der innere Dialog: Selbstgespräche & Vorbilder';
update public.coaching_content set image_url = 'content/coaching-bilder/musik-bpm-und-flow.jpg' where title = 'Musik, BPM & Flow';
update public.coaching_content set image_url = 'content/coaching-bilder/selbstwirksamkeit-verstehen-und-staerken.jpg' where title = 'Selbstwirksamkeit verstehen und stärken';
update public.coaching_content set image_url = 'content/coaching-bilder/gewohnheiten-aufbauen.jpg' where title = 'Gewohnheiten aufbauen: der Habit-Loop';
update public.coaching_content set image_url = 'content/coaching-bilder/resilienz-und-rueckschlaege.jpg' where title = 'Rückschläge & Resilienz';
update public.coaching_content set image_url = 'content/coaching-bilder/ziele-mit-woop.jpg' where title = 'Zielklarheit mit WOOP';
update public.coaching_content set image_url = 'content/coaching-bilder/schlaf-und-regeneration.jpg' where title = 'Schlaf & Regeneration';
update public.coaching_content set image_url = 'content/coaching-bilder/zielsetzungstheorie.jpg' where title = 'Zielsetzungstheorie (SMART-Ziele)';
update public.coaching_content set image_url = 'content/coaching-bilder/achtsamkeit-und-stressregulation.jpg' where title = 'Achtsamkeit & Stressregulation';
update public.coaching_content set image_url = 'content/coaching-bilder/mindset-und-erwartungseffekt.jpg' where title = 'Mindset & Erwartungseffekt';
update public.coaching_content set image_url = 'content/coaching-bilder/soziale-unterstuetzung-accountability.jpg' where title = 'Soziale Unterstützung & Accountability';
