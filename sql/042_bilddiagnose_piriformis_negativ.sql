-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Diagnose + robuster Re-Fix: Bilder für Piriformis-Dehnung und
-- Negativ-Bankdrücken werden im Übungskatalog nicht angezeigt, obwohl
-- sql/041 bereits ausgeführt und der content/uebungen-Ordner bereits
-- deployt wurde.
--
-- Auf meiner Seite ist alles korrekt: sql/034 legt beide Übungen mit
-- image_url = null an, sql/041 verknüpft sie per `where name = '...'` mit
-- den richtigen Bilddateien, und beide Bilddateien wurden geprüft (öffnen
-- fehlerfrei, zeigen visuell exakt die richtige Übung).
--
-- Die wahrscheinlichste Ursache bei bereits ausgeführtem SQL: das
-- `where name = '...'` in sql/041 hat null Zeilen getroffen, z.B. weil beim
-- Kopieren des Übungsnamens in den Supabase SQL Editor ein Sonderzeichen
-- (ü, Bindestrich/Gedankenstrich, geschütztes Leerzeichen) anders codiert
-- wurde als beim ursprünglichen INSERT in sql/034. Ein `update ... where
-- name = 'X'` ohne Treffer läuft ohne Fehlermeldung durch ("Success. No
-- rows returned") – genau das Symptom, das keine Fehlermeldung, aber auch
-- kein sichtbares Bild liefert.
--
-- Schritt 1: Diagnose – zeigt den EXAKT in der DB gespeicherten Namen,
-- den aktuellen image_url-Wert und die Byte-Länge (zur Erkennung von
-- Encoding-Abweichungen). Bitte zuerst ausführen und das Ergebnis prüfen.
-- ============================================================================

select
  id,
  name,
  image_url,
  length(name) as zeichen_laenge,
  octet_length(name) as byte_laenge
from public.exercises
where name ilike '%bankdr%cken%'
   or name ilike '%piriformis%'
order by name;

-- ============================================================================
-- Schritt 2: Robuster Re-Fix für alle 7 Übungsbilder aus Runde 17 (sql/041).
-- Statt exaktem `= '...'`-Vergleich wird hier mit `like`-Mustern und
-- Wildcards genau an den Stellen gearbeitet, an denen Sonderzeichen
-- (ü, Bindestrich) unterschiedlich codiert vorliegen könnten. Das deckt
-- auch die 5 anderen Übungen aus derselben Liste ab, falls dort ebenfalls
-- ein stiller Treffer-Fehler passiert ist, der bisher nicht aufgefallen
-- ist. Bereits korrekt gesetzte image_url-Werte werden unverändert
-- überschrieben (gleicher Zielwert, harmlos).
-- ============================================================================

update public.exercises set image_url = 'content/uebungen/gesaessmaschine-hueftstrecker.jpg'
where name like 'Ges%ßmaschine%H%ftstrecker%Maschine%';

update public.exercises set image_url = 'content/uebungen/langhantelrudern-untergriff.jpg'
where name like 'Langhantelrudern%Untergriff%';

update public.exercises set image_url = 'content/uebungen/negativ-bankdruecken-langhantel.jpg'
where name like 'Negativ-Bankdr%cken%Langhantel%';

update public.exercises set image_url = 'content/uebungen/piriformis-dehnung-figure4.jpg'
where name like 'Piriformis%Dehnung%Figure%4%';

update public.exercises set image_url = 'content/uebungen/t-bar-rudern.jpg'
where name like 'T-Bar-Rudern%';

update public.exercises set image_url = 'content/uebungen/trizepsdruecken-maschine.jpg'
where name like 'Trizepsdr%cken%Maschine%';

update public.exercises set image_url = 'content/uebungen/wadenheben-beinpresse.jpg'
where name like 'Wadenheben%Beinpresse%';

-- ============================================================================
-- Schritt 3: Kontrolle – danach sollten alle 7 Zeilen einen image_url-Wert
-- zeigen, der mit 'content/uebungen/' beginnt.
-- ============================================================================

select name, image_url
from public.exercises
where name ilike '%bankdr%cken%'
   or name ilike '%piriformis%'
   or name ilike '%ge%ßmaschine%h%ftstrecker%'
   or name ilike '%langhantelrudern%untergriff%'
   or name ilike '%t-bar-rudern%'
   or name ilike '%trizepsdr%cken%maschine%'
   or name ilike '%wadenheben%beinpresse%'
order by name;

-- Falls nach Schritt 2 weiterhin eine image_url NULL oder falsch ist:
-- bitte das Ergebnis von Schritt 1 (vor dem Fix) an mich zurückgeben —
-- der dort exakt angezeigte `name`-Wert lässt sich dann 1:1 als neues
-- `where name = '...'` verwenden.
-- ============================================================================
