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
 'Ausführung: Im tiefen Ausfallschritt mit aufrechtem Oberkörper stehen, den Oberkörper kontrolliert zur vorderen Seite rotieren, Arme dabei großzügig kreisen lassen. Ausrüstung: keine. Worauf achten: Bewegung aktiv durch den vollen Bewegungsradius führen, nicht schwungvoll "durchschlagen", vorderes Knie bleibt über dem Fuß.'),

('Hüftkreisen & Beinpendel', 'Mobilisation Hüfte',
 'Ausführung: Im hüftbreiten Stand die Hüfte großzügig und langsam kreisen, anschließend das Bein locker nach vorn/hinten sowie seitlich pendeln lassen. Ausrüstung: keine, ggf. Festhalten an einer Wand zur Balance. Worauf achten: Kontrolliert und im schmerzfreien Bewegungsraum bleiben, Oberkörper dabei ruhig und aufrecht halten.'),

('Katze-Kuh-Mobilisation', 'Mobilisation Wirbelsäule',
 'Ausführung: Im Vierfüßlerstand mit Händen unter den Schultern und Knien unter der Hüfte abwechselnd den Rücken rund machen (Kuh) und sanft ins Hohlkreuz gehen (Katze). Ausrüstung: Matte. Worauf achten: Bewegung langsam und mit der Atmung koordinieren (Ausatmen beim Runden, Einatmen beim Strecken), nur im schmerzfreien Bereich bewegen.'),

('Hip Bridge', 'Aktivierung Gesäß & Rumpf',
 'Ausführung: In Rückenlage mit aufgestellten Füßen hüftbreit die Hüfte kontrolliert anheben, bis Schultern-Hüfte-Knie eine Linie bilden, kurz halten, kontrolliert absenken. Ausrüstung: Matte. Worauf achten: Gesäß aktiv anspannen, kein Hohlkreuz im unteren Rücken, Knie fallen nicht nach außen oder innen.'),

('Bird Dog', 'Aktivierung Rumpf & Rücken',
 'Ausführung: Im Vierfüßlerstand mit angespanntem Rumpf gegenüberliegenden Arm und Bein gleichzeitig strecken, kurz halten, kontrolliert zurückführen, Seite wechseln. Ausrüstung: Matte. Worauf achten: Becken bleibt ruhig und gerade, keine Ausweichbewegung im Rumpf, Bewegung langsam statt mit Schwung ausführen.'),

('Skipping & Kniehebelauf', 'Aktivierung Herz-Kreislauf & Beine',
 'Ausführung: Lockeres Skipping (kurze, schnelle Schritte) im Wechsel mit Kniehebelauf auf der Stelle oder über kurze Distanz ausführen. Ausrüstung: keine. Worauf achten: Aufrechte Körperhaltung, aktiver Armeinsatz, weiche Landung über den Fußballen.'),

('Jumping Jacks', 'Aktivierung Ganzkörper',
 'Ausführung: Im Sprung die Beine seitlich öffnen und die Arme über Kopf führen, im nächsten Sprung zurück in die Ausgangsposition. Ausrüstung: keine. Worauf achten: Weiche Landung über den Fußballen, gleichmäßiger Rhythmus, Knie beim Landen leicht gebeugt.'),

-- ---------------------------------------------------------------------------
-- KRAFT & STABILISATION (Studio/Gerätetraining)
-- ---------------------------------------------------------------------------
('BWS-Rotation mit Medizinball', 'Rumpf & Rotation',
 'Ausführung: Im Stand oder Kniestand mit angespanntem Rumpf den Medizinball kontrolliert seitlich am Körper vorbeiführen, Blick folgt dem Ball. Ausrüstung: Medizinball oder Gymnastikball. Worauf achten: Core-Spannung durchgehend halten, Rotation kontrolliert statt mit Schwung ausführen, Wirbelsäule stabil und aufrecht.'),

('Ausfallschritt mit explosivem Ausstoßen', 'Ganzkörper & Schnellkraft',
 'Ausführung: Aus dem Ausfallschritt heraus mit Gewicht in den Händen explosiv nach oben/vorn abdrücken, weich landen. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Explosiver Antritt, Rumpf fest, weiche Landung über den Fußballen, Knie fällt beim Landen nicht nach innen.'),

('Standwaage auf instabiler Unterlage', 'Rumpf, Gesäß & Balance',
 'Ausführung: Einbeinig auf Balance-Pad oder Matte stehen, Oberkörper kontrolliert nach vorn absenken, Standbein leicht gebeugt, Seite wechseln. Ausrüstung: Balance-Pad oder Matte. Worauf achten: Blick nach unten-vorn, Rumpf und Gesäß fest, Oberkörper und Spielbein bilden eine gerade Linie, bei Wackeln die Bewegungsamplitude reduzieren.'),

('Kreuzheben', 'Beine & untere Rückenkette',
 'Ausführung: Langhantel mit geradem Rücken und hüftbreitem Stand vom Boden aufnehmen, Hüfte und Knie strecken sich gleichzeitig. Ausrüstung: Langhantel. Worauf achten: Rücken lang und gerade, Rumpf fest, Stange nah am Körper führen, Schultern über der Stange starten.'),

('Aufrechtes Rudern (Langhantel)', 'Schultern & oberer Rücken',
 'Ausführung: Langhantel im schulterbreiten Griff eng am Körper bis auf Brusthöhe hochziehen, kontrolliert absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Ellbogen führen die Bewegung nach außen/oben, nicht über Schulterhöhe ziehen, um die Schulter zu schonen.'),

('Seitliches Gleiten im Ausfallschritt', 'Beine',
 'Ausführung: Auf einem rutschigen Tuch oder Slider mit dem freien Bein seitlich in den Ausfallschritt gleiten und wieder zurückziehen. Ausrüstung: Slider oder glattes Tuch. Worauf achten: Rumpf fest, kontrolliert gleiten statt abrupt, über die Ferse des Standbeins abdrücken.'),

('Latzug frontal', 'Rücken',
 'Ausführung: Sitzend mit fixierten Oberschenkeln die Stange am Latzug-Gerät zur oberen Brust herunterziehen, kontrolliert zurückführen. Ausrüstung: Latzug-Gerät. Worauf achten: Oberkörper leicht nach hinten geneigt, Rumpf fest, Ellbogen nach unten/hinten führen, Stange nicht hinter den Nacken ziehen.'),

('Seitstütz mit Hüftbeuger-Anzug', 'Rumpf',
 'Ausführung: Im Unterarm-Seitstütz mit Ellbogen unter der Schulter das obere Knie kontrolliert zur Brust ziehen und wieder strecken. Ausrüstung: keine. Worauf achten: Gerade Linie halten, Hüfte stabil und nicht absinken lassen, Knie aktiv zur Brust führen.'),

('Wirbelsäulen-Rotation am Seilzug', 'Rumpf & Rotation',
 'Ausführung: Am Kabelzug mit hüftbreitem Stand den Zug unter kontrollierter Rumpfrotation von einer Seite zur anderen führen. Ausrüstung: Kabelzug. Worauf achten: Becken stabil halten, Rotation bewusst aus Brust- und Bauchmuskulatur einleiten statt aus den Armen zu ziehen.'),

('Seitlicher Ausfallschritt (stehend)', 'Beine',
 'Ausführung: Aus dem Stand einen großen Schritt zur Seite setzen, Gewicht auf das gebeugte Bein verlagern, dann über die Ferse zurückdrücken. Ausrüstung: keine oder Slider. Worauf achten: Rumpf fest, kontrollierte Bewegung, Knie des gebeugten Beins bleibt über dem Fuß.'),

('Kniebeuge (Langhantel)', 'Beine',
 'Ausführung: Langhantel im Nacken oder auf den Schultern halten, in die Hocke gehen, bis die Oberschenkel etwa parallel zum Boden sind, dann über die Fersen wieder aufstehen. Ausrüstung: Langhantel. Worauf achten: Blick nach vorn-unten, Rumpf fest, Knie in Fußrichtung und fallen nicht nach innen.'),

('BWS-Extension mit Ruderzug (instabil)', 'Rücken & Rumpfstabilität',
 'Ausführung: Auf instabiler Unterlage stehend die Brustwirbelsäule kontrolliert überstrecken, dann die Ellbogen eng am Körper zurückziehen. Ausrüstung: Balance-Pad, Kabelzug oder Expander. Worauf achten: Balance während der gesamten Bewegung halten, bei Unsicherheit zunächst auf festem Untergrund üben.'),

('Schulterdrücken (Langhantel, stehend)', 'Schultern',
 'Ausführung: Langhantel von Schulterhöhe mit angespanntem Rumpf kontrolliert über Kopf drücken, bis die Arme fast gestreckt sind, dann absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf und Gesäß fest, kein Hohlkreuz im unteren Rücken, Kopf leicht nach vorn aus der Bahn der Stange nehmen.'),

('Bulgarian Split Squat (Langhantel)', 'Beine (einbeinig)',
 'Ausführung: Den hinteren Fuß erhöht auf einer Bank ablegen und mit dem vorderen Bein kontrolliert in die Kniebeuge gehen, dann über die vordere Ferse aufstehen. Ausrüstung: Langhantel, Bank. Worauf achten: Oberkörper aufrecht, Blick geradeaus, vorderes Knie bleibt über dem Fuß, kontrollierte Tiefe.'),

('Unterarmstütz (Plank)', 'Rumpf',
 'Ausführung: Auf Unterarmen (Ellbogen unter den Schultern) und Zehenspitzen abstützen, Körper bildet eine gerade Linie, Position ruhig halten. Ausrüstung: keine. Worauf achten: Gerade Linie von Schulter bis Ferse, kein Hohlkreuz oder Durchhängen im Becken, gleichmäßig weiteratmen.'),

('Unterarmstütz auf dem Gymnastikball', 'Rumpf (fortgeschritten)',
 'Ausführung: Unterarme auf dem Gymnastikball ablegen und die Stützposition mit gerader Körperlinie ruhig halten. Ausrüstung: Gymnastikball. Worauf achten: Die instabile Unterlage aktiv über Rumpfspannung ausgleichen, kein Hohlkreuz.'),

('Bankdrücken (Flachbank)', 'Brust & Trizeps',
 'Ausführung: Auf der Flachbank liegend mit Fußkontakt zum Boden die Langhantel kontrolliert zur Brust absenken und wieder hochdrücken. Ausrüstung: Langhantel, Bank. Worauf achten: Schulterblätter zurückziehen und fixieren, Ellbogen ca. 45° zum Körper, kontrolliert ablassen, Sicherung/Spotter bei hohem Gewicht.'),

('Beckenlift mit Beinbeuge am Ball', 'Gesäß & Beinrückseite',
 'Ausführung: Fersen auf dem Gymnastikball ablegen, Hüfte anheben und den Ball anschließend kontrolliert zum Gesäß heranrollen, dann zurückrollen. Ausrüstung: Gymnastikball. Worauf achten: Hüfte während der gesamten Bewegung oben halten, Ball kontrolliert führen, Rumpf fest.'),

('Schrägbankdrücken', 'Brust (oberer Anteil)',
 'Ausführung: Auf der Schrägbank (30-45°) liegend Langhantel oder Kurzhanteln kontrolliert zum oberen Brustbereich absenken und wieder hochdrücken. Ausrüstung: Langhantel/Kurzhanteln, Schrägbank. Worauf achten: Schulterblätter fixiert, kontrollierte Bewegungsführung, Ellbogen nicht komplett durchdrücken.'),

('Vorgebeugtes Rudern (Langhantel)', 'Rücken',
 'Ausführung: Mit vorgebeugtem Oberkörper und leicht gebeugten Knien die Langhantel zum Bauch heranziehen, kontrolliert absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Rücken durchgehend gerade, Ellbogen eng am Körper führen, kein Schwung aus dem unteren Rücken.'),

('Trizepsstrecken am Seil (über Kopf)', 'Trizeps',
 'Ausführung: Seilzug hinter dem Kopf halten und die Unterarme im Ellbogengelenk kontrolliert nach oben strecken, dann zurückführen. Ausrüstung: Kabelzug, Seil. Worauf achten: Oberarme eng am Kopf fixiert, Bewegung ausschließlich im Ellbogengelenk, kein Hohlkreuz.'),

('Bizepscurls (Langhantel)', 'Bizeps',
 'Ausführung: Langhantel im schulterbreiten Griff kontrolliert vom gestreckten Arm zur Schulter hochcurlen, dann langsam absenken. Ausrüstung: Langhantel. Worauf achten: Ellbogen am Körper fixiert, kein Schwungholen aus dem Oberkörper.'),

-- ---------------------------------------------------------------------------
-- OHNE GERÄTE (Bodyweight-Alternativen)
-- ---------------------------------------------------------------------------
('Bulgarian Split Squat (Bodyweight)', 'Beine (einbeinig)',
 'Ausführung: Wie die Gerätevariante, ohne Zusatzgewicht: hinteren Fuß erhöht ablegen und mit dem vorderen Bein kontrolliert in die Kniebeuge gehen. Ausrüstung: keine, Bank oder Stufe. Worauf achten: Oberkörper aufrecht, kontrollierte Tiefe, vorderes Knie bleibt über dem Fuß.'),

('Liegestütz-Varianten', 'Brust & Trizeps',
 'Ausführung: Klassischer Liegestütz mit Körper absenken bis zur leichten Dehnung in der Brust und wieder hochdrücken, alternativ mit Medizinball unter einer Hand oder mit Zusammendrücken eines Balls zwischen den Händen für zusätzliche Rumpf-/Brustspannung. Ausrüstung: keine, optional Medizinball. Worauf achten: Körper bildet eine gerade Linie, Rumpf fest, bei Bedarf auf den Knien ausführen.'),

('Good Mornings (Bodyweight)', 'Beinrückseite & unterer Rücken',
 'Ausführung: Aus dem Stand den Oberkörper mit geradem Rücken und leicht gebeugten Knien nach vorn absenken, bis eine Dehnung in der Oberschenkelrückseite spürbar ist, dann über die Hüfte wieder aufrichten. Ausrüstung: keine. Worauf achten: Rücken durchgehend gerade, Bewegung kommt aus der Hüfte statt aus dem unteren Rücken.'),

('Superman', 'Rücken & Rumpf',
 'Ausführung: In Bauchlage Arme und Beine gleichzeitig leicht vom Boden abheben und kurz ruhig halten, dann kontrolliert absenken. Ausrüstung: Matte. Worauf achten: Bewegung kommt aus dem Rücken, kein Überstrecken des Nackens, Blick zum Boden gerichtet lassen.'),

('Schulterkreisen mit Wasserflaschen', 'Schultern',
 'Ausführung: Mit gefüllten Wasserflaschen in beiden Händen die Arme seitlich langsam kreisen lassen, Richtung nach einigen Kreisen wechseln. Ausrüstung: Wasserflaschen oder leichte Kurzhanteln. Worauf achten: Kontrollierte, nicht zu große Kreisbewegung, Schultern unten lassen.'),

('Plyo-Ausfallschritte', 'Beine & Schnellkraft',
 'Ausführung: Aus dem Ausfallschritt heraus hochspringen und die Beine in der Luft wechseln, um im Ausfallschritt der anderen Seite zu landen. Ausrüstung: keine, rutschfester Untergrund. Worauf achten: Weiche Landung über den Fußballen, Rumpf während des Sprungs stabil, vorderes Knie fällt beim Landen nicht nach innen.'),

('Unterarmstütz-Varianten auf dem Ball', 'Rumpf',
 'Ausführung: Wie die Grundvariante mit dem Gymnastikball, ggf. mit leichtem, kontrolliertem Vor- und Zurückrollen der Unterarme. Ausrüstung: Gymnastikball. Worauf achten: Rumpfspannung durchgehend halten, kein Hohlkreuz.'),

('Standwaage (ohne Zusatzgerät)', 'Balance & Rumpf',
 'Ausführung: Einbeinig stehen, Oberkörper kontrolliert nach vorn absenken, freies Bein nach hinten strecken, bis Oberkörper und Bein eine Linie bilden, Seite wechseln. Ausrüstung: keine. Worauf achten: Ruhiger Stand, Rumpf aktiv stabilisieren, Standbein leicht gebeugt.'),

('HIIT-Zirkel (freie Übungsauswahl)', 'Cardio & Ganzkörper',
 'Ausführung: Mehrere Runden im Wechsel aus einer Belastungsphase (z. B. Kniebeugen, Liegestütz, Ausfallschritte) und einer kurzen Erholungsphase durchführen. Ausrüstung: keine. Worauf achten: Saubere Ausführung geht vor Tempo, auch unter Ermüdung, Übungsauswahl und Belastung an die eigene Fitness anpassen.'),

-- ---------------------------------------------------------------------------
-- CARDIO & ZIRKELTRAINING (eigenständig neu formuliert)
-- ---------------------------------------------------------------------------
('Kettlebell Swings', 'Ganzkörper & Cardio-Kraft',
 'Ausführung: Kettlebell mit gestreckten Armen aus der kraftvollen Hüftstreckung nach vorn-oben schwingen lassen, Schwung kommt aus der Hüfte, nicht aus den Armen oder Schultern. Ausrüstung: Kettlebell. Worauf achten: Rücken neutral und gerade, Bewegung aus der Hüfte, nicht aus dem unteren Rücken, Knie nur leicht beugen.'),

('Step-Ups', 'Beine & Cardio',
 'Ausführung: Auf eine stabile Erhöhung (Kasten, Bank oder Treppenstufe) steigen und kontrolliert wieder heruntersteigen, Seite wechseln. Ausrüstung: Kasten oder stabile Erhöhung. Worauf achten: Ganze Fußsohle aufsetzen, Knie in Fußrichtung und fällt nicht nach innen, kontrolliertes Tempo.'),

('Ruder-Intervalle', 'Cardio & Ganzkörper',
 'Ausführung: Am Rudergerät im Wechsel zügige Intervalle und lockere Erholungsphasen rudern, Beine-Rücken-Arme-Sequenz konstant halten. Ausrüstung: Rudergerät. Worauf achten: Saubere Zugreihenfolge Beine-Rücken-Arme, Rücken während des Zugs neutral, Intensität an die eigene Fitness anpassen.'),

('Battle Ropes', 'Cardio & Oberkörper',
 'Ausführung: In leichter Kniebeuge-Position beide Seile abwechselnd oder gleichzeitig wellenförmig auf- und abbewegen, im Wechsel mit kurzen Erholungsphasen. Ausrüstung: Battle Ropes. Worauf achten: Rumpf stabil, Bewegung kommt aus Schultern und Armen, Knie leicht gebeugt für einen stabilen Stand.'),

('Mountain Climbers', 'Cardio & Rumpf',
 'Ausführung: Aus der Liegestütz-Position mit angespanntem Rumpf die Knie zügig abwechselnd zur Brust ziehen. Ausrüstung: keine. Worauf achten: Hüfte tief und auf Schulterhöhe halten, Rumpf während des gesamten Tempos stabil, Hände bleiben unter den Schultern.'),

('Burpees', 'Ganzkörper & Cardio',
 'Ausführung: Aus dem Stand in die Liegestütz-Position abspringen, einen Liegestütz ausführen, dann wieder aufspringen mit Strecksprung. Ausrüstung: keine. Worauf achten: Kontrollierte Landung, Rumpf während der Liegestützphase stabil halten, Tempo an die eigene Technik anpassen.');
