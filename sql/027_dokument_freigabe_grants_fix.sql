-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Fix: "permission denied for table client_coaching_content_access" bzw.
-- "...client_recipe_access" beim Öffnen der Dokumente-Freigabe in Betrieb.
--
-- Ursache: sql/024_dokument_freigabe.sql hat für die beiden neuen Tabellen
-- RLS-Policies angelegt, aber die zusätzlich in Postgres/Supabase nötigen
-- GRANT-Statements auf die Rolle "authenticated" vergessen (siehe die
-- entsprechenden GRANTs bei allen anderen Tabellen, z.B. sql/002, sql/004).
-- Ohne GRANT bekommt niemand — auch kein Admin — überhaupt Basiszugriff auf
-- die Tabelle, unabhängig von den RLS-Policies.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-026 bereits liefen. Ändert
-- nichts an Daten oder Policies, ergänzt nur die fehlenden Rechte.
-- ============================================================================

grant select, insert, update, delete on public.client_recipe_access to authenticated;
grant select, insert, update, delete on public.client_coaching_content_access to authenticated;
