-- ============================================================================
-- 057 – Trainer erfasst Messungen und Berechnungen im Namen von Kunden
-- Bisher durften nur Kunden selbst Körpermessungen (Körperfett-Verlauf) und
-- Kalorienbedarf (PAL-Rechner) speichern. Für das Trainer-Konto gilt jetzt:
-- Diese Werte werden immer einem Kunden zugeordnet; dafür braucht der Admin
-- Schreibrechte. Kunden behalten ihre bisherigen Rechte (inkl. Sperr-Regel).
-- Idempotent.
-- ============================================================================

-- Körpermessungen
drop policy if exists body_measurements_insert on public.body_measurements;
create policy body_measurements_insert on public.body_measurements
  for insert with check ((client_id = auth.uid() and not is_locked()) or is_admin());

drop policy if exists body_measurements_update on public.body_measurements;
create policy body_measurements_update on public.body_measurements
  for update using ((client_id = auth.uid() and not is_locked()) or is_admin())
  with check ((client_id = auth.uid() and not is_locked()) or is_admin());

drop policy if exists body_measurements_delete on public.body_measurements;
create policy body_measurements_delete on public.body_measurements
  for delete using ((client_id = auth.uid() and not is_locked()) or is_admin());

-- Kalorienbedarf (PAL-Rechner)
drop policy if exists energy_targets_insert on public.energy_targets;
create policy energy_targets_insert on public.energy_targets
  for insert with check ((client_id = auth.uid() and not is_locked()) or is_admin());

drop policy if exists energy_targets_delete on public.energy_targets;
create policy energy_targets_delete on public.energy_targets
  for delete using ((client_id = auth.uid() and not is_locked()) or is_admin());
