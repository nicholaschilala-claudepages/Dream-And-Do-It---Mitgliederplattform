#!/usr/bin/env bash
# Dream And Do It – Wiederherstellung aus einer verschlüsselten Sicherung.
#
# Aufruf:  BACKUP_PASSPHRASE='…' ./restore.sh <dadi-backup-….tar.gpg> '<ZIEL_DB_URI>'
#
# ZIEL = ein NEUES, leeres Supabase-Projekt (Session-Pooler-URI). Das Skript
#   1. entschlüsselt die Sicherung,
#   2. spielt die Migrationen sql/*.sql ein (Tabellen, Regeln, Funktionen, Trigger),
#   3. leert die Tabellen (nur bei leerem Ziel erlaubt, sonst Abbruch),
#   4. lädt Konten (auth) und Daten (public) mit ausgeschaltetem Trigger-System,
#   5. vergleicht die Zeilenzahlen mit der Sicherung.
# Schutz: Ist im Ziel bereits ein Kundenkonto vorhanden, bricht das Skript ab
# (außer FORCE=1) – so kann damit nicht versehentlich die Live-Datenbank überschrieben werden.
set -euo pipefail

FILE="${1:?Aufruf: restore.sh <datei.tar.gpg> <ziel-db-uri>}"
TARGET="${2:?Ziel-Datenbank-URI fehlt}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="${SQL_DIR:-$HERE/../../sql}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

psqlt() { psql "$TARGET" -v ON_ERROR_STOP=1 -X -At "$@"; }

echo "== 1/5 Entschlüsseln"
if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
  printf '%s' "$BACKUP_PASSPHRASE" | gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 0 --decrypt "$FILE" | tar -x -C "$WORK"
else
  gpg --quiet --decrypt "$FILE" | tar -x -C "$WORK"
fi
DIR="$(find "$WORK" -mindepth 1 -maxdepth 1 -type d | head -1)"
cat "$DIR/MANIFEST.txt" | head -3
AUTH_TABLES="$(grep '^Auth-Tabellen:' "$DIR/MANIFEST.txt" | cut -d: -f2-)"

echo "== 2/5 Zielprüfung"
EXISTING="$(psqlt -c "select count(*) from auth.users" 2>/dev/null || echo 0)"
if [ "$EXISTING" != "0" ] && [ "${FORCE:-0}" != "1" ]; then
  echo "ABBRUCH: Im Ziel gibt es bereits ${EXISTING} Konten. Das Skript ist nur für ein NEUES, leeres Projekt gedacht." >&2
  echo "         (Wenn Du genau weißt, was Du tust: FORCE=1 setzen.)" >&2
  exit 1
fi

echo "== 3/5 Migrationen einspielen (Struktur, Regeln, Funktionen, Trigger)"
for f in "$SQL_DIR"/*.sql; do
  echo "   $(basename "$f")"
  psql "$TARGET" -v ON_ERROR_STOP=1 -X -q -f "$f" > /dev/null
done

echo "== 4/5 Daten einspielen"
TABLES="$(psqlt -c "select string_agg(format('public.%I', tablename), ', ') from pg_tables where schemaname='public'")"
psqlt -c "truncate ${TABLES} restart identity cascade"
export PGOPTIONS='-c session_replication_role=replica'
pg_restore --data-only --no-owner --no-privileges --dbname "$TARGET" "$DIR/auth.dump"
pg_restore --data-only --no-owner --no-privileges --dbname "$TARGET" "$DIR/public.dump"
unset PGOPTIONS

echo "== 5/5 Kontrolle der Zeilenzahlen"
BAD=0
while IFS=$'\t' read -r t expected; do
  actual="$(psqlt -c "select count(*) from $t")"
  if [ "$actual" = "$expected" ]; then printf 'OK     %-45s %s\n' "$t" "$actual"
  else printf 'ABWEICHUNG %-41s Sicherung=%s Ziel=%s\n' "$t" "$expected" "$actual"; BAD=1; fi
done < "$DIR/zeilenzahlen.tsv"
if [ "$BAD" = "1" ]; then echo "ACHTUNG: Es gibt Abweichungen – siehe oben." >&2; exit 2; fi
echo "Wiederherstellung vollständig. Nächste Schritte: siehe BACKUP-UND-WIEDERHERSTELLUNG.md (Abschnitt 'Nach der Wiederherstellung')."
