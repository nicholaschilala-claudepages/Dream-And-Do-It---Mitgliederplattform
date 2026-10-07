# Datensicherung & Wiederherstellung – Dream And Do It

Stand: Runde 22 · Status: **Skripte lokal getestet (Sicherung → Entschlüsselung → Wiederherstellung → Zeilenzahlen-Vergleich auf PostgreSQL 16). Gegen Dein echtes Supabase-Projekt und Dein Google Drive noch NICHT ausgeführt** – deshalb unbedingt Schritt 5 und 6 einmal durchführen.

## Was gesichert wird – und was nicht

| Gesichert | Nicht gesichert |
|---|---|
| Alle Tabellen im Schema `public` (Profile, Messwerte, Protokolle, Pläne, Nachrichten, Ziele, Übungen, Rezepte, Coaching-Inhalte …) inklusive Struktur | Supabase-Einstellungen (E-Mail-Vorlagen, SMTP, Passwort-Regeln, Redirect-URLs) – Screenshot/Notiz davon anlegen |
| Die Anmelde-Konten (`auth.users`, `auth.identities`) mit Passwort-Hashes – Kunden müssen sich nach einer Wiederherstellung **nicht** neu registrieren | Dateien im Supabase-Storage (die App nutzt keinen Storage) |
| Zeilenzahlen je Tabelle als Prüfliste | Der Programmcode – der liegt in GitHub (das ist Deine zweite Sicherung) |

## Wo und wann

* **Wann:** täglich gegen 03:17 UTC (im Winter 04:17, im Sommer 05:17 Uhr deutscher Zeit) und jederzeit auf Knopfdruck.
* **Wo:** GitHub Actions erzeugt die Sicherung, verschlüsselt sie (AES-256) und legt sie in Deinem Google Drive im Ordner `DreamAndDoIt-Backups` ab. Auf GitHub selbst bleibt nichts liegen.
* **Verschlüsselt:** Ohne die Passphrase kann niemand (auch nicht Google) die Daten lesen. **Speichere die Passphrase in Deinem Passwort-Manager. Geht sie verloren, sind alle Sicherungen unlesbar.**
* **Aufbewahrung:** Sicherungen werden nach 365 Tagen automatisch aus dem Drive-Ordner gelöscht (Standard im Workflow, passend zu den Datenschutzhinweisen). Pro Tag entsteht eine kleine Datei (derzeit wenige hundert KB bis wenige MB). Anderen Zeitraum: in GitHub unter *Settings → Secrets and variables → Actions → Variables* die Variable `KEEP_DAYS` anlegen (z. B. `730`). Gelöscht werden nur Dateien `dadi-backup-*.tar.gpg` in diesem Ordner.

## Einrichtung (einmalig, ca. 20 Minuten)

### 1. Verbindungs-Adresse aus Supabase holen
Supabase → Dein Projekt → oben **Connect** → Reiter **Session pooler** (Port 5432, **nicht** „Transaction pooler“ und nicht „Direct connection“ – GitHub kann Letztere nicht erreichen). Die Adresse sieht aus wie  
`postgresql://postgres.<projekt-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres`  
`[YOUR-PASSWORD]` durch Dein Datenbank-Passwort ersetzen (Projekt-Einstellungen → Database → „Reset database password“, falls nicht mehr bekannt; Sonderzeichen im Passwort ggf. URL-kodieren, z. B. `@` → `%40`).

### 2. Passphrase festlegen
Eine lange, zufällige Passphrase (mindestens 20 Zeichen) im Passwort-Manager erzeugen und dort mit dem Vermerk „Dream And Do It Backup“ speichern.

### 3. Google-Drive-Zugang erzeugen (auf Deinem Computer)
1. rclone von <https://rclone.org/downloads/> installieren.
2. Im Terminal: `rclone authorize "drive" --drive-scope drive.file`
3. Der Browser öffnet sich → mit Deinem Google-Konto anmelden und zustimmen. Der Zugriff gilt nur für Dateien, die diese Sicherung selbst anlegt (`drive.file`), nicht für Dein übriges Drive.
4. Im Terminal erscheint ein Text in geschweiften Klammern `{"access_token":"…","token_type":"Bearer","refresh_token":"…","expiry":"…"}` – **komplett kopieren**.

### 4. Geheimnisse in GitHub hinterlegen
GitHub → Dein Repository → *Settings → Secrets and variables → Actions → New repository secret*. Drei Secrets (Namen exakt so):

| Name | Inhalt |
|---|---|
| `SUPABASE_DB_URL` | die Adresse aus Schritt 1 |
| `BACKUP_PASSPHRASE` | die Passphrase aus Schritt 2 |
| `RCLONE_GDRIVE_TOKEN` | der Text aus Schritt 3 |

Optional unter *Variables*: `GDRIVE_FOLDER` (anderer Ordnername), `KEEP_DAYS` (Aufräumen, siehe oben), `PG_CLIENT_VERSION` (nur falls Supabase auf eine neuere PostgreSQL-Version als 17 umgestellt wird).

### 5. Erste Sicherung von Hand starten
GitHub → Reiter **Actions** → „Datensicherung (Supabase -> Google Drive)“ → **Run workflow**. Nach 1–3 Minuten muss der Lauf grün sein, und in Deinem Google Drive liegt `DreamAndDoIt-Backups/dadi-backup-….tar.gpg`. Bei Rot: Protokoll öffnen (enthält keine Geheimnisse), die Fehlermeldung ist meist ein falsches Passwort oder die falsche Verbindungs-Adresse.

### 6. Wiederherstellung EINMAL testen (wichtig!)
Eine Sicherung gilt erst als brauchbar, wenn sie zurückgespielt wurde. Lege dafür ein **kostenloses zweites Supabase-Projekt** („dadi-test“) an und führe die Schritte unten aus. Danach kannst Du es pausieren/löschen.

## Wiederherstellung im Ernstfall

Voraussetzung: Computer mit `psql`, `pg_restore` (PostgreSQL-Client 17), `gpg`, `tar`, und dieser Ordner (`tools/backup/` und `sql/` aus Deinem GitHub-Repository).

1. **Neues Supabase-Projekt anlegen** (leer; gleiche Region). Beim Anlegen ein neues Datenbank-Passwort vergeben. *Nicht* die kaputte Datenbank überschreiben.
2. **Neueste Sicherung aus Google Drive herunterladen** (`dadi-backup-….tar.gpg`).
3. **Session-Pooler-Adresse des neuen Projekts** holen (wie Schritt 1).
4. Im Terminal, im Hauptordner des Repositorys:  
   `BACKUP_PASSPHRASE='…Deine Passphrase…' bash tools/backup/restore.sh ~/Downloads/dadi-backup-….tar.gpg 'postgresql://…neue Adresse…'`  
   Das Skript spielt alle Migrationen ein, lädt Konten und Daten und vergleicht danach die Zeilenzahlen. Jede Zeile muss `OK` zeigen. Es bricht ab, wenn im Ziel schon Konten existieren (Schutz vor Überschreiben).
5. **Nach der Wiederherstellung:**
   * `js/config.js`: neue Projekt-URL und neuen *publishable key* eintragen, auf GitHub hochladen (Pages veröffentlicht automatisch).
   * Supabase → Authentication → URL Configuration: Website-URL und Redirect-URLs auf `https://www.dreamanddoit.de` setzen; E-Mail-Vorlagen/SMTP erneut einstellen.
   * Mit Deinem Admin-Konto anmelden und stichprobenartig prüfen (Kundenliste, ein Kunde mit Verlauf, Nachrichten).
   * Kunden informieren, falls Daten seit der letzten Sicherung (max. 24 h) fehlen.
6. Dauer bei der heutigen Datenmenge: wenige Minuten für das Skript, insgesamt rund 30–60 Minuten inklusive Konfiguration.

## Grenzen – ehrlich benannt

* **Maximal 24 Stunden Datenverlust möglich** (Zeit seit der letzten täglichen Sicherung). Wer weniger riskieren will, wechselt später auf Supabase Pro (tägliche Sicherungen für 7 Tage, optional minutengenaue Wiederherstellung als Zusatz) – diese Sicherung bleibt dann als zweite, unabhängige Kopie sinnvoll.
* **Supabase Free pausiert Projekte nach 7 Tagen ohne Aktivität.** Mit echten Kunden, die regelmäßig die App nutzen, ist das unkritisch. Ob der tägliche Sicherungslauf allein als „Aktivität“ zählt, ist von Supabase nicht verbindlich dokumentiert – darauf also nicht verlassen. Ein pausiertes Projekt lässt sich im Dashboard per Klick wieder starten; die Daten bleiben erhalten.
* **GitHub legt geplante Läufe still, wenn 60 Tage lang nichts im Repository passiert.** Der letzte Schritt des Workflows setzt diesen Zähler täglich zurück. Schlägt ein Lauf fehl, schickt GitHub eine E-Mail an den Konto-Inhaber – diese Mails nicht ignorieren. Zusätzlich einmal im Monat kurz in Google Drive nachsehen, ob die neueste Datei von gestern ist.
* **Das Google-Token** bleibt gültig, solange es regelmäßig genutzt wird. Wird der Zugriff in Deinem Google-Konto widerrufen oder das Passwort geändert, schlägt der Upload fehl → Schritt 3 und das Secret `RCLONE_GDRIVE_TOKEN` erneuern.
* Wird das Datenbank-Passwort in Supabase geändert, muss `SUPABASE_DB_URL` angepasst werden.
