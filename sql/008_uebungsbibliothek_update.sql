-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 8: Update Übungsbibliothek
--
-- Hintergrund: Sätze/Wiederholungen/Dauer gehören fachlich erst zur konkreten
-- Trainingsplan-Erstellung, nicht in die allgemeine Übungsbeschreibung – daher
-- hier entfernt. Zusätzlich: 'category' (Mobilisation/Kraft/Bodyweight/Cardio)
-- für die Vorlagen-Erstellung, bereinigte 'muscle_group' (beanspruchte
-- Muskulatur statt Trainingsziel-Label) sowie image_url für die 31 Übungen,
-- zu denen Bildmaterial aus dem TV-Neerstedt-Dokument vorliegt.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-007 bereits liefen.
-- Vor dem Ausführen: PNG-Dateien aus dem Bildmaterial-Paket nach
-- content/uebungen/ in dein GitHub-Repository hochladen (Dateinamen siehe
-- image_url unten).
-- ============================================================================

alter table public.exercises add column if not exists category text;

update public.exercises set
  description = 'Ausführung: Im tiefen Ausfallschritt mit aufrechtem Oberkörper stehen, den Oberkörper kontrolliert zur vorderen Seite rotieren, Arme dabei großzügig kreisen lassen. Ausrüstung: keine. Worauf achten: Bewegung aktiv durch den vollen Bewegungsradius führen, nicht schwungvoll "durchschlagen", vorderes Knie bleibt über dem Fuß.',
  muscle_group = 'Schultern, Rumpf, Hüfte',
  category = 'Mobilisation',
  image_url = null
where name = 'Armkreisen mit Ausfallschritt & Rotation';

update public.exercises set
  description = 'Ausführung: Im hüftbreiten Stand die Hüfte großzügig und langsam kreisen, anschließend das Bein locker nach vorn/hinten sowie seitlich pendeln lassen. Ausrüstung: keine, ggf. Festhalten an einer Wand zur Balance. Worauf achten: Kontrolliert und im schmerzfreien Bewegungsraum bleiben, Oberkörper dabei ruhig und aufrecht halten.',
  muscle_group = 'Hüfte, Beine',
  category = 'Mobilisation',
  image_url = null
where name = 'Hüftkreisen & Beinpendel';

update public.exercises set
  description = 'Ausführung: Im Vierfüßlerstand mit Händen unter den Schultern und Knien unter der Hüfte abwechselnd den Rücken rund machen (Kuh) und sanft ins Hohlkreuz gehen (Katze). Ausrüstung: Matte. Worauf achten: Bewegung langsam und mit der Atmung koordinieren (Ausatmen beim Runden, Einatmen beim Strecken), nur im schmerzfreien Bereich bewegen.',
  muscle_group = 'Wirbelsäule, Rumpf',
  category = 'Mobilisation',
  image_url = null
where name = 'Katze-Kuh-Mobilisation';

update public.exercises set
  description = 'Ausführung: In Rückenlage mit aufgestellten Füßen hüftbreit die Hüfte kontrolliert anheben, bis Schultern-Hüfte-Knie eine Linie bilden, kurz halten, kontrolliert absenken. Ausrüstung: Matte. Worauf achten: Gesäß aktiv anspannen, kein Hohlkreuz im unteren Rücken, Knie fallen nicht nach außen oder innen.',
  muscle_group = 'Gesäß, Rumpf',
  category = 'Mobilisation',
  image_url = null
where name = 'Hip Bridge';

update public.exercises set
  description = 'Ausführung: Im Vierfüßlerstand mit angespanntem Rumpf gegenüberliegenden Arm und Bein gleichzeitig strecken, kurz halten, kontrolliert zurückführen, Seite wechseln. Ausrüstung: Matte. Worauf achten: Becken bleibt ruhig und gerade, keine Ausweichbewegung im Rumpf, Bewegung langsam statt mit Schwung ausführen.',
  muscle_group = 'Rumpf, Rücken',
  category = 'Mobilisation',
  image_url = null
where name = 'Bird Dog';

update public.exercises set
  description = 'Ausführung: Lockeres Skipping (kurze, schnelle Schritte) im Wechsel mit Kniehebelauf auf der Stelle oder über kurze Distanz ausführen. Ausrüstung: keine. Worauf achten: Aufrechte Körperhaltung, aktiver Armeinsatz, weiche Landung über den Fußballen.',
  muscle_group = 'Beine, Hüftbeuger',
  category = 'Mobilisation',
  image_url = null
where name = 'Skipping & Kniehebelauf';

update public.exercises set
  description = 'Ausführung: Im Sprung die Beine seitlich öffnen und die Arme über Kopf führen, im nächsten Sprung zurück in die Ausgangsposition. Ausrüstung: keine. Worauf achten: Weiche Landung über den Fußballen, gleichmäßiger Rhythmus, Knie beim Landen leicht gebeugt.',
  muscle_group = 'Ganzkörper (Beine, Schultern)',
  category = 'Mobilisation',
  image_url = null
where name = 'Jumping Jacks';

update public.exercises set
  description = 'Ausführung: Im Stand oder Kniestand mit angespanntem Rumpf den Medizinball kontrolliert seitlich am Körper vorbeiführen, Blick folgt dem Ball. Ausrüstung: Medizinball oder Gymnastikball. Worauf achten: Core-Spannung durchgehend halten, Rotation kontrolliert statt mit Schwung ausführen, Wirbelsäule stabil und aufrecht.',
  muscle_group = 'Rumpf (schräge Bauchmuskulatur)',
  category = 'Kraft',
  image_url = 'content/uebungen/bws-rotation-medizinball.png'
where name = 'BWS-Rotation mit Medizinball';

update public.exercises set
  description = 'Ausführung: Aus dem Ausfallschritt heraus mit Gewicht in den Händen explosiv nach oben/vorn abdrücken, weich landen. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Explosiver Antritt, Rumpf fest, weiche Landung über den Fußballen, Knie fällt beim Landen nicht nach innen.',
  muscle_group = 'Beine, Gesäß, Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/ausfallschritt-explosives-ausstossen.png'
where name = 'Ausfallschritt mit explosivem Ausstoßen';

update public.exercises set
  description = 'Ausführung: Einbeinig auf Balance-Pad oder Matte stehen, Oberkörper kontrolliert nach vorn absenken, Standbein leicht gebeugt, Seite wechseln. Ausrüstung: Balance-Pad oder Matte. Worauf achten: Blick nach unten-vorn, Rumpf und Gesäß fest, Oberkörper und Spielbein bilden eine gerade Linie, bei Wackeln die Bewegungsamplitude reduzieren.',
  muscle_group = 'Rumpf, Gesäß, Beine (Stabilisation)',
  category = 'Kraft',
  image_url = 'content/uebungen/standwaage-instabile-unterlage.png'
where name = 'Standwaage auf instabiler Unterlage';

update public.exercises set
  description = 'Ausführung: Langhantel mit geradem Rücken und hüftbreitem Stand vom Boden aufnehmen, Hüfte und Knie strecken sich gleichzeitig. Ausrüstung: Langhantel. Worauf achten: Rücken lang und gerade, Rumpf fest, Stange nah am Körper führen, Schultern über der Stange starten.',
  muscle_group = 'Beinrückseite, Gesäß, unterer Rücken',
  category = 'Kraft',
  image_url = 'content/uebungen/kreuzheben.png'
where name = 'Kreuzheben';

update public.exercises set
  description = 'Ausführung: Langhantel im schulterbreiten Griff eng am Körper bis auf Brusthöhe hochziehen, kontrolliert absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Ellbogen führen die Bewegung nach außen/oben, nicht über Schulterhöhe ziehen, um die Schulter zu schonen.',
  muscle_group = 'Schultern, oberer Rücken',
  category = 'Kraft',
  image_url = 'content/uebungen/aufrechtes-rudern-langhantel.png'
where name = 'Aufrechtes Rudern (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf einem rutschigen Tuch oder Slider mit dem freien Bein seitlich in den Ausfallschritt gleiten und wieder zurückziehen. Ausrüstung: Slider oder glattes Tuch. Worauf achten: Rumpf fest, kontrolliert gleiten statt abrupt, über die Ferse des Standbeins abdrücken.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/seitliches-gleiten-ausfallschritt.png'
where name = 'Seitliches Gleiten im Ausfallschritt';

update public.exercises set
  description = 'Ausführung: Sitzend mit fixierten Oberschenkeln die Stange am Latzug-Gerät zur oberen Brust herunterziehen, kontrolliert zurückführen. Ausrüstung: Latzug-Gerät. Worauf achten: Oberkörper leicht nach hinten geneigt, Rumpf fest, Ellbogen nach unten/hinten führen, Stange nicht hinter den Nacken ziehen.',
  muscle_group = 'Rücken (Latissimus), Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/latzug-frontal.png'
where name = 'Latzug frontal';

update public.exercises set
  description = 'Ausführung: Im Unterarm-Seitstütz mit Ellbogen unter der Schulter das obere Knie kontrolliert zur Brust ziehen und wieder strecken. Ausrüstung: keine. Worauf achten: Gerade Linie halten, Hüfte stabil und nicht absinken lassen, Knie aktiv zur Brust führen.',
  muscle_group = 'Rumpf (seitlich), Hüftbeuger',
  category = 'Kraft',
  image_url = 'content/uebungen/seitstuetz-hueftbeuger-anzug.png'
where name = 'Seitstütz mit Hüftbeuger-Anzug';

update public.exercises set
  description = 'Ausführung: Am Kabelzug mit hüftbreitem Stand den Zug unter kontrollierter Rumpfrotation von einer Seite zur anderen führen. Ausrüstung: Kabelzug. Worauf achten: Becken stabil halten, Rotation bewusst aus Brust- und Bauchmuskulatur einleiten statt aus den Armen zu ziehen.',
  muscle_group = 'Rumpf (schräge Bauchmuskulatur)',
  category = 'Kraft',
  image_url = 'content/uebungen/wirbelsaeulen-rotation-seilzug.png'
where name = 'Wirbelsäulen-Rotation am Seilzug';

update public.exercises set
  description = 'Ausführung: Aus dem Stand einen großen Schritt zur Seite setzen, Gewicht auf das gebeugte Bein verlagern, dann über die Ferse zurückdrücken. Ausrüstung: keine oder Slider. Worauf achten: Rumpf fest, kontrollierte Bewegung, Knie des gebeugten Beins bleibt über dem Fuß.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/seitlicher-ausfallschritt-stehend.png'
where name = 'Seitlicher Ausfallschritt (stehend)';

update public.exercises set
  description = 'Ausführung: Langhantel im Nacken oder auf den Schultern halten, in die Hocke gehen, bis die Oberschenkel etwa parallel zum Boden sind, dann über die Fersen wieder aufstehen. Ausrüstung: Langhantel. Worauf achten: Blick nach vorn-unten, Rumpf fest, Knie in Fußrichtung und fallen nicht nach innen.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/kniebeuge-langhantel.png'
where name = 'Kniebeuge (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf instabiler Unterlage stehend die Brustwirbelsäule kontrolliert überstrecken, dann die Ellbogen eng am Körper zurückziehen. Ausrüstung: Balance-Pad, Kabelzug oder Expander. Worauf achten: Balance während der gesamten Bewegung halten, bei Unsicherheit zunächst auf festem Untergrund üben.',
  muscle_group = 'Oberer Rücken, Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/bws-extension-ruderzug-instabil.png'
where name = 'BWS-Extension mit Ruderzug (instabil)';

update public.exercises set
  description = 'Ausführung: Langhantel von Schulterhöhe mit angespanntem Rumpf kontrolliert über Kopf drücken, bis die Arme fast gestreckt sind, dann absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf und Gesäß fest, kein Hohlkreuz im unteren Rücken, Kopf leicht nach vorn aus der Bahn der Stange nehmen.',
  muscle_group = 'Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/schulterdruecken-langhantel-stehend.png'
where name = 'Schulterdrücken (Langhantel, stehend)';

update public.exercises set
  description = 'Ausführung: Den hinteren Fuß erhöht auf einer Bank ablegen und mit dem vorderen Bein kontrolliert in die Kniebeuge gehen, dann über die vordere Ferse aufstehen. Ausrüstung: Langhantel, Bank. Worauf achten: Oberkörper aufrecht, Blick geradeaus, vorderes Knie bleibt über dem Fuß, kontrollierte Tiefe.',
  muscle_group = 'Beine (einbeinig), Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/bulgarian-split-squat-langhantel.png'
where name = 'Bulgarian Split Squat (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf Unterarmen (Ellbogen unter den Schultern) und Zehenspitzen abstützen, Körper bildet eine gerade Linie, Position ruhig halten. Ausrüstung: keine. Worauf achten: Gerade Linie von Schulter bis Ferse, kein Hohlkreuz oder Durchhängen im Becken, gleichmäßig weiteratmen.',
  muscle_group = 'Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/unterarmstuetz-plank.png'
where name = 'Unterarmstütz (Plank)';

update public.exercises set
  description = 'Ausführung: Unterarme auf dem Gymnastikball ablegen und die Stützposition mit gerader Körperlinie ruhig halten. Ausrüstung: Gymnastikball. Worauf achten: Die instabile Unterlage aktiv über Rumpfspannung ausgleichen, kein Hohlkreuz.',
  muscle_group = 'Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/unterarmstuetz-gymnastikball.png'
where name = 'Unterarmstütz auf dem Gymnastikball';

update public.exercises set
  description = 'Ausführung: Auf der Flachbank liegend mit Fußkontakt zum Boden die Langhantel kontrolliert zur Brust absenken und wieder hochdrücken. Ausrüstung: Langhantel, Bank. Worauf achten: Schulterblätter zurückziehen und fixieren, Ellbogen ca. 45° zum Körper, kontrolliert ablassen, Sicherung/Spotter bei hohem Gewicht.',
  muscle_group = 'Brust, Trizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/bankdruecken-flachbank.png'
where name = 'Bankdrücken (Flachbank)';

update public.exercises set
  description = 'Ausführung: Fersen auf dem Gymnastikball ablegen, Hüfte anheben und den Ball anschließend kontrolliert zum Gesäß heranrollen, dann zurückrollen. Ausrüstung: Gymnastikball. Worauf achten: Hüfte während der gesamten Bewegung oben halten, Ball kontrolliert führen, Rumpf fest.',
  muscle_group = 'Gesäß, Beinrückseite',
  category = 'Kraft',
  image_url = 'content/uebungen/beckenlift-beinbeuge-ball.png'
where name = 'Beckenlift mit Beinbeuge am Ball';

update public.exercises set
  description = 'Ausführung: Auf der Schrägbank (30-45°) liegend Langhantel oder Kurzhanteln kontrolliert zum oberen Brustbereich absenken und wieder hochdrücken. Ausrüstung: Langhantel/Kurzhanteln, Schrägbank. Worauf achten: Schulterblätter fixiert, kontrollierte Bewegungsführung, Ellbogen nicht komplett durchdrücken.',
  muscle_group = 'Brust (oberer Anteil), Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/schraegbankdruecken.png'
where name = 'Schrägbankdrücken';

update public.exercises set
  description = 'Ausführung: Mit vorgebeugtem Oberkörper und leicht gebeugten Knien die Langhantel zum Bauch heranziehen, kontrolliert absenken. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Rücken durchgehend gerade, Ellbogen eng am Körper führen, kein Schwung aus dem unteren Rücken.',
  muscle_group = 'Rücken, Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/vorgebeugtes-rudern-langhantel.png'
where name = 'Vorgebeugtes Rudern (Langhantel)';

update public.exercises set
  description = 'Ausführung: Seilzug hinter dem Kopf halten und die Unterarme im Ellbogengelenk kontrolliert nach oben strecken, dann zurückführen. Ausrüstung: Kabelzug, Seil. Worauf achten: Oberarme eng am Kopf fixiert, Bewegung ausschließlich im Ellbogengelenk, kein Hohlkreuz.',
  muscle_group = 'Trizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/trizepsstrecken-seil-ueberkopf.png'
where name = 'Trizepsstrecken am Seil (über Kopf)';

update public.exercises set
  description = 'Ausführung: Langhantel im schulterbreiten Griff kontrolliert vom gestreckten Arm zur Schulter hochcurlen, dann langsam absenken. Ausrüstung: Langhantel. Worauf achten: Ellbogen am Körper fixiert, kein Schwungholen aus dem Oberkörper.',
  muscle_group = 'Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/bizepscurls-langhantel.png'
where name = 'Bizepscurls (Langhantel)';

update public.exercises set
  description = 'Ausführung: Wie die Gerätevariante, ohne Zusatzgewicht: hinteren Fuß erhöht ablegen und mit dem vorderen Bein kontrolliert in die Kniebeuge gehen. Ausrüstung: keine, Bank oder Stufe. Worauf achten: Oberkörper aufrecht, kontrollierte Tiefe, vorderes Knie bleibt über dem Fuß.',
  muscle_group = 'Beine (einbeinig), Gesäß',
  category = 'Bodyweight',
  image_url = 'content/uebungen/bulgarian-split-squat-bodyweight.png'
where name = 'Bulgarian Split Squat (Bodyweight)';

update public.exercises set
  description = 'Ausführung: Klassischer Liegestütz mit Körper absenken bis zur leichten Dehnung in der Brust und wieder hochdrücken, alternativ mit Medizinball unter einer Hand oder mit Zusammendrücken eines Balls zwischen den Händen für zusätzliche Rumpf-/Brustspannung. Ausrüstung: keine, optional Medizinball. Worauf achten: Körper bildet eine gerade Linie, Rumpf fest, bei Bedarf auf den Knien ausführen.',
  muscle_group = 'Brust, Trizeps',
  category = 'Bodyweight',
  image_url = 'content/uebungen/liegestuetz-varianten.png'
where name = 'Liegestütz-Varianten';

update public.exercises set
  description = 'Ausführung: Aus dem Stand den Oberkörper mit geradem Rücken und leicht gebeugten Knien nach vorn absenken, bis eine Dehnung in der Oberschenkelrückseite spürbar ist, dann über die Hüfte wieder aufrichten. Ausrüstung: keine. Worauf achten: Rücken durchgehend gerade, Bewegung kommt aus der Hüfte statt aus dem unteren Rücken.',
  muscle_group = 'Beinrückseite, unterer Rücken',
  category = 'Bodyweight',
  image_url = 'content/uebungen/good-mornings-bodyweight.png'
where name = 'Good Mornings (Bodyweight)';

update public.exercises set
  description = 'Ausführung: In Bauchlage Arme und Beine gleichzeitig leicht vom Boden abheben und kurz ruhig halten, dann kontrolliert absenken. Ausrüstung: Matte. Worauf achten: Bewegung kommt aus dem Rücken, kein Überstrecken des Nackens, Blick zum Boden gerichtet lassen.',
  muscle_group = 'Rücken, Rumpf',
  category = 'Bodyweight',
  image_url = 'content/uebungen/superman.png'
where name = 'Superman';

update public.exercises set
  description = 'Ausführung: Mit gefüllten Wasserflaschen in beiden Händen die Arme seitlich langsam kreisen lassen, Richtung nach einigen Kreisen wechseln. Ausrüstung: Wasserflaschen oder leichte Kurzhanteln. Worauf achten: Kontrollierte, nicht zu große Kreisbewegung, Schultern unten lassen.',
  muscle_group = 'Schultern',
  category = 'Bodyweight',
  image_url = 'content/uebungen/schulterkreisen-wasserflaschen.png'
where name = 'Schulterkreisen mit Wasserflaschen';

update public.exercises set
  description = 'Ausführung: Aus dem Ausfallschritt heraus hochspringen und die Beine in der Luft wechseln, um im Ausfallschritt der anderen Seite zu landen. Ausrüstung: keine, rutschfester Untergrund. Worauf achten: Weiche Landung über den Fußballen, Rumpf während des Sprungs stabil, vorderes Knie fällt beim Landen nicht nach innen.',
  muscle_group = 'Beine, Gesäß',
  category = 'Bodyweight',
  image_url = 'content/uebungen/plyo-ausfallschritte.png'
where name = 'Plyo-Ausfallschritte';

update public.exercises set
  description = 'Ausführung: Wie die Grundvariante mit dem Gymnastikball, ggf. mit leichtem, kontrolliertem Vor- und Zurückrollen der Unterarme. Ausrüstung: Gymnastikball. Worauf achten: Rumpfspannung durchgehend halten, kein Hohlkreuz.',
  muscle_group = 'Rumpf',
  category = 'Bodyweight',
  image_url = 'content/uebungen/unterarmstuetz-varianten-ball.png'
where name = 'Unterarmstütz-Varianten auf dem Ball';

update public.exercises set
  description = 'Ausführung: Einbeinig stehen, Oberkörper kontrolliert nach vorn absenken, freies Bein nach hinten strecken, bis Oberkörper und Bein eine Linie bilden, Seite wechseln. Ausrüstung: keine. Worauf achten: Ruhiger Stand, Rumpf aktiv stabilisieren, Standbein leicht gebeugt.',
  muscle_group = 'Rumpf, Beine (Stabilisation)',
  category = 'Bodyweight',
  image_url = 'content/uebungen/standwaage-ohne-zusatzgeraet.png'
where name = 'Standwaage (ohne Zusatzgerät)';

update public.exercises set
  description = 'Ausführung: Mehrere Runden im Wechsel aus einer Belastungsphase (z. B. Kniebeugen, Liegestütz, Ausfallschritte) und einer kurzen Erholungsphase durchführen. Ausrüstung: keine. Worauf achten: Saubere Ausführung geht vor Tempo, auch unter Ermüdung, Übungsauswahl und Belastung an die eigene Fitness anpassen.',
  muscle_group = 'Ganzkörper',
  category = 'Bodyweight',
  image_url = 'content/uebungen/hiit-zirkel-freie-auswahl.png'
where name = 'HIIT-Zirkel (freie Übungsauswahl)';

update public.exercises set
  description = 'Ausführung: Kettlebell mit gestreckten Armen aus der kraftvollen Hüftstreckung nach vorn-oben schwingen lassen, Schwung kommt aus der Hüfte, nicht aus den Armen oder Schultern. Ausrüstung: Kettlebell. Worauf achten: Rücken neutral und gerade, Bewegung aus der Hüfte, nicht aus dem unteren Rücken, Knie nur leicht beugen.',
  muscle_group = 'Gesäß, Beinrückseite, Rumpf',
  category = 'Cardio',
  image_url = null
where name = 'Kettlebell Swings';

update public.exercises set
  description = 'Ausführung: Auf eine stabile Erhöhung (Kasten, Bank oder Treppenstufe) steigen und kontrolliert wieder heruntersteigen, Seite wechseln. Ausrüstung: Kasten oder stabile Erhöhung. Worauf achten: Ganze Fußsohle aufsetzen, Knie in Fußrichtung und fällt nicht nach innen, kontrolliertes Tempo.',
  muscle_group = 'Beine, Gesäß',
  category = 'Cardio',
  image_url = null
where name = 'Step-Ups';

update public.exercises set
  description = 'Ausführung: Am Rudergerät im Wechsel zügige Intervalle und lockere Erholungsphasen rudern, Beine-Rücken-Arme-Sequenz konstant halten. Ausrüstung: Rudergerät. Worauf achten: Saubere Zugreihenfolge Beine-Rücken-Arme, Rücken während des Zugs neutral, Intensität an die eigene Fitness anpassen.',
  muscle_group = 'Ganzkörper (Beine, Rücken, Arme)',
  category = 'Cardio',
  image_url = null
where name = 'Ruder-Intervalle';

update public.exercises set
  description = 'Ausführung: In leichter Kniebeuge-Position beide Seile abwechselnd oder gleichzeitig wellenförmig auf- und abbewegen, im Wechsel mit kurzen Erholungsphasen. Ausrüstung: Battle Ropes. Worauf achten: Rumpf stabil, Bewegung kommt aus Schultern und Armen, Knie leicht gebeugt für einen stabilen Stand.',
  muscle_group = 'Schultern, Arme, Rumpf',
  category = 'Cardio',
  image_url = null
where name = 'Battle Ropes';

update public.exercises set
  description = 'Ausführung: Aus der Liegestütz-Position mit angespanntem Rumpf die Knie zügig abwechselnd zur Brust ziehen. Ausrüstung: keine. Worauf achten: Hüfte tief und auf Schulterhöhe halten, Rumpf während des gesamten Tempos stabil, Hände bleiben unter den Schultern.',
  muscle_group = 'Rumpf, Hüftbeuger, Schultern',
  category = 'Cardio',
  image_url = null
where name = 'Mountain Climbers';

update public.exercises set
  description = 'Ausführung: Aus dem Stand in die Liegestütz-Position abspringen, einen Liegestütz ausführen, dann wieder aufspringen mit Strecksprung. Ausrüstung: keine. Worauf achten: Kontrollierte Landung, Rumpf während der Liegestützphase stabil halten, Tempo an die eigene Technik anpassen.',
  muscle_group = 'Ganzkörper',
  category = 'Cardio',
  image_url = null
where name = 'Burpees';
