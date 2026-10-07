-- ============================================================================
-- 058 – Fehlende Tabellenrechte nachziehen
-- Fehlerbild im Trainer-Konto (Kundenanalyse): "permission denied for table
-- client_subtab_access". Ursache: Einige Tabellen (z. B. aus Migration 046)
-- wurden ohne GRANT an die Rolle "authenticated" angelegt. Ohne dieses Recht
-- kommt niemand an die Tabelle, auch nicht der Admin und unabhängig von den
-- Zeilenschutz-Regeln (RLS).
--
-- Diese Migration vergibt das Basisrecht (SELECT/INSERT/UPDATE/DELETE) nur für
-- Tabellen, auf denen RLS aktiv ist und die "authenticated" bisher noch gar kein
-- Recht hat. Was jemand tatsächlich sehen/ändern darf, bestimmen weiterhin die
-- RLS-Regeln. Tabellen OHNE RLS werden bewusst nicht freigegeben (Hinweis im
-- Meldungsfenster). Sequenzen werden entsprechend nachgezogen. Idempotent.
-- ============================================================================
do $$
declare t record;
begin
  for t in
    select c.oid, c.relname, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
      and not has_table_privilege('authenticated', c.oid, 'select')
      and not has_table_privilege('authenticated', c.oid, 'insert')
  loop
    if t.relrowsecurity then
      execute format('grant select, insert, update, delete on public.%I to authenticated', t.relname);
      raise notice 'Recht vergeben: %', t.relname;
    else
      raise notice 'ÜBERSPRUNGEN (RLS nicht aktiv): %', t.relname;
    end if;
  end loop;
end $$;

grant usage, select on all sequences in schema public to authenticated;
