-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 14: Bildzuordnung für 98 der 105 Übungen aus der Bildprompt-Liste
-- Runde 13 (bildprompt-liste-runde13.md), nachdem der Nutzer die Bilder mit
-- Gemini erzeugt und als PDF zurückgeliefert hat. Bilder liegen unter
-- content/uebungen/ (Dateinamen = die in der Bildprompt-Liste vorgeschlagenen
-- Slugs). Für 7 Übungen enthielt die PDF-Rückgabe kein Bild (vermutlich bei
-- der Generierung ausgelassen) — diese bleiben bewusst image_url = null und
-- sind am Ende dieser Datei separat aufgelistet.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-034 bereits liefen.
-- ============================================================================

update public.exercises set image_url = 'content/uebungen/schulterpresse-maschine.jpg' where name = 'Schulterpresse an der Maschine';
update public.exercises set image_url = 'content/uebungen/hammercurls-kurzhanteln.jpg' where name = 'Hammercurls mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/beinstrecker-maschine.jpg' where name = 'Beinstrecker an der Maschine';
update public.exercises set image_url = 'content/uebungen/beinbeuger-maschine.jpg' where name = 'Beinbeuger an der Maschine';
update public.exercises set image_url = 'content/uebungen/wadenheben-stehend-maschine.jpg' where name = 'Wadenheben stehend an der Maschine';
update public.exercises set image_url = 'content/uebungen/wadenheben-sitzend-maschine.jpg' where name = 'Wadenheben sitzend an der Maschine';
update public.exercises set image_url = 'content/uebungen/adduktorenmaschine.jpg' where name = 'Adduktorenmaschine';
update public.exercises set image_url = 'content/uebungen/abduktorenmaschine.jpg' where name = 'Abduktorenmaschine';
update public.exercises set image_url = 'content/uebungen/arnold-press.jpg' where name = 'Arnold Press';
update public.exercises set image_url = 'content/uebungen/wandschieben-wall-slides.jpg' where name = 'Wandschieben (Wall Slides)';
update public.exercises set image_url = 'content/uebungen/stepper.jpg' where name = 'Stepper';
update public.exercises set image_url = 'content/uebungen/ueberzuege-kurzhantel.jpg' where name = 'Überzüge mit Kurzhantel';
update public.exercises set image_url = 'content/uebungen/ueberzuege-kabelzug.jpg' where name = 'Überzüge am Kabelzug';
update public.exercises set image_url = 'content/uebungen/v-lift-band.jpg' where name = 'V-Lift mit Band';
update public.exercises set image_url = 'content/uebungen/v-lift-kurzhantel.jpg' where name = 'V-Lift mit Kurzhantel';
update public.exercises set image_url = 'content/uebungen/aussenrotationen-schulter.jpg' where name = 'Außenrotationen für die Schulter';
update public.exercises set image_url = 'content/uebungen/innenrotationen-schulter.jpg' where name = 'Innenrotationen für die Schulter';
update public.exercises set image_url = 'content/uebungen/kurzhantel-schulterdruecken-sitzend.jpg' where name = 'Kurzhantel-Schulterdrücken (sitzend)';
update public.exercises set image_url = 'content/uebungen/rumaenisches-kreuzheben-langhantel.jpg' where name = 'Rumänisches Kreuzheben (Langhantel)';
update public.exercises set image_url = 'content/uebungen/frontkniebeuge-langhantel.jpg' where name = 'Frontkniebeuge (Langhantel)';
update public.exercises set image_url = 'content/uebungen/hackenschmidt-maschine-hack-squat.jpg' where name = 'Hackenschmidt-Maschine (Hack Squat)';
update public.exercises set image_url = 'content/uebungen/rueckwaertiger-ausfallschritt-langhantel.jpg' where name = 'Rückwärtiger Ausfallschritt mit der Langhantel';
update public.exercises set image_url = 'content/uebungen/konzentrationscurls-kurzhantel.jpg' where name = 'Konzentrationscurls mit Kurzhantel';
update public.exercises set image_url = 'content/uebungen/enges-bankdruecken-close-grip.jpg' where name = 'Enges Bankdrücken (Close-Grip)';
update public.exercises set image_url = 'content/uebungen/dips-assistenzmaschine.jpg' where name = 'Dips an der Assistenzmaschine';
update public.exercises set image_url = 'content/uebungen/shrugs-langhantel.jpg' where name = 'Shrugs mit der Langhantel';
update public.exercises set image_url = 'content/uebungen/shrugs-kurzhanteln.jpg' where name = 'Shrugs mit Kurzhanteln';
update public.exercises set image_url = 'content/uebungen/beinadduktion-kabelzug.jpg' where name = 'Beinadduktion am Kabelzug';
update public.exercises set image_url = 'content/uebungen/beinabduktion-kabelzug.jpg' where name = 'Beinabduktion am Kabelzug';
update public.exercises set image_url = 'content/uebungen/scott-curls-sz-stange.jpg' where name = 'Scott-Curls (SZ-Stange)';
update public.exercises set image_url = 'content/uebungen/trizeps-kickback-kurzhantel.jpg' where name = 'Trizeps-Kickback mit Kurzhantel';
update public.exercises set image_url = 'content/uebungen/kabelzug-frontheben.jpg' where name = 'Kabelzug-Frontheben';
update public.exercises set image_url = 'content/uebungen/kabelzug-seitheben.jpg' where name = 'Kabelzug-Seitheben';
update public.exercises set image_url = 'content/uebungen/beinpresse-einbeinig.jpg' where name = 'Beinpresse einbeinig';
update public.exercises set image_url = 'content/uebungen/good-mornings-langhantel.jpg' where name = 'Good Mornings (Langhantel)';
update public.exercises set image_url = 'content/uebungen/diagonale-crunches.jpg' where name = 'Diagonale Crunches';
update public.exercises set image_url = 'content/uebungen/diamant-liegestuetz.jpg' where name = 'Diamant-Liegestütz';
update public.exercises set image_url = 'content/uebungen/archer-liegestuetz.jpg' where name = 'Archer-Liegestütz';
update public.exercises set image_url = 'content/uebungen/klappmesser-v-ups.jpg' where name = 'Klappmesser (V-Ups)';
update public.exercises set image_url = 'content/uebungen/russian-twists-gewicht.jpg' where name = 'Russian Twists (ohne Gewicht)';
update public.exercises set image_url = 'content/uebungen/beckenlift-einbeinig.jpg' where name = 'Beckenlift einbeinig';
update public.exercises set image_url = 'content/uebungen/wandsitz-wall-sit.jpg' where name = 'Wandsitz (Wall Sit)';
update public.exercises set image_url = 'content/uebungen/ausfallschritte-gehen-gewicht.jpg' where name = 'Ausfallschritte im Gehen (ohne Gewicht)';
update public.exercises set image_url = 'content/uebungen/kniebeuge-bodyweight.jpg' where name = 'Kniebeuge (Bodyweight)';
update public.exercises set image_url = 'content/uebungen/reverse-plank-unterarmstuetz-rueckwaerts.jpg' where name = 'Reverse Plank (Unterarmstütz rückwärts)';
update public.exercises set image_url = 'content/uebungen/seitstuetz-hueftheben-side-plank-hip-dips.jpg' where name = 'Seitstütz mit Hüftheben (Side Plank Hip Dips)';
update public.exercises set image_url = 'content/uebungen/beckenlift-beinheben-glute-bridge-march.jpg' where name = 'Beckenlift mit Beinheben (Glute Bridge March)';
update public.exercises set image_url = 'content/uebungen/spiderman-liegestuetz.jpg' where name = 'Spiderman-Liegestütz';
update public.exercises set image_url = 'content/uebungen/pike-push-up-schulterliegestuetz.jpg' where name = 'Pike Push-Up (Schulterliegestütz)';
update public.exercises set image_url = 'content/uebungen/klimmzug-untergriff-chin-up.jpg' where name = 'Klimmzug im Untergriff (Chin-Up)';
update public.exercises set image_url = 'content/uebungen/australische-klimmzuege-inverted-row.jpg' where name = 'Australische Klimmzüge (Inverted Row)';
update public.exercises set image_url = 'content/uebungen/step-down-exzentrisches-beintraining.jpg' where name = 'Step-Down (exzentrisches Beintraining)';
update public.exercises set image_url = 'content/uebungen/curtsy-lunge-reverenz-ausfallschritt.jpg' where name = 'Curtsy Lunge (Reverenz-Ausfallschritt)';
update public.exercises set image_url = 'content/uebungen/beinheben-liegend-lying-leg-raise.jpg' where name = 'Beinheben liegend (Lying Leg Raise)';
update public.exercises set image_url = 'content/uebungen/seitliches-beinheben-liegen.jpg' where name = 'Seitliches Beinheben im Liegen';
update public.exercises set image_url = 'content/uebungen/unterarmstuetz-schulterklopfen-plank-shoulder-taps.jpg' where name = 'Unterarmstütz mit Schulterklopfen (Plank Shoulder Taps)';
update public.exercises set image_url = 'content/uebungen/schulterkreisen.jpg' where name = 'Schulterkreisen';
update public.exercises set image_url = 'content/uebungen/nackendehnung-sitzen.jpg' where name = 'Nackendehnung im Sitzen';
update public.exercises set image_url = 'content/uebungen/brustdehnung-tuerrahmen.jpg' where name = 'Brustdehnung im Türrahmen';
update public.exercises set image_url = 'content/uebungen/latissimus-dehnung-stange.jpg' where name = 'Latissimus-Dehnung an der Stange';
update public.exercises set image_url = 'content/uebungen/hueftbeuger-dehnung-ausfallschritt.jpg' where name = 'Hüftbeuger-Dehnung im Ausfallschritt';
update public.exercises set image_url = 'content/uebungen/wadendehnung-wand.jpg' where name = 'Wadendehnung an der Wand';
update public.exercises set image_url = 'content/uebungen/schmetterlingsdehnung.jpg' where name = 'Schmetterlingsdehnung';
update public.exercises set image_url = 'content/uebungen/rumpfrotation-stehen.jpg' where name = 'Rumpfrotation im Stehen';
update public.exercises set image_url = 'content/uebungen/kindhaltung-child-s-pose.jpg' where name = 'Kindhaltung (Child''s Pose)';
update public.exercises set image_url = 'content/uebungen/thread-the-needle-dynamische-bws-rotation.jpg' where name = 'Thread the Needle (dynamische BWS-Rotation)';
update public.exercises set image_url = 'content/uebungen/hueftoeffner-kniestand.jpg' where name = 'Hüftöffner im Kniestand';
update public.exercises set image_url = 'content/uebungen/schultermobilisation-stab.jpg' where name = 'Schultermobilisation mit dem Stab';
update public.exercises set image_url = 'content/uebungen/handgelenk-mobilisation.jpg' where name = 'Handgelenk-Mobilisation';
update public.exercises set image_url = 'content/uebungen/knoechelmobilisation.jpg' where name = 'Knöchelmobilisation';
update public.exercises set image_url = 'content/uebungen/thorakale-rotation-vierfuesslerstand.jpg' where name = 'Thorakale Rotation im Vierfüßlerstand';
update public.exercises set image_url = 'content/uebungen/beinschwuenge-seitlich.jpg' where name = 'Beinschwünge seitlich';
update public.exercises set image_url = 'content/uebungen/frosch-dehnung.jpg' where name = 'Frosch-Dehnung';
update public.exercises set image_url = 'content/uebungen/kobra-dehnung.jpg' where name = 'Kobra-Dehnung';
update public.exercises set image_url = 'content/uebungen/vorbeuge-stehen.jpg' where name = 'Vorbeuge im Stehen';
update public.exercises set image_url = 'content/uebungen/grosse-armkreise.jpg' where name = 'Große Armkreise';
update public.exercises set image_url = 'content/uebungen/faszienrolle-ruecken.jpg' where name = 'Faszienrolle Rücken';
update public.exercises set image_url = 'content/uebungen/faszienrolle-oberschenkel.jpg' where name = 'Faszienrolle Oberschenkel';
update public.exercises set image_url = 'content/uebungen/assault-bike-air-bike.jpg' where name = 'Assault Bike (Air Bike)';
update public.exercises set image_url = 'content/uebungen/seilspringen-jump-rope.jpg' where name = 'Seilspringen (Jump Rope)';
update public.exercises set image_url = 'content/uebungen/schlittenschieben-sled-push.jpg' where name = 'Schlittenschieben (Sled Push)';
update public.exercises set image_url = 'content/uebungen/schlittenziehen-sled-pull.jpg' where name = 'Schlittenziehen (Sled Pull)';
update public.exercises set image_url = 'content/uebungen/tabata-intervalle-20-10-freie-uebungsauswahl.jpg' where name = 'Tabata-Intervalle (20/10, freie Übungsauswahl)';
update public.exercises set image_url = 'content/uebungen/boxen-sandsack.jpg' where name = 'Boxen am Sandsack';
update public.exercises set image_url = 'content/uebungen/skaters-seitliche-spruenge.jpg' where name = 'Skaters (seitliche Sprünge)';
update public.exercises set image_url = 'content/uebungen/squat-jumps-kniebeugenspruenge.jpg' where name = 'Squat Jumps (Kniebeugensprünge)';
update public.exercises set image_url = 'content/uebungen/tuck-jumps-streckspruenge-knieanzug.jpg' where name = 'Tuck Jumps (Strecksprünge mit Knieanzug)';
update public.exercises set image_url = 'content/uebungen/schattenboxen-shadow-boxing.jpg' where name = 'Schattenboxen (Shadow Boxing)';
update public.exercises set image_url = 'content/uebungen/treppenlaufen-reale-treppe.jpg' where name = 'Treppenlaufen (reale Treppe)';
update public.exercises set image_url = 'content/uebungen/walking-intervalle-freien.jpg' where name = 'Walking-Intervalle im Freien';
update public.exercises set image_url = 'content/uebungen/schwimmen-bahnenziehen.jpg' where name = 'Schwimmen (Bahnenziehen)';
update public.exercises set image_url = 'content/uebungen/tanz-cardio-freies-rhythmustraining.jpg' where name = 'Tanz-Cardio (freies Rhythmustraining)';
update public.exercises set image_url = 'content/uebungen/indoor-cycling-spinning-hohe-intensitaet.jpg' where name = 'Indoor Cycling / Spinning (hohe Intensität)';
update public.exercises set image_url = 'content/uebungen/medizinball-slams.jpg' where name = 'Medizinball-Slams';
update public.exercises set image_url = 'content/uebungen/rudergeraet-dauerbelastung.jpg' where name = 'Rudergerät (Dauerbelastung)';
update public.exercises set image_url = 'content/uebungen/high-knees-schnelles-kniehebellauf-stelle.jpg' where name = 'High Knees (schnelles Kniehebellauf auf der Stelle)';
update public.exercises set image_url = 'content/uebungen/plank-jacks-unterarmstuetz-beinsprung.jpg' where name = 'Plank Jacks (Unterarmstütz mit Beinsprung)';
update public.exercises set image_url = 'content/uebungen/laufband-sprintintervalle-tempowechsel.jpg' where name = 'Laufband-Sprintintervalle (Tempowechsel)';
