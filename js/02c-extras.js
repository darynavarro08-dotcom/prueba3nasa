/* ===== Extras: blood pressure, glucose and radiation, space reference values,
   daily exercise routine and meditative activities. Loaded after the base content. ===== */

/* ----- Personal baselines for the new measurements (crew profiles without them get defaults) ----- */
const EXTRA_BASE = {
  amara: { sys: 106, dia: 67, glu: 88, rad: 27 },
  kenji: { sys: 108, dia: 69, glu: 92, rad: 29 },
  valentina: { sys: 104, dia: 66, glu: 86, rad: 26 },
  lucas: { sys: 112, dia: 72, glu: 94, rad: 30 },
};
CREW.forEach((c) => { c.base = { ...(EXTRA_BASE[c.id] || { sys: 108, dia: 69, glu: 90, rad: 28 }), ...c.base }; });

/* Daily values for the sample history (blood pressure, glucose, radiation dose rate in µSv/h) */
function extraDay(b, g, short) {
  const sys = b.sys + 2.2 * g() + short * 1.5;
  return { sys, dia: b.dia + 1.5 * g() + short, glu: b.glu + 3 * g(), rad: Math.max(8, b.rad + 2.5 * g()) };
}

/* ----- How a measurement was taken ----- */
const MED_STATES = { reposo: 'At rest', activity: 'During normal activities', ejercicio: 'Right after exercise' };

/* ----- Blood pressure categories (mmHg) ----- */
function bpCategory(sys, dia) {
  if (sys >= 180 || dia >= 120) return { code: 'bp_crisis', level: 'emergency', label: 'Hypertensive crisis' };
  if (sys >= 140 || dia >= 90) return { code: 'bp_h2', level: 'alert', label: 'Hypertension stage 2' };
  if (sys >= 130 || dia >= 80) return { code: 'bp_h1', level: 'watch', label: 'Hypertension stage 1' };
  if (sys >= 120) return { code: 'bp_elev', level: 'watch', label: 'Elevated' };
  if (sys < 80 || dia < 50) return { code: 'bp_low_severe', level: 'alert', label: 'Low (severe)' };
  if (sys < 90 || dia < 60) return { code: 'bp_low', level: 'watch', label: 'Low' };
  return { code: null, level: 'ok', label: 'Normal' };
}
const bpText = (v) => `${f0(v.sys)}/${f0(v.dia)} mmHg`;

const cndx = (guide, n, u, dec, s, fmt) => ({ ...cnd('cuerpo', guide, n, u, dec, s), fmt });
Object.assign(COND, {
  bp_crisis: cndx('bp_high', 'hypertensive crisis', 'mmHg', 0, 'Your blood pressure is dangerously high. Sit down, stay calm and follow the guide now.', bpText),
  bp_h2: cndx('bp_high', 'hypertension stage 2 range', 'mmHg', 0, 'Your blood pressure is 140/90 or more. Rest, measure again in 5 minutes and follow the guide.', bpText),
  bp_h1: cndx('bp_high', 'hypertension stage 1 range', 'mmHg', 0, 'Your blood pressure is a bit high (130-139 / 80-89). Rest and measure again.', bpText),
  bp_elev: cndx('bp_high', 'elevated blood pressure', 'mmHg', 0, 'Slightly above normal (120-129 / under 80). Rest and keep an eye on it.', bpText),
  bp_low: cndx('bp_low', 'low blood pressure', 'mmHg', 0, 'Below 90/60. It only matters if you feel dizzy or faint, so sit down and drink water.', bpText),
  bp_low_severe: cndx('bp_low', 'very low blood pressure', 'mmHg', 0, 'Your blood pressure is very low. Sit or lie down now and follow the guide.', bpText),
  glu_crit: cndx('glucose_high', 'very high blood glucose', 'mg/dL', 0, 'Your glucose is dangerously high. Follow the guide now and call the Medical Officer.'),
  glu_high: cndx('glucose_high', 'high blood glucose', 'mg/dL', 0, 'Your glucose is well above normal. Drink water, rest and follow the guide.'),
  glu_elev: cndx('glucose_high', 'blood glucose above normal', 'mg/dL', 0, 'Fasting glucose should be under 100. If you just ate, measure again before your next meal.'),
  glu_low: cndx('glucose_low', 'low blood glucose', 'mg/dL', 0, 'Your glucose is under 70. Take fast sugar now and follow the guide.'),
  glu_low_severe: cndx('glucose_low', 'very low blood glucose', 'mg/dL', 0, 'Your glucose is dangerously low. Take fast sugar and call for help now.'),
  rad_crit: cndx('radiation', 'very high radiation', 'µSv/h', 0, 'Radiation is far above the usual level. Go to the shelter area now and follow the guide.'),
  rad_high: cndx('radiation', 'high radiation', 'µSv/h', 0, 'Radiation is well above the usual level. Move to the shelter area and follow the guide.'),
  rad_elev: cndx('radiation', 'radiation above your usual level', 'µSv/h', 0, 'Slightly above the usual level. Check the radiation report from Mission Control.'),
  rr_low: cndx('respiracion_lenta', 'respiration below the usual range', 'br/min', 0, 'Adults usually breathe 12-20 times a minute. Count again for a full minute.'),
});

/* Conditions for the new measurements. Blood pressure after exercise is not judged. */
function extraConds(v, state) {
  const out = [], add = (code, level, ind, val) => out.push({ code, level, ind, v: val, dom: 'cuerpo' });
  if (v.sys != null && v.dia != null && (state !== 'ejercicio' || v.sys >= 180 || v.dia >= 120)) {
    const c = bpCategory(v.sys, v.dia);
    if (c.code) add(c.code, c.level, 'bp', { sys: v.sys, dia: v.dia });
  }
  if (v.glu != null) {
    if (v.glu < 54) add('glu_low_severe', 'emergency', 'glu', v.glu);
    else if (v.glu < 70) add('glu_low', 'alert', 'glu', v.glu);
    else if (v.glu >= 300) add('glu_crit', 'emergency', 'glu', v.glu);
    else if (v.glu >= 180) add('glu_high', 'alert', 'glu', v.glu);
    else if (v.glu >= 126) add('glu_elev', 'watch', 'glu', v.glu);
  }
  if (v.rad != null) {
    if (v.rad >= 350) add('rad_crit', 'emergency', 'rad', v.rad);
    else if (v.rad >= 100) add('rad_high', 'alert', 'rad', v.rad);
    else if (v.rad >= 50) add('rad_elev', 'watch', 'rad', v.rad);
  }
  return out;
}

/* ----- Guides ----- */
Object.assign(GUIDES, {
  bp_high: { dom: 'cuerpo', ic: 'gauge', title: 'High blood pressure', when: 'Blood pressure of 130/80 mmHg or more. Alert from 140/90.',
    what: 'Your blood pressure is above the normal range (under 120/80). In space it can shift a little because of fluid changes, stress, salt and poor sleep. One high reading is not a diagnosis: check how you measured.',
    steps: [
      ['Sit down and rest', 'Sit with your back supported, feet anchored and arm at heart level. Stay quiet for 5 minutes.'],
      ['Check the cuff', 'Use the right cuff size on bare skin, no talking and no crossed legs.'],
      ['Measure again', 'Wait 5 minutes and measure again. Write down both values.'],
      ['Think about the cause', 'Caffeine, salty food, stress, pain or little sleep can all raise it.'],
      ['Breathe slowly', 'Inhale 4 seconds, exhale 6 seconds for two minutes.'],
      ['Tell the Medical Officer', 'If it stays at 140/90 or more after two readings, report it even if you feel well.'],
    ],
    urgent: ['180/120 mmHg or more.', 'Chest pain, shortness of breath or a sudden severe headache.', 'Blurred vision, confusion or weakness on one side.', 'Fainting or very fast or irregular heartbeats.'],
    avoid: ['Caffeine or energy drinks.', 'Intense exercise until it comes down.', 'Taking medicine without the Medical Officer knowing.'],
    helper: ['Help the person sit down and keep calm.', 'Measure their blood pressure every 10 minutes and write it down.', 'Call the Medical Officer and have the defibrillator (AED) nearby.'], tool: 'respirar' },
  bp_low: { dom: 'cuerpo', ic: 'gauge', title: 'Low blood pressure', when: 'Blood pressure under 90/60 mmHg. It only worries you if there are symptoms.',
    what: 'Your blood pressure is lower than usual. In microgravity fluids shift toward the head and the heart works differently, so some people run lower. It matters when you feel dizzy, faint or weak.',
    steps: [
      ['Sit or lie down', 'Anchor yourself and rest. Do not stand up or move quickly.'],
      ['Drink water', 'A glass of water, with a little salt if the Medical Officer has said it is fine.'],
      ['Measure again', 'Wait 5 minutes and repeat the measurement.'],
      ['Check for symptoms', 'Dizziness, blurred vision, cold sweat or nausea?'],
      ['Move slowly', 'Change position slowly and hold on to a handrail.'],
    ],
    urgent: ['Fainting or near-fainting.', 'Systolic pressure under 80 mmHg.', 'Chest pain or shortness of breath.', 'Confusion or very cold, pale, sweaty skin.'],
    avoid: ['Standing or floating up quickly.', 'Skipping meals or water.', 'Working alone on risky tasks.'],
    helper: ['Help the person lie down and raise their legs if there is gravity or a stable position.', 'Give small sips of water if they are awake.', 'Call the Medical Officer.'] },
  glucose_low: { dom: 'cuerpo', ic: 'drop2', title: 'Low blood glucose', when: 'Glucose under 70 mg/dL. Emergency under 54.',
    what: 'Your blood sugar is low. You may feel shaky, sweaty, hungry, irritable or confused. It is treated quickly with sugar.',
    steps: [
      ['Take fast sugar', '15 g: juice, glucose tablets or a spoonful of sugar or honey.'],
      ['Sit and rest', 'Stay still and anchored. Do not keep working.'],
      ['Measure again in 15 minutes', 'If it is still under 70, take another 15 g.'],
      ['Eat something', 'Once it is above 70, eat a snack with carbohydrates and protein.'],
      ['Tell the Medical Officer', 'Log what you ate and what you did before.'],
    ],
    urgent: ['Glucose under 54 mg/dL.', 'Confusion, you cannot swallow or you cannot be woken up.', 'Seizure or fainting.', 'It does not rise after two treatments.'],
    avoid: ['Exercising or doing risky tasks.', 'Waiting to see if it passes.', 'Giving food or drink to someone who is not fully awake.'],
    helper: ['Give sugar or juice only if the person is awake and can swallow.', 'Stay with them and measure again in 15 minutes.', 'If they are not responding, call the Medical Officer and Mission Control right away.'] },
  glucose_high: { dom: 'cuerpo', ic: 'drop2', title: 'High blood glucose', when: 'Glucose of 126 mg/dL or more when fasting. Alert from 180, emergency from 300.',
    what: 'Your blood sugar is above normal (70-99 mg/dL fasting, 100-125 slightly elevated). A recent meal, stress, an infection or lack of sleep can raise it.',
    steps: [
      ['Check how you measured', 'Wash and dry your hands first. If you ate in the last 2 hours, repeat fasting.'],
      ['Drink water', 'A glass of water every hour.'],
      ['Avoid sugary drinks and snacks', 'Choose water and protein for now.'],
      ['Light movement', 'Gentle stretching, not intense exercise, if you feel well.'],
      ['Measure again in 2 hours', 'Write down the values and tell the Medical Officer.'],
    ],
    urgent: ['Glucose of 300 mg/dL or more.', 'Intense thirst, frequent urination, nausea or vomiting.', 'Fruity breath, deep fast breathing or confusion.', 'Drowsiness or you feel very unwell.'],
    avoid: ['Sugary drinks and snacks.', 'Intense exercise if glucose is very high.', 'Ignoring it if you have diabetes.'],
    helper: ['Encourage the person to drink water.', 'Check their glucose again and write it down.', 'Call the Medical Officer if they are drowsy or confused.'] },
  radiation: { dom: 'cuerpo', ic: 'radiation', title: 'High radiation', when: 'Dose rate of 50 µSv/h or more. Alert from 100 µSv/h.',
    what: 'The radiation level at your location is above the usual (around 30 µSv/h). In space it rises during solar particle events and when the station crosses the South Atlantic Anomaly.',
    steps: [
      ['Check the source', 'Look at the dosimeter and the radiation alert from Mission Control.'],
      ['Go to the shelter area', 'Move to the best-protected module, near water or supplies, as in your training.'],
      ['Stay there', 'Remain until Mission Control says the level is back to normal.'],
      ['Tell the crew', 'Let your crewmates know so they can shelter too.'],
      ['Log your dose', 'Write down your dosimeter reading and the time in the log.'],
    ],
    urgent: ['350 µSv/h or more.', 'Nausea, vomiting or a headache after exposure.', 'The dosimeter alarm does not stop.', 'You cannot reach the shelter area.'],
    avoid: ['Spacewalks or work near the outer walls.', 'Sleeping in the least protected module.', 'Ignoring a Mission Control alert.'],
    helper: ['Help the person get to the shelter area.', 'Check their dosimeter and note the time.', 'Tell Mission Control and the Medical Officer.'] },
});
/* Existing profile notes now also open the new guides */
if (HX_BY.hipertension) HX_BY.hipertension.guides.push('bp_high', 'bp_low');
if (HX_BY.diabetes) HX_BY.diabetes.guides.push('glucose_low', 'glucose_high');

/* ----- Reference values in space (shown in Data and used for the tile footers) ----- */
const SPACE_REF = [
  { k: 'hr', name: 'Heart rate', ic: 'heart', how: 'Optical PPG sensor (smartwatch): LEDs light the skin and detect the blood-volume change with each heartbeat. Log it at rest and during normal activities separately.', space: 'Changes in space',
    lines: ['At rest: 50-70 bpm. Slightly below is not an anomaly.', 'Normal activities: higher is expected, up to about 100 bpm.'] },
  { k: 'bp', name: 'Blood pressure', ic: 'gauge', how: 'Digital or automatic cuff, no medical help needed.', space: 'Changes a little',
    lines: ['Normal: under 120/80 mmHg', 'Elevated: 120-129 / under 80', 'Hypertension stage 1: 130-139 / 80-89', 'Hypertension stage 2: 140/90 or more', 'Low: under 90/60 (only worrying with dizziness or fainting)'] },
  { k: 'spo2', name: 'Blood oxygen', ic: 'drop', how: 'Pulse oximeter, no medical help needed.', space: 'No significant change',
    lines: ['Normal: 95-100%', 'Under 94%: talk to the Medical Officer', 'Under 90%: medical emergency', 'Chronic lung disease: usual values may be a bit lower (92-95%)'] },
  { k: 'temp', name: 'Temperature', ic: 'thermo', how: 'Thermometer, no medical help needed.', space: 'Changes a little',
    lines: ['Normal: 36.1-37.2 °C (varies with time of day and where it is measured)', 'Low-grade fever: 37.3-38 °C', 'Fever: 38 °C or more', 'Hypothermia: under 35 °C'] },
  { k: 'rr', name: 'Respiration', ic: 'wind', how: 'Count breaths for one minute, no instruments needed.', space: 'Changes in space',
    lines: ['Adults: 12-20 breaths per minute', 'Under 12 or over 20, if it lasts, can point to a problem'] },
  { k: 'glu', name: 'Blood glucose', ic: 'drop2', how: 'Fingerstick glucometer.', space: 'Little change expected',
    lines: ['Fasting normal: 70-99 mg/dL', 'Slightly elevated: 100-125 mg/dL', 'High: 126 mg/dL or more (alert from 180)', 'Low: under 70 mg/dL (emergency under 54)'] },
  { k: 'rad', name: 'Radiation', ic: 'radiation', how: 'Personal dosimeter (dose rate in µSv/h).', space: 'Higher than on Earth',
    lines: ['Usual on the station: about 20-40 µSv/h', 'Watch: 50 µSv/h or more', 'Alert: 100 µSv/h or more', 'Emergency: 350 µSv/h or more'] },
];
const SPACE_FOOT = {
  hr: 'In space, at rest: 50-70 bpm', bp: 'Normal: under 120/80 mmHg', spo2: 'Normal: 95-100%', temp: 'Normal: 36.1-37.2 °C',
  rr: 'Adults: 12-20 per minute', glu: 'Fasting normal: 70-99 mg/dL', rad: 'Usual on the station: 20-40 µSv/h',
};

/* ----- Training: editable daily routine, stopwatch sessions and a load/performance logbook (per crew member, saved on this device) ----- */
const K_EX = 'sh.entreno.v1';
const EX_DEFAULT = [
  { id: 'warmup', t: 'Warm-up and stretching', min: 10 },
  { id: 'treadmill', t: 'Treadmill with harness (run or walk)', min: 30 },
  { id: 'cycle', t: 'Cycle ergometer', min: 20 },
  { id: 'resist', t: 'Resistance training (ARED)', min: 45 },
  { id: 'cooldown', t: 'Cool-down and stretching', min: 10 },
];
const PERF = [[1, 'Very poor'], [2, 'Below usual'], [3, 'As usual'], [4, 'Good'], [5, 'Excellent']];
const EX_STORE = LS.get(K_EX, {}) || {};
function trData(a) {
  const d = (EX_STORE[a.id] = EX_STORE[a.id] || {});
  if (!Array.isArray(d.routine)) d.routine = EX_DEFAULT.map((x) => ({ ...x }));
  d.done = d.done || {}; d.sessions = Array.isArray(d.sessions) ? d.sessions : []; d.log = Array.isArray(d.log) ? d.log : [];
  return d;
}
const trSave = () => LS.set(K_EX, EX_STORE);
const exList = (a) => trData(a).routine;
const exDone = (a) => { const d = trData(a), l = d.done[dayKey(new Date())]; return Array.isArray(l) ? l.filter((id) => d.routine.some((x) => x.id === id)) : []; };
function exToggle(a, id) {
  const d = trData(a), key = dayKey(new Date()), set = new Set(exDone(a));
  if (set.has(id)) set.delete(id); else set.add(id);
  d.done[key] = [...set];
  Object.keys(d.done).sort().slice(0, -30).forEach((k) => delete d.done[k]);
  trSave();
}
function exAdd(a, name, min) {
  const d = trData(a);
  d.routine.push({ id: 'x' + Date.now().toString(36), t: name, min });
  trSave();
}
function exRemove(a, id) {
  const d = trData(a);
  d.routine = d.routine.filter((x) => x.id !== id);
  trSave();
}
function sessionAdd(a, exId, sec) {
  const d = trData(a);
  d.sessions.push({ t: Date.now(), day: dayKey(new Date()), ex: exId, sec });
  d.sessions = d.sessions.slice(-300);
  trSave();
}
const trainedSec = (a) => trData(a).sessions.filter((x) => x.day === dayKey(new Date())).reduce((n, x) => n + x.sec, 0);
function logAdd(a, e) {
  const d = trData(a);
  d.log.push({ t: Date.now(), day: dayKey(new Date()), ...e });
  d.log = d.log.slice(-500);
  trSave();
}
function logDel(a, t) { const d = trData(a); d.log = d.log.filter((x) => x.t !== t); trSave(); }
function exHtml(a) {
  const list = exList(a), done = new Set(exDone(a)), total = list.reduce((n, x) => n + x.min, 0), mins = list.filter((x) => done.has(x.id)).reduce((n, x) => n + x.min, 0);
  if (!list.length) return '<p class="note">Your routine is empty. Add exercises in <a href="#entreno">Training</a>.</p>';
  return `<p class="note" style="margin-bottom:10px"><b>${done.size} of ${list.length}</b> done · ${mins} of ${total} min</p>
    <ol class="steps">${list.map((x) => `<li><button class="step" data-act="ex-toggle" data-id="${x.id}" aria-pressed="${done.has(x.id)}"><span><b>${esc(x.t)}</b>${x.min} min</span></button></li>`).join('')}</ol>
    <a class="btn btn-soft btn-sm" href="#entreno">Open Training: stopwatch and logbook</a>`;
}

/* Trend per exercise: compares the first and the latest logged days. A sustained drop in load or performance
   is an early sign of muscle or bone loss, which is why it's flagged. */
function loadTrend(a) {
  const byEx = {};
  trData(a).log.forEach((e) => { (byEx[e.ex] = byEx[e.ex] || []).push(e); });
  const out = [];
  Object.entries(byEx).forEach(([id, rows]) => {
    const days = {};
    rows.forEach((e) => { (days[e.day] = days[e.day] || []).push(e); });
    const ds = Object.keys(days).sort().map((k) => {
      const r = days[k], useKg = r.some((e) => e.kg > 0);
      return { day: k, t: r[0].t, v: mean(r.map((e) => (useKg ? e.kg : e.reps)).filter((x) => x != null && x > 0)), perf: mean(r.map((e) => e.perf)), useKg };
    }).filter((d) => isFinite(d.v));
    if (!ds.length) return;
    const name = (trData(a).routine.find((x) => x.id === id) || { t: rows[rows.length - 1].name }).t;
    const unit = ds[ds.length - 1].useKg ? 'kg' : 'reps', n = ds.length, k = Math.min(3, Math.floor(n / 2));
    let change = null, level = 'ok', note = 'Log at least 4 different days to see a trend.', perfDrop = 0;
    if (k >= 2) {
      const b = mean(ds.slice(0, k).map((d) => d.v)), r = mean(ds.slice(-k).map((d) => d.v));
      change = (r - b) / b;
      perfDrop = mean(ds.slice(0, k).map((d) => d.perf)) - mean(ds.slice(-k).map((d) => d.perf));
      if (change <= -0.2 || perfDrop >= 1.5) level = 'alert';
      else if (change <= -0.1 || perfDrop >= 1) level = 'watch';
      note = level === 'ok' ? 'Stable or improving.' : `Load ${change < 0 ? 'down ' + Math.round(-change * 100) + '%' : 'steady'}${perfDrop >= 1 ? ', performance lower than before' : ''}. Tell the Medical Officer if it continues.`;
    }
    out.push({ id, name, unit, days: ds, change, level, note, last: ds[ds.length - 1] });
  });
  return out;
}

/* ----- Meditative activities: drawing and sounds (shown as their own filters) ----- */
const GROUPS = { drawing: 'Meditative drawing', sound: 'Meditative sounds' };
ACTS.push(
  { id: 'trazos', cat: 'calma', group: 'drawing', min: 5, t: 'Release strokes', d: 'If you feel frustration or anger, open a digital sketchpad or use pencil and paper and draw straight lines, zigzags or scribbles, pressing hard until you feel the tension drop.', tool: 'dibujo', prompt: 'strong straight lines, zigzags or scribbles, pressing hard until the tension drops', tags: ['dibujo'] },
  { id: 'espirales', cat: 'calma', group: 'drawing', min: 5, t: 'Continuous spirals', d: 'Draw a spiral from the center outward without lifting the tip, keeping a slow rhythm in sync with your breathing.', tool: 'dibujo', prompt: 'a spiral from the center outward, without lifting the pen, in time with your breathing', tags: ['dibujo'] },
  { id: 'orbitas', cat: 'calma', group: 'drawing', min: 7, t: 'Dot orbits', d: 'Draw a central circle and surround it with small dots or concentric rings, focusing only on keeping the same distance between each stroke.', tool: 'dibujo', prompt: 'a central circle surrounded by small dots or concentric rings, all at the same distance', tags: ['dibujo'] },
  { id: 'contornos', cat: 'crear', group: 'drawing', min: 5, t: 'Contour mapping', d: 'Pick an object, floating or fixed, in the cabin (a carabiner, a tool) and draw it without looking at the paper or lifting the pencil, following only its edges with your eyes.', tool: 'dibujo', prompt: 'an object from the cabin, following only its edges with your eyes and without lifting the pencil', tags: ['dibujo'] },
  { id: 'redes', cat: 'calma', group: 'drawing', min: 8, t: 'Calm networks', d: 'Draw curved lines that cross each other to form cells and fill each space with simple repeating patterns (stripes, dots, grids).', tool: 'dibujo', prompt: 'curved lines that cross to form cells, each filled with a simple repeating pattern', tags: ['dibujo'] },
  { id: 'paisaje', cat: 'calma', group: 'sound', min: 10, t: 'Soundscape of Earth', d: 'Put on noise-canceling headphones and play a track of rain, wind in the trees or ocean waves, closing your eyes to imagine the setting.', tags: ['música'] },
  { id: 'tarareo', cat: 'calma', group: 'sound', min: 3, t: 'Resonance humming', d: 'Inhale deeply and exhale making a soft, low sound with your throat closed ("mmm"), feeling the vibration in your chest and head.' },
  { id: 'silencio', cat: 'calma', group: 'sound', min: 5, t: 'Active silence', d: 'Put in earplugs or isolating headphones without music and focus for five minutes only on the sound of your own breathing and your heartbeat.' },
);
