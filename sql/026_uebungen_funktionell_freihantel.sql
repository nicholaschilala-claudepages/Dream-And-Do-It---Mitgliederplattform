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
 'Ausführung: An der Stange im Ristgriff etwas breiter als schulterbreit hängen, Schulterblätter zuerst leicht nach unten ziehen, dann den Körper durch Zug der Rückenmuskulatur nach oben ziehen, bis das Kinn über der Stange ist, danach kontrolliert bis zum vollständig gestreckten Arm absenken. Ausrüstung: Klimmzugstange. Worauf achten: Schultern aktiv nach unten und hinten ziehen, Rumpf leicht anspannen, kein Schwungholen (Kipping) bei Kraftfokus, Bewegung im vollen Bewegungsradius bis zur Streckung ausführen.'),

('Dips am Barren', 'Brust & Trizeps',
 'Ausführung: Am Barren mit gestreckten Armen abstützen, Schultern nach unten ziehen, Oberkörper leicht nach vorn neigen, kontrolliert bis ca. 90° Ellbogenwinkel absenken, dann kraftvoll wieder hochdrücken. Ausrüstung: Dip-Barren. Worauf achten: Schultern nicht zu tief absinken lassen, um das Schultergelenk zu schonen, Ellbogen zeigen leicht nach hinten statt weit nach außen, Rumpf während der gesamten Bewegung stabil halten.'),

('Pistol Squat', 'Beine & Gesäß',
 'Ausführung: Einbeinig stehen, freies Bein gestreckt nach vorn anheben, Arme zur Balance nach vorn ausstrecken, kontrolliert so tief wie sauber möglich absenken, ohne die Balance zu verlieren, dann kraftvoll über die Ferse wieder hochdrücken. Ausrüstung: keine, optional Festhalten an einem festen Punkt zur Unterstützung oder eine Erhöhung, um die Tiefe zu reduzieren. Worauf achten: Knie zeigt durchgehend in Richtung der Fußspitze und fällt nicht nach innen, Rumpf bleibt aufrecht, bei Balanceproblemen die Tiefe reduzieren statt die Kontrolle zu verlieren.'),

('Nordic Hamstring Curl', 'Hintere Oberschenkelmuskulatur',
 'Ausführung: Im Kniestand die Füße sicher fixieren lassen (Partner oder Gerät), Oberkörper langsam und kontrolliert aus der Knie- und Hüftlinie nach vorn absenken, mit den Händen kurz vor dem Boden abfangen und zurückdrücken. Ausrüstung: Fixierung für die Füße (Partner, Nordic-Curl-Gerät oder Langhantel unter einem Möbelstück), Matte für die Knie. Worauf achten: Bewegung so lange wie möglich aktiv über die Beinrückseite abbremsen statt einfach nach vorn zu kippen, Rumpf und Hüfte bleiben durchgehend in einer Linie, bei Anfängern die Bewegungsamplitude reduzieren.'),

('Hollow Body Hold', 'Rumpf (gerade Bauchmuskulatur)',
 'Ausführung: In Rückenlage Arme über den Kopf und Beine gestreckt leicht vom Boden abheben, unteren Rücken aktiv fest gegen den Boden drücken, Position ruhig und ohne Zittern halten. Ausrüstung: Matte. Worauf achten: Unterer Rücken bleibt durchgehend am Boden, kein Hohlkreuz, gleichmäßig weiteratmen statt die Luft anzuhalten, bei Bedarf Beine höher oder Arme näher am Körper positionieren, um die Spannung zu reduzieren.'),

('L-Sit', 'Rumpf & Hüftbeuger',
 'Ausführung: Im Stütz (Boden, Barren oder Parallelen) die Schultern aktiv nach unten drücken und die Arme strecken, die gestreckten Beine waagerecht nach vorn anheben und die Position ruhig halten. Ausrüstung: Stützgriffe, Barren oder Boden. Worauf achten: Schultern durchgehend aktiv nach unten drücken, unterer Rücken nicht ins Hohlkreuz fallen lassen, bei Bedarf die Knie anwinkeln, um die Belastung zu reduzieren.'),

('Standweitsprung (Broad Jump)', 'Beine & Schnellkraft',
 'Ausführung: Aus dem hüftbreiten Stand in die Knie gehen, mit kräftigem Armschwung so weit wie kontrolliert möglich nach vorn springen, weich und kontrolliert in der Kniebeuge landen. Ausrüstung: keine, ausreichend Platz und rutschfester Boden. Worauf achten: Weiche Landung über die gesamte Fußsohle, Knie beim Absprung und bei der Landung nicht nach innen fallen lassen, erst den nächsten Sprung einleiten, wenn die Landung stabil steht.'),

('Box Jump', 'Beine & Schnellkraft',
 'Ausführung: Aus dem Stand mit kräftigem Armschwung explosiv auf eine stabile Erhöhung springen, mit beiden Füßen vollständig auf der Box landen und oben in aufrechter Position mit leicht gebeugten Knien ankommen, kontrolliert wieder herabsteigen. Ausrüstung: stabile Sprungbox oder Bank. Worauf achten: Immer herabsteigen statt herunterspringen, um die Gelenke zu schonen, Boxhöhe konservativ wählen und erst steigern, wenn die Landung sicher sitzt, Schienbein nicht an der Box anstoßen.'),

('Bärengang (Bear Crawl)', 'Ganzkörper & Rumpfstabilität',
 'Ausführung: Im Vierfüßlerstand die Knie knapp über den Boden anheben und Rumpf anspannen, dann diagonal Hand und gegenüberliegenden Fuß gleichzeitig nach vorn bewegen. Ausrüstung: keine, glatter oder gepolsterter Untergrund. Worauf achten: Hüfte bleibt ruhig und tief, kein Auf-und-Ab-Wippen, kleine kontrollierte Schritte statt große Ausfallbewegungen.'),

('Krabbengang (Crab Walk)', 'Trizeps, Gesäß & Rumpf',
 'Ausführung: Im umgekehrten Vierfüßlerstand (Bauch nach oben, Hände und Füße am Boden) die Hüfte aktiv anheben und seitwärts oder vorwärts gehen. Ausrüstung: keine. Worauf achten: Hüfte durchgehend angehoben halten, Schultern über den Handgelenken, Handgelenke bei Beschwerden entlasten, indem die Finger nach außen statt nach hinten zeigen.'),

('Inchworm', 'Ganzkörper & Mobility',
 'Ausführung: Im Stand die Hände am Boden ablegen, mit den Händen in den hohen Stütz vorlaufen, kurz stabil halten, anschließend die Füße mit möglichst gestreckten Beinen zu den Händen zurücklaufen. Ausrüstung: keine. Worauf achten: Beine möglichst gestreckt lassen, bei Verspannung der Beinrückseite die Knie leicht beugen, Bewegung langsam und kontrolliert ausführen, Rumpf im Stütz stabil halten.'),

('World''s Greatest Stretch', 'Ganzkörper-Mobilisation',
 'Ausführung: Aus dem tiefen Ausfallschritt den hinteren Fuß aktiv in den Boden drücken, den Ellbogen zum vorderen Fuß führen, anschließend Oberkörper und Arm kontrolliert nach oben rotieren, Blick folgt der Hand, danach die Seite wechseln. Ausrüstung: keine. Worauf achten: Bewegung fließend und im schmerzfreien Bereich ausführen, vorderes Knie bleibt über dem Fuß, Atmung nicht anhalten.'),

('90/90-Hüftmobilisation', 'Mobilisation Hüfte',
 'Ausführung: Im Sitz beide Beine im 90°-Winkel ablegen (ein Bein nach innen, eines nach außen rotiert), Oberkörper aufrecht und Rumpf leicht angespannt halten, kontrolliert über beide Beine hinweg die Seite wechseln. Ausrüstung: Matte. Worauf achten: Bewegung langsam und ruhig, im schmerzfreien Bereich der Hüfte bleiben, Gesäß möglichst am Boden lassen statt sich abzustützen.'),

('Tiefe Kniebeuge im Halten (Deep Squat Hold)', 'Mobilisation Hüfte, Knie & Sprunggelenk',
 'Ausführung: In die tiefstmögliche, saubere Kniebeugeposition absenken und dort entspannt verweilen, ggf. mit den Ellbogen die Knie sanft nach außen drücken. Ausrüstung: keine, optional Festhalten an einem festen Punkt zur Balance. Worauf achten: Fersen bleiben durchgehend am Boden, Rücken bleibt lang statt rund, ruhig weiteratmen und die Position so lange wie angenehm halten.'),

('Wandschieben (Wall Slides)', 'Mobilisation Schulter & oberer Rücken',
 'Ausführung: Rücken, Kopf und Unterarme im rechten Winkel gegen eine Wand pressen, Arme langsam nach oben gleiten lassen und wieder zurück, ohne den Wandkontakt an Unterarmen und Handrücken zu verlieren. Ausrüstung: Wand. Worauf achten: Unterer Rücken bleibt flach an der Wand, kein Hohlkreuz, Bewegung kommt aus dem Schulterblatt, bei Verlust des Wandkontakts die Bewegungsamplitude reduzieren.'),

-- ---------------------------------------------------------------------------
-- FREIHANTEL: KURZHANTEL / KETTLEBELL / LANGHANTEL (15)
-- ---------------------------------------------------------------------------
('Goblet Squat', 'Beine & Gesäß',
 'Ausführung: Eine Kurzhantel oder Kettlebell aufrecht mit beiden Händen vor der Brust halten, Rumpf anspannen und in die Kniebeuge absenken, bis die Ellbogen die Innenseite der Knie berühren, dann durch die Fersen wieder kraftvoll hochdrücken. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Ellbogen zwischen den Knien nach unten führen, Rücken bleibt gerade, Knie in Fußrichtung, beim Absenken einatmen und beim Hochdrücken ausatmen.'),

('Rumänisches Kreuzheben mit Kurzhanteln', 'Hintere Oberschenkelmuskulatur & Gesäß',
 'Ausführung: Kurzhanteln nah am Körper vor den Oberschenkeln halten, Hüfte bei fast gestreckten Knien und leicht angespanntem Rumpf nach hinten schieben, Hanteln eng am Bein entlang bis zur Dehnung in der Oberschenkelrückseite absenken, über die Hüftstreckung wieder aufrichten. Ausrüstung: Kurzhanteln. Worauf achten: Rücken durchgehend gerade halten, Bewegung kommt aus der Hüfte, nicht aus dem unteren Rücken, nur so tief absenken, wie der Rücken gerade bleibt.'),

('Kurzhantel-Ausfallschritte gehend (Walking Lunges)', 'Beine & Gesäß',
 'Ausführung: Mit Kurzhanteln in den herabhängenden Händen abwechselnd große Schritte nach vorn machen, hinteres Knie kontrolliert bis kurz über den Boden absenken, über die vordere Ferse wieder aufstehen und den nächsten Schritt einleiten. Ausrüstung: Kurzhanteln. Worauf achten: Vorderes Knie bleibt über dem Fuß und fällt nicht nach innen, Oberkörper bleibt aufrecht, Rumpf während des gesamten Schritts stabil halten.'),

('Renegade Row', 'Rücken, Rumpf & Bizeps',
 'Ausführung: Im hohen Liegestützstütz mit breitem, stabilem Stand auf zwei Kurzhanteln abstützen, abwechselnd eine Hantel seitlich eng am Körper zur Hüfte ziehen, Rumpf dabei fest und stabil halten. Ausrüstung: zwei Kurzhanteln. Worauf achten: Becken bleibt gerade und ruhig, kein Verdrehen des Oberkörpers beim Ziehen, Füße breiter stellen für mehr Stabilität.'),

('Kurzhantel-Thruster', 'Ganzkörper (Beine & Schultern)',
 'Ausführung: Kurzhanteln auf Schulterhöhe halten, in die Kniebeuge absenken, dann explosiv aus den Beinen aufstehen und die Hanteln im Schwung über den Kopf drücken, kontrolliert zurück in die Ausgangsposition führen. Ausrüstung: zwei Kurzhanteln. Worauf achten: Bewegung als ein fließender Ablauf aus Beinkraft und Schulterdrücken ausführen, nicht als zwei getrennte Bewegungen, Rumpf während des Überkopfdrückens stabil halten, kein Hohlkreuz.'),

('Arnold Press', 'Schultern',
 'Ausführung: Kurzhanteln vor der Brust mit Handflächen zum Körper halten, beim Hochdrücken die Hanteln gleichmäßig nach außen rotieren, bis die Handflächen oben nach vorn zeigen, dann kontrolliert in umgekehrter Reihenfolge absenken. Ausrüstung: Kurzhanteln. Worauf achten: Rotation gleichmäßig und kontrolliert ausführen, Rumpf fest, kein Hohlkreuz durch zu starkes Zurücklehnen.'),

('Zercher Squat', 'Beine, Rumpf & Rücken',
 'Ausführung: Langhantel in der Armbeuge fest vor dem Körper halten (nicht auf dem Rücken), Rumpf anspannen und in die Kniebeuge absenken, durch die Fersen wieder kraftvoll hochdrücken. Ausrüstung: Langhantel, ggf. Polsterung für die Armbeugen. Worauf achten: Oberkörper bleibt aufrechter als bei der Rückenkniebeuge, Rumpf durchgehend angespannt, Ellbogen zeigen nach unten statt seitlich wegzuklappen.'),

('Landmine Press', 'Schultern & Rumpf',
 'Ausführung: Ein Hantelstangenende in einer Ecke oder Landmine-Halterung fixieren, das andere Ende mit einer Hand vor der Schulter greifen und aus einem stabilen Stand schräg nach oben-vorn drücken, kontrolliert zurückführen. Ausrüstung: Langhantel mit Landmine-Halterung. Worauf achten: Rumpf und Beine stabil halten, Bewegung schräg nach oben-vorn statt gerade nach oben führen, Schulter nicht hochziehen.'),

('Farmer''s Walk', 'Ganzkörper & Griffkraft',
 'Ausführung: In jeder Hand eine Kurzhantel oder Kettlebell fest greifen, Rumpf anspannen und mit aufrechter Haltung in kontrolliertem Tempo gehen. Ausrüstung: zwei Kurzhanteln oder Kettlebells. Worauf achten: Schultern nach hinten-unten ziehen, aufrechter Gang ohne einseitiges Absinken der Hüfte, Gewichte bei nachlassender Haltung kontrolliert abstellen statt fallen zu lassen.'),

('Kettlebell Clean & Press', 'Ganzkörper (Hüfte & Schultern)',
 'Ausführung: Kettlebell mit Schwung aus der Hüfte in die Frontposition an der Schulter "cleanen", Handgelenk dabei locker halten, von dort über den Kopf drücken, kontrolliert zurückführen. Ausrüstung: Kettlebell. Worauf achten: Bewegung zunächst mit leichtem Gewicht sauber erlernen, Ellbogen beim Clean nah am Körper führen, Handgelenk beim Auffangen nicht überstrecken.'),

('Kettlebell Goblet Reverse Lunge', 'Beine & Gesäß',
 'Ausführung: Eine Kettlebell aufrecht vor der Brust halten, mit einem Bein einen kontrollierten Schritt nach hinten machen, hinteres Knie Richtung Boden absenken, über die vordere Ferse zurück in den Stand drücken. Ausrüstung: Kettlebell. Worauf achten: Vorderes Knie bleibt über dem Fuß, Oberkörper bleibt aufrecht, Rumpf während des gesamten Schritts stabil halten.'),

('Einarmiges Kurzhantel-Überkopfdrücken', 'Schultern & Rumpf',
 'Ausführung: Eine Kurzhantel einarmig auf Schulterhöhe halten, Rumpf fest anspannen und die Hantel kontrolliert nach oben drücken, bis der Arm fast gestreckt ist, dann kontrolliert absenken. Ausrüstung: Kurzhantel. Worauf achten: Rumpf nicht zur Gegenseite neigen lassen, Bewegung kontrolliert führen, kein Hohlkreuz im unteren Rücken.'),

('Kurzhantel-Seitbeuge', 'Seitliche Rumpfmuskulatur (Obliques)',
 'Ausführung: Eine Kurzhantel einseitig locker neben dem Körper halten, Oberkörper kontrolliert und in kleiner Amplitude zur Hantelseite absenken und wieder aufrichten. Ausrüstung: Kurzhantel. Worauf achten: Bewegung rein seitlich ausführen, kein Vor- oder Zurückbeugen des Oberkörpers, geringes Gewicht wählen und die Bewegung nicht bis zum Anschlag forcieren.'),

('Turkish Get-Up', 'Ganzkörper & Rumpfstabilität',
 'Ausführung: In Rückenlage eine Kettlebell mit durchgehend gestrecktem Arm über der Schulter halten und sich über mehrere definierte Zwischenschritte (Ellbogenstütz, Handstütz, Hüftstreckung, Ausfallschritt zum Stand) kontrolliert aufrichten, danach die Bewegung in umgekehrter Reihenfolge rückwärts ausführen. Ausrüstung: Kettlebell (leicht zum Erlernen). Worauf achten: Blick durchgehend zur Hantel, Bewegung zunächst ohne Gewicht üben, bis der Ablauf sauber sitzt, jeden Zwischenschritt kontrolliert und ohne Hektik ausführen.'),

('Sumo-Kreuzheben mit Kurzhantel', 'Beine, Gesäß & Rücken',
 'Ausführung: Breiter Stand mit nach außen gedrehten Füßen, eine Kurzhantel mittig zwischen den Beinen mit beiden Händen greifen, Rücken gerade und Brust aufrichten, dann aus der Hüfte und den Beinen kraftvoll aufrichten. Ausrüstung: eine Kurzhantel oder Kettlebell. Worauf achten: Knie zeigen durchgehend in Fußrichtung nach außen, Rücken bleibt gerade, Hantel nah am Körper führen.');
