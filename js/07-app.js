/* ===== Sheets (dialogs): profile, health file, guides, emergency, SOS, drawing and breathing ===== */
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
const footClose = (label = 'Close') => `<button class="btn btn-ghost" data-act="sheet-close">${label}</button>`;
const bullets = (arr) => `<ul>${arr.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

/* ----- Guides and emergencies ----- */
function guideHtml(g, id, helper) {
  const tips = hxTips(S.profile, id);
  const steps = helper
    ? `<div class="box"><h3>How to help</h3>${bullets(g.helper)}</div>`
    : `<ol class="steps">${g.steps.map(([t, d]) => `<li><button class="step" data-act="step" aria-pressed="false"><span><b>${esc(t)}</b>${esc(d)}</span></button></li>`).join('')}</ol>`;
  return `<p>${esc(g.what)}</p>${steps}
    <div class="box urgent"><h3>Get help right away if…</h3>${bullets(g.urgent)}</div>
    ${helper ? '' : `<div class="box"><h3>Avoid</h3>${bullets(g.avoid)}</div>`}
    ${tips.length ? `<div class="box"><h3>Keep your history in mind</h3>${bullets(tips)}</div>` : ''}`;
}
const guideFoot = (g, id, helper) => `${helper || !g.tool ? '' : `<button class="btn btn-soft" data-act="breathe" data-id="${id}">${icon('wind')}Guided breathing</button>`}
  ${helper ? '' : '<button class="btn btn-crit" data-act="sos">' + icon('send') + 'Alert the crew</button>'}${footClose()}`;
function openGuide(id, helper = false) {
  const g = GUIDES[id];
  if (!g) return;
  openSheet('guide', { ic: g.ic, lv: g.dom === 'mente' ? 'ok' : 'watch', title: helper ? `How to help: ${low(g.title)}` : g.title, body: guideHtml(g, id, helper), foot: guideFoot(g, id, helper) });
}
function openEmergency() {
  const rt = RT[S.profile.id];
  if (!rt.ep) { openSos(); return; }
  const top = rt.ep.top, c = COND[top.code], g = GUIDES[c.guide];
  openSheet('emer', { ic: LEVELS[top.level].ic, lv: top.level, title: `${LEVELS[top.level].label}: ${cap(c.n)}`,
    body: `<div class="box"><div id="em-crew"></div></div><p><b>${esc(c.s)}</b></p>${guideHtml(g, c.guide, false)}`, foot: guideFoot(g, c.guide, false) });
  renderEmCrew();
}

/* ----- Alert the crew manually ----- */
const SOS_KINDS = {
  cuerpo: { label: 'I feel physically unwell', hint: 'Fever, dizziness, pain, shortness of breath…' },
  mente: { label: 'I need emotional support', hint: 'Anxiety, sadness, a rough moment. Asking for company is brave.' },
  grave: { label: 'This is an emergency: I need help now', hint: 'Sends the alert with top priority.' },
};
function sosOptions() {
  return Object.entries(SOS_KINDS).map(([k, o]) => `<button class="opt" role="radio" aria-checked="${S.sosKind === k}" data-act="sos-kind" data-k="${k}"><span class="tile-ic${k === 'mente' ? ' mind' : ''}">${icon(k === 'mente' ? 'smile' : k === 'grave' ? 'octagon' : 'pulse')}</span><span><b>${o.label}</b><small>${o.hint}</small></span></button>`).join('');
}
function openSos(kind) {
  S.sosKind = SOS_KINDS[kind] ? kind : 'cuerpo';
  openSheet('sos', { ic: 'send', lv: 'alert', title: 'Ask the crew for help',
    body: `<p>Your crewmates will get an alert with steps to help you. You don't have to be sure it's serious.</p>
      <div class="opts" role="radiogroup" aria-label="What do you need?" id="sos-opts">${sosOptions()}</div>
      <label class="lbl" for="sos-note">Anything else you'd like to share? (optional)</label><textarea id="sos-note" rows="2" maxlength="200"></textarea>
      <p class="hint">If it's a danger to the ship (fire, air leak), also use the module alarm.</p>`,
    foot: `<button class="btn btn-ghost" data-act="go" data-id="guias">View guides</button>${footClose('Cancel')}<button class="btn btn-crit" data-act="sos-send">${icon('send')}Send alert</button>` });
}
function sendManualAlert() {
  const a = S.profile, rt = RT[a.id], k = S.sosKind || 'cuerpo', ep = rt.ep;
  const note = ($('#sos-note') || { value: '' }).value.trim().slice(0, 200);
  const cfg = {
    cuerpo: { level: 'alert', dom: 'cuerpo', guide: ep ? COND[ep.top.code].guide : null, title: `${a.short} needs medical help` },
    mente: { level: 'alert', dom: 'mente', guide: 'animo', title: `${a.short} needs company` },
    grave: { level: 'emergency', dom: 'otro', guide: ep ? COND[ep.top.code].guide : null, title: `${a.short}: emergency, needs help now` },
  }[k];
  const al = { id: 'a' + uid(), from: a.id, level: cfg.level, dom: cfg.dom, guide: cfg.guide, reason: 'manual', ts: Date.now(), status: 'activa', resolved: null, acks: {},
    title: cfg.title, detail: note || 'Alert sent by the crew member.' };
  if (ep && !ep.sent && k !== 'mente') { ep.sent = al.id; ep.sentLevel = LV[ep.top.level]; ep.count = null; }
  Store.addAlert(al);
  closeSheet();
  notify({ type: 'equipo', level: al.level, title: 'Crew alerted', body: 'Your crewmates received your alert and the steps to help you.', act: { kind: 'view', id: 'equipo', label: 'View crew' } });
  renderAlertSlot();
}

/* ----- Profile, health file and new profiles ----- */
const fichaLine = (a) => { const f = ficha(a); return `${f.age} yrs · ${f.weight} kg · ${f.height} cm · BMI ${f1(bmi(f))}`; };
function openPerfil() {
  const me = S.profile.id;
  openSheet('perfil', { ic: 'users', title: 'Who are you?',
    body: `<div class="opts" role="radiogroup" aria-label="Crew member">${CREW.map((c) => `<button class="opt" role="radio" aria-checked="${c.id === me}" data-act="set-profile" data-id="${c.id}">${avatar(c, c.id === me)}<span><b>${esc(c.name)}</b><small>${esc(c.role)} · ${esc(fichaLine(c))}</small></span></button>`).join('')}</div>
      <div class="box"><h3>${esc(S.profile.short)}'s health file</h3><p class="hint">${esc(fichaLine(S.profile))}${ficha(S.profile).hx.length ? '<br>History: ' + esc(ficha(S.profile).hx.map((k) => HX_BY[k].label).join(', ')) : ''}</p>
        <div class="row"><button class="btn btn-soft btn-sm" data-act="ficha-edit">${icon('pencil')}Edit my file</button><button class="btn btn-primary btn-sm" data-act="ficha-new">${icon('plus')}Create a new profile</button></div></div>`,
    foot: footClose() });
}
const chipSet = (act, key, items, on, radio) => items.map(([k, l]) => `<button type="button" class="chip" ${radio ? 'role="radio" aria-checked' : 'aria-pressed'}="${on(k)}" data-act="${act}" data-k="${esc(k)}">${esc(l)}</button>`).join('');
function openFicha(mode) {
  const a = S.profile, isNew = mode === 'new';
  const src = isNew ? { age: '', weight: '', height: '', sex: '', hx: [], likes: [], note: '' } : { ...ficha(a), likes: ficha(a).likes || a.likes };
  S.form = { mode, sex: src.sex, hx: new Set(src.hx), likes: new Set(src.likes) };
  const fld = (id, label, v, ph) => `<div><label class="lbl" for="${id}">${label}</label><input type="text" inputmode="decimal" id="${id}" value="${esc(v)}" placeholder="${ph}" autocomplete="off"></div>`;
  openSheet('ficha', { ic: 'user', title: isNew ? 'Create my profile' : `${a.short}'s health file`,
    body: `<p>Stellar Health uses this data to tune your thresholds, guides and care plan. It's stored only on this device.</p>
      ${isNew ? `<div><label class="lbl" for="f-name">Name</label><input type="text" id="f-name" maxlength="40" autocomplete="off"></div><div><label class="lbl" for="f-role">Mission role (optional)</label><input type="text" id="f-role" maxlength="40" placeholder="Crew Member" autocomplete="off"></div>` : ''}
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${fld('f-age', 'Age', src.age, 'yrs')}${fld('f-weight', 'Weight (kg)', src.weight, 'kg')}${fld('f-height', 'Height (cm)', src.height, 'cm')}</div>
      <div><p class="lbl" id="l-sex">Sex</p><div class="chips" role="radiogroup" aria-labelledby="l-sex" id="f-sex">${chipSet('f-sex', 'sex', SEXES, (k) => src.sex === k, true)}</div></div>
      <div><p class="lbl" id="l-hx">Medical history: check all that apply</p><div class="chips" role="group" aria-labelledby="l-hx">${chipSet('f-hx', 'hx', HX.map((h) => [h.k, h.label]), (k) => src.hx.includes(k))}</div></div>
      <div><label class="lbl" for="f-note">Other conditions, allergies or medication (optional)</label><textarea id="f-note" rows="2" maxlength="400">${esc(src.note)}</textarea></div>
      <div><p class="lbl" id="l-like">What you like to do (to pick activities that lift your mood)</p><div class="chips" role="group" aria-labelledby="l-like">${chipSet('f-like', 'likes', LIKES, (k) => src.likes.includes(k))}</div></div>
      <p class="hint" id="f-err" role="alert"></p>
      <p class="hint">This information doesn't replace a medical assessment. The mission Medical Officer decides any treatment.</p>`,
    foot: `${!isNew && a.custom ? `<button class="btn btn-ghost" data-act="ficha-del">${icon('trash')}Delete profile</button>` : ''}<button class="btn btn-ghost" data-act="perfil">Back</button><button class="btn btn-primary" data-act="ficha-save">${icon('check')}Save</button>` });
}
const numField = (id) => parseFloat(String($(id).value).replace(',', '.'));
function saveFicha() {
  const err = (m) => { setText('#f-err', m); };
  const isNew = S.form.mode === 'new';
  const f = cleanFicha({ age: numField('#f-age'), weight: numField('#f-weight'), height: numField('#f-height'), sex: S.form.sex || 'o', hx: [...S.form.hx], likes: [...S.form.likes], note: $('#f-note').value.trim() });
  if (!f) return err('Check your data: age 18–80 years, weight 35–200 kg and height 130–220 cm.');
  if (!S.form.sex) return err('Choose a sex option.');
  if (!isNew) {
    FICHAS[S.profile.id] = f;
    if (f.likes) S.profile.likes = f.likes;
    saveFichas();
    closeSheet();
    notify({ type: 'sistema', level: 'ok', title: 'Health file saved', body: 'Stellar Health will factor it into your thresholds, guides and care plan.' });
    S.state = computeState(S.profile);
    renderView();
    return;
  }
  const name = $('#f-name').value.trim();
  if (name.length < 2) return err('Enter your name.');
  const c = cleanCustom([{
    id: 'c' + uid().slice(-10), name, role: $('#f-role').value.trim(),
    base: { temp: 36.6, hr: 60 + (f.sex === 'f' ? 3 : 0) + (f.age >= 50 ? 2 : 0) - (f.likes && f.likes.includes('ejercicio') ? 3 : 0), rr: 14, spo2: f.hx.includes('asma') ? 97 : 98, sleep: 7.5, mood: 4, stress: 2 + (f.hx.includes('ansiedad') ? 0.3 : 0) },
  }])[0];
  if (!c) return err('Could not create the profile. Check your data.');
  const list = LS.get(K_CUSTOM, []);
  list.push(c);
  FICHAS[c.id] = f;
  if (!(LS.set(K_CUSTOM, list) && saveFichas())) return err('Could not save on this device.');
  settings.profile = c.id;
  saveSettings();
  location.reload();
}
function deleteProfile() {
  const a = S.profile;
  if (!a.custom || !window.confirm(`Delete ${a.short}'s profile? This can't be undone.`)) return;
  LS.set(K_CUSTOM, LS.get(K_CUSTOM, []).filter((c) => c.id !== a.id));
  delete FICHAS[a.id];
  saveFichas();
  settings.profile = CREW[0].id;
  saveSettings();
  location.reload();
}
function openWelcome() {
  LS.set('sh.bienvenida.v1', 1);
  openSheet('welcome', { ic: 'star', title: 'Welcome to Stellar Health',
    body: `<p><b>Health beyond Earth.</b> Stellar Health tracks your body and mood using the values you measure and log, warns you before something becomes a problem and tells you what to do if it does.</p>
      <div class="box"><h3>Getting started</h3>${bullets(['Create your profile with your age, weight, height, sex and medical history.', 'Measure your temperature, heart rate, breathing or oxygen with your own instruments and enter them in “Log measurement”.'])}</div>
      <p class="hint">This is an educational prototype. It doesn't replace the flight surgeon.</p>`,
    foot: `${footClose('Explore with the sample crew')}<button class="btn btn-primary" data-act="ficha-new">${icon('user')}Create my profile</button>` });
}

/* ----- Guided breathing ----- */
let breathT = 0;
function stopBreath() { clearInterval(breathT); breathT = 0; }
function openBreath(id) {
  const x = actById(id);
  const box = id === 'caja';
  const phases = box ? [['Inhale', 4, 1.9], ['Hold', 4, 1.9], ['Exhale', 4, 1], ['Wait', 4, 1]] : [['Inhale', 4, 1.9], ['Exhale', 6, 1]];
  const cycles = id === 'diez' ? 10 : box ? 6 : 8;
  openSheet('breathe', { ic: 'wind', title: x ? x.t : 'Guided breathing',
    body: `<div class="breath"><div class="breath-o"><div class="breath-i" id="br-i"></div></div><p class="breath-t" id="br-t" aria-live="polite">Get ready</p><p class="breath-c" id="br-c"></p>
      <p class="hint">${box ? 'Inhale, hold, exhale and wait, 4 seconds each.' : 'Inhale for 4 seconds through your nose and exhale for 6 through your mouth.'} Rest your back and relax your shoulders.</p></div>`,
    foot: `${footClose()}${x ? `<button class="btn btn-primary" data-act="act-done" data-id="${id}">${icon('check')}Done</button>` : ''}` });
  let p = 0, left = 0, cyc = 1;
  const circle = $('#br-i');
  const step = () => {
    if (left <= 0) {
      if (p >= phases.length) { p = 0; cyc++; }
      if (cyc > cycles) { stopBreath(); setText('#br-t', 'Well done'); setText('#br-c', 'Go back to breathing normally'); circle.style.transform = 'scale(1)'; return; }
      const [name, secs, sc] = phases[p++];
      left = secs;
      setText('#br-t', name);
      circle.style.transitionDuration = secs + 's';
      circle.style.transform = `scale(${sc})`;
    }
    setText('#br-c', `${left} · cycle ${cyc} of ${cycles}`);
    left--;
  };
  step();
  breathT = setInterval(step, 1000);
}

/* ----- Drawing pad ----- */
const PAD_COLORS = [['#1a1f3a', 'black'], ['#d03b3b', 'red'], ['#fab219', 'yellow'], ['#0ca30c', 'green'], ['#0e9fb0', 'turquoise'], ['#6250d6', 'violet']];
const PAD = { color: PAD_COLORS[0][0], dirty: false, last: null };
function openDraw(id) {
  const x = actById(id);
  PAD.color = PAD_COLORS[0][0]; PAD.dirty = false;
  openSheet('draw', { ic: 'pencil', title: x ? x.t : 'Drawing pad',
    body: `<p>${x && x.prompt ? `Draw ${esc(x.prompt)}. It doesn't have to look pretty, just enjoy the moment.` : 'Draw whatever you like.'}</p>
      <div class="pad"><canvas id="pad" width="360" height="360" aria-label="Drawing canvas"></canvas>
      <div class="swatches" role="radiogroup" aria-label="Color">${PAD_COLORS.map(([c, n], i) => `<button class="sw" role="radio" aria-checked="${i === 0}" aria-label="${n}" style="background:${c}" data-act="pad-color" data-c="${c}"></button>`).join('')}<button class="chip" data-act="pad-clear">Clear all</button></div></div>
      <p class="hint" id="pad-msg" role="alert"></p>`,
    foot: `${footClose('Cancel')}<button class="btn btn-primary" data-act="pad-save" data-id="${id}">${icon('check')}Save to the Log</button>` });
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
  if (!PAD.dirty) { setText('#pad-msg', 'Draw something before saving.'); return; }
  let img = cv.toDataURL('image/png');
  if (img.length > 230000) img = cv.toDataURL('image/jpeg', 0.85);
  const x = actById(id);
  addEntry({ kind: 'actividad', act: x ? x.id : null, text: x ? `Drawing: ${x.prompt || x.t}` : 'Drawing', img });
  closeSheet();
  notify({ type: 'sistema', level: 'ok', title: 'Drawing saved', body: 'Find it in your Log.', act: { kind: 'view', id: 'bitacora', label: 'View Log' } });
}

/* ===== Actions ===== */
const me = () => S.profile.id;
function copyText(txt) {
  const fallback = () => { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* no permission */ } t.remove(); return ok; };
  const done = (ok) => notify({ type: 'sistema', level: ok ? 'ok' : 'watch', title: ok ? 'CSV copied' : 'Could not copy', body: ok ? 'You can now paste it into a spreadsheet.' : 'Try Download CSV.' });
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => done(true), () => done(fallback()));
  else done(fallback());
}
function doneAct(id) {
  const x = actById(id);
  if (!x) return;
  addEntry({ kind: 'actividad', act: id, text: x.t });
  notify({ type: 'sistema', level: 'ok', title: 'Well done!', body: `We logged “${x.t}” in your Log.` }, { toast: true });
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
  renderWho(); renderBell();
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
  'med-open': () => openMedicion(),
  'med-state': (el) => { S.medState = el.dataset.k; $$('[data-act="med-state"]').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  'med-save': () => {
    const vals = {};
    for (const [k, label] of MED_FIELDS) {
      const raw = String($('#m-' + k).value).trim().replace(',', '.');
      if (!raw) continue;
      const v = Number(raw), [lo, hi] = MED_LIMITS[k];
      if (!isFinite(v) || v < lo || v > hi) return setText('#m-err', `Check “${label}”: it must be between ${lo} and ${hi}.`);
      vals[k] = v;
    }
    if (!Object.keys(vals).length) return setText('#m-err', 'Enter at least one value.');
    if ((vals.sys != null) !== (vals.dia != null)) return setText('#m-err', 'Enter both systolic and diastolic pressure.');
    if (vals.sys != null && vals.dia >= vals.sys) return setText('#m-err', 'Systolic pressure must be higher than diastolic.');
    const a = S.profile;
    vals.state = S.medState;
    if (!addMeasurement(a, vals)) return setText('#m-err', 'Could not save the measurement.');
    closeSheet();
    notify({ type: 'sistema', level: 'ok', title: 'Measurement saved', body: 'Stellar Health updated your status with the values you entered.' });
    renderView();
  },
  'med-del': (el) => {
    deleteMeasurement(S.profile, Number(el.dataset.t));
    setHtml('#med-list', medListHtml());
    renderView();
  },
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
  'ex-toggle': (el) => { exToggle(S.profile, el.dataset.id); setHtml('#ex-list', exHtml(S.profile)); },
  'rt-add': () => {
    const name = $('#rt-name').value.trim(), min = Number($('#rt-min').value.trim());
    if (!name) return setText('#rt-err', 'Enter the exercise name.');
    if (!isFinite(min) || min < 1 || min > 300) return setText('#rt-err', 'Minutes must be between 1 and 300.');
    exAdd(S.profile, name, Math.round(min)); renderView();
  },
  'rt-del': (el) => { exRemove(S.profile, el.dataset.id); renderView(); },
  'sw-toggle': () => {
    const sel = $('#sw-ex'); if (sel) SW.ex = sel.value;
    if (SW.run) { SW.acc += Date.now() - SW.since; SW.run = false; } else { SW.since = Date.now(); SW.run = true; }
    setHtml('#sw-btn', swBtnText());
  },
  'sw-reset': () => { SW.run = false; SW.acc = 0; setText('#sw-time', swText(0)); setHtml('#sw-btn', swBtnText()); },
  'sw-finish': () => {
    const sel = $('#sw-ex'); if (sel) SW.ex = sel.value;
    const sec = Math.round(swMs() / 1000);
    if (sec < 5 || !SW.ex) return;
    sessionAdd(S.profile, SW.ex, sec);
    if (!exDone(S.profile).includes(SW.ex)) exToggle(S.profile, SW.ex);
    SW.run = false; SW.acc = 0;
    renderView();
  },
  'lg-perf': (el) => { S.perf = Number(el.dataset.k); $$('[data-act="lg-perf"]').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  'lg-save': () => {
    const id = $('#lg-ex').value, ex = exList(S.profile).find((x) => x.id === id);
    const kg = Number($('#lg-kg').value.trim().replace(',', '.') || 0), reps = $('#lg-reps').value.trim() ? Number($('#lg-reps').value.trim()) : null;
    if (!ex) return setText('#lg-err', 'Add an exercise to your routine first.');
    if (!isFinite(kg) || kg < 0 || kg > 500) return setText('#lg-err', 'Weight must be between 0 and 500 kg.');
    if (reps != null && (!isFinite(reps) || reps < 1 || reps > 500)) return setText('#lg-err', 'Reps must be between 1 and 500.');
    if (!kg && reps == null) return setText('#lg-err', 'Enter the weight used, or the reps for a bodyweight exercise.');
    logAdd(S.profile, { ex: id, name: ex.t, kg, reps: reps == null ? null : Math.round(reps), perf: S.perf || 3, note: $('#lg-note').value.trim() });
    renderView();
  },
  'lg-del': (el) => { logDel(S.profile, Number(el.dataset.t)); renderView(); },
  'tr-chart': (el) => { S.trEx = el.dataset.k; renderView(); },
  'act-filter': (el) => { S.actFilter = el.dataset.k; setHtml('#act-filter', actFilterHtml()); setHtml('#acts', actsHtml()); },
  'act-done': (el) => { doneAct(el.dataset.id); const t = el.closest('.toast'); if (t) t.remove(); if (S.sheet === 'breathe') closeSheet(); },
  'act-next': () => setSuggestion(pickSuggestion(S.suggestion)),
  'plan-regen': () => { S.planSalt++; setHtml('#mente-plan', planHtml()); },

  tag: (el) => { toggleSet(S.draft.tags, el.dataset.t); setPressed(el, S.draft.tags.has(el.dataset.t)); },
  sym: (el) => { toggleSet(S.draft.syms, el.dataset.t); setPressed(el, S.draft.syms.has(el.dataset.t)); },
  'entry-mood': (el) => { const v = Number(el.dataset.v); S.draft.mood = S.draft.mood === v ? null : v; setHtml('#ent-mood', draftChipsHtml().mood); },
  'entry-save': () => {
    const t = $('#ent-text').value.trim();
    if (!t && !S.draft.syms.size) { setText('#ent-err', 'Write something or choose a symptom before saving.'); return; }
    setText('#ent-err', '');
    addEntry({ kind: S.draftAct ? 'actividad' : 'nota', act: S.draftAct || null, text: t, mood: S.draft.mood, tags: [...S.draft.tags], syms: [...S.draft.syms] });
    S.draft = { tags: new Set(), syms: new Set(), mood: null }; S.draftAct = null;
    $('#ent-text').value = '';
    refreshDraft();
    setText('#store-status', 'Entry saved.');
  },
  'ent-filter': (el) => { S.entFilter = el.dataset.k; setHtml('#ent-filter', entFilterHtml()); setHtml('#entries', entriesHtml()); },
  'entry-del': (el) => { S.delAsk = el.dataset.id; setHtml('#entries', entriesHtml()); },
  'entry-del-no': () => { S.delAsk = null; setHtml('#entries', entriesHtml()); },
  'entry-del-yes': (el) => { S.delAsk = null; Store.delEntry(el.dataset.id); },

  range: (el) => { settings.range = Number(el.dataset.n); saveSettings(); renderView(); },
  train: (el) => { settings.train = el.dataset.m; saveSettings(); $$('[data-act="train"]').forEach((b) => b.setAttribute('aria-checked', String(b === el))); },
  retrain: () => { retrain(); renderView(); notify({ type: 'sistema', level: 'ok', title: 'Model retrained', body: 'The baseline for the whole crew was updated.' }); },
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
  if (mood <= 2) notify({ type: 'prevencion', level: 'watch', title: 'Thanks for sharing', body: 'This seems like a hard moment. Talking with a crewmate or doing something calm can help.', act: { kind: 'guide', id: 'animo', label: 'What can help' } });
  else notify({ type: 'sistema', level: 'ok', title: 'Check-in saved', body: `We noted that you feel ${moodLabel(mood).toLowerCase()}.` });
}

/* ===== Events ===== */
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
});
document.addEventListener('change', (ev) => {
  if (ev.target.id === 'freq') { settings.freq = ev.target.value; saveSettings(); schedReset(); setText('#rem-info', remInfoText()); }
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

/* ===== Startup ===== */
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
