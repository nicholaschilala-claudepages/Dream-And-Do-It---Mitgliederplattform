-- ============================================================================
-- Dream And Do It – Kundenplattform
-- 30 neue Coaching-Content-Themen: Präsentation & Bühne, Führung, Teams,
-- Unternehmenskultur (Nachtrag zu Runde 18, freigegeben nach Durchsicht des
-- Entwurfspakets "coaching-neue-30-themen.zip").
--
-- Alle 30 Themen folgen exakt demselben visuellen und inhaltlichen Format wie
-- die bisherigen 58 Coaching-Content-PDFs (Navy/Gold/Cinzel-Template, 3 Seiten
-- inkl. Titelseite, Quellenbox mit echten, per Websuche verifizierten
-- Primärquellen). Kein Kunde sieht diese neuen Dokumente automatisch — Zugriff
-- folgt wie gehabt der Opt-in-Logik aus sql/024_dokument_freigabe.sql, der
-- Admin muss sie über die Dokumente-Freigabe pro Kunde einzeln freischalten.
--
-- `image_url` bleibt für alle 30 bewusst NULL (wie bei jeder vorherigen neuen
-- Content-Charge) — Bildmaterial folgt erst, wenn der Nutzer die per separater
-- Bildprompt-Liste erzeugten Bilder nachliefert.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001–047 bereits liefen.
-- ============================================================================

insert into public.coaching_content (title, description, category, pdf_url) values
-- Präsentation & Bühne
('Lampenfieber umdeuten', 'Warum Nervosität vor Auftritten Treibstoff sein kann, keine Bremse.', 'Präsentation & Bühne', 'content/coaching/lampenfieber-umdeuten.pdf'),
('Kurz und klar vorbereiten', 'Das Pyramidenprinzip für prägnante Kurzvorträge.', 'Präsentation & Bühne', 'content/coaching/kurz-und-klar-vorbereiten.pdf'),
('Erzählen statt referieren', 'Warum eine Geschichte mehr überzeugt als eine Liste von Fakten.', 'Präsentation & Bühne', 'content/coaching/erzaehlen-statt-referieren.pdf'),
('Die Stimme gezielt einsetzen', 'Was Prosodie wirklich bewirkt — und was am Mehrabian-Mythos falsch ist.', 'Präsentation & Bühne', 'content/coaching/stimme-gezielt-einsetzen.pdf'),
('Präsenz ohne Performance', 'Warum Power Posing widerlegt ist — und was wirklich Präsenz schafft.', 'Präsentation & Bühne', 'content/coaching/praesenz-ohne-performance.pdf'),
('Schrittweise Exposition gegen Lampenfieber', 'Wie systematisches Üben Redeangst Stufe für Stufe abbaut.', 'Präsentation & Bühne', 'content/coaching/schrittweise-exposition-lampenfieber.pdf'),
('Fragen & Einwände souverän beantworten', 'Wie aktives Zuhören aus der Q&A-Runde keine Verteidigungsschlacht macht.', 'Präsentation & Bühne', 'content/coaching/fragen-einwaende-souveraen-beantworten.pdf'),
-- Führung
('Psychologische Sicherheit als Führungsaufgabe', 'Drei konkrete Verhaltensweisen, mit denen Führungskräfte Sicherheit aktiv gestalten.', 'Führung', 'content/coaching/psychologische-sicherheit-fuehrung.pdf'),
('Führen durch Vision (Transformationale Führung)', 'Wie eine überzeugende Vision mehr bewirkt als Vorgaben und Kontrolle.', 'Führung', 'content/coaching/fuehren-durch-vision.pdf'),
('Feedback mit dem SBI-Modell', 'Situation – Verhalten – Wirkung: konkret statt persönlich.', 'Führung', 'content/coaching/feedback-sbi-modell.pdf'),
('Klüger entscheiden unter Unsicherheit', 'Warum das Bauchgefühl trügt — und wie sich Entscheidungsqualität trainieren lässt.', 'Führung', 'content/coaching/kluger-entscheiden-unsicherheit.pdf'),
('Servant Leadership', 'Warum dienende Führung stärker wirkt als reine Anweisung.', 'Führung', 'content/coaching/servant-leadership.pdf'),
('Delegieren ohne Kontrollverlust', 'Warum Delegation ein Regler ist und keine Ein-/Aus-Taste.', 'Führung', 'content/coaching/delegieren-ohne-kontrollverlust.pdf'),
('Schwierige Gespräche führen', 'Warum in jedem kritischen Gespräch drei Gespräche gleichzeitig laufen.', 'Führung', 'content/coaching/schwierige-gespraeche-fuehren.pdf'),
-- Teams
('Was Spitzenteams wirklich ausmacht', 'Google''s "Project Aristotle" und die fünf Dynamiken erfolgreicher Teams.', 'Teams', 'content/coaching/was-spitzenteams-ausmacht.pdf'),
('Die klassischen Teamentwicklungsphasen', 'Was Tuckmans Forming-Storming-Norming-Performing-Modell für die Führung bedeutet.', 'Teams', 'content/coaching/tuckman-teamphasen.pdf'),
('Vielfalt als Leistungsfaktor im Team', 'Wann unterschiedliche Perspektiven Probleme wirklich besser lösen.', 'Teams', 'content/coaching/vielfalt-als-leistungsfaktor.pdf'),
('Team-Vertrauen durch bewusste Rituale aufbauen', 'Was wirksame Teamrituale gemeinsam haben.', 'Teams', 'content/coaching/vertrauen-durch-rituale.pdf'),
('Konflikte im Team konstruktiv nutzen', 'Was die Forschung zu Aufgaben- und Beziehungskonflikt wirklich zeigt.', 'Teams', 'content/coaching/konflikte-konstruktiv-nutzen.pdf'),
('Hybride Teams wirksam führen', 'Was die bislang belastbarste Studie zu Homeoffice und Teamleistung zeigt.', 'Teams', 'content/coaching/hybride-teams-fuehren.pdf'),
-- Unternehmenskultur
('Die drei Ebenen von Unternehmenskultur', 'Warum das Leitbild an der Wand nicht die tatsächliche Kultur zeigt.', 'Unternehmenskultur', 'content/coaching/drei-ebenen-unternehmenskultur.pdf'),
('Warum Menschen wirklich kündigen', 'Was die Forschung zu Kündigungsgründen tatsächlich zeigt.', 'Unternehmenskultur', 'content/coaching/warum-menschen-kuendigen.pdf'),
('Fehlerkultur — aus Fehlern als Organisation lernen', 'Warum offen gemeldete Fehler ein Zeichen von Stärke sind, nicht von Schwäche.', 'Unternehmenskultur', 'content/coaching/fehlerkultur-lernende-organisation.pdf'),
('Sinn als Motivationsmotor', 'Warum Bedeutung stärker motiviert als externe Anreize.', 'Unternehmenskultur', 'content/coaching/sinn-als-motivationsmotor.pdf'),
('Die ersten 90 Tage neuer Mitarbeitender', 'Warum der Start in eine Rolle wesentlich über deren Erfolg entscheidet.', 'Unternehmenskultur', 'content/coaching/onboarding-erste-90-tage.pdf'),
('Weniger, aber bessere Meetings', 'Wie sich Meeting-Kultur mit wenigen Stellschrauben spürbar verändert.', 'Unternehmenskultur', 'content/coaching/weniger-bessere-meetings.pdf'),
('Der Pygmalion-Effekt', 'Wie stille Erwartungen von Führungskräften Leistung prägen.', 'Unternehmenskultur', 'content/coaching/pygmalion-effekt.pdf'),
('Storytelling mit Daten', 'Warum Zahlen erst als Geschichte wirklich überzeugen.', 'Unternehmenskultur', 'content/coaching/storytelling-mit-daten.pdf'),
('Virtuelle Präsenz ohne Zoom-Fatigue', 'Warum Videocalls besonders müde machen — und was dagegen hilft.', 'Unternehmenskultur', 'content/coaching/virtuelle-praesenz-zoom-fatigue.pdf'),
('Das Harvard-Verhandlungskonzept', 'Wie sachbezogenes Verhandeln bessere Ergebnisse für beide Seiten schafft.', 'Unternehmenskultur', 'content/coaching/harvard-verhandlungskonzept.pdf');

-- ----------------------------------------------------------------------------
-- Themengruppen-Taxonomie erweitern (sql/045 führte 8 Gruppen ein). Die neuen
-- 30 Themen passen inhaltlich in keine der bestehenden 8 Gruppen — sie bilden
-- vier neue, in sich klar abgegrenzte Gruppen (analog Kicker-Kategorie in den
-- PDFs selbst).
-- ----------------------------------------------------------------------------

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
    'konsum_digitales',
    'praesentation_kommunikation',
    'fuehrung',
    'teams_zusammenarbeit',
    'unternehmenskultur_arbeitswelt'
  ));

-- 9) praesentation_kommunikation (7)
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Lampenfieber umdeuten';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Kurz und klar vorbereiten';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Erzählen statt referieren';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Die Stimme gezielt einsetzen';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Präsenz ohne Performance';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Schrittweise Exposition gegen Lampenfieber';
update public.coaching_content set theme_group = 'praesentation_kommunikation' where title = 'Fragen & Einwände souverän beantworten';

-- 10) fuehrung (7)
update public.coaching_content set theme_group = 'fuehrung' where title = 'Psychologische Sicherheit als Führungsaufgabe';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Führen durch Vision (Transformationale Führung)';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Feedback mit dem SBI-Modell';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Klüger entscheiden unter Unsicherheit';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Servant Leadership';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Delegieren ohne Kontrollverlust';
update public.coaching_content set theme_group = 'fuehrung' where title = 'Schwierige Gespräche führen';

-- 11) teams_zusammenarbeit (6)
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Was Spitzenteams wirklich ausmacht';
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Die klassischen Teamentwicklungsphasen';
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Vielfalt als Leistungsfaktor im Team';
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Team-Vertrauen durch bewusste Rituale aufbauen';
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Konflikte im Team konstruktiv nutzen';
update public.coaching_content set theme_group = 'teams_zusammenarbeit' where title = 'Hybride Teams wirksam führen';

-- 12) unternehmenskultur_arbeitswelt (10)
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Die drei Ebenen von Unternehmenskultur';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Warum Menschen wirklich kündigen';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Fehlerkultur — aus Fehlern als Organisation lernen';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Sinn als Motivationsmotor';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Die ersten 90 Tage neuer Mitarbeitender';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Weniger, aber bessere Meetings';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Der Pygmalion-Effekt';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Storytelling mit Daten';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Virtuelle Präsenz ohne Zoom-Fatigue';
update public.coaching_content set theme_group = 'unternehmenskultur_arbeitswelt' where title = 'Das Harvard-Verhandlungskonzept';

-- ----------------------------------------------------------------------------
-- Verifikation (bitte nach dem Ausführen prüfen)
-- ----------------------------------------------------------------------------
-- Erwartet: 88 (58 bisherige + 30 neue).
select count(*) as coaching_content_gesamt from public.coaching_content;

-- Erwartet: 0 Zeilen (keine der 30 neuen Titel ohne theme_group).
select title from public.coaching_content
where theme_group is null
  and title in (
    'Lampenfieber umdeuten', 'Kurz und klar vorbereiten', 'Erzählen statt referieren',
    'Die Stimme gezielt einsetzen', 'Präsenz ohne Performance', 'Schrittweise Exposition gegen Lampenfieber',
    'Fragen & Einwände souverän beantworten', 'Psychologische Sicherheit als Führungsaufgabe',
    'Führen durch Vision (Transformationale Führung)', 'Feedback mit dem SBI-Modell',
    'Klüger entscheiden unter Unsicherheit', 'Servant Leadership', 'Delegieren ohne Kontrollverlust',
    'Schwierige Gespräche führen', 'Was Spitzenteams wirklich ausmacht', 'Die klassischen Teamentwicklungsphasen',
    'Vielfalt als Leistungsfaktor im Team', 'Team-Vertrauen durch bewusste Rituale aufbauen',
    'Konflikte im Team konstruktiv nutzen', 'Hybride Teams wirksam führen', 'Die drei Ebenen von Unternehmenskultur',
    'Warum Menschen wirklich kündigen', 'Fehlerkultur — aus Fehlern als Organisation lernen',
    'Sinn als Motivationsmotor', 'Die ersten 90 Tage neuer Mitarbeitender', 'Weniger, aber bessere Meetings',
    'Der Pygmalion-Effekt', 'Storytelling mit Daten', 'Virtuelle Präsenz ohne Zoom-Fatigue',
    'Das Harvard-Verhandlungskonzept'
  );
