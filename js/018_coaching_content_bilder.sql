-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 16: Bild-Feld für Coaching-Content
--
-- Fügt eine image_url-Spalte zu coaching_content hinzu (analog zu recipes,
-- siehe sql/009_rezepte_bilder.sql). Wird zunächst leer angelegt — die
-- Admin-Oberfläche (coaching.html) hat jetzt ein Bild-URL-Feld beim
-- Anlegen/Bearbeiten von Content-Einträgen; Bilder werden nachträglich
-- ergänzt (z.B. mit Gemini generiert, siehe Bildbedarfs-Liste).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-017 bereits liefen.
-- ============================================================================

alter table public.coaching_content add column if not exists image_url text;
