-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 14: Nachrichten – Kunden dürfen NUR an den Trainer/Coach schreiben,
--           nie direkt an andere Kunden. Bisher war das nur eine UI-seitige
--           Einschränkung (die Empfängerauswahl im Nachrichten-Tab zeigt
--           Kunden ohnehin nur den Admin-Account an) – auf Datenbankebene
--           konnte ein Kunde technisch trotzdem eine beliebige recipient_id
--           (z.B. eines anderen Kunden) einsetzen, da messages_insert das
--           bisher nicht prüfte. Diese Migration schließt diese Lücke direkt
--           in der Row-Level-Security-Policy, unabhängig von der Oberfläche.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-035 bereits liefen.
-- ============================================================================

-- Hilfsfunktion: ist eine gegebene Profil-ID ein Admin/Trainer-Account?
-- (Gegenstück zu public.is_admin(), das nur den AKTUELL eingeloggten Nutzer
-- prüft – hier brauchen wir die Prüfung für die recipient_id der Nachricht.)
create or replace function public.is_admin_id(profile_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = profile_id and role = 'admin'
  );
$$;

comment on function public.is_admin_id(uuid) is 'Wie is_admin(), aber für eine übergebene Profil-ID statt für auth.uid() – wird u.a. von messages_insert genutzt, um sicherzustellen, dass Kunden nur an Trainer/Admin-Accounts schreiben können.';

-- messages_insert verschärfen: ein NICHT-Admin-Absender darf nur an einen
-- Admin-Account (den Trainer) schreiben, nie an einen anderen Kunden. Ein
-- Admin-Absender darf weiterhin an jeden Kunden schreiben (unverändert).
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and not public.is_locked()
    and (
      public.is_admin()                    -- Trainer darf an alle schreiben
      or public.is_admin_id(recipient_id)   -- Kunde darf nur an den Trainer schreiben
    )
  );
