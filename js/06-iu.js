/* ===== Ayudas de interfaz ===== */
const setHtml = (sel, html) => { const el = typeof sel === 'string' ? $(sel) : sel; if (el && el._h !== html) { el._h = html; el.innerHTML = html; } };
const setText = (sel, t) => { const el = $(sel); if (el && el.textContent !== t) el.textContent = t; };
const pill = (lv, text) => `<span class="pill lvl-${lv}">${icon(LEVELS[lv].ic)}${esc(text || LEVELS[lv].label)}</span>`;
const avatar = (a, me) => `<span class="avatar${me ? ' me' : ''}" aria-hidden="true">${esc(a.ini)}</span>`;
const closeBtn = `<button class="icon-btn" data-act="sheet-close" aria-label="Cerrar">${icon('x')}</button>`;
function ring(value, lv, ic) {
  const r = 21, c = 2 * Math.PI * r, off = c * (1 - clamp(value, 0, 100) / 100);
  return `<span class="ring lvl-${lv}" role="img" aria-label="${value} de 100"><svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="26" r="${r}" class="ring-track"/><circle cx="26" cy="26" r="${r}" class="ring-fill" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 26 26)"/></svg>${icon(ic)}</span>`;
}
const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Buenos días' : h >= 12 && h < 20 ? 'Buenas tardes' : 'Buenas noches'; };
const alertLive = (x) => x.status === 'activa' && Date.now() - x.ts < (x.reason === 'manual' ? 12 * 3600e3 : 20 * 60e3);
const toolBtn = (x) => (x.tool === 'dibujo' ? `<button class="btn btn-soft btn-sm" data-act="draw" data-id="${x.id}">${icon('pencil')}Abrir bloc de dibujo</button>`
  : x.tool === 'respirar' ? `<button class="btn btn-soft btn-sm" data-act="breathe" data-id="${x.id}">${icon('wind')}Respirar con guía</button>`
  : x.tool === 'bitacora' ? `<button class="btn btn-soft btn-sm" data-act="write" data-id="${x.id}">${icon('book')}Escribir en la bitácora</button>` : '');
const go = (h) => { if (location.hash !== '#' + h) location.hash = h; else route(); };

/* ===== Marco: navegación, perfil, campana, simulador ===== */
const NAV = [['inicio', 'Inicio', 'home'], ['mente', 'Mente', 'smile'], ['bitacora', 'Bitácora', 'book'], ['datos', 'Datos', 'chart'], ['equipo', 'Equipo', 'users'], ['guias', 'Guías', 'buoy']];
function renderShell() {
  $('#nav').innerHTML = NAV.map(([id, label, ic]) => `<a href="#${id}" data-nav="${id}">${icon(ic)}<span>${label}</span></a>`).join('');
  $('#sim-btn').innerHTML = `${icon('sliders')}<span>Demo</span>`;
  $('#bell-btn').innerHTML = `${icon('bell')}<span class="badge" id="bell-n" hidden></span>`;
  renderWho(); renderMision(); renderSim(); renderBell();
}
function renderWho() { const a = S.profile; $('#who').innerHTML = `${avatar(a, true)}<span class="who-t"><b>${esc(a.name)}</b><small>${esc(a.role)}</small></span>${icon('down')}`; }
function renderMision() { setText('#mision', `${MISSION.name} · Día ${MISSION.day} de ${MISSION.total} · Hora de a bordo ${fTime(new Date())}`); }
function renderScenChip() {
  const sc = RT[S.profile.id].scen, el = $('#scen-chip');
  el.hidden = sc === 'normal';
  if (sc !== 'normal') el.textContent = 'Simulando: ' + low(SCEN[sc].label);
}
function renderSim() {
  const a = S.profile, rt = RT[a.id];
  setHtml('#sim', `<div class="sim-h"><h2>Simulador</h2><button class="icon-btn" data-act="sim-toggle" aria-label="Cerrar simulador">${icon('x')}</button></div>
    <p class="hint">Esta versión no tiene un sensor real conectado. Elige qué registra el sensor de <b>${esc(a.short)}</b> y mira cómo responde Stellar Health.</p>
    <div class="opts" role="radiogroup" aria-label="Escenario del sensor">${Object.keys(SCEN).map((id) => `<button class="scen" role="radio" aria-checked="${rt.scen === id}" data-act="scen" data-id="${id}"><b>${esc(SCEN[id].label)}</b><small>${esc(SCEN[id].desc)}</small></button>`).join('')}</div>
    <label class="switch"><input type="checkbox" id="demo-on" ${settings.demo ? 'checked' : ''}><span><b>Tiempos de demostración</b><br><span class="hint">Recordatorios cada 90 segundos y aviso por alerta continua a los 45 segundos. Sin esto: según el plan de cada tripulante y a los 10 minutos.</span></span></label>
    <div class="row"><button class="btn btn-soft btn-sm" data-act="send-act">Proponer una actividad</button><button class="btn btn-soft btn-sm" data-act="send-check">Pedir un check-in</button></div>`);
  renderScenChip();
}
const noteIcon = (n) => (n.type === 'alerta' ? LEVELS[n.level].ic : n.type === 'prevencion' ? 'shield' : n.type === 'actividad' ? 'star' : n.type === 'checkin' ? 'smile' : n.type === 'equipo' ? 'users' : n.level === 'ok' ? 'check' : 'info');
const noteCls = (n) => (n.type === 'actividad' || n.type === 'checkin' ? 'n-act' : '');
function renderBell() {
  const n = NOTES.filter((x) => !x.read).length, b = $('#bell-n');
  if (!b) return;
  b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n);
  if (!$('#bell-pop').hidden) renderBellPop();
}
function renderBellPop() {
  $('#bell-pop').innerHTML = `<div class="pop-h"><h2>Notificaciones</h2>${NOTES.some((x) => !x.read) ? '<button class="btn btn-ghost btn-sm" data-act="notes-read">Marcar como leídas</button>' : ''}</div>` +
    (NOTES.length ? NOTES.map((n) => `<button class="nitem lvl-${n.level}${n.read ? '' : ' unread'}" data-act="note-open" data-id="${n.id}"><span class="insight-ic ${noteCls(n)}">${icon(noteIcon(n))}</span><span><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><time>${ago(n.ts)}</time></span></button>`).join('')
      : '<div class="empty"><b>Nada por ahora</b><span>Aquí verás alertas, avisos de prevención, actividades y check-ins.</span></div>');
}
function showToast(n) {
  const box = $('#toasts'), el = document.createElement('div');
  el.className = `toast lvl-${n.level}`;
  el.dataset.id = n.id;
  let extra = '';
  if (n.faces) extra = `<div class="faces faces-sm" role="group" aria-label="¿Cómo te sientes?">${MOODS.map((m) => `<button class="face" data-act="tmood" data-v="${m.v}" data-id="${n.id}" aria-label="${m.label}" title="${m.label}">${faceSvg(m.v)}</button>`).join('')}</div>`;
  else if (n.actId) { const x = actById(n.actId); extra = `<div class="row">${toolBtn(x)}<button class="btn btn-primary btn-sm" data-act="act-done" data-id="${x.id}" data-toast="${n.id}">${icon('check')}Hecho</button><button class="btn btn-ghost btn-sm" data-act="toast-close" data-id="${n.id}">Ahora no</button></div>`; }
  else if (n.act) extra = `<div class="row"><button class="btn btn-soft btn-sm" data-act="note-open" data-id="${n.id}">${esc(n.act.label)}</button></div>`;
  el.innerHTML = `<span class="insight-ic ${noteCls(n)}">${icon(noteIcon(n))}</span><div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p>${extra}</div><button class="icon-btn" data-act="toast-close" data-id="${n.id}" aria-label="Cerrar aviso">${icon('x')}</button>`;
  box.prepend(el);
  while (box.children.length > 3) box.lastChild.remove();
  setTimeout(() => el.remove(), n.level === 'alert' || n.level === 'emergency' ? 20000 : n.faces || n.actId ? 30000 : 9000);
}
const killToast = (id) => { const el = $(`.toast[data-id="${id}"]`); if (el) el.remove(); };

/* ===== Avisos globales: episodio propio y alertas de otros tripulantes ===== */
function crewBlock(a, rt) {
  const ep = rt.ep, now = Date.now(), lv = LV[ep.top.level];
  if (ep.sent) {
    const al = Store.alerts.find((x) => x.id === ep.sent);
    const who = al ? Object.keys(al.acks).map((id) => crewById(id).short) : [];
    return { html: `<p><b>Tripulación avisada.</b> ${who.length ? esc(who.join(' y ')) + (who.length > 1 ? ' van' : ' va') + ' en camino.' : 'Esperando su respuesta.'}</p>` };
  }
  if (ep.count) {
    const left = Math.max(0, ep.count.until - now);
    return { left: `${Math.ceil(left / 1000)} s`, pct: 100 - (left / T_COUNT) * 100,
      html: `<p><b>Avisando a la tripulación en <span data-dyn="left"></span></b> porque ${ep.count.reason === 'grave' ? 'la emergencia es grave' : 'la alerta continúa'}.</p><div class="bar"><i data-dyn="bar"></i></div><div class="row"><button class="btn btn-crit btn-sm" data-act="crew-now">Avisar ahora</button><button class="btn btn-ghost btn-sm" data-act="crew-cancel">No avisar: estoy bien</button></div>` };
  }
  if (ep.cancelLv >= lv) return { html: `<p>No se avisó a la tripulación. Si empeora, te lo volveremos a proponer.</p><div class="row"><button class="btn btn-ghost btn-sm" data-act="crew-now">Avisar ahora</button></div>` };
  const left = Math.max(0, tCont() - (now - ep.start));
  return { left: mmss(left), pct: (1 - left / tCont()) * 100,
    html: `<p>Si la alerta continúa, avisaremos a la tripulación en <b data-dyn="left"></b>.</p><div class="bar"><i data-dyn="bar"></i></div><div class="row"><button class="btn btn-ghost btn-sm" data-act="crew-now">Avisar ahora</button></div>` };
}
function paintDyn(root, blk) {
  if (!root) return;
  const l = $('[data-dyn="left"]', root), b = $('[data-dyn="bar"]', root);
  if (l && blk.left != null) l.textContent = blk.left;
  if (b && blk.pct != null) b.style.width = clamp(blk.pct, 0, 100).toFixed(0) + '%';
}
function renderAlertSlot() {
  const a = S.profile, rt = RT[a.id], me = a.id, el = $('#alerts-slot');
  let html = '', blk = null;
  Store.alerts.filter((x) => alertLive(x) && x.from !== me).slice(0, 3).forEach((x) => {
    html += `<section class="banner lvl-${x.level}" role="alert"><div class="banner-h"><span class="banner-ic">${icon(x.level === 'emergency' ? 'octagon' : 'alert')}</span><div><h2>${esc(x.title)}</h2><p>${esc(x.detail)}</p></div></div>
      <div class="row">${x.acks[me] ? '<span class="tag">Avisaste que vas en camino</span>' : `<button class="btn btn-primary btn-sm" data-act="ack" data-id="${esc(x.id)}">Voy en camino</button>`}${x.guide ? `<button class="btn btn-ghost btn-sm" data-act="guide" data-id="${x.guide}" data-helper="1">Cómo ayudar</button>` : ''}<a class="btn btn-ghost btn-sm" href="#equipo">Ver en Equipo</a></div></section>`;
  });
  Store.alerts.filter((x) => alertLive(x) && x.from === me && x.reason === 'manual').slice(0, 1).forEach((x) => {
    const who = Object.keys(x.acks).map((id) => crewById(id).short);
    html += `<section class="banner lvl-${x.level}"><div class="banner-h"><span class="banner-ic">${icon('send')}</span><div><h2>Tu aviso a la tripulación está activo</h2><p>${who.length ? esc(who.join(' y ')) + (who.length > 1 ? ' van' : ' va') + ' en camino.' : 'Esperando respuesta de tus compañeros.'}</p></div></div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-act="resolve" data-id="${esc(x.id)}">Ya estoy bien: marcar como resuelta</button></div></section>`;
  });
  if (rt.ep) {
    const top = rt.ep.top, c = COND[top.code], lv = top.level;
    blk = crewBlock(a, rt);
    html += `<section class="banner lvl-${lv}" role="alert"><div class="banner-h"><span class="banner-ic">${icon(LEVELS[lv].ic)}</span><div><h2>${LEVELS[lv].label}: ${esc(c.n)}</h2><p>${esc(c.s)}</p></div></div>
      <div class="banner-crew">${blk.html}</div>
      <div class="row"><button class="btn btn-primary btn-sm" data-act="${lv === 'emergency' ? 'emer' : 'guide'}" data-id="${c.guide}">Ver qué hacer, paso a paso</button></div></section>`;
  }
  setHtml(el, html);
  if (blk) paintDyn(el, blk);
}
function renderEmCrew() {
  const rt = RT[S.profile.id], el = $('#em-crew');
  if (!el || !rt.ep) return;
  const blk = crewBlock(S.profile, rt);
  setHtml(el, blk.html);
  paintDyn(el, blk);
}

/* ===== Inicio ===== */
const TILES = [
  { k: 'temp', name: 'Temperatura', unit: '°C', ic: 'thermo' },
  { k: 'hr', name: 'Ritmo cardíaco', unit: 'lpm', ic: 'heart' },
  { k: 'rr', name: 'Respiración', unit: 'rpm', ic: 'wind' },
  { k: 'spo2', name: 'Oxígeno en sangre', unit: '% SpO₂', ic: 'drop' },
  { k: 'sleep', name: 'Sueño de anoche', unit: 'h', ic: 'moon' },
  { k: 'act', name: 'Movimiento', unit: 'cuentas/min', ic: 'watch' },
];
const STATE_TXT = { reposo: 'En reposo', ejercicio: 'Ejercicio', recuperacion: 'Recuperación' };
function enfoqueHtml(kind, st) {
  return `${ring(st.index, st.level, kind === 'cuerpo' ? 'pulse' : 'smile')}<div class="enf-t"><p class="enf-name">${kind === 'cuerpo' ? 'Cuerpo' : 'Mente'}</p><p class="enf-idx"><b>${st.index}</b><span>de 100</span></p></div>${pill(st.level)}<p class="enf-why">${esc(st.why)}</p>`;
}
function summaryText(st) {
  const b = { ok: 'Tu cuerpo está estable', watch: 'Tu cuerpo pide un poco de atención', alert: 'Tu cuerpo necesita cuidado ahora', emergency: 'Emergencia física: sigue la guía ahora' }[st.body.level];
  const m = { ok: 'tu mente está bien', watch: 'tu mente necesita un poco de cuidado', alert: 'tu mente necesita apoyo', emergency: 'necesitas apoyo ahora' }[st.mind.level];
  return `${b} y ${m}.`;
}
const insightHtml = (i) => `<article class="insight lvl-${i.level}"><span class="insight-ic">${icon(i.ic)}</span><div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p><p class="tipline">${esc(i.tip)}</p><div class="row">${pill(i.level, i.level === 'alert' ? 'Alerta' : 'Prevención')}${i.guide ? `<button class="btn btn-soft btn-sm" data-act="guide" data-id="${i.guide}">Qué hacer</button>` : ''}${i.share ? `<button class="btn btn-ghost btn-sm" data-act="sos" data-kind="${i.dom}">Avisar a la tripulación</button>` : ''}</div></div></article>`;
function prevHtml(st) {
  const items = [];
  [...st.body.conds, ...st.mind.conds].filter((c) => c.level === 'watch').forEach((c) => {
    const k = COND[c.code];
    items.push(`<article class="insight lvl-watch"><span class="insight-ic">${icon('eye')}</span><div><h3>${esc(cap(k.n))}</h3><p>${esc(k.s)}</p><div class="row">${pill('watch', 'Ahora')}<button class="btn btn-soft btn-sm" data-act="guide" data-id="${k.guide}">Qué hacer</button></div></div></article>`);
  });
  [...st.body.ins, ...st.mind.ins].forEach((i) => items.push(insightHtml(i)));
  return items.length ? items.join('') : '<div class="empty"><b>Todo en orden</b><span>No hay tendencias que vigilar. Stellar Health revisa tus datos cada minuto.</span></div>';
}
function suggestionHtml() {
  const x = actById(S.suggestion) || ACTS[0];
  return `${isRestTime() ? '<p class="note" style="margin-bottom:10px">Es tu periodo de sueño. Si no puedes dormir, prueba algo tranquilo y con poca luz.</p>' : ''}
    <div class="sticker"><p class="cat">${CATS[x.cat]} · ${x.min} min</p><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p>
    <div class="row">${toolBtn(x)}<button class="btn btn-primary btn-sm" data-act="act-done" data-id="${x.id}">${icon('check')}Hecho</button><button class="btn btn-ghost btn-sm" data-act="act-next">Otra idea</button></div></div>`;
}
const nextRemText = () => (RT[S.profile.id].ep ? 'Recordatorios en pausa durante la alerta' : `Próxima idea en ${mmss(SCHED.nextAct - Date.now())}`);
const VIEWS = {}, AFTER = {};
VIEWS.inicio = () => {
  const a = S.profile;
  return `<section class="ventana" aria-labelledby="saludo">
    <canvas class="sky" id="sky" aria-hidden="true"></canvas>
    <div class="ventana-in">
      <div class="ventana-top">
        <div class="ventana-txt"><p class="eyebrow">${esc(MISSION.name)} · Día ${MISSION.day} de ${MISSION.total}</p><h1 id="saludo">${greeting()}, ${esc(a.short)}</h1><p class="lede" id="resumen"></p></div>
        <button class="glass-btn" data-act="perfil">${avatar(a)}<span>Cambiar tripulante</span></button>
      </div>
      <div class="enfoques"><a class="enfoque" href="#datos" id="enf-cuerpo" aria-label="Estado del cuerpo. Ver datos"></a><a class="enfoque" href="#mente" id="enf-mente" aria-label="Estado de la mente. Ver plan"></a></div>
    </div>
  </section>
  <section aria-labelledby="h-vit">
    <div class="sec-h"><h2 id="h-vit">Signos vitales ahora</h2><p class="sensor" id="sensor"></p></div>
    <div class="vitals">${TILES.map((t) => `<article class="tile"><div class="tile-h"><span class="tile-ic">${icon(t.ic)}</span><h3>${t.name}</h3></div>
      <p class="tile-val"><span class="num" id="tv-${t.k}">–</span><span class="unit">${t.unit}</span><span class="tile-p" id="tp-${t.k}"></span></p>
      <div id="sp-${t.k}"></div><p class="tile-foot" id="tf-${t.k}"></p></article>`).join('')}</div>
  </section>
  <div class="cols">
    <section aria-labelledby="h-prev"><div class="sec-h"><h2 id="h-prev">Prevención</h2><p class="hint">Lo que tus datos anuncian antes de que sea un problema</p></div><div class="panel" id="prev"></div></section>
    <section aria-labelledby="h-ani"><div class="sec-h"><h2 id="h-ani">Para tu ánimo</h2><p class="hint" id="next-rem"></p></div><div id="sugerencia"></div></section>
  </div>`;
};
function liveSeries(k) { return RT[S.profile.id].buf.map((s) => ({ t: s.t, v: s[k] })); }
AFTER.inicio = () => {
  const a = S.profile, st = M[a.id].stats;
  const xf = (t) => { const s = Math.round((Date.now() - t) / 1000); return s < 3 ? 'ahora' : `hace ${s} s`; };
  const mk = (k, fmt, unit, minSpan, band, extra) => { CH[k] = makeChart($('#sp-' + k), { compact: true, data: liveSeries(k), fmt, unit, minSpan, band, xfmt: xf, aria: 'Últimos tres minutos', ...extra }); };
  mk('temp', f1, '°C', 0.8, st.temp);
  mk('hr', f0, 'lpm', 16, st.hr);
  mk('rr', f0, 'rpm', 7, st.rr);
  mk('spo2', f0, '%', 4, { lo: st.spo2.lo, hi: Math.min(100, st.spo2.hi) }, { yMax: 100 });
  mk('act', f0, 'cuentas/min', 200, null, { yMin: 0 });
  CH.sleep = makeChart($('#sp-sleep'), { compact: true, kind: 'bar', data: sleepSeries(a, 7), fmt: f1, unit: 'h', yMin: 0, refs: [{ v: a.need }], xfmt: (t) => 'noche del ' + fDay(addDays(t, -1)), aria: 'Horas de sueño de las últimas 7 noches' });
  setHtml('#sugerencia', suggestionHtml());
  startSky();
  renderInicioLive();
};
function sleepSeries(a, n) {
  const ds = H[a.id].days.filter((d) => d.sleepH != null).slice(-n).map((d) => ({ t: d.date, v: d.sleepH }));
  const o = nightOverride(a);
  if (o && ds.length) ds[ds.length - 1].v = o.sleepH;
  return ds;
}
function renderInicioLive() {
  const a = S.profile, rt = RT[a.id], last = rt.buf[rt.buf.length - 1], lv = rt.last ? rt.last.lv : {}, s = M[a.id].stats, st = S.state;
  setText('#resumen', summaryText(st));
  setHtml('#enf-cuerpo', enfoqueHtml('cuerpo', st.body));
  setHtml('#enf-mente', enfoqueHtml('mente', st.mind));
  setText('#sensor', `Sensor de ${a.short} conectado`);
  const set = (k, val, pl, foot) => { setText('#tv-' + k, val); setHtml('#tp-' + k, pl); setText('#tf-' + k, foot); };
  const rest = last.state === 'reposo';
  set('temp', f1(last.temp), pill(lv.temp || 'ok'), `Tu rango habitual: ${f1(s.temp.lo)} a ${f1(s.temp.hi)}`);
  set('hr', f0(last.hr), pill(lv.hr || 'ok'), rest ? `Tu rango en reposo: ${f0(s.hr.lo)} a ${f0(s.hr.hi)}` : 'Con ejercicio es normal que suba');
  set('rr', f0(last.rr), pill(lv.rr || 'ok'), rest ? `Tu rango en reposo: ${f0(s.rr.lo)} a ${f0(s.rr.hi)}` : 'Con ejercicio es normal que suba');
  set('spo2', f0(last.spo2), pill(lv.spo2 || 'ok'), `Tu rango habitual: ${f0(s.spo2.lo)} a ${f0(Math.min(100, s.spo2.hi))}`);
  const n = lastNight(a), si = (INS[a.id] || []).find((i) => i.id === 'sueno' || i.id === 'eficiencia');
  set('sleep', f1(n.sleepH), pill(si ? si.level : 'ok'), `Eficiencia ${f0(n.eff)} % · ${n.awak} ${n.awak === 1 ? 'despertar' : 'despertares'}`);
  set('act', f0(last.act), `<span class="tag">${STATE_TXT[last.state]}</span>`, 'Actigrafía: movimiento de la muñeca');
  ['temp', 'hr', 'rr', 'spo2', 'act'].forEach((k) => { if (CH[k]) CH[k].update(liveSeries(k)); });
  if (CH.sleep) CH.sleep.update(sleepSeries(a, 7));
  setHtml('#prev', prevHtml(st));
  setText('#next-rem', nextRemText());
}

/* ===== Mente ===== */
function mindCardHtml() {
  const m = S.state.mind;
  return `<h2>Bienestar mental</h2>
    <div class="idx-row">${ring(m.index, m.level, 'smile')}<p class="idx-n"><b>${m.index}</b><span>de 100</span></p>${pill(m.level)}</div>
    <p class="hint">Se calcula con tus registros de ánimo y tensión, tu sueño, tu pulso en reposo, tus actividades y la etapa de la misión.</p>
    <h3>Qué influye ahora</h3>
    <ul class="drivers">${m.drivers.map((d) => `<li><span>${esc(d.label)}<small>${esc(d.detail)}</small></span><span class="drv ${d.pts < 0 ? 'neg' : 'pos'}">${d.pts > 0 ? '+' : '−'}${Math.abs(d.pts)}</span></li>`).join('') || '<li><span>Nada destacable por ahora</span></li>'}</ul>`;
}
function planHtml() {
  const a = S.profile, p = buildPlan(a, S.state), tk = dayKey(new Date());
  return `<div class="sec-h"><h2 id="h-plan">Tu plan de cuidado</h2><button class="btn btn-ghost btn-sm" data-act="plan-regen">${icon('refresh')}Cambiar actividades</button></div>
    <p class="note">Hecho para ${esc(a.short)} con sus datos de sueño, ánimo, tensión y signos vitales, y con la etapa de la misión. Se ajusta solo cuando esos datos cambian.</p>
    <div class="plan-meta"><span class="kv"><b>${p.chkDay}</b> check-ins al día</span><span class="kv"><b>${p.actsDay}</b> actividades al día</span><span class="kv">Estado actual: <b>${LEVELS[S.state.mind.level].label}</b></span></div>
    <div class="focos">${p.focos.map((f) => `<article class="foco"><h3>${esc(f.title)}</h3><p class="why">${esc(f.why)}</p><ul>${f.todo.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></article>`).join('')}</div>
    <h3 class="sub">Tu semana</h3>
    <ol class="semana">${p.semana.map((d) => `<li class="dia${dayKey(d.date) === tk ? ' hoy' : ''}"><h4>${dayKey(d.date) === tk ? 'Hoy' : esc(fWDay(d.date))}</h4><ul>${d.items.map(([t, txt]) => `<li><time>${hm(t)}</time><span>${esc(txt)}</span></li>`).join('')}</ul></li>`).join('')}</ol>
    <h3 class="sub">Quién te apoya</h3>
    <ul class="apoyo">${p.apoyo.map(([n, t]) => `<li><b>${esc(n)}:</b> ${esc(t)}</li>`).join('')}</ul>`;
}
function actsHtml() {
  const a = S.profile, tk = dayKey(new Date());
  const done = new Set(Store.entries.filter((e) => e.crew === a.id && e.kind === 'actividad' && e.act && dayKey(new Date(e.ts)) === tk).map((e) => e.act));
  return ACTS.filter((x) => S.actFilter === 'todas' || x.cat === S.actFilter).map((x) => `<article class="act${done.has(x.id) ? ' done' : ''}"><p class="cat">${CATS[x.cat]} · ${x.min} min</p><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p>
    <div class="row">${toolBtn(x)}<button class="btn ${done.has(x.id) ? 'btn-ghost' : 'btn-primary'} btn-sm" data-act="act-done" data-id="${x.id}">${icon('check')}${done.has(x.id) ? 'Hecho hoy' : 'Hecho'}</button></div></article>`).join('');
}
const actFilterHtml = () => [['todas', 'Todas'], ...Object.entries(CATS)].map(([k, l]) => `<button class="chip" data-act="act-filter" data-k="${k}" aria-pressed="${S.actFilter === k}">${l}</button>`).join('');
function lastCheckinText() {
  const e = Store.entries.find((x) => x.crew === S.profile.id && x.kind === 'checkin');
  return e ? `Último check-in: ${moodLabel(e.mood).toLowerCase()}, ${ago(e.ts)}` : 'Aún no has hecho ningún check-in hoy';
}
function remInfoText() {
  const p = planNow(), now = Date.now();
  return (settings.demo ? 'Tiempos de demostración activos: los recordatorios llegan cada 90 segundos. Puedes cambiarlo en Demo. ' : '') +
    `Tu plan pide ${p.chkDay} check-ins y ${p.actsDay} actividades al día. Próxima actividad en ${mmss(SCHED.nextAct - now)} y próximo check-in en ${mmss(SCHED.nextChk - now)}.`;
}
function moodSeries(a, n) { return H[a.id].days.slice(-n).map((d) => ({ t: d.date, v: moodOf(a, d) })).filter((p) => p.v != null); }
VIEWS.mente = () => `<header class="vh"><h1>Mente</h1><p>Cómo estás hoy y qué te ayuda en esta etapa de la misión.</p></header>
  <div class="cols">
    <section class="card" aria-labelledby="h-chk"><h2 id="h-chk">¿Cómo te sientes ahora?</h2>
      <div class="faces" role="radiogroup" aria-label="Estado de ánimo">${MOODS.map((m) => `<button class="face" role="radio" aria-checked="${S.chk.mood === m.v}" data-act="mood" data-v="${m.v}">${faceSvg(m.v)}<span>${m.label}</span></button>`).join('')}</div>
      <p class="lbl" id="l-ten">¿Cuánta tensión sientes?</p>
      <div class="chips" role="radiogroup" aria-labelledby="l-ten">${TENSION.map((t, i) => `<button class="chip" role="radio" aria-checked="${S.chk.tension === i + 1}" data-act="tension" data-v="${i + 1}">${t}</button>`).join('')}</div>
      <label class="lbl" for="chk-note">¿Quieres contar algo más? (opcional)</label>
      <textarea id="chk-note" rows="2" maxlength="600" placeholder="Por ejemplo: extraño a mi familia, hoy salió bien el experimento, estoy cansado…"></textarea>
      <div class="row"><button class="btn btn-primary" data-act="checkin-save" id="chk-save" ${S.chk.mood ? '' : 'disabled'}>Guardar check-in</button><p class="hint" id="chk-last"></p></div>
    </section>
    <section class="card" id="mente-idx" aria-label="Bienestar mental"></section>
  </div>
  <section id="mente-plan" aria-labelledby="h-plan"></section>
  <section aria-labelledby="h-acts"><div class="sec-h"><h2 id="h-acts">Actividades para el ánimo</h2><div class="chips" id="act-filter" role="group" aria-label="Tipo de actividad"></div></div><div class="acts" id="acts"></div></section>
  <section class="card" aria-labelledby="h-rem"><h2 id="h-rem">Recordatorios</h2>
    <p>Durante el día, Stellar Health te propone actividades cortas y te pregunta cómo estás.</p>
    <div class="row"><label class="lbl" for="freq">Actividades</label><select id="freq">${[['plan', 'Según mi plan de cuidado'], ['30', 'Cada 30 minutos'], ['60', 'Cada hora'], ['120', 'Cada 2 horas'], ['240', 'Cada 4 horas']].map(([v, l]) => `<option value="${v}" ${String(settings.freq) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <p class="hint" id="rem-info"></p>
    <div class="row"><button class="btn btn-soft btn-sm" data-act="send-act">Proponer una actividad ahora</button><button class="btn btn-soft btn-sm" data-act="send-check">Preguntarme cómo estoy</button></div>
  </section>
  <section aria-labelledby="h-mood"><div class="sec-h"><h2 id="h-mood">Tu ánimo en los últimos 14 días</h2><p class="hint">Escala de 1 (muy mal) a 5 (muy bien)</p></div><div class="ccard"><div id="ch-mood"></div></div></section>`;
function refreshMente() {
  setHtml('#mente-idx', mindCardHtml());
  setHtml('#mente-plan', planHtml());
  setHtml('#act-filter', actFilterHtml());
  setHtml('#acts', actsHtml());
  setText('#chk-last', lastCheckinText());
  setText('#rem-info', remInfoText());
  if (CH.mood) CH.mood.update(moodSeries(S.profile, 14));
}
AFTER.mente = () => {
  const a = S.profile, st = M[a.id].stats;
  CH.mood = makeChart($('#ch-mood'), { color: 'var(--mind)', data: moodSeries(a, 14), fmt: f1, tick: f0, unit: 'de 5', yMin: 1, yMax: 5, height: 170, band: { lo: Math.max(1, st.mood.lo), hi: Math.min(5, st.mood.hi) }, xfmt: fDay, aria: `Ánimo diario de ${a.short} en los últimos 14 días` });
  refreshMente();
};

/* ===== Bitácora ===== */
const storeStatusText = () => (Store.cloudEntries ? 'Se guarda en tu cuenta. Solo tú puedes verla.' : Store.status === 'conectando' ? 'Conectando con tu cuenta…' : 'Se guarda solo en este dispositivo.');
function entriesHtml() {
  const a = S.profile;
  const list = Store.entries.filter((e) => e.crew === a.id && (S.entFilter === 'todo' || e.kind === S.entFilter));
  if (!list.length) return `<li class="empty"><b>${S.entFilter === 'todo' ? `Aún no hay entradas de ${esc(a.short)}` : 'No hay entradas de este tipo'}</b><span>Empieza por algo sencillo: cómo dormiste, lo mejor del día o un síntoma que quieras recordar.</span></li>`;
  return list.slice(0, 150).map((e) => {
    const d = new Date(e.ts);
    const kind = e.kind === 'checkin' ? 'Check-in' : e.kind === 'actividad' ? 'Actividad' : 'Nota';
    let body;
    if (e.kind === 'checkin') body = `${faceSvg(e.mood, 'mini-face')} <b>${moodLabel(e.mood)}</b>${e.stress ? ` · tensión: ${TENSION[e.stress - 1].toLowerCase()}` : ''}${e.text ? `<br>${esc(e.text)}` : ''}`;
    else if (e.kind === 'actividad') body = esc(e.text || (actById(e.act) || {}).t || 'Actividad');
    else body = `${e.mood ? faceSvg(e.mood, 'mini-face') + ' ' : ''}${esc(e.text)}`;
    const chips = [...e.tags, ...e.syms].map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    return `<li class="entry"><div class="entry-meta"><span class="entry-kind">${kind}</span><time>${esc(fWDay(d))} · ${fTime(d)}</time>${chips}</div>
      <button class="icon-btn" data-act="entry-del" data-id="${esc(e.id)}" aria-label="Borrar entrada">${icon('trash')}</button>
      <p class="entry-text">${body}</p>${e.img ? `<img src="${e.img}" alt="Dibujo guardado en la bitácora" width="220" height="220">` : ''}
      ${S.delAsk === e.id ? `<div class="confirm"><span>¿Borrar esta entrada? No se puede deshacer.</span><button class="btn btn-crit btn-sm" data-act="entry-del-yes" data-id="${esc(e.id)}">Sí, borrar</button><button class="btn btn-ghost btn-sm" data-act="entry-del-no">Cancelar</button></div>` : ''}</li>`;
  }).join('');
}
const entFilterHtml = () => [['todo', 'Todo'], ['nota', 'Notas'], ['checkin', 'Check-ins'], ['actividad', 'Actividades']].map(([k, l]) => `<button class="chip" data-act="ent-filter" data-k="${k}" aria-pressed="${S.entFilter === k}">${l}</button>`).join('');
const draftChipsHtml = () => ({
  tags: TAGS.map((t) => `<button class="chip" data-act="tag" data-t="${t}" aria-pressed="${S.draft.tags.has(t)}">${t}</button>`).join(''),
  syms: SYMS.map((t) => `<button class="chip" data-act="sym" data-t="${t}" aria-pressed="${S.draft.syms.has(t)}">${t}</button>`).join(''),
  mood: MOODS.map((m) => `<button class="face" role="radio" aria-checked="${S.draft.mood === m.v}" aria-label="${m.label}" title="${m.label}" data-act="entry-mood" data-v="${m.v}">${faceSvg(m.v)}</button>`).join(''),
});
function refreshDraft() { const h = draftChipsHtml(); setHtml('#ent-tags', h.tags); setHtml('#ent-sym', h.syms); setHtml('#ent-mood', h.mood); }
VIEWS.bitacora = () => `<header class="vh"><h1>Bitácora</h1><p>Tu registro personal de lo que el sensor no ve: síntomas, cómo dormiste, cómo va el trabajo o lo que quieras recordar.</p></header>
  <section class="card" aria-label="Nueva entrada">
    <label class="lbl" for="ent-text">Nueva entrada</label>
    <textarea id="ent-text" rows="3" maxlength="2000" placeholder="Escribe aquí lo que quieras registrar…"></textarea>
    <p class="lbl">Etiquetas</p><div class="chips" id="ent-tags" role="group" aria-label="Etiquetas"></div>
    <p class="lbl">Síntomas rápidos</p><div class="chips" id="ent-sym" role="group" aria-label="Síntomas"></div>
    <p class="lbl">¿Cómo te sientes? (opcional)</p><div class="faces faces-sm" id="ent-mood" role="radiogroup" aria-label="Estado de ánimo" style="max-width:260px"></div>
    <div class="row"><button class="btn btn-primary" data-act="entry-save">Guardar en la bitácora</button><p class="hint" id="store-status"></p></div>
    <p class="hint" id="ent-err" role="alert"></p>
  </section>
  <section aria-labelledby="h-ent"><div class="sec-h"><h2 id="h-ent">Tus entradas</h2><div class="chips" id="ent-filter" role="group" aria-label="Tipo de entrada"></div></div><ul class="entries" id="entries"></ul></section>`;
AFTER.bitacora = () => {
  refreshDraft();
  setHtml('#ent-filter', entFilterHtml());
  setHtml('#entries', entriesHtml());
  setText('#store-status', storeStatusText());
  if (S.prefill) { const t = $('#ent-text'); t.value = S.prefill; S.prefill = null; t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
};

/* ===== Datos: archivo y modelo ===== */
const SERIES = [
  { k: 'temp', name: 'Temperatura', unit: '°C', ic: 'thermo', fmt: f1, minSpan: 1 },
  { k: 'hr', name: 'Pulso en reposo', unit: 'lpm', ic: 'heart', fmt: f0, minSpan: 14 },
  { k: 'rr', name: 'Respiración en reposo', unit: 'rpm', ic: 'wind', fmt: f1, minSpan: 5 },
  { k: 'spo2', name: 'Oxígeno en sangre', unit: '%', ic: 'drop', fmt: f1, minSpan: 4, yMax: 100 },
  { k: 'sleepH', name: 'Sueño por noche', unit: 'h', ic: 'moon', fmt: f1, kind: 'bar', yMin: 0 },
  { k: 'mood', name: 'Ánimo', unit: 'de 5', ic: 'smile', fmt: f1, yMin: 1, yMax: 5, mind: true },
];
function dayLevel(a, d) {
  const p = personalLimits(a);
  let lv = 0;
  if (d.temp >= 38 || d.hr >= 120 || d.rr >= 24 || d.spo2 <= 90) lv = 2;
  else if (d.temp >= p.temp || d.hr >= p.hr || d.rr >= p.rr || d.spo2 <= p.spo2) lv = 1;
  const m = moodOf(a, d);
  if ((d.sleepH != null && d.sleepH < 5.5) || (m != null && m <= 2.4)) lv = Math.max(lv, 1);
  return LVN[lv];
}
function tableHtml(a, n) {
  const days = H[a.id].days.slice(-n).reverse();
  return `<table><thead><tr><th>Fecha</th><th>Temp. °C</th><th>Pulso lpm</th><th>Resp. rpm</th><th>SpO₂ %</th><th>Sueño h</th><th>Eficiencia %</th><th>Despertares</th><th>Ejercicio min</th><th>Ánimo</th><th>Estado</th></tr></thead><tbody>${days.map((d) => {
    const mo = moodOf(a, d);
    return `<tr><td>${esc(fWDay(d.date))}${d.off === 0 ? ' · hoy' : ''}</td><td>${f1(d.temp)}</td><td>${f0(d.hr)}</td><td>${f1(d.rr)}</td><td>${f1(d.spo2)}</td><td>${d.sleepH == null ? '–' : f1(d.sleepH)}</td><td>${d.eff == null ? '–' : f0(d.eff)}</td><td>${d.awak == null ? '–' : d.awak}</td><td>${d.exMin}</td><td>${mo == null ? '–' : f1(mo)}</td><td>${pill(dayLevel(a, d))}</td></tr>`;
  }).join('')}</tbody></table>`;
}
function csvText(a, n) {
  const rows = [['fecha', 'temperatura_c', 'pulso_lpm', 'respiracion_rpm', 'spo2_pct', 'sueno_h', 'eficiencia_pct', 'despertares', 'ejercicio_min', 'animo_1a5', 'estado']];
  const q = (v, d) => (v == null ? '' : Number(v).toFixed(d));
  H[a.id].days.slice(-n).forEach((d) => rows.push([d.key, q(d.temp, 2), q(d.hr, 1), q(d.rr, 1), q(d.spo2, 1), q(d.sleepH, 2), q(d.eff, 0), d.awak == null ? '' : d.awak, d.exMin, q(moodOf(a, d), 1), LEVELS[dayLevel(a, d)].label]));
  return rows.map((r) => r.join(',')).join('\n') + '\n';
}
function modelHtml(a) {
  const m = M[a.id], s = m.stats, p = personalLimits(a);
  const rows = [
    ['Temperatura', `${f1(s.temp.mean)} °C`, `${f1(s.temp.lo)} a ${f1(s.temp.hi)} °C`, `desde ${f1(p.temp)} °C`, `desde ${f1(38)} °C`, `desde ${f1(39.5)} °C`],
    ['Pulso en reposo', `${f0(s.hr.mean)} lpm`, `${f0(s.hr.lo)} a ${f0(s.hr.hi)} lpm`, `desde ${f0(p.hr)} lpm`, 'desde 120 lpm', 'desde 140 lpm'],
    ['Respiración en reposo', `${f1(s.rr.mean)} rpm`, `${f0(s.rr.lo)} a ${f0(s.rr.hi)} rpm`, `desde ${f1(p.rr)} rpm`, 'desde 24 rpm', 'desde 30 rpm'],
    ['Oxígeno en sangre', `${f1(s.spo2.mean)} %`, `${f0(s.spo2.lo)} a ${f0(Math.min(100, s.spo2.hi))} %`, `${f1(p.spo2)} % o menos`, '90 % o menos', '85 % o menos'],
    ['Sueño', `${f1(s.sleepH.mean)} h`, `${f1(s.sleepH.lo)} a ${f1(s.sleepH.hi)} h`, 'una noche de menos de 5 h, o 5 h de deuda', '9 h de deuda en 5 noches', 'no aplica'],
  ];
  return `<div class="sec-h"><h2 id="h-mod">Modelo personal</h2><span class="kv">Entrenado con <b>${m.n} días</b> · del ${esc(fDay(m.from))} al ${esc(fDay(m.to))}</span></div>
    <p class="note" style="margin-bottom:12px">Stellar Health no compara a ${esc(a.short)} con un promedio de la Tierra. Aprende cómo son sus valores cuando está bien y avisa cuando se aleja de ellos. En el espacio lo habitual cambia: por ejemplo, la temperatura corporal tiende a subir en misiones largas, así que la línea base se aprende durante el vuelo.</p>
    <div class="table-wrap"><table class="model"><thead><tr><th>Indicador</th><th>Línea base</th><th>Rango habitual</th><th>Atención</th><th>Alerta</th><th>Emergencia</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="txt"><b>${r[0]}</b></td>${r.slice(1).map((c) => `<td class="txt">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="hint" style="margin:8px 0 14px">La columna Atención es personal: usa el valor más sensible entre el límite general y el rango aprendido. Alerta y Emergencia son límites de seguridad iguales para toda la tripulación. Durante el ejercicio, los límites de pulso y respiración se relajan.</p>
    <div class="card"><h3>Ventana de entrenamiento</h3>
      <div class="opts" role="radiogroup" aria-label="Ventana de entrenamiento">
        <button class="opt" role="radio" aria-checked="${settings.train === 'base'}" data-act="train" data-m="base"><span class="tile-ic">${icon('shield')}</span><span><b>Línea base: deja fuera la última semana</b><small>Recomendado. Así un cambio reciente no se aprende como si fuera normal.</small></span></button>
        <button class="opt" role="radio" aria-checked="${settings.train === 'todo'}" data-act="train" data-m="todo"><span class="tile-ic">${icon('clock')}</span><span><b>Todo el historial: los 30 días</b><small>Se adapta más rápido, pero puede dar por normales valores alterados.</small></span></button>
      </div>
      <div class="row"><button class="btn btn-primary" data-act="retrain">${icon('cpu')}Reentrenar ahora</button><p class="hint">Último entrenamiento: hoy a las ${fTime(new Date(m.at))}</p></div>
    </div>
    <details class="card" style="margin-top:12px"><summary><b>Cómo decide Stellar Health</b></summary>
      <ol class="apoyo" style="list-style:decimal;padding-left:20px">
        <li><b>Límites de seguridad.</b> Si un signo cruza un valor peligroso, hay alerta o emergencia en el momento, con su guía.</li>
        <li><b>Desviación personal.</b> Un valor normal para otros puede ser raro para ti. Si sales de tu rango aprendido, hay un aviso de atención.</li>
        <li><b>Tendencias.</b> Cada minuto revisa los últimos días. Una subida lenta de temperatura o pulso, o noches cortas seguidas, se avisan antes de que sean un problema.</li>
        <li><b>Contexto.</b> La actigrafía dice si estás en reposo o haciendo ejercicio. Pulso alto con mucho movimiento no es una alerta.</li>
        <li><b>Persistencia.</b> Una emergencia grave, o una alerta que continúa, se comunica a la tripulación.</li>
      </ol>
    </details>`;
}
VIEWS.datos = () => {
  const a = S.profile, n = settings.range;
  return `<header class="vh"><h1>Datos</h1><p>El archivo de lo que registró el sensor de ${esc(a.short)} y el modelo personal que Stellar Health aprendió con esos datos.</p></header>
  <section aria-labelledby="h-arch">
    <div class="sec-h"><h2 id="h-arch">Archivo</h2><div class="chips" role="group" aria-label="Periodo">${[7, 14, 30].map((d) => `<button class="chip" data-act="range" data-n="${d}" aria-pressed="${n === d}">${d} días</button>`).join('')}</div></div>
    <div class="charts">${SERIES.map((s) => `<article class="ccard"><div class="ccard-h"><span class="tile-ic${s.mind ? ' mind' : ''}">${icon(s.ic)}</span><h3>${s.name}</h3><span class="ccard-v" id="cv-${s.k}"></span></div><div id="ch-${s.k}"></div></article>`).join('')}</div>
  </section>
  <section aria-labelledby="h-acto">
    <div class="sec-h"><h2 id="h-acto">Actigrafía: movimiento y sueño</h2><p class="hint">Últimos ${Math.min(n, 14)} días, una fila por día</p></div>
    <div class="ccard"><div id="acto"></div>
      <p class="legend"><span><i style="background:var(--body)"></i>Movimiento de la muñeca (más alto, más movimiento)</span><span><i style="background:var(--mind);opacity:.3"></i>Periodo de sueño</span></p>
      <p class="hint">El sueño se calcula a partir del movimiento: cada minuto se puntúa con una ventana de 7 minutos (método de Cole-Kripke). Minutos seguidos con muy poco movimiento cuentan como sueño.</p></div>
  </section>
  <section aria-labelledby="h-tab">
    <div class="sec-h"><h2 id="h-tab">Registro diario</h2><div class="row"><button class="btn btn-ghost btn-sm" data-act="csv-copy">${icon('copy')}Copiar como CSV</button>${S.dl ? `<button class="btn btn-ghost btn-sm" data-act="csv-save">${icon('download')}Descargar CSV</button>` : ''}</div></div>
    <div class="table-wrap" id="tabla"></div>
    <p class="hint" style="margin-top:8px">Las filas con valores fuera del rango personal aparecen en Atención. El ejercicio de hoy cuenta hasta este momento.</p>
  </section>
  <section aria-labelledby="h-mod" id="modelo"></section>`;
};
AFTER.datos = () => {
  const a = S.profile, n = settings.range, st = M[a.id].stats, days = H[a.id].days.slice(-n);
  SERIES.forEach((s) => {
    let data = days.map((d) => ({ t: d.date, v: s.k === 'mood' ? moodOf(a, d) : d[s.k] })).filter((p) => p.v != null);
    if (s.k === 'sleepH') { const o = nightOverride(a); if (o && data.length) data[data.length - 1].v = o.sleepH; }
    const band = s.k === 'mood' ? { lo: Math.max(1, st.mood.lo), hi: Math.min(5, st.mood.hi) } : s.k === 'spo2' ? { lo: st.spo2.lo, hi: Math.min(100, st.spo2.hi) } : { lo: st[s.k].lo, hi: st[s.k].hi };
    const refs = [];
    if (s.k === 'temp' && Math.max(...data.map((p) => p.v)) >= 37.05) refs.push({ v: 37.5, label: 'atención general' });
    if (s.k === 'sleepH') refs.push({ v: a.need, label: 'lo que necesitas' });
    const last = data[data.length - 1];
    setHtml('#cv-' + s.k, last ? `${s.fmt(last.v)}<small>${s.unit}</small>` : '');
    CH[s.k] = makeChart($('#ch-' + s.k), { kind: s.kind, color: s.mind ? 'var(--mind)' : 'var(--body)', data, band, refs, fmt: s.fmt, tick: s.k === 'mood' || s.k === 'sleepH' || s.k === 'hr' ? f0 : s.fmt, unit: s.unit, minSpan: s.minSpan, yMin: s.yMin, yMax: s.yMax, height: 160,
      xfmt: s.k === 'sleepH' ? (t) => 'noche del ' + fDay(addDays(t, -1)) : fDay, aria: `${s.name} de ${a.short} en los últimos ${n} días` });
    if (s.k === 'sleepH') CH[s.k].update(data, { xfmt: fDay, tipx: true });
  });
  CH.acto = makeActogram($('#acto'), a, Math.min(n, 14));
  setHtml('#tabla', tableHtml(a, n));
  setHtml('#modelo', modelHtml(a));
};

/* ===== Equipo ===== */
function crewListHtml() {
  return CREW.map((c) => {
    const me = c.id === S.profile.id, st = me ? S.state : computeState(c);
    return `<article class="member${me ? ' me' : ''}"><div class="member-h">${avatar(c, me)}<div><h3>${esc(c.name)}${me ? ' <span class="tag">Tú</span>' : ''}</h3><small>${esc(c.role)}</small></div></div>
      <dl><dt>Cuerpo</dt><dd>${pill(st.body.level)}</dd><dt>Mente</dt><dd>${pill(st.mind.level)}</dd></dl>
      ${me ? '' : `<button class="btn btn-ghost btn-sm" data-act="set-profile" data-id="${c.id}">Ver como ${esc(c.short)}</button>`}</article>`;
  }).join('');
}
function crewAlertsHtml() {
  const me = S.profile.id, list = Store.alerts.slice(0, 20);
  if (!list.length) return '<div class="empty"><b>Sin alertas</b><span>Cuando alguien tenga una emergencia grave o una alerta que continúa, aparecerá aquí para toda la tripulación.</span></div>';
  return list.map((x) => {
    const live = alertLive(x), acks = Object.keys(x.acks).map((id) => crewById(id).short);
    const why = x.reason === 'grave' ? 'aviso automático por emergencia grave' : x.reason === 'continua' ? 'aviso automático porque la alerta continuó' : 'aviso enviado a mano';
    return `<article class="calert lvl-${live ? x.level : 'ok'}${live ? '' : ' off'}"><span class="insight-ic">${icon(live ? (x.level === 'emergency' ? 'octagon' : 'alert') : 'check')}</span><div>
      <h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p>
      <p class="hint">${live ? 'Activa' : x.status === 'resuelta' ? 'Resuelta' : 'Caducada'} · ${ago(x.ts)} · ${why}${acks.length ? ` · en camino: ${esc(acks.join(', '))}` : ''}</p>
      ${live ? `<div class="row" style="margin-top:8px">${x.from !== me && !x.acks[me] ? `<button class="btn btn-primary btn-sm" data-act="ack" data-id="${esc(x.id)}">Voy en camino</button>` : ''}${x.guide ? `<button class="btn btn-ghost btn-sm" data-act="guide" data-id="${x.guide}" data-helper="1">${x.from === me ? 'Ver guía' : 'Cómo ayudar'}</button>` : ''}<button class="btn btn-ghost btn-sm" data-act="resolve" data-id="${esc(x.id)}">Marcar como resuelta</button></div>` : ''}</div></article>`;
  }).join('');
}
const shareNote = () => (Store.cloudAlerts ? 'Las alertas se comparten en vivo con quien abra esta página con permiso para usarla. Cada persona elige a qué tripulante representa.' : 'Sin conexión a una cuenta: las alertas se ven solo en este dispositivo. Para ver cómo las recibe otro tripulante, usa «Ver como».');
VIEWS.equipo = () => `<header class="vh"><h1>Equipo</h1><p>El estado general de cada tripulante y las alertas que se comparten con todos. Las notas y los registros de ánimo siguen siendo privados.</p></header>
  <section aria-labelledby="h-crew"><div class="sec-h"><h2 id="h-crew">Tripulación de ejemplo</h2><p class="hint">Cuatro perfiles simulados para probar la app</p></div><div class="crew" id="crew-list"></div></section>
  <section aria-labelledby="h-cal"><div class="sec-h"><h2 id="h-cal">Alertas de la tripulación</h2><div class="row"><button class="btn btn-crit btn-sm" data-act="sos">${icon('send')}Pedir ayuda</button><button class="btn btn-ghost btn-sm" data-act="alerts-clear">Borrar las resueltas</button></div></div>
    <div class="panel" id="calerts"></div><p class="note" id="share-note" style="margin-top:10px"></p></section>`;
function refreshEquipo() { setHtml('#crew-list', crewListHtml()); setHtml('#calerts', crewAlertsHtml()); setText('#share-note', shareNote()); }
AFTER.equipo = refreshEquipo;

/* ===== Guías ===== */
const guideCard = (id) => { const g = GUIDES[id]; return `<button class="guide" data-act="guide" data-id="${id}"><span class="tile-ic${g.dom === 'mente' ? ' mind' : ''}">${icon(g.ic)}</span><span><h3>${esc(g.title)}</h3><p>${esc(g.when)}</p></span></button>`; };
VIEWS.guias = () => `<header class="vh"><h1>Guías de emergencia</h1><p>Pasos claros para actuar cuando algo no va bien, para ti o para ayudar a un compañero. Se abren solas cuando hay una alerta.</p></header>
  <section aria-labelledby="h-gc"><div class="sec-h"><h2 id="h-gc">Cuerpo</h2></div><div class="guides">${Object.keys(GUIDES).filter((k) => GUIDES[k].dom === 'cuerpo').map(guideCard).join('')}</div></section>
  <section aria-labelledby="h-gm"><div class="sec-h"><h2 id="h-gm">Mente</h2></div><div class="guides">${Object.keys(GUIDES).filter((k) => GUIDES[k].dom === 'mente').map(guideCard).join('')}</div></section>
  <section class="card"><h2>¿Necesitas a alguien ahora?</h2><p>Si la situación es grave o no mejora, avisa a la tripulación. No hace falta estar seguro para pedir ayuda.</p><div class="row"><button class="btn btn-crit" data-act="sos">${icon('send')}Avisar a la tripulación</button></div></section>`;

/* ===== Enrutado y refresco ===== */
const CH = {};
function killCharts() { Object.keys(CH).forEach((k) => { CH[k].destroy(); delete CH[k]; }); }
function renderView() {
  killCharts(); stopSky();
  const v = $('#view');
  S.state = computeState(S.profile);
  v._h = null;
  v.innerHTML = VIEWS[S.view]();
  if (AFTER[S.view]) AFTER[S.view]();
  renderAlertSlot();
}
function route() {
  const h = (location.hash || '').replace('#', '');
  S.view = NAV.some((n) => n[0] === h) ? h : 'inicio';
  $$('#nav a').forEach((x) => { if (x.dataset.nav === S.view) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
  S.delAsk = null;
  renderView();
  window.scrollTo(0, 0);
}
function renderLive() {
  renderAlertSlot();
  renderScenChip();
  if (S.sheet === 'emer') renderEmCrew();
  if (S.view === 'inicio') renderInicioLive();
  else if (S.view === 'equipo') refreshEquipo();
  else if (S.view === 'mente') { setHtml('#mente-idx', mindCardHtml()); setText('#rem-info', remInfoText()); }
  if (S.tickN % 15 === 0) renderMision();
}
