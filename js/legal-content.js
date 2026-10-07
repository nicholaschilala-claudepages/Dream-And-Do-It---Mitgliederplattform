// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22: Rechtstexte der Plattform (Impressum, Datenschutzhinweise,
// Nutzungsbedingungen) und Wortlaut der Einwilligungen.
//
// Stand Oktober 2026: Texte auf Basis der tatsächlichen Funktionsweise der
// Plattform und der Angaben von Nicholas Chilala (Website dreamanddoit.de,
// Finanzamts- und Gewerbeunterlagen). Sie sind keine Rechtsberatung; der
// Betreiber nutzt die Plattform in eigener Verantwortung. Bei inhaltlichen
// Änderungen LEGAL_VERSION erhöhen (dann wird die Einwilligung bei
// bestehenden Kunden erneut abgefragt).
// ============================================================================

export const LEGAL_DRAFT = false;
export const LEGAL_VERSION = '2026-10-v2';
export const LEGAL_DATE = 'Oktober 2026';

export const CONTACT = {
  name: 'Dream And Do It',
  owner: 'Nicholas Chilala',
  street: 'Westring 22a',
  city: '27793 Wildeshausen',
  email: 'info@dreamanddoit.de',
  phone: '0172 383 41 68',
  taxNumber: '68/108/08195',
  web: 'www.dreamanddoit.de',
  websiteImprint: 'https://dreamanddoit.de/impressum/',
  websitePrivacy: 'https://dreamanddoit.de/datenschutzerklaerung/',
};

// Wortlaut der Einwilligungen (Registrierung und nachträgliche Abfrage)
export const CONSENT_TEXTS = {
  terms: 'Ich habe die <a href="nutzungsbedingungen.html" target="_blank" rel="noopener">Nutzungsbedingungen</a> und die <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzhinweise</a> gelesen und akzeptiere die Nutzungsbedingungen.',
  health: 'Ich willige ausdrücklich ein, dass Dream And Do It meine <strong>Gesundheitsdaten</strong> (z. B. Trainings-, Mess- und Testwerte, Blutdruck, Ruhepuls, Fragebogenergebnisse, Ernährungs- und Körperangaben) auf dieser Plattform verarbeitet, um mein Coaching und Training durchzuführen (Art. 9 Abs. 2 lit. a DSGVO). Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, zum Beispiel per E-Mail an info@dreamanddoit.de.',
};

export const LEGAL_DOCS = {
  impressum: {
    title: 'Impressum',
    sections: [
      { h: 'Angaben gemäß § 5 DDG', p: [
        'Dream And Do It<br>Inhaber: Nicholas Chilala<br>Westring 22a<br>27793 Wildeshausen',
      ] },
      { h: 'Kontakt', p: [
        'E-Mail: info@dreamanddoit.de<br>Telefon: 0172 383 41 68<br>Internet: www.dreamanddoit.de',
      ] },
      { h: 'Umsatzsteuer', p: [
        'Steuernummer: 68/108/08195<br>Umsatzsteuer-Identifikationsnummer nach § 27a UStG: wird nach Erteilung durch das Finanzamt hier ergänzt.',
      ] },
      { h: 'Gewerbe', p: [
        'Die Gewerbeerlaubnis nach § 14 GewO wurde am 15.10.2025 von der Stadt Wildeshausen erteilt.',
      ] },
      { h: 'Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)', p: [
        'Nicholas Chilala, Am Spascher Park 14a, 27793 Wildeshausen.',
      ] },
      { h: 'Verbraucherstreitbeilegung', p: [
        'Wir sind bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Zuständig ist die Universalschlichtungsstelle des Zentrums für Schlichtung e.V., Straßburger Straße 8, 77694 Kehl am Rhein, <a href="https://www.verbraucher-schlichter.de" target="_blank" rel="noopener">www.verbraucher-schlichter.de</a>.',
      ] },
      { h: 'Hinweis', p: [
        'Dieses Impressum gilt für die Kundenplattform. Das Impressum der Website findest du unter <a href="https://dreamanddoit.de/impressum/" target="_blank" rel="noopener">dreamanddoit.de/impressum</a>.',
      ] },
    ],
  },

  datenschutz: {
    title: 'Datenschutzhinweise zur Kundenplattform',
    intro: 'Hier erfährst du, welche Daten die Plattform verarbeitet, warum, auf welcher Grundlage und welche Rechte du hast. Für die Website www.dreamanddoit.de gilt die <a href="https://dreamanddoit.de/datenschutzerklaerung/" target="_blank" rel="noopener">Datenschutzerklärung der Website</a>.',
    sections: [
      { h: '1. Verantwortlicher', p: [
        'Dream And Do It, Inhaber Nicholas Chilala, Westring 22a, 27793 Wildeshausen, E-Mail: info@dreamanddoit.de.',
        'Einen Datenschutzbeauftragten haben wir nicht benannt. Eine Benennungspflicht besteht nicht, da bei uns weniger als 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten befasst sind (§ 38 BDSG).',
      ] },
      { h: '2. Welche Daten wir verarbeiten', p: ['Je nachdem, welche Funktionen du nutzt:'], ul: [
        '<strong>Konto:</strong> Name, E-Mail-Adresse, Passwort (nur verschlüsselt gespeichert), Zeitpunkt der Registrierung und deiner Einwilligungen, freigeschaltete Bereiche.',
        '<strong>Profil:</strong> Geburtsdatum, Körpergröße, biologisches Geschlecht (für Vergleichswerte).',
        '<strong>Training:</strong> Trainingspläne, Einheiten, Sätze, Wiederholungen, Gewichte, Distanzen, Dauer, Erfolge und Rekorde.',
        '<strong>Gesundheits- und Messdaten:</strong> Körpermaße und Körperfett, Tests (Kraft, Beweglichkeit, Herz-Kreislauf), Blutdruck, Ruhepuls, Präventionscheck inklusive Lebensstilangaben (Sitzen, Schlaf, Ernährung, Rauchen, Alkohol).',
        '<strong>Ernährung:</strong> Ernährungsprotokoll, PAL-Rechner, Körperfett-Verlauf.',
        '<strong>Coaching:</strong> Fragebogen-Ergebnisse (z. B. Selbstwirksamkeit, Wohlbefinden, Stress), Ziele (GROW) mit Notizen, gelesene Inhalte, gewählte Interessen.',
        '<strong>Kommunikation:</strong> Nachrichten zwischen dir und dem Coach.',
        '<strong>Technik:</strong> Geräte-Kennung und Gerätebezeichnung (für das Limit von zwei Geräten), Zeitstempel von Einträgen. Beim Aufruf der Seiten verarbeitet der Hosting-Anbieter technisch notwendig deine IP-Adresse.',
      ] },
      { h: '3. Zwecke und Rechtsgrundlagen', ul: [
        '<strong>Durchführung des Coachings und Trainings sowie der Plattform</strong> (Konto, Pläne, Protokolle, Nachrichten): Art. 6 Abs. 1 lit. b DSGVO (Vertrag).',
        '<strong>Gesundheitsdaten</strong> (Messwerte, Tests, Blutdruck, Ruhepuls, Fragebögen, Präventionscheck): ausdrückliche Einwilligung nach Art. 9 Abs. 2 lit. a DSGVO. Du erteilst sie bei der Registrierung. Ohne diese Einwilligung können wir dir die Plattform nicht bereitstellen, weil ihr Zweck genau darin besteht, diese Daten zu erfassen und auszuwerten.',
        '<strong>Sicherheit, Fehlerbehebung, Geräte-Limit und Missbrauchsschutz:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).',
        '<strong>Gesetzliche Aufbewahrungspflichten</strong> (z. B. steuerrechtlich für Vertragsunterlagen): Art. 6 Abs. 1 lit. c DSGVO.',
      ] },
      { h: '4. Wer hat Zugriff', p: [
        'Zugriff auf deine Daten hast du selbst. Dein Coach Nicholas Chilala sieht deine Daten, um dich zu betreuen, Pläne zu erstellen und Fortschritte zu besprechen. Andere Kunden sehen deine Daten nicht. Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.',
        'Hinweise, Empfehlungen, Erfolge, Scores und Auswertungen (z. B. Wochen-Serie, Präventionsscore, empfohlene Rubriken) werden nach festen Regeln berechnet. Es gibt keine automatisierte Entscheidung mit rechtlicher Wirkung für dich (Art. 22 DSGVO).',
      ] },
      { h: '5. Dienstleister (Auftragsverarbeiter)', ul: [
        '<strong>Supabase</strong> (Datenbank, Anmeldung): speichert deine Daten. Die Datenbank liegt in einem Rechenzentrum in der EU (Frankfurt am Main). Mit Supabase besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.',
        '<strong>Google Drive</strong> (Google Ireland Ltd.): speichert eine <em>verschlüsselte</em> tägliche Sicherungskopie der Datenbank (Schlüssel liegt nur beim Betreiber), damit deine Daten nach einem technischen Ausfall wiederhergestellt werden können. Google erhält ausschließlich verschlüsselte Dateien, die ohne diesen Schlüssel nicht lesbar sind.',
        '<strong>Hosting der Website:</strong> Die Website dreamanddoit.de wird bei IONOS SE (Elgendorfer Straße 57, 56410 Montabaur) betrieben; dort gilt deren Datenschutzerklärung. Mit der Plattform selbst hat das nichts zu tun.',
        '<strong>GitHub Pages</strong> (GitHub, Inc./Microsoft): liefert die Dateien der App aus. Dabei wird technisch notwendig deine IP-Adresse verarbeitet. Dort läuft außerdem der automatische Sicherungsvorgang; dabei liegen Daten nur flüchtig während des Vorgangs auf einem temporären Rechner und werden verschlüsselt weitergegeben. Gesundheitsdaten werden dort nicht gespeichert.',
        '<strong>E-Mail-Versand</strong> für Bestätigung und Passwort-Zurücksetzen: über den E-Mail-Versand von Supabase. Dabei werden deine E-Mail-Adresse und der Inhalt der jeweiligen Nachricht verarbeitet.',
      ] },
      { h: '6. Übermittlung in Drittländer', p: [
        'Sofern Dienstleister Daten in den USA verarbeiten, geschieht das auf Grundlage des Angemessenheitsbeschlusses zum EU-US Data Privacy Framework oder von EU-Standardvertragsklauseln. Zusätzlich sichern wir die Übermittlung durch Verschlüsselung (siehe Abschnitt 10) ab.',
      ] },
      { h: '7. Speicherung im Browser und Cookies', p: [
        'Die Plattform setzt keine Tracking- oder Werbe-Cookies und nutzt keine Analyse-Dienste. Technisch notwendig sind: dein Anmelde-Token, die Wahl von hellem oder dunklem Design, eine zufällige Geräte-Kennung (Geräte-Limit), eine Warteschlange für noch nicht gesendete Einträge bei schlechter Verbindung sowie ein Zwischenspeicher für die Offline-Nutzung. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1 lit. b und f DSGVO.',
        'Schriften und Bibliotheken werden von der Plattform selbst ausgeliefert. Es werden keine externen Schriftarten- oder Skriptdienste nachgeladen.',
      ] },
      { h: '8. Speicherdauer', p: [
        'Wir speichern deine Daten, solange dein Konto besteht. Wenn du dein Konto löschen lassen möchtest, schreib uns eine E-Mail; wir löschen deine Plattform-Daten, soweit keine gesetzliche Aufbewahrungspflicht entgegensteht. In den verschlüsselten Sicherungskopien bleiben deine Daten noch bis zu 12 Monate erhalten, werden danach gelöscht und in dieser Zeit nicht für andere Zwecke verwendet. Haben wir dein Konto nicht auf deinen Wunsch gelöscht, löschen wir deine Plattform-Daten spätestens 12 Monate nach Ende deines Vertrags. Löschanfragen bearbeiten wir innerhalb eines Monats.',
      ] },
      { h: '9. Deine Rechte', p: [
        'Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen; die Rechtmäßigkeit der bisherigen Verarbeitung bleibt unberührt. Schreib dafür an info@dreamanddoit.de.',
        'Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover (<a href="https://www.lfd.niedersachsen.de" target="_blank" rel="noopener">www.lfd.niedersachsen.de</a>).',
      ] },
      { h: '10. Datensicherheit', p: [
        'Die Übertragung ist per TLS verschlüsselt. Der Zugriff auf Daten ist über Zugriffsregeln in der Datenbank so eingeschränkt, dass Kunden nur ihre eigenen Daten sehen. Trotzdem gilt: Wähle ein starkes, nur hier genutztes Passwort und melde dich auf fremden Geräten ab.',
      ] },
      { h: '11. Änderungen', p: [
        'Wir passen diese Hinweise an, wenn sich die Plattform oder die Rechtslage ändert. Bei wesentlichen Änderungen fragen wir deine Einwilligung erneut ab.',
        'Stand: ' + LEGAL_DATE + ' · Version ' + LEGAL_VERSION,
      ] },
    ],
  },

  nutzung: {
    title: 'Nutzungsbedingungen der Kundenplattform',
    intro: 'Diese Bedingungen regeln die Nutzung der Plattform von Dream And Do It. Sie ergänzen deinen Coaching- oder Trainingsvertrag mit uns.',
    sections: [
      { h: '1. Geltungsbereich und Leistung', p: [
        'Die Plattform bietet dir, je nach Freischaltung, Bereiche für Training, Ernährung und Coaching sowie Nachrichten an deinen Coach. Welche Bereiche du nutzen kannst, schaltet dein Coach einzeln frei. Ein Anspruch auf einen bestimmten Funktionsumfang besteht nur im Rahmen deines Vertrags.',
      ] },
      { h: '2. Kein ärztlicher Rat, keine Therapie', p: [
        'Die Plattform und alle Inhalte dienen Training, Prävention und Coaching. Sie ersetzen keine ärztliche Untersuchung, Diagnose oder Behandlung und keine Psychotherapie. Mental Coaching ist keine Therapie. Messwerte wie Blutdruck oder Ruhepuls sind Orientierungswerte, keine Diagnose. Bei Beschwerden, Vorerkrankungen oder Unsicherheit sprich vor dem Training mit deiner Ärztin oder deinem Arzt.',
      ] },
      { h: '3. Eigenverantwortung beim Training', p: [
        'Du trainierst eigenverantwortlich. Brich eine Übung bei Schmerzen, Schwindel oder Unwohlsein ab und hol dir bei Bedarf Hilfe. Gib deine Angaben und Messwerte wahrheitsgemäß ein, damit Pläne und Hinweise zu dir passen.',
      ] },
      { h: '4. Konto und Geräte', p: [
        'Du erstellst dein Konto mit deiner E-Mail-Adresse und einem Passwort und hältst deine Zugangsdaten geheim. Dein Konto ist für dich persönlich bestimmt. Du kannst die Plattform auf bis zu zwei Geräten nutzen; weitere Geräte schaltet dein Coach auf Anfrage frei.',
        'Bei Verstößen gegen diese Bedingungen oder bei offenen Zahlungen aus deinem Vertrag können wir deinen Zugang vorübergehend sperren.',
      ] },
      { h: '5. Inhalte und Urheberrecht', p: [
        'Übungen, Pläne, Rezepte, Coaching-Inhalte, Texte und Grafiken sind urheberrechtlich geschützt. Du darfst sie für dich persönlich nutzen. Weitergabe, Veröffentlichung, Vervielfältigung oder gewerbliche Nutzung sind nicht erlaubt. Bilder können KI-generiert sein; das ist an den Bildern kenntlich gemacht.',
      ] },
      { h: '6. Verfügbarkeit', p: [
        'Wir bemühen uns um eine möglichst unterbrechungsfreie Plattform, können aber keine ständige Verfügbarkeit garantieren (z. B. bei Wartung oder Störungen bei Dienstleistern).',
      ] },
      { h: '7. Haftung', p: [
        'Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten und beschränkt auf den vorhersehbaren, typischen Schaden. Im Übrigen ist die Haftung ausgeschlossen.',
      ] },
      { h: '8. Beendigung und Löschung', p: [
        'Du kannst deine Nutzung jederzeit beenden und die Löschung deines Kontos verlangen (siehe Datenschutzhinweise). Mit Ende deines Vertrags kann der Zugang enden.',
      ] },
      { h: '9. Änderungen', p: [
        'Wir können diese Bedingungen und die Plattform weiterentwickeln. Über wesentliche Änderungen informieren wir dich.',
        'Stand: ' + LEGAL_DATE + ' · Version ' + LEGAL_VERSION,
      ] },
      { h: '10. Schlussbestimmungen', p: [
        'Es gilt deutsches Recht; zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates bleiben unberührt. Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
      ] },
    ],
  },
};
