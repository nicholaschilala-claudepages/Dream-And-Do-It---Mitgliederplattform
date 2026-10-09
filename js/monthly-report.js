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

import { MONTH_SHORT_DE } from './report-data.js';

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
// Runde 20: Blutdruck & Ruhepuls mit Normtabellen-Referenz (gemeinsam genutzt
// vom Monatsbericht und vom Rückblick). `vitals` stammt aus
// Prevention.summarizeVitals(); null/undefined → nichts wird gezeichnet.
// ---------------------------------------------------------------------------
const VITAL_ROW_H = 4.8;

function vitalsBlockHeight(vitals) {
  if (!vitals) return 0;
  let h = 10; // Titel
  if (vitals.bp) h += 14 + 4 + (vitals.bp.referenceRows || []).length * VITAL_ROW_H + 4 + (vitals.bp.ageReference ? 5 : 0);
  if (vitals.hr) h += 14 + (vitals.hr.referenceRows ? 4 + vitals.hr.referenceRows.length * VITAL_ROW_H + 4 : 6);
  h += 22; // Quellen
  return h;
}

function vitalDot(doc, key, x, y) {
  const color = key === 'top' || key === 'mid' ? SUCCESS : key === 'low' ? GOLD : key === 'below' ? DANGER : TEXT_MUTED;
  doc.setFillColor(...color);
  doc.circle(x, y, 1.5, 'F');
}

function drawVitalsTable(doc, y, rows, isActive) {
  rows.forEach((r, i) => {
    const active = isActive(r);
    if (active) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 3.4, CONTENT_W, VITAL_ROW_H, 'F'); }
    doc.setFont('times', active ? 'bold' : 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(...(active ? NAVY : TEXT_DARK));
    doc.text(`${active ? '> ' : ''}${r.label}`, MARGIN + 2, y);
    doc.text(r.range, MARGIN + CONTENT_W - 2, y, { align: 'right' });
    y += VITAL_ROW_H;
  });
  return y;
}

function drawVitalsBlock(doc, y, vitals) {
  if (!vitals) return y;
  const byLabel = (v) => (v === 'trainer' ? 'Trainer/Coach' : 'Selbsttest');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text('Blutdruck & Ruhepuls', MARGIN, y);
  y += 8;

  if (vitals.bp) {
    const b = vitals.bp;
    vitalDot(doc, b.key, MARGIN + 1.5, y - 1.2);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(doc.splitTextToSize(`Blutdruck: ${Math.round(b.systolic)}/${Math.round(b.diastolic)} mmHg – ${b.label}`, CONTENT_W - 6)[0], MARGIN + 6, y);
    y += 5;
    doc.setFont('times', 'italic');
    doc.setFontSize(8.4);
    doc.setTextColor(...TEXT_MUTED);
    const first = b.first ? ` · erste Messung: ${Math.round(b.first.systolic)}/${Math.round(b.first.diastolic)} mmHg (${fmtDateDe(parseLocalDay(b.first.date))})` : '';
    doc.text(doc.splitTextToSize(`Gemessen am ${fmtDateDe(parseLocalDay(b.date))} · ${byLabel(b.measuredBy)}${first}`, CONTENT_W - 6), MARGIN + 6, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...NAVY);
    doc.text('Normtabelle Blutdruck (Einteilung DGK/Deutsche Hochdruckliga)', MARGIN, y);
    y += 4.2;
    y = drawVitalsTable(doc, y, b.referenceRows || [], (r) => r.category === b.category);
    if (b.ageReference) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8.2);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`Bevölkerungsmittel für deine Altersgruppe (${b.ageReference.range}): ${b.ageReference.systolic}/${b.ageReference.diastolic} mmHg – Orientierung, kein Zielwert.`, MARGIN, y + 1.5);
      y += 5;
    }
    y += 4;
  }

  if (vitals.hr) {
    const h = vitals.hr;
    vitalDot(doc, h.key, MARGIN + 1.5, y - 1.2);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(doc.splitTextToSize(`Ruhepuls: ${Math.round(h.value)} bpm${h.label ? ` – ${h.label}` : ''}`, CONTENT_W - 6)[0], MARGIN + 6, y);
    y += 5;
    doc.setFont('times', 'italic');
    doc.setFontSize(8.4);
    doc.setTextColor(...TEXT_MUTED);
    const first = h.first ? ` · erste Messung: ${Math.round(h.first.value)} bpm (${fmtDateDe(parseLocalDay(h.first.date))})` : '';
    const hint = !h.label && h.hint ? ` · ${h.hint}` : '';
    doc.text(doc.splitTextToSize(`Gemessen am ${fmtDateDe(parseLocalDay(h.date))} · ${byLabel(h.measuredBy)}${first}${hint}`, CONTENT_W - 6), MARGIN + 6, y);
    y += 5;
    if (h.referenceRows) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(...NAVY);
      doc.text('Normtabelle Ruhepuls für dein Geschlecht (niedriger ist günstiger)', MARGIN, y);
      y += 4.2;
      y = drawVitalsTable(doc, y, h.referenceRows, (r) => r.label === h.label);
      y += 4;
    } else {
      y += 1;
    }
  }

  doc.setFont('times', 'italic');
  doc.setFontSize(7.6);
  doc.setTextColor(...TEXT_MUTED);
  const src = [];
  if (vitals.bp) src.push(`Quelle Blutdruck: ${vitals.bpSource}`);
  if (vitals.hr) src.push(`Quelle Ruhepuls: ${vitals.hrSource}`);
  src.push('Einzelmessungen ersetzen keine ärztliche Diagnose.');
  src.forEach((t) => {
    const lines = doc.splitTextToSize(t, CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 3.4 + 1;
  });
  return y;
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
  vitals = null, // aus Prevention.summarizeVitals(): Blutdruck/Ruhepuls samt Normtabellen-Referenz, oder null
  streak, // aus computeTrainingStreak()
  monthPrEvents, // prEvents (aus computePersonalRecords) gefiltert auf den Berichtsmonat
  moduleAccess = { training: true, nutrition: true },
  extra = null, // Runde 22 (Nachtrag 5): erweiterte Daten (Tests, Körpermaße, Training im Detail, Erfolge) aus js/report-data.js
}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const monthLabel = `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  const clientName = profile.full_name || profile.email || 'Kunde';

  let logo = null;
  try {
    logo = await loadImageAsDataUrl('icons/logo-full.png');
  } catch (err) {
    logo = null; // Bericht funktioniert auch ohne Logo, falls das Asset offline nicht verfügbar ist
  }

  // --- Deckblatt --------------------------------------------------------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  if (logo) {
    const logoW = 46;
    const logoH = logoW * (logo.height / logo.width);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN - 3, 26 - 3, logoW + 6, logoH + 6, 3, 3, 'F');
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
    'Dieser Bericht fasst deinen Monat zusammen: Training, Ernährung, Körpermaße, alle Tests mit Einstufung und Veränderung, deinen Präventions-Score und deine Erfolge – automatisch aus deinen bereits geloggten Daten erstellt. Ideal zum Ausdrucken oder Archivieren.',
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
  y += 8;

  if (extra) {
    const t2 = [];
    if (moduleAccess.training) {
      t2.push({ value: fmt0(trainingSummary.distinctDaysCount), label: 'Trainingstage' });
      t2.push({ value: `${fmt0(extra.trainingExtras.cardioMinutes)} Min.`, label: 'Ausdauer & Kurse' });
    }
    t2.push({ value: `${extra.testSummary.tested}`, label: 'Tests im Monat' });
    if (extra.body && extra.body.hasData) {
      const w = extra.body.rows.find((r) => r.key === 'weight_kg');
      t2.push({ value: w ? w.endText : '–', label: 'Körpergewicht' });
    }
    y = drawKpiRow(doc, y, t2);
    y += 12;
  } else {
    y += 4;
  }

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


  if (extra) {
    y = needSpace(doc, y + 4, 44, monthLabel);
    y = subHeading(doc, 'Der Monat auf einen Blick', y);
    const lines = [];
    const ts = extra.testSummary;
    lines.push(`Tests: ${ts.tested} im Monat durchgeführt, ${ts.improved} verbessert, ${ts.worse} verschlechtert, ${ts.alerts} aktuell auffällig.`);
    if (extra.scoreInfo && extra.scoreInfo.end) {
      lines.push(`Präventions-Score: ${Math.round(extra.scoreInfo.end.total)} Punkte${extra.scoreInfo.delta != null ? ` (${extra.scoreInfo.delta > 0 ? '+' : ''}${Math.round(extra.scoreInfo.delta)} seit dem Stand davor)` : ''}.`);
    }
    if (extra.body && extra.body.hasData) {
      extra.body.rows.filter((r) => r.deltaText && ['weight_kg', 'body_fat_percent', 'waist_cm'].includes(r.key)).forEach((r) => lines.push(`${r.label}: ${r.endText} (${r.deltaText} zum Stand davor).`));
    }
    if (extra.achievements.length) lines.push(`${extra.achievements.length} neue${extra.achievements.length === 1 ? 'r Erfolg' : ' Erfolge'} freigeschaltet.`);
    lines.forEach((t) => {
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 1, y - 1.2, 1, 'F');
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_DARK);
      const wrapped = doc.splitTextToSize(t, CONTENT_W - 6);
      doc.text(wrapped, MARGIN + 4.5, y);
      y += wrapped.length * 4.3 + 1.2;
    });
  }

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

    if (extra) drawTrainingExtrasPage(doc, extra.trainingExtras, monthLabel, { trainingSummary, periodWord: 'im Monat' });
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

  }

  if (extra) {
    drawBodySection(doc, extra.body, monthLabel, { startLabel: 'Stand davor' });
    drawTestsSection(doc, extra.testRows, extra.testSummary, monthLabel, { periodWord: 'im Monat', compareHint: 'Veränderung gegenüber dem letzten Test vor Monatsbeginn (bzw. dem ersten Test im Monat).' });
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
      doc.splitTextToSize('Der Präventions-Score fasst Kraftausdauer, Beweglichkeit, Körperzusammensetzung, Trainings-Balance, Lebensstil-Faktoren sowie – falls erfasst – Blutdruck und Ruhepuls zu einer Gesamteinschätzung zusammen. Details siehe „Meine Entwicklung" in der Plattform.', CONTENT_W),
      MARGIN, y
    );
    y += 16;
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Noch kein Präventions-Score verfügbar – dafür Geburtsdatum, Körpermaße und/oder Tests im Reiter "Tests" erfassen.', MARGIN, y);
  }

  if (vitals) {
    if (y + vitalsBlockHeight(vitals) > PAGE_H - 22) {
      doc.addPage();
      drawHeaderBar(doc, monthLabel);
      y = drawVitalsBlock(doc, 32, vitals);
    } else {
      y = drawVitalsBlock(doc, y + 2, vitals);
    }
  }

  if (extra) {
    drawAchievementsPage(doc, monthLabel, { achievements: extra.achievements, goals: extra.goals, periodWord: 'im Monat', scoreInfo: extra.scoreInfo });
  }
  drawFootersFromPage(doc, 2);

  const fileClientLabel = clientName.replace(/[^a-z0-9]+/gi, '_');
  const fileMonthLabel = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  doc.save(`Monatsbericht_${fileClientLabel}_${fileMonthLabel}.pdf`);
}

// ============================================================================
// Q5: Rückblick bei Monat 6 / 12 / 24 (PDF)
//
// Rein additive Ergänzung: nutzt dieselben Bausteine (Deckblatt, Kopf-/
// Fußzeile, Kennzahlen-Kacheln, Balkendiagramm, Tabellen) und dieselbe
// Bibliothek (jsPDF, per CDN in erfolge.html eingebunden) wie der Monatsbericht
// oben – damit Branding und Look identisch sind. Die Zahlen berechnet
// js/achievements.js (computeReview), hier wird nur gezeichnet.
// Hinweis: jsPDF-Kernschriften (WinAnsi) können weder Emoji noch Pfeile
// darstellen – daher bewusst nur Text und per Vektor gezeichnete Punkte.
// ============================================================================

function fmtTonnes(kg) {
  const v = Number(kg) || 0;
  return v >= 1000 ? `${fmt1(v / 1000)} t` : `${fmt0(v)} kg`;
}

function ensureSpace(doc, y, needed, subtitle, pageCounter) {
  if (y + needed <= PAGE_H - 22) return y;
  drawFooter(doc, `Seite ${pageCounter.n}`);
  doc.addPage();
  pageCounter.n += 1;
  drawHeaderBar(doc, subtitle);
  return 30;
}

/**
 * @param {object} p
 * @param {{full_name?:string,email?:string}} p.profile
 * @param {number} p.months - 6, 12 oder 24
 * @param {Date} p.periodStart - Anmeldedatum
 * @param {Date} p.periodEnd - Meilenstein-Tag
 * @param {{sessionCount:number,totalVolumeKg:number,prCount:number,longestStreak:number,nutritionDays:number,goalsAchieved:number}} p.stats
 * @param {Array<{date:string,total:number}>} p.scoreHistory
 * @param {Array<{label:string,score:number}>} [p.scoreBreakdown]
 * @param {number} p.earnedCount - bis dahin erreichte Erfolge
 * @param {number} p.totalCount - Gesamtzahl der Erfolge im Katalog
 * @param {Array<{title:string,tierName?:string}>} p.newAchievements - neu seit dem vorigen Rückblick
 * @param {Array<{name:string,e1rm:number,weightKg:number|null,reps:number|null}>} [p.topRecords]
 * @param {{training?:boolean,nutrition?:boolean}} [p.moduleAccess]
 * @param {object|null} [p.vitals] - Prevention.summarizeVitals(): Blutdruck/Ruhepuls mit Normtabellen-Referenz
 */
export async function buildReviewPdf({
  profile, months, periodStart, periodEnd, stats, scoreHistory = [], scoreBreakdown = [],
  earnedCount = 0, totalCount = 0, newAchievements = [], topRecords = [], moduleAccess = { training: true, nutrition: true },
  vitals = null,
}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const clientName = (profile && (profile.full_name || profile.email)) || 'Kunde';
  const subtitle = `Rückblick ${months} Monate`;
  const periodLabel = `${fmtDateDe(periodStart)} bis ${fmtDateDe(periodEnd)}`;
  const pageCounter = { n: 2 };

  let logo = null;
  try { logo = await loadImageAsDataUrl('icons/logo-full.png'); } catch (err) { logo = null; }

  // --- Deckblatt (wie Monatsbericht) -------------------------------------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  if (logo) {
    const logoW = 46;
    const logoH2 = logoW * (logo.height / logo.width);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN - 3, 26 - 3, logoW + 6, logoH2 + 6, 3, 3, 'F');
    doc.addImage(logo.dataUrl, 'PNG', MARGIN, 26, logoW, logoH2);
  }
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 78, PAGE_W - MARGIN, 78);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setCharSpace(1.4);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('PERSÖNLICHER RÜCKBLICK', MARGIN, 92);
  doc.setCharSpace(0);
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(`${months} Monate`, MARGIN, 108);
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('Dream And Do It', MARGIN, 118);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 128, MARGIN + 60, 128);
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(240, 240, 236);
  doc.text(clientName, MARGIN, 138);
  doc.setFontSize(9);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(`Zeitraum: ${periodLabel}`, MARGIN, 145);
  doc.text(`Erstellt am ${fmtDateDe(new Date())}`, MARGIN, 151);
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 210, 214);
  doc.text(doc.splitTextToSize('Dieser Rückblick fasst deinen bisherigen Weg zusammen – Training, Ernährung, Präventions-Score und deine Erfolge. Automatisch aus deinen geloggten Daten erstellt. Ideal zum Ausdrucken oder Archivieren.', PAGE_W - MARGIN * 2 - 4), MARGIN, PAGE_H - 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('DREAM AND DO IT · dreamanddoit.de', MARGIN, PAGE_H - 16);

  // --- Seite 2: Überblick --------------------------------------------------
  doc.addPage();
  drawHeaderBar(doc, subtitle);
  let y = sectionTitle(doc, `Dein Weg in ${months} Monaten`, 30);

  const row1 = [];
  if (moduleAccess.training) {
    row1.push({ value: fmt0(stats.sessionCount), label: 'Trainingseinheiten' });
    row1.push({ value: fmtTonnes(stats.totalVolumeKg), label: 'Bewegte Kilos' });
    row1.push({ value: fmt0(stats.prCount), label: 'Bestleistungen' });
  }
  row1.push({ value: `${fmt0(stats.longestStreak)} Wo.`, label: 'Beste Serie' });
  y = drawKpiRow(doc, y, row1);
  y += 8;
  const row2 = [];
  if (moduleAccess.nutrition) row2.push({ value: fmt0(stats.nutritionDays), label: 'Ernährungstage' });
  const hasScore = scoreHistory.length > 0;
  row2.push({ value: hasScore ? String(Math.round(scoreHistory[scoreHistory.length - 1].total)) : '–', label: 'Präventions-Score' });
  row2.push({ value: `${fmt0(earnedCount)} / ${fmt0(totalCount)}`, label: 'Erfolge erreicht' });
  if (stats.goalsAchieved > 0) row2.push({ value: fmt0(stats.goalsAchieved), label: 'Ziele erreicht' });
  y = drawKpiRow(doc, y, row2);
  y += 14;

  // Präventions-Score im Verlauf
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text('Präventions-Score im Verlauf', MARGIN, y);
  y += 7;
  if (scoreHistory.length >= 2) {
    const first = scoreHistory[0];
    const last = scoreHistory[scoreHistory.length - 1];
    const diff = Math.round(last.total) - Math.round(first.total);
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DARK);
    const verb = diff > 0 ? `um ${diff} Punkte verbessert` : diff < 0 ? `um ${Math.abs(diff)} Punkte gesunken` : 'unverändert geblieben';
    doc.text(doc.splitTextToSize(`Von ${Math.round(first.total)} Punkten (${fmtDateDe(parseLocalDay(first.date))}) auf ${Math.round(last.total)} Punkte – ${verb}.`, CONTENT_W), MARGIN, y);
    y += 8;
    let pts = scoreHistory;
    if (pts.length > 8) {
      const picked = [pts[0]];
      for (let i = 1; i < 7; i++) picked.push(pts[Math.round((i * (pts.length - 1)) / 7)]);
      picked.push(pts[pts.length - 1]);
      pts = picked.filter((p, i, a) => a.indexOf(p) === i);
    }
    drawBarChart(doc, {
      x: MARGIN, y: y + 4, width: CONTENT_W, height: 40,
      data: pts.map((p) => ({ label: shortDay(p.date), value: Math.round(p.total) })),
      color: GOLD, valueLabel: (v) => String(v),
    });
    y += 58;
  } else if (scoreHistory.length === 1) {
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text(doc.splitTextToSize(`Bisher liegt ein Score vor: ${Math.round(scoreHistory[0].total)} Punkte (${fmtDateDe(parseLocalDay(scoreHistory[0].date))}). Mit einem Retest im Reiter Tests wird die Entwicklung sichtbar.`, CONTENT_W), MARGIN, y);
    y += 14;
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Noch kein Präventions-Score vorhanden – Tests im Reiter Tests eintragen.', MARGIN, y);
    y += 12;
  }
  if (scoreBreakdown && scoreBreakdown.length > 0) {
    y = ensureSpace(doc, y, 14 + scoreBreakdown.length * 9, subtitle, pageCounter);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text('Zusammensetzung des aktuellen Scores', MARGIN, y);
    y += 7;
    y = drawHorizontalBarChart(doc, { x: MARGIN, y, width: CONTENT_W, data: scoreBreakdown.map((b) => ({ label: b.label, value: b.score })) });
    y += 6;
  }

  // Blutdruck & Ruhepuls (falls erfasst)
  if (vitals) {
    y = ensureSpace(doc, y, vitalsBlockHeight(vitals) + 4, subtitle, pageCounter);
    y = drawVitalsBlock(doc, y, vitals);
    y += 6;
  }

  // Stärkste Kraftwerte
  if (moduleAccess.training && topRecords.length > 0) {
    y = ensureSpace(doc, y, 20 + topRecords.length * 6, subtitle, pageCounter);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text('Deine stärksten Kraftwerte', MARGIN, y);
    y += 7;
    doc.setFillColor(...NAVY);
    doc.rect(MARGIN, y - 4.5, CONTENT_W, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(255, 255, 255);
    doc.text('Übung', MARGIN + 2, y);
    doc.text('Bestgewicht', MARGIN + CONTENT_W - 50, y);
    doc.text('Gesch. 1RM', MARGIN + CONTENT_W - 2, y, { align: 'right' });
    y += 6;
    topRecords.forEach((r, i) => {
      if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6, 'F'); }
      doc.setFont('times', 'normal');
      doc.setFontSize(8.6);
      doc.setTextColor(...TEXT_DARK);
      doc.text(doc.splitTextToSize(r.name, CONTENT_W - 70)[0], MARGIN + 2, y);
      doc.text(r.weightKg ? `${fmt1(r.weightKg)} kg${r.reps ? ` x ${r.reps}` : ''}` : '–', MARGIN + CONTENT_W - 50, y);
      doc.text(`${fmt1(r.e1rm)} kg`, MARGIN + CONTENT_W - 2, y, { align: 'right' });
      y += 6;
    });
    y += 6;
  }

  // Erfolge
  y = ensureSpace(doc, y, 24, subtitle, pageCounter);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text(`Neue Erfolge in diesem Zeitraum (${newAchievements.length})`, MARGIN, y);
  y += 7;
  if (newAchievements.length === 0) {
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Keine neuen Erfolge seit dem letzten Rückblick – die nächste Stufe wartet schon.', MARGIN, y);
    y += 6;
  } else {
    newAchievements.slice(0, 40).forEach((a) => {
      y = ensureSpace(doc, y, 7, subtitle, pageCounter);
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 1, y - 1.4, 1, 'F');
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_DARK);
      doc.text(`${a.title}${a.tierName ? ` (${a.tierName})` : ''}`, MARGIN + 4.5, y);
      y += 5.5;
    });
    if (newAchievements.length > 40) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8.6);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`… und ${newAchievements.length - 40} weitere`, MARGIN + 4.5, y);
    }
  }
  drawFooter(doc, `Seite ${pageCounter.n}`);

  const fileClientLabel = clientName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`Rueckblick_${fileClientLabel}_${months}-Monate.pdf`);
}

function parseLocalDay(key) {
  const [y, m, d] = String(key).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// "2026-04-14" -> "14.04.26" (kurz genug für die Balkenbeschriftung)
function shortDay(key) {
  const [y, m, d] = String(key).slice(0, 10).split('-');
  return `${d}.${m}.${String(y).slice(2)}`;
}

// ============================================================================
// Runde 22 (Nachtrag 5): erweiterte Berichtsseiten (gemeinsam für Monats- und
// Jahresbericht) – Tests mit Einstufung/Veränderung, Körpermaße, Training im
// Detail, Erfolge/Ziele, Hinweise. Daten kommen aus js/report-data.js.
// Hinweis: jsPDF-Kernschriften (WinAnsi) können weder Emoji noch Pfeile oder
// ≥/≤ darstellen – daher nur Text und per Vektor gezeichnete Punkte.
// ============================================================================

function sevColor(sev) {
  return sev === 'ok' ? SUCCESS : sev === 'warn' ? GOLD : sev === 'alert' ? DANGER : TEXT_MUTED;
}

function trendColor(trend) {
  return trend === 'better' ? SUCCESS : trend === 'worse' ? DANGER : TEXT_MUTED;
}

const TREND_WORD = { better: 'verbessert', worse: 'verschlechtert', same: 'unverändert' };

function startPage(doc, subtitle) {
  doc.addPage();
  drawHeaderBar(doc, subtitle);
  return 30;
}

function needSpace(doc, y, h, subtitle) {
  return y + h <= PAGE_H - 20 ? y : startPage(doc, subtitle);
}

function subHeading(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text(text, MARGIN, y);
  return y + 7;
}

function noteText(doc, text, y, { italic = true, size = 8.6, color = TEXT_MUTED, width = CONTENT_W, lineH = 3.9 } = {}) {
  doc.setFont('times', italic ? 'italic' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, MARGIN, y);
  return y + lines.length * lineH + 1.5;
}

function tableHeader(doc, y, cols) {
  doc.setFillColor(...NAVY);
  doc.rect(MARGIN, y - 4.5, CONTENT_W, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(255, 255, 255);
  cols.forEach((c) => doc.text(c.text, MARGIN + c.x, y, c.align ? { align: c.align } : undefined));
  return y + 6;
}

// Einfaches Liniendiagramm (Verlauf), ohne externe Bibliothek.
function drawLineChart(doc, { x, y, width, height, series, color = GOLD, digits = 1, unit = '' }) {
  const pts = (series || []).filter((p) => p && Number.isFinite(Number(p.value)));
  doc.setDrawColor(...TEXT_MUTED);
  doc.setLineWidth(0.25);
  doc.line(x, y + height, x + width, y + height);
  if (!pts.length) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8.6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Keine Messwerte im Zeitraum.', x, y + height / 2);
    return;
  }
  const vals = pts.map((p) => Number(p.value));
  let min = Math.min(...vals); let max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.2; min -= pad; max += pad;
  const t0 = new Date(pts[0].date).getTime(); const t1 = new Date(pts[pts.length - 1].date).getTime();
  const xAt = (p, i) => (pts.length === 1 ? x + width / 2 : x + 4 + ((t1 === t0 ? i / (pts.length - 1) : (new Date(p.date).getTime() - t0) / (t1 - t0)) * (width - 8)));
  const yAt = (v) => y + height - ((v - min) / (max - min)) * height;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.7);
  for (let i = 1; i < pts.length; i += 1) doc.line(xAt(pts[i - 1], i - 1), yAt(Number(pts[i - 1].value)), xAt(pts[i], i), yAt(Number(pts[i].value)));
  pts.forEach((p, i) => {
    doc.setFillColor(...color);
    doc.circle(xAt(p, i), yAt(Number(p.value)), 1.1, 'F');
  });
  const fmtV = (v) => `${(Math.round(Number(v) * 10 ** digits) / 10 ** digits).toLocaleString('de-DE')}${unit ? ' ' + unit : ''}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...NAVY);
  doc.text(fmtV(pts[0].value), xAt(pts[0], 0), yAt(Number(pts[0].value)) - 2.2, { align: pts.length === 1 ? 'center' : 'left' });
  if (pts.length > 1) doc.text(fmtV(pts[pts.length - 1].value), xAt(pts[pts.length - 1], pts.length - 1), yAt(Number(pts[pts.length - 1].value)) - 2.2, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(shortDay(pts[0].date), x, y + height + 4.5);
  if (pts.length > 1) doc.text(shortDay(pts[pts.length - 1].date), x + width, y + height + 4.5, { align: 'right' });
}

// Anteile (z. B. Bewegungsmuster) als goldene Balken mit Prozentangabe.
function drawShareBars(doc, { x, y, width, data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const labelW = 58; const valueW = 22; const barAreaW = width - labelW - valueW; const barH = 5;
  let cy = y;
  data.forEach((d) => {
    const share = total > 0 ? d.value / total : 0;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(...TEXT_DARK);
    doc.text(doc.splitTextToSize(d.label, labelW - 2)[0], x, cy + 3.8);
    doc.setFillColor(...CREAM);
    doc.roundedRect(x + labelW, cy, barAreaW, barH, 1.1, 1.1, 'F');
    if (share > 0) { doc.setFillColor(...GOLD); doc.roundedRect(x + labelW, cy, Math.max(2, share * barAreaW), barH, 1.1, 1.1, 'F'); }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(`${Math.round(share * 100)} %`, x + width, cy + 3.8, { align: 'right' });
    cy += barH + 3.2;
  });
  return cy;
}

// Test-Tabelle: gruppiert, mit Ampelpunkt, Einstufung und Veränderung.
function drawTestTable(doc, rows, y, subtitle) {
  const cols = [
    { text: 'Test', x: 5 },
    { text: 'Letzter Wert', x: 64 },
    { text: 'Einstufung', x: 96 },
    { text: 'Veränderung', x: CONTENT_W - 2, align: 'right' },
  ];
  y = needSpace(doc, y, 30, subtitle);
  y = tableHeader(doc, y, cols);
  let group = null; let idx = 0;
  rows.forEach((r) => {
    const labelText = r.side ? `${r.label} (${r.side})` : r.label;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.4);
    const labelLines = doc.splitTextToSize(labelText, 57);
    const valLines = doc.splitTextToSize(r.valueText || '', 31);
    const rateLines = doc.splitTextToSize(r.ratingText || '', 44).slice(0, 4);
    const changeLines = r.change ? doc.splitTextToSize(r.change.text, 34).slice(0, 2) : [];
    const n = Math.max(labelLines.length, valLines.length + 1, rateLines.length, changeLines.length + (r.change && TREND_WORD[r.change.trend] ? 1 : 0));
    const rowH = Math.max(8.2, n * 3.8 + 3.6);
    const groupH = r.group !== group ? 8 : 0;
    if (y + groupH + rowH > PAGE_H - 20) {
      y = startPage(doc, subtitle);
      y = tableHeader(doc, y, cols);
      group = null;
    }
    if (r.group !== group) {
      group = r.group; idx = 0;
      doc.setFillColor(...CREAM);
      doc.rect(MARGIN, y - 4, CONTENT_W, 6.4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.6);
      doc.setTextColor(...GOLD);
      doc.text(r.group.toUpperCase(), MARGIN + 2, y);
      y += 5.4;
    }
    if (idx % 2 === 1) { doc.setFillColor(250, 248, 243); doc.rect(MARGIN, y - 3.8, CONTENT_W, rowH, 'F'); }
    idx += 1;
    const top = y;
    doc.setFillColor(...sevColor(r.sev));
    doc.circle(MARGIN + 2, top - 0.9, 1.3, 'F');
    doc.setFont('times', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(...TEXT_DARK);
    doc.text(labelLines, MARGIN + 5, top);
    doc.setFont('times', 'bold');
    doc.text(valLines, MARGIN + 64, top);
    // Datum: gold = im Berichtszeitraum getestet, grau = älterer Wert
    doc.setFont('times', r.testedInPeriod ? 'bold' : 'italic');
    doc.setFontSize(7.2);
    doc.setTextColor(...(r.testedInPeriod ? GOLD : TEXT_MUTED));
    doc.text(fmtDateDe(parseLocalDay(r.date)), MARGIN + 64, top + valLines.length * 3.8);
    doc.setFont('times', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...TEXT_DARK);
    doc.text(rateLines, MARGIN + 96, top);
    if (r.change) {
      doc.setFont('times', 'bold');
      doc.setFontSize(8.4);
      doc.setTextColor(...trendColor(r.change.trend));
      doc.text(changeLines, MARGIN + CONTENT_W - 2, top, { align: 'right' });
      if (TREND_WORD[r.change.trend]) {
        doc.setFont('times', 'italic');
        doc.setFontSize(7.2);
        doc.text(TREND_WORD[r.change.trend], MARGIN + CONTENT_W - 2, top + changeLines.length * 3.8, { align: 'right' });
      }
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(7.6);
      doc.setTextColor(...TEXT_MUTED);
      doc.text('kein Vergleich', MARGIN + CONTENT_W - 2, top, { align: 'right' });
    }
    y += rowH;
  });
  return y;
}

function drawTestsSection(doc, testRows, testSummary, subtitle, { periodWord, compareHint }) {
  let y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Tests & Auswertungen', y);
  if (!testRows || testRows.length === 0) {
    noteText(doc, 'Es liegen noch keine Testergebnisse vor. Unter „Training – Tests" kannst du Kraftausdauer-, Herz-Kreislauf-, Beweglichkeits- und Lebensstil-Tests eintragen – sie erscheinen dann hier mit Einstufung und Verlauf.', y, { size: 9.5 });
    return;
  }
  const s = testSummary;
  y = drawKpiRow(doc, y, [
    { value: `${s.tested} / ${s.total}`, label: `Tests ${periodWord}` },
    { value: s.improved, label: 'verbessert' },
    { value: s.worse, label: 'verschlechtert' },
    { value: s.alerts, label: 'auffällig' },
  ]);
  y += 7;
  y = noteText(doc, `${compareHint} Punkte: grün = unauffällig, gold = Hinweis bzw. normal, rot = auffällig, grau = keine Einstufung möglich. Goldenes Datum = im Berichtszeitraum getestet.`, y, { size: 8.2 });
  y += 2;
  y = drawTestTable(doc, testRows, y, subtitle);
  y += 3;
  y = needSpace(doc, y, 16, subtitle);
  noteText(doc, 'Einstufungen nach den Normwerten der Plattform (Quellenangaben je Test im Testprotokoll). Sie dienen der Orientierung und ersetzen keine ärztliche oder therapeutische Diagnose.', y, { size: 7.8 });
}

function drawBodySection(doc, body, subtitle, { startLabel }) {
  let y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Körpermaße & Zusammensetzung', y);
  if (!body || !body.hasData) {
    noteText(doc, 'Noch keine Körpermaße erfasst. Unter „Ernährung – Körperfett-Verlauf" kannst du Gewicht und Umfänge eintragen – der Bericht zeigt dann Stand und Veränderung.', y, { size: 9.5 });
    return;
  }
  const cols = [
    { text: 'Messwert', x: 3 },
    { text: 'Aktuell', x: 82 },
    { text: startLabel, x: 118 },
    { text: 'Veränderung', x: CONTENT_W - 2, align: 'right' },
  ];
  y = tableHeader(doc, y, cols);
  body.rows.forEach((r, i) => {
    if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6.6, 'F'); }
    doc.setFont('times', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(r.label, MARGIN + 3, y);
    doc.setFont('times', 'bold');
    doc.text(r.endText, MARGIN + 82, y);
    doc.setFont('times', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(r.startText || '–', MARGIN + 118, y);
    doc.setFont('times', 'bold');
    doc.setTextColor(...trendColor(r.trend));
    doc.text(r.deltaText || '–', MARGIN + CONTENT_W - 2, y, { align: 'right' });
    y += 6.6;
  });
  y += 4;
  y = noteText(doc, 'Körperfett nach der Navy-Methode (Umfangsmessungen) – eine Schätzung, kein Ersatz für eine Messung per DEXA o. Ä. Grün/rot werden nur dort gesetzt, wo die Richtung eindeutig ist (z. B. Körperfett und Taille: weniger ist günstiger).', y, { size: 8 });
  y += 4;
  if (body.weightSeries.length > 0) {
    y = needSpace(doc, y, 62, subtitle);
    y = subHeading(doc, 'Körpergewicht im Verlauf', y);
    drawLineChart(doc, { x: MARGIN, y, width: CONTENT_W, height: 38, series: body.weightSeries, unit: 'kg' });
    y += 50;
  }
  if (body.fatSeries.length > 0) {
    y = needSpace(doc, y, 62, subtitle);
    y = subHeading(doc, 'Körperfettanteil im Verlauf', y);
    drawLineChart(doc, { x: MARGIN, y, width: CONTENT_W, height: 38, series: body.fatSeries, unit: '%', color: NAVY });
    y += 50;
  }
}

function drawTrainingExtrasPage(doc, extras, subtitle, { trainingSummary, periodWord }) {
  let y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Training – Belastung & Ausdauer', y);
  const tiles = [
    { value: fmt0(trainingSummary.distinctDaysCount), label: 'Trainingstage' },
    { value: fmt0(trainingSummary.totalSets), label: 'Sätze/Einträge gesamt' },
    { value: `${fmt0(extras.cardioMinutes)} Min.`, label: 'Ausdauer & Kurse' },
    { value: extras.avgSessionMinutes ? `${fmt0(extras.avgSessionMinutes)} Min.` : '–', label: 'Ø Dauer je Einheit' },
  ];
  y = drawKpiRow(doc, y, tiles);
  y += 10;
  const second = [];
  if (extras.cardioKm > 0) second.push(`Strecke bei Ausdauer-Einheiten: ${fmt1(extras.cardioKm)} km`);
  if (trainingSummary.caloriesBurned > 0) second.push(`Verbrauchte Kalorien laut Einheiten-Angaben: ${fmt0(trainingSummary.caloriesBurned)} kcal`);
  if (extras.totalSessionMinutes > 0) second.push(`Gesamte Trainingszeit (Einheiten mit Start/Ende): ${fmt1(extras.totalSessionMinutes / 60)} Std.`);
  if (second.length) y = noteText(doc, second.join(' · '), y, { italic: false, size: 9, color: TEXT_DARK });
  y += 6;

  y = subHeading(doc, 'Belastungsverteilung nach Bewegungsmuster', y);
  if (extras.patternTotal > 0) {
    y = noteText(doc, `Anteil am bewegten Gewicht ${periodWord} (Gewicht × Wiederholungen). Eine ausgewogene Verteilung zwischen Drücken/Ziehen, Beinen vorne/hinten und Rumpf vorne/hinten senkt das Risiko von Überlastungen – Groborientierung, keine individuelle Diagnose.`, y, { size: 8.2 });
    y += 2;
    y = drawShareBars(doc, { x: MARGIN, y, width: CONTENT_W, data: extras.patterns });
  } else {
    y = noteText(doc, 'Keine Krafttrainings-Logs mit Gewicht und Wiederholungen im Zeitraum.', y, { size: 9 });
  }
  y += 6;

  y = subHeading(doc, 'Trainingsarten (Anzahl Einträge je Kategorie)', y);
  const cats = Object.entries(extras.categoryCounts || {}).sort((a, b) => b[1] - a[1]);
  if (cats.length) {
    y = drawShareBars(doc, { x: MARGIN, y, width: CONTENT_W, data: cats.map(([label, value]) => ({ label, value })) });
  } else {
    y = noteText(doc, 'Keine Trainingseinträge im Zeitraum.', y, { size: 9 });
  }
}

function drawAchievementsPage(doc, subtitle, { achievements, goals, periodWord, scoreInfo }) {
  let y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Erfolge, Ziele & Hinweise', y);
  y = subHeading(doc, `Neue Erfolge ${periodWord}${achievements.length ? ` (${achievements.length})` : ''}`, y);
  if (achievements.length) {
    achievements.slice(0, 18).forEach((a) => {
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 1, y - 1.2, 1, 'F');
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_DARK);
      doc.text(`${a.title} (${fmtDateDe(parseLocalDay(a.day))})`, MARGIN + 4.5, y);
      y += 5.3;
    });
    if (achievements.length > 18) y = noteText(doc, `… und ${achievements.length - 18} weitere.`, y, { size: 8.6 });
  } else {
    y = noteText(doc, 'Keine neuen Erfolge im Zeitraum – bleib dran, der nächste ist nah.', y, { size: 9 });
  }
  y += 5;
  y = subHeading(doc, 'Coaching-Ziele', y);
  y = noteText(doc, goals.total > 0
    ? `Neu angelegt ${periodWord}: ${goals.created} · erreicht ${periodWord}: ${goals.achieved} · aktuell aktiv: ${goals.active}`
    : 'Noch keine Coaching-Ziele angelegt.', y, { italic: false, size: 9, color: TEXT_DARK });
  y += 5;
  if (scoreInfo && scoreInfo.end) {
    y = subHeading(doc, 'Präventions-Score', y);
    y = noteText(doc, `Stand am Ende des Zeitraums: ${Math.round(scoreInfo.end.total)} von 100 Punkten (${fmtDateDe(parseLocalDay(scoreInfo.end.date))})${scoreInfo.start ? ` · davor: ${Math.round(scoreInfo.start.total)} Punkte (${fmtDateDe(parseLocalDay(scoreInfo.start.date))}) · Veränderung ${scoreInfo.delta > 0 ? '+' : ''}${Math.round(scoreInfo.delta)}` : ''}.`, y, { italic: false, size: 9, color: TEXT_DARK });
    y += 5;
  }
  y = needSpace(doc, y, 40, subtitle);
  y = subHeading(doc, 'Hinweise zu diesem Bericht', y);
  [
    'Alle Werte stammen aus deinen eigenen Eingaben und Logs in der Plattform. Fehlende Einträge führen zu leeren Feldern oder „–".',
    'Einstufungen und Normwerte folgen den Quellen, die im jeweiligen Testprotokoll genannt sind. Sie sind eine Orientierung und keine medizinische Diagnose.',
    'Bei Schmerzen, Schwindel, Brustschmerz oder auffälligen Blutdruck-/Pulswerten bitte ärztlich abklären lassen.',
  ].forEach((t) => { y = noteText(doc, t, y, { italic: false, size: 8.6 }); });
}

function drawFootersFromPage(doc, firstPage = 2) {
  const total = doc.getNumberOfPages();
  for (let i = firstPage; i <= total; i += 1) {
    doc.setPage(i);
    drawFooter(doc, `Seite ${i} von ${total}`);
  }
}

// ============================================================================
// Runde 22 (Nachtrag 5): JAHRESBERICHT (Kalenderjahr wählbar) – Jahresverlauf
// und Monatsvergleich plus dieselben Auswertungsseiten wie der Monatsbericht
// (Tests mit Einstufung/Veränderung, Körpermaße, Training im Detail, Erfolge).
// ============================================================================

function drawTopExercisesTable(doc, exercises, y, subtitle) {
  y = subHeading(doc, 'Meistgenutzte Übungen', y);
  if (!exercises.length) {
    return noteText(doc, 'Keine Trainingseinheiten im Zeitraum erfasst.', y, { size: 9.5 });
  }
  y = needSpace(doc, y, 20, subtitle);
  y = tableHeader(doc, y, [
    { text: 'Übung', x: 2 },
    { text: 'Sätze', x: CONTENT_W - 44 },
    { text: 'Volumen (kg)', x: CONTENT_W - 2, align: 'right' },
  ]);
  exercises.forEach((ex, i) => {
    if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6, 'F'); }
    doc.setFont('times', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(...TEXT_DARK);
    doc.text(doc.splitTextToSize(ex.name, CONTENT_W - 60)[0], MARGIN + 2, y);
    doc.text(String(ex.sets), MARGIN + CONTENT_W - 44, y);
    doc.text(fmt0(ex.volume), MARGIN + CONTENT_W - 2, y, { align: 'right' });
    y += 6;
  });
  return y;
}

export async function buildYearlyReportPdf({
  profile,
  year,
  periodLabel, // z. B. "Kalenderjahr 2026" oder "1. Januar bis 04. Oktober 2026"
  months, // [{ idx, sessions, volumeKg, cardioMinutes, nutritionDays, avgKcal, avgProtein, weight, bodyFat, score }]
  trainingLogs,
  trainingSessions,
  preventionScore,
  vitals = null,
  streak,
  yearPrEvents,
  moduleAccess = { training: true, nutrition: true },
  extra,
}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const subtitle = `Jahresbericht ${year}`;
  const clientName = profile.full_name || profile.email || 'Kunde';

  let logo = null;
  try { logo = await loadImageAsDataUrl('icons/logo-full.png'); } catch (err) { logo = null; }

  // --- Deckblatt ----------------------------------------------------------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  if (logo) {
    const logoW = 46;
    const logoH = logoW * (logo.height / logo.width);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN - 3, 26 - 3, logoW + 6, logoH + 6, 3, 3, 'F');
    doc.addImage(logo.dataUrl, 'PNG', MARGIN, 26, logoW, logoH);
  }
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 78, PAGE_W - MARGIN, 78);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setCharSpace(1.4);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('PERSÖNLICHER JAHRESRÜCKBLICK', MARGIN, 92);
  doc.setCharSpace(0);
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text('Jahresbericht', MARGIN, 108);
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(String(year), MARGIN, 118);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 128, MARGIN + 60, 128);
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(240, 240, 236);
  doc.text(clientName, MARGIN, 138);
  doc.setFontSize(9);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(`Zeitraum: ${periodLabel}`, MARGIN, 145);
  doc.text(`Erstellt am ${fmtDateDe(new Date())}`, MARGIN, 151);
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 210, 214);
  doc.text(doc.splitTextToSize('Dieser Bericht zeigt dein Jahr im Überblick: Training, Ernährung, Körpermaße, alle Tests mit Einstufung und Veränderung, deinen Präventions-Score und deine Erfolge – mit Monatsvergleich und Jahresverlauf. Automatisch aus deinen geloggten Daten erstellt. Ideal zum Ausdrucken oder Archivieren.', PAGE_W - MARGIN * 2 - 4), MARGIN, PAGE_H - 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('DREAM AND DO IT · dreamanddoit.de', MARGIN, PAGE_H - 16);

  const trainingSummary = summarizeTraining(trainingLogs, trainingSessions);
  const nutDays = months.reduce((s, m) => s + (m.nutritionDays || 0), 0);
  const wAvg = (k) => (nutDays > 0 ? months.reduce((s, m) => s + (m[k] || 0) * (m.nutritionDays || 0), 0) / nutDays : 0);
  const periodWord = 'im Jahr';

  // --- Überblick ----------------------------------------------------------
  let y = startPage(doc, subtitle);
  y = sectionTitle(doc, `Dein Jahr ${year} im Überblick`, y);
  const tiles = [];
  if (moduleAccess.training) {
    tiles.push({ value: trainingSummary.sessionCount, label: 'Trainingseinheiten' });
    tiles.push({ value: fmtTonnes(trainingSummary.totalVolumeKg), label: 'Bewegte Kilos' });
  }
  if (moduleAccess.nutrition) tiles.push({ value: nutDays > 0 ? fmt0(wAvg('avgKcal')) : '–', label: 'Ø kcal pro Tag' });
  const hasScore = preventionScore && preventionScore.total != null;
  tiles.push({ value: hasScore ? Math.round(preventionScore.total) : '–', label: 'Präventions-Score' });
  y = drawKpiRow(doc, y, tiles);
  y += 8;
  const t2 = [];
  if (moduleAccess.training) {
    t2.push({ value: fmt0(trainingSummary.distinctDaysCount), label: 'Trainingstage' });
    t2.push({ value: `${fmt0(extra.trainingExtras.cardioMinutes)} Min.`, label: 'Ausdauer & Kurse' });
    const active = months.filter((m) => m.sessions > 0).length;
    t2.push({ value: `${active} / ${months.length}`, label: 'Aktive Monate' });
  }
  t2.push({ value: `${extra.testSummary.tested}`, label: 'Tests im Jahr' });
  y = drawKpiRow(doc, y, t2);
  y += 12;

  if (moduleAccess.training) {
    y = subHeading(doc, 'Deine Trainings-Serie', y);
    const streakText = streak
      ? `${streak.currentStreak} Woche${streak.currentStreak === 1 ? '' : 'n'} am Stück trainiert (beste Serie bisher: ${streak.longestStreak} Woche${streak.longestStreak === 1 ? '' : 'n'}). Regel: mind. 1 Trainingseinheit pro Kalenderwoche.`
      : 'Noch keine Trainings-Serie ermittelbar.';
    y = noteText(doc, streakText, y, { italic: false, size: 9.5, color: TEXT_DARK, lineH: 4.3 });
    y += 6;
  }

  y = subHeading(doc, `Neue persönliche Rekorde im Jahr${yearPrEvents && yearPrEvents.length ? ` (${yearPrEvents.length})` : ''}`, y);
  if (yearPrEvents && yearPrEvents.length > 0) {
    // Die zuletzt erzielten Rekorde (höchstens 12) – die Gesamtzahl steht oben.
    yearPrEvents.slice(-12).reverse().forEach((e) => {
      y = needSpace(doc, y, 8, subtitle);
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
    y = noteText(doc, 'Keine neuen Rekorde im Zeitraum.', y, { size: 9 });
  }
  y += 4;

  y = needSpace(doc, y + 2, 44, subtitle);
  y = subHeading(doc, 'Das Jahr auf einen Blick', y);
  const glance = [];
  const ts = extra.testSummary;
  glance.push(`Tests: ${ts.tested} im Jahr durchgeführt, ${ts.improved} verbessert, ${ts.worse} verschlechtert, ${ts.alerts} aktuell auffällig.`);
  if (extra.scoreInfo && extra.scoreInfo.end) {
    glance.push(`Präventions-Score: ${Math.round(extra.scoreInfo.end.total)} Punkte${extra.scoreInfo.delta != null ? ` (${extra.scoreInfo.delta > 0 ? '+' : ''}${Math.round(extra.scoreInfo.delta)} seit Jahresbeginn)` : ''}.`);
  }
  if (extra.body && extra.body.hasData) {
    extra.body.rows.filter((r) => r.deltaText && ['weight_kg', 'body_fat_percent', 'waist_cm'].includes(r.key)).forEach((r) => glance.push(`${r.label}: ${r.endText} (${r.deltaText} seit Jahresbeginn).`));
  }
  if (extra.achievements.length) glance.push(`${extra.achievements.length} neue${extra.achievements.length === 1 ? 'r Erfolg' : ' Erfolge'} im Jahr freigeschaltet.`);
  glance.forEach((t) => {
    doc.setFillColor(...GOLD);
    doc.circle(MARGIN + 1, y - 1.2, 1, 'F');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    const wrapped = doc.splitTextToSize(t, CONTENT_W - 6);
    doc.text(wrapped, MARGIN + 4.5, y);
    y += wrapped.length * 4.3 + 1.2;
  });

  // --- Jahresverlauf (Diagramme je Monat) ----------------------------------
  y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Jahresverlauf', y);
  const label = (m) => MONTH_SHORT_DE[m.idx];
  const charts = [];
  if (moduleAccess.training) {
    charts.push({ title: 'Trainingseinheiten je Monat', data: months.map((m) => ({ label: label(m), value: m.sessions })), fmt: (v) => fmt0(v) });
    charts.push({ title: 'Bewegtes Gewicht je Monat (Tonnen)', data: months.map((m) => ({ label: label(m), value: m.volumeKg / 1000 })), fmt: (v) => fmt1(v) });
    charts.push({ title: 'Ausdauer & Kurse je Monat (Minuten)', data: months.map((m) => ({ label: label(m), value: m.cardioMinutes })), fmt: (v) => fmt0(v) });
  }
  if (moduleAccess.nutrition) charts.push({ title: 'Ø Kalorien pro Tag je Monat (nur Monate mit Protokoll)', data: months.map((m) => ({ label: label(m), value: m.avgKcal || 0 })), fmt: (v) => (v > 0 ? fmt0(v) : '') });
  charts.forEach((c) => {
    y = needSpace(doc, y, 58, subtitle);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(c.title, MARGIN, y);
    y += 4;
    if (!c.data.some((d) => d.value > 0)) {
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.text('Keine Daten im Zeitraum.', MARGIN, y + 6);
      y += 16;
      return;
    }
    drawBarChart(doc, { x: MARGIN, y: y + 6, width: CONTENT_W, height: 32, data: c.data, color: GOLD, valueLabel: c.fmt });
    y += 54;
  });

  // --- Monatsvergleich -----------------------------------------------------
  y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Monatsvergleich', y);
  const cols = [{ text: 'Monat', x: 2 }];
  const ends = { sessions: 40, volume: 64, cardio: 86, kcal: 106, protein: 124, weight: 143, fat: 156, score: 172 };
  const colDefs = [];
  if (moduleAccess.training) {
    colDefs.push({ k: 'sessions', head: 'Einh.', end: ends.sessions }, { k: 'volume', head: 'Volumen kg', end: ends.volume }, { k: 'cardio', head: 'Ausd. Min.', end: ends.cardio });
  }
  if (moduleAccess.nutrition) colDefs.push({ k: 'kcal', head: 'Ø kcal', end: ends.kcal }, { k: 'protein', head: 'Ø Prot. g', end: ends.protein });
  colDefs.push({ k: 'weight', head: 'Gewicht', end: ends.weight }, { k: 'fat', head: 'KFA %', end: ends.fat }, { k: 'score', head: 'Score', end: ends.score });
  colDefs.forEach((c) => cols.push({ text: c.head, x: c.end, align: 'right' }));
  y = tableHeader(doc, y, cols);
  const best = { sessions: Math.max(...months.map((m) => m.sessions)), volume: Math.max(...months.map((m) => m.volumeKg)) };
  months.forEach((m, i) => {
    if (i % 2 === 1) { doc.setFillColor(...CREAM); doc.rect(MARGIN, y - 4.2, CONTENT_W, 6.4, 'F'); }
    doc.setFont('times', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(MONTH_NAMES[m.idx], MARGIN + 2, y);
    const val = {
      sessions: fmt0(m.sessions), volume: fmt0(m.volumeKg), cardio: fmt0(m.cardioMinutes),
      kcal: m.nutritionDays ? fmt0(m.avgKcal) : '–', protein: m.nutritionDays ? fmt0(m.avgProtein) : '–',
      weight: m.weight != null ? fmt1(m.weight) : '–', fat: m.bodyFat != null ? fmt1(m.bodyFat) : '–', score: m.score != null ? fmt0(m.score) : '–',
    };
    colDefs.forEach((c) => {
      const isBest = (c.k === 'sessions' && best.sessions > 0 && m.sessions === best.sessions) || (c.k === 'volume' && best.volume > 0 && m.volumeKg === best.volume);
      doc.setFont('times', isBest ? 'bold' : 'normal');
      doc.setTextColor(...(isBest ? GOLD : TEXT_DARK));
      doc.text(val[c.k], MARGIN + c.end, y, { align: 'right' });
    });
    y += 6.4;
  });
  // Summenzeile
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y - 3.6, MARGIN + CONTENT_W, y - 3.6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  doc.setTextColor(...NAVY);
  doc.text('Jahr', MARGIN + 2, y + 0.6);
  const totals = {
    sessions: fmt0(months.reduce((s, m) => s + m.sessions, 0)), volume: fmt0(months.reduce((s, m) => s + m.volumeKg, 0)), cardio: fmt0(months.reduce((s, m) => s + m.cardioMinutes, 0)),
    kcal: nutDays ? fmt0(wAvg('avgKcal')) : '–', protein: nutDays ? fmt0(wAvg('avgProtein')) : '–', weight: '', fat: '', score: extra.scoreInfo && extra.scoreInfo.end ? fmt0(extra.scoreInfo.end.total) : '–',
  };
  colDefs.forEach((c) => doc.text(totals[c.k], MARGIN + c.end, y + 0.6, { align: 'right' }));
  y += 10;
  y = noteText(doc, 'Summen bzw. Durchschnitte über das Jahr (kcal/Protein: Mittel der geloggten Tage). Gold = stärkster Monat. Gewicht und Körperfett: letzte Messung im Monat; Score: Stand am Monatsende. „–" = keine Daten in diesem Monat.', y, { size: 8 });

  // --- Training im Detail ---------------------------------------------------
  if (moduleAccess.training) {
    y = startPage(doc, subtitle);
    y = sectionTitle(doc, 'Training im Detail', y);
    drawTopExercisesTable(doc, trainingSummary.topExercises, y, subtitle);
    drawTrainingExtrasPage(doc, extra.trainingExtras, subtitle, { trainingSummary, periodWord });
  }

  // --- Körper, Tests ----------------------------------------------------------
  drawBodySection(doc, extra.body, subtitle, { startLabel: 'Jahresbeginn' });
  drawTestsSection(doc, extra.testRows, extra.testSummary, subtitle, { periodWord, compareHint: 'Veränderung gegenüber dem letzten Test vor Jahresbeginn (bzw. dem ersten Test im Jahr).' });

  // --- Präventions-Score ------------------------------------------------------
  y = startPage(doc, subtitle);
  y = sectionTitle(doc, 'Dein Präventions-Score', y);
  if (hasScore) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(...NAVY);
    doc.text(String(Math.round(preventionScore.total)), MARGIN, y + 14);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('von 100 Punkten – aktueller Stand', MARGIN + 30, y + 14);
    y += 26;
    if (extra.scoreSeries && extra.scoreSeries.length > 0) {
      y = subHeading(doc, `Score-Verlauf ${year}`, y);
      drawLineChart(doc, { x: MARGIN, y: y + 4, width: CONTENT_W, height: 34, series: extra.scoreSeries, digits: 0, unit: 'Pkt.' });
      y += 50;
    }
    if (preventionScore.breakdown && preventionScore.breakdown.length > 0) {
      y = subHeading(doc, 'Zusammensetzung nach Kategorie', y + 2);
      y = drawHorizontalBarChart(doc, { x: MARGIN, y, width: CONTENT_W, data: preventionScore.breakdown.map((b) => ({ label: b.label, value: b.score })) });
      y += 6;
    }
  } else {
    y = noteText(doc, 'Noch kein Präventions-Score verfügbar – dafür Geburtsdatum, Körpermaße und/oder Tests erfassen.', y, { size: 9.5 });
  }
  if (vitals) {
    if (y + vitalsBlockHeight(vitals) > PAGE_H - 22) { y = startPage(doc, subtitle); y = drawVitalsBlock(doc, 32, vitals); }
    else y = drawVitalsBlock(doc, y + 2, vitals);
  }

  drawAchievementsPage(doc, subtitle, { achievements: extra.achievements, goals: extra.goals, periodWord, scoreInfo: extra.scoreInfo });
  drawFootersFromPage(doc, 2);

  const fileClientLabel = clientName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`Jahresbericht_${fileClientLabel}_${year}.pdf`);
}
