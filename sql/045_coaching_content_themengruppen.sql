-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Themengruppen-Filter für den Coaching-Content ("Content"-Unterreiter)
--
-- Auf ausdrücklichen Wunsch des Kunden: der Content soll nach thematischen
-- Gruppen filterbar sein (Beispiele des Kunden: "Ernährungspsychologie",
-- "Gesundheit und Bewegung", "Atomic Habits"). Die bestehende Spalte
-- `category` (siehe sql/004_coaching.sql) ist ein reines Freitext-/
-- Anzeige-Label ohne festen Wertebereich und in der Praxis auf 11 verschiedene
-- Werte angewachsen (u.a. "Mentalcoaching", "Gesundheit & Bewegung",
-- "Selbstorganisation", "Persönlichkeitsentwicklung", "Leadership",
-- "Atomic Habits", "Konsum", "Ernährungspsychologie", "Langlebigkeit &
-- gesundes Altern", "Emotionale Kompetenz", "Kommunikation & Beziehungen") –
-- zu granular für eine übersichtliche Filter-UI. `theme_group` führt daher
-- einen zweiten, kuratierten Wertebereich mit fester Optionsliste ein
-- (per CHECK-Constraint erzwungen), der die bestehenden 11 Kategorien zu
-- 8 größeren, sinnvoll browsbaren Themengruppen zusammenfasst. `category`
-- bleibt unverändert erhalten (weiterhin als feineres Anzeige-Label sichtbar).
--
-- Taxonomie (8 Gruppen, hergeleitet aus den tatsächlich vorhandenen 58
-- Content-Titeln – nicht nur aus den 3 Kundenbeispielen):
--
--   1) ernaehrungspsychologie
--      = bisherige Kategorie "Ernährungspsychologie" unverändert (5 Items).
--        Eigene Gruppe, weil psychologisches Essverhalten inhaltlich klar von
--        den übrigen Themen abgegrenzt ist und der Kunde diesen Begriff
--        explizit als Beispiel genannt hat.
--
--   2) gesundheit_bewegung_langlebigkeit
--      = bisherige Kategorien "Gesundheit & Bewegung" (4) + "Langlebigkeit &
--        gesundes Altern" (5) + die beiden körperlich/physiologisch
--        ausgerichteten "Mentalcoaching"-Themen Bewegung als Antidepressivum
--        und Schlaf & Regeneration (2) = 11 Items. Zusammengefasst, weil alle
--        Items körperliche Gesundheit, Bewegungswissenschaft und langfristige
--        Gesunderhaltung behandeln (entspricht dem Kundenbeispiel "Gesundheit
--        und Bewegung").
--
--   3) atomic_habits_gewohnheiten
--      = bisherige Kategorie "Atomic Habits" (4) + das "Mentalcoaching"-Thema
--        Gewohnheiten aufbauen: der Habit-Loop (1) = 5 Items. Zusammengefasst,
--        weil beide Male reine Gewohnheitsbildung im Zentrum steht
--        (entspricht dem Kundenbeispiel "Atomic Habits").
--
--   4) emotionen_resilienz_mindset
--      = bisherige Kategorie "Emotionale Kompetenz" (5) + die
--        "Mentalcoaching"-Themen Rückschläge & Resilienz, Perfektionismus &
--        Selbstmitgefühl, Willenskraft: Kopfsache?, Achtsamkeit &
--        Stressregulation, Mindset & Erwartungseffekt (5) = 10 Items.
--        Zusammengefasst, weil alle Items um Emotionsregulation, mentale
--        Widerstandsfähigkeit und die innere Haltung gegenüber
--        Herausforderungen kreisen.
--
--   5) beziehungen_kommunikation
--      = bisherige Kategorie "Kommunikation & Beziehungen" (5) + das
--        "Mentalcoaching"-Thema Soziale Unterstützung & Accountability (1)
--        = 6 Items. Zusammengefasst, weil beide zwischenmenschliche
--        Beziehungsgestaltung und Kommunikation behandeln.
--
--   6) ziele_selbstorganisation
--      = bisherige Kategorie "Selbstorganisation" (4) + die
--        "Mentalcoaching"-Zielsetzungsthemen Zielklarheit mit WOOP und
--        Zielsetzungstheorie (SMART-Ziele) (2) = 6 Items. Zusammengefasst,
--        weil Zeitmanagement und Zielsetzung beides Werkzeuge der
--        Selbststeuerung sind.
--
--   7) persoenlichkeitsentwicklung_leadership
--      = bisherige Kategorien "Persönlichkeitsentwicklung" (4) + "Leadership"
--        (4) + die ursprünglichen drei ersten "Mentalcoaching"-Themen Der
--        innere Dialog: Selbstgespräche & Vorbilder, Musik, BPM & Flow,
--        Selbstwirksamkeit verstehen und stärken (3) = 11 Items.
--        Zusammengefasst, weil Selbstführung und Führung anderer im
--        Coaching-Kontext eng zusammenhängen (Leadership ist laut sql/028
--        bewusst universell angelegt, nicht nur für B2B-Führungskräfte).
--
--   8) konsum_digitales
--      = bisherige Kategorie "Konsum" unverändert (4 Items). Eigene Gruppe,
--        weil digitaler Konsum/Social Media/Nachrichten inhaltlich klar von
--        den übrigen Themen abgegrenzt ist.
--
-- Summe: 5 + 11 + 5 + 10 + 6 + 6 + 11 + 4 = 58 Items = exakt alle
-- bestehenden coaching_content-Zeilen (siehe sql/007, 015, 019, 025, 028, 038
-- für die ursprünglichen INSERTs). Jede der 58 Zeilen erhält unten genau ein
-- UPDATE.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-044 bereits liefen.
-- ============================================================================

alter table public.coaching_content add column if not exists theme_group text;

alter table public.coaching_content drop constraint if exists coaching_content_theme_group_check;
alter table public.coaching_content add constraint coaching_content_theme_group_check
  check (theme_group is null or theme_group in (
    'ernaehrungspsychologie',
    'gesundheit_bewegung_langlebigkeit',
    'atomic_habits_gewohnheiten',
    'emotionen_resilienz_mindset',
    'beziehungen_kommunikation',
    'ziele_selbstorganisation',
    'persoenlichkeitsentwicklung_leadership',
    'konsum_digitales'
  ));

comment on column public.coaching_content.theme_group is 'Kuratierte Themengruppe für die Filter-UI im "Content"-Unterreiter (fester Wertebereich per CHECK-Constraint, siehe Taxonomie-Kommentar oben). Ergänzt die freie Kategorie in `category`, ersetzt sie nicht.';

-- 1) ernaehrungspsychologie (5)
update public.coaching_content set theme_group = 'ernaehrungspsychologie' where title = 'Achtsames Essen (Mindful Eating)';
update public.coaching_content set theme_group = 'ernaehrungspsychologie' where title = 'Emotionales Essen erkennen und regulieren';
update public.coaching_content set theme_group = 'ernaehrungspsychologie' where title = 'Zucker, Belohnung & Heißhunger';
update public.coaching_content set theme_group = 'ernaehrungspsychologie' where title = 'Die Sättigungs-Formel: Volumen statt Kalorien';
update public.coaching_content set theme_group = 'ernaehrungspsychologie' where title = 'Ernährung & Stimmung: die Darm-Hirn-Achse';

-- 2) gesundheit_bewegung_langlebigkeit (11)
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Sitzen & Seitenschlafen';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Stress, Cortisol & Bauchfett';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Einsamkeit als Gesundheitsrisiko';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Naturkontakt & mentale Erholung';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Muskelmasse & Greifkraft als Langlebigkeitsfaktor';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'VO2max und die Fitness-Alters-Uhr';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Zone-2-Training & metabolische Gesundheit';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Hormesis: Kälte, Wärme & kontrollierter Stress';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Inflammaging: chronischer Entzündung vorbeugen';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Bewegung als Antidepressivum';
update public.coaching_content set theme_group = 'gesundheit_bewegung_langlebigkeit' where title = 'Schlaf & Regeneration';

-- 3) atomic_habits_gewohnheiten (5)
update public.coaching_content set theme_group = 'atomic_habits_gewohnheiten' where title = 'Die vier Gesetze des Verhaltenswandels';
update public.coaching_content set theme_group = 'atomic_habits_gewohnheiten' where title = 'Identitätsbasierte Gewohnheiten';
update public.coaching_content set theme_group = 'atomic_habits_gewohnheiten' where title = 'Habit Stacking & Umgebungsgestaltung';
update public.coaching_content set theme_group = 'atomic_habits_gewohnheiten' where title = 'Das Tal der Enttäuschung';
update public.coaching_content set theme_group = 'atomic_habits_gewohnheiten' where title = 'Gewohnheiten aufbauen: der Habit-Loop';

-- 4) emotionen_resilienz_mindset (10)
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Gefühle benennen, um sie zu regulieren';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Psychologische Flexibilität statt Vermeidung';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Dankbarkeit als trainierbare Fähigkeit';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Optimismus als erlernbarer Stil';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Emotionale Granularität: je präziser, desto stabiler';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Rückschläge & Resilienz';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Perfektionismus & Selbstmitgefühl';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Willenskraft: Kopfsache?';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Achtsamkeit & Stressregulation';
update public.coaching_content set theme_group = 'emotionen_resilienz_mindset' where title = 'Mindset & Erwartungseffekt';

-- 5) beziehungen_kommunikation (6)
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Aktives Zuhören als Schlüsselkompetenz';
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Grenzen setzen ohne schlechtes Gewissen';
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Micro-Moments: die Kraft kleiner Gesten';
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Soziales Kapital: die Stärke loser Kontakte';
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Gewaltfreie Kommunikation in Konfliktgesprächen';
update public.coaching_content set theme_group = 'beziehungen_kommunikation' where title = 'Soziale Unterstützung & Accountability';

-- 6) ziele_selbstorganisation (6)
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Eisenhower-Prinzip';
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Termine mit dir selbst';
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Deep Work & Fokus-Blöcke';
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Chronotyp & Leistungskurve';
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Zielklarheit mit WOOP';
update public.coaching_content set theme_group = 'ziele_selbstorganisation' where title = 'Zielsetzungstheorie (SMART-Ziele)';

-- 7) persoenlichkeitsentwicklung_leadership (11)
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Werteklärung als Kompass';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Innerer Kritiker vs. innerer Coach';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Kognitive Verzerrungen';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Sinn & Bedeutung';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Self-Leadership';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Situatives Führen';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Psychologische Sicherheit im Team';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Feedback geben und nehmen';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Der innere Dialog: Selbstgespräche & Vorbilder';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Musik, BPM & Flow';
update public.coaching_content set theme_group = 'persoenlichkeitsentwicklung_leadership' where title = 'Selbstwirksamkeit verstehen und stärken';

-- 8) konsum_digitales (4)
update public.coaching_content set theme_group = 'konsum_digitales' where title = 'Digitaler Konsum & Dopamin-Regulation';
update public.coaching_content set theme_group = 'konsum_digitales' where title = 'Social Media & der Vergleich mit anderen';
update public.coaching_content set theme_group = 'konsum_digitales' where title = 'Informationsflut & Nachrichten-Diät';
update public.coaching_content set theme_group = 'konsum_digitales' where title = 'Materialismus vs. Wohlbefinden';
