-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 30: Bild-URLs Runde 2 – 30 neue Übungen (Etappe 26), 31 bestehende
--            Übungen ohne bisheriges Bild sowie 5 Coaching-Content-
--            Titelbilder (Etappe 25). Bilder liegen im Repository unter
--            content/uebungen/ bzw. content/coaching-bilder/ (siehe ZIP).
--
-- Hinweis: Für 2 Übungen aus der Prompt-Liste ("Wandschieben (Wall Slides)"
-- und "Arnold Press") wurde bislang kein Bild generiert (in der PDF-Vorlage
-- ohne zugehöriges Bild) – deren image_url bleibt vorerst leer, bis ein Bild
-- nachgereicht wird.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-029 bereits liefen.
-- ============================================================================

-- 1) 30 neue Übungen (Etappe 26) – jetzt mit Bild
-- ----------------------------------------------------------------------------
update public.exercises set image_url = 'content/uebungen/klimmzug-pull-up.jpg' where name = 'Klimmzug (Pull-Up)';
update public.exercises set image_url = 'content/uebungen/dips-barren.jpg' where name = 'Dips am Barren';
update public.exercises set image_url = 'content/uebungen/pistol-squat.jpg' where name = 'Pistol Squat';
update public.exercises set image_url = 'content/uebungen/nordic-hamstring-curl.jpg' where name = 'Nordic Hamstring Curl';
update public.exercises set image_url = 'content/uebungen/hollow-body-hold.jpg' where name = 'Hollow Body Hold';
update public.exercises set image_url = 'content/uebungen/l-sit.jpg' where name = 'L-Sit';
update public.exercises set image_url = 'content/uebungen/standweitsprung-broad-jump.jpg' where name = 'Standweitsprung (Broad Jump)';
update public.exercises set image_url = 'content/uebungen/box-jump.jpg' where name = 'Box Jump';
update public.exercises set image_url = 'content/uebungen/baerengang-bear-crawl.jpg' where name = 'Bärengang (Bear Crawl)';
update public.exercises set image_url = 'content/uebungen/krabbengang-crab-walk.jpg' where name = 'Krabbengang (Crab Walk)';
update public.exercises set image_url = 'content/uebungen/inchworm.jpg' where name = 'Inchworm';
update public.exercises set image_url = 'content/uebungen/worlds-greatest-stretch.jpg' where name = 'World''s Greatest Stretch';
update public.exercises set image_url = 'content/uebungen/huefte-90-90-mobilisation.jpg' where name = '90/90-Hüftmobilisation';
update public.exercises set image_url = 'content/uebungen/tiefe-kniebeuge-halten.jpg' where name = 'Tiefe Kniebeuge im Halten (Deep Squat Hold)';
update public.exercises set image_url = 'content/uebungen/goblet-squat.jpg' where name = 'Goblet Squat';
update public.exercises set image_url = 'content/uebungen/rumaenisches-kreuzheben-kurzhanteln.jpg' where name = 'Rumänisches Kreuzheben mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/kurzhantel-ausfallschritte-gehend.jpg' where name = 'Kurzhantel-Ausfallschritte gehend (Walking Lunges)';
update public.exercises set image_url = 'content/uebungen/renegade-row.jpg' where name = 'Renegade Row';
update public.exercises set image_url = 'content/uebungen/kurzhantel-thruster.jpg' where name = 'Kurzhantel-Thruster';
update public.exercises set image_url = 'content/uebungen/zercher-squat.jpg' where name = 'Zercher Squat';
update public.exercises set image_url = 'content/uebungen/landmine-press.jpg' where name = 'Landmine Press';
update public.exercises set image_url = 'content/uebungen/farmers-walk.jpg' where name = 'Farmer''s Walk';
update public.exercises set image_url = 'content/uebungen/kettlebell-clean-and-press.jpg' where name = 'Kettlebell Clean & Press';
update public.exercises set image_url = 'content/uebungen/kettlebell-goblet-reverse-lunge.jpg' where name = 'Kettlebell Goblet Reverse Lunge';
update public.exercises set image_url = 'content/uebungen/einarmiges-kurzhantel-ueberkopfdruecken.jpg' where name = 'Einarmiges Kurzhantel-Überkopfdrücken';
update public.exercises set image_url = 'content/uebungen/kurzhantel-seitbeuge.jpg' where name = 'Kurzhantel-Seitbeuge';
update public.exercises set image_url = 'content/uebungen/turkish-get-up.jpg' where name = 'Turkish Get-Up';
update public.exercises set image_url = 'content/uebungen/sumo-kreuzheben-kurzhantel.jpg' where name = 'Sumo-Kreuzheben mit Kurzhantel';

-- 2) 31 bestehende Übungen ohne bisheriges Bild
-- ----------------------------------------------------------------------------
update public.exercises set image_url = 'content/uebungen/aufrechtes-rudern-langhantel.jpg' where name = 'Aufrechtes Rudern (Langhantel)';
update public.exercises set image_url = 'content/uebungen/ausfallschritt-explosiv.jpg' where name = 'Ausfallschritt mit explosivem Ausstoßen';
update public.exercises set image_url = 'content/uebungen/bws-extension-ruderzug-instabil.jpg' where name = 'BWS-Extension mit Ruderzug (instabil)';
update public.exercises set image_url = 'content/uebungen/bws-rotation-medizinball.jpg' where name = 'BWS-Rotation mit Medizinball';
update public.exercises set image_url = 'content/uebungen/bankdruecken-flachbank.jpg' where name = 'Bankdrücken (Flachbank)';
update public.exercises set image_url = 'content/uebungen/beckenlift-beinbeuge-ball.jpg' where name = 'Beckenlift mit Beinbeuge am Ball';
update public.exercises set image_url = 'content/uebungen/bizepscurls-langhantel.jpg' where name = 'Bizepscurls (Langhantel)';
update public.exercises set image_url = 'content/uebungen/bulgarian-split-squat-bodyweight.jpg' where name = 'Bulgarian Split Squat (Bodyweight)';
update public.exercises set image_url = 'content/uebungen/bulgarian-split-squat-langhantel.jpg' where name = 'Bulgarian Split Squat (Langhantel)';
update public.exercises set image_url = 'content/uebungen/good-mornings-bodyweight.jpg' where name = 'Good Mornings (Bodyweight)';
update public.exercises set image_url = 'content/uebungen/hiit-zirkel.jpg' where name = 'HIIT-Zirkel (freie Übungsauswahl)';
update public.exercises set image_url = 'content/uebungen/kniebeuge-langhantel.jpg' where name = 'Kniebeuge (Langhantel)';
update public.exercises set image_url = 'content/uebungen/kreuzheben.jpg' where name = 'Kreuzheben';
update public.exercises set image_url = 'content/uebungen/latzug-frontal.jpg' where name = 'Latzug frontal';
update public.exercises set image_url = 'content/uebungen/liegestuetz-varianten.jpg' where name = 'Liegestütz-Varianten';
update public.exercises set image_url = 'content/uebungen/plyo-ausfallschritte.jpg' where name = 'Plyo-Ausfallschritte';
update public.exercises set image_url = 'content/uebungen/schraegbankdruecken.jpg' where name = 'Schrägbankdrücken';
update public.exercises set image_url = 'content/uebungen/schulterdruecken-langhantel-stehend.jpg' where name = 'Schulterdrücken (Langhantel, stehend)';
update public.exercises set image_url = 'content/uebungen/schulterkreisen-wasserflaschen.jpg' where name = 'Schulterkreisen mit Wasserflaschen';
update public.exercises set image_url = 'content/uebungen/seitlicher-ausfallschritt-stehend.jpg' where name = 'Seitlicher Ausfallschritt (stehend)';
update public.exercises set image_url = 'content/uebungen/seitliches-gleiten-ausfallschritt.jpg' where name = 'Seitliches Gleiten im Ausfallschritt';
update public.exercises set image_url = 'content/uebungen/seitstuetz-huefte.jpg' where name = 'Seitstütz mit Hüftbeuger-Anzug';
update public.exercises set image_url = 'content/uebungen/standwaage-ohne-geraet.jpg' where name = 'Standwaage (ohne Zusatzgerät)';
update public.exercises set image_url = 'content/uebungen/standwaage-instabile-unterlage.jpg' where name = 'Standwaage auf instabiler Unterlage';
update public.exercises set image_url = 'content/uebungen/superman.jpg' where name = 'Superman';
update public.exercises set image_url = 'content/uebungen/trizepsstrecken-seil-ueberkopf.jpg' where name = 'Trizepsstrecken am Seil (über Kopf)';
update public.exercises set image_url = 'content/uebungen/unterarmstuetz-plank.jpg' where name = 'Unterarmstütz (Plank)';
update public.exercises set image_url = 'content/uebungen/unterarmstuetz-gymnastikball.jpg' where name = 'Unterarmstütz auf dem Gymnastikball';
update public.exercises set image_url = 'content/uebungen/unterarmstuetz-varianten-ball.jpg' where name = 'Unterarmstütz-Varianten auf dem Ball';
update public.exercises set image_url = 'content/uebungen/vorgebeugtes-rudern-langhantel.jpg' where name = 'Vorgebeugtes Rudern (Langhantel)';
update public.exercises set image_url = 'content/uebungen/wirbelsaeulen-rotation-seilzug.jpg' where name = 'Wirbelsäulen-Rotation am Seilzug';

-- 3) 5 neue Coaching-Content-Titelbilder (Etappe 25)
-- ----------------------------------------------------------------------------
update public.coaching_content set image_url = 'content/coaching-bilder/sitzen-und-seitenschlafen.jpg' where title = 'Sitzen & Seitenschlafen';
update public.coaching_content set image_url = 'content/coaching-bilder/willenskraft-kopfsache.jpg' where title = 'Willenskraft: Kopfsache?';
update public.coaching_content set image_url = 'content/coaching-bilder/bewegung-als-antidepressivum.jpg' where title = 'Bewegung als Antidepressivum';
update public.coaching_content set image_url = 'content/coaching-bilder/stress-cortisol-bauchfett.jpg' where title = 'Stress, Cortisol & Bauchfett';
update public.coaching_content set image_url = 'content/coaching-bilder/perfektionismus-und-selbstmitgefuehl.jpg' where title = 'Perfektionismus & Selbstmitgefühl';

