/* ===== Hojas (diálogos): perfil, ficha, guías, emergencia, SOS, dibujo y respiración ===== */
const sheetEl = () => $('#sheet');
function openSheet(kind, o) {
  const d = sheetEl();
  stopBreath();
  S.sheet = kind;
  d.innerHTML = `<div class="sheet-in"><div class="sheet-h"><span class="banner-ic lvl-${o.lv || 'ok'}">${icon(o.ic || 'info')}</span><h2 id="sheet-title">${esc(o.title)}</h2>${closeBtn}</div>
    <div class="sheet-b">${o.body}</div>${o.foot ? `<div class="sheet-f">${o.foot}</div>` : ''}</div>`;
  if (!d.open) d.showModal();
  $('.sheet-b', d).scrollTop = 0;
}
function closeSheet() {
  const d = sheetEl();
  if (d.open) d.close();
  S.sheet = null;
  stopBreath();
}
const footClose = (label = 'Cerrar') => `<button class="btn btn-ghost" data-act="sheet-close">${label}</button>`;
const bullets = (arr) => `<ul>${arr.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

/* ----- Guías y emergencias ----- */
function guideHtml(g, id, helper) {
  const tips = hxTips(S.profile, id);
  const steps = helper
    ? `<div class="box"><h3>Cómo ayudar</h3>${bullets(g.helper)}</div>`
    : `<ol class="steps">${g.steps.map(([t, d]) => `<li><button class="step" data-act="step" aria-pressed="false"><span><b>${esc(t)}</b>${esc(d)}</span></button></li>`).join('')}</ol>`;
  return `<p>${esc(g.what)}</p>${steps}
    <div class="box urgent"><h3>Pide ayuda de inmediato si…</h3>${bullets(g.urgent)}</div>
    ${helper ? '' : `<div class="box"><h3>Evita</h3>${bullets(g.avoid)}</div>`}
    ${tips.length ? `<div class="box"><h3>Ten en cuenta tu historial</h3>${bullets(tips)}</div>` : ''}`;
}
const guideFoot = (g, id, helper) => `${helper || !g.tool ? '' : `<button class="btn btn-soft" data-act="breathe" data-id="${id}">${icon('wind')}Respirar con guía</button>`}
  ${helper ? '' : '<button class="btn btn-crit" data-act="sos">' + icon('send') + 'Avisar a la tripulación</button>'}${footClose()}`;
function openGuide(id, helper = false) {
  const g = GUIDES[id];
  if (!g) return;
  openSheet('guide', { ic: g.ic, lv: g.dom === 'mente' ? 'ok' : 'watch', title: helper ? `Cómo ayudar: ${low(g.title)}` : g.title, body: guideHtml(g, id, helper), foot: guideFoot(g, id, helper) });
}
function openEmergency() {
  const rt = RT[S.profile.id];
  if (!rt.ep) { openSos(); return; }
  const top = rt.ep.top, c = COND[top.code], g = GUIDES[c.guide];
  openSheet('emer', { ic: LEVELS[top.level].ic, lv: top.level, title: `${LEVELS[top.level].label}: ${cap(c.n)}`,
    body: `<div class="box"><div id="em-crew"></div></div><p><b>${esc(c.s)}</b></p>${guideHtml(g, c.guide, false)}`, foot: guideFoot(g, c.guide, false) });
  renderEmCrew();
}

/* ----- Avisar a la tripulación a mano ----- */
const SOS_KINDS = {
  cuerpo: { label: 'Me siento mal físicamente', hint: 'Fiebre, mareo, dolor, falta de aire…' },
  mente: { label: 'Necesito apoyo emocional', hint: 'Ansiedad, tristeza, un mal momento. Pedir compañía es valiente.' },
  grave: { label: 'Es una emergencia: necesito ayuda ya', hint: 'Avisa con la máxima prioridad.' },
};
function sosOptions() {
  return Object.entries(SOS_KINDS).map(([k, o]) => `<button class="opt" role="radio" aria-checked="${S.sosKind === k}" data-act="sos-kind" data-k="${k}"><span class="tile-ic${k === 'mente' ? ' mind' : ''}">${icon(k === 'mente' ? 'smile' : k === 'grave' ? 'octagon' : 'pulse')}</span><span><b>${o.label}</b><small>${o.hint}</small></span></button>`).join('');
}
function openSos(kind) {
  S.sosKind = SOS_KINDS[kind] ? kind : 'cuerpo';
  openSheet('sos', { ic: 'send', lv: 'alert', title: 'Pedir ayuda a la tripulación',
    body: `<p>Tus compañeros recibirán un aviso con los pasos para ayudarte. No hace falta estar seguro de que sea grave.</p>
      <div class="opts" role="radiogroup" aria-label="Qué necesitas" id="sos-opts">${sosOptions()}</div>
      <label class="lbl" for="sos-note">Quieres contar algo más (opcional)</label><textarea id="sos-note" rows="2" maxlength="200"></textarea>
      <p class="hint">Si es un peligro para la nave (fuego, fuga de aire), usa también la alarma del módulo.</p>`,
    foot: `<button class="btn btn-ghost" data-act="go" data-id="guias">Ver guías</button>${footClose('Cancelar')}<button class="btn btn-crit" data-act="sos-send">${icon('send')}Enviar aviso</button>` });
}
function sendManualAlert() {
  const a = S.profile, rt = RT[a.id], k = S.sosKind || 'cuerpo', ep = rt.ep;
  const note = ($('#sos-note') || { value: '' }).value.trim().slice(0, 200);
  const cfg = {
    cuerpo: { level: 'alert', dom: 'cuerpo', guide: ep ? COND[ep.top.code].guide : null, title: `${a.short} necesita ayuda médica` },
    mente: { level: 'alert', dom: 'mente', guide: 'animo', title: `${a.short} necesita compañía` },
    grave: { level: 'emergency', dom: 'otro', guide: ep ? COND[ep.top.code].guide : null, title: `${a.short}: emergencia, necesita ayuda ya` },
  }[k];
  const al = { id: 'a' + uid(), from: a.id, level: cfg.level, dom: cfg.dom, guide: cfg.guide, reason: 'manual', ts: Date.now(), status: 'activa', resolved: null, acks: {},
    title: cfg.title, detail: note || 'Aviso enviado por el propio tripulante.' };
  if (ep && !ep.sent && k !== 'mente') { ep.sent = al.id; ep.sentLevel = LV[ep.top.level]; ep.count = null; }
  Store.addAlert(al);
  closeSheet();
  notify({ type: 'equipo', level: al.level, title: 'Tripulación avisada', body: 'Tus compañeros recibieron tu aviso y los pasos para ayudarte.', act: { kind: 'view', id: 'equipo', label: 'Ver tripulación' } });
  renderAlertSlot();
}

/* ----- Perfil, ficha de salud y perfiles nuevos ----- */
const fichaLine = (a) => { const f = ficha(a); return `${f.age} años · ${f.weight} kg · ${f.height} cm · IMC ${f1(bmi(f))}`; };
function openPerfil() {
  const me = S.profile.id;
  openSheet('perfil', { ic: 'users', title: '¿Quién eres?',
    body: `<div class="opts" role="radiogroup" aria-label="Tripulante">${CREW.map((c) => `<button class="opt" role="radio" aria-checked="${c.id === me}" data-act="set-profile" data-id="${c.id}">${avatar(c, c.id === me)}<span><b>${esc(c.name)}</b><small>${esc(c.role)} · ${esc(fichaLine(c))}</small></span></button>`).join('')}</div>
      <div class="box"><h3>Ficha de salud de ${esc(S.profile.short)}</h3><p class="hint">${esc(fichaLine(S.profile))}${ficha(S.profile).hx.length ? '<br>Historial: ' + esc(ficha(S.profile).hx.map((k) => HX_BY[k].label).join(', ')) : ''}</p>
        <div class="row"><button class="btn btn-soft btn-sm" data-act="ficha-edit">${icon('pencil')}Editar mi ficha</button><button class="btn btn-primary btn-sm" data-act="ficha-new">${icon('plus')}Crear un perfil nuevo</button></div></div>`,
    foot: footClose() });
}
const chipSet = (act, key, items, on, radio) => items.map(([k, l]) => `<button type="button" class="chip" ${radio ? 'role="radio" aria-checked' : 'aria-pressed'}="${on(k)}" data-act="${act}" data-k="${esc(k)}">${esc(l)}</button>`).join('');
function openFicha(mode) {
  const a = S.profile, isNew = mode === 'new';
  const src = isNew ? { age: '', weight: '', height: '', sex: '', hx: [], likes: [], note: '' } : { ...ficha(a), likes: ficha(a).likes || a.likes };
  S.form = { mode, sex: src.sex, hx: new Set(src.hx), likes: new Set(src.likes) };
  const fld = (id, label, v, ph) => `<div><label class="lbl" for="${id}">${label}</label><input type="text" inputmode="decimal" id="${id}" value="${esc(v)}" placeholder="${ph}" autocomplete="off"></div>`;
  openSheet('ficha', { ic: 'user', title: isNew ? 'Crear mi perfil' : `Ficha de salud de ${a.short}`,
    body: `<p>Stellar Health usa estos datos para ajustar tus umbrales, tus guías y tu plan de cuidado. Se guardan solo en este dispositivo.</p>
      ${isNew ? `<div><label class="lbl" for="f-name">Nombre</label><input type="text" id="f-name" maxlength="40" autocomplete="off"></div><div><label class="lbl" for="f-role">Rol en la misión (opcional)</label><input type="text" id="f-role" maxlength="40" placeholder="Tripulante" autocomplete="off"></div>` : ''}
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${fld('f-age', 'Edad', src.age, 'años')}${fld('f-weight', 'Peso (kg)', src.weight, 'kg')}${fld('f-height', 'Estatura (cm)', src.height, 'cm')}</div>
      <div><p class="lbl" id="l-sex">Sexo</p><div class="chips" role="radiogroup" aria-labelledby="l-sex" id="f-sex">${chipSet('f-sex', 'sex', SEXES, (k) => src.sex === k, true)}</div></div>
      <div><p class="lbl" id="l-hx">Historial médico: marca lo que corresponda</p><div class="chips" role="group" aria-labelledby="l-hx">${chipSet('f-hx', 'hx', HX.map((h) => [h.k, h.label]), (k) => src.hx.includes(k))}</div></div>
      <div><label class="lbl" for="f-note">Otros padecimientos, alergias o medicación (opcional)</label><textarea id="f-note" rows="2" maxlength="400">${esc(src.note)}</textarea></div>
      <div><p class="lbl" id="l-like">Qué te gusta hacer (para elegir actividades que te animen)</p><div class="chips" role="group" aria-labelledby="l-like">${chipSet('f-like', 'likes', LIKES, (k) => src.likes.includes(k))}</div></div>
      <p class="hint" id="f-err" role="alert"></p>
      <p class="hint">Esta información no sustituye una valoración médica. El oficial médico de la misión decide cualquier tratamiento.</p>`,
    foot: `${!isNew && a.custom ? `<button class="btn btn-ghost" data-act="ficha-del">${icon('trash')}Eliminar perfil</button>` : ''}<button class="btn btn-ghost" data-act="perfil">Volver</button><button class="btn btn-primary" data-act="ficha-save">${icon('check')}Guardar</button>` });
}
const numField = (id) => parseFloat(String($(id).value).replace(',', '.'));
function saveFicha() {
  const err = (m) => { setText('#f-err', m); };
  const isNew = S.form.mode === 'new';
  const f = cleanFicha({ age: numField('#f-age'), weight: numField('#f-weight'), height: numField('#f-height'), sex: S.form.sex || 'o', hx: [...S.form.hx], likes: [...S.form.likes], note: $('#f-note').value.trim() });
  if (!f) return err('Revisa los datos: edad entre 18 y 80 años, peso entre 35 y 200 kg y estatura entre 130 y 220 cm.');
  if (!S.form.sex) return err('Elige una opción de sexo.');
  if (!isNew) {
    FICHAS[S.profile.id] = f;
    if (f.likes) S.profile.likes = f.likes;
    saveFichas();
    closeSheet();
    notify({ type: 'sistema', level: 'ok', title: 'Ficha guardada', body: 'Stellar Health la tendrá en cuenta en tus umbrales, guías y plan de cuidado.' });
    S.state = computeState(S.profile);
    renderView();
    return;
  }
  const name = $('#f-name').value.trim();
  if (name.length < 2) return err('Escribe tu nombre.');
  const c = cleanCustom([{
    id: 'c' + uid().slice(-10), name, role: $('#f-role').value.trim(),
    base: { temp: 36.6, hr: 60 + (f.sex === 'f' ? 3 : 0) + (f.age >= 50 ? 2 : 0) - (f.likes && f.likes.includes('ejercicio') ? 3 : 0), rr: 14, spo2: f.hx.includes('asma') ? 97 : 98, sleep: 7.5, mood: 4, stress: 2 + (f.hx.includes('ansiedad') ? 0.3 : 0) },
  }])[0];
  if (!c) return err('No se pudo crear el perfil. Revisa los datos.');
  const list = LS.get(K_CUSTOM, []);
  list.push(c);
  FICHAS[c.id] = f;
  if (!(LS.set(K_CUSTOM, list) && saveFichas())) return err('No se pudo guardar en este dispositivo.');
  settings.profile = c.id;
  saveSettings();
  location.reload();
}
function deleteProfile() {
  const a = S.profile;
  if (!a.custom || !window.confirm(`¿Eliminar el perfil de ${a.short}? Esta acción no se puede deshacer.`)) return;
  LS.set(K_CUSTOM, LS.get(K_CUSTOM, []).filter((c) => c.id !== a.id));
  delete FICHAS[a.id];
  saveFichas();
  settings.profile = CREW[0].id;
  saveSettings();
  location.reload();
}
function openWelcome() {
  LS.set('sh.bienvenida.v1', 1);
  openSheet('welcome', { ic: 'star', title: 'Bienvenido a Stellar Health',
    body: `<p><b>Salud más allá de la Tierra.</b> Stellar Health sigue tu cuerpo y tu ánimo con los datos del sensor de actigrafía, te avisa antes de que algo se convierta en problema y te dice qué hacer si ocurre.</p>
      <div class="box"><h3>Para empezar</h3>${bullets(['Crea tu perfil con tu edad, peso, estatura, sexo e historial médico.', 'O explora con la tripulación de ejemplo y el panel Demo para simular alertas.'])}</div>
      <p class="hint">Es un prototipo educativo con datos simulados. No sustituye al médico de vuelo.</p>`,
    foot: `${footClose('Explorar con la tripulación de ejemplo')}<button class="btn btn-primary" data-act="ficha-new">${icon('user')}Crear mi perfil</button>` });
}

/* ----- Respiración guiada ----- */
let breathT = 0;
function stopBreath() { clearInterval(breathT); breathT = 0; }
function openBreath(id) {
  const x = actById(id);
  const box = id === 'caja';
  const phases = box ? [['Inhala', 4, 1.9], ['Sostén', 4, 1.9], ['Exhala', 4, 1], ['Espera', 4, 1]] : [['Inhala', 4, 1.9], ['Exhala', 6, 1]];
  const cycles = id === 'diez' ? 10 : box ? 6 : 8;
  openSheet('breathe', { ic: 'wind', title: x ? x.t : 'Respirar con guía',
    body: `<div class="breath"><div class="breath-o"><div class="breath-i" id="br-i"></div></div><p class="breath-t" id="br-t" aria-live="polite">Prepárate</p><p class="breath-c" id="br-c"></p>
      <p class="hint">${box ? 'Inhala, sostén, exhala y espera, 4 segundos cada vez.' : 'Inhala 4 segundos por la nariz y exhala 6 por la boca.'} Apoya la espalda y suelta los hombros.</p></div>`,
    foot: `${footClose()}${x ? `<button class="btn btn-primary" data-act="act-done" data-id="${id}">${icon('check')}Hecho</button>` : ''}` });
  let p = 0, left = 0, cyc = 1;
  const circle = $('#br-i');
  const step = () => {
    if (left <= 0) {
      if (p >= phases.length) { p = 0; cyc++; }
      if (cyc > cycles) { stopBreath(); setText('#br-t', 'Muy bien'); setText('#br-c', 'Vuelve a respirar con normalidad'); circle.style.transform = 'scale(1)'; return; }
      const [name, secs, sc] = phases[p++];
      left = secs;
      setText('#br-t', name);
      circle.style.transitionDuration = secs + 's';
      circle.style.transform = `scale(${sc})`;
    }
    setText('#br-c', `${left} · ciclo ${cyc} de ${cycles}`);
    left--;
  };
  step();
  breathT = setInterval(step, 1000);
}

/* ----- Bloc de dibujo ----- */
const PAD_COLORS = [['#1a1f3a', 'negro'], ['#d03b3b', 'rojo'], ['#fab219', 'amarillo'], ['#0ca30c', 'verde'], ['#0e9fb0', 'turquesa'], ['#6250d6', 'violeta']];
const PAD = { color: PAD_COLORS[0][0], dirty: false, last: null };
function openDraw(id) {
  const x = actById(id);
  PAD.color = PAD_COLORS[0][0]; PAD.dirty = false;
  openSheet('draw', { ic: 'pencil', title: x ? x.t : 'Bloc de dibujo',
    body: `<p>${x && x.prompt ? `Dibuja ${esc(x.prompt)}. No tiene que quedar bonito, solo disfruta del momento.` : 'Dibuja lo que quieras.'}</p>
      <div class="pad"><canvas id="pad" width="360" height="360" aria-label="Lienzo de dibujo"></canvas>
      <div class="swatches" role="radiogroup" aria-label="Color">${PAD_COLORS.map(([c, n], i) => `<button class="sw" role="radio" aria-checked="${i === 0}" aria-label="${n}" style="background:${c}" data-act="pad-color" data-c="${c}"></button>`).join('')}<button class="chip" data-act="pad-clear">Borrar todo</button></div></div>
      <p class="hint" id="pad-msg" role="alert"></p>`,
    foot: `${footClose('Cancelar')}<button class="btn btn-primary" data-act="pad-save" data-id="${id}">${icon('check')}Guardar en la bitácora</button>` });
  const cv = $('#pad'), cx = cv.getContext('2d');
  cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, cv.width, cv.height);
  cx.lineWidth = 5; cx.lineCap = 'round'; cx.lineJoin = 'round';
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); PAD.last = pos(e); PAD.dirty = true; cx.strokeStyle = PAD.color; cx.beginPath(); cx.moveTo(...PAD.last); cx.lineTo(PAD.last[0] + 0.1, PAD.last[1]); cx.stroke(); });
  cv.addEventListener('pointermove', (e) => { if (!PAD.last) return; const p = pos(e); cx.strokeStyle = PAD.color; cx.beginPath(); cx.moveTo(...PAD.last); cx.lineTo(...p); cx.stroke(); PAD.last = p; });
  const end = () => { PAD.last = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}
function savePad(id) {
  const cv = $('#pad');
  if (!PAD.dirty) { setText('#pad-msg', 'Dibuja algo antes de guardar.'); return; }
  let img = cv.toDataURL('image/png');
  if (img.length > 230000) img = cv.toDataURL('image/jpeg', 0.85);
  const x = actById(id);
  addEntry({ kind: 'actividad', act: x ? x.id : null, text: x ? `Dibujo: ${x.prompt || x.t}` : 'Dibujo', img });
  closeSheet();
  notify({ type: 'sistema', level: 'ok', title: 'Dibujo guardado', body: 'Lo encontrarás en tu bitácora.', act: { kind: 'view', id: 'bitacora', label: 'Ver bitácora' } });
}

/* ===== Acciones ===== */
const me = () => S.profile.id;
function copyText(txt) {
  const fallback = () => { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* sin permiso */ } t.remove(); return ok; };
  const done = (ok) => notify({ type: 'sistema', level: ok ? 'ok' : 'watch', title: ok ? 'CSV copiado' : 'No se pudo copiar', body: ok ? 'Ya puedes pegarlo en una hoja de cálculo.' : 'Prueba con Descargar CSV.' });
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => done(true), () => done(fallback()));
  else done(fallback());
}
function doneAct(id) {
  const x = actById(id);
  if (!x) return;
  addEntry({ kind: 'actividad', act: id, text: x.t });
  notify({ type: 'sistema', level: 'ok', title: '¡Bien hecho!', body: `Anotamos «${x.t}» en tu bitácora.` }, { toast: true });
  if (S.suggestion === id) { setSuggestion(pickSuggestion(id)); }
}
function retrain() {
  CREW.forEach((c) => { M[c.id] = trainModel(c, settings.train); });
  refreshInsights();
  S.state = computeState(S.profile);
}
function applyProfile(c) {
  S.profile = c; settings.profile = c.id; saveSettings();
  S.chk = { mood: null, tension: null }; S.draft = { tags: new Set(), syms: new Set(), mood: null }; S.delAsk = null; S.recent = [];
  S.state = computeState(c);
  setSuggestion(startSuggestion());
  schedReset();
  renderWho(); renderSim(); renderBell();
  closeSheet();
  renderView();
}
const startSuggestion = () => actById(FIRST[S.profile.id]) || pickSuggestion();
const toggleSet = (set, k) => { if (set.has(k)) set.delete(k); else set.add(k); };
const setPressed = (el, on) => el.setAttribute('aria-pressed', String(on));

const ACT = {
  'sheet-close': () => closeSheet(),
  'toast-close': (el) => { const t = el.closest('.toast'); if (t) t.remove(); },
  go: (el) => { closeSheet(); go(el.dataset.id); },
  perfil: () => openPerfil(),
  'set-profile': (el) => { const c = crewById(el.dataset.id); if (c) applyProfile(c); },
  'ficha-edit': () => openFicha('edit'),
  'ficha-new': () => openFicha('new'),
  'ficha-save': () => saveFicha(),
  'ficha-del': () => deleteProfile(),
  'f-sex': (el) => { S.form.sex = el.dataset.k; $$('#f-sex .chip').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  'f-hx': (el) => { toggleSet(S.form.hx, el.dataset.k); setPressed(el, S.form.hx.has(el.dataset.k)); },
  'f-like': (el) => { toggleSet(S.form.likes, el.dataset.k); setPressed(el, S.form.likes.has(el.dataset.k)); },
  guide: (el) => openGuide(el.dataset.id, !!el.dataset.helper),
  emer: () => openEmergency(),
  sos: (el) => openSos(el.dataset.kind),
  'sos-kind': (el) => { S.sosKind = el.dataset.k; setHtml('#sos-opts', sosOptions()); },
  'sos-send': () => sendManualAlert(),
  step: (el) => setPressed(el, el.getAttribute('aria-pressed') !== 'true'),
  breathe: (el) => openBreath(el.dataset.id),
  draw: (el) => openDraw(el.dataset.id),
  'pad-color': (el) => { PAD.color = el.dataset.c; $$('.sw').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  'pad-clear': () => { const cv = $('#pad'), cx = cv.getContext('2d'); cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, cv.width, cv.height); PAD.dirty = false; },
  'pad-save': (el) => savePad(el.dataset.id),
  write: (el) => { const x = actById(el.dataset.id); S.prefill = x ? x.t + ': ' : ''; S.draftAct = x ? x.id : null; closeSheet(); go('bitacora'); },

  bell: () => {
    const p = $('#bell-pop'), open = p.hidden;
    p.hidden = !open;
    $('#bell-btn').setAttribute('aria-expanded', String(open));
    if (open) renderBellPop();
  },
  'notes-read': () => { NOTES.forEach((n) => { n.read = true; }); renderBell(); renderBellPop(); },
  'note-open': (el) => {
    const n = NOTES.find((x) => x.id === el.dataset.id);
    if (!n) return;
    n.read = true; renderBell(); killToast(n.id);
    $('#bell-pop').hidden = true; $('#bell-btn').setAttribute('aria-expanded', 'false');
    if (n.act) {
      if (n.act.kind === 'guide') openGuide(n.act.id);
      else if (n.act.kind === 'emer') openEmergency();
      else if (n.act.kind === 'view') go(n.act.id);
    } else if (n.actId) { S.suggestion = n.actId; if (S.view === 'inicio') setHtml('#sugerencia', suggestionHtml()); else go('inicio'); }
    else if (n.type === 'checkin') go('mente');
  },
  tmood: (el) => {
    const v = Number(el.dataset.v), n = NOTES.find((x) => x.id === el.dataset.id);
    if (n) n.read = true;
    killToast(el.dataset.id);
    saveCheckin(v, null, '');
  },
  'sim-toggle': () => {
    const s = $('#sim'), open = s.hidden;
    s.hidden = !open;
    $('#sim-btn').setAttribute('aria-expanded', String(open));
  },
  scen: (el) => {
    RT[me()].scen = el.dataset.id;
    refreshInsights();
    S.state = computeState(S.profile);
    renderSim();
    renderView();
  },
  'send-act': () => remindActivity(),
  'send-check': () => remindCheckin(),

  ack: (el) => {
    const al = Store.alerts.find((x) => x.id === el.dataset.id);
    if (al) Store.updateAlert(al.id, { acks: { ...al.acks, [me()]: Date.now() } });
  },
  resolve: (el) => Store.updateAlert(el.dataset.id, { status: 'resuelta', resolved: Date.now() }),
  'alerts-clear': () => Store.clearResolved(),
  'crew-now': () => { const rt = RT[me()]; if (rt.ep) { sendCrewAlert(S.profile, 'manual'); renderAlertSlot(); renderEmCrew(); } },
  'crew-cancel': () => { const ep = RT[me()].ep; if (ep) { ep.cancelLv = LV[ep.top.level]; ep.count = null; renderAlertSlot(); renderEmCrew(); } },

  mood: (el) => { S.chk.mood = Number(el.dataset.v); $$('[data-act="mood"]').forEach((b) => b.setAttribute('aria-checked', String(b === el))); $('#chk-save').disabled = false; },
  tension: (el) => { const v = Number(el.dataset.v); S.chk.tension = S.chk.tension === v ? null : v; $$('[data-act="tension"]').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.v) === S.chk.tension))); },
  'checkin-save': () => { if (!S.chk.mood) return; saveCheckin(S.chk.mood, S.chk.tension, $('#chk-note').value.trim()); S.chk = { mood: null, tension: null }; renderView(); },
  'act-filter': (el) => { S.actFilter = el.dataset.k; setHtml('#act-filter', actFilterHtml()); setHtml('#acts', actsHtml()); },
  'act-done': (el) => { doneAct(el.dataset.id); const t = el.closest('.toast'); if (t) t.remove(); if (S.sheet === 'breathe') closeSheet(); },
  'act-next': () => setSuggestion(pickSuggestion(S.suggestion)),
  'plan-regen': () => { S.planSalt++; setHtml('#mente-plan', planHtml()); },

  tag: (el) => { toggleSet(S.draft.tags, el.dataset.t); setPressed(el, S.draft.tags.has(el.dataset.t)); },
  sym: (el) => { toggleSet(S.draft.syms, el.dataset.t); setPressed(el, S.draft.syms.has(el.dataset.t)); },
  'entry-mood': (el) => { const v = Number(el.dataset.v); S.draft.mood = S.draft.mood === v ? null : v; setHtml('#ent-mood', draftChipsHtml().mood); },
  'entry-save': () => {
    const t = $('#ent-text').value.trim();
    if (!t && !S.draft.syms.size) { setText('#ent-err', 'Escribe algo o elige un síntoma antes de guardar.'); return; }
    setText('#ent-err', '');
    addEntry({ kind: S.draftAct ? 'actividad' : 'nota', act: S.draftAct || null, text: t, mood: S.draft.mood, tags: [...S.draft.tags], syms: [...S.draft.syms] });
    S.draft = { tags: new Set(), syms: new Set(), mood: null }; S.draftAct = null;
    $('#ent-text').value = '';
    refreshDraft();
    setText('#store-status', 'Entrada guardada.');
  },
  'ent-filter': (el) => { S.entFilter = el.dataset.k; setHtml('#ent-filter', entFilterHtml()); setHtml('#entries', entriesHtml()); },
  'entry-del': (el) => { S.delAsk = el.dataset.id; setHtml('#entries', entriesHtml()); },
  'entry-del-no': () => { S.delAsk = null; setHtml('#entries', entriesHtml()); },
  'entry-del-yes': (el) => { S.delAsk = null; Store.delEntry(el.dataset.id); },

  range: (el) => { settings.range = Number(el.dataset.n); saveSettings(); renderView(); },
  train: (el) => { settings.train = el.dataset.m; saveSettings(); $$('[data-act="train"]').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  retrain: () => { retrain(); renderView(); notify({ type: 'sistema', level: 'ok', title: 'Modelo reentrenado', body: 'Se actualizó la línea base de toda la tripulación.' }); },
  'csv-copy': () => copyText(csvText(S.profile, settings.range)),
  'csv-save': () => {
    const url = URL.createObjectURL(new Blob([csvText(S.profile, settings.range)], { type: 'text/csv;charset=utf-8' }));
    const l = document.createElement('a');
    l.href = url; l.download = `stellar-health-${S.profile.id}-${settings.range}d.csv`;
    document.body.appendChild(l); l.click(); l.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

function saveCheckin(mood, stress, text) {
  addEntry({ kind: 'checkin', mood, stress, text });
  rebuildChk();
  refreshInsights();
  S.state = computeState(S.profile);
  if (mood <= 2) notify({ type: 'prevencion', level: 'watch', title: 'Gracias por contarlo', body: 'Parece un momento difícil. Hablar con un compañero o hacer algo tranquilo puede ayudar.', act: { kind: 'guide', id: 'animo', label: 'Qué puede ayudar' } });
  else notify({ type: 'sistema', level: 'ok', title: 'Check-in guardado', body: `Anotamos que te sientes ${moodLabel(mood).toLowerCase()}.` });
}

/* ===== Eventos ===== */
document.addEventListener('click', (ev) => {
  const pop = $('#bell-pop');
  if (!pop.hidden && !ev.target.closest('#bell-pop, #bell-btn')) { pop.hidden = true; $('#bell-btn').setAttribute('aria-expanded', 'false'); }
  if (ev.target === sheetEl()) { closeSheet(); return; }
  const el = ev.target.closest('[data-act]');
  const fn = el && ACT[el.dataset.act];
  if (fn) fn(el, ev);
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  const pop = $('#bell-pop');
  if (!pop.hidden) { pop.hidden = true; $('#bell-btn').setAttribute('aria-expanded', 'false'); $('#bell-btn').focus(); }
  else if (!$('#sim').hidden) { $('#sim').hidden = true; $('#sim-btn').setAttribute('aria-expanded', 'false'); $('#sim-btn').focus(); }
});
document.addEventListener('change', (ev) => {
  if (ev.target.id === 'demo-on') { settings.demo = ev.target.checked; saveSettings(); schedReset(); if (S.view === 'mente') setText('#rem-info', remInfoText()); }
  else if (ev.target.id === 'freq') { settings.freq = ev.target.value; saveSettings(); schedReset(); setText('#rem-info', remInfoText()); }
});
sheetEl().addEventListener('close', () => { if (sheetEl().open) return; S.sheet = null; stopBreath(); });

let booted = false;
bus.on('note', ({ note, toast }) => { if (!booted) return; renderBell(); if (toast) showToast(note); });
bus.on('suggestion', () => { if (booted && S.view === 'inicio') setHtml('#sugerencia', suggestionHtml()); });
bus.on('tick', () => { if (booted) renderLive(); });
bus.on('store', () => {
  if (!booted) return;
  rebuildChk();
  renderAlertSlot();
  if (S.view === 'bitacora') { setHtml('#entries', entriesHtml()); setText('#store-status', storeStatusText()); }
  else if (S.view === 'equipo') refreshEquipo();
  else if (S.view === 'mente') refreshMente();
});

/* ===== Arranque ===== */
function boot() {
  Store.init();
  initEngine();
  S.dl = typeof Blob !== 'undefined' && !!(window.URL && URL.createObjectURL);
  renderShell();
  schedReset();
  setSuggestion(startSuggestion());
  window.addEventListener('hashchange', route);
  booted = true;
  route();
  setInterval(tickAll, TICK);
  if (!LS.get('sh.bienvenida.v1', 0)) openWelcome();
}
boot();
