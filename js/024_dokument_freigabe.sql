-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Granulare Dokument-Freigabe (Nutzer-Feedback nach Etappe 19)
--
-- Bisher: Freigabe nur auf Modul-Ebene (profiles.nutrition_enabled /
-- .coaching_enabled) — sobald ein Modul frei ist, sieht der Kunde ALLE
-- Rezepte bzw. den gesamten Coaching-Content darin. Jetzt zusätzlich: der
-- Admin kann einzelne Dokumente pro Kunde freigeben/sperren.
--
-- Entscheidung (auf Nachfrage bestätigt): Opt-in. Sobald ein Modul für einen
-- Kunden freigeschaltet ist, sieht er ZUNÄCHST KEIN einzelnes Dokument mehr —
-- der Admin muss jedes gewünschte Dokument einzeln freischalten. Das ist
-- konsistent zur Anti-Scraping-Logik aus Etappe 19 (sql/022): auch dort
-- startet ein Kunde ohne automatischen Zugriff.
--
-- WICHTIG — keine rückwirkende Sperre bestehender Kunden: Für jeden Kunden,
-- der JETZT (zum Zeitpunkt dieser Migration) bereits nutrition_enabled bzw.
-- coaching_enabled = true hat, werden unten automatisch Freigabe-Zeilen für
-- ALLE aktuell existierenden Rezepte/Coaching-Content-Dokumente angelegt
-- ("Grandfathering") — er verliert also keinen bisher sichtbaren Inhalt.
-- Das gilt nur für den Bestand zum Migrationszeitpunkt: ein NEUES Rezept oder
-- Coaching-Dokument, das danach hinzugefügt wird, muss auch für diese
-- bestehenden Kunden vom Admin einzeln freigeschaltet werden — ebenso jedes
-- Dokument für neue Kunden oder neu freigeschaltete Module.
--
-- Betrifft laut Rückfrage ausdrücklich nur Rezepte + Coaching-Content.
-- Übungen (exercises) bleiben unverändert auf Modul-Ebene gesteuert (sie
-- werden ohnehin individuell über Trainingspläne pro Kunde zusammengestellt,
-- nicht als freie Bibliothek durchsucht wie Rezepte/Coaching-Content).
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-023 bereits liefen.
-- ============================================================================

-- 1) Zugriffstabellen ---------------------------------------------------------

create table if not exists public.client_recipe_access (
  client_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id),
  primary key (client_id, recipe_id)
);

comment on table public.client_recipe_access is 'Opt-in-Freigabe: welcher Kunde welches einzelne Rezept-Dokument sehen darf (zusätzlich zur Modul-Freigabe profiles.nutrition_enabled).';

create table if not exists public.client_coaching_content_access (
  client_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.coaching_content(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id),
  primary key (client_id, content_id)
);

comment on table public.client_coaching_content_access is 'Opt-in-Freigabe: welcher Kunde welches einzelne Coaching-Content-Dokument sehen darf (zusätzlich zur Modul-Freigabe profiles.coaching_enabled).';

alter table public.client_recipe_access enable row level security;
alter table public.client_coaching_content_access enable row level security;

-- 2) RLS: Admin verwaltet alles, Kunde darf nur seine eigenen Freigaben lesen
--    (rein informativ — die eigentliche Filterung passiert über die
--    erweiterten recipes_select / coaching_content_select-Policies unten).

drop policy if exists "client_recipe_access_admin_all" on public.client_recipe_access;
create policy "client_recipe_access_admin_all"
  on public.client_recipe_access for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "client_recipe_access_select_own" on public.client_recipe_access;
create policy "client_recipe_access_select_own"
  on public.client_recipe_access for select
  using (client_id = auth.uid());

drop policy if exists "client_coaching_content_access_admin_all" on public.client_coaching_content_access;
create policy "client_coaching_content_access_admin_all"
  on public.client_coaching_content_access for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "client_coaching_content_access_select_own" on public.client_coaching_content_access;
create policy "client_coaching_content_access_select_own"
  on public.client_coaching_content_access for select
  using (client_id = auth.uid());

-- 3) recipes_select / coaching_content_select verschärfen: Admin sieht immer
--    alles; ein Kunde sieht ein Dokument nur, wenn das Modul frei ist UND für
--    genau dieses Dokument eine Freigabe-Zeile existiert.

drop policy if exists "recipes_select" on public.recipes;
create policy "recipes_select"
  on public.recipes for select
  using (
    public.is_admin()
    or (
      auth.uid() is not null
      and not public.is_locked()
      and public.has_module_access('nutrition')
      and exists (
        select 1 from public.client_recipe_access cra
        where cra.client_id = auth.uid() and cra.recipe_id = recipes.id
      )
    )
  );

drop policy if exists "coaching_content_select" on public.coaching_content;
create policy "coaching_content_select"
  on public.coaching_content for select
  using (
    public.is_admin()
    or (
      auth.uid() is not null
      and not public.is_locked()
      and public.has_module_access('coaching')
      and exists (
        select 1 from public.client_coaching_content_access cca
        where cca.client_id = auth.uid() and cca.content_id = coaching_content.id
      )
    )
  );

-- 4) Grandfathering: bestehende Kunden mit bereits freigeschaltetem Modul
--    behalten automatisch Zugriff auf ALLE aktuell existierenden Dokumente.

insert into public.client_recipe_access (client_id, recipe_id)
select p.id, r.id
from public.profiles p
cross join public.recipes r
where p.role = 'client' and p.nutrition_enabled = true
on conflict (client_id, recipe_id) do nothing;

insert into public.client_coaching_content_access (client_id, content_id)
select p.id, c.id
from public.profiles p
cross join public.coaching_content c
where p.role = 'client' and p.coaching_enabled = true
on conflict (client_id, content_id) do nothing;
