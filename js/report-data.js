// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22 (Nachtrag 5): reine Datenaufbereitung (kein Netzwerk, kein DOM) für
// den erweiterten Monatsbericht und den neuen Jahresbericht (js/monthly-report.js).
//
// Der Bericht soll alles abbilden, was die Plattform erhebt und auswertet:
// Training (inkl. Cardio, Bewegungsmuster), Ernährung, Körpermaße, ALLE Tests
// (Kraftausdauer, Herz-Kreislauf, Blutdruck/Ruhepuls, Beweglichkeit, Lebensstil)
// mit Einstufung und Veränderung, Präventions-Score, Erfolge und Ziele.
// Die Einstufungen stammen aus denselben Funktionen wie in der App
// (js/prevention.js) – dadurch stimmen Bericht und Plattform überein.
// ============================================================================

import {
  STRENGTH_TESTS, MOBILITY_TESTS, isInputTest, mobilityRatingValue, mobilityRatingLabel,
  evaluateStrengthBenchmark, evaluateCardioFitness, evaluateSittingScore,
  evaluateNutritionQuality, evaluateSmokingStatus, evaluateAlcoholRisk,
  evaluateBloodPressure, evaluateRestingHeartRate, bloodPressureSeries,
} from './prevention.js';
import { ACHIEVEMENT_DEFINITIONS } from './achievements.js';

export const MONTH_NAMES_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const MONTH_SHORT_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// --- Tages-Schlüssel (lokale Zeit, YYYY-MM-DD) ------------------------------

export function dayKeyOf(input) {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function resultDay(r) { return String(r.measured_at).slice(0, 10); }

function ageAtKey(birthDate, key) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const d = new Date(`${key}T12:00:00`);
  if (Number.isNaN(b.getTime()) || Number.isNaN(d.getTime())) return null;
  let age = d.getFullYear() - b.getFullYear();
  const m = d.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && d.getDate() < b.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

const UNIT_SHORT = { Wiederholungen: 'Wdh.', Sekunden: 'Sek.', Minuten: 'Min.' };
function unitShort(u) { return UNIT_SHORT[u] || u || ''; }
function numDe(n, digits = 1) {
  const f = 10 ** digits;
  return (Math.round(Number(n) * f) / f).toLocaleString('de-DE');
}
function signed(n, digits = 1) {
  const v = Math.round(Number(n) * 10 ** digits) / 10 ** digits;
  if (v === 0) return '±0';
  return `${v > 0 ? '+' : '-'}${Math.abs(v).toLocaleString('de-DE')}`;
}

// ---------------------------------------------------------------------------
// TESTS & AUSWERTUNGEN
// ---------------------------------------------------------------------------

function sevFromKey(key) {
  if (key === 'below' || key === 'poor') return 'alert';
  if (key === 'low') return 'warn';
  if (key) return 'ok';
  return 'unknown';
}

function describeTests() {
  const out = [];
  STRENGTH_TESTS.forEach((t) => {
    const sides = t.hasSide ? ['left', 'right'] : [null];
    sides.forEach((side) => out.push({
      group: 'Kraftausdauer', kind: 'strength', key: t.key, side, def: t,
      label: t.label.replace(/ je Seite/g, ''), unit: unitShort(t.unit), higherBetter: true,
    }));
  });
  out.push({ group: 'Herz-Kreislauf', kind: 'cardio', key: 'cardio_fitness', side: null, label: 'Herz-Kreislauf-Fitness (VO2max)', unit: 'ml/kg/min', higherBetter: true });
  out.push({ group: 'Herz-Kreislauf', kind: 'bp', key: 'bp', side: null, label: 'Blutdruck', unit: 'mmHg', higherBetter: false });
  out.push({ group: 'Herz-Kreislauf', kind: 'hr', key: 'resting_hr', side: null, label: 'Ruhepuls', unit: 'bpm', higherBetter: false });
  MOBILITY_TESTS.filter(isInputTest).forEach((t) => {
    const sides = t.hasSide ? ['left', 'right'] : [null];
    sides.forEach((side) => out.push({
      group: 'Beweglichkeit', kind: t.kind === 'measure' ? 'measure' : 'rating', key: t.key, side, def: t,
      label: t.label.replace(/ je Seite/g, ''), unit: t.kind === 'measure' ? 'cm' : '', higherBetter: true,
    }));
  });
  out.push({ group: 'Lebensstil', kind: 'sitting', key: 'sitting_hours', side: null, label: 'Sitzverhalten', unit: 'Std./Tag', higherBetter: false });
  out.push({ group: 'Lebensstil', kind: 'sleep', key: 'sleep_side', side: null, label: 'Überwiegende Schlafseite', unit: '', higherBetter: null });
  out.push({ group: 'Lebensstil', kind: 'nutrition', key: 'nutrition_quality', side: null, label: 'Ernährungsqualität (Kurzcheck)', unit: '/ 100', higherBetter: true });
  out.push({ group: 'Lebensstil', kind: 'smoking', key: 'smoking_status', side: null, label: 'Rauchen', unit: '', higherBetter: false });
  out.push({ group: 'Lebensstil', kind: 'alcohol', key: 'alcohol_weekly_drinks', side: null, label: 'Alkohol (Standarddrinks/Woche)', unit: '/ Woche', higherBetter: false });
  return out;
}

function rateValue(d, value, age, sex) {
  const v = Number(value);
  switch (d.kind) {
    case 'strength':
    case 'measure': {
      const ev = evaluateStrengthBenchmark(d.key, age, v, sex);
      if (ev.needsSex) return { text: 'Geschlecht fehlt', sev: 'unknown' };
      if (!ev.bandFound || !ev.key) return { text: ev.label || '', sev: 'unknown' };
      return { text: ev.label, sev: ev.key === 'below' ? 'alert' : ev.key === 'low' ? 'warn' : 'ok' };
    }
    case 'cardio': {
      const ev = evaluateCardioFitness(age, sex, v);
      return { text: ev.bandFound ? ev.label : (ev.needsSex ? 'Geschlecht fehlt' : ''), sev: ev.bandFound ? sevFromKey(ev.key) : 'unknown' };
    }
    case 'hr': {
      const ev = evaluateRestingHeartRate(age, sex, v);
      return { text: ev.bandFound ? ev.label : '', sev: ev.bandFound ? (ev.key === 'top' || ev.key === 'mid' ? 'ok' : ev.key === 'low' ? 'warn' : 'alert') : 'unknown' };
    }
    case 'rating': {
      const r = mobilityRatingValue(d.key, v);
      const word = mobilityRatingLabel(r).text;
      const descr = d.def && d.def.ratingLabels ? d.def.ratingLabels[String(r)] : '';
      return { text: descr || word, sev: r < 0 ? 'alert' : r === 0 ? 'warn' : 'ok' };
    }
    case 'sitting': {
      const ev = evaluateSittingScore(v);
      return ev ? { text: ev.label, sev: ev.score >= 85 ? 'ok' : ev.score >= 65 ? 'warn' : 'alert' } : { text: '', sev: 'unknown' };
    }
    case 'sleep':
      return v === 0 ? { text: 'Rücken/wechselnd', sev: 'ok' } : { text: 'einseitig – kann Nacken verspannen', sev: 'warn' };
    case 'nutrition': {
      const ev = evaluateNutritionQuality(v);
      return ev ? { text: ev.label, sev: ev.score >= 60 ? 'ok' : ev.score >= 40 ? 'warn' : 'alert' } : { text: '', sev: 'unknown' };
    }
    case 'smoking': {
      const ev = evaluateSmokingStatus(v);
      return ev ? { text: '', sev: ev.score >= 85 ? 'ok' : ev.score >= 40 ? 'warn' : 'alert' } : { text: '', sev: 'unknown' };
    }
    case 'alcohol': {
      const ev = evaluateAlcoholRisk(v, sex);
      return ev ? { text: ev.label, sev: ev.score >= 70 ? 'ok' : ev.score >= 40 ? 'warn' : 'alert' } : { text: '', sev: 'unknown' };
    }
    default:
      return { text: '', sev: 'unknown' };
  }
}

function formatValue(d, value) {
  const v = Number(value);
  switch (d.kind) {
    case 'rating': {
      if (d.key === 'wall_angel') return `${v} von 3 Punkten`;
      return mobilityRatingLabel(mobilityRatingValue(d.key, v)).text;
    }
    case 'sleep': return v === 0 ? 'Rücken/wechselnd' : v > 0 ? 'rechts' : 'links';
    case 'smoking': return (evaluateSmokingStatus(v) || {}).label || '–';
    case 'nutrition': return `${numDe(v, 0)} / 100`;
    case 'alcohol': return `${numDe(v, 0)} / Woche`;
    case 'sitting': return `${numDe(v)} Std./Tag`;
    default: return `${numDe(v, Number.isInteger(v) ? 0 : 1)}${d.unit ? ' ' + d.unit : ''}`;
  }
}

// Vergleichswert, bei dem "größer" immer "besser" bedeutet (null = keine Wertung).
function goodness(d, value, extra) {
  const v = Number(value);
  if (d.kind === 'bp') return extra && extra.bpScore != null ? extra.bpScore : null;
  if (d.kind === 'rating') return mobilityRatingValue(d.key, v) * 1000 + v;
  if (d.higherBetter === true) return v;
  if (d.higherBetter === false) return -v;
  return null;
}

function changeInfo(d, last, base, extraLast, extraBase) {
  if (!base) return null;
  const gl = goodness(d, last.value, extraLast);
  const gb = goodness(d, base.value, extraBase);
  let text;
  if (d.kind === 'bp') {
    text = `vorher ${Math.round(base.systolic)}/${Math.round(base.diastolic)}`;
  } else if (d.kind === 'sleep' || d.kind === 'smoking') {
    const same = Number(last.value) === Number(base.value);
    text = same ? 'unverändert' : `vorher: ${d.kind === 'sleep' ? formatValue(d, base.value) : (evaluateSmokingStatus(base.value) || {}).label || '–'}`;
  } else if (d.kind === 'rating') {
    const a = mobilityRatingValue(d.key, last.value); const b = mobilityRatingValue(d.key, base.value);
    text = a === b && Number(last.value) === Number(base.value) ? 'unverändert' : `vorher: ${formatValue(d, base.value)}`;
  } else {
    const delta = Number(last.value) - Number(base.value);
    text = `${signed(delta, Number.isInteger(delta) ? 0 : 1)}${d.unit ? ' ' + d.unit : ''}`;
  }
  let trend = null;
  if (gl != null && gb != null) trend = gl > gb ? 'better' : gl < gb ? 'worse' : 'same';
  else trend = Number(last.value) === Number(base.value) ? 'same' : null;
  return { text, trend };
}

/**
 * Alle Tests mit letztem Wert bis zum Ende des Zeitraums, Einstufung und
 * Veränderung gegenüber dem Stand vor Zeitraum-Beginn (bzw. dem ersten Test im
 * Zeitraum, falls es davor keinen gab).
 */
export function buildTestRows({ results, birthDate, sex, fromKey, toKey }) {
  const list = (results || []).filter((r) => r && r.measured_at && r.value != null && r.test_key);
  const age = ageAtKey(birthDate, toKey);
  const bpAll = bloodPressureSeries(list).filter((b) => String(b.date).slice(0, 10) <= toKey);
  const rows = [];
  for (const d of describeTests()) {
    let last = null; let base = null; let inPeriodCount = 0; let extraLast = null; let extraBase = null;
    if (d.kind === 'bp') {
      if (!bpAll.length) continue;
      const lb = bpAll[bpAll.length - 1];
      const before = bpAll.filter((b) => String(b.date).slice(0, 10) < fromKey);
      const within = bpAll.filter((b) => String(b.date).slice(0, 10) >= fromKey);
      const bb = before[before.length - 1] || (within.length > 1 ? within[0] : null);
      const ev = evaluateBloodPressure(lb.systolic, lb.diastolic);
      last = { value: lb.systolic, systolic: lb.systolic, diastolic: lb.diastolic, measured_at: lb.date, measured_by: lb.measuredBy };
      base = bb && bb !== lb ? { value: bb.systolic, systolic: bb.systolic, diastolic: bb.diastolic, measured_at: bb.date } : null;
      extraLast = { bpScore: ev.score };
      extraBase = base ? { bpScore: evaluateBloodPressure(base.systolic, base.diastolic).score } : null;
      inPeriodCount = within.length;
      rows.push({
        group: d.group, label: d.label, side: null, kind: d.kind,
        value: lb.systolic, valueText: `${Math.round(lb.systolic)}/${Math.round(lb.diastolic)} mmHg`,
        ratingText: ev.bandFound ? ev.label : '', sev: ev.bandFound ? (ev.score >= 80 ? 'ok' : ev.score >= 50 ? 'warn' : 'alert') : 'unknown',
        date: String(lb.date).slice(0, 10), testedInPeriod: inPeriodCount > 0,
        change: changeInfo(d, last, base, extraLast, extraBase),
      });
      continue;
    }
    const series = list
      .filter((r) => r.test_key === d.key && (d.side ? r.side === d.side : true) && resultDay(r) <= toKey)
      .sort((a, b) => (resultDay(a) < resultDay(b) ? -1 : resultDay(a) > resultDay(b) ? 1 : String(a.created_at || '') < String(b.created_at || '') ? -1 : 1));
    if (!series.length) continue;
    last = series[series.length - 1];
    const before = series.filter((r) => resultDay(r) < fromKey);
    const within = series.filter((r) => resultDay(r) >= fromKey);
    base = before[before.length - 1] || (within.length > 1 ? within[0] : null);
    if (base === last) base = null;
    const rate = rateValue(d, last.value, age, sex);
    rows.push({
      group: d.group,
      label: d.label,
      side: d.side ? (d.side === 'left' ? 'links' : 'rechts') : null,
      kind: d.kind,
      value: Number(last.value),
      valueText: formatValue(d, last.value),
      ratingText: rate.text,
      sev: rate.sev,
      date: resultDay(last),
      testedInPeriod: within.length > 0,
      change: changeInfo(d, last, base, null, null),
    });
  }
  return rows;
}

export function summarizeTestRows(rows) {
  const tested = rows.filter((r) => r.testedInPeriod).length;
  const improved = rows.filter((r) => r.change && r.change.trend === 'better').length;
  const worse = rows.filter((r) => r.change && r.change.trend === 'worse').length;
  const alerts = rows.filter((r) => r.sev === 'alert').length;
  return { total: rows.length, tested, improved, worse, alerts };
}

// ---------------------------------------------------------------------------
// KÖRPERMAẞE
// ---------------------------------------------------------------------------

const BODY_METRICS = [
  { key: 'weight_kg', label: 'Körpergewicht', unit: 'kg', digits: 1, better: null },
  { key: 'body_fat_percent', label: 'Körperfettanteil (Navy-Methode)', unit: '%', digits: 1, better: 'lower' },
  { key: 'waist_cm', label: 'Taillenumfang', unit: 'cm', digits: 1, better: 'lower' },
  { key: 'hip_cm', label: 'Hüftumfang', unit: 'cm', digits: 1, better: null },
  { key: 'neck_cm', label: 'Halsumfang', unit: 'cm', digits: 1, better: null },
  { key: 'waist_to_hip_ratio', label: 'Taille-Hüft-Verhältnis', unit: '', digits: 2, better: 'lower' },
  { key: 'bmi', label: 'BMI (Körpermasse-Index)', unit: 'kg/m²', digits: 1, better: null },
];

export function summarizeBody(bodyMeasurements, fromKey, toKey) {
  const all = (bodyMeasurements || [])
    .filter((m) => m && m.measured_at)
    .map((m) => ({ ...m, _day: String(m.measured_at).slice(0, 10), bmi: m.weight_kg && m.height_cm ? Number(m.weight_kg) / ((Number(m.height_cm) / 100) ** 2) : null }))
    .sort((a, b) => (a._day < b._day ? -1 : a._day > b._day ? 1 : 0))
    .filter((m) => m._day <= toKey);
  const rows = [];
  for (const mt of BODY_METRICS) {
    const withVal = all.filter((m) => m[mt.key] != null && m[mt.key] !== '' && Number.isFinite(Number(m[mt.key])));
    if (!withVal.length) continue;
    const end = withVal[withVal.length - 1];
    const before = withVal.filter((m) => m._day < fromKey);
    const within = withVal.filter((m) => m._day >= fromKey);
    const start = before[before.length - 1] || (within.length > 1 ? within[0] : null);
    const endV = Number(end[mt.key]);
    const startV = start && start !== end ? Number(start[mt.key]) : null;
    let delta = null; let trend = null;
    if (startV != null) {
      delta = endV - startV;
      const r = Math.round(delta * 10 ** mt.digits) / 10 ** mt.digits;
      trend = r === 0 ? 'same' : mt.better === 'lower' ? (delta < 0 ? 'better' : 'worse') : null;
    }
    rows.push({
      label: mt.label, unit: mt.unit, key: mt.key,
      endText: `${numDe(endV, mt.digits)}${mt.unit ? ' ' + mt.unit : ''}`,
      endDate: end._day,
      startText: startV != null ? `${numDe(startV, mt.digits)}${mt.unit ? ' ' + mt.unit : ''}` : null,
      deltaText: delta != null ? `${signed(delta, mt.digits)}${mt.unit ? ' ' + mt.unit : ''}` : null,
      trend,
    });
  }
  const series = (key) => all.filter((m) => m[key] != null && Number.isFinite(Number(m[key]))).map((m) => ({ date: m._day, value: Number(m[key]) }));
  return { rows, hasData: rows.length > 0, weightSeries: series('weight_kg'), fatSeries: series('body_fat_percent') };
}

// ---------------------------------------------------------------------------
// TRAINING (Ergänzungen zur bestehenden summarizeTraining)
// ---------------------------------------------------------------------------

const PATTERN_LABELS = {
  push_oberkoerper: 'Drücken Oberkörper',
  pull_oberkoerper: 'Ziehen Oberkörper',
  vordere_beinkette: 'Beine vorne (Kniebeuge-Muster)',
  hintere_beinkette: 'Beine hinten (Beuge-Muster)',
  rumpf_vorne: 'Rumpf vorne',
  rumpf_hinten: 'Rumpf hinten',
};

export function summarizeTrainingExtras(logs, sessions) {
  const patternVol = {};
  let cardioSeconds = 0; let cardioMeters = 0; let cardioSessions = new Set();
  const categoryCounts = {};
  let strengthSets = 0;
  for (const l of logs || []) {
    const ex = l.exercises || {};
    const cat = ex.category || 'Sonstige';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    const w = Number(l.weight_kg) || 0; const r = Number(l.reps) || 0;
    if (w > 0 && r > 0 && ex.movement_pattern && ex.movement_pattern !== 'sonstige') {
      patternVol[ex.movement_pattern] = (patternVol[ex.movement_pattern] || 0) + w * r;
    }
    if (cat === 'Cardio' || /^Kurs:\s/.test(ex.name || '')) {
      cardioSeconds += Number(l.duration_seconds) || 0;
      cardioMeters += Number(l.distance_meters) || 0;
      if (l.session_id) cardioSessions.add(l.session_id);
    } else if (w > 0 || r > 0) strengthSets += 1;
  }
  const patterns = Object.keys(PATTERN_LABELS).map((k) => ({ label: PATTERN_LABELS[k], value: patternVol[k] || 0 }));
  const patternTotal = patterns.reduce((s, p) => s + p.value, 0);
  const durations = (sessions || [])
    .filter((s) => s.started_at && s.ended_at)
    .map((s) => (new Date(s.ended_at) - new Date(s.started_at)) / 60000)
    .filter((m) => m > 1 && m < 360);
  const avgSessionMinutes = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  const totalSessionMinutes = durations.reduce((a, b) => a + b, 0);
  return {
    patterns, patternTotal,
    cardioMinutes: cardioSeconds / 60, cardioKm: cardioMeters / 1000, cardioSessionCount: cardioSessions.size,
    avgSessionMinutes, totalSessionMinutes, sessionsWithDuration: durations.length,
    categoryCounts, strengthSets,
  };
}

// ---------------------------------------------------------------------------
// SCORE, ERFOLGE, ZIELE
// ---------------------------------------------------------------------------

export function scoreAround(scoreHistory, fromKey, toKey) {
  const hist = (scoreHistory || []).filter((h) => h && h.total != null).sort((a, b) => (a.date < b.date ? -1 : 1));
  const upTo = hist.filter((h) => h.date <= toKey);
  const end = upTo[upTo.length - 1] || null;
  const before = upTo.filter((h) => h.date < fromKey);
  const start = before[before.length - 1] || null;
  return { end, start, delta: end && start ? end.total - start.total : null };
}

export function achievementsInPeriod(achievementRows, fromKey, toKey) {
  const defs = new Map(ACHIEVEMENT_DEFINITIONS.map((d) => [d.key, d]));
  return (achievementRows || [])
    .filter((a) => a && a.earned_at)
    .map((a) => ({ day: dayKeyOf(a.earned_at), key: a.achievement_key }))
    .filter((a) => a.day >= fromKey && a.day <= toKey)
    .map((a) => {
      const def = defs.get(a.key);
      return { day: a.day, title: def ? (def.title || def.label || a.key) : null };
    })
    .filter((a) => a.title)
    .sort((a, b) => (a.day < b.day ? -1 : 1));
}

export function goalsInPeriod(goals, fromKey, toKey) {
  const list = goals || [];
  const created = list.filter((g) => g.created_at && dayKeyOf(g.created_at) >= fromKey && dayKeyOf(g.created_at) <= toKey).length;
  const achieved = list.filter((g) => g.status === 'achieved' && g.updated_at && dayKeyOf(g.updated_at) >= fromKey && dayKeyOf(g.updated_at) <= toKey).length;
  const active = list.filter((g) => g.status === 'active').length;
  return { created, achieved, active, total: list.length };
}

// ---------------------------------------------------------------------------
// ERNÄHRUNG (je Monat, für den Jahresbericht)
// ---------------------------------------------------------------------------

export function summarizeNutritionDays(nutritionLogs) {
  const dayTotals = new Map();
  for (const log of nutritionLogs || []) {
    if (!log.logged_at) continue;
    const day = String(log.logged_at).slice(0, 10);
    if (!dayTotals.has(day)) dayTotals.set(day, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    const t = dayTotals.get(day);
    t.kcal += Number(log.kcal) || 0; t.protein += Number(log.protein_g) || 0;
    t.carbs += Number(log.carbs_g) || 0; t.fat += Number(log.fat_g) || 0;
  }
  const days = Array.from(dayTotals.values());
  const n = days.length;
  const avg = (k) => (n ? days.reduce((s, d) => s + d[k], 0) / n : 0);
  return { days: n, kcal: avg('kcal'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat') };
}
