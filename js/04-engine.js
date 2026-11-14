/* ===== State ===== */
const H = {}, M = {}, RT = {}, INS = {}, CHK = {};
const S = {
  profile: crewById(settings.profile) || CREW[0], view: 'inicio', state: null, sheet: null, tickN: 0,
  seen: {}, chk: { mood: null, tension: null }, draft: { tags: new Set(), syms: new Set(), mood: null },
  entFilter: 'todo', actFilter: 'todas', suggestion: null, recent: [], planSalt: 0, tableOpen: false, delAsk: null,
};
const TICK = 2000, T_COUNT = 10000, MAX_MED = 200, MED_FRESH = 12 * 3600e3;
const isRestTime = () => { const m = minOfDay(new Date()); return m >= 1335 || m < 360; };

/* ===== Measurements entered by the user =====
   Each crew member records the values they measured themselves. They are saved on this device. */
const K_MED = 'sh.mediciones.v1';
const MED_LIMITS = { temp: [30, 43], hr: [20, 250], rr: [4, 80], spo2: [50, 100], sys: [60, 260], dia: [30, 160], glu: [20, 600], rad: [0, 5000], sleepH: [0, 16] };
const MED_KEYS = ['temp', 'hr', 'rr', 'spo2', 'sys', 'dia', 'glu', 'rad'];
function cleanMed(m) {
  if (!m || typeof m !== 'object' || !isFinite(m.t)) return null;
  const out = { t: m.t, state: m.state === 'ejercicio' || m.state === 'activity' ? m.state : 'reposo' };
  for (const k of Object.keys(MED_LIMITS)) out[k] = num(m[k], ...MED_LIMITS[k]);
  if (out.sys == null || out.dia == null || out.dia >= out.sys) out.sys = out.dia = null;
  return [...MED_KEYS, 'sleepH'].some((k) => out[k] != null) ? out : null;
}
function loadMeds() {
  const saved = LS.get(K_MED, {}) || {}, out = {};
  CREW.forEach((a) => { out[a.id] = (Array.isArray(saved[a.id]) ? saved[a.id] : []).map(cleanMed).filter(Boolean).slice(-MAX_MED); });
  return out;
}
const MEDS = loadMeds();
const saveMeds = () => LS.set(K_MED, MEDS);
function newRuntime(a) {
  return { slots: {}, ep: null, last: null, reading: null, readingAt: null };
}
/* The latest value the user measured for each indicator (a measurement may include only some) */
function currentReading(a) {
  const out = { t: null, state: 'reposo' };
  for (const m of MEDS[a.id].slice().reverse()) {
    if (out.t == null) { out.t = m.t; out.state = m.state; }
    for (const k of MED_KEYS) if (out[k] == null && m[k] != null && m.t >= out.t - MED_FRESH) out[k] = m[k];
  }
  return out.t == null ? null : out;
}
/* Values measured today replace those from the sample history */
function applyMeds(a) {
  const today = H[a.id].today;
  for (const m of MEDS[a.id]) {
    if (dayKey(new Date(m.t)) !== today.key) continue;
    for (const k of MED_KEYS) if (m[k] != null && m.state === 'reposo') today[k] = m[k];
    if (m.sleepH != null) { today.sleepH = m.sleepH; today.eff = null; today.awak = null; }
  }
}
function addMeasurement(a, vals) {
  const m = cleanMed({ ...vals, t: Date.now() });
  if (!m) return false;
  MEDS[a.id].push(m);
  if (MEDS[a.id].length > MAX_MED) MEDS[a.id].shift();
  saveMeds();
  applyMeds(a);
  evaluate(a, true);
  refreshInsights();
  S.state = computeState(S.profile);
  bus.emit('tick');
  return true;
}
function deleteMeasurement(a, t) {
  MEDS[a.id] = MEDS[a.id].filter((m) => m.t !== t);
  saveMeds();
  rebuildData();
  evaluate(a, true);
  refreshInsights();
  S.state = computeState(S.profile);
  bus.emit('tick');
}
/* ===== Detection: safety limits + personal deviation + exertion context ===== */
function liveConds(a, rd) {
  const v = { temp: rd.temp, hr: rd.hr, rr: rd.rr, spo2: rd.spo2, sys: rd.sys, dia: rd.dia, glu: rd.glu, rad: rd.rad };
  const ex = rd.state === 'ejercicio', act = rd.state === 'activity', moving = ex || act;
  const p = personalLimits(a), raw = [];
  const add = (code, level, ind) => raw.push({ code, level, ind, v: v[ind], dom: COND[code].dom });
  /* An indicator the user didn't measure stays undefined and triggers no condition */
  const tx = moving ? 0.6 : 0;
  if (v.temp >= 39.5) add('fiebre_alta', 'emergency', 'temp');
  else if (v.temp >= 38 + tx) add('fiebre', 'alert', 'temp');
  else if (v.temp >= 37.3 + tx) add('febricula', 'watch', 'temp');
  else if (v.temp >= p.temp + tx) add('temp_desv', 'watch', 'temp');
  else if (v.temp < 35) add('hipotermia', 'emergency', 'temp');
  else if (v.temp < 35.5) add('temp_baja', 'alert', 'temp');
  if (ex) { if (v.hr >= hrCeil(a)) add('taqui', 'alert', 'hr'); }
  else if (act) { if (v.hr >= 130) add('taqui', 'alert', 'hr'); else if (v.hr >= 110) add('hr_alta', 'watch', 'hr'); }
  else if (v.hr >= 140) add('taqui_grave', 'emergency', 'hr');
  else if (v.hr >= 120) add('taqui', 'alert', 'hr');
  else if (v.hr >= 100) add('hr_alta', 'watch', 'hr');
  else if (v.hr >= p.hr) add('hr_desv', 'watch', 'hr');
  else if (v.hr <= 35) add('bradi_grave', 'emergency', 'hr');
  else if (v.hr <= 41) add('bradi', 'alert', 'hr');
  if (ex) { if (v.rr >= 45) add('taquipnea', 'alert', 'rr'); }
  else if (act) { if (v.rr >= 30) add('taquipnea', 'alert', 'rr'); else if (v.rr >= 26) add('rr_alta', 'watch', 'rr'); }
  else if (v.rr >= 30) add('taquipnea_grave', 'emergency', 'rr');
  else if (v.rr >= 24) add('taquipnea', 'alert', 'rr');
  else if (v.rr >= 21) add('rr_alta', 'watch', 'rr');
  else if (v.rr >= p.rr) add('rr_desv', 'watch', 'rr');
  else if (v.rr <= 7) add('bradipnea_grave', 'emergency', 'rr');
  else if (v.rr <= 9) add('bradipnea', 'alert', 'rr');
  else if (v.rr < 12) add('rr_low', 'watch', 'rr');
  /* Chronic lung conditions: 92-95 % is expected, so the alert line moves down to 92 */
  const lungHx = hasHx(a, 'asma');
  if (v.spo2 < 90) add('hipoxia_grave', 'emergency', 'spo2');
  else if (v.spo2 < (lungHx ? 92 : 94)) add('hipoxia', 'alert', 'spo2');
  else if (v.spo2 < 95 && !lungHx) add('spo2_baja', 'watch', 'spo2');
  else if (!lungHx && v.spo2 <= p.spo2) add('spo2_desv', 'watch', 'spo2');
  raw.push(...extraConds(v, rd.state));
  let conds = raw;
  /* High heart rate and breathing, no exertion, no fever, good oxygen: anxiety pattern */
  if (!moving && v.hr >= 100 && v.hr < 140 && v.rr >= 22 && v.rr < 30 && v.temp < 37.8 && v.spo2 > 94) {
    conds = raw.filter((c) => c.ind !== 'hr' && c.ind !== 'rr');
    conds.push({ code: 'ansiedad', level: 'alert', ind: 'mente', v: v.hr, dom: 'mente' });
  }
  const lv = { temp: 'ok', hr: 'ok', rr: 'ok', spo2: 'ok', bp: 'ok', glu: 'ok', rad: 'ok' };
  raw.forEach((c) => { lv[c.ind] = c.level; });
  return { conds, lv, v, ex };
}

/* Evaluates the user's latest measurement. fresh = just entered (notifies and opens guides);
   otherwise it only restores the state and advances the crew-alert countdown. */
function evaluate(a, fresh) {
  const rt = RT[a.id], now = Date.now();
  const rd = currentReading(a);
  rt.reading = rd && now - rd.t < MED_FRESH ? rd : null;
  rt.last = rt.reading ? liveConds(a, rt.reading) : null;
  stepAlerts(a, rt, now, fresh);
}
function stepAlerts(a, rt, now, fresh) {
  const mine = a.id === S.profile.id;
  const cur = {};
  (rt.last ? rt.last.conds : []).forEach((c) => { cur[c.ind] = c; });
  for (const ind of ['temp', 'hr', 'rr', 'spo2', 'bp', 'glu', 'rad', 'mente']) {
    const c = cur[ind];
    let s = rt.slots[ind];
    if (c) {
      if (!s) s = rt.slots[ind] = { ind, since: now, hits: 2, miss: 0, raised: fresh ? 0 : LV[c.level] };
      s.code = c.code; s.level = c.level; s.dom = c.dom; s.v = c.v;
      if (LV[s.level] > s.raised) { s.raised = LV[s.level]; if (mine && fresh) onRaise(s); }
    } else delete rt.slots[ind];
  }
  const acute = Object.values(rt.slots).filter((s) => LV[s.level] >= 2).sort((x, y) => LV[y.level] - LV[x.level]);
  if (acute.length) {
    if (!rt.ep) rt.ep = { id: uid(), start: now, sent: null, sentLevel: 0, cancelLv: fresh ? 0 : LV[acute[0].level], count: null, opened: !fresh };
    const ep = rt.ep;
    ep.top = acute[0];
    const lv = LV[ep.top.level];
    if (!ep.sent) {
      if (lv > ep.cancelLv) {
        if (!ep.count && lv >= 3) ep.count = { reason: 'grave', until: now + T_COUNT };
        else if (ep.count && lv >= 3) ep.count.reason = 'grave';
      } else ep.count = null;
      if (ep.count && now >= ep.count.until) sendCrewAlert(a, 'auto');
    } else if (lv > ep.sentLevel) {
      ep.sentLevel = lv;
      Store.updateAlert(ep.sent, { level: ep.top.level, title: crewTitle(a, ep.top) });
    }
    if (mine && lv >= 3 && !ep.opened) { ep.opened = true; openEmergency(); }
  } else if (rt.ep) {
    const ep = rt.ep;
    rt.ep = null;
    if (ep.sent) Store.updateAlert(ep.sent, { status: 'resuelta', resolved: now });
    if (mine) {
      notify({ type: 'sistema', level: 'ok', title: 'Your values are back to normal', body: ep.sent ? 'The crew alert has been marked as resolved.' : "We'll keep watching. Note in the Log how you feel." });
      if (S.sheet === 'emer') closeSheet();
    }
  }
}

function onRaise(s) {
  const c = COND[s.code];
  const t = condInline(s.code, s.v);
  if (s.level === 'watch') notify({ type: 'prevencion', level: 'watch', title: 'Watch: ' + t, body: c.s, act: { kind: 'guide', id: c.guide, label: 'What to do' } });
  else if (s.level === 'alert') notify({ type: 'alerta', level: 'alert', title: 'Alert: ' + t, body: c.s, act: { kind: 'guide', id: c.guide, label: 'See what to do' } });
  else notify({ type: 'alerta', level: 'emergency', title: 'Emergency: ' + t, body: c.s, act: { kind: 'emer', label: 'Open guide' } }, { toast: false });
}

const crewTitle = (a, top) => (COND[top.code].dom === 'mente' ? `${a.short} needs company` : `${a.short}: ${condInline(top.code, top.v)}`);
function sendCrewAlert(a, how) {
  const rt = RT[a.id], ep = rt.ep;
  if (!ep || ep.sent) return;
  const top = ep.top, c = COND[top.code];
  const reason = how === 'manual' ? 'manual' : (ep.count ? ep.count.reason : 'grave');
  const al = { id: 'a' + uid(), from: a.id, level: top.level, dom: c.dom, guide: c.guide, reason, ts: Date.now(), status: 'activa', resolved: null, acks: {},
    title: crewTitle(a, top),
    detail: c.dom === 'mente' ? 'Signs of acute anxiety. Approach calmly.' : reason === 'grave' ? 'Severe emergency based on the measured values.' : 'Alert sent by the crew member.' };
  ep.sent = al.id; ep.sentLevel = LV[top.level]; ep.count = null;
  Store.addAlert(al);
  if (a.id === S.profile.id) notify({ type: 'equipo', level: top.level, title: 'Crew notified', body: 'Your crewmates received the alert and the steps to help you.', act: { kind: 'view', id: 'equipo', label: 'View crew' } });
}

/* ===== User mood records ===== */
function rebuildChk() {
  for (const k of Object.keys(CHK)) delete CHK[k];
  for (const e of Store.entries) {
    if (e.kind !== 'checkin' || e.mood == null) continue;
    const key = dayKey(new Date(e.ts));
    const byCrew = (CHK[e.crew] = CHK[e.crew] || {});
    const c = (byCrew[key] = byCrew[key] || { m: [], s: [] });
    c.m.push(e.mood);
    if (e.stress != null) c.s.push(e.stress);
  }
  for (const id of Object.keys(CHK)) for (const key of Object.keys(CHK[id])) { const c = CHK[id][key]; c.mood = mean(c.m); c.stress = c.s.length ? mean(c.s) : null; }
}
const moodOf = (a, d) => { const c = CHK[a.id] && CHK[a.id][d.key]; return c ? c.mood : d.mood; };
const stressOf = (a, d) => { const c = CHK[a.id] && CHK[a.id][d.key]; return c && c.stress != null ? c.stress : d.stress; };
function nightsOf(a, n) {
  return H[a.id].days.filter((d) => d.sleepH != null).slice(-n).map((d) => d.sleepH);
}
function lastNight(a) {
  const ds = H[a.id].days.filter((d) => d.sleepH != null);
  return ds[ds.length - 1];
}

/* ===== Prevention: multi-day trends ===== */
function buildInsights(a) {
  const days = H[a.id].days, st = M[a.id].stats, out = [];
  const lastN = (k, n) => days.slice(-n).map((d) => d[k]).filter((v) => v != null);
  const t4 = lastN('temp', 4), h4 = lastN('hr', 4);
  const tNow = t4[t4.length - 1], tD = tNow - st.temp.mean, hD = h4[h4.length - 1] - st.hr.mean, tS = slope(t4), hS = slope(h4);
  let up = 0;
  for (let i = days.length - 1; i >= 0 && days[i].temp - st.temp.mean >= 0.2; i--) up++;
  if (tS >= 0.06 && tD >= 0.3 && up >= 2) {
    const withHr = hS >= 0.8 && hD >= 4;
    const eta = tNow < 37.3 ? Math.ceil((37.3 - tNow) / tS) : 0;
    out.push({ id: 'tend_temp', dom: 'cuerpo', level: 'watch', ic: 'thermo', guide: 'fiebre',
      title: `Your temperature has been rising for ${up} days`,
      text: `It's ${f1(tD)} °C above your baseline of ${f1(st.temp.mean)} °C` + (withHr ? ` and your resting heart rate is up ${f0(hD)} bpm. Together, these signs can appear a day or two before you notice an infection.` : '.') + (eta >= 1 && eta <= 4 ? ` If it keeps up, you'd reach 37.3 °C in ${eta === 1 ? 'one day' : eta + ' days'}.` : ''),
      tip: 'Drink more water, lower your exercise intensity today and tell the Medical Officer.' });
  } else if (hS >= 1 && hD >= 6) {
    out.push({ id: 'tend_hr', dom: 'cuerpo', level: 'watch', ic: 'heart', guide: 'taquicardia', title: 'Your resting heart rate is climbing',
      text: `It's ${f0(hD)} bpm above your baseline of ${f0(st.hr.mean)} bpm. It often rises with little sleep, stress, dehydration or at the start of an infection.`,
      tip: 'Hydrate, protect your sleep tonight and see how it changes tomorrow.' });
  }
  const s3 = mean(lastN('spo2', 3));
  if (st.spo2.mean - s3 >= 1.2) out.push({ id: 'tend_spo2', dom: 'cuerpo', level: 'watch', ic: 'drop', guide: 'oxigeno', title: 'Your blood oxygen has been dropping',
    text: `Average of ${f1(s3)} % over three days, versus your baseline of ${f1(st.spo2.mean)} %.`, tip: 'Check how you wear the sensor and the air quality where you work and sleep.' });
  const sys3 = mean(lastN('sys', 3)), dia3 = mean(lastN('dia', 3));
  if (sys3 - st.sys.mean >= 8 && sys3 >= 115) out.push({ id: 'tend_bp', dom: 'cuerpo', level: 'watch', ic: 'gauge', guide: 'bp_high', title: 'Your blood pressure is trending up',
    text: `Average of ${f0(sys3)}/${f0(dia3)} mmHg over three days, against your baseline of ${f0(st.sys.mean)}/${f0(st.dia.mean)}. In space it can shift a little with fluids, stress, salt and sleep.`,
    tip: 'Rest before measuring, drink water, limit salt and caffeine, and tell the Medical Officer if it keeps rising.' });
  const rad3 = mean(lastN('rad', 3));
  if (rad3 >= 1.5 * st.rad.mean && rad3 >= 40) out.push({ id: 'tend_rad', dom: 'cuerpo', level: 'watch', ic: 'radiation', guide: 'radiation', title: 'Your radiation dose rate is above usual',
    text: `Average of ${f0(rad3)} µSv/h over three days, against your baseline of ${f0(st.rad.mean)} µSv/h.`,
    tip: 'Spend more time in the best-protected module and check the radiation report from Mission Control.' });
  const ns = nightsOf(a, 5), ln = ns[ns.length - 1], debt = ns.reduce((s, v) => s + Math.max(0, a.need - v), 0), avg3 = mean(ns.slice(-3));
  const sl = { id: 'sueno', dom: 'cuerpo', ic: 'moon', guide: 'sueno' };
  if (debt >= 9 || avg3 < 5.2) out.push({ ...sl, level: 'alert', share: true, title: `Sleep debt: you're short ${f1(debt)} h over 5 nights`,
    text: `You averaged ${f1(avg3)} h the last 3 nights and your body needs about ${f1(a.need)} h. With so little sleep, attention and mood drop, and mistakes come easier.`,
    tip: 'Go to bed 45 minutes earlier tonight and tell the Commander if you have a critical task tomorrow.' });
  else if (ln < 5) out.push({ ...sl, level: 'watch', title: `You slept only ${f1(ln)} h last night`, text: 'Even a single short night affects attention and mood the next day.',
    tip: 'Avoid precision tasks in the first hours and, if you can, take a 20-minute nap before 3:00 PM.' });
  else if (debt >= 5 || avg3 < 6) out.push({ ...sl, level: 'watch', title: "You're sleeping less than you need",
    text: `You're short ${f1(debt)} h of sleep over 5 nights. Your recent average is ${f1(avg3)} h and you need about ${f1(a.need)} h.`, tip: 'Move your bedtime 30 minutes earlier and put screens away beforehand.' });
  else {
    const e3 = mean(lastN('eff', 3));
    if (e3 < 80) out.push({ ...sl, id: 'eficiencia', level: 'watch', title: 'Your sleep is very fragmented', text: `Average efficiency of ${f0(e3)} % over three nights. Above 85 % is expected.`, tip: 'Check the noise, light and ventilation in your crew quarters.' });
  }
  const past = days.filter((d) => d.off >= 1);
  const exAvg = mean(past.slice(-3).map((d) => d.exMin));
  if (exAvg < 0.72 * st.exMin.mean) out.push({ id: 'ejercicio', dom: 'cuerpo', level: 'watch', ic: 'zap', title: "You're moving less",
    text: `Your exercise dropped to ${f0(exAvg)} min a day and your average is ${f0(st.exMin.mean)} min. Moving less can be a sign of fatigue or low mood.`, tip: 'Get back to your full session or split it into two shorter parts.' });
  const tk = CHK[a.id] && CHK[a.id][H[a.id].today.key];
  const moods = past.slice(-6).map((d) => moodOf(a, d));
  if (tk) moods.push(tk.mood);
  const m3 = mean(moods.slice(-3)), mS = slope(moods.slice(-6));
  let lowDays = 0;
  for (let i = moods.length - 1; i >= 0 && moods[i] <= 2.7; i--) lowDays++;
  if (m3 <= 2.4 && lowDays >= 3) out.push({ id: 'animo', dom: 'mente', level: 'alert', ic: 'smile', guide: 'animo', share: true, title: `Low mood for ${lowDays} days`,
    text: `Your mood records have been below your usual for several days. The recent average is ${f1(m3)} out of 5.`, tip: 'Today pick an activity with someone else and tell someone how you are.' });
  else if (m3 <= 3.0 || mS <= -0.2) out.push({ id: 'animo', dom: 'mente', level: 'watch', ic: 'smile', guide: 'animo', title: 'Your mood is trending down',
    text: `The average of your latest records is ${f1(m3)} out of 5.`, tip: 'Set aside a moment today for something you enjoy and talk with someone on the crew.' });
  const str = past.slice(-3).map((d) => stressOf(a, d));
  if (tk && tk.stress != null) str.push(tk.stress);
  const sA = mean(str.slice(-3));
  if (sA >= 3.7) out.push({ id: 'tension', dom: 'mente', level: 'watch', ic: 'wind', guide: 'ansiedad', title: 'You have had high tension for several days',
    text: `Average of ${f1(sA)} out of 5 in your latest records.`, tip: 'Take three breathing breaks today and review your workload with the Commander.' });
  return out.sort((x, y) => LV[y.level] - LV[x.level]);
}
function refreshInsights() { CREW.forEach((a) => { INS[a.id] = buildInsights(a); }); }

/* ===== Mental wellbeing: explainable index ===== */
function psych(a, body) {
  const days = H[a.id].days, past = days.filter((d) => d.off >= 1), st = M[a.id].stats, today = H[a.id].today;
  const tk = CHK[a.id] && CHK[a.id][today.key];
  const moods = past.slice(-6).map((d) => moodOf(a, d));
  if (tk) moods.push(tk.mood);
  const moodAvg = mean(moods.slice(-3)), mSlope = slope(moods.slice(-6));
  const str = past.slice(-3).map((d) => stressOf(a, d));
  if (tk && tk.stress != null) str.push(tk.stress);
  const stressAvg = mean(str.slice(-3));
  const ns = nightsOf(a, 5), debt = ns.reduce((s, v) => s + Math.max(0, a.need - v), 0), sleep3 = mean(ns.slice(-3));
  const hrZ = (today.hr - st.hr.mean) / st.hr.sd, fever = today.temp - st.temp.mean >= 0.3;
  const q = Math.min(4, Math.floor((MISSION.day - 1) / (MISSION.total / 4)) + 1);
  const since = Date.now() - 48 * 3600e3;
  const mine = Store.entries.filter((e) => e.crew === a.id && e.ts >= since);
  const nAct = mine.filter((e) => e.kind === 'actividad').length, nNote = mine.filter((e) => e.kind === 'nota').length;
  const acute = Object.values(RT[a.id].slots).some((s) => s.dom === 'mente' && s.hits >= 2);
  const drivers = [];
  const add = (label, detail, pts) => { if (Math.abs(pts) >= 1) drivers.push({ label, detail, pts: Math.round(pts) }); };
  add('Mood', `Average of ${f1(moodAvg)} out of 5 in your latest records`, -clamp((3.8 - moodAvg) * 14, 0, 38));
  add('Mood trend', 'It has been dropping this week', mSlope < -0.12 ? -clamp(-mSlope * 30, 0, 8) : 0);
  add('Sleep', `You're short ${f1(debt)} h of sleep over 5 nights`, -clamp(debt * 1.3, 0, 16));
  add('Tension', `Average of ${f1(stressAvg)} out of 5`, -clamp((stressAvg - 2.5) * 8, 0, 16));
  add('Resting heart rate', 'Higher than your baseline, no fever', !fever && hrZ > 1.5 ? -clamp((hrZ - 1.5) * 3, 0, 8) : 0);
  add('Physical discomfort', 'Your body needs attention and that also weighs on mood', body.level !== 'ok' ? -4 : 0);
  add('Mission phase', 'Third quarter: the phase when mood most often dips', q === 3 ? -5 : 0);
  add('Acute anxiety', 'Signs of anxiety in your latest measurements', acute ? -15 : 0);
  add('Activities done', `${nAct} in the last 48 hours`, Math.min(8, nAct * 2));
  add('Log up to date', `${nNote} ${nNote === 1 ? 'note' : 'notes'} in the last 48 hours`, Math.min(4, nNote * 2));
  const index = Math.round(clamp(100 + drivers.reduce((s, d) => s + d.pts, 0), 5, 100));
  drivers.sort((x, y) => x.pts - y.pts);
  return { index, drivers, data: { moodAvg, mSlope, stressAvg, debt, sleep3, hrZ, q, fever } };
}

function computeState(a) {
  const slots = Object.values(RT[a.id].slots).filter((s) => s.hits >= 2).sort((x, y) => LV[y.level] - LV[x.level]);
  const ins = INS[a.id] || [];
  const bC = slots.filter((s) => s.dom === 'cuerpo'), bI = ins.filter((i) => i.dom === 'cuerpo');
  let bi = 100;
  bC.forEach((c) => { bi -= [0, 12, 35, 60][LV[c.level]]; });
  bI.forEach((i) => { bi -= i.level === 'alert' ? 30 : 12; });
  const body = { level: maxLv([...bC, ...bI]), index: Math.round(clamp(bi, 5, 100)), conds: bC, ins: bI };
  body.why = bC.length && LV[bC[0].level] >= LV[body.level] ? condTitle(bC[0].code, bC[0].v) : bI.length ? bI[0].title : 'Your vital signs are within your usual range.';
  const p = psych(a, body);
  const mC = slots.filter((s) => s.dom === 'mente'), mI = ins.filter((i) => i.dom === 'mente');
  const idxLv = p.index >= 75 ? 'ok' : p.index >= 50 ? 'watch' : 'alert';
  const mind = { level: maxLv([{ level: idxLv }, ...mC, ...mI]), index: p.index, drivers: p.drivers, data: p.data, conds: mC, ins: mI };
  const top = p.drivers[0];
  mind.why = mC.length ? 'Signs of acute anxiety. Open the guide and breathe with me.' : mI.length ? mI[0].title : mind.level === 'ok' ? 'Your mood, sleep and tension are holding up well.' : top ? `${top.label}: ${low(top.detail)}.` : '';
  return { body, mind };
}

/* ===== Psychological care plan, generated from each crew member's conditions ===== */
function buildPlan(a, st) {
  const d = st.mind.data, lvl = st.mind.level, focos = [];
  const bed = Math.round((375 - (a.need * 60) / 0.9) / 5) * 5;
  if (d.debt >= 4 || d.sleep3 < 6.3) focos.push({ id: 'sueno', cats: ['calma'], title: 'Recover your sleep',
    why: `You averaged ${f1(d.sleep3)} h the last 3 nights and need about ${f1(a.need)} h. You've built up ${f1(d.debt)} h of debt.`,
    todo: [`Go to bed at ${hm(bed)} all week.`, 'Dim the lights and put screens away 45 minutes before.', 'No caffeine after noon.', 'If needed, a 20-minute nap before 3:00 PM.'] });
  if (d.moodAvg <= 3.2 || d.mSlope < -0.12) focos.push({ id: 'animo', cats: ['conectar', 'crear', 'jugar'], title: 'Lift your mood, little by little',
    why: `Your recent average mood is ${f1(d.moodAvg)} out of 5${d.mSlope < -0.12 ? ' and has been dropping' : ''}.`,
    todo: ['One enjoyable activity a day. Start with 5 minutes, even if you don\'t feel like it.', 'One non-work conversation every day.', 'A video call with your family this week.', 'Bright light and exercise in the morning.'] });
  if (d.stressAvg >= 3.2 || (!d.fever && d.hrZ > 1.8)) focos.push({ id: 'calma', cats: ['calma', 'mover'], title: 'Lower your tension',
    why: `Your average tension is ${f1(d.stressAvg)} out of 5${!d.fever && d.hrZ > 1.8 ? ' and your resting heart rate is above your baseline' : ''}.`,
    todo: ['Three 2-minute breathing breaks a day.', 'Work in 45-minute blocks with 5-minute breaks.', "If the schedule doesn't fit the day, say so in the planning meeting."] });
  if (st.body.level !== 'ok' && !focos.some((f) => f.id === 'sueno' && st.body.ins.every((i) => i.id === 'sueno'))) focos.push({ id: 'cuidado', cats: ['calma'], title: 'Take care while your body recovers',
    why: 'Your vital signs show changes, and feeling unwell physically also affects mood.',
    todo: ['Slow down today: swap intense exercise for stretching.', 'Tell the Medical Officer how you feel.', 'Drink more water and sleep a bit more than usual.'] });
  if (d.q === 3) focos.push({ id: 'sentido', cats: ['sentido', 'conectar'], title: 'Protect your motivation in the third quarter',
    why: `You're on day ${MISSION.day} of ${MISSION.total}. On long missions mood often dips just past the halfway point. It's normal and it passes.`,
    todo: ['Set a small goal for this week and celebrate it with the crew.', 'Write in the Log why this mission matters to you.', "Plan something to do when you're back on Earth."] });
  if (focos.length < 2) focos.push({ id: 'mantener', cats: [], title: 'Keep doing what works',
    why: 'Your indicators are stable. The goal is to keep your routines.',
    todo: ['Keep up your 2 hours of daily exercise.', 'Keep your sleep schedule.', 'One enjoyable activity a day.'] });
  hxFocos(a).forEach((f) => focos.push(f));
  const chkDay = lvl === 'ok' ? 2 : lvl === 'watch' ? 3 : 4;
  const actsDay = lvl === 'ok' ? 2 : 3;
  const w = { crear: 1, conectar: 1, calma: 1, mover: 1, sentido: 1, jugar: 1 };
  focos.forEach((f) => f.cats.forEach((c) => { w[c] += 2; }));
  const r = rng(hashStr(a.id + '|plan|' + dayKey(new Date()) + '|' + S.planSalt));
  const used = new Set();
  const draw = () => {
    const pool = ACTS.filter((x) => !used.has(x.id) && !x.noche);
    const ws = pool.map((x) => w[x.cat] + ((x.tags || []).some((t) => a.likes.includes(t)) ? 1.5 : 0));
    let u = r() * ws.reduce((s, v) => s + v, 0), i = 0;
    while (i < pool.length - 1 && (u -= ws[i]) > 0) i++;
    used.add(pool[i].id);
    return pool[i];
  };
  const today = startOfDay(new Date()), hasSleep = focos.some((f) => f.id === 'sueno'), hasMood = focos.some((f) => f.id === 'animo');
  const ppc = lvl === 'alert' ? 1 : lvl === 'watch' ? 3 : -1;
  const times = actsDay === 2 ? [660, 1050] : [630, 900, 1170];
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i), dow = date.getDay(), items = [];
    if (hasSleep) items.push([420, 'Bright light and 10 minutes of movement after waking']);
    times.forEach((t) => items.push([t, draw().t]));
    if (i === ppc) items.push([960, 'Private conference with the mission psychologist']);
    if (dow === 6 || (hasMood && i === 2)) items.push([1080, 'Video call with your family']);
    if (dow === 5) items.push([1200, 'Whole-crew dinner']);
    if (hasSleep) items.push([bed + 1440 - 45, 'Bedtime routine: dim lights, no screens']);
    items.sort((x, y) => x[0] - y[0]);
    semana.push({ date, items });
  }
  const medic = CREW.find((c) => c.role === 'Medical Officer'), cmd = CREW.find((c) => c.role === 'Commander');
  const apoyo = [
    a.id === medic.id ? ['Flight surgeon on the ground', 'sees you in the private medical conference.'] : [`${medic.name}, Medical Officer`, 'your first contact on board for any discomfort.'],
    a.id === cmd.id ? ['Flight director on the ground', 'to adjust your workload.'] : [`${cmd.name}, Commander`, 'can adjust your schedule if the load is too much.'],
    ['Mission psychologist', ppc >= 0 ? 'your private conference is moved up to this week. It is confidential.' : 'private conference every two weeks. It is confidential.'],
    ['Your family', 'weekly video call and messages in every communication window.'],
  ];
  return { focos, chkDay, actsDay, semana, apoyo, w, at: Date.now() };
}

/* ===== Periodic mental health reminders ===== */
const SCHED = { nextAct: 0, nextChk: 0 };
const FIRST = { amara: 'flor', lucas: 'pelicula', kenji: 'lectura', valentina: 'cancion' };
const planNow = () => buildPlan(S.profile, S.state || computeState(S.profile));
const actEvery = () => (settings.freq === 'plan' ? Math.round((16 * 3600e3) / planNow().actsDay) : Number(settings.freq) * 60000);
const chkEvery = () => Math.round((16 * 3600e3) / planNow().chkDay);
function schedReset() { const now = Date.now(); SCHED.nextAct = now + actEvery(); SCHED.nextChk = now + chkEvery(); }
function schedTick(now) {
  if (RT[S.profile.id].ep) return;
  if (now >= SCHED.nextAct) { SCHED.nextAct = now + actEvery(); remindActivity(); }
  if (now >= SCHED.nextChk) { SCHED.nextChk = now + chkEvery(); remindCheckin(); }
}
function pickSuggestion(exclude) {
  const a = S.profile, w = planNow().w, night = isRestTime();
  let pool = ACTS.filter((x) => x.id !== exclude && !S.recent.includes(x.id) && (night ? x.cat === 'calma' : !x.noche));
  if (!pool.length) pool = ACTS.filter((x) => x.id !== exclude && (night ? x.cat === 'calma' : !x.noche));
  const ws = pool.map((x) => w[x.cat] + ((x.tags || []).some((t) => a.likes.includes(t)) ? 1.5 : 0));
  let u = Math.random() * ws.reduce((s, v) => s + v, 0), i = 0;
  while (i < pool.length - 1 && (u -= ws[i]) > 0) i++;
  return pool[i];
}
function setSuggestion(x) {
  S.suggestion = x.id;
  S.recent.push(x.id);
  if (S.recent.length > 10) S.recent.shift();
  bus.emit('suggestion');
}
function remindActivity() {
  const x = pickSuggestion(S.suggestion);
  setSuggestion(x);
  notify({ type: 'actividad', level: 'ok', title: 'A moment for you: ' + low(x.t), body: x.d, actId: x.id });
}
function remindCheckin() { notify({ type: 'checkin', level: 'ok', title: 'How do you feel right now?', body: 'Tap the face that best describes you. It takes two seconds.', faces: true }); }

/* ===== Notifications ===== */
const NOTES = [];
function notify(n, opt = {}) {
  const note = { id: uid(), ts: Date.now(), read: false, ...n };
  NOTES.unshift(note);
  if (NOTES.length > 40) NOTES.length = 40;
  bus.emit('note', { note, toast: opt.toast !== false });
  return note;
}

/* ===== Storage: private cloud per account if available; otherwise this device ===== */
const K_ENT = 'sh.bitacora.v1', K_ALR = 'sh.alertas.v1';
const CREW_IDS = new Set(CREW.map((c) => c.id));
const sstr = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
const strip = (o) => { const c = { ...o }; delete c.where; return c; };
function cleanEntries(arr) {
  if (!Array.isArray(arr)) return [];
  const n15 = (v) => (typeof v === 'number' && v >= 1 && v <= 5 ? v : null);
  const list = (v, n) => (Array.isArray(v) ? v.filter((t) => typeof t === 'string').slice(0, 8).map((t) => t.slice(0, n)) : []);
  return arr.map((e) => {
    if (!e || typeof e !== 'object' || !CREW_IDS.has(e.crew) || typeof e.ts !== 'number' || !e.id) return null;
    const img = typeof e.img === 'string' && e.img.length < 240000 && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(e.img) ? e.img : null;
    return { id: sstr(String(e.id), 40), crew: e.crew, ts: e.ts, kind: ['nota', 'checkin', 'actividad'].includes(e.kind) ? e.kind : 'nota', text: sstr(e.text, 2000),
      mood: n15(e.mood), stress: n15(e.stress), tags: list(e.tags, 24), syms: list(e.syms, 30), act: typeof e.act === 'string' && actById(e.act) ? e.act : null, img, where: 'local' };
  }).filter(Boolean);
}
function cleanAlerts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => {
    if (!x || typeof x !== 'object' || !CREW_IDS.has(x.from) || typeof x.ts !== 'number' || !x.id) return null;
    const acks = {};
    if (x.acks && typeof x.acks === 'object') for (const k of Object.keys(x.acks)) if (CREW_IDS.has(k) && typeof x.acks[k] === 'number') acks[k] = x.acks[k];
    return { id: sstr(String(x.id), 40), from: x.from, ts: x.ts, level: x.level === 'emergency' ? 'emergency' : 'alert', dom: ['cuerpo', 'mente', 'otro'].includes(x.dom) ? x.dom : 'otro',
      guide: typeof x.guide === 'string' && GUIDES[x.guide] ? x.guide : null, reason: ['grave', 'continua', 'manual'].includes(x.reason) ? x.reason : 'manual',
      status: x.status === 'resuelta' ? 'resuelta' : 'activa', resolved: typeof x.resolved === 'number' ? x.resolved : null, title: sstr(x.title, 140), detail: sstr(x.detail, 300), acks, where: 'local' };
  }).filter(Boolean);
}
const Store = {
  entries: [], alerts: [], status: 'local', db: null, uid: null,
  entOk: false, entDenied: false, alrOk: false, alrDenied: false,
  _l: { entries: [], alerts: [] }, _c: { entries: [], alerts: [] },
  init() {
    this.loadLocal();
    this.merge();
    window.addEventListener('storage', (ev) => { if (ev.key === K_ENT || ev.key === K_ALR) { this.loadLocal(); this.merge(); } });
    this.connect();
  },
  loadLocal() { this._l.entries = cleanEntries(LS.get(K_ENT, [])); this._l.alerts = cleanAlerts(LS.get(K_ALR, [])); },
  saveLocal() {
    const ok = LS.set(K_ENT, this._l.entries.map(strip)) && LS.set(K_ALR, this._l.alerts.map(strip));
    if (!ok) notify({ type: 'sistema', level: 'watch', title: "Couldn't save on this device", body: "The browser won't allow saving or there's no space left. The entry will stay visible until you close the page." });
  },
  merge() {
    const ce = new Set(this._c.entries.map((e) => e.id)), ca = new Set(this._c.alerts.map((e) => e.id));
    this.entries = [...this._c.entries, ...this._l.entries.filter((e) => !ce.has(e.id))].sort((x, y) => y.ts - x.ts);
    this.alerts = [...this._c.alerts, ...this._l.alerts.filter((e) => !ca.has(e.id))].sort((x, y) => y.ts - x.ts);
    bus.emit('store');
  },
  get cloudEntries() { return this.entOk && !this.entDenied; },
  get cloudAlerts() { return this.alrOk && !this.alrDenied; },
  entRef() { return this.db.doc('data/users/' + this.uid + '/bitacora').collection('entradas'); },
  async connect() {
    const cl = window.claude;
    if (!cl || typeof cl.use !== 'function') return;
    let db = null, user = null;
    try { [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); } catch (e) { return; }
    if (!db) return;
    this.db = db; this.status = 'conectando'; bus.emit('store');
    const timer = setTimeout(() => { if (this.status === 'conectando') { this.status = 'sin-nube'; bus.emit('store'); } }, 10000);
    const up = () => { clearTimeout(timer); this.status = 'nube'; };
    const down = () => { clearTimeout(timer); if (!this.entOk && !this.alrOk) this.status = 'sin-nube'; };
    try {
      db.collection('alertas').orderBy('ts', 'desc').limit(40).onSnapshot((snap) => {
        up(); this.alrOk = true;
        this._c.alerts = cleanAlerts(snap.docs.map((d) => ({ ...d.data(), id: d.id }))).map((x) => ({ ...x, where: 'nube' }));
        this.merge();
      }, () => { this.alrOk = false; this._c.alerts = []; down(); this.merge(); });
    } catch (e) { down(); }
    try { this.uid = user ? await user.id() : null; } catch (e) { this.uid = null; }
    if (!this.uid) return;
    try {
      this.entRef().orderBy('ts', 'desc').limit(300).onSnapshot((snap) => {
        up(); this.entOk = true;
        this._c.entries = cleanEntries(snap.docs.map((d) => ({ ...d.data(), id: d.id }))).map((x) => ({ ...x, where: 'nube' }));
        this.merge();
      }, () => { this.entOk = false; this._c.entries = []; down(); this.merge(); });
    } catch (e) { down(); }
  },
  async addEntry(e) {
    if (this.cloudEntries) {
      try { await this.entRef().doc(e.id).set(strip(e)); return 'nube'; } catch (err) { if (err && err.code === 'invalid_argument') this.entDenied = true; }
    }
    this._l.entries.unshift({ ...e, where: 'local' });
    this.saveLocal(); this.merge();
    return 'local';
  },
  async delEntry(id) {
    const e = this.entries.find((x) => x.id === id);
    if (!e) return;
    if (e.where === 'nube') { try { await this.entRef().doc(id).delete(); } catch (err) { notify({ type: 'sistema', level: 'watch', title: "Couldn't delete the entry", body: 'Try again in a moment.' }); } return; }
    this._l.entries = this._l.entries.filter((x) => x.id !== id);
    this.saveLocal(); this.merge();
  },
  async addAlert(al) {
    if (this.cloudAlerts) {
      try { await this.db.collection('alertas').doc(al.id).set(strip(al)); return; } catch (err) { if (err && err.code === 'invalid_argument') this.alrDenied = true; }
    }
    this._l.alerts.unshift({ ...al, where: 'local' });
    this.saveLocal(); this.merge();
  },
  async updateAlert(id, patch) {
    const al = this.alerts.find((x) => x.id === id);
    if (!al) return;
    if (al.where === 'nube') {
      try { await this.db.collection('alertas').doc(id).update(patch); } catch (err) { notify({ type: 'sistema', level: 'watch', title: "Couldn't update the alert", body: 'Your access to this page may be read-only.' }); }
      return;
    }
    const i = this._l.alerts.findIndex((x) => x.id === id);
    if (i < 0) return;
    this._l.alerts[i] = { ...this._l.alerts[i], ...patch, acks: { ...this._l.alerts[i].acks, ...(patch.acks || {}) } };
    this.saveLocal(); this.merge();
  },
  async clearResolved() {
    const done = this.alerts.filter((x) => x.status === 'resuelta');
    for (const x of done.filter((y) => y.where === 'nube')) { try { await this.db.collection('alertas').doc(x.id).delete(); } catch (err) { /* no permission: it stays */ } }
    this._l.alerts = this._l.alerts.filter((x) => x.status !== 'resuelta');
    this.saveLocal(); this.merge();
  },
};

/* ===== Data startup and loop ===== */
function rebuildData() {
  CREW.forEach((a) => { H[a.id] = buildHistory(a); applyMeds(a); });
  CREW.forEach((a) => { M[a.id] = trainModel(a, settings.train); });
}
function initEngine() {
  rebuildData();
  CREW.forEach((a) => { RT[a.id] = newRuntime(a); evaluate(a, false); });
  rebuildChk();
  refreshInsights();
}
function tickAll() {
  const now = Date.now();
  if (dayKey(new Date()) !== H[CREW[0].id].today.key) { rebuildData(); refreshInsights(); }
  for (const a of CREW) evaluate(a, false);
  S.tickN++;
  if (S.tickN % 30 === 0) refreshInsights();
  S.state = computeState(S.profile);
  schedTick(now);
  bus.emit('tick');
}
function addEntry(e) {
  const full = { id: 'e' + uid(), crew: S.profile.id, ts: Date.now(), kind: 'nota', text: '', mood: null, stress: null, tags: [], syms: [], act: null, img: null, ...e };
  Store.addEntry(full);
  return full;
}
