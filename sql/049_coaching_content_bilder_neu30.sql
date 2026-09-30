-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Bilder für die 30 in sql/048 eingeführten Coaching-Themen (Präsentation &
-- Bühne, Führung, Teams, Unternehmenskultur). Der Nutzer hat die Bilder aus
-- `bildprompt-liste-praesentation-fuehrung-teams-kultur.md` per Gemini
-- erzeugt und als PDF hochgeladen; die Dateien wurden extrahiert und liegen
-- jetzt unter `content/coaching-bilder/<slug>.jpg`.
-- Im Supabase SQL Editor ausführen, NACHDEM 001–048 bereits liefen.
-- Hinweis: image_url zeigt jetzt auf .jpg-Dateien in content/coaching-bilder/
-- (nicht content/coaching/, das ist der Ordner für die PDF-Downloads).
-- ============================================================================

update public.coaching_content set image_url = 'content/coaching-bilder/lampenfieber-umdeuten.jpg' where title = 'Lampenfieber umdeuten';
update public.coaching_content set image_url = 'content/coaching-bilder/kurz-und-klar-vorbereiten.jpg' where title = 'Kurz und klar vorbereiten';
update public.coaching_content set image_url = 'content/coaching-bilder/erzaehlen-statt-referieren.jpg' where title = 'Erzählen statt referieren';
update public.coaching_content set image_url = 'content/coaching-bilder/stimme-gezielt-einsetzen.jpg' where title = 'Die Stimme gezielt einsetzen';
update public.coaching_content set image_url = 'content/coaching-bilder/praesenz-ohne-performance.jpg' where title = 'Präsenz ohne Performance';
update public.coaching_content set image_url = 'content/coaching-bilder/schrittweise-exposition-lampenfieber.jpg' where title = 'Schrittweise Exposition gegen Lampenfieber';
update public.coaching_content set image_url = 'content/coaching-bilder/fragen-einwaende-souveraen-beantworten.jpg' where title = 'Fragen & Einwände souverän beantworten';
update public.coaching_content set image_url = 'content/coaching-bilder/psychologische-sicherheit-fuehrung.jpg' where title = 'Psychologische Sicherheit als Führungsaufgabe';
update public.coaching_content set image_url = 'content/coaching-bilder/fuehren-durch-vision.jpg' where title = 'Führen durch Vision (Transformationale Führung)';
update public.coaching_content set image_url = 'content/coaching-bilder/feedback-sbi-modell.jpg' where title = 'Feedback mit dem SBI-Modell';
update public.coaching_content set image_url = 'content/coaching-bilder/kluger-entscheiden-unsicherheit.jpg' where title = 'Klüger entscheiden unter Unsicherheit';
update public.coaching_content set image_url = 'content/coaching-bilder/servant-leadership.jpg' where title = 'Servant Leadership';
update public.coaching_content set image_url = 'content/coaching-bilder/delegieren-ohne-kontrollverlust.jpg' where title = 'Delegieren ohne Kontrollverlust';
update public.coaching_content set image_url = 'content/coaching-bilder/schwierige-gespraeche-fuehren.jpg' where title = 'Schwierige Gespräche führen';
update public.coaching_content set image_url = 'content/coaching-bilder/was-spitzenteams-ausmacht.jpg' where title = 'Was Spitzenteams wirklich ausmacht';
update public.coaching_content set image_url = 'content/coaching-bilder/tuckman-teamphasen.jpg' where title = 'Die klassischen Teamentwicklungsphasen';
update public.coaching_content set image_url = 'content/coaching-bilder/vielfalt-als-leistungsfaktor.jpg' where title = 'Vielfalt als Leistungsfaktor im Team';
update public.coaching_content set image_url = 'content/coaching-bilder/vertrauen-durch-rituale.jpg' where title = 'Team-Vertrauen durch bewusste Rituale aufbauen';
update public.coaching_content set image_url = 'content/coaching-bilder/konflikte-konstruktiv-nutzen.jpg' where title = 'Konflikte im Team konstruktiv nutzen';
update public.coaching_content set image_url = 'content/coaching-bilder/hybride-teams-fuehren.jpg' where title = 'Hybride Teams wirksam führen';
update public.coaching_content set image_url = 'content/coaching-bilder/drei-ebenen-unternehmenskultur.jpg' where title = 'Die drei Ebenen von Unternehmenskultur';
update public.coaching_content set image_url = 'content/coaching-bilder/warum-menschen-kuendigen.jpg' where title = 'Warum Menschen wirklich kündigen';
update public.coaching_content set image_url = 'content/coaching-bilder/fehlerkultur-lernende-organisation.jpg' where title = 'Fehlerkultur — aus Fehlern als Organisation lernen';
update public.coaching_content set image_url = 'content/coaching-bilder/sinn-als-motivationsmotor.jpg' where title = 'Sinn als Motivationsmotor';
update public.coaching_content set image_url = 'content/coaching-bilder/onboarding-erste-90-tage.jpg' where title = 'Die ersten 90 Tage neuer Mitarbeitender';
update public.coaching_content set image_url = 'content/coaching-bilder/weniger-bessere-meetings.jpg' where title = 'Weniger, aber bessere Meetings';
update public.coaching_content set image_url = 'content/coaching-bilder/pygmalion-effekt.jpg' where title = 'Der Pygmalion-Effekt';
update public.coaching_content set image_url = 'content/coaching-bilder/storytelling-mit-daten.jpg' where title = 'Storytelling mit Daten';
update public.coaching_content set image_url = 'content/coaching-bilder/virtuelle-praesenz-zoom-fatigue.jpg' where title = 'Virtuelle Präsenz ohne Zoom-Fatigue';
update public.coaching_content set image_url = 'content/coaching-bilder/harvard-verhandlungskonzept.jpg' where title = 'Das Harvard-Verhandlungskonzept';

-- Verifikation: alle 30 Titel sollten jetzt image_url gesetzt haben (erwartet 0 Zeilen)
select title from public.coaching_content
where image_url is null
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

-- Erwartet: 88 (alle Coaching-Einträge mit Bild) — vorher 58, jetzt 58 + 30
select count(*) as coaching_mit_bild from public.coaching_content where image_url is not null;
