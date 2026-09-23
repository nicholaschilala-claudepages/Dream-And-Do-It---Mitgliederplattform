# Dream And Do It – Kundenplattform · Fundament

Dies ist die erste Etappe der Kundenplattform: Login/Registrierung, Profile,
Rollen (Kunde/Admin), Zugriffssperre und die installierbare PWA-Hülle im
Dream-And-Do-It-Branding. Die eigentlichen Inhalte (Training, Ernährung,
Coaching, Wochenreport, Trainer-Dashboard) folgen in den nächsten Etappen
und bauen auf diesem Fundament auf.

## 1. Supabase-Projekt anlegen

1. Auf [supabase.com](https://supabase.com) registrieren und "New Project" wählen.
2. Region: **Frankfurt (eu-central-1)** – wichtig für die EU-Datenhaltung.
3. Tarif: **Free**.
4. Ein Datenbank-Passwort generieren lassen und sicher verwahren (Passwortmanager) – wird im Alltag nicht gebraucht.

## 2. Datenbank einrichten

1. Im Supabase-Dashboard zu **SQL Editor** wechseln.
2. Den Inhalt von `sql/001_fundament.sql` einfügen und ausführen.
3. Danach einmal ganz normal über die App (`index.html`) einen eigenen Account registrieren.
4. Im SQL Editor folgenden Befehl mit deiner eigenen E-Mail ausführen, um dich selbst zum Admin/Coach zu machen:
   ```sql
   update public.profiles set role = 'admin' where email = 'deine@email.de';
   ```

## 3. Zugangsdaten eintragen

1. Im Supabase-Dashboard zu **Project Settings -> API**.
2. **Project URL** und den öffentlichen Schlüssel kopieren. Je nach Alter des Projekts heißt dieser **anon public** (Format `eyJ...`) oder **publishable key** (neueres Format `sb_publishable_...`) – beide sind funktional identisch und dafür gedacht, im Frontend zu stehen.
3. Bereits eingetragen (Stand dieses Pakets): Project URL `https://lyitxlxhpytizjnthpqt.supabase.co` und der publishable Key.

**Wichtig:** Trage dort niemals den `service_role`/`secret` Key oder das Datenbank-Passwort ein – nur den öffentlichen (anon/publishable) Key.

## 4. Auth-Einstellungen in Supabase prüfen

1. **Authentication -> Providers**: "Email" sollte aktiviert sein (Standard).
2. **Authentication -> URL Configuration**: Als "Site URL" die spätere GitHub-Pages-Adresse eintragen (z.B. `https://<dein-github-name>.github.io/<repo-name>/`), sonst funktionieren die Links in Bestätigungs- und Passwort-Reset-Mails nicht korrekt. Diese Adresse bekommst du in Schritt 5.
3. Standardmäßig muss ein neuer Kunde seine E-Mail-Adresse bestätigen, bevor er sich einloggen kann (Bestätigungsmail kommt automatisch von Supabase). Das kann unter **Authentication -> Providers -> Email** bei Bedarf deaktiviert werden, ist aber aus Sicherheitssicht empfehlenswert, es zu belassen.

## 5. Veröffentlichen (GitHub Pages)

1. Diesen Ordner in ein neues GitHub-Repository laden (z.B. `dream-and-do-it-plattform`).
2. Im Repository unter **Settings -> Pages**: als Quelle den `main`-Branch (Root) wählen.
3. Nach ein bis zwei Minuten ist die Seite unter `https://<dein-github-name>.github.io/<repo-name>/` erreichbar.
4. Diese Adresse wie in Schritt 4 beschrieben als "Site URL" in Supabase eintragen.

## 6. Eigenes Logo einsetzen

Die Dateien `icons/icon-192.png` und `icons/icon-512.png` sind aktuell nur
Platzhalter. Ersetze sie durch euer echtes Logo (quadratisch, in den
genannten Pixelgrößen exportiert), Dateinamen beibehalten.

## Was ist in diesem Fundament enthalten?

- Registrierung & Login per E-Mail/Passwort, Passwort-Reset-Flow
- Automatisch angelegtes Profil je Nutzer (Rolle: Kunde oder Admin)
- Zugriffssperre: ein Admin kann `access_locked` auf `true` setzen (z.B. über den SQL Editor oder später über das Trainer-Dashboard), der Kunde sieht dann eine Sperr-Ansicht statt der Inhalte
- Row Level Security in der Datenbank: Kunden können ausschließlich ihre eigenen Daten sehen/ändern, nur Admins sehen alle – das gilt als Muster auch für alle künftigen Tabellen
- Installierbare PWA mit Offline-fähiger App-Hülle (Service Worker), Hell-/Dunkel-Modus, Branding in Navy/Gold mit Cinzel/Source Serif 4

## Nächste Etappe

Trainingsbereich: Übungsbibliothek, personalisierte Plan-Zuweisung, Tracking
von Wiederholungen/Gewicht/Datum, offline-fähig.
