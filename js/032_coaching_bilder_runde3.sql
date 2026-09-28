-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 32: Titelbilder für die 22 Coaching-Content-Themen aus Runde 3
--            (Selbstorganisation, Persönlichkeitsentwicklung, Leadership,
--            Atomic Habits, Konsum, Gesundheit & Bewegung).
--
-- Die Bilder selbst entstehen über gemini-bildprompts-runde3.md (Teil A).
-- Sobald du die Bilder erzeugt und mir als PDF hochgeladen hast, lade ich sie
-- in content/coaching-bilder/ in dein Repository. Diese SQL-Datei kannst du
-- unabhängig davon schon jetzt ausführen – image_url zeigt erst auf ein Bild,
-- sobald die Datei tatsächlich im Repository liegt, vorher bleibt das Feld
-- schlicht ins Leere zeigend, ohne Fehler.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-031 bereits liefen.
-- ============================================================================

update public.coaching_content set image_url = 'content/coaching-bilder/eisenhower-prinzip.jpg' where title = 'Eisenhower-Prinzip';
update public.coaching_content set image_url = 'content/coaching-bilder/termine-mit-dir-selbst.jpg' where title = 'Termine mit dir selbst';
update public.coaching_content set image_url = 'content/coaching-bilder/deep-work-fokus-bloecke.jpg' where title = 'Deep Work & Fokus-Blöcke';
update public.coaching_content set image_url = 'content/coaching-bilder/chronotyp-leistungskurve.jpg' where title = 'Chronotyp & Leistungskurve';
update public.coaching_content set image_url = 'content/coaching-bilder/werteklaerung-als-kompass.jpg' where title = 'Werteklärung als Kompass';
update public.coaching_content set image_url = 'content/coaching-bilder/innerer-kritiker-vs-coach.jpg' where title = 'Innerer Kritiker vs. innerer Coach';
update public.coaching_content set image_url = 'content/coaching-bilder/kognitive-verzerrungen.jpg' where title = 'Kognitive Verzerrungen';
update public.coaching_content set image_url = 'content/coaching-bilder/sinn-und-bedeutung.jpg' where title = 'Sinn & Bedeutung';
update public.coaching_content set image_url = 'content/coaching-bilder/self-leadership.jpg' where title = 'Self-Leadership';
update public.coaching_content set image_url = 'content/coaching-bilder/situatives-fuehren.jpg' where title = 'Situatives Führen';
update public.coaching_content set image_url = 'content/coaching-bilder/psychologische-sicherheit-im-team.jpg' where title = 'Psychologische Sicherheit im Team';
update public.coaching_content set image_url = 'content/coaching-bilder/feedback-geben-und-nehmen.jpg' where title = 'Feedback geben und nehmen';
update public.coaching_content set image_url = 'content/coaching-bilder/vier-gesetze-verhaltenswandel.jpg' where title = 'Die vier Gesetze des Verhaltenswandels';
update public.coaching_content set image_url = 'content/coaching-bilder/identitaetsbasierte-gewohnheiten.jpg' where title = 'Identitätsbasierte Gewohnheiten';
update public.coaching_content set image_url = 'content/coaching-bilder/habit-stacking-umgebungsgestaltung.jpg' where title = 'Habit Stacking & Umgebungsgestaltung';
update public.coaching_content set image_url = 'content/coaching-bilder/tal-der-enttaeuschung.jpg' where title = 'Das Tal der Enttäuschung';
update public.coaching_content set image_url = 'content/coaching-bilder/digitaler-konsum-dopamin.jpg' where title = 'Digitaler Konsum & Dopamin-Regulation';
update public.coaching_content set image_url = 'content/coaching-bilder/social-comparison-mentale-gesundheit.jpg' where title = 'Social Media & der Vergleich mit anderen';
update public.coaching_content set image_url = 'content/coaching-bilder/informationsflut-nachrichten-diaet.jpg' where title = 'Informationsflut & Nachrichten-Diät';
update public.coaching_content set image_url = 'content/coaching-bilder/materialismus-vs-wohlbefinden.jpg' where title = 'Materialismus vs. Wohlbefinden';
update public.coaching_content set image_url = 'content/coaching-bilder/einsamkeit-als-gesundheitsrisiko.jpg' where title = 'Einsamkeit als Gesundheitsrisiko';
update public.coaching_content set image_url = 'content/coaching-bilder/naturkontakt-mentale-erholung.jpg' where title = 'Naturkontakt & mentale Erholung';
