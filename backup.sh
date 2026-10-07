#!/usr/bin/env bash
# Dream And Do It – verschlüsselte Datensicherung der Supabase-Datenbank.
#
# Ablauf: Dump (Tabellen im Schema "public" + Konten aus "auth") -> Packen ->
#         Verschlüsseln (AES-256, Passphrase) -> Entschlüsselungs-Probe ->
#         Upload zu Google Drive (rclone) -> Upload-Kontrolle.
# Es wird NIEMALS etwas gelöscht, außer Du setzt ausdrücklich KEEP_DAYS.
#
# Benötigte Umgebungsvariablen:
#   SUPABASE_DB_URL      Verbindungs-URI (Session Pooler, Port 5432)
#   BACKUP_PASSPHRASE    Passphrase für die Verschlüsselung
#   RCLONE_GDRIVE_TOKEN  rclone-Token (JSON) für Google Drive – nicht nötig bei SKIP_UPLOAD=1
# Optional:
#   GDRIVE_FOLDER (Standard: DreamAndDoIt-Backups), KEEP_DAYS (Standard: leer = nie löschen),
#   AUTH_TABLES (Standard: "auth.users auth.identities"), SKIP_UPLOAD=1, OUT_DIR,
#   ALLOW_EMPTY=1 (erlaubt eine Sicherung ohne Kundenkonten)
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL fehlt}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE fehlt}"
if [ "${SKIP_UPLOAD:-0}" != "1" ]; then : "${RCLONE_GDRIVE_TOKEN:?RCLONE_GDRIVE_TOKEN fehlt}"; fi

AUTH_TABLES="${AUTH_TABLES:-auth.users auth.identities}"
GDRIVE_FOLDER="${GDRIVE_FOLDER:-DreamAndDoIt-Backups}"
OUT_DIR="${OUT_DIR:-$(mktemp -d)}"
STAMP="$(date -u +%Y%m%d-%H%M%SZ)"
NAME="dadi-backup-${STAMP}"
WORK="${OUT_DIR}/${NAME}"
mkdir -p "$WORK"
trap 'rm -rf "$WORK" "${OUT_DIR}/${NAME}.tar"' EXIT

psqlq() { psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -X -At "$@"; }

echo "== 1/6 Verbindung und Plausibilität"
psqlq -c "select 'Server: '||version()" | cut -c1-80
PROFILES="$(psqlq -c "select count(*) from public.profiles")"
echo "Profile in der Datenbank: ${PROFILES}"
if [ "$PROFILES" = "0" ] && [ "${ALLOW_EMPTY:-0}" != "1" ]; then
  echo "FEHLER: Keine Profile gefunden – Sicherung wird abgebrochen (falsche Datenbank?)." >&2
  exit 1
fi

echo "== 2/6 Zeilenzahlen je Tabelle (für spätere Kontrolle)"
{
  psqlq -F $'\t' -c "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1" |
  while read -r t; do
    printf 'public.%s\t%s\n' "$t" "$(psqlq -c "select count(*) from public.\"$t\"")"
  done
  for t in $AUTH_TABLES; do
    printf '%s\t%s\n' "$t" "$(psqlq -c "select count(*) from $t")"
  done
} > "$WORK/zeilenzahlen.tsv"
cat "$WORK/zeilenzahlen.tsv"

echo "== 3/6 Dump (Schema public inkl. Daten, Konten aus auth)"
pg_dump "$SUPABASE_DB_URL" --format=custom --schema=public --no-owner --no-privileges --file "$WORK/public.dump"
authargs=(); for t in $AUTH_TABLES; do authargs+=(--table="$t"); done
pg_dump "$SUPABASE_DB_URL" --format=custom --data-only --no-owner --no-privileges "${authargs[@]}" --file "$WORK/auth.dump"
# Inhaltsverzeichnis lesen = Dump ist technisch intakt
pg_restore --list "$WORK/public.dump" > /dev/null
pg_restore --list "$WORK/auth.dump" > /dev/null
{ echo "Zeitpunkt (UTC): ${STAMP}"; echo "Auth-Tabellen: ${AUTH_TABLES}"; (cd "$WORK" && sha256sum public.dump auth.dump zeilenzahlen.tsv); } > "$WORK/MANIFEST.txt"

echo "== 4/6 Packen und verschlüsseln (AES-256)"
tar -C "$OUT_DIR" -cf "${OUT_DIR}/${NAME}.tar" "$NAME"
printf '%s' "$BACKUP_PASSPHRASE" | gpg --batch --yes --quiet --pinentry-mode loopback --passphrase-fd 0 \
  --symmetric --cipher-algo AES256 --output "${OUT_DIR}/${NAME}.tar.gpg" "${OUT_DIR}/${NAME}.tar"

echo "== 5/6 Entschlüsselungs-Probe"
printf '%s' "$BACKUP_PASSPHRASE" | gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 0 \
  --decrypt "${OUT_DIR}/${NAME}.tar.gpg" | tar -t > /dev/null
SIZE="$(stat -c %s "${OUT_DIR}/${NAME}.tar.gpg")"
echo "Fertig: ${NAME}.tar.gpg (${SIZE} Bytes)"

if [ "${SKIP_UPLOAD:-0}" = "1" ]; then
  echo "== 6/6 Upload übersprungen (SKIP_UPLOAD=1). Datei: ${OUT_DIR}/${NAME}.tar.gpg"
  exit 0
fi

echo "== 6/6 Upload zu Google Drive (${GDRIVE_FOLDER})"
export RCLONE_CONFIG_GDRIVE_TYPE=drive
export RCLONE_CONFIG_GDRIVE_SCOPE=drive.file
export RCLONE_CONFIG_GDRIVE_TOKEN="$RCLONE_GDRIVE_TOKEN"
rclone copy "${OUT_DIR}/${NAME}.tar.gpg" "gdrive:${GDRIVE_FOLDER}" --retries 3
rclone check "${OUT_DIR}" "gdrive:${GDRIVE_FOLDER}" --include "${NAME}.tar.gpg" --one-way
echo "Upload geprüft: ${GDRIVE_FOLDER}/${NAME}.tar.gpg"

# Optional und nur auf Deinen ausdrücklichen Wunsch (Variable KEEP_DAYS gesetzt):
if [ -n "${KEEP_DAYS:-}" ]; then
  echo "KEEP_DAYS=${KEEP_DAYS}: Sicherungen älter als ${KEEP_DAYS} Tage werden gelöscht."
  rclone delete "gdrive:${GDRIVE_FOLDER}" --include "dadi-backup-*.tar.gpg" --min-age "${KEEP_DAYS}d"
fi
echo "Sicherung abgeschlossen."
