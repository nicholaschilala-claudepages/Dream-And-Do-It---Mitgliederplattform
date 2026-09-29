// ============================================================================
// Dream And Do It – Kundenplattform
// Monatlicher Fortschrittsbericht (Runde 15): On-Demand-PDF-Export, im
// Browser erzeugt (jsPDF, per CDN in training.html eingebunden — dieselbe
// Bibliothek wie beim bestehenden Wochenreport in betrieb.html), damit KEINE
// neue Server-Infrastruktur nötig ist. Der Kunde/Trainer wählt einen Monat
// und lädt den Bericht bei Bedarf herunter; es gibt keinen automatischen
// E-Mail-Versand (siehe Rückfrage-Antwort "On-Demand-Download").
//
// Gestalterisch bewusst hochwertiger als der bestehende, rein textbasierte
// Wochenreport: eigenes Deckblatt im Corporate Design (Navy/Gold, echtes
// Logo), Kennzahlen-Kacheln, selbst gezeichnete Balken-/Fortschrittsdiagramme
// (ohne zusätzliche Chart-Bibliothek — jsPDF-Vektorprimitiven genügen) sowie
// Tabellen im Stil eines echten Fortschrittsberichts. Die Cinzel-Schrift der
// PDF-Dokumente (reportlab-Pipeline) lässt sich im Browser nicht ohne
// Font-Embedding nutzen; als Näherung ans CI kommen die jsPDF-Kernschriften
// "times" (Serife, wie der Fließtext-Font Source Serif) und "helvetica"
// (fett, für Kicker/Zahlen) in den exakten CI-Farben zum Einsatz.
//
// Alle Werte stammen ausschließlich aus bereits vorhandenen, ohnehin
// geloggten Daten (Training, Ernährung, Präventionscheck) — für den Bericht
// selbst ist keine zusätzliche Erfassung nötig.
// ============================================================================

const NAVY = [5, 52, 70];
const GOLD = [200, 124, 0];
const GOLD_LIGHT = [250, 194, 51];
const CREAM = [244, 239, 230];
const TEXT_MUTED = [74, 100, 114];
const TEXT_DARK = [15, 37, 48];
const DANGER = [179, 38, 30];
const SUCCESS = [47, 111, 79];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// ---------------------------------------------------------------------------
// Hilfsfunktionen: Bild laden (für Logo-Einbettung), Zahlen-/Datumsformat
// ---------------------------------------------------------------------------

function loadImageAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Logo konnte nicht geladen werden: ${url}`));
    img.src = url;
  });
}

function fmt1(n) { return (Math.round((n || 0) * 10) / 10).toLocaleString('de-DE'); }
function fmt0(n) { return Math.round(n || 0).toLocaleString('de-DE'); }
function fmtDateDe(d) { return new Date(d).toLocaleDateString('de-DE'); }

// ISO-Kalenderwoche eines Datums, nur für die Gruppierung innerhalb des
// Berichtsmonats (Anzeige als "KW xx").
function isoWeekNumber(dateInput) {
  const d = new Date(Date.UTC(new Date(dateInput).getFullYear(), new Date(dateInput).getMonth(), new Date(dateInput).getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDay + 3);
  return 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
}

// ---------------------------------------------------------------------------
// Layout-Bausteine (auf einer jsPDF-Instanz operierend)
// ---------------------------------------------------------------------------

function drawHeaderBar(doc, subtitle) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setCharSpace(0.6);
  doc.text('DREAM AND DO IT', MARGIN, 10.5);
  doc.setCharSpace(0);
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(subtitle, PAGE_W - MARGIN, 10.5, { align: 'right' });
}

function drawFooter(doc, pageLabel) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Automatisch aus der Dream And Do It Kundenplattform erstellt – auf Basis deiner geloggten Daten.', MARGIN, PAGE_H - 9.5);
  doc.text(pageLabel, PAGE_W - MARGIN, PAGE_H - 9.5, { align: 'right' });
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(...GOLD);
  doc.text(text, MARGIN, y);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 2.4, PAGE_W - MARGIN, y + 2.4);
  return y + 10;
}

// Kennzahlen-Kachel im Stil der .result-box/.streak-tile-Bausteine der
// Web-App: cremefarbene Fläche, Goldrahmen, große Navy-Zahl, Gold-Label.
function drawKpiTile(doc, x, y, w, h, value, label) {
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 2.2, 2.2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(...NAVY);
  doc.text(String(value), x + w / 2, y + h / 2 - 0.5, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...GOLD);
  const labelLines = doc.splitTextToSize(label, w - 6);
  doc.text(labelLines, x + w / 2, y + h / 2 + 6.5, { align: 'center' });
}

function drawKpiRow(doc, y, tiles) {
  const gap = 5;
  const w = (CONTENT_W - gap * (tiles.length - 1)) / tiles.length;
  const h = 26;
  tiles.forEach((t, i) => drawKpiTile(doc, MARGIN + i * (w + gap), y, w, h, t.value, t.label));
  return y + h;
}

// Einfaches, selbst gezeichnetes Balkendiagramm (vertikal) — keine externe
// Chart-Bibliothek nötig. `data`: [{label, value}]. Optional `targetValue`
// zeichnet eine gestrichelte Ziel-Linie (z.B. Kalorienziel).
function drawBarChart(doc, { x, y, width, height, data, color = GOLD, targetValue = null, valueLabel = (v) => fmt0(v) }) {
  const maxVal = Math.max(1, ...data.map((d) => d.value), targetValue || 0) * 1.15;
  const barGap = 4;
  const barW = (width - barGap * (data.length - 1)) / data.length;
  const baseY = y + height;

  // Achsenlinie
  doc.setDrawColor(...TEXT_MUTED);
  doc.setLineWidth(0.25);
  doc.line(x, baseY, x + width, baseY);

  if (targetValue) {
    const targetY = baseY - (targetValue / maxVal) * height;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([1.2, 1], 0);
    doc.line(x, targetY, x + width, targetY);
    doc.setLineDashPattern([], 0);
  }

  data.forEach((d, i) => {
    const barH = maxVal > 0 ? (d.value / maxVal) * height : 0;
    const bx = x + i * (barW + barGap);
    const by = baseY - barH;
    doc.setFillColor(...color);
    doc.roundedRect(bx, by, barW, Math.max(barH, 0.4), 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...NAVY);
    doc.text(valueLabel(d.value), bx + barW / 2, by - 1.6, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(d.label, bx + barW / 2, baseY + 5, { align: 'center' });
  });
}

// Horizontales Balkendiagramm für den Präventions-Score-Breakdown
// (Kategorie links, Balken in der Mitte, Wert rechts).
function drawHorizontalBarChart(doc, { x, y, width, data, maxValue = 100, barHeight = 5.5, gap = 3.5 }) {
  const labelW = 46;
  const valueW = 12;
  const barAreaW = width - labelW - valueW;
  let cy = y;
  data.forEach((d) => {
    doc.setFont('times', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...TEXT_DARK);
    const lines = doc.splitTextToSize(d.label, labelW - 2);
    doc.text(lines[0], x, cy + barHeight / 2 + 1.3);

    doc.setFillColor(...CREAM);
    doc.roundedRect(x + labelW, cy, barAreaW, barHeight, 1.2, 1.2, 'F');
    const w = Math.max(2, (Math.min(d.value, maxValue) / maxValue) * barAreaW);
    const color = d.value >= 80 ? SUCCESS : d.value >= 60 ? GOLD : DANGER;
    doc.setFillColor(...color);
    doc.roundedRect(x + labelW, cy, w, barHeight, 1.2, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...NAVY);
    doc.text(String(Math.round(d.value)), x + labelW + barAreaW + valueW - 2, cy + barHeight / 2 + 1.3, { align: 'right' });

    cy += barHeight + gap;
  });
  return cy;
}

// ---------------------------------------------------------------------------
// Datenaufbereitung: aus den Rohdaten (Logs/Sessions) Kennzahlen ableiten
// ---------------------------------------------------------------------------

function summarizeTraining(trainingLogs, trainingSessions) {
  const distinctDays = new Set();
  let totalSets = 0;
  let totalVolumeKg = 0;
  const exerciseTotals = new Map();
  const weekVolumes = new Map();

  for (const log of trainingLogs || []) {
    if (!log.performed_at) continue;
    distinctDays.add(log.performed_at.slice(0, 10));
    totalSets += 1;
    const weight = Number(log.weight_kg) || 0;
    const reps = Number(log.reps) || 0;
    const volume = weight > 0 && reps > 0 ? weight * reps : 0;
    totalVolumeKg += volume;

    const exName = log.exercises ? log.exercises.name : 'Unbekannte Übung';
    if (!exerciseTotals.has(exName)) exerciseTotals.set(exName, { name: exName, sets: 0, volume: 0 });
    const et = exerciseTotals.get(exName);
    et.sets += 1;
    et.volume += volume;

    const wk = `KW ${isoWeekNumber(log.performed_at)}`;
    weekVolumes.set(wk, (weekVolumes.get(wk) || 0) + volume);
  }

  const caloriesBurned = (trainingSessions || []).reduce((sum, s) => sum + (Number(s.calories_burned) || 0), 0);

  const topExercises = Array.from(exerciseTotals.values())
    .sort((a, b) => b.volume - a.volume || b.sets - a.sets)
    .slice(0, 10);

  const weeklyVolume = Array.from(weekVolumes.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));

  return {
    sessionCount: (trainingSessions || []).length,
    distinctDaysCount: distinctDays.size,
    totalSets,
    totalVolumeKg,
    caloriesBurned,
    topExercises,
    weeklyVolume,
  };
}

function summarizeNutrition(nutritionLogs, energyTargetKcal) {
  const dayTotals = new Map();
  for (const log of nutritionLogs || []) {
    if (!log.logged_at) continue;
    const day = log.logged_at.slice(0, 10);
    if (!dayTotals.has(day)) dayTotals.set(day, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    const t = dayTotals.get(day);
    t.kcal += Number(log.kcal) || 0;
    t.protein += Number(log.protein_g) || 0;
    t.carbs += Number(log.carbs_g) || 0;
    t.fat += Number(log.fat_g) || 0;
  }
  const days = Array.from(dayTotals.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const loggedDaysCount = days.length;
  const avg = (key) => (loggedDaysCount > 0 ? days.reduce((s, [, v]) => s + v[key], 0) / loggedDaysCount : 0);

  const weekTotals = new Map();
  for (const [day, v] of days) {
    const wk = `KW ${isoWeekNumber(day)}`;
    if (!weekTotals.has(wk)) weekTotals.set(wk, { kcal: 0, protein: 0, carbs: 0, fat: 0, days: 0 });
    const w = weekTotals.get(wk);
    w.kcal += v.kcal; w.protein += v.protein; w.carbs += v.carbs; w.fat += v.fat; w.days += 1;
  }
  const weeklyAverages = Array.from(weekTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, w]) => ({
      label,
      kcal: w.kcal / w.days,
      protein: w.protein / w.days,
      carbs: w.carbs / w.days,
      fat: w.fat / w.days,
    }));

  return {
    loggedDaysCount,
    avgKcal: avg('kcal'),
    avgProtein: avg('protein'),
    avgCarbs: avg('carbs'),
    avgFat: avg('fat'),
    weeklyAverages,
    energyTargetKcal: energyTargetKcal || null,
  };
}

// ---------------------------------------------------------------------------
// Hauptfunktion: baut den kompletten Bericht und löst den Download aus.
// ---------------------------------------------------------------------------

export async function buildMonthlyReportPdf({
  profile,
  monthDate, // beliebiges Datum innerhalb des Berichtsmonats
  trainingLogs,
  trainingSessions,
  nutritionLogs,
  energyTargetKcal,
  preventionScore, // { total, breakdown } aus computePreventionScore(), oder null
  streak, // aus computeTrainingStreak()
  monthPrEvents, // prEvents (aus computePersonalRecords) gefiltert auf den Berichtsmonat
  moduleAccess = { training: true, nutrition: true },
}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const monthLabel = `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  const clientName = profile.full_name || profile.email || 'Kunde';

  let logo = null;
  try {
    logo = await loadImageAsDataUrl('icons/logo-full-darkbg.png');
  } catch (err) {
    logo = null; // Bericht funktioniert auch ohne Logo, falls das Asset offline nicht verfügbar ist
  }

  // --- Deckblatt --------------------------------------------------------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  if (logo) {
    const logoW = 46;
    const logoH = logoW * (logo.height / logo.width);
    doc.addImage(logo.dataUrl, 'PNG', MARGIN, 26, logoW, logoH);
  }

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 78, PAGE_W - MARGIN, 78);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setCharSpace(1.4);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('PERSÖNLICHER FORTSCHRITTSBERICHT', MARGIN, 92);
  doc.setCharSpace(0);

  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text('Monatsbericht', MARGIN, 108);

  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(monthLabel, MARGIN, 118);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 128, MARGIN + 60, 128);

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(240, 240, 236);
  doc.text(clientName, MARGIN, 138);

  doc.setFontSize(9);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(`Erstellt am ${fmtDateDe(new Date())}`, MARGIN, 145);

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 210, 214);
  const introLines = doc.splitTextToSize(
    'Dieser Bericht fasst deine Entwicklung im Training, in der Ernährung und in deinem Präventions-Score zusammen – automatisch aus deinen bereits geloggten Daten erstellt. Ideal zum Ausdrucken oder Archivieren.',
    PAGE_W - MARGIN * 2 - 4
  );
  doc.text(introLines, MARGIN, PAGE_H - 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('DREAM AND DO IT · dreamanddoit.de', MARGIN, PAGE_H - 16);

  // --- Seite 2: Überblick -------------------------------------------------
  doc.addPage();
  drawHeaderBar(doc, monthLabel);
  let y = sectionTitle(doc, 'Überblick', 30);

  const trainingSummary = summarizeTraining(trainingLogs, trainingSessions);
  const nutritionSummary = summarizeNutrition(nutritionLogs, energyTargetKcal);

  const kpiTiles = [];
  if (moduleAccess.training) {
    kpiTiles.push({ value: trainingSummary.sessionCount, label: 'Trainings-\neinheiten' });
    kpiTiles.push({ value: `${fmt0(trainingSummary.totalVolumeKg)} kg`, label: 'Trainings-\nvolumen' });
  }
  if (moduleAccess.nutrition) {
    kpiTiles.push({ value: nutritionSummary.loggedDaysCount > 0 ? fmt0(nutritionSummary.avgKcal) : '–', label: 'Ø kcal\npro Tag' });
  }
  const hasPreventionScore = preventionScore && preventionScore.total != null;
  kpiTiles.push({ value: hasPreventionScore ? Math.round(preventionScore.total) : '–', label: 'Präventions-\nScore' });

  y = drawKpiRow(doc, y, kpiTiles.map((t) => ({ ...t, label: t.label.replace('\n', ' ') })));
  y += 12;

  if (moduleAccess.training) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text('Deine Trainings-Serie', MARGIN, y);
    y += 6;
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DARK);
    const streakText = streak
      ? `${streak.currentStreak} Woche${streak.currentStreak === 1 ? '' : 'n'} am Stück trainiert (beste Serie bisher: ${streak.longestStreak} Woche${streak.longestStreak === 1 ? '' : 'n'}). Regel: mind. 1 Trainingseinheit pro Kalenderwoche.`
      : 'Noch keine Trainings-Serie ermittelbar.';
    doc.text(doc.splitTextToSize(streakText, CONTENT_W), MARGIN, y);
    y += 14;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(`Neue persönliche Rekorde in diesem Monat${monthPrEvents && monthPrEvents.length ? ` (${monthPrEvents.length})` : ''}`, MARGIN, y);
  y += 6;
  if (monthPrEvents && monthPrEvents.length > 0) {
    // Hinweis: jsPDF-Kernschriften (Helvetica/Times, WinAnsi-Kodierung)
    // können Emoji nicht darstellen (führt zu Encoding-Artefakten und
    // fehlerhaftem Zeichenabstand) — daher ein per Vektor gezeichneter
    // Gold-Punkt als Aufzählungszeichen statt eines Emoji-Icons.
    monthPrEvents.slice(0, 10).forEach((e) => {
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 1, y - 1.4, 1, 'F');
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_DARK);
      const desc = e.type === 'weight'
        ? `Neues Bestgewicht: ${e.weightKg} kg bei ${e.reps} Wdh. – ${e.exerciseName}`
        : e.type === 'e1rm'
          ? `Neue geschätzte Maximalkraft (1RM): ${e.value.toFixed(1)} kg – ${e.exerciseName}`
          : `Neue Bestleistung: ${e.reps} Wdh. – ${e.exerciseName}`;
      doc.text(`${desc} (${fmtDateDe(e.performedAt)})`, MARGIN + 4.5, y);
      y += 5.5;
    });
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Keine neuen Rekorde in diesem Monat – nächster Monat, nächste Chance!', MARGIN, y);
    y += 6;
  }

  drawFooter(doc, `Seite 2`);

  // --- Seite 3: Training ----------------------------------------------------
  if (moduleAccess.training) {
    doc.addPage();
    drawHeaderBar(doc, monthLabel);
    y = sectionTitle(doc, 'Training im Detail', 30);

    if (trainingSummary.weeklyVolume.length > 0) {
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Bewegtes Gewicht (kg) je Kalenderwoche', MARGIN, y);
      y += 4;
      drawBarChart(doc, { x: MARGIN, y, width: CONTENT_W, height: 46, data: trainingSummary.weeklyVolume, color: GOLD, valueLabel: (v) => `${fmt0(v)}` });
      y += 62;
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Keine Trainingslogs mit Gewichtsangabe in diesem Monat für die Volumen-Grafik.', MARGIN, y);
      y += 10;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text('Meistgenutzte Übungen', MARGIN, y);
    y += 7;

    if (trainingSummary.topExercises.length > 0) {
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN, y - 4.5, CONTENT_W, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(255, 255, 255);
      doc.text('Übung', MARGIN + 2, y);
      doc.text('Sätze', MARGIN + CONTENT_W - 44, y);
      doc.text('Volumen (kg)', MARGIN + CONTENT_W - 2, y, { align: 'right' });
      y += 6;
      trainingSummary.topExercises.forEach((ex, i) => {
        if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6, 'F'); }
        doc.setFont('times', 'normal');
        doc.setFontSize(8.6);
        doc.setTextColor(...TEXT_DARK);
        doc.text(doc.splitTextToSize(ex.name, CONTENT_W - 60)[0], MARGIN + 2, y);
        doc.text(String(ex.sets), MARGIN + CONTENT_W - 44, y);
        doc.text(fmt0(ex.volume), MARGIN + CONTENT_W - 2, y, { align: 'right' });
        y += 6;
      });
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Keine Trainingseinheiten in diesem Monat erfasst.', MARGIN, y);
    }

    drawFooter(doc, 'Seite 3');
  }

  // --- Seite 4: Ernährung ----------------------------------------------------
  if (moduleAccess.nutrition) {
    doc.addPage();
    drawHeaderBar(doc, monthLabel);
    y = sectionTitle(doc, 'Ernährung im Detail', 30);

    const nKpis = [
      { value: nutritionSummary.loggedDaysCount, label: 'geloggte Tage' },
      { value: fmt0(nutritionSummary.avgKcal), label: 'Ø kcal/Tag' },
      { value: `${fmt0(nutritionSummary.avgProtein)} g`, label: 'Ø Protein/Tag' },
      { value: `${fmt0(nutritionSummary.avgCarbs)} g / ${fmt0(nutritionSummary.avgFat)} g`, label: 'Ø KH / Fett' },
    ];
    y = drawKpiRow(doc, y, nKpis);
    y += 14;

    if (nutritionSummary.weeklyAverages.length > 0) {
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(
        nutritionSummary.energyTargetKcal
          ? `Ø kcal pro Tag je Kalenderwoche (gestrichelt: dein Kalorienziel von ${fmt0(nutritionSummary.energyTargetKcal)} kcal)`
          : 'Ø kcal pro Tag je Kalenderwoche',
        MARGIN, y
      );
      y += 4;
      drawBarChart(doc, {
        x: MARGIN, y, width: CONTENT_W, height: 46,
        data: nutritionSummary.weeklyAverages.map((w) => ({ label: w.label, value: w.kcal })),
        color: GOLD,
        targetValue: nutritionSummary.energyTargetKcal || null,
      });
      y += 62;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...NAVY);
      doc.text('Makronährstoffe je Woche (Tagesdurchschnitt)', MARGIN, y);
      y += 7;
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN, y - 4.5, CONTENT_W, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(255, 255, 255);
      doc.text('Woche', MARGIN + 2, y);
      doc.text('kcal', MARGIN + 70, y);
      doc.text('Protein (g)', MARGIN + 100, y);
      doc.text('KH (g)', MARGIN + 134, y);
      doc.text('Fett (g)', MARGIN + CONTENT_W - 2, y, { align: 'right' });
      y += 6;
      nutritionSummary.weeklyAverages.forEach((w, i) => {
        if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6, 'F'); }
        doc.setFont('times', 'normal');
        doc.setFontSize(8.6);
        doc.setTextColor(...TEXT_DARK);
        doc.text(w.label, MARGIN + 2, y);
        doc.text(fmt0(w.kcal), MARGIN + 70, y);
        doc.text(fmt0(w.protein), MARGIN + 100, y);
        doc.text(fmt0(w.carbs), MARGIN + 134, y);
        doc.text(fmt0(w.fat), MARGIN + CONTENT_W - 2, y, { align: 'right' });
        y += 6;
      });
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Kein Ernährungsprotokoll in diesem Monat erfasst.', MARGIN, y);
    }

    drawFooter(doc, 'Seite 4');
  }

  // --- Seite 5: Präventions-Score ---------------------------------------------
  doc.addPage();
  drawHeaderBar(doc, monthLabel);
  y = sectionTitle(doc, 'Dein Präventions-Score', 30);

  if (preventionScore && preventionScore.total != null) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(...NAVY);
    doc.text(String(Math.round(preventionScore.total)), MARGIN, y + 14);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('von 100 Punkten – aktueller Stand', MARGIN + 30, y + 14);
    y += 26;

    if (preventionScore.breakdown && preventionScore.breakdown.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...NAVY);
      doc.text('Zusammensetzung nach Kategorie', MARGIN, y);
      y += 8;
      y = drawHorizontalBarChart(doc, {
        x: MARGIN, y, width: CONTENT_W,
        data: preventionScore.breakdown.map((b) => ({ label: b.label, value: b.score })),
      });
      y += 6;
    }

    doc.setFont('times', 'italic');
    doc.setFontSize(8.6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      doc.splitTextToSize('Der Präventions-Score fasst Kraftausdauer, Beweglichkeit, Körperzusammensetzung, Trainings-Balance sowie Lebensstil-Faktoren zu einer Gesamteinschätzung zusammen. Details siehe Tab "Präventionscheck" in der Plattform.', CONTENT_W),
      MARGIN, y
    );
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Noch kein Präventions-Score verfügbar – dafür im Bereich "Präventionscheck" Geburtsdatum, Körpermaße und/oder Tests erfassen.', MARGIN, y);
  }

  drawFooter(doc, `Seite ${moduleAccess.training && moduleAccess.nutrition ? 5 : moduleAccess.training || moduleAccess.nutrition ? 4 : 3}`);

  const fileClientLabel = clientName.replace(/[^a-z0-9]+/gi, '_');
  const fileMonthLabel = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  doc.save(`Monatsbericht_${fileClientLabel}_${fileMonthLabel}.pdf`);
}
