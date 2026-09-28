-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 12: Weitere Körpermaße + Messpunkte, Rezept-Makros, Geräte-Limit
--            (max. 2 Geräte je Kunde), Ernährungsprotokoll mit
--            Lebensmittel-Datenbank, gespeicherter Kalorienbedarf,
--            Leistungsumsatz (Trainingskalorien)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-011 bereits liefen.
-- ============================================================================

-- 1) Weitere Umfangsmessungen + Messpunkt-Angabe + wer gemessen hat
-- ----------------------------------------------------------------------------
alter table public.body_measurements add column if not exists arm_left_cm numeric;
alter table public.body_measurements add column if not exists arm_right_cm numeric;
alter table public.body_measurements add column if not exists thigh_left_cm numeric;
alter table public.body_measurements add column if not exists thigh_right_cm numeric;
alter table public.body_measurements add column if not exists calf_left_cm numeric;
alter table public.body_measurements add column if not exists calf_right_cm numeric;

alter table public.body_measurements add column if not exists measured_by text
  check (measured_by in ('client', 'trainer'));
update public.body_measurements set measured_by = 'client' where measured_by is null;
alter table public.body_measurements alter column measured_by set default 'client';

comment on column public.body_measurements.arm_left_cm is 'Oberarmumfang links, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.arm_right_cm is 'Oberarmumfang rechts, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.thigh_left_cm is 'Oberschenkelumfang links, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.thigh_right_cm is 'Oberschenkelumfang rechts, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.calf_left_cm is 'Wadenumfang links, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.calf_right_cm is 'Wadenumfang rechts, an der breitesten Stelle gemessen.';
comment on column public.body_measurements.measured_by is 'Wer die Messung durchgeführt hat: client (Kunde selbst) oder trainer.';


-- 2) Rezepte: vollständige Makros (bisher nur im PDF, jetzt auch strukturiert)
-- ----------------------------------------------------------------------------
alter table public.recipes add column if not exists protein_g numeric;
alter table public.recipes add column if not exists carbs_g numeric;
alter table public.recipes add column if not exists fat_g numeric;
alter table public.recipes add column if not exists kcal_per_portion numeric;

comment on column public.recipes.protein_g is 'Eiweiß pro Portion in Gramm.';
comment on column public.recipes.carbs_g is 'Kohlenhydrate pro Portion in Gramm.';
comment on column public.recipes.fat_g is 'Fett pro Portion in Gramm.';
comment on column public.recipes.kcal_per_portion is 'Energie pro Portion in kcal.';

update public.recipes set protein_g = 40, carbs_g = 60, fat_g = 9, kcal_per_portion = 493 where title = 'Overnight Oats mit Beeren';
update public.recipes set protein_g = 35, carbs_g = 32, fat_g = 30, kcal_per_portion = 550 where title = 'Rührei mit Vollkorntoast';
update public.recipes set protein_g = 42, carbs_g = 64, fat_g = 11, kcal_per_portion = 536 where title = 'Skyr-Bowl mit Obst & Nüssen';
update public.recipes set protein_g = 47, carbs_g = 61, fat_g = 8, kcal_per_portion = 505 where title = 'Hähnchen-Reis-Bowl';
update public.recipes set protein_g = 38, carbs_g = 35, fat_g = 7, kcal_per_portion = 353 where title = 'Vollkornwrap mit Pute';
update public.recipes set protein_g = 37, carbs_g = 83, fat_g = 16, kcal_per_portion = 624 where title = 'Linsen-Quinoa-Salat';
update public.recipes set protein_g = 47, carbs_g = 47, fat_g = 39, kcal_per_portion = 727 where title = 'Lachs mit Ofengemüse';
update public.recipes set protein_g = 48, carbs_g = 60, fat_g = 6, kcal_per_portion = 488 where title = 'Putengeschnetzeltes & Nudeln';
update public.recipes set protein_g = 43, carbs_g = 81, fat_g = 7, kcal_per_portion = 553 where title = 'Gefüllte Süßkartoffel';
update public.recipes set protein_g = 5, carbs_g = 27, fat_g = 8, kcal_per_portion = 201 where title = 'Banane mit Erdnussbutter';
update public.recipes set protein_g = 47, carbs_g = 55, fat_g = 15, kcal_per_portion = 545 where title = 'Proteinshake mit Haferflocken';
update public.recipes set protein_g = 47, carbs_g = 55, fat_g = 3, kcal_per_portion = 445 where title = 'Magerquark mit Honig';


-- 3) Geräte-Limit (max. 2 Geräte je Kunde, Admin kann anpassen/freigeben)
-- ----------------------------------------------------------------------------
-- Hinweis zur Funktionsweise: Da die Plattform bewusst ohne eigenen Server
-- (nur GitHub Pages + Supabase) läuft, prüft die App bei jedem Login über
-- die Funktion register_device() unten, ob das aktuelle Gerät (ein pro
-- Browser erzeugter, in localStorage gespeicherter Zufalls-Code) bereits
-- bekannt ist oder ob noch ein Platz frei ist. Das ist eine wirksame Bremse
-- gegen "wir teilen uns einen Account", aber keine kryptographisch
-- unüberwindbare Hürde – ein technisch versierter Nutzer könnte
-- localStorage manuell löschen/fälschen. Für die Größenordnung dieser
-- Plattform ist das ein angemessener Kompromiss ohne zusätzliche
-- Server-Infrastruktur (z.B. Supabase Edge Functions).

alter table public.profiles add column if not exists max_devices int not null default 2;
comment on column public.profiles.max_devices is 'Maximale Anzahl gleichzeitig registrierter Geräte für diesen Kunden. Vom Admin änderbar.';

create table if not exists public.client_devices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  device_id text not null,
  label text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (client_id, device_id)
);

comment on table public.client_devices is 'Pro Kunde registrierte Geräte (Browser), zur Durchsetzung des Geräte-Limits. Wird ausschließlich über die Funktion register_device() befüllt, nicht direkt vom Client.';

alter table public.client_devices enable row level security;

drop policy if exists "client_devices_select" on public.client_devices;
create policy "client_devices_select"
  on public.client_devices for select
  using (client_id = auth.uid() or public.is_admin());

-- Direktes Insert/Update ist bewusst NUR dem Admin erlaubt – der reguläre
-- Registrierungsweg für Kunden läuft über die security-definer-Funktion
-- register_device() unten, die das Geräte-Limit durchsetzt, bevor sie
-- selbst (mit erhöhten Rechten) einen Datensatz anlegt/aktualisiert.
drop policy if exists "client_devices_admin_insert" on public.client_devices;
create policy "client_devices_admin_insert"
  on public.client_devices for insert
  with check (public.is_admin());

drop policy if exists "client_devices_admin_update" on public.client_devices;
create policy "client_devices_admin_update"
  on public.client_devices for update
  using (public.is_admin())
  with check (public.is_admin());

-- Löschen (Gerät entfernen, um Platz zu machen) darf der Kunde selbst für
-- eigene Geräte und der Admin für alle.
drop policy if exists "client_devices_delete" on public.client_devices;
create policy "client_devices_delete"
  on public.client_devices for delete
  using (client_id = auth.uid() or public.is_admin());

grant select, delete on public.client_devices to authenticated;

-- Registrierungsfunktion: prüft Geräte-Limit und legt bei Bedarf einen
-- neuen Eintrag an bzw. aktualisiert den Zeitstempel eines bekannten
-- Geräts. Läuft mit den Rechten des Funktions-Erstellers (security definer),
-- liest aber ausschließlich auth.uid() – kann also nicht für ein fremdes
-- Konto missbraucht werden.
create or replace function public.register_device(p_device_id text, p_label text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid := auth.uid();
  v_max_devices int;
  v_existing_count int;
  v_already_known boolean;
begin
  if v_client_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select max_devices into v_max_devices from public.profiles where id = v_client_id;
  if v_max_devices is null then v_max_devices := 2; end if;

  select exists(
    select 1 from public.client_devices where client_id = v_client_id and device_id = p_device_id
  ) into v_already_known;

  if v_already_known then
    update public.client_devices
      set last_seen = now(), label = coalesce(p_label, label)
      where client_id = v_client_id and device_id = p_device_id;
    return jsonb_build_object('ok', true, 'is_new', false);
  end if;

  select count(*) into v_existing_count from public.client_devices where client_id = v_client_id;

  if v_existing_count >= v_max_devices then
    return jsonb_build_object('ok', false, 'error', 'device_limit_reached', 'max_devices', v_max_devices);
  end if;

  insert into public.client_devices (client_id, device_id, label)
  values (v_client_id, p_device_id, p_label);

  return jsonb_build_object('ok', true, 'is_new', true);
end;
$$;

grant execute on function public.register_device(text, text) to authenticated;


-- 4) Lebensmittel-Datenbank (für die einfache Kalorien-/Makro-Berechnung im
--    Ernährungsprotokoll) – Referenzwerte je 100g/ml, Standard-Nährwerttabellen,
--    gerundet, vom Admin über die Rezepte-/Bibliotheks-ähnliche Pflege
--    erweiterbar.
-- ----------------------------------------------------------------------------
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kcal_per_100g numeric not null,
  protein_per_100g numeric not null default 0,
  carbs_per_100g numeric not null default 0,
  fat_per_100g numeric not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.food_items is 'Lebensmittel-Referenzdatenbank (kcal/Makros je 100g) für das Ernährungsprotokoll. Von allen Kunden lesbar, nur vom Admin pflegbar/erweiterbar.';

alter table public.food_items enable row level security;

drop policy if exists "food_items_select" on public.food_items;
create policy "food_items_select"
  on public.food_items for select
  using (auth.uid() is not null and not public.is_locked());

drop policy if exists "food_items_admin_insert" on public.food_items;
create policy "food_items_admin_insert"
  on public.food_items for insert
  with check (public.is_admin());

drop policy if exists "food_items_admin_update" on public.food_items;
create policy "food_items_admin_update"
  on public.food_items for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "food_items_admin_delete" on public.food_items;
create policy "food_items_admin_delete"
  on public.food_items for delete
  using (public.is_admin());

grant select, insert, update, delete on public.food_items to authenticated;

insert into public.food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) values
('Haferflocken', 372, 13.5, 58.7, 7.0),
('Vollkornbrot', 220, 8.5, 40.0, 2.5),
('Weißbrot', 265, 8.0, 51.0, 2.0),
('Vollkorntoast', 250, 8.0, 43.0, 3.5),
('Vollkornreis, gekocht', 123, 2.7, 25.8, 1.0),
('Weißer Reis, gekocht', 130, 2.7, 28.0, 0.3),
('Vollkornnudeln, gekocht', 124, 5.3, 25.0, 0.9),
('Weiße Nudeln, gekocht', 131, 5.0, 25.0, 1.1),
('Quinoa, gekocht', 120, 4.4, 21.3, 1.9),
('Couscous, gekocht', 112, 3.8, 23.2, 0.2),
('Kartoffeln, gekocht', 87, 2.0, 20.0, 0.1),
('Süßkartoffel, roh', 86, 1.6, 20.0, 0.1),
('Haferkleie', 246, 17.0, 66.0, 7.0),
('Müsli, ungesüßt', 360, 10.0, 60.0, 7.0),
('Vollkornwrap', 270, 9.0, 45.0, 6.0),
('Reiswaffeln', 387, 8.0, 82.0, 2.8),
('Magerquark', 67, 12.0, 4.0, 0.2),
('Skyr', 63, 11.0, 4.0, 0.2),
('Naturjoghurt 1,5%', 63, 4.5, 6.0, 1.5),
('Griechischer Joghurt 10%', 133, 5.7, 4.0, 10.0),
('Milch 1,5%', 47, 3.4, 4.9, 1.5),
('Milch 3,5%', 64, 3.3, 4.8, 3.6),
('Hüttenkäse', 98, 12.0, 3.4, 4.3),
('Feta', 264, 14.0, 4.0, 21.0),
('Gouda', 356, 25.0, 0.0, 28.0),
('Mozzarella', 280, 22.0, 2.0, 21.0),
('Parmesan', 392, 36.0, 0.0, 26.0),
('Frischkäse Doppelrahmstufe', 342, 6.0, 4.0, 33.0),
('Frischkäse leicht', 150, 10.0, 4.0, 11.0),
('Ei (Huhn)', 143, 12.5, 0.7, 10.0),
('Hähnchenbrust, roh', 120, 23.0, 0.0, 3.1),
('Hähnchenbrust, gegart', 165, 31.0, 0.0, 4.6),
('Putenbrust, roh', 105, 22.0, 0.0, 1.9),
('Putenbrust, Aufschnitt', 100, 24.0, 1.0, 0.4),
('Rinderhack, roh (10% Fett)', 176, 20.0, 0.0, 10.0),
('Rindersteak, roh', 158, 21.0, 0.0, 8.0),
('Schweinefilet, roh', 143, 21.0, 0.0, 6.5),
('Pute/Hähnchen Schnitzel, paniert, gebacken', 250, 15.0, 15.0, 14.0),
('Lachsfilet, roh', 208, 20.0, 0.0, 14.2),
('Thunfisch, Dose in Wasser', 116, 26.0, 0.0, 1.0),
('Garnelen, roh', 71, 17.0, 0.5, 0.5),
('Kabeljau/weißer Fisch, roh', 82, 18.0, 0.0, 0.7),
('Whey-Protein-Pulver', 380, 80.0, 5.0, 5.0),
('Tofu', 76, 8.0, 2.0, 4.5),
('Linsen, gekocht', 116, 9.0, 18.0, 0.9),
('Kichererbsen, gekocht', 164, 8.9, 27.0, 2.6),
('Kidneybohnen, gekocht', 127, 8.7, 21.0, 0.6),
('Hummus', 166, 8.0, 11.0, 10.0),
('Banane', 89, 1.1, 20.5, 0.3),
('Apfel', 52, 0.3, 14.0, 0.2),
('Orange', 47, 0.9, 12.0, 0.1),
('Beeren, gemischt', 48, 0.9, 10.0, 0.3),
('Erdbeeren', 32, 0.7, 7.7, 0.3),
('Heidelbeeren', 57, 0.7, 14.0, 0.3),
('Weintrauben', 69, 0.6, 18.0, 0.2),
('Ananas', 50, 0.5, 13.0, 0.1),
('Mango', 60, 0.8, 15.0, 0.4),
('Wassermelone', 30, 0.6, 7.6, 0.2),
('Avocado', 160, 2.0, 8.5, 14.7),
('Tomate', 18, 0.9, 3.5, 0.2),
('Gurke', 12, 0.65, 2.2, 0.1),
('Paprika', 31, 1.0, 6.0, 0.3),
('Brokkoli', 34, 2.8, 4.5, 0.5),
('Blumenkohl', 25, 1.9, 5.0, 0.3),
('Spinat, roh', 23, 2.9, 3.6, 0.4),
('Salat, Kopf-/Eisbergsalat', 15, 1.4, 2.0, 0.2),
('Zucchini', 17, 1.2, 2.5, 0.3),
('Möhren/Karotten', 41, 0.9, 9.6, 0.2),
('Zwiebel', 40, 1.1, 9.3, 0.1),
('Champignons', 22, 3.1, 3.3, 0.3),
('Mais, Dose', 96, 3.2, 18.0, 1.2),
('Rote Bete, gekocht', 44, 1.7, 10.0, 0.2),
('Olivenöl', 884, 0.0, 0.0, 98.2),
('Rapsöl', 884, 0.0, 0.0, 98.2),
('Butter', 717, 0.9, 0.1, 81.0),
('Mandeln', 579, 21.0, 22.0, 50.0),
('Walnüsse', 654, 15.0, 14.0, 65.0),
('Cashewkerne', 553, 18.0, 30.0, 44.0),
('Erdnüsse', 567, 26.0, 16.0, 49.0),
('Erdnussbutter', 588, 25.0, 14.0, 48.0),
('Chiasamen', 486, 17.0, 42.0, 31.0),
('Leinsamen', 534, 18.0, 29.0, 42.0),
('Honig', 304, 0.3, 76.0, 0.0),
('Marmelade', 250, 0.3, 62.0, 0.1),
('Zucker', 400, 0.0, 100.0, 0.0),
('Dunkle Schokolade 70%', 546, 7.8, 46.0, 31.0),
('Vollmilchschokolade', 534, 7.6, 57.0, 30.0),
('Kartoffelchips', 536, 6.6, 53.0, 34.0),
('Popcorn, ungesalzen', 387, 12.0, 78.0, 5.0),
('Sojasauce', 60, 8.0, 7.0, 0.1),
('Ketchup', 100, 1.2, 24.0, 0.2),
('Senf', 66, 4.0, 8.0, 3.0),
('Apfelsaft', 46, 0.1, 11.0, 0.1),
('Orangensaft', 45, 0.7, 10.0, 0.2),
('Cola', 42, 0.0, 10.6, 0.0),
('Bier, Pils', 43, 0.5, 3.5, 0.0),
('Wein, rot/weiß', 83, 0.1, 2.5, 0.0),
('Kaffee, schwarz', 1, 0.1, 0.0, 0.0),
('Energy Drink', 45, 0.0, 11.0, 0.0)
on conflict (name) do nothing;


-- 5) Ernährungsprotokoll (Mahlzeiten-/Getränke-Log der Kunden)
-- ----------------------------------------------------------------------------
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_label text,
  source_type text not null check (source_type in ('food_item', 'recipe', 'custom')),
  food_item_id uuid references public.food_items(id),
  recipe_id uuid references public.recipes(id),
  custom_name text,
  amount_grams numeric,
  kcal numeric not null,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  trainer_comment text,
  trainer_comment_by uuid references public.profiles(id),
  trainer_comment_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.nutrition_logs is 'Ernährungsprotokoll: vom Kunden eingetragene Mahlzeiten/Getränke mit Menge, Uhrzeit und Kalorien/Makros. trainer_comment wird ausschließlich über die Admin-Ansicht gesetzt.';

alter table public.nutrition_logs enable row level security;

drop policy if exists "nutrition_logs_select" on public.nutrition_logs;
create policy "nutrition_logs_select"
  on public.nutrition_logs for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "nutrition_logs_insert" on public.nutrition_logs;
create policy "nutrition_logs_insert"
  on public.nutrition_logs for insert
  with check (client_id = auth.uid() and not public.is_locked());

-- Update ist sowohl dem Kunden (eigene Einträge, z.B. Menge korrigieren) als
-- auch dem Admin (Trainer-Kommentar) erlaubt. Die Trennung "Kunde darf keinen
-- Trainer-Kommentar setzen" wird auf Anwendungsebene sichergestellt (die
-- Kunden-Oberfläche bietet dafür kein Feld an), wie an anderer Stelle in
-- dieser Plattform auch (z.B. access_locked).
drop policy if exists "nutrition_logs_update" on public.nutrition_logs;
create policy "nutrition_logs_update"
  on public.nutrition_logs for update
  using (client_id = auth.uid() or public.is_admin())
  with check (client_id = auth.uid() or public.is_admin());

drop policy if exists "nutrition_logs_delete" on public.nutrition_logs;
create policy "nutrition_logs_delete"
  on public.nutrition_logs for delete
  using ((client_id = auth.uid() and not public.is_locked()) or public.is_admin());

grant select, insert, update, delete on public.nutrition_logs to authenticated;


-- 6) Gespeicherter Kalorienbedarf (PAL-Rechner-Ergebnisse, für den Bedarfs-
--    Vergleich im Ernährungsprotokoll)
-- ----------------------------------------------------------------------------
create table if not exists public.energy_targets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  calculated_at timestamptz not null default now(),
  method text not null check (method in ('mifflin', 'katch_mcardle')),
  bmr_kcal numeric not null,
  pal_value numeric not null,
  tee_kcal numeric not null,
  age int,
  sex text,
  height_cm numeric,
  weight_kg numeric,
  body_fat_percent numeric
);

comment on table public.energy_targets is 'Gespeicherte Ergebnisse des PAL-Kalorienrechners je Kunde – Grundlage für den Bedarfs-Vergleich im Ernährungsprotokoll (jeweils neuester Eintrag = aktueller Bedarf).';

alter table public.energy_targets enable row level security;

drop policy if exists "energy_targets_select" on public.energy_targets;
create policy "energy_targets_select"
  on public.energy_targets for select
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "energy_targets_insert" on public.energy_targets;
create policy "energy_targets_insert"
  on public.energy_targets for insert
  with check (client_id = auth.uid() and not public.is_locked());

drop policy if exists "energy_targets_delete" on public.energy_targets;
create policy "energy_targets_delete"
  on public.energy_targets for delete
  using (client_id = auth.uid() and not public.is_locked());

grant select, insert, delete on public.energy_targets to authenticated;


-- 7) Trainingseinheiten: real gemessene verbrannte Kalorien (optional)
-- ----------------------------------------------------------------------------
alter table public.training_sessions add column if not exists calories_burned numeric;
comment on column public.training_sessions.calories_burned is 'Vom Kunden eingetragene, real gemessene verbrannte Kalorien dieser Einheit (z.B. von Pulsuhr/Brustgurt), optional. Grundlage für den Leistungsumsatz im Ernährungsprotokoll.';
