-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 9: Rezeptfotos
--
-- Fügt eine image_url-Spalte zu recipes hinzu und befüllt sie mit den Fotos
-- aus dem TV-Neerstedt-Dokument (Kap. 6).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-008 bereits liefen.
-- Vor dem Ausführen: PNG-Dateien aus dem Bildmaterial-Paket nach
-- content/rezepte-bilder/ in dein GitHub-Repository hochladen.
-- ============================================================================

alter table public.recipes add column if not exists image_url text;

update public.recipes set image_url = 'content/rezepte-bilder/overnight-oats-beeren.png' where title = 'Overnight Oats mit Beeren';
update public.recipes set image_url = 'content/rezepte-bilder/ruehrei-vollkorntoast.png' where title = 'Rührei mit Vollkorntoast';
update public.recipes set image_url = 'content/rezepte-bilder/skyr-bowl-obst-nuesse.png' where title = 'Skyr-Bowl mit Obst & Nüssen';
update public.recipes set image_url = 'content/rezepte-bilder/haehnchen-reis-bowl.png' where title = 'Hähnchen-Reis-Bowl';
update public.recipes set image_url = 'content/rezepte-bilder/vollkornwrap-pute.png' where title = 'Vollkornwrap mit Pute';
update public.recipes set image_url = 'content/rezepte-bilder/linsen-quinoa-salat.png' where title = 'Linsen-Quinoa-Salat';
update public.recipes set image_url = 'content/rezepte-bilder/lachs-ofengemuese.png' where title = 'Lachs mit Ofengemüse';
update public.recipes set image_url = 'content/rezepte-bilder/putengeschnetzeltes-nudeln.png' where title = 'Putengeschnetzeltes & Nudeln';
update public.recipes set image_url = 'content/rezepte-bilder/gefuellte-suesskartoffel.png' where title = 'Gefüllte Süßkartoffel';
update public.recipes set image_url = 'content/rezepte-bilder/banane-erdnussbutter.png' where title = 'Banane mit Erdnussbutter';
update public.recipes set image_url = 'content/rezepte-bilder/proteinshake-haferflocken.png' where title = 'Proteinshake mit Haferflocken';
update public.recipes set image_url = 'content/rezepte-bilder/magerquark-honig.png' where title = 'Magerquark mit Honig';
