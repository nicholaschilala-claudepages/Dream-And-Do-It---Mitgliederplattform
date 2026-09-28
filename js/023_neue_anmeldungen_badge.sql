-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 19: In-App-Badge im Trainer-Bereich für neue Kunden-Anmeldungen.
--
-- Hintergrund: Der Admin soll mitbekommen, wenn sich eine neue Person
-- registriert (nicht zuletzt, weil neue Kunden jetzt erst nach Freigabe durch
-- den Admin Zugriff auf Training/Ernährung/Coaching erhalten, siehe
-- sql/022_neue_kunden_ohne_reiter_zugriff.sql). Entscheidung aus der
-- Rückfrage vom 26.09.2026: nur ein In-App-Badge (kein zusätzlicher
-- E-Mail-Versand).
--
-- new_signup_seen = false markiert eine noch nicht vom Admin gesichtete
-- Registrierung. Wird beim Anlegen des Profils (handle_new_user-Trigger, s.
-- sql/001) automatisch auf false gesetzt (Spalten-Default), da der Trigger
-- diese Spalte nicht explizit befüllt. Der Admin markiert neue Anmeldungen
-- als gesehen, indem er die Kundenübersicht in betrieb.html öffnet
-- (js/betrieb.js: markNewSignupsSeen()).
--
-- WICHTIG: Bestehende Kunden werden hier direkt im Anschluss als "gesehen"
-- markiert, damit der Badge nach dem Einspielen dieser Migration bei 0
-- startet und nicht plötzlich alle bisherigen Test-Kunden als "neu" zählt.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-022 bereits liefen.
-- ============================================================================

alter table public.profiles add column if not exists new_signup_seen boolean not null default false;

comment on column public.profiles.new_signup_seen is 'false = Registrierung wurde vom Admin noch nicht gesichtet (Badge in betrieb.html). Neue Kunden starten mit false; der Admin markiert per markNewSignupsSeen() als gesehen.';

-- Bestehende Kunden (alles, was VOR dieser Migration schon existierte) gilt
-- als bereits gesehen, damit der Badge nicht rückwirkend hochzählt.
update public.profiles set new_signup_seen = true where role = 'client';
