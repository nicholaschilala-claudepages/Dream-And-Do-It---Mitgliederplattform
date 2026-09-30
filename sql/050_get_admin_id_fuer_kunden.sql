-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Bugfix: Kunden konnten dem Trainer nicht schreiben ("Coach-Konto konnte
--         nicht gefunden werden"). Ursache: js/messages.js#getAdminId() hat
--         bisher direkt `select id from profiles where role = 'admin'`
--         ausgeführt – das scheitert an der Row-Level-Security auf
--         `profiles`, denn weder "profiles_select_own" (nur die eigene
--         Zeile) noch "profiles_select_admin" (nur wenn der AKTUELLE Nutzer
--         selbst Admin ist, siehe sql/001_fundament.sql) erlaubt einem
--         Kunden, die Profilzeile des Trainers zu lesen. Das Senden der
--         Nachricht selbst (messages_insert, sql/036) war davon nicht
--         betroffen und funktioniert bereits korrekt – nur die Ermittlung
--         der Empfänger-ID scheiterte vorher.
--
-- Trainer -> Kunde funktioniert bereits einwandfrei (der Admin darf über
-- "profiles_select_admin" ohnehin alle Kundenprofile lesen) und wird durch
-- diese Migration nicht verändert.
--
-- Fix: eine schlanke SECURITY DEFINER Funktion nach dem etablierten Muster
-- von is_admin_id() (sql/036) – sie liefert NUR die UUID des Trainer-Accounts
-- zurück, nicht E-Mail oder Name. Das ist bewusst enger als eine zusätzliche
-- RLS-SELECT-Policy auf profiles für role='admin', weil RLS nur zeilenweise
-- greift: eine solche Policy würde zwangsläufig auch email und full_name des
-- Trainers für jeden eingeloggten Kunden offenlegen, was hier nicht nötig ist.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001–049 bereits liefen.
-- ============================================================================

create or replace function public.get_admin_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select id from public.profiles where role = 'admin' limit 1;
$$;

comment on function public.get_admin_id() is 'Liefert nur die UUID des Trainer/Admin-Accounts (keine weiteren Spalten) – ermöglicht Kunden, im Nachrichten-Tab den Trainer als Empfänger zu finden, ohne dass profiles per RLS geöffnet werden muss.';

grant execute on function public.get_admin_id() to authenticated;

-- Verifikation: sollte genau eine Zeile mit der Admin-UUID liefern
select public.get_admin_id() as trainer_id;
