/* ===== Profile and health record =====
   Age, weight, height, sex, and medical history for each crew member. Stored on this device
   and used to adjust thresholds, guides, and the care plan. Also allows creating new profiles. */
const K_FICHA = 'sh.fichas.v1', K_CUSTOM = 'sh.tripulantes.v1';

const HX = [
  { k: 'asma', label: 'Asthma or breathing problems', guides: ['respiracion', 'respiracion_lenta', 'oxigeno'], tip: 'Your health record notes a breathing problem: if you have rescue medication in the medical kit, use it as directed and tell the Medical Officer right away.' },
  { k: 'hipertension', label: 'High blood pressure', guides: ['taquicardia'], tip: 'Your health record notes high blood pressure: tell the Medical Officer early if your heart rate doesn\'t come down, even if you feel fine.' },
  { k: 'cardiopatia', label: 'Heart condition', guides: ['taquicardia', 'bradicardia'], tip: 'Your health record notes a heart condition: don\'t wait to see if it passes. Tell the Medical Officer from the start.' },
  { k: 'diabetes', label: 'Diabetes', guides: ['fiebre', 'sueno'], tip: 'Your health record notes diabetes: fever and lack of sleep affect glucose. Check it more often.' },
  { k: 'alergias', label: 'Allergies', guides: ['respiracion', 'oxigeno'], tip: 'Your health record notes allergies: check for a possible trigger (food, dust, a new product) and tell the Medical Officer.' },
  { k: 'migrana', label: 'Migraines', guides: ['fiebre', 'sueno'], tip: 'Your health record notes migraines: lack of sleep and dehydration are common triggers. Take care of both today.' },
  { k: 'ansiedad', label: 'Anxiety or panic attacks', guides: ['ansiedad', 'animo'], tip: 'Your health record notes prior anxiety: use the techniques that have worked for you before, and don\'t wait to talk to someone.' },
  { k: 'depresion', label: 'Depression', guides: ['animo'], tip: 'Your health record notes prior depression: if your mood stays low for several days in a row, talk to the mission psychologist as soon as possible.' },
  { k: 'insomnio', label: 'Sleep problems', guides: ['sueno'], tip: 'Your health record notes sleep problems: keep a regular schedule and speak up if you sleep badly several nights in a row.' },
  { k: 'espalda', label: 'Back pain or injuries', guides: [], tip: '' },
];
const HX_BY = Object.fromEntries(HX.map((h) => [h.k, h]));
const LIKES = [['dibujo', 'Drawing'], ['música', 'Music'], ['plantas', 'Plants'], ['lectura', 'Reading'], ['ajedrez', 'Games'], ['fotografía', 'Photography'], ['cocina', 'Cooking'], ['ejercicio', 'Exercise'], ['cine', 'Movies'], ['escritura', 'Writing']];
const SEXES = [['f', 'Female'], ['m', 'Male'], ['o', 'Other / prefer not to say']];

const FICHA_DEF = {
  amara: { age: 34, weight: 62, height: 168, sex: 'f', hx: ['alergias'], note: '' },
  kenji: { age: 41, weight: 74, height: 176, sex: 'm', hx: [], note: '' },
  valentina: { age: 45, weight: 64, height: 170, sex: 'f', hx: ['migrana'], note: '' },
  lucas: { age: 37, weight: 80, height: 182, sex: 'm', hx: ['ansiedad'], note: '' },
};

const num = (v, a, b) => (typeof v === 'number' && isFinite(v) && v >= a && v <= b ? v : null);
function cleanFicha(f) {
  if (!f || typeof f !== 'object') return null;
  const age = num(f.age, 18, 80), weight = num(f.weight, 35, 200), height = num(f.height, 130, 220);
  if (age == null || weight == null || height == null) return null;
  return {
    age, weight, height, sex: SEXES.some((s) => s[0] === f.sex) ? f.sex : 'o',
    hx: Array.isArray(f.hx) ? f.hx.filter((k) => HX_BY[k]) : [],
    likes: Array.isArray(f.likes) ? f.likes.filter((k) => LIKES.some((l) => l[0] === k)) : null,
    note: typeof f.note === 'string' ? f.note.slice(0, 400) : '',
  };
}

/* User-created crew members: added to CREW before the engine starts */
function cleanCustom(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 6).map((c) => {
    if (!c || typeof c !== 'object' || !/^c[a-z0-9]{4,20}$/.test(c.id || '') || typeof c.name !== 'string' || !c.name.trim() || !c.base) return null;
    const b = c.base, nb = (v, a, z, d) => num(v, a, z) ?? d;
    const name = c.name.trim().slice(0, 40);
    return { id: c.id, name, short: name.split(/\s+/)[0], role: typeof c.role === 'string' && c.role.trim() ? c.role.trim().slice(0, 40) : 'Crew Member',
      ini: name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join(''), story: 'estable', need: 7.5, exAt: 1000, custom: true,
      base: { temp: nb(b.temp, 35, 38, 36.6), hr: nb(b.hr, 40, 90, 62), rr: nb(b.rr, 8, 20, 14), spo2: nb(b.spo2, 93, 100, 98), sleep: nb(b.sleep, 5, 9, 7.5), mood: nb(b.mood, 1, 5, 4), stress: nb(b.stress, 1, 5, 2.2) }, likes: [] };
  }).filter(Boolean);
}
cleanCustom(LS.get(K_CUSTOM, [])).forEach((c) => { if (!CREW.some((x) => x.id === c.id)) CREW.push(c); });

const FICHAS = (() => {
  const saved = LS.get(K_FICHA, {}) || {}, out = {};
  CREW.forEach((c) => { out[c.id] = cleanFicha(saved[c.id]) || (FICHA_DEF[c.id] ? { ...FICHA_DEF[c.id], likes: null } : { age: 35, weight: 70, height: 172, sex: 'o', hx: [], likes: null, note: '' }); });
  return out;
})();
CREW.forEach((c) => { const l = FICHAS[c.id].likes; if (l) c.likes = l; });
const ficha = (a) => FICHAS[a.id];
const saveFichas = () => LS.set(K_FICHA, FICHAS);
const bmi = (f) => f.weight / ((f.height / 100) ** 2);
const hasHx = (a, k) => ficha(a).hx.includes(k);
/* Age-estimated max heart rate: used to decide when a high heart rate during exercise is too high */
const hrCeil = (a) => clamp(220 - ficha(a).age + 5, 150, 200);
const hxTips = (a, guideId) => ficha(a).hx.map((k) => HX_BY[k]).filter((h) => h && h.tip && h.guides.includes(guideId)).map((h) => h.tip);

function hxFocos(a) {
  const out = [];
  if (hasHx(a, 'ansiedad')) out.push({ id: 'hx-ansiedad', cats: ['calma'], title: 'Look after your anxiety', why: 'Your health record notes prior anxiety. On a long mission it can come back, especially with little sleep.',
    todo: ['Practice slow breathing once a day, even when you feel calm.', 'If you notice tension rising, tell someone you trust early.'] });
  if (hasHx(a, 'depresion')) out.push({ id: 'hx-depresion', cats: ['conectar', 'sentido'], title: 'Look after your mood, given your history', why: 'Your health record notes prior depression, so we watch mood changes more closely.',
    todo: ['Keep a routine and talk with the crew every day.', 'If your mood stays low for several days in a row, request a call with the mission psychologist.'] });
  if (hasHx(a, 'insomnio')) out.push({ id: 'hx-insomnio', cats: ['calma'], title: 'Protect your sleep', why: 'Your health record notes prior sleep problems.',
    todo: ['Keep a fixed bedtime and dim the lights at night.', 'Avoid screens and caffeine in the last hours of the day.'] });
  if (hasHx(a, 'espalda')) out.push({ id: 'hx-espalda', cats: ['mover'], title: 'Look after your back', why: 'Your health record notes back pain or prior injuries. In microgravity the spine lengthens and can hurt more.',
    todo: ['Gentle back stretches twice a day.', 'Tell someone if the pain increases or spreads down your legs.'] });
  return out.slice(0, 2);
}
