-- ============================================================================
-- Dream And Do It – Kundenplattform
-- Etappe 5: Betreiber-Seite (Frühwarnsystem, Wochenreport-Datenbasis, Nachrichten)
--
-- Im Supabase SQL Editor ausführen, NACHDEM 001-004 bereits liefen.
-- ============================================================================

-- 1) Aktivitäts-Übersicht je Kunde (Basis für das Trainer-Frühwarnsystem)
-- ----------------------------------------------------------------------------
-- "security_invoker = true" sorgt dafür, dass die View mit den Rechten des
-- ausführenden Nutzers läuft, statt mit denen des Ersteller-Accounts – damit
-- greifen die bestehenden RLS-Policies der einzelnen Tabellen unverändert
-- (Kunde sieht nur sich selbst, Admin sieht alle).
create or replace view public.client_last_activity
with (security_invoker = true) as
select client_id, max(activity_at) as last_activity_at
from (
  select client_id, performed_at as activity_at from public.training_logs
  union all
  select client_id, measured_at::timestamptz as activity_at from public.body_measurements
  union all
  select client_id, completed_at as activity_at from public.questionnaire_responses
) t
group by client_id;

comment on view public.client_last_activity is 'Letzter Aktivitätszeitpunkt je Kunde (Training, Körpermaße, Fragebögen) – Grundlage für das Trainer-Frühwarnsystem.';

grant select on public.client_last_activity to authenticated;


-- 2) Nachrichten zwischen Coach und Kunde
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  service_context text,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.messages is 'Direktnachrichten zwischen Coach (Admin) und Kunde, optional einer Leistung/einem Thema zugeordnet.';

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
  on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
  on public.messages for insert
  with check (sender_id = auth.uid() and not public.is_locked());

drop policy if exists "messages_update" on public.messages;
create policy "messages_update"
  on public.messages for update
  using (recipient_id = auth.uid() or public.is_admin())
  with check (recipient_id = auth.uid() or public.is_admin());

drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete"
  on public.messages for delete
  using (sender_id = auth.uid() or public.is_admin());


-- 3) Basis-Zugriffsrechte
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.messages to authenticated;
