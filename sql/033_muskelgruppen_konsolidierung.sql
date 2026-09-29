-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 13: Muskelgruppen-Taxonomie auf 12 feste Kategorien konsolidiert.
--
-- Bisher war 'muscle_group' unstrukturierter Freitext (76 verschiedene
-- Strings für überlappende Muskelkombinationen, je nachdem aus welcher
-- Insert-Charge 006/013/026 eine Übung stammte). Nutzer-Vorgabe: nur noch
-- genau 12 Muskelgruppen, mehrere je Übung möglich (kommagetrennt), NUR für
-- Kraft- und Bodyweight-Übungen (Cardio/Mobilisation werden weiterhin nur
-- über die Kategorie gefiltert, ihr 'muscle_group'-Freitext bleibt informativ
-- unverändert). Die 12 Kategorien:
--   Ganzkörper, Schulter, Trizeps, Bizeps, Brust, Trapez, Latissimus,
--   Rückenstrecker, Bauchmuskeln, Gesäß, Oberschenkel, Waden
--
-- Zusätzlich: die 30 Übungen aus sql/026 hatten category = NULL (in der
-- Trainingsbuilder-UI als "Sonstige" angezeigt) — Nutzer-Vorgabe: diese
-- Kategorie entfällt, jede Übung bekommt eine echte Kategorie
-- (Kraft/Bodyweight/Mobilisation) + movement_pattern für die
-- Dysbalance-Auswertung.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-032 bereits liefen.
-- ============================================================================


update public.exercises set
  muscle_group = 'Gesäß'
where name = 'Abduktorenmaschine';

update public.exercises set
  muscle_group = 'Oberschenkel'
where name = 'Adduktorenmaschine';

update public.exercises set
  muscle_group = 'Schulter, Trapez'
where name = 'Aufrechtes Rudern (Langhantel)';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Ausfallschritt mit explosivem Ausstoßen';

update public.exercises set
  muscle_group = 'Latissimus, Rückenstrecker'
where name = 'BWS-Extension mit Ruderzug (instabil)';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'BWS-Rotation mit Medizinball';

update public.exercises set
  muscle_group = 'Brust, Trizeps, Schulter'
where name = 'Bankdrücken (Flachbank)';

update public.exercises set
  muscle_group = 'Gesäß, Oberschenkel'
where name = 'Beckenlift mit Beinbeuge am Ball';

update public.exercises set
  muscle_group = 'Oberschenkel'
where name = 'Beinbeuger an der Maschine';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Beinheben hängend';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Beinpresse';

update public.exercises set
  muscle_group = 'Oberschenkel'
where name = 'Beinstrecker an der Maschine';

update public.exercises set
  muscle_group = 'Bizeps'
where name = 'Bizepscurls (Langhantel)';

update public.exercises set
  muscle_group = 'Bizeps'
where name = 'Bizepscurls am Kabelzug';

update public.exercises set
  muscle_group = 'Bizeps'
where name = 'Bizepscurls mit Kurzhanteln';

update public.exercises set
  muscle_group = 'Brust, Trizeps'
where name = 'Brustpresse an der Maschine';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Bulgarian Split Squat (Langhantel)';

update public.exercises set
  muscle_group = 'Brust'
where name = 'Butterfly an der Maschine';

update public.exercises set
  muscle_group = 'Latissimus, Bizeps'
where name = 'Einarmiges Kurzhantelrudern';

update public.exercises set
  muscle_group = 'Schulter, Trapez'
where name = 'Face Pulls am Kabelzug';

update public.exercises set
  muscle_group = 'Schulter'
where name = 'Frontheben mit Kurzhanteln';

update public.exercises set
  muscle_group = 'Bizeps'
where name = 'Hammercurls mit Kurzhanteln';

update public.exercises set
  muscle_group = 'Gesäß, Oberschenkel'
where name = 'Hüftstoßen mit der Langhantel (Hip Thrust)';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Kabel-Crunches (kniend)';

update public.exercises set
  muscle_group = 'Brust'
where name = 'Kabelzug-Fliegende (Cable Crossover)';

update public.exercises set
  muscle_group = 'Gesäß'
where name = 'Kabelzug-Kickback';

update public.exercises set
  muscle_group = 'Latissimus, Bizeps'
where name = 'Klimmzüge an der Assistenzmaschine';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Kniebeuge (Langhantel)';

update public.exercises set
  muscle_group = 'Rückenstrecker, Oberschenkel, Gesäß'
where name = 'Kreuzheben';

update public.exercises set
  muscle_group = 'Brust, Trizeps'
where name = 'Kurzhantel-Bankdrücken (Flachbank)';

update public.exercises set
  muscle_group = 'Brust'
where name = 'Kurzhantel-Fliegende (Flachbank)';

update public.exercises set
  muscle_group = 'Trizeps'
where name = 'Kurzhantel-Trizepsstrecken (über Kopf)';

update public.exercises set
  muscle_group = 'Latissimus, Bizeps'
where name = 'Latzug frontal';

update public.exercises set
  muscle_group = 'Schulter, Trapez'
where name = 'Reverse Butterfly an der Maschine';

update public.exercises set
  muscle_group = 'Latissimus, Trapez, Bizeps'
where name = 'Rudermaschine sitzend';

update public.exercises set
  muscle_group = 'Rückenstrecker'
where name = 'Rückenstrecker an der Maschine';

update public.exercises set
  muscle_group = 'Brust, Schulter, Trizeps'
where name = 'Schrägbankdrücken';

update public.exercises set
  muscle_group = 'Schulter, Trizeps'
where name = 'Schulterdrücken (Langhantel, stehend)';

update public.exercises set
  muscle_group = 'Schulter, Trizeps'
where name = 'Schulterpresse an der Maschine';

update public.exercises set
  muscle_group = 'Schulter'
where name = 'Seitheben mit Kurzhanteln';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Seitlicher Ausfallschritt (stehend)';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Seitliches Gleiten im Ausfallschritt';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Seitstütz mit Hüftbeuger-Anzug';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Standwaage auf instabiler Unterlage';

update public.exercises set
  muscle_group = 'Trizeps'
where name = 'Trizeps-Pushdown am Kabelzug';

update public.exercises set
  muscle_group = 'Trizeps'
where name = 'Trizepsdrücken an der Maschine';

update public.exercises set
  muscle_group = 'Trizeps'
where name = 'Trizepsstrecken am Seil (über Kopf)';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Unterarmstütz (Plank)';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Unterarmstütz auf dem Gymnastikball';

update public.exercises set
  muscle_group = 'Latissimus, Trapez, Bizeps'
where name = 'Vorgebeugtes Rudern (Langhantel)';

update public.exercises set
  muscle_group = 'Waden'
where name = 'Wadenheben sitzend an der Maschine';

update public.exercises set
  muscle_group = 'Waden'
where name = 'Wadenheben stehend an der Maschine';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Wirbelsäulen-Rotation am Seilzug';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Bulgarian Split Squat (Bodyweight)';

update public.exercises set
  muscle_group = 'Oberschenkel, Rückenstrecker'
where name = 'Good Mornings (Bodyweight)';

update public.exercises set
  muscle_group = 'Ganzkörper'
where name = 'HIIT-Zirkel (freie Übungsauswahl)';

update public.exercises set
  muscle_group = 'Brust, Trizeps, Schulter'
where name = 'Liegestütz-Varianten';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Plyo-Ausfallschritte';

update public.exercises set
  muscle_group = 'Schulter'
where name = 'Schulterkreisen mit Wasserflaschen';

update public.exercises set
  muscle_group = 'Oberschenkel, Gesäß'
where name = 'Standwaage (ohne Zusatzgerät)';

update public.exercises set
  muscle_group = 'Rückenstrecker'
where name = 'Superman';

update public.exercises set
  muscle_group = 'Bauchmuskeln'
where name = 'Unterarmstütz-Varianten auf dem Ball';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Latissimus, Bizeps',
  movement_pattern = 'pull_oberkoerper'
where name = 'Klimmzug (Pull-Up)';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Brust, Trizeps',
  movement_pattern = 'push_oberkoerper'
where name = 'Dips am Barren';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Oberschenkel, Gesäß',
  movement_pattern = 'vordere_beinkette'
where name = 'Pistol Squat';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Oberschenkel',
  movement_pattern = 'hintere_beinkette'
where name = 'Nordic Hamstring Curl';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Bauchmuskeln',
  movement_pattern = 'rumpf_vorne'
where name = 'Hollow Body Hold';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Bauchmuskeln, Trizeps',
  movement_pattern = 'rumpf_vorne'
where name = 'L-Sit';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Ganzkörper',
  movement_pattern = 'sonstige'
where name = 'Bärengang (Bear Crawl)';

update public.exercises set
  category = 'Bodyweight',
  muscle_group = 'Trizeps, Gesäß, Bauchmuskeln',
  movement_pattern = 'sonstige'
where name = 'Krabbengang (Crab Walk)';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß',
  movement_pattern = 'vordere_beinkette'
where name = 'Standweitsprung (Broad Jump)';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß, Waden',
  movement_pattern = 'vordere_beinkette'
where name = 'Box Jump';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß',
  movement_pattern = 'vordere_beinkette'
where name = 'Goblet Squat';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß, Rückenstrecker',
  movement_pattern = 'hintere_beinkette'
where name = 'Rumänisches Kreuzheben mit Kurzhanteln';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß',
  movement_pattern = 'vordere_beinkette'
where name = 'Kurzhantel-Ausfallschritte gehend (Walking Lunges)';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Latissimus, Bizeps, Bauchmuskeln',
  movement_pattern = 'pull_oberkoerper'
where name = 'Renegade Row';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß, Schulter',
  movement_pattern = 'sonstige'
where name = 'Kurzhantel-Thruster';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Schulter, Trizeps',
  movement_pattern = 'push_oberkoerper'
where name = 'Arnold Press';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß, Rückenstrecker',
  movement_pattern = 'vordere_beinkette'
where name = 'Zercher Squat';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Schulter, Bauchmuskeln',
  movement_pattern = 'push_oberkoerper'
where name = 'Landmine Press';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Trapez, Ganzkörper',
  movement_pattern = 'sonstige'
where name = 'Farmer''s Walk';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Ganzkörper, Schulter',
  movement_pattern = 'sonstige'
where name = 'Kettlebell Clean & Press';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß',
  movement_pattern = 'vordere_beinkette'
where name = 'Kettlebell Goblet Reverse Lunge';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Schulter, Trizeps, Bauchmuskeln',
  movement_pattern = 'push_oberkoerper'
where name = 'Einarmiges Kurzhantel-Überkopfdrücken';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Bauchmuskeln',
  movement_pattern = 'rumpf_vorne'
where name = 'Kurzhantel-Seitbeuge';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Ganzkörper',
  movement_pattern = 'sonstige'
where name = 'Turkish Get-Up';

update public.exercises set
  category = 'Kraft',
  muscle_group = 'Oberschenkel, Gesäß, Rückenstrecker',
  movement_pattern = 'hintere_beinkette'
where name = 'Sumo-Kreuzheben mit Kurzhantel';

update public.exercises set
  category = 'Mobilisation',
  movement_pattern = 'sonstige'
where name = 'Inchworm';

update public.exercises set
  category = 'Mobilisation',
  movement_pattern = 'sonstige'
where name = 'World''s Greatest Stretch';

update public.exercises set
  category = 'Mobilisation',
  movement_pattern = 'sonstige'
where name = '90/90-Hüftmobilisation';

update public.exercises set
  category = 'Mobilisation',
  movement_pattern = 'vordere_beinkette'
where name = 'Tiefe Kniebeuge im Halten (Deep Squat Hold)';

update public.exercises set
  category = 'Mobilisation',
  movement_pattern = 'pull_oberkoerper'
where name = 'Wandschieben (Wall Slides)';
