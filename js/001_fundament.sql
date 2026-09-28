-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Fundament: Profile, Rollen, Zugriffssperre, Row Level Security
--
-- Ausführen im Supabase SQL-Editor (Dashboard -> SQL Editor -> New query),
-- einmalig direkt nach dem Anlegen des Projekts.
-- ============================================================================

-- 1) Tabelle "profiles"
-- ----------------------------------------------------------------------------
-- Eine Zeile pro Nutzer, verknüpft 1:1 mit auth.users (dem eingebauten
-- Supabase-Auth-System). Hier steht alles, was über die reinen Login-Daten
-- hinausgeht: Name, Rolle, Zugriffsstatus.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  access_locked boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil- und Rollendaten je Nutzer, 1:1 zu auth.users.';
comment on column public.profiles.role is 'client = Coaching-/Trainingskunde, admin = Nicholas/Coach mit Vollzugriff.';
comment on column public.profiles.access_locked is 'true = Zugang gesperrt (z.B. bei ausbleibender Zahlung), von einem Admin gesetzt.';

alter table public.profiles enable row level security;


-- 2) Automatisches Anlegen des Profils bei Registrierung
-- ----------------------------------------------------------------------------
-- Wenn sich jemand über die App registriert, entsteht zunächst nur ein
-- Eintrag in auth.users. Dieser Trigger legt automatisch die passende Zeile
-- in public.profiles an, inkl. des bei der Registrierung übergebenen Namens.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'client'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3) Hilfsfunktionen für Rechte-Prüfungen
-- ----------------------------------------------------------------------------
-- "security definer" heißt: die Funktion läuft mit erhöhten Rechten und kann
-- dadurch die profiles-Tabelle unabhängig von RLS lesen. So vermeiden wir,
-- dass eine Policy auf profiles sich selbst rekursiv aufruft.

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_locked()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select access_locked from public.profiles where id = auth.uid()),
    false
  );
$$;

comment on function public.is_admin() is 'True, wenn der aktuell eingeloggte Nutzer Admin/Coach ist. In RLS-Policies verwenden.';
comment on function public.is_locked() is 'True, wenn der aktuell eingeloggte Nutzer gesperrt ist. Künftige Tabellen mit Kundendaten sollten Lesezugriff damit zusätzlich einschränken (and not is_locked()).';


-- 4) Policies für "profiles"
-- ----------------------------------------------------------------------------

-- Jeder darf sein eigenes Profil lesen
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins dürfen alle Profile lesen (für Trainer-Dashboard, Kundenverwaltung)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- Jeder darf seinen eigenen Namen ändern, aber NICHT seine eigene Rolle oder
-- den Sperrstatus (das wird über den Trigger unten zusätzlich abgesichert)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins dürfen jedes Profil ändern (Rolle setzen, Zugriff sperren/entsperren)
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Verhindert, dass ein normaler Kunde sich selbst zum Admin macht oder die
-- eigene Sperre aufhebt, auch wenn er direkt über die API schreiben würde.
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Nur Admins dürfen die Rolle ändern.';
    end if;
    if new.access_locked is distinct from old.access_locked then
      raise exception 'Nur Admins dürfen den Zugriffsstatus ändern.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_privilege_escalation on public.profiles;
create trigger trg_prevent_privilege_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_self_privilege_escalation();


-- 5) Deinen eigenen Admin-Account einrichten
-- ----------------------------------------------------------------------------
-- 1. Registriere dich einmal ganz normal über die App (index.html) mit
--    deiner eigenen E-Mail-Adresse.
-- 2. Führe danach EINMALIG den folgenden Befehl aus (E-Mail anpassen!),
--    um dich selbst zum Admin/Coach zu machen:
--
--    update public.profiles set role = 'admin' where email = 'deine@email.de';
--
-- Ohne diesen Schritt ist jeder neue Account automatisch ein normaler
-- Kunden-Account ("client").
