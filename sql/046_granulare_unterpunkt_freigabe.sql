-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Runde 18: Granulare Zugriffssteuerung je Unterpunkt einer Rubrik.
--
-- Bisher gab es zwei Freigabe-Ebenen:
--   1) Reiter-Ebene (sql/020): profiles.training_enabled/nutrition_enabled/
--      coaching_enabled – sperrt eine GANZE Rubrik auf einmal.
--   2) Dokument-Ebene (sql/024): client_recipe_access/
--      client_coaching_content_access – Freigabe einzelner Rezepte/
--      Coaching-Themen.
--
-- Der Nutzer möchte jetzt eine dritte, dazwischenliegende Ebene: jeden
-- einzelnen UNTERPUNKT einer Rubrik (z.B. "Meine Entwicklung" oder
-- "Monatsbericht" innerhalb von Training) pro Kunde ein-/ausschalten können
-- – unabhängig von den bereits vorhandenen Ebenen. Wichtig laut Nutzer:
-- "das beinhaltet nur den Zugang, nicht die Sichtbarkeit" – der Unterpunkt
-- bleibt in der Navigation sichtbar (weckt Neugier), zeigt bei gesperrtem
-- Zugriff aber nur eine Teaser-Ansicht statt des echten Inhalts. Das ist
-- reine Anwendungslogik (kein gemeinsames Content-Table wie bei Rezepten),
-- daher hier bewusst KEINE RLS-Policy auf fachlichen Tabellen, sondern nur
-- auf der neuen Zugriffstabelle selbst – die eigentliche Sperrung passiert
-- in training.html/nutrition.html/coaching.html vor dem Rendern des jeweils
-- angefragten Unterpunkts.
--
-- Die vollständige Liste der Unterpunkte (siehe js/nav.js SECTION_SUBTABS,
-- nur der `client`-Zweig, da nur für Kunden relevant):
--   section='training': plan, progress, praevention, tests, monatsbericht
--   section='nutrition': pal, bodyfat, protokoll, recipes
--   section='coaching':  content, atem, fragebogen, ziele
--
-- Default-Verhalten: KEIN Eintrag in dieser Tabelle = Zugriff erlaubt
-- (entspricht "noch nie gesperrt"). Nur ein expliziter Eintrag mit
-- enabled=false sperrt den Zugriff. Dadurch ist kein Backfill für
-- bestehende Kunden nötig (anders als beim Dokument-Freigabe-Modell in
-- sql/024, das ein Opt-in mit Grandfathering brauchte).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-045 bereits liefen.
-- ============================================================================

create table if not exists public.client_subtab_access (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  section text not null check (section in ('training', 'nutrition', 'coaching')),
  subtab_key text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  unique (client_id, section, subtab_key)
);

comment on table public.client_subtab_access is
  'Granulare Zugriffssteuerung je Unterpunkt einer Rubrik (Training/Ernährung/Coaching), pro Kunde. Fehlender Eintrag = Zugriff erlaubt; nur enabled=false sperrt gezielt. Steuert NUR den Zugriff auf den Inhalt, nicht die Sichtbarkeit des Unterpunkts in der Navigation (dort bewusst weiterhin sichtbar, siehe Teaser-Ansicht in der jeweiligen *.html-Seite).';
comment on column public.client_subtab_access.section is 'Rubrik: training | nutrition | coaching (entspricht den Top-Level-Keys in js/nav.js SECTION_SUBTABS).';
comment on column public.client_subtab_access.subtab_key is 'Unterpunkt-Schlüssel innerhalb der Rubrik, z.B. "progress", "monatsbericht", "recipes" (entspricht den `key`-Werten in SECTION_SUBTABS[section].client).';

create index if not exists client_subtab_access_client_idx on public.client_subtab_access(client_id);

alter table public.client_subtab_access enable row level security;

-- Admins dürfen alles lesen/schreiben (Verwaltung der Freigaben).
drop policy if exists "client_subtab_access_admin_all" on public.client_subtab_access;
create policy "client_subtab_access_admin_all"
  on public.client_subtab_access for all
  using (public.is_admin())
  with check (public.is_admin());

-- Kunden dürfen NUR ihre eigenen Einträge lesen (um zu wissen, was für sie
-- gesperrt ist), aber nichts selbst ändern.
drop policy if exists "client_subtab_access_own_select" on public.client_subtab_access;
create policy "client_subtab_access_own_select"
  on public.client_subtab_access for select
  using (client_id = auth.uid());

-- Helper-Funktion, analog zu public.has_module_access() aus sql/020: true
-- für Admins immer; für Kunden true, solange kein Eintrag mit enabled=false
-- existiert.
create or replace function public.has_subtab_access(p_client_id uuid, p_section text, p_subtab_key text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select public.is_admin() or not exists (
    select 1 from public.client_subtab_access a
    where a.client_id = p_client_id
      and a.section = p_section
      and a.subtab_key = p_subtab_key
      and a.enabled = false
  );
$$;

comment on function public.has_subtab_access(uuid, text, text) is 'True für Admins immer; für Kunden true, außer es existiert ein expliziter client_subtab_access-Eintrag mit enabled=false für diese Kombination. In training.html/nutrition.html/coaching.html vor dem Rendern eines Unterpunkt-Inhalts prüfen.';
