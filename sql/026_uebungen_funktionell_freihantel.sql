-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 30 weitere Übungen: funktionelles Training (Bodyweight & Mobility) sowie
-- Freihantel-Bereich (Kurzhantel/Kettlebell/Langhantel).
-- Nutzer-Feedback nach Etappe 19.
--
-- Alle Übungen sind eigenständig formuliert, allgemein bekannte, nicht
-- geschützte Trainingsformen (Klimmzug, Kniebeuge, Kreuzheben-Varianten
-- usw.) — analog zur bestehenden Übungsbibliothek (siehe sql/006, sql/013).
-- Kein Bild beim Anlegen (image_url bleibt leer) — Bildergänzung erfolgt wie
-- gewohnt über eine separate Migration mit den fertigen Bild-URLs, sobald
-- die Bilder erstellt sind (siehe dazu die begleitende Bild-Prompt-Liste).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-025 bereits liefen.
-- ============================================================================

insert into public.exercises (name, muscle_group, description) values

-- ---------------------------------------------------------------------------
-- FUNKTIONELL: BODYWEIGHT & MOBILITY (15)
-- ---------------------------------------------------------------------------
('Klimmzug (Pull-Up)', 'Rücken & Bizeps',
 'Ausführung: An der Stange im Ristgriff hängen, Körper durch Zug der Rückenmuskulatur nach oben ziehen, bis das Kinn über der Stange ist, kontrolliert absenken. Sätze/Wdh.: 3-4 x so viele wie sauber möglich. Ausrüstung: Klimmzugstange. Worauf achten: Schultern aktiv nach unten ziehen, kein Schwungholen (Kipping) bei Kraftfokus.'),

('Dips am Barren', 'Brust & Trizeps',
 'Ausführung: Am Barren mit gestreckten Armen abstützen, Oberkörper leicht nach vorn neigen, kontrolliert bis ca. 90° Ellbogenwinkel absenken, wieder hochdrücken. Sätze/Wdh.: 3 x 8-12. Ausrüstung: Dip-Barren. Worauf achten: Schultern nicht zu tief absinken lassen, um das Schultergelenk zu schonen.'),

('Pistol Squat', 'Beine & Gesäß',
 'Ausführung: Einbeinige Kniebeuge, freies Bein nach vorn gestreckt, kontrolliert so tief wie möglich absenken, ohne die Balance zu verlieren, wieder hochdrücken. Sätze/Wdh.: 3 x 5-8 je Seite. Ausrüstung: keine, optional Festhalten an einem festen Punkt zur Unterstützung. Worauf achten: Knie zeigt in Richtung der Fußspitze, Rumpf bleibt aufrecht.'),

('Nordic Hamstring Curl', 'Hintere Oberschenkelmuskulatur',
 'Ausführung: Im Kniestand die Füße fixieren lassen (Partner oder Gerät), Oberkörper langsam und kontrolliert nach vorn absenken, mit den Händen kurz vor dem Boden abfangen. Sätze/Wdh.: 3 x 4-8. Ausrüstung: Fixierung für die Füße (Partner, Nordic-Curl-Gerät oder Langhantel unter einem Möbelstück). Worauf achten: Bewegung so langsam wie möglich abbremsen, Rumpf und Hüfte bleiben in einer Linie.'),

('Hollow Body Hold', 'Rumpf (gerade Bauchmuskulatur)',
 'Ausführung: In Rückenlage Arme und Beine leicht anheben, unteren Rücken fest gegen den Boden drücken, Position halten. Dauer: 3 x 20-40 Sek. Ausrüstung: Matte. Worauf achten: Unterer Rücken bleibt durchgehend am Boden, kein Hohlkreuz.'),

('L-Sit', 'Rumpf & Hüftbeuger',
 'Ausführung: Im Stütz (Boden, Barren oder Parallelen) die gestreckten Beine waagerecht nach vorn anheben und die Position halten. Dauer: 3-4 x 10-20 Sek. Ausrüstung: Stützgriffe, Barren oder Boden. Worauf achten: Schultern aktiv nach unten drücken, unterer Rücken nicht ins Hohlkreuz fallen lassen.'),

('Standweitsprung (Broad Jump)', 'Beine & Schnellkraft',
 'Ausführung: Aus dem Stand mit Armschwung so weit wie möglich nach vorn springen, weich und kontrolliert in der Kniebeuge landen. Sätze/Wdh.: 4-5 x 3-5. Ausrüstung: keine, ausreichend Platz und rutschfester Boden. Worauf achten: Weiche Landung über die gesamte Fußsohle, Knie beim Absprung nicht nach innen fallen lassen.'),

('Box Jump', 'Beine & Schnellkraft',
 'Ausführung: Aus dem Stand mit Armschwung explosiv auf eine stabile Erhöhung springen, oben in aufrechter Position ankommen, kontrolliert wieder herabsteigen. Sätze/Wdh.: 4-5 x 3-6. Ausrüstung: stabile Sprungbox oder Bank. Worauf achten: Immer herabsteigen statt herunterspringen, um die Gelenke zu schonen; Boxhöhe konservativ wählen.'),

('Bärengang (Bear Crawl)', 'Ganzkörper & Rumpfstabilität',
 'Ausführung: Im Vierfüßlerstand mit angehobenen Knien diagonal Hand und gegenüberliegenden Fuß gleichzeitig nach vorn bewegen. Strecke/Dauer: 3-4 x 10-15 m. Ausrüstung: keine. Worauf achten: Hüfte bleibt ruhig und tief, kein Auf-und-Ab-Wippen.'),

('Krabbengang (Crab Walk)', 'Trizeps, Gesäß & Rumpf',
 'Ausführung: Im umgekehrten Vierfüßlerstand (Bauch nach oben, Hände und Füße am Boden) seitwärts oder vorwärts gehen, Hüfte dabei angehoben halten. Strecke/Dauer: 3 x 8-10 m. Ausrüstung: keine. Worauf achten: Hüfte durchgehend angehoben halten, Schultern über den Handgelenken.'),

('Inchworm', 'Ganzkörper & Mobility',
 'Ausführung: Im Stand die Hände am Boden ablegen, in den Unterarmstütz vorlaufen, kurz halten, anschließend die Füße zu den Händen zurücklaufen. Sätze/Wdh.: 3 x 6-8. Ausrüstung: keine. Worauf achten: Beine möglichst gestreckt lassen, Bewegung langsam und kontrolliert ausführen.'),

('World''s Greatest Stretch', 'Ganzkörper-Mobilisation',
 'Ausführung: Aus dem tiefen Ausfallschritt den Ellbogen zum vorderen Fuß führen, anschließend Oberkörper und Arm nach oben rotieren, danach die Seite wechseln. Sätze/Wdh.: 2-3 x 5-6 je Seite. Ausrüstung: keine. Worauf achten: Bewegung fließend und im schmerzfreien Bereich ausführen, Atmung nicht anhalten.'),

('90/90-Hüftmobilisation', 'Mobilisation Hüfte',
 'Ausführung: Im Sitz beide Beine im 90°-Winkel ablegen (ein Bein nach innen, eines nach außen rotiert), Oberkörper aufrecht halten und über beide Beine hinweg die Seite wechseln. Dauer: 2-3 Min. Ausrüstung: Matte. Worauf achten: Bewegung langsam, im schmerzfreien Bereich der Hüfte bleiben.'),

('Tiefe Kniebeuge im Halten (Deep Squat Hold)', 'Mobilisation Hüfte, Knie & Sprunggelenk',
 'Ausführung: In die tiefstmögliche, saubere Kniebeugeposition absenken und dort für längere Zeit entspannt verweilen, ggf. mit den Ellbogen die Knie sanft nach außen drücken. Dauer: 3 x 30-60 Sek. Ausrüstung: keine, optional Festhalten an einem festen Punkt zur Balance. Worauf achten: Fersen bleiben am Boden, Rücken bleibt lang.'),

('Wandschieben (Wall Slides)', 'Mobilisation Schulter & oberer Rücken',
 'Ausführung: Rücken, Kopf und Arme im rechten Winkel gegen eine Wand pressen, Arme langsam nach oben gleiten lassen und wieder zurück, ohne den Wandkontakt zu verlieren. Sätze/Wdh.: 2-3 x 10-12. Ausrüstung: Wand. Worauf achten: Unterer Rücken bleibt an der Wand, Bewegung kommt aus dem Schulterblatt.'),

-- ---------------------------------------------------------------------------
-- FREIHANTEL: KURZHANTEL / KETTLEBELL / LANGHANTEL (15)
-- ---------------------------------------------------------------------------
('Goblet Squat', 'Beine & Gesäß',
 'Ausführung: Eine Kurzhantel oder Kettlebell mit beiden Händen vor der Brust halten, in die Kniebeuge absenken, durch die Fersen wieder hochdrücken. Sätze/Wdh.: 3-4 x 10-12. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Ellbogen zwischen den Knien nach unten führen, Rücken bleibt gerade.'),

('Rumänisches Kreuzheben mit Kurzhanteln', 'Hintere Oberschenkelmuskulatur & Gesäß',
 'Ausführung: Kurzhanteln vor den Oberschenkeln halten, Hüfte bei fast gestreckten Knien nach hinten schieben, Hanteln nah am Bein entlang absenken, über die Hüftstreckung wieder aufrichten. Sätze/Wdh.: 3-4 x 10-12. Ausrüstung: Kurzhanteln. Worauf achten: Rücken durchgehend gerade, Bewegung kommt aus der Hüfte, nicht aus dem unteren Rücken.'),

('Kurzhantel-Ausfallschritte gehend (Walking Lunges)', 'Beine & Gesäß',
 'Ausführung: Mit Kurzhanteln in den Händen abwechselnd große Schritte nach vorn machen, hinteres Knie kontrolliert Richtung Boden absenken, aufstehen und den nächsten Schritt einleiten. Sätze/Wdh.: 3 x 10-12 je Seite. Ausrüstung: Kurzhanteln. Worauf achten: Vorderes Knie bleibt über dem Fuß, Oberkörper bleibt aufrecht.'),

('Renegade Row', 'Rücken, Rumpf & Bizeps',
 'Ausführung: Im hohen Unterarm-/Liegestützstütz auf zwei Kurzhanteln abstützen, abwechselnd eine Hantel seitlich zur Hüfte ziehen, Rumpf dabei stabil halten. Sätze/Wdh.: 3 x 8-10 je Seite. Ausrüstung: zwei Kurzhanteln. Worauf achten: Becken bleibt gerade, kein Verdrehen des Oberkörpers beim Ziehen.'),

('Kurzhantel-Thruster', 'Ganzkörper (Beine & Schultern)',
 'Ausführung: Aus der Kniebeuge mit Kurzhanteln auf Schulterhöhe explosiv aufstehen und die Hanteln im Schwung über den Kopf drücken, kontrolliert zurück in die Ausgangsposition. Sätze/Wdh.: 3-4 x 8-12. Ausrüstung: zwei Kurzhanteln. Worauf achten: Bewegung als ein fließender Ablauf aus Beinkraft und Schulterdrücken ausführen, nicht als zwei getrennte Bewegungen.'),

('Arnold Press', 'Schultern',
 'Ausführung: Kurzhanteln vor der Brust mit Handflächen zum Körper halten, beim Hochdrücken die Hanteln nach außen rotieren, bis die Handflächen oben nach vorn zeigen. Sätze/Wdh.: 3 x 10-12. Ausrüstung: Kurzhanteln. Worauf achten: Rotation gleichmäßig und kontrolliert ausführen, kein Hohlkreuz durch zu starkes Zurücklehnen.'),

('Zercher Squat', 'Beine, Rumpf & Rücken',
 'Ausführung: Langhantel in der Armbeuge vor dem Körper halten (nicht auf dem Rücken), in die Kniebeuge absenken, durch die Fersen wieder hochdrücken. Sätze/Wdh.: 3 x 6-10. Ausrüstung: Langhantel, ggf. Polsterung für die Armbeugen. Worauf achten: Oberkörper bleibt aufrechter als bei der Rückenkniebeuge, Rumpf durchgehend angespannt.'),

('Landmine Press', 'Schultern & Rumpf',
 'Ausführung: Ein Hantelstangenende in einer Ecke oder Landmine-Halterung fixieren, das andere Ende mit einer Hand vor der Schulter halten und schräg nach oben drücken. Sätze/Wdh.: 3 x 8-10 je Seite. Ausrüstung: Langhantel mit Landmine-Halterung. Worauf achten: Rumpf stabil halten, Bewegung schräg nach oben-vorn statt gerade nach oben führen.'),

('Farmer''s Walk', 'Ganzkörper & Griffkraft',
 'Ausführung: In jeder Hand eine schwere Kurzhantel oder Kettlebell halten und mit aufrechter Haltung eine festgelegte Strecke gehen. Strecke/Dauer: 3-4 x 20-30 m. Ausrüstung: zwei Kurzhanteln oder Kettlebells. Worauf achten: Schultern nach hinten-unten ziehen, aufrechter Gang ohne einseitiges Absinken.'),

('Kettlebell Clean & Press', 'Ganzkörper (Hüfte & Schultern)',
 'Ausführung: Kettlebell mit Schwung aus der Hüfte in die Frontposition an der Schulter "cleanen", von dort über den Kopf drücken, kontrolliert zurückführen. Sätze/Wdh.: 3 x 6-8 je Seite. Ausrüstung: Kettlebell. Worauf achten: Bewegung zunächst mit leichtem Gewicht sauber erlernen, Ellbogen beim Clean nah am Körper führen.'),

('Kettlebell Goblet Reverse Lunge', 'Beine & Gesäß',
 'Ausführung: Eine Kettlebell vor der Brust halten, mit einem Bein einen Schritt nach hinten machen, hinteres Knie Richtung Boden absenken, zurück in den Stand drücken. Sätze/Wdh.: 3 x 10 je Seite. Ausrüstung: Kettlebell. Worauf achten: Vorderes Knie bleibt über dem Fuß, Oberkörper bleibt aufrecht.'),

('Einarmiges Kurzhantel-Überkopfdrücken', 'Schultern & Rumpf',
 'Ausführung: Eine Kurzhantel einarmig auf Schulterhöhe halten und nach oben drücken, Rumpf dabei gegen das einseitige Gewicht stabil halten. Sätze/Wdh.: 3 x 8-10 je Seite. Ausrüstung: Kurzhantel. Worauf achten: Rumpf nicht zur Gegenseite neigen lassen, Bewegung kontrolliert führen.'),

('Kurzhantel-Seitbeuge', 'Seitliche Rumpfmuskulatur (Obliques)',
 'Ausführung: Eine Kurzhantel einseitig neben dem Körper halten, Oberkörper kontrolliert zur Hantelseite absenken und wieder aufrichten. Sätze/Wdh.: 3 x 12-15 je Seite. Ausrüstung: Kurzhantel. Worauf achten: Bewegung rein seitlich ausführen, kein Vor- oder Zurückbeugen des Oberkörpers.'),

('Turkish Get-Up', 'Ganzkörper & Rumpfstabilität',
 'Ausführung: In Rückenlage eine Kettlebell mit gestrecktem Arm über der Schulter halten und sich über mehrere definierte Zwischenschritte kontrolliert bis zum Stand aufrichten, danach die Bewegung rückwärts ausführen. Sätze/Wdh.: 3 x 3-5 je Seite. Ausrüstung: Kettlebell (leicht zum Erlernen). Worauf achten: Blick zur Hantel, Bewegung zunächst ohne Gewicht üben, bis der Ablauf sauber sitzt.'),

('Sumo-Kreuzheben mit Kurzhantel', 'Beine, Gesäß & Rücken',
 'Ausführung: Breiter Stand mit nach außen gedrehten Füßen, eine Kurzhantel mittig zwischen den Beinen mit beiden Händen greifen, aus der Hüfte und den Beinen aufrichten. Sätze/Wdh.: 3-4 x 10-12. Ausrüstung: eine Kurzhantel oder Kettlebell. Worauf achten: Knie zeigen in Fußrichtung nach außen, Rücken bleibt durchgehend gerade.');
