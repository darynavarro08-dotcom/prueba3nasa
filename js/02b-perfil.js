/* ===== Perfil y ficha de salud =====
   Edad, peso, estatura, sexo e historial médico de cada tripulante. Se guardan en este dispositivo
   y se usan para ajustar los umbrales, las guías y el plan de cuidado. También permite crear perfiles nuevos. */
const K_FICHA = 'sh.fichas.v1', K_CUSTOM = 'sh.tripulantes.v1';

const HX = [
  { k: 'asma', label: 'Asma o problemas respiratorios', guides: ['respiracion', 'respiracion_lenta', 'oxigeno'], tip: 'Tu ficha indica un problema respiratorio: si tienes tu medicación de rescate en el botiquín, úsala según te indicaron y avisa al oficial médico sin esperar.' },
  { k: 'hipertension', label: 'Hipertensión', guides: ['taquicardia'], tip: 'Tu ficha indica hipertensión: avisa al oficial médico antes si el pulso no baja, aunque te sientas bien.' },
  { k: 'cardiopatia', label: 'Problema del corazón', guides: ['taquicardia', 'bradicardia'], tip: 'Tu ficha indica un antecedente cardíaco: no esperes a ver si pasa. Avisa al oficial médico desde el principio.' },
  { k: 'diabetes', label: 'Diabetes', guides: ['fiebre', 'sueno'], tip: 'Tu ficha indica diabetes: la fiebre y la falta de sueño alteran la glucosa. Mídela con más frecuencia.' },
  { k: 'alergias', label: 'Alergias', guides: ['respiracion', 'oxigeno'], tip: 'Tu ficha indica alergias: revisa si pudo haber un desencadenante (alimento, polvo, un producto nuevo) y cuéntaselo al oficial médico.' },
  { k: 'migrana', label: 'Migrañas', guides: ['fiebre', 'sueno'], tip: 'Tu ficha indica migrañas: la falta de sueño y la deshidratación son desencadenantes frecuentes. Cuídalos hoy.' },
  { k: 'ansiedad', label: 'Ansiedad o ataques de pánico', guides: ['ansiedad', 'animo'], tip: 'Tu ficha indica ansiedad previa: usa las técnicas que ya te han funcionado y no esperes para hablar con alguien.' },
  { k: 'depresion', label: 'Depresión', guides: ['animo'], tip: 'Tu ficha indica depresión previa: si el ánimo baja varios días seguidos, habla con el psicólogo de misión cuanto antes.' },
  { k: 'insomnio', label: 'Problemas de sueño', guides: ['sueno'], tip: 'Tu ficha indica problemas de sueño: mantén horarios fijos y avisa si pasan varias noches seguidas durmiendo mal.' },
  { k: 'espalda', label: 'Dolor de espalda o lesiones', guides: [], tip: '' },
];
const HX_BY = Object.fromEntries(HX.map((h) => [h.k, h]));
const LIKES = [['dibujo', 'Dibujo'], ['música', 'Música'], ['plantas', 'Plantas'], ['lectura', 'Lectura'], ['ajedrez', 'Juegos'], ['fotografía', 'Fotografía'], ['cocina', 'Cocina'], ['ejercicio', 'Ejercicio'], ['cine', 'Cine'], ['escritura', 'Escritura']];
const SEXES = [['f', 'Femenino'], ['m', 'Masculino'], ['o', 'Otro / prefiero no decirlo']];

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

/* Tripulantes creados por el usuario: se añaden a CREW antes de que arranque el motor */
function cleanCustom(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 6).map((c) => {
    if (!c || typeof c !== 'object' || !/^c[a-z0-9]{4,20}$/.test(c.id || '') || typeof c.name !== 'string' || !c.name.trim() || !c.base) return null;
    const b = c.base, nb = (v, a, z, d) => num(v, a, z) ?? d;
    const name = c.name.trim().slice(0, 40);
    return { id: c.id, name, short: name.split(/\s+/)[0], role: typeof c.role === 'string' && c.role.trim() ? c.role.trim().slice(0, 40) : 'Tripulante',
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
/* Pulso máximo estimado por edad: sirve para decidir cuándo un pulso alto durante el ejercicio ya es demasiado */
const hrCeil = (a) => clamp(220 - ficha(a).age + 5, 150, 200);
const hxTips = (a, guideId) => ficha(a).hx.map((k) => HX_BY[k]).filter((h) => h && h.tip && h.guides.includes(guideId)).map((h) => h.tip);

function hxFocos(a) {
  const out = [];
  if (hasHx(a, 'ansiedad')) out.push({ id: 'hx-ansiedad', cats: ['calma'], title: 'Cuidar tu ansiedad', why: 'Tu ficha indica ansiedad previa. En una misión larga puede reaparecer, sobre todo con poco sueño.',
    todo: ['Practica respiración lenta una vez al día, aunque estés tranquilo.', 'Si notas que sube la tensión, dilo pronto a alguien de confianza.'] });
  if (hasHx(a, 'depresion')) out.push({ id: 'hx-depresion', cats: ['conectar', 'sentido'], title: 'Cuidar tu ánimo según tu historial', why: 'Tu ficha indica depresión previa. Por eso vigilamos con más atención los cambios de ánimo.',
    todo: ['Mantén horarios y una conversación diaria con la tripulación.', 'Si el ánimo está bajo varios días seguidos, pide una conferencia con el psicólogo de misión.'] });
  if (hasHx(a, 'insomnio')) out.push({ id: 'hx-insomnio', cats: ['calma'], title: 'Proteger tu sueño', why: 'Tu ficha indica problemas de sueño previos.',
    todo: ['Horario de dormir fijo y luz tenue por la noche.', 'Evita pantallas y cafeína en las últimas horas del día.'] });
  if (hasHx(a, 'espalda')) out.push({ id: 'hx-espalda', cats: ['mover'], title: 'Cuidar tu espalda', why: 'Tu ficha indica dolor de espalda o lesiones previas. En microgravedad la columna se alarga y puede doler más.',
    todo: ['Estiramientos suaves de espalda dos veces al día.', 'Avisa si el dolor aumenta o baja a las piernas.'] });
  return out.slice(0, 2);
}
