-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Bugfix: 20 Rezepte aus Runde 15 (sql/039_rezepte_runde15.sql) sind laut
-- Nutzer-Feedback doppelt in der Datenbank vorhanden. Wahrscheinliche
-- Ursache: sql/039 enthält ein reines INSERT ohne ON CONFLICT-Schutz; wurde
-- das Skript versehentlich ein zweites Mal im Supabase SQL Editor
-- ausgeführt, entstehen exakte Duplikate mit unterschiedlicher id/created_at.
-- Da alle nachfolgenden Migrationen (sql/041 Bilder, sql/044 Filter/
-- Clusterung) per `where title = ...` aktualisieren (ohne LIMIT), wurden
-- BEIDE Duplikate jeweils identisch mitaktualisiert – die Duplikate
-- unterscheiden sich also nur in id/created_at, nicht im sichtbaren Inhalt.
--
-- WICHTIG – bitte vor dem Ausführen lesen:
-- Dieses Skript LÖSCHT Datenbankzeilen (im Unterschied zu allen anderen
-- Migrationen in diesem Ordner, die nur einfügen/aktualisieren). Es ist so
-- gebaut, dass dabei keine Kundendaten verloren gehen:
--   1) Für jeden doppelt vorkommenden Rezept-Titel wird die ÄLTESTE Zeile
--      (kleinstes created_at, bei Gleichstand kleinste id) als "Original"
--      behalten – das ist die zuerst per sql/039 eingefügte Zeile.
--   2) Individuelle Freigaben (client_recipe_access, granulare Opt-in-
--      Freigabe aus sql/024/036) und bereits geloggte Mahlzeiten
--      (nutrition_logs.recipe_id) werden vom Duplikat auf das behaltene
--      Original umgehängt, BEVOR das Duplikat gelöscht wird – kein Kunde
--      verliert dadurch eine bereits erteilte Freigabe oder einen bereits
--      protokollierten Log-Eintrag.
--   3) Erst danach werden die überzähligen Duplikat-Zeilen gelöscht.
-- Das Skript arbeitet generisch über `group by title having count(*) > 1`
-- (keine hart kodierten ids/Titel) – es bereinigt also korrekt, auch falls
-- sich die genaue Duplikat-Situation seit dieser Diagnose leicht geändert
-- haben sollte, und bleibt harmlos (0 Änderungen), falls gar keine
-- Duplikate mehr vorhanden sind.
--
-- Empfehlung: vor dem Ausführen die Vorschau-Abfrage ganz unten separat
-- laufen lassen, um zu sehen, welche Titel aktuell betroffen sind.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001–050 bereits liefen.
-- ============================================================================

-- Vorschau (kann vorab separat ausgeführt werden): welche Titel sind aktuell
-- doppelt, und wie viele Zeilen betrifft das?
-- select title, count(*) as anzahl from public.recipes group by title having count(*) > 1 order by title;

do $$
declare
  dup record;
  keeper_id uuid;
  loser_id uuid;
begin
  for dup in
    select title
    from public.recipes
    group by title
    having count(*) > 1
  loop
    -- Original = älteste Zeile dieses Titels
    select id into keeper_id
    from public.recipes
    where title = dup.title
    order by created_at asc, id asc
    limit 1;

    for loser_id in
      select id from public.recipes
      where title = dup.title and id <> keeper_id
    loop
      -- Granulare Freigaben (sql/024/036) auf das Original umhängen –
      -- on conflict do nothing, falls ein Kunde zufällig schon für beide
      -- Duplikate freigeschaltet war.
      insert into public.client_recipe_access (client_id, recipe_id)
      select client_id, keeper_id
      from public.client_recipe_access
      where recipe_id = loser_id
      on conflict (client_id, recipe_id) do nothing;

      -- Bereits protokollierte Mahlzeiten (Ernährungsprotokoll) auf das
      -- Original umhängen, statt sie beim Löschen zu verwaisen.
      update public.nutrition_logs
      set recipe_id = keeper_id
      where recipe_id = loser_id;

      -- Duplikat-Zeile löschen. Etwaige verbleibende client_recipe_access-
      -- Einträge für diese id werden durch den bestehenden
      -- "on delete cascade" automatisch mitentfernt.
      delete from public.recipes where id = loser_id;
    end loop;
  end loop;
end $$;

-- Verifikation: sollte 0 Zeilen liefern (keine doppelten Titel mehr)
select title, count(*) as anzahl from public.recipes group by title having count(*) > 1;

-- Referenz: Gesamtzahl Rezepte nach der Bereinigung
select count(*) as rezepte_gesamt from public.recipes;
