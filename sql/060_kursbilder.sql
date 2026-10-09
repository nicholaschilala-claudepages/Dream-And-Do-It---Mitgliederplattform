-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Bildzuordnung für die 18 Kursformate aus sql/059 (Runde 22).
-- Die Bilder (Gemini, 16:9, 1024x572) liegen unter content/uebungen/kurs-*.jpg.
-- Idempotent: setzt image_url nur, wenn der Kurs existiert.
-- Im Supabase SQL Editor ausführen, NACHDEM 059 lief.
-- ============================================================================

update public.exercises set image_url = 'content/uebungen/kurs-yoga.jpg' where name = 'Kurs: Yoga (Hatha/Vinyasa)';
update public.exercises set image_url = 'content/uebungen/kurs-pilates.jpg' where name = 'Kurs: Pilates';
update public.exercises set image_url = 'content/uebungen/kurs-rueckenfit.jpg' where name = 'Kurs: Rückenfit (Rückenschule)';
update public.exercises set image_url = 'content/uebungen/kurs-faszientraining.jpg' where name = 'Kurs: Faszientraining';
update public.exercises set image_url = 'content/uebungen/kurs-stretching-mobility.jpg' where name = 'Kurs: Stretching & Mobility';
update public.exercises set image_url = 'content/uebungen/kurs-tai-chi-qigong.jpg' where name = 'Kurs: Tai Chi / Qigong';
update public.exercises set image_url = 'content/uebungen/kurs-spinning-indoor-cycling.jpg' where name = 'Kurs: Spinning / Indoor Cycling';
update public.exercises set image_url = 'content/uebungen/kurs-zumba-dance-fitness.jpg' where name = 'Kurs: Zumba / Dance Fitness';
update public.exercises set image_url = 'content/uebungen/kurs-aqua-fitness.jpg' where name = 'Kurs: Aqua-Fitness';
update public.exercises set image_url = 'content/uebungen/kurs-step-aerobic.jpg' where name = 'Kurs: Step-Aerobic';
update public.exercises set image_url = 'content/uebungen/kurs-lauftreff.jpg' where name = 'Kurs: Lauftreff / Lauf-Gruppe';
update public.exercises set image_url = 'content/uebungen/kurs-cardio-box-kickbox-fitness.jpg' where name = 'Kurs: Cardio-Box / Kickbox-Fitness';
update public.exercises set image_url = 'content/uebungen/kurs-hiit-tabata.jpg' where name = 'Kurs: HIIT / Tabata (Gruppenkurs)';
update public.exercises set image_url = 'content/uebungen/kurs-bootcamp-zirkeltraining.jpg' where name = 'Kurs: Bootcamp / Zirkeltraining';
update public.exercises set image_url = 'content/uebungen/kurs-bauch-beine-po.jpg' where name = 'Kurs: Bauch-Beine-Po (BBP)';
update public.exercises set image_url = 'content/uebungen/kurs-bodypump-langhantel.jpg' where name = 'Kurs: Bodypump (Langhantel-Gruppenkurs)';
update public.exercises set image_url = 'content/uebungen/kurs-functional-kettlebell.jpg' where name = 'Kurs: Functional Training / Kettlebell';
update public.exercises set image_url = 'content/uebungen/kurs-kraftzirkel.jpg' where name = 'Kurs: Kraftzirkel (Gerätezirkel)';
