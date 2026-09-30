-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 18: Redundanz bei persönlichen Daten reduzieren. Geburtsdatum lag
-- bereits zentral in profiles.birth_date (siehe sql/012) und wurde überall
-- korrekt wiederverwendet – nur das Eingabeformular im Präventionscheck
-- (training.html) war ein zweiter, überflüssiger Eingabeort für Kunden und
-- wurde entfernt (Kunden sehen dort nur noch den Lesewert + Link zur
-- Startseite; die Trainer-/Admin-Ansicht behält die Eingabe, da das die
-- einzige Stelle ist, an der ein Trainer sie stellvertretend für einen
-- Kunden pflegen kann).
--
-- Körpergröße wurde bisher NUR pro Körperfett-Messung erfasst (body_fat_
-- measurements.height_cm) – ändert sich bei Erwachsenen praktisch nie,
-- musste aber bei jeder neuen Messung erneut eingetippt werden, und der
-- PAL-Rechner hatte ein komplett separates Eingabefeld dafür. Jetzt analog
-- zum Geburtsdatum: EINE zentrale Stelle in profiles.height_cm, einmal auf
-- der Startseite eingetragen, von PAL-Rechner UND Körperfett-Verlauf
-- automatisch übernommen. Gewicht bleibt bewusst pro Messung editierbar
-- (ändert sich bei jeder Messung tatsächlich), wird aber ab sofort mit dem
-- zuletzt erfassten Wert vorausgefüllt statt leer zu starten.
-- ============================================================================

alter table public.profiles
  add column if not exists height_cm numeric(5, 1);

comment on column public.profiles.height_cm is
  'Körpergröße in cm, einmalig vom Kunden auf der Startseite gepflegt. Wird von PAL-Rechner und Körperfett-Verlauf (nutrition.html) automatisch übernommen statt dort erneut abgefragt zu werden.';
