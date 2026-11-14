/* ===== Historial simulado del sensor (30 días) =====
   Para cada día se generan cuentas de actividad por minuto (actigrafía) y, a partir de ellas,
   se calcula el sueño con una puntuación tipo Cole-Kripke (ventana de 7 minutos). */
const HIST = 30;

function makeNight(a, date, off) {
  const r = rng(hashStr(a.id + '|n|' + dayKey(date)));
  const fxn = STORY[a.story](off);
  const tst = clamp(a.base.sleep + (fxn.sleep || 0) + 0.32 * gauss(r), 2.5, 9.5) * 60;
  const eff = clamp(0.93 + (fxn.eff || 0) + 0.018 * gauss(r), 0.6, 0.97);
  const tib = tst / eff;
  const wake = Math.round(375 + 9 * gauss(r));
  const bed = Math.round(wake - tib);
  const awake = tib - tst;
  const lat = clamp(Math.round(awake * (0.3 + 0.25 * r())), 4, 45);
  let rest = awake - lat;
  const bouts = [];
  while (rest >= 3 && bouts.length < 9) {
    const dur = Math.min(Math.round(3 + r() * 11), Math.round(rest));
    bouts.push({ at: Math.round(bed + lat + 30 + r() * Math.max(10, tib - lat - 60)), dur });
    rest -= dur;
  }
  return { bed, wake, lat, bouts, fx: fxn };
}

function makeEpochs(a, date, night, next, upto) {
  const r = rng(hashStr(a.id + '|e|' + dayKey(date)));
  const out = new Uint16Array(1440);
  const exStart = Math.round(a.exAt + 14 * gauss(r));
  const exDur = Math.round((112 + 10 * gauss(r)) * (1 + (night.fx.ex || 0)));
  const bedNext = 1440 + next.bed;
  let ar = 0;
  for (let m = 0; m < 1440; m++) {
    if (m >= upto) break;
    const inA = m >= night.bed && m < night.wake;
    const inB = m >= bedNext;
    let c;
    if (inA || inB) {
      const n = inA ? night : next;
      const mm = inA ? m : m - 1440;
      if (mm - n.bed < n.lat) c = r() < 0.55 ? 12 + r() * 70 : r() * 5;
      else if (n.bouts.some((b) => mm >= b.at && mm < b.at + b.dur)) c = 25 + r() * 140;
      else { const u = r(); c = u < 0.9 ? 0 : (u < 0.99 ? 1 + r() * 2 : 6 + r() * 12); }
    } else {
      ar = 0.9 * ar + 0.45 * gauss(r);
      let base = 110;
      if (m >= exStart && m < exStart + exDur) base = 820;
      else if ((m >= 740 && m < 780) || (m >= 1140 && m < 1180)) base = 45;
      else if (m < night.wake + 40) base = 160;
      c = Math.max(4, base * Math.exp(0.35 * ar) * (0.75 + 0.5 * r()));
    }
    out[m] = Math.round(c);
  }
  return out;
}

function scoreSleep(prev, cur, night) {
  const W = [106, 54, 58, 76, 230, 74, 67];
  const get = (m) => (m < 0 ? (prev ? prev[1440 + m] : 0) : (m < 1440 ? cur[m] : 0));
  const st = [];
  for (let m = night.bed; m < night.wake; m++) {
    let d = 0;
    for (let k = -4; k <= 2; k++) d += W[k + 4] * Math.min(300, get(m + k));
    st.push(0.001 * d < 1 ? 1 : 0);
  }
  let onset = -1, run = 0;
  for (let i = 0; i < st.length; i++) { run = st[i] ? run + 1 : 0; if (run === 10) { onset = i - 9; break; } }
  if (onset < 0) return { tst: 0, eff: 0, awak: 0, waso: 0, lat: st.length, tib: st.length };
  let last = st.length - 1;
  while (last > onset && !st[last]) last--;
  let tst = 0, waso = 0, awak = 0, w = 0;
  for (let i = onset; i <= last; i++) { if (st[i]) { tst++; if (w >= 3) awak++; w = 0; } else { waso++; w++; } }
  return { tst, waso, awak, lat: onset, tib: st.length, eff: tst / st.length };
}

function buildHistory(a) {
  const now = new Date();
  const today = startOfDay(now);
  const nowMin = minOfDay(now);
  const nights = {};
  for (let off = HIST + 1; off >= -1; off--) nights[off] = makeNight(a, addDays(today, -off), Math.max(off, 0));
  const days = [];
  let prev = makeEpochs(a, addDays(today, -(HIST + 1)), nights[HIST + 1], nights[HIST], 1440);
  for (let off = HIST; off >= 0; off--) {
    const date = addDays(today, -off);
    const night = nights[off];
    const ep = makeEpochs(a, date, night, nights[off - 1], off === 0 ? nowMin : 1440);
    const nightDone = off > 0 || nowMin >= night.wake;
    const sl = nightDone ? scoreSleep(prev, ep, night) : null;
    const r = rng(hashStr(a.id + '|d|' + dayKey(date)));
    const g = () => gauss(r);
    const f = night.fx, b = a.base;
    const sleepH = sl ? sl.tst / 60 : null;
    const short = sleepH != null && sleepH < 6 ? 1 : 0;
    let ex = 0;
    for (let m = 0; m < 1440; m++) if (ep[m] >= 450) ex++;
    days.push({
      off, date, key: dayKey(date), ep, upto: off === 0 ? nowMin : 1440, night, next: nights[off - 1],
      temp: b.temp + (f.temp || 0) + 0.05 * g(),
      hr: b.hr + (f.hr || 0) + 1.4 * g() + short * 1.5,
      rr: b.rr + (f.rr || 0) + 0.4 * g(),
      spo2: Math.min(99.4, b.spo2 + (f.spo2 || 0) + 0.3 * g()),
      sleepH, eff: sl ? sl.eff * 100 : null, awak: sl ? sl.awak : null, lat: sl ? sl.lat : null,
      mood: off === 0 ? null : clamp(b.mood + (f.mood || 0) + 0.28 * g() - short * 0.25, 1, 5),
      stress: off === 0 ? null : clamp(b.stress + (f.stress || 0) + 0.32 * g() + short * 0.3, 1, 5),
      exMin: ex,
    });
    prev = ep;
  }
  return { days, today: days[days.length - 1] };
}

/* ===== Entrenamiento: línea base personal =====
   El modelo aprende la media y la variación de cada indicador en una ventana de días.
   'base' deja fuera la última semana para que un cambio reciente no se confunda con lo normal. */
const MIN_SD = { temp: 0.1, hr: 2, rr: 0.6, spo2: 0.5, sleepH: 0.4, mood: 0.3, exMin: 8 };
function trainModel(a, mode) {
  const days = H[a.id].days.filter((d) => (mode === 'todo' ? d.off >= 1 : d.off >= 8));
  const stats = {};
  for (const k of Object.keys(MIN_SD)) {
    const vals = days.map((d) => d[k]).filter((v) => v != null);
    const m = mean(vals), s = Math.max(sdev(vals), MIN_SD[k]);
    stats[k] = { mean: m, sd: s, lo: m - 2 * s, hi: m + 2 * s, n: vals.length };
  }
  return { mode, at: Date.now(), from: days[0].date, to: days[days.length - 1].date, n: days.length, stats };
}

/* Umbrales personales de "atención": el más sensible entre el límite general y el personal */
function personalLimits(a) {
  const s = M[a.id].stats;
  return {
    temp: Math.min(37.5, s.temp.mean + Math.max(3 * s.temp.sd, 0.4)),
    hr: Math.min(100, s.hr.mean + Math.max(3 * s.hr.sd, 10)),
    rr: Math.min(21, s.rr.mean + Math.max(3 * s.rr.sd, 3.5)),
    spo2: Math.max(94, s.spo2.mean - Math.max(3 * s.spo2.sd, 2.5)),
  };
}
