-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Bildzuordnung für alle 47 Bilder aus "bildprompt-liste-offene-bilder.md"
-- (Stand 29.09.2026, nach Runde 15) — 7 Übungen, 20 Rezepte, 20 Coaching-
-- Themen. Der Nutzer hat alle 47 Bilder mit Gemini erzeugt und als PDF
-- zurückgeliefert; identisch zum Vorgehen in Runde 14 (sql/035) wurden die
-- Bilder per PyMuPDF aus dem PDF extrahiert (Text- und Bildpositionen je
-- Seite, zugeordnet zur zuletzt gesehenen "### Titel"-Überschrift bzw. dem
-- darunter angegebenen Dateinamen) und unter den in der Bildprompt-Liste
-- vorgegebenen Namen in content/uebungen/, content/rezepte-bilder/ bzw.
-- content/coaching-bilder/ abgelegt. Alle 47 von 47 Bildern wurden diesmal
-- sauber extrahiert (anders als in Runde 14, wo 7 von 105 fehlten) — damit
-- sind nach dieser Migration KEINE offenen Bilder mehr aus der Liste übrig.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-040 bereits liefen.
-- ============================================================================

-- 1) Übungsfotos (7 Bilder) — die zuvor letzten offenen Übungsbilder aus
--    Runde 13/14 (siehe sql/035, dort noch ohne Bild geblieben)
-- ----------------------------------------------------------------------------
update public.exercises set image_url = 'content/uebungen/gesaessmaschine-hueftstrecker.jpg' where name = 'Gesäßmaschine (Hüftstrecker-Maschine)';
update public.exercises set image_url = 'content/uebungen/langhantelrudern-untergriff.jpg' where name = 'Langhantelrudern im Untergriff';
update public.exercises set image_url = 'content/uebungen/negativ-bankdruecken-langhantel.jpg' where name = 'Negativ-Bankdrücken (Langhantel)';
update public.exercises set image_url = 'content/uebungen/piriformis-dehnung-figure4.jpg' where name = 'Piriformis-Dehnung (Figure-4)';
update public.exercises set image_url = 'content/uebungen/t-bar-rudern.jpg' where name = 'T-Bar-Rudern';
update public.exercises set image_url = 'content/uebungen/trizepsdruecken-maschine.jpg' where name = 'Trizepsdrücken an der Maschine';
update public.exercises set image_url = 'content/uebungen/wadenheben-beinpresse.jpg' where name = 'Wadenheben an der Beinpresse';

-- 2) Rezeptfotos (20 Bilder) — die 20 Rezepte aus Runde 15 (sql/039)
-- ----------------------------------------------------------------------------
update public.recipes set image_url = 'content/rezepte-bilder/fruehstuecks-burrito-bohnen.jpg' where title = 'Frühstücks-Burrito mit Rührei & schwarzen Bohnen';
update public.recipes set image_url = 'content/rezepte-bilder/garnelen-gemuese-pfanne-reis.jpg' where title = 'Garnelen-Gemüse-Pfanne mit Vollkornreis';
update public.recipes set image_url = 'content/rezepte-bilder/rote-linsen-dal-reis.jpg' where title = 'Linsen-Dal mit Vollkornreis';
update public.recipes set image_url = 'content/rezepte-bilder/haehnchenspiesse-couscous.jpg' where title = 'Hähnchen-Gemüse-Spieße mit Couscous';
update public.recipes set image_url = 'content/rezepte-bilder/kabeljau-ofen-kartoffeln-brokkoli.jpg' where title = 'Kabeljau im Ofen mit Kartoffeln & Brokkoli';
update public.recipes set image_url = 'content/rezepte-bilder/erdnuss-nudeln-haehnchen.jpg' where title = 'Erdnuss-Nudeln mit Hähnchen';
update public.recipes set image_url = 'content/rezepte-bilder/quinoa-salat-feta-granatapfel.jpg' where title = 'Quinoa-Salat mit Feta & Granatapfelkernen';
update public.recipes set image_url = 'content/rezepte-bilder/gebratener-reis-ei-gemuese.jpg' where title = 'Gebratener Reis mit Ei & Gemüse';
update public.recipes set image_url = 'content/rezepte-bilder/big-salad-haehnchen-ei-avocado.jpg' where title = 'Big Salad mit Hähnchen, Ei & Avocado';
update public.recipes set image_url = 'content/rezepte-bilder/gemuese-frittata-ziegenkaese.jpg' where title = 'Gemüse-Frittata mit Ziegenkäse';
update public.recipes set image_url = 'content/rezepte-bilder/suesskartoffel-pommes-kraeuterquark.jpg' where title = 'Süßkartoffel-Pommes mit Kräuterquark';
update public.recipes set image_url = 'content/rezepte-bilder/beeren-smoothie-bowl-chia.jpg' where title = 'Beeren-Smoothie-Bowl mit Chiasamen';
update public.recipes set image_url = 'content/rezepte-bilder/raeucherlachs-vollkornbrot-frischkaese.jpg' where title = 'Räucherlachs-Vollkornbrot mit Frischkäse & Gurke';
update public.recipes set image_url = 'content/rezepte-bilder/putenspiesse-bulgur.jpg' where title = 'Putenspieße mit Joghurt-Marinade & Bulgur';
update public.recipes set image_url = 'content/rezepte-bilder/protein-waffeln-joghurt-beeren.jpg' where title = 'Protein-Waffeln mit Skyr & Beeren';
update public.recipes set image_url = 'content/rezepte-bilder/gefuellte-paprika-rinderhack-reis.jpg' where title = 'Gefüllte Paprika mit Rinderhack & Vollkornreis';
update public.recipes set image_url = 'content/rezepte-bilder/linsen-gemuese-suppe-vollkornbrot.jpg' where title = 'Linsen-Gemüse-Suppe mit Vollkornbrot';
update public.recipes set image_url = 'content/rezepte-bilder/thunfisch-ofenkartoffel-frischkaese.jpg' where title = 'Thunfisch-Ofenkartoffel mit Frischkäse-Dip';
update public.recipes set image_url = 'content/rezepte-bilder/bulgur-salat-feta-oliven.jpg' where title = 'Griechischer Bulgur-Salat mit Feta & Oliven';
update public.recipes set image_url = 'content/rezepte-bilder/kichererbsen-curry-spinat.jpg' where title = 'Kichererbsen-Curry mit Spinat';

-- 3) Coaching-Konzeptfotos (20 Bilder) — die 20 Coaching-Themen aus Runde 15 (sql/038)
-- ----------------------------------------------------------------------------
update public.coaching_content set image_url = 'content/coaching-bilder/achtsames-essen.jpg' where title = 'Achtsames Essen (Mindful Eating)';
update public.coaching_content set image_url = 'content/coaching-bilder/emotionales-essen.jpg' where title = 'Emotionales Essen erkennen und regulieren';
update public.coaching_content set image_url = 'content/coaching-bilder/zucker-belohnung-heisshunger.jpg' where title = 'Zucker, Belohnung & Heißhunger';
update public.coaching_content set image_url = 'content/coaching-bilder/saettigung-volumen-statt-kalorien.jpg' where title = 'Die Sättigungs-Formel: Volumen statt Kalorien';
update public.coaching_content set image_url = 'content/coaching-bilder/ernaehrung-darm-hirn-achse.jpg' where title = 'Ernährung & Stimmung: die Darm-Hirn-Achse';
update public.coaching_content set image_url = 'content/coaching-bilder/muskelmasse-langlebigkeit.jpg' where title = 'Muskelmasse & Greifkraft als Langlebigkeitsfaktor';
update public.coaching_content set image_url = 'content/coaching-bilder/vo2max-fitness-altersuhr.jpg' where title = 'VO2max und die Fitness-Alters-Uhr';
update public.coaching_content set image_url = 'content/coaching-bilder/zone2-training-metabolische-gesundheit.jpg' where title = 'Zone-2-Training & metabolische Gesundheit';
update public.coaching_content set image_url = 'content/coaching-bilder/hormesis-kaelte-waerme.jpg' where title = 'Hormesis: Kälte, Wärme & kontrollierter Stress';
update public.coaching_content set image_url = 'content/coaching-bilder/inflammaging-entzuendung-vorbeugen.jpg' where title = 'Inflammaging: chronischer Entzündung vorbeugen';
update public.coaching_content set image_url = 'content/coaching-bilder/gefuehle-benennen-affect-labeling.jpg' where title = 'Gefühle benennen, um sie zu regulieren';
update public.coaching_content set image_url = 'content/coaching-bilder/psychologische-flexibilitaet-act.jpg' where title = 'Psychologische Flexibilität statt Vermeidung';
update public.coaching_content set image_url = 'content/coaching-bilder/dankbarkeit-trainierbare-faehigkeit.jpg' where title = 'Dankbarkeit als trainierbare Fähigkeit';
update public.coaching_content set image_url = 'content/coaching-bilder/optimismus-erlernbarer-stil.jpg' where title = 'Optimismus als erlernbarer Stil';
update public.coaching_content set image_url = 'content/coaching-bilder/emotionale-granularitaet.jpg' where title = 'Emotionale Granularität: je präziser, desto stabiler';
update public.coaching_content set image_url = 'content/coaching-bilder/aktives-zuhoeren.jpg' where title = 'Aktives Zuhören als Schlüsselkompetenz';
update public.coaching_content set image_url = 'content/coaching-bilder/grenzen-setzen.jpg' where title = 'Grenzen setzen ohne schlechtes Gewissen';
update public.coaching_content set image_url = 'content/coaching-bilder/micro-moments-beziehungen.jpg' where title = 'Micro-Moments: die Kraft kleiner Gesten';
update public.coaching_content set image_url = 'content/coaching-bilder/soziales-kapital-lose-kontakte.jpg' where title = 'Soziales Kapital: die Stärke loser Kontakte';
update public.coaching_content set image_url = 'content/coaching-bilder/gewaltfreie-kommunikation.jpg' where title = 'Gewaltfreie Kommunikation in Konfliktgesprächen';
