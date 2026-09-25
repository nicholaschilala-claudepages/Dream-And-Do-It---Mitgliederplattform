// ============================================================================
// Dream And Do It – Kundenplattform
// Etappe 17: Zentrale Texte für die Start-/Landingpages der drei Reiter
// (Training/Ernährung/Coaching) sowie die persönliche Kunden-Begrüßung und
// die Trainer-Startseite. An einer Stelle gepflegt, damit dashboard.html,
// training.html, nutrition.html und coaching.html konsistente Texte zeigen
// (Start-Tab UND die Teaser-Seite bei gesperrtem Reiter greifen auf dieselben
// Bausteine zurück).
//
// WICHTIG: Der Begrüßungstext (welcomeParagraphs) ist ein Entwurf in Nicholas'
// Namen. Grundlage: reale Aussagen von www.dreamanddoit.de (Seiten "Über uns"
// und "Privatkunden", Stand 26.09.2026) sowie die von Nicholas zur Verfügung
// gestellten Dokumente (Lebenslauf Stand 2026, Abschlussdokumentation M.A.
// Deutsche Hochschule für Prävention und Gesundheitsmanagement, Referenzen,
// Arbeitszeugnisse Krauthammer/Lepaya, Stand 25.09.2026) — bitte vor dem
// Livegang gegenlesen und bei Bedarf anpassen.
// ============================================================================

export const SECTION_INFO = {
  training: {
    title: 'Training',
    fieldName: 'training_enabled',
    heroLine: 'Technik vor Intensität — dein Plan, deine Entwicklung, sauber dokumentiert.',
    clientIntro:
      'Hier findest du deinen persönlichen Trainingsplan, trägst nach jeder Einheit Sätze, Wiederholungen, ' +
      'Gewicht oder Distanz ein — so, wie es tatsächlich war — und siehst, wie sich deine bewegten Kilos und ' +
      'die Balance zwischen deinen Muskelgruppen über die Zeit entwickeln.',
    benefits: [
      { h: 'Individueller Trainingsplan', t: 'von mir persönlich zusammengestellt, als Vorlage übernommen und laufend an deinen Fortschritt angepasst.' },
      { h: 'Übungsbibliothek', t: 'über 80 Übungen inkl. Bildern, Beschreibung und beanspruchter Muskulatur — jederzeit nachschlagbar.' },
      { h: 'Trainingstagebuch', t: 'Sätze, Wiederholungen, Gewicht und Distanz frei eintragen, inkl. Start/Ende der Einheit für exakte Auswertung.' },
      { h: 'Automatische Auswertung', t: 'bewegte Kilos je Übung/Workout, Fortschritt über die Zeit und Erkennung muskulärer Dysbalancen.' },
    ],
    scienceText:
      'Der Trainingsaufbau folgt dem Prinzip „Technik vor Intensität": sauber ausgeführte Bewegungen mit ' +
      'angemessener, planvoll gesteigerter Belastung senken das Verletzungsrisiko und sichern langfristig ' +
      'bessere Ergebnisse als reines Gewichtsteigern ohne Kontrolle. Die Dysbalance-Auswertung dieser Plattform ' +
      'orientiert sich am Push-Pull-Prinzip der Trainingslehre: werden gegenüberliegende Muskelgruppen (z.B. ' +
      'Brust vs. Rücken, vordere vs. hintere Beinkette) über längere Zeit unausgewogen belastet, steigt das ' +
      'Risiko für Haltungsprobleme und Überlastungsschäden — ein Grund, warum wir genau darauf automatisch achten.',
    adminIntro:
      'Hier verwaltest du die Übungsbibliothek, baust Trainingsplan-Vorlagen, weist sie einzelnen Kunden zu ' +
      'oder erstellst individuelle Einzelpläne. Unter „Kundenanalyse" siehst du Trainingsentwicklung, bewegte ' +
      'Kilos und mögliche Dysbalancen jedes Kunden auf einen Blick.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },

  nutrition: {
    title: 'Ernährung',
    fieldName: 'nutrition_enabled',
    heroLine: 'Klare Daten statt Vermutungen — für deine Ernährung genauso wie für dein Training.',
    clientIntro:
      'Hier berechnest du deinen individuellen Kalorienbedarf, verfolgst deinen Körperfettanteil nach der ' +
      'Navy-Methode, protokollierst deine Mahlzeiten mit Soll-Ist-Vergleich und findest über 30 abwechslungsreiche ' +
      'Rezepte nach dem Dream-And-Do-It-Teller-Prinzip.',
    benefits: [
      { h: 'PAL-Rechner', t: 'dein individueller Kalorien- und Energiebedarf auf Basis deines Aktivitätslevels.' },
      { h: 'Körperfett-Verlauf', t: 'nach der wissenschaftlich validierten Navy-Methode, inklusive Trend über die Zeit.' },
      { h: 'Ernährungsprotokoll', t: 'Mahlzeiten mit Menge, Uhrzeit und Kalorien erfassen, inkl. Soll-Ist-Vergleich zum Trainingsverbrauch und persönlichem Kommentar von mir.' },
      { h: 'Über 30 Rezepte', t: 'mit vollständigen Makros (Eiweiß/Kohlenhydrate/Fett), nach dem Dream-And-Do-It-Teller-Prinzip.' },
    ],
    scienceText:
      'Der Dream-And-Do-It-Teller orientiert sich an der Aufteilung 50&nbsp;% Gemüse &amp; Obst, 25&nbsp;% Protein, ' +
      '25&nbsp;% vollwertige Kohlenhydrate — ein Prinzip, das in ähnlicher Form u.a. im „Healthy Eating Plate"-Modell ' +
      'der Harvard T.H. Chan School of Public Health sowie in den Empfehlungen der Deutschen Gesellschaft für ' +
      'Ernährung (DGE) beschrieben wird. Es dient als einfacher, alltagstauglicher Richtwert für ausgewogene ' +
      'Mahlzeiten — kein starres Regelwerk. Iss so viele Portionen, dass du satt bist.',
    adminIntro:
      'Hier pflegst du die Rezept- und Lebensmitteldatenbank und siehst die Ernährungsprotokolle deiner Kunden ' +
      'inklusive der Möglichkeit, direkt einen Kommentar zu hinterlassen.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },

  coaching: {
    title: 'Coaching',
    fieldName: 'coaching_enabled',
    heroLine: 'Mentale Stärke ist trainierbar — genau wie Kraft und Ausdauer.',
    clientIntro:
      'Hier findest du Inhalte zu mentaler Stärke und persönlicher Entwicklung, kannst wissenschaftlich ' +
      'validierte Fragebögen zur Standortbestimmung ausfüllen und deine Ziele strukturiert nach dem GROW-Modell ' +
      'verfolgen — gemeinsam mit mir als Coach.',
    benefits: [
      { h: 'Coaching-Content-Bibliothek', t: 'aktuell 11 Dokumente zu Themen wie Selbstwirksamkeit, Gewohnheitsbildung, Resilienz, Achtsamkeit, Zielsetzung und Schlaf & Regeneration.' },
      { h: 'Validierte Fragebögen', t: 'u.a. Selbstwirksamkeit (GSE-10), Wohlbefinden (WHO-5) und wahrgenommener Stress (PSS-4) zur ehrlichen Standortbestimmung.' },
      { h: 'Ziel-Modul nach GROW', t: 'Goal – Reality – Options – Will: aus einem Wunsch wird gemeinsam mit mir ein konkreter, umsetzbarer Plan mit Zwischenschritten.' },
    ],
    scienceText:
      'Mein eigener Zugang zum Coaching basiert auf einem Master of Arts in Prävention &amp; Gesundheitsmanagement ' +
      'mit Studienschwerpunkt Coaching. In meiner Masterthesis habe ich mich mit Selbstwirksamkeit im ' +
      'Führungskräfte-Coaching auseinandergesetzt — unter anderem auf Basis von Albert Banduras ' +
      'Selbstwirksamkeitstheorie und dem GROW-Modell. Beide Konzepte bilden bis heute die wissenschaftliche ' +
      'Grundlage der Coaching-Inhalte auf dieser Plattform: Bandura zeigt, dass der Glaube an die eigene ' +
      'Handlungsfähigkeit direkten Einfluss auf tatsächliches Verhalten und Durchhaltevermögen hat; das ' +
      'GROW-Modell liefert die Struktur, mit der aus einem Wunsch ein konkreter, umsetzbarer Plan wird.',
    adminIntro:
      'Hier pflegst du die Coaching-Content-Bibliothek und siehst sowohl die verfügbaren Fragebogen-Vorlagen als ' +
      'auch die ausgefüllten Fragebögen und GROW-Ziele deiner Kunden.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },
};

/**
 * Persönlicher Begrüßungstext für die Kunden-Startseite (dashboard.html).
 * ENTWURF — gestützt auf www.dreamanddoit.de sowie die von Nicholas
 * bereitgestellten Dokumente (siehe Hinweis oben), bitte von Nicholas vor
 * dem Livegang gegenlesen/freigeben.
 */
export function welcomeParagraphs(firstName) {
  const name = firstName ? escapeHtmlLocal(firstName) : '';
  return [
    `Hallo${name ? ' ' + name : ''}, schön, dass du da bist!`,
    'Mein Name ist Nicholas Chilala, Gründer und Head Coach von Dream And Do It. Ich freue mich sehr, dass ' +
      'du dich für mich und diesen Weg entschieden hast.',
    'Meine eigene Geschichte hat mich hierher geführt: Als Leistungssportler im Karate stoppte mich kurz vor ' +
      'meinem großen Ziel, den Deutschen Meisterschaften, eine Herzmuskelentzündung — nicht aus mangelnder ' +
      'Leistung, sondern aus Überbelastung und zu wenig Erholung. Diese Erfahrung hat meinen Blick auf ' +
      'Gesundheit und Leistungsfähigkeit grundlegend verändert und mich in die Prävention geführt: über ein ' +
      'Freiwilliges Soziales Jahr im Sport, eine Ausbildung zum Fitness- und Gesundheitscoach (IHK) und ' +
      'schließlich ein Studium mit Bachelor in Fitnessökonomie und Master of Arts in Prävention und ' +
      'Gesundheitsmanagement mit den Schwerpunkten Coaching und Sportpsychologie.',
    'In den Jahren danach habe ich dieses Wissen auf zwei Ebenen vertieft: ganz praktisch als Personal ' +
      'Trainer und Coach für Privatkunden — vom individuellen Abnehm-Konzept bis zur Trainingsbegleitung von ' +
      'Leistungssportlern — und parallel als zertifizierter Trainer und Coach für internationale Unternehmen, ' +
      'wo ich globale Leadership- und Sales-Programme mitentwickelt und Führungskräfte in Konzernen wie WIKA ' +
      'oder Vantage Towers begleitet habe. Genau dieses Muster — Höchstleistung, die auf Kosten der eigenen ' +
      'Gesundheit geht — begegnet mir dort bis heute, bei Spitzensportlern genau wie bei Führungskräften.',
    'Genau deshalb verbindet Dream And Do It Körper und Geist in einem ganzheitlichen, wissenschaftlich ' +
      'fundierten System aus Diagnostik, Training/Intervention und Begleitung. Meine Überzeugung: Jeder Traum ' +
      'braucht eine Taten-Komponente. Auf dieser Plattform begleite ich dich als Strategiepartner auf ' +
      'Augenhöhe — mit klaren Daten statt Vermutungen und einem Plan, der wirklich zu deinem Alltag passt.',
    'Schau dich gerne in Ruhe um: unten siehst du, was dich unter jedem Reiter erwartet — auch die Bereiche, ' +
      'die aktuell noch nicht für dich freigeschaltet sind. Sprich mich einfach über die Nachrichten-Funktion ' +
      'an, wenn dich etwas davon interessiert.',
  ];
}

function escapeHtmlLocal(str) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!div) return str;
  div.textContent = str;
  return div.innerHTML;
}
