-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 17: Echte Reiter-Freigabe (Training/Ernährung/Coaching einzeln pro
-- Kunde freischaltbar durch den Admin), Grundlage für die neuen
-- Kunden-Startseiten mit Vorteils-Teaser bei gesperrten Bereichen.
--
-- Bisher gab es nur `access_locked` (Alles-oder-nichts-Sperre, z.B. bei
-- Zahlungsverzug). Jetzt zusätzlich: drei granulare Freigaben je Kunde.
-- Default = true, damit bestehende Kunden durch dieses Update NICHT
-- plötzlich ausgesperrt werden — der Admin sperrt gezielt, wo gewünscht.
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-019 bereits liefen.
-- ============================================================================

alter table public.profiles add column if not exists training_enabled boolean not null default true;
alter table public.profiles add column if not exists nutrition_enabled boolean not null default true;
alter table public.profiles add column if not exists coaching_enabled boolean not null default true;

comment on column public.profiles.training_enabled is 'Ob dieser Kunde den Trainingsbereich (Übungsbibliothek/Pläne) nutzen darf. Von einem Admin gesetzt.';
comment on column public.profiles.nutrition_enabled is 'Ob dieser Kunde den Ernährungsbereich (Rezepte/PAL/Protokoll) nutzen darf. Von einem Admin gesetzt.';
comment on column public.profiles.coaching_enabled is 'Ob dieser Kunde den Coaching-Bereich (Content/Fragebögen/Ziele) nutzen darf. Von einem Admin gesetzt.';

-- 1) Helper-Funktion für RLS -------------------------------------------------
-- Admin hat immer Zugriff. Für Kunden wird das jeweilige *_enabled-Feld
-- geprüft. Analog zu public.is_admin()/public.is_locked() aus sql/001.

create or replace function public.has_module_access(module_name text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select public.is_admin() or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and case module_name
      when 'training' then p.training_enabled
      when 'nutrition' then p.nutrition_enabled
      when 'coaching' then p.coaching_enabled
      else true
    end
  );
$$;

comment on function public.has_module_access(text) is 'True für Admins immer; für Kunden true, wenn das jeweilige Reiter-Freigabe-Feld in profiles gesetzt ist. In RLS-Policies der geteilten Content-Tabellen verwenden.';

-- 2) Bestehende SELECT-Policies der geteilten Content-Bibliotheken erweitern
--    (Übungsbibliothek, Rezepte, Coaching-Content) — das sind die Tabellen,
--    die den eigentlichen "Reiter-Inhalt" ausmachen, den ein gesperrter
--    Kunde nicht sehen soll. Persönliche Daten (eigene Trainingslogs,
--    Ernährungsprotokoll, Fragebogen-Antworten etc.) bleiben unverändert
--    zugänglich, damit ein Kunde seine eigene Historie nie verliert.

drop policy if exists "exercises_select" on public.exercises;
create policy "exercises_select"
  on public.exercises for select
  using (auth.uid() is not null and not public.is_locked() and public.has_module_access('training'));

drop policy if exists "recipes_select" on public.recipes;
create policy "recipes_select"
  on public.recipes for select
  using (auth.uid() is not null and not public.is_locked() and public.has_module_access('nutrition'));

drop policy if exists "coaching_content_select" on public.coaching_content;
create policy "coaching_content_select"
  on public.coaching_content for select
  using (auth.uid() is not null and not public.is_locked() and public.has_module_access('coaching'));
