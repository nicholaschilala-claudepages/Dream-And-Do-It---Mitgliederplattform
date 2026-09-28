-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 6: Erstbefüllung Übungsbibliothek (öffentlich, kein Handball-/Vereinsbezug)
--
-- Herkunft:
--   - 31 Kraft-/Stabilisations- und Bodyweight-Übungen: generalisiert aus
--     Nicholas' eigenem TV-Neerstedt-Konzeptdokument (Kap. 5), ohne Positions-
--     zuordnung (Rückraum/Kreis/Außen/Tor) und ohne Handball-Framing.
--   - 7 Mobilisations-/Aufwärmübungen: generalisiert aus dem dortigen
--     M.A.P.S.-Warm-up-Konzept, ohne handballspezifische Bewegungsmuster.
--   - 6 Cardio-/Zirkel-Übungen: komplett neu und eigenständig formuliert
--     (nur als grobe Inspiration durch allgemein bekannte, nicht geschützte
--     Trainingsformen – bewusst OHNE Inhalte/Formulierungen aus den beiden
--     DSSV-Dokumenten, die urheberrechtlich geschützt sind).
--
-- Vor dem Ausführen: bitte einmal durchsehen (Name/Muskelgruppe/Beschreibung).
-- Im Supabase SQL Editor ausführen, NACHDEM 001-005 bereits liefen.
-- ============================================================================

insert into public.exercises (name, muscle_group, description) values

-- ---------------------------------------------------------------------------
-- MOBILISATION & AUFWÄRMEN
-- ---------------------------------------------------------------------------
('Armkreisen mit Ausfallschritt & Rotation', 'Mobilisation Ganzkörper',
 'Ausführung: Im Ausfallschritt den Oberkörper zur vorderen Seite rotieren, Arme dabei großzügig kreisen lassen. Dauer: 2-3 Min. Ausrüstung: keine. Worauf achten: Bewegung aktiv durch den vollen Bewegungsradius führen, nicht schwungvoll "durchschlagen".'),

('Hüftkreisen & Beinpendel', 'Mobilisation Hüfte',
 'Ausführung: Im Stand die Hüfte großzügig kreisen, anschließend das Bein locker nach vorn/hinten sowie seitlich pendeln lassen. Dauer: 2 Min. Ausrüstung: keine, ggf. Festhalten an einer Wand zur Balance. Worauf achten: Kontrolliert und im schmerzfreien Bewegungsraum bleiben.'),

('Katze-Kuh-Mobilisation', 'Mobilisation Wirbelsäule',
 'Ausführung: Im Vierfüßlerstand abwechselnd den Rücken rund machen (Kuh) und ins Hohlkreuz gehen (Katze). Dauer: 1-2 Min. Ausrüstung: Matte. Worauf achten: Bewegung langsam und mit der Atmung koordinieren.'),

('Hip Bridge', 'Aktivierung Gesäß & Rumpf',
 'Ausführung: In Rückenlage die Hüfte anheben, bis Schultern-Hüfte-Knie eine Linie bilden, kurz halten, kontrolliert absenken. Sätze/Wdh.: 2-3 x 15-20. Ausrüstung: Matte. Worauf achten: Gesäß aktiv anspannen, kein Hohlkreuz im unteren Rücken.'),

('Bird Dog', 'Aktivierung Rumpf & Rücken',
 'Ausführung: Im Vierfüßlerstand gegenüberliegenden Arm und Bein gleichzeitig strecken, kurz halten, kontrolliert zurückführen. Sätze/Wdh.: 2-3 x 10 je Seite. Ausrüstung: Matte. Worauf achten: Becken bleibt ruhig und gerade, keine Ausweichbewegung im Rumpf.'),

('Skipping & Kniehebelauf', 'Aktivierung Herz-Kreislauf & Beine',
 'Ausführung: Lockeres Skipping (kurze, schnelle Schritte) im Wechsel mit Kniehebelauf auf der Stelle oder über kurze Distanz. Dauer: 2-3 Min. Ausrüstung: keine. Worauf achten: Aufrechte Körperhaltung, aktiver Armeinsatz.'),

('Jumping Jacks', 'Aktivierung Ganzkörper',
 'Ausführung: Im Sprung Beine seitlich öffnen und Arme über Kopf führen, im nächsten Sprung zurück in die Ausgangsposition. Sätze/Wdh.: 3 x 20 oder 1-2 Min. am Stück. Ausrüstung: keine. Worauf achten: Weiche Landung über den Fußballen, gleichmäßiger Rhythmus.'),

-- ---------------------------------------------------------------------------
-- KRAFT & STABILISATION (Studio/Gerätetraining)
-- ---------------------------------------------------------------------------
('BWS-Rotation mit Medizinball', 'Rumpf & Rotation',
 'Ausführung: Im Stand oder Kniestand den Medizinball unter Rumpfspannung seitlich am Körper vorbeiführen. Sätze/Wdh.: 3-5 x 10-15 je Seite. Ausrüstung: Medizinball oder Gymnastikball. Worauf achten: Core-Spannung halten, Rotation kontrolliert ausführen, Wirbelsäule stabil.'),

('Ausfallschritt mit explosivem Ausstoßen', 'Ganzkörper & Schnellkraft',
 'Ausführung: Aus dem Ausfallschritt heraus explosiv nach oben/vorn abdrücken, mit Gewicht in den Händen. Sätze/Wdh.: 3-5 x 10-15 je Seite. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Explosiver Antritt, Rumpf fest, weiche Landung.'),

('Standwaage auf instabiler Unterlage', 'Rumpf, Gesäß & Balance',
 'Ausführung: Einbeinig auf Balance-Pad oder Matte stehen, Oberkörper nach vorn absenken, Standbein leicht gebeugt. Sätze/Wdh.: 3-5 x 15-20 Sek. je Seite. Ausrüstung: Balance-Pad oder Matte. Worauf achten: Blick nach unten-vorn, Rumpf und Gesäß fest, Oberkörper und Spielbein bilden eine gerade Linie.'),

('Kreuzheben', 'Beine & untere Rückenkette',
 'Ausführung: Langhantel mit geradem Rücken vom Boden aufnehmen, Hüfte und Knie strecken sich gleichzeitig. Sätze/Wdh.: 3-5 x 10-15. Ausrüstung: Langhantel. Worauf achten: Rücken lang und gerade, Rumpf fest, Stange nah am Körper führen.'),

('Aufrechtes Rudern (Langhantel)', 'Schultern & oberer Rücken',
 'Ausführung: Langhantel eng am Körper bis auf Brusthöhe hochziehen. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Ellbogen führen die Bewegung nach außen/oben.'),

('Seitliches Gleiten im Ausfallschritt', 'Beine',
 'Ausführung: Auf einem rutschigen Tuch oder Slider seitlich in den Ausfallschritt gleiten und wieder zurückziehen. Sätze/Wdh.: 3-5 x 15-20 je Seite. Ausrüstung: Slider oder glattes Tuch. Worauf achten: Rumpf fest, kontrolliert gleiten, über die Ferse abdrücken.'),

('Latzug frontal', 'Rücken',
 'Ausführung: Stange am Latzug-Gerät zur oberen Brust herunterziehen. Sätze/Wdh.: 4-5 x 10-15. Ausrüstung: Latzug-Gerät. Worauf achten: Oberkörper leicht nach hinten geneigt, Rumpf fest, Ellbogen nach unten/hinten führen.'),

('Seitstütz mit Hüftbeuger-Anzug', 'Rumpf',
 'Ausführung: Im Seitstütz das obere Knie kontrolliert zur Brust ziehen und wieder strecken. Sätze/Wdh.: 3-5 x 15-20 je Seite. Ausrüstung: keine. Worauf achten: Gerade Linie halten, Hüfte stabil, Knie aktiv zur Brust führen.'),

('Wirbelsäulen-Rotation am Seilzug', 'Rumpf & Rotation',
 'Ausführung: Am Kabelzug stehend den Zug unter Rumpfrotation von einer Seite zur anderen führen. Sätze/Wdh.: 3-5 x 10-15 je Seite. Ausrüstung: Kabelzug. Worauf achten: Becken stabil halten, Rotation bewusst aus Brust- und Bauchmuskulatur einleiten.'),

('Seitlicher Ausfallschritt (stehend)', 'Beine',
 'Ausführung: Aus dem Stand großen Schritt zur Seite, Gewicht auf das gebeugte Bein verlagern, zurückdrücken. Sätze/Wdh.: 3-5 x 15-20 je Seite. Ausrüstung: keine oder Slider. Worauf achten: Rumpf fest, kontrollierte Bewegung, über die Ferse abdrücken.'),

('Kniebeuge (Langhantel)', 'Beine',
 'Ausführung: Langhantel im Nacken oder auf den Schultern, in die Hocke gehen bis Oberschenkel etwa parallel zum Boden, wieder aufstehen. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel. Worauf achten: Blick nach vorn-unten, Rumpf fest, Knie in Fußrichtung.'),

('BWS-Extension mit Ruderzug (instabil)', 'Rücken & Rumpfstabilität',
 'Ausführung: Auf instabiler Unterlage stehend die Brustwirbelsäule überstrecken, dann Ellbogen eng am Körper zurückziehen. Sätze/Wdh.: 3-5 x 15-20. Ausrüstung: Balance-Pad, Kabelzug oder Expander. Worauf achten: Balance während der gesamten Bewegung halten.'),

('Schulterdrücken (Langhantel, stehend)', 'Schultern',
 'Ausführung: Langhantel von Schulterhöhe kontrolliert über Kopf drücken. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel. Worauf achten: Rumpf und Gesäß fest, kein Hohlkreuz im unteren Rücken.'),

('Bulgarian Split Squat (Langhantel)', 'Beine (einbeinig)',
 'Ausführung: Hinteren Fuß erhöht auf einer Bank ablegen, mit dem vorderen Bein kontrolliert in die Kniebeuge gehen. Sätze/Wdh.: 3-4 x 12-15 je Bein. Ausrüstung: Langhantel, Bank. Worauf achten: Oberkörper aufrecht, Blick geradeaus, kontrollierte Tiefe.'),

('Unterarmstütz (Plank)', 'Rumpf',
 'Ausführung: Auf Unterarmen und Zehenspitzen abstützen, Körper bildet eine gerade Linie. Sätze/Wdh.: 3-5 x bis zum Formverlust. Ausrüstung: keine. Worauf achten: Gerade Linie Schulter bis Ferse, kein Hohlkreuz oder Durchhängen.'),

('Unterarmstütz auf dem Gymnastikball', 'Rumpf (fortgeschritten)',
 'Ausführung: Unterarme auf dem Gymnastikball ablegen und die Stützposition halten. Sätze/Wdh.: 3-5 x bis zum Formverlust. Ausrüstung: Gymnastikball. Worauf achten: Die instabile Unterlage aktiv über Rumpfspannung ausgleichen.'),

('Bankdrücken (Flachbank)', 'Brust & Trizeps',
 'Ausführung: Langhantel auf der Flachbank kontrolliert zur Brust absenken und zurückdrücken. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel, Bank. Worauf achten: Schulterblätter zurückziehen, Ellbogen ca. 45°, kontrolliert ablassen.'),

('Beckenlift mit Beinbeuge am Ball', 'Gesäß & Beinrückseite',
 'Ausführung: Fersen auf dem Gymnastikball, Hüfte anheben und den Ball anschließend kontrolliert zum Gesäß heranziehen. Sätze/Wdh.: 3 x 15-20. Ausrüstung: Gymnastikball. Worauf achten: Hüfte oben halten, Ball kontrolliert führen, Rumpf fest.'),

('Schrägbankdrücken', 'Brust (oberer Anteil)',
 'Ausführung: Langhantel oder Kurzhanteln auf der Schrägbank (30-45°) kontrolliert absenken und drücken. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel/Kurzhanteln, Schrägbank. Worauf achten: Schulterblätter fixiert, kontrollierte Bewegungsführung.'),

('Vorgebeugtes Rudern (Langhantel)', 'Rücken',
 'Ausführung: Mit vorgebeugtem Oberkörper die Langhantel zum Bauch heranziehen. Sätze/Wdh.: 4-5 x 6-12. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Rücken gerade, Ellbogen eng am Körper führen.'),

('Trizepsstrecken am Seil (über Kopf)', 'Trizeps',
 'Ausführung: Seilzug hinter dem Kopf halten, Unterarme im Ellbogengelenk nach oben strecken. Sätze/Wdh.: 3 x 6-12. Ausrüstung: Kabelzug, Seil. Worauf achten: Oberarme eng am Kopf fixiert, Bewegung nur im Ellbogengelenk.'),

('Bizepscurls (Langhantel)', 'Bizeps',
 'Ausführung: Langhantel kontrolliert vom gestreckten Arm zur Schulter hochcurlen. Sätze/Wdh.: 3 x 6-12. Ausrüstung: Langhantel. Worauf achten: Ellbogen am Körper fixiert, kein Schwungholen.'),

-- ---------------------------------------------------------------------------
-- OHNE GERÄTE (Bodyweight-Alternativen)
-- ---------------------------------------------------------------------------
('Bulgarian Split Squat (Bodyweight)', 'Beine (einbeinig)',
 'Ausführung: Wie die Gerätevariante, ohne Zusatzgewicht. Sätze/Wdh.: 3-4 x 15 je Bein. Ausrüstung: keine, Bank oder Stufe. Worauf achten: Oberkörper aufrecht, kontrollierte Tiefe.'),

('Liegestütz-Varianten', 'Brust & Trizeps',
 'Ausführung: Klassischer Liegestütz, alternativ mit Medizinball unter einer Hand oder mit Zusammendrücken eines Balls zwischen den Händen für zusätzliche Rumpf-/Brustspannung. Sätze/Wdh.: 3-4 x 15. Ausrüstung: keine, optional Medizinball. Worauf achten: Körper bildet eine gerade Linie, Rumpf fest.'),

('Good Mornings (Bodyweight)', 'Beinrückseite & unterer Rücken',
 'Ausführung: Aus dem Stand den Oberkörper mit geradem Rücken und leicht gebeugten Knien nach vorn absenken, dann aufrichten. Sätze/Wdh.: 3-4 x 15. Ausrüstung: keine. Worauf achten: Rücken durchgehend gerade, Bewegung kommt aus der Hüfte.'),

('Superman', 'Rücken & Rumpf',
 'Ausführung: In Bauchlage Arme und Beine gleichzeitig leicht vom Boden abheben und kurz halten. Sätze/Wdh.: 3-4 x 60 Sek. (haltend oder in Wiederholungen). Ausrüstung: Matte. Worauf achten: Bewegung kommt aus dem Rücken, kein Überstrecken des Nackens.'),

('Schulterkreisen mit Wasserflaschen', 'Schultern',
 'Ausführung: Mit gefüllten Wasserflaschen in beiden Händen die Arme seitlich kreisen lassen. Sätze/Wdh.: 3 x 15 je Richtung. Ausrüstung: Wasserflaschen oder leichte Kurzhanteln. Worauf achten: Kontrollierte, nicht zu große Kreisbewegung.'),

('Plyo-Ausfallschritte', 'Beine & Schnellkraft',
 'Ausführung: Im Wechsel aus dem Ausfallschritt hochspringen und beidseitig abwechseln. Sätze/Wdh.: 3 x 10 je Seite. Ausrüstung: keine. Worauf achten: Weiche Landung, Rumpf während des Sprungs stabil.'),

('Unterarmstütz-Varianten auf dem Ball', 'Rumpf',
 'Ausführung: Wie die Gerätevariante mit dem Gymnastikball, ggf. mit leichtem Vor- und Zurückrollen. Sätze/Wdh.: 3-5 x bis zum Formverlust. Ausrüstung: Gymnastikball. Worauf achten: Rumpfspannung durchgehend halten.'),

('Standwaage (ohne Zusatzgerät)', 'Balance & Rumpf',
 'Ausführung: Einbeinig stehen, Oberkörper nach vorn absenken, freies Bein nach hinten strecken. Sätze/Wdh.: 3 x 20-30 Sek. je Seite. Ausrüstung: keine. Worauf achten: Ruhiger Stand, Rumpf aktiv stabilisieren.'),

('HIIT-Zirkel (freie Übungsauswahl)', 'Cardio & Ganzkörper',
 'Ausführung: 4-6 Runden im Wechsel aus 60 Sekunden Belastung (z. B. Kniebeugen, Liegestütz, Ausfallschritte) und 30 Sekunden Pause. Ausrüstung: keine. Worauf achten: Saubere Ausführung geht vor Tempo, auch unter Ermüdung.'),

-- ---------------------------------------------------------------------------
-- CARDIO & ZIRKELTRAINING (eigenständig neu formuliert)
-- ---------------------------------------------------------------------------
('Kettlebell Swings', 'Ganzkörper & Cardio-Kraft',
 'Ausführung: Kettlebell mit gestreckten Armen aus der Hüftstreckung nach vorn-oben schwingen lassen, Schwung kommt aus der Hüfte, nicht aus den Armen. Sätze/Wdh.: 3-4 x 12-15. Ausrüstung: Kettlebell. Worauf achten: Rücken neutral, Bewegung aus der Hüfte, nicht aus dem unteren Rücken.'),

('Step-Ups', 'Beine & Cardio',
 'Ausführung: Auf eine Erhöhung (Kasten, Bank oder Treppenstufe) steigen und kontrolliert wieder heruntersteigen. Sätze/Wdh.: 3 x 12-15 je Bein. Ausrüstung: Kasten oder stabile Erhöhung. Worauf achten: Ganze Fußsohle aufsetzen, Knie in Fußrichtung.'),

('Ruder-Intervalle', 'Cardio & Ganzkörper',
 'Ausführung: Am Rudergerät im Wechsel zügige Intervalle und aktive Erholung rudern. Sätze/Wdh.: 6-8 x 250-500 m zügig, 60-90 Sek. lockeres Rudern dazwischen. Ausrüstung: Rudergerät. Worauf achten: Saubere Zugreihenfolge Beine-Rücken-Arme, Rücken während des Zugs neutral.'),

('Battle Ropes', 'Cardio & Oberkörper',
 'Ausführung: In leichter Kniebeuge-Position beide Seile abwechselnd oder gleichzeitig wellenförmig auf- und abbewegen. Sätze/Wdh.: 6-8 x 20-30 Sek. Belastung, 30-40 Sek. Pause. Ausrüstung: Battle Ropes. Worauf achten: Rumpf stabil, Bewegung kommt aus Schultern und Armen.'),

('Mountain Climbers', 'Cardio & Rumpf',
 'Ausführung: Aus der Liegestütz-Position die Knie zügig abwechselnd zur Brust ziehen. Sätze/Wdh.: 3-4 x 30-40 Sek. Ausrüstung: keine. Worauf achten: Hüfte tief halten, Rumpf während des gesamten Tempos stabil.'),

('Burpees', 'Ganzkörper & Cardio',
 'Ausführung: Aus dem Stand in die Liegestütz-Position abspringen, einen Liegestütz ausführen, wieder aufspringen mit Strecksprung. Sätze/Wdh.: 3-4 x 8-12. Ausrüstung: keine. Worauf achten: Kontrollierte Landung, Rumpf während der Liegestützphase stabil halten.');
