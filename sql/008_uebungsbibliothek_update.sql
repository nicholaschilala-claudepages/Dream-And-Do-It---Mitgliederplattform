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
  description = 'Ausführung: Im Ausfallschritt den Oberkörper zur vorderen Seite rotieren, Arme dabei großzügig kreisen lassen. Ausrüstung: keine. Worauf achten: Bewegung aktiv durch den vollen Bewegungsradius führen, nicht schwungvoll "durchschlagen".',
  muscle_group = 'Schultern, Rumpf, Hüfte',
  category = 'Mobilisation',
  image_url = null
where name = 'Armkreisen mit Ausfallschritt & Rotation';

update public.exercises set
  description = 'Ausführung: Im Stand die Hüfte großzügig kreisen, anschließend das Bein locker nach vorn/hinten sowie seitlich pendeln lassen. Ausrüstung: keine, ggf. Festhalten an einer Wand zur Balance. Worauf achten: Kontrolliert und im schmerzfreien Bewegungsraum bleiben.',
  muscle_group = 'Hüfte, Beine',
  category = 'Mobilisation',
  image_url = null
where name = 'Hüftkreisen & Beinpendel';

update public.exercises set
  description = 'Ausführung: Im Vierfüßlerstand abwechselnd den Rücken rund machen (Kuh) und ins Hohlkreuz gehen (Katze). Ausrüstung: Matte. Worauf achten: Bewegung langsam und mit der Atmung koordinieren.',
  muscle_group = 'Wirbelsäule, Rumpf',
  category = 'Mobilisation',
  image_url = null
where name = 'Katze-Kuh-Mobilisation';

update public.exercises set
  description = 'Ausführung: In Rückenlage die Hüfte anheben, bis Schultern-Hüfte-Knie eine Linie bilden, kurz halten, kontrolliert absenken. Ausrüstung: Matte. Worauf achten: Gesäß aktiv anspannen, kein Hohlkreuz im unteren Rücken.',
  muscle_group = 'Gesäß, Rumpf',
  category = 'Mobilisation',
  image_url = null
where name = 'Hip Bridge';

update public.exercises set
  description = 'Ausführung: Im Vierfüßlerstand gegenüberliegenden Arm und Bein gleichzeitig strecken, kurz halten, kontrolliert zurückführen. Ausrüstung: Matte. Worauf achten: Becken bleibt ruhig und gerade, keine Ausweichbewegung im Rumpf.',
  muscle_group = 'Rumpf, Rücken',
  category = 'Mobilisation',
  image_url = null
where name = 'Bird Dog';

update public.exercises set
  description = 'Ausführung: Lockeres Skipping (kurze, schnelle Schritte) im Wechsel mit Kniehebelauf auf der Stelle oder über kurze Distanz. Ausrüstung: keine. Worauf achten: Aufrechte Körperhaltung, aktiver Armeinsatz.',
  muscle_group = 'Beine, Hüftbeuger',
  category = 'Mobilisation',
  image_url = null
where name = 'Skipping & Kniehebelauf';

update public.exercises set
  description = 'Ausführung: Im Sprung Beine seitlich öffnen und Arme über Kopf führen, im nächsten Sprung zurück in die Ausgangsposition. am Stück. Ausrüstung: keine. Worauf achten: Weiche Landung über den Fußballen, gleichmäßiger Rhythmus.',
  muscle_group = 'Ganzkörper (Beine, Schultern)',
  category = 'Mobilisation',
  image_url = null
where name = 'Jumping Jacks';

update public.exercises set
  description = 'Ausführung: Im Stand oder Kniestand den Medizinball unter Rumpfspannung seitlich am Körper vorbeiführen. Ausrüstung: Medizinball oder Gymnastikball. Worauf achten: Core-Spannung halten, Rotation kontrolliert ausführen, Wirbelsäule stabil.',
  muscle_group = 'Rumpf (schräge Bauchmuskulatur)',
  category = 'Kraft',
  image_url = 'content/uebungen/bws-rotation-medizinball.png'
where name = 'BWS-Rotation mit Medizinball';

update public.exercises set
  description = 'Ausführung: Aus dem Ausfallschritt heraus explosiv nach oben/vorn abdrücken, mit Gewicht in den Händen. Ausrüstung: Kurzhantel oder Kettlebell. Worauf achten: Explosiver Antritt, Rumpf fest, weiche Landung.',
  muscle_group = 'Beine, Gesäß, Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/ausfallschritt-explosives-ausstossen.png'
where name = 'Ausfallschritt mit explosivem Ausstoßen';

update public.exercises set
  description = 'Ausführung: Einbeinig auf Balance-Pad oder Matte stehen, Oberkörper nach vorn absenken, Standbein leicht gebeugt. je Seite. Ausrüstung: Balance-Pad oder Matte. Worauf achten: Blick nach unten-vorn, Rumpf und Gesäß fest, Oberkörper und Spielbein bilden eine gerade Linie.',
  muscle_group = 'Rumpf, Gesäß, Beine (Stabilisation)',
  category = 'Kraft',
  image_url = 'content/uebungen/standwaage-instabile-unterlage.png'
where name = 'Standwaage auf instabiler Unterlage';

update public.exercises set
  description = 'Ausführung: Langhantel mit geradem Rücken vom Boden aufnehmen, Hüfte und Knie strecken sich gleichzeitig. Ausrüstung: Langhantel. Worauf achten: Rücken lang und gerade, Rumpf fest, Stange nah am Körper führen.',
  muscle_group = 'Beinrückseite, Gesäß, unterer Rücken',
  category = 'Kraft',
  image_url = 'content/uebungen/kreuzheben.png'
where name = 'Kreuzheben';

update public.exercises set
  description = 'Ausführung: Langhantel eng am Körper bis auf Brusthöhe hochziehen. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Ellbogen führen die Bewegung nach außen/oben.',
  muscle_group = 'Schultern, oberer Rücken',
  category = 'Kraft',
  image_url = 'content/uebungen/aufrechtes-rudern-langhantel.png'
where name = 'Aufrechtes Rudern (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf einem rutschigen Tuch oder Slider seitlich in den Ausfallschritt gleiten und wieder zurückziehen. Ausrüstung: Slider oder glattes Tuch. Worauf achten: Rumpf fest, kontrolliert gleiten, über die Ferse abdrücken.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/seitliches-gleiten-ausfallschritt.png'
where name = 'Seitliches Gleiten im Ausfallschritt';

update public.exercises set
  description = 'Ausführung: Stange am Latzug-Gerät zur oberen Brust herunterziehen. Ausrüstung: Latzug-Gerät. Worauf achten: Oberkörper leicht nach hinten geneigt, Rumpf fest, Ellbogen nach unten/hinten führen.',
  muscle_group = 'Rücken (Latissimus), Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/latzug-frontal.png'
where name = 'Latzug frontal';

update public.exercises set
  description = 'Ausführung: Im Seitstütz das obere Knie kontrolliert zur Brust ziehen und wieder strecken. Ausrüstung: keine. Worauf achten: Gerade Linie halten, Hüfte stabil, Knie aktiv zur Brust führen.',
  muscle_group = 'Rumpf (seitlich), Hüftbeuger',
  category = 'Kraft',
  image_url = 'content/uebungen/seitstuetz-hueftbeuger-anzug.png'
where name = 'Seitstütz mit Hüftbeuger-Anzug';

update public.exercises set
  description = 'Ausführung: Am Kabelzug stehend den Zug unter Rumpfrotation von einer Seite zur anderen führen. Ausrüstung: Kabelzug. Worauf achten: Becken stabil halten, Rotation bewusst aus Brust- und Bauchmuskulatur einleiten.',
  muscle_group = 'Rumpf (schräge Bauchmuskulatur)',
  category = 'Kraft',
  image_url = 'content/uebungen/wirbelsaeulen-rotation-seilzug.png'
where name = 'Wirbelsäulen-Rotation am Seilzug';

update public.exercises set
  description = 'Ausführung: Aus dem Stand großen Schritt zur Seite, Gewicht auf das gebeugte Bein verlagern, zurückdrücken. Ausrüstung: keine oder Slider. Worauf achten: Rumpf fest, kontrollierte Bewegung, über die Ferse abdrücken.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/seitlicher-ausfallschritt-stehend.png'
where name = 'Seitlicher Ausfallschritt (stehend)';

update public.exercises set
  description = 'Ausführung: Langhantel im Nacken oder auf den Schultern, in die Hocke gehen bis Oberschenkel etwa parallel zum Boden, wieder aufstehen. Ausrüstung: Langhantel. Worauf achten: Blick nach vorn-unten, Rumpf fest, Knie in Fußrichtung.',
  muscle_group = 'Beine, Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/kniebeuge-langhantel.png'
where name = 'Kniebeuge (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf instabiler Unterlage stehend die Brustwirbelsäule überstrecken, dann Ellbogen eng am Körper zurückziehen. Ausrüstung: Balance-Pad, Kabelzug oder Expander. Worauf achten: Balance während der gesamten Bewegung halten.',
  muscle_group = 'Oberer Rücken, Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/bws-extension-ruderzug-instabil.png'
where name = 'BWS-Extension mit Ruderzug (instabil)';

update public.exercises set
  description = 'Ausführung: Langhantel von Schulterhöhe kontrolliert über Kopf drücken. Ausrüstung: Langhantel. Worauf achten: Rumpf und Gesäß fest, kein Hohlkreuz im unteren Rücken.',
  muscle_group = 'Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/schulterdruecken-langhantel-stehend.png'
where name = 'Schulterdrücken (Langhantel, stehend)';

update public.exercises set
  description = 'Ausführung: Hinteren Fuß erhöht auf einer Bank ablegen, mit dem vorderen Bein kontrolliert in die Kniebeuge gehen. Ausrüstung: Langhantel, Bank. Worauf achten: Oberkörper aufrecht, Blick geradeaus, kontrollierte Tiefe.',
  muscle_group = 'Beine (einbeinig), Gesäß',
  category = 'Kraft',
  image_url = 'content/uebungen/bulgarian-split-squat-langhantel.png'
where name = 'Bulgarian Split Squat (Langhantel)';

update public.exercises set
  description = 'Ausführung: Auf Unterarmen und Zehenspitzen abstützen, Körper bildet eine gerade Linie. Ausrüstung: keine. Worauf achten: Gerade Linie Schulter bis Ferse, kein Hohlkreuz oder Durchhängen.',
  muscle_group = 'Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/unterarmstuetz-plank.png'
where name = 'Unterarmstütz (Plank)';

update public.exercises set
  description = 'Ausführung: Unterarme auf dem Gymnastikball ablegen und die Stützposition halten. Ausrüstung: Gymnastikball. Worauf achten: Die instabile Unterlage aktiv über Rumpfspannung ausgleichen.',
  muscle_group = 'Rumpf',
  category = 'Kraft',
  image_url = 'content/uebungen/unterarmstuetz-gymnastikball.png'
where name = 'Unterarmstütz auf dem Gymnastikball';

update public.exercises set
  description = 'Ausführung: Langhantel auf der Flachbank kontrolliert zur Brust absenken und zurückdrücken. Ausrüstung: Langhantel, Bank. Worauf achten: Schulterblätter zurückziehen, Ellbogen ca. 45°, kontrolliert ablassen.',
  muscle_group = 'Brust, Trizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/bankdruecken-flachbank.png'
where name = 'Bankdrücken (Flachbank)';

update public.exercises set
  description = 'Ausführung: Fersen auf dem Gymnastikball, Hüfte anheben und den Ball anschließend kontrolliert zum Gesäß heranziehen. Ausrüstung: Gymnastikball. Worauf achten: Hüfte oben halten, Ball kontrolliert führen, Rumpf fest.',
  muscle_group = 'Gesäß, Beinrückseite',
  category = 'Kraft',
  image_url = 'content/uebungen/beckenlift-beinbeuge-ball.png'
where name = 'Beckenlift mit Beinbeuge am Ball';

update public.exercises set
  description = 'Ausführung: Langhantel oder Kurzhanteln auf der Schrägbank (30-45°) kontrolliert absenken und drücken. Ausrüstung: Langhantel/Kurzhanteln, Schrägbank. Worauf achten: Schulterblätter fixiert, kontrollierte Bewegungsführung.',
  muscle_group = 'Brust (oberer Anteil), Schultern',
  category = 'Kraft',
  image_url = 'content/uebungen/schraegbankdruecken.png'
where name = 'Schrägbankdrücken';

update public.exercises set
  description = 'Ausführung: Mit vorgebeugtem Oberkörper die Langhantel zum Bauch heranziehen. Ausrüstung: Langhantel. Worauf achten: Rumpf fest, Rücken gerade, Ellbogen eng am Körper führen.',
  muscle_group = 'Rücken, Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/vorgebeugtes-rudern-langhantel.png'
where name = 'Vorgebeugtes Rudern (Langhantel)';

update public.exercises set
  description = 'Ausführung: Seilzug hinter dem Kopf halten, Unterarme im Ellbogengelenk nach oben strecken. Ausrüstung: Kabelzug, Seil. Worauf achten: Oberarme eng am Kopf fixiert, Bewegung nur im Ellbogengelenk.',
  muscle_group = 'Trizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/trizepsstrecken-seil-ueberkopf.png'
where name = 'Trizepsstrecken am Seil (über Kopf)';

update public.exercises set
  description = 'Ausführung: Langhantel kontrolliert vom gestreckten Arm zur Schulter hochcurlen. Ausrüstung: Langhantel. Worauf achten: Ellbogen am Körper fixiert, kein Schwungholen.',
  muscle_group = 'Bizeps',
  category = 'Kraft',
  image_url = 'content/uebungen/bizepscurls-langhantel.png'
where name = 'Bizepscurls (Langhantel)';

update public.exercises set
  description = 'Ausführung: Wie die Gerätevariante, ohne Zusatzgewicht. Ausrüstung: keine, Bank oder Stufe. Worauf achten: Oberkörper aufrecht, kontrollierte Tiefe.',
  muscle_group = 'Beine (einbeinig), Gesäß',
  category = 'Bodyweight',
  image_url = 'content/uebungen/bulgarian-split-squat-bodyweight.png'
where name = 'Bulgarian Split Squat (Bodyweight)';

update public.exercises set
  description = 'Ausführung: Klassischer Liegestütz, alternativ mit Medizinball unter einer Hand oder mit Zusammendrücken eines Balls zwischen den Händen für zusätzliche Rumpf-/Brustspannung. Ausrüstung: keine, optional Medizinball. Worauf achten: Körper bildet eine gerade Linie, Rumpf fest.',
  muscle_group = 'Brust, Trizeps',
  category = 'Bodyweight',
  image_url = 'content/uebungen/liegestuetz-varianten.png'
where name = 'Liegestütz-Varianten';

update public.exercises set
  description = 'Ausführung: Aus dem Stand den Oberkörper mit geradem Rücken und leicht gebeugten Knien nach vorn absenken, dann aufrichten. Ausrüstung: keine. Worauf achten: Rücken durchgehend gerade, Bewegung kommt aus der Hüfte.',
  muscle_group = 'Beinrückseite, unterer Rücken',
  category = 'Bodyweight',
  image_url = 'content/uebungen/good-mornings-bodyweight.png'
where name = 'Good Mornings (Bodyweight)';

update public.exercises set
  description = 'Ausführung: In Bauchlage Arme und Beine gleichzeitig leicht vom Boden abheben und kurz halten. (haltend oder in Wiederholungen). Ausrüstung: Matte. Worauf achten: Bewegung kommt aus dem Rücken, kein Überstrecken des Nackens.',
  muscle_group = 'Rücken, Rumpf',
  category = 'Bodyweight',
  image_url = 'content/uebungen/superman.png'
where name = 'Superman';

update public.exercises set
  description = 'Ausführung: Mit gefüllten Wasserflaschen in beiden Händen die Arme seitlich kreisen lassen. Ausrüstung: Wasserflaschen oder leichte Kurzhanteln. Worauf achten: Kontrollierte, nicht zu große Kreisbewegung.',
  muscle_group = 'Schultern',
  category = 'Bodyweight',
  image_url = 'content/uebungen/schulterkreisen-wasserflaschen.png'
where name = 'Schulterkreisen mit Wasserflaschen';

update public.exercises set
  description = 'Ausführung: Im Wechsel aus dem Ausfallschritt hochspringen und beidseitig abwechseln. Ausrüstung: keine. Worauf achten: Weiche Landung, Rumpf während des Sprungs stabil.',
  muscle_group = 'Beine, Gesäß',
  category = 'Bodyweight',
  image_url = 'content/uebungen/plyo-ausfallschritte.png'
where name = 'Plyo-Ausfallschritte';

update public.exercises set
  description = 'Ausführung: Wie die Gerätevariante mit dem Gymnastikball, ggf. mit leichtem Vor- und Zurückrollen. Ausrüstung: Gymnastikball. Worauf achten: Rumpfspannung durchgehend halten.',
  muscle_group = 'Rumpf',
  category = 'Bodyweight',
  image_url = 'content/uebungen/unterarmstuetz-varianten-ball.png'
where name = 'Unterarmstütz-Varianten auf dem Ball';

update public.exercises set
  description = 'Ausführung: Einbeinig stehen, Oberkörper nach vorn absenken, freies Bein nach hinten strecken. je Seite. Ausrüstung: keine. Worauf achten: Ruhiger Stand, Rumpf aktiv stabilisieren.',
  muscle_group = 'Rumpf, Beine (Stabilisation)',
  category = 'Bodyweight',
  image_url = 'content/uebungen/standwaage-ohne-zusatzgeraet.png'
where name = 'Standwaage (ohne Zusatzgerät)';

update public.exercises set
  description = 'Ausführung: 4-6 Runden im Wechsel aus 60 Sekunden Belastung (z. B. Kniebeugen, Liegestütz, Ausfallschritte) und 30 Sekunden Pause. Ausrüstung: keine. Worauf achten: Saubere Ausführung geht vor Tempo, auch unter Ermüdung.',
  muscle_group = 'Ganzkörper',
  category = 'Bodyweight',
  image_url = 'content/uebungen/hiit-zirkel-freie-auswahl.png'
where name = 'HIIT-Zirkel (freie Übungsauswahl)';

update public.exercises set
  description = 'Ausführung: Kettlebell mit gestreckten Armen aus der Hüftstreckung nach vorn-oben schwingen lassen, Schwung kommt aus der Hüfte, nicht aus den Armen. Ausrüstung: Kettlebell. Worauf achten: Rücken neutral, Bewegung aus der Hüfte, nicht aus dem unteren Rücken.',
  muscle_group = 'Gesäß, Beinrückseite, Rumpf',
  category = 'Cardio',
  image_url = null
where name = 'Kettlebell Swings';

update public.exercises set
  description = 'Ausführung: Auf eine Erhöhung (Kasten, Bank oder Treppenstufe) steigen und kontrolliert wieder heruntersteigen. Ausrüstung: Kasten oder stabile Erhöhung. Worauf achten: Ganze Fußsohle aufsetzen, Knie in Fußrichtung.',
  muscle_group = 'Beine, Gesäß',
  category = 'Cardio',
  image_url = null
where name = 'Step-Ups';

update public.exercises set
  description = 'Ausführung: Am Rudergerät im Wechsel zügige Intervalle und aktive Erholung rudern. lockeres Rudern dazwischen. Ausrüstung: Rudergerät. Worauf achten: Saubere Zugreihenfolge Beine-Rücken-Arme, Rücken während des Zugs neutral.',
  muscle_group = 'Ganzkörper (Beine, Rücken, Arme)',
  category = 'Cardio',
  image_url = null
where name = 'Ruder-Intervalle';

update public.exercises set
  description = 'Ausführung: In leichter Kniebeuge-Position beide Seile abwechselnd oder gleichzeitig wellenförmig auf- und abbewegen. Belastung, 30-40 Sek. Pause. Ausrüstung: Battle Ropes. Worauf achten: Rumpf stabil, Bewegung kommt aus Schultern und Armen.',
  muscle_group = 'Schultern, Arme, Rumpf',
  category = 'Cardio',
  image_url = null
where name = 'Battle Ropes';

update public.exercises set
  description = 'Ausführung: Aus der Liegestütz-Position die Knie zügig abwechselnd zur Brust ziehen. Ausrüstung: keine. Worauf achten: Hüfte tief halten, Rumpf während des gesamten Tempos stabil.',
  muscle_group = 'Rumpf, Hüftbeuger, Schultern',
  category = 'Cardio',
  image_url = null
where name = 'Mountain Climbers';

update public.exercises set
  description = 'Ausführung: Aus dem Stand in die Liegestütz-Position abspringen, einen Liegestütz ausführen, wieder aufspringen mit Strecksprung. Ausrüstung: keine. Worauf achten: Kontrollierte Landung, Rumpf während der Liegestützphase stabil halten.',
  muscle_group = 'Ganzkörper',
  category = 'Cardio',
  image_url = null
where name = 'Burpees';
