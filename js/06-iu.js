/* ===== UI helpers ===== */
const setHtml = (sel, html) => { const el = typeof sel === 'string' ? $(sel) : sel; if (el && el._h !== html) { el._h = html; el.innerHTML = html; } };
const setText = (sel, t) => { const el = $(sel); if (el && el.textContent !== t) el.textContent = t; };
const pill = (lv, text) => `<span class="pill lvl-${lv}">${icon(LEVELS[lv].ic)}${esc(text || LEVELS[lv].label)}</span>`;
const avatar = (a, me) => `<span class="avatar${me ? ' me' : ''}" aria-hidden="true">${esc(a.ini)}</span>`;
const closeBtn = `<button class="icon-btn" data-act="sheet-close" aria-label="Close">${icon('x')}</button>`;
function ring(value, lv, ic) {
  const r = 21, c = 2 * Math.PI * r, off = c * (1 - clamp(value, 0, 100) / 100);
  return `<span class="ring lvl-${lv}" role="img" aria-label="${value} out of 100"><svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="26" r="${r}" class="ring-track"/><circle cx="26" cy="26" r="${r}" class="ring-fill" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 26 26)"/></svg>${icon(ic)}</span>`;
}
const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 20 ? 'Good afternoon' : 'Good evening'; };
const alertLive = (x) => x.status === 'activa' && Date.now() - x.ts < (x.reason === 'manual' ? 12 * 3600e3 : 20 * 60e3);
const toolBtn = (x) => (x.tool === 'dibujo' ? `<button class="btn btn-soft btn-sm" data-act="draw" data-id="${x.id}">${icon('pencil')}Open drawing pad</button>`
  : x.tool === 'respirar' ? `<button class="btn btn-soft btn-sm" data-act="breathe" data-id="${x.id}">${icon('wind')}Guided breathing</button>`
  : x.tool === 'bitacora' ? `<button class="btn btn-soft btn-sm" data-act="write" data-id="${x.id}">${icon('book')}Write in the Log</button>` : '');
const go = (h) => { if (location.hash !== '#' + h) location.hash = h; else route(); };

/* ===== Shell: navigation, profile, bell, measurements ===== */
const NAV = [['inicio', 'Home', 'home'], ['mente', 'Mind', 'smile'], ['bitacora', 'Log', 'book'], ['entreno', 'Training', 'dumbbell'], ['datos', 'Data', 'chart'], ['equipo', 'Crew', 'users'], ['guias', 'Guides', 'buoy']];
function renderShell() {
  $('#nav').innerHTML = NAV.map(([id, label, ic]) => `<a href="#${id}" data-nav="${id}">${icon(ic)}<span>${label}</span></a>`).join('');
  $('#med-btn').innerHTML = `${icon('plus')}<span>Log measurement</span>`;
  $('#bell-btn').innerHTML = `${icon('bell')}<span class="badge" id="bell-n" hidden></span>`;
  renderWho(); renderMision(); renderBell();
}
function renderWho() { const a = S.profile; $('#who').innerHTML = `${avatar(a, true)}<span class="who-t"><b>${esc(a.name)}</b><small>${esc(a.role)}</small></span>${icon('down')}`; }
function renderMision() { setText('#mision', `${MISSION.name} · Day ${MISSION.day} of ${MISSION.total} · Ship time ${fTime(new Date())}`); }

/* ----- Enter your own measurement ----- */
const MED_FIELDS = [
  ['temp', 'Temperature (°C)', '36.6'], ['hr', 'Heart rate (bpm)', '62'], ['rr', 'Respiration (br/min)', '14'],
  ['spo2', 'Blood oxygen (%)', '98'], ['sys', 'Systolic pressure (mmHg)', '118'], ['dia', 'Diastolic pressure (mmHg)', '76'],
  ['glu', 'Blood glucose (mg/dL)', '90'], ['rad', 'Radiation (µSv/h)', '30'], ['sleepH', 'Hours slept last night', '7.5'],
];
const medLine = (m) => MED_FIELDS.filter(([k]) => m[k] != null && k !== 'dia').map(([k, l]) => `${l.replace(/ \(.*\)| last night/, '').toLowerCase()} ${k === 'sleepH' ? f1(m[k]) + ' h' : k === 'temp' ? f1(m[k]) : f0(m[k])}`).join(' · ');
function medListHtml() {
  const list = MEDS[S.profile.id].slice(-5).reverse();
  return list.length ? list.map((m) => `<li><span><b>${ago(m.t)}</b>${m.state === 'ejercicio' ? ' · after exercise' : m.state === 'activity' ? ' · normal activity' : ''}<small>${esc(medLine(m))}</small></span><button type="button" class="btn btn-ghost btn-sm" data-act="med-del" data-t="${m.t}" aria-label="Delete this measurement">${icon('trash')}</button></li>`).join('')
    : '<li><span>You haven\'t logged any measurements yet.</span></li>';
}
function openMedicion() {
  const a = S.profile;
  S.medState = 'reposo';
  openSheet('med', { ic: 'pulse', title: 'Log a measurement',
    body: `<p>Enter the values you measured yourself: thermometer, pulse oximeter, blood pressure cuff, glucometer, dosimeter, or a pulse sensor (PPG, like a smartwatch). Leave blank anything you didn't measure. Heart rate, breathing and blood pressure are judged differently at rest, during normal activities and after exercise.</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${MED_FIELDS.map(([k, l, ph]) => `<div><label class="lbl" for="m-${k}">${l}</label><input type="text" inputmode="decimal" id="m-${k}" placeholder="${ph}" autocomplete="off"></div>`).join('')}</div>
      <div><p class="lbl" id="l-mst">How were you when you measured?</p><div class="chips" role="radiogroup" aria-labelledby="l-mst" id="m-state">${chipSet('med-state', 'state', Object.entries(MED_STATES), (k) => S.medState === k, true)}</div></div>
      <p class="hint" id="m-err" role="alert"></p>
      <div class="box"><h3>${esc(a.short)}'s latest measurements</h3><ul class="drivers" id="med-list">${medListHtml()}</ul></div>`,
    foot: `${footClose('Cancel')}<button class="btn btn-primary" data-act="med-save">${icon('check')}Save measurement</button>` });
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
  $('#bell-pop').innerHTML = `<div class="pop-h"><h2>Notifications</h2>${NOTES.some((x) => !x.read) ? '<button class="btn btn-ghost btn-sm" data-act="notes-read">Mark all as read</button>' : ''}</div>` +
    (NOTES.length ? NOTES.map((n) => `<button class="nitem lvl-${n.level}${n.read ? '' : ' unread'}" data-act="note-open" data-id="${n.id}"><span class="insight-ic ${noteCls(n)}">${icon(noteIcon(n))}</span><span><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><time>${ago(n.ts)}</time></span></button>`).join('')
      : '<div class="empty"><b>Nothing yet</b><span>Alerts, prevention notices, activities, and check-ins will show up here.</span></div>');
}
function showToast(n) {
  const box = $('#toasts'), el = document.createElement('div');
  el.className = `toast lvl-${n.level}`;
  el.dataset.id = n.id;
  let extra = '';
  if (n.faces) extra = `<div class="faces faces-sm" role="group" aria-label="How are you feeling?">${MOODS.map((m) => `<button class="face" data-act="tmood" data-v="${m.v}" data-id="${n.id}" aria-label="${m.label}" title="${m.label}">${faceSvg(m.v)}</button>`).join('')}</div>`;
  else if (n.actId) { const x = actById(n.actId); extra = `<div class="row">${toolBtn(x)}<button class="btn btn-primary btn-sm" data-act="act-done" data-id="${x.id}" data-toast="${n.id}">${icon('check')}Done</button><button class="btn btn-ghost btn-sm" data-act="toast-close" data-id="${n.id}">Not now</button></div>`; }
  else if (n.act) extra = `<div class="row"><button class="btn btn-soft btn-sm" data-act="note-open" data-id="${n.id}">${esc(n.act.label)}</button></div>`;
  el.innerHTML = `<span class="insight-ic ${noteCls(n)}">${icon(noteIcon(n))}</span><div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p>${extra}</div><button class="icon-btn" data-act="toast-close" data-id="${n.id}" aria-label="Dismiss notification">${icon('x')}</button>`;
  box.prepend(el);
  while (box.children.length > 3) box.lastChild.remove();
  setTimeout(() => el.remove(), n.level === 'alert' || n.level === 'emergency' ? 20000 : n.faces || n.actId ? 30000 : 9000);
}
const killToast = (id) => { const el = $(`.toast[data-id="${id}"]`); if (el) el.remove(); };

/* ===== Global notices: own episode and alerts from other crew members ===== */
function crewBlock(a, rt) {
  const ep = rt.ep, now = Date.now(), lv = LV[ep.top.level];
  if (ep.sent) {
    const al = Store.alerts.find((x) => x.id === ep.sent);
    const who = al ? Object.keys(al.acks).map((id) => crewById(id).short) : [];
    return { html: `<p><b>Crew notified.</b> ${who.length ? esc(who.join(' and ')) + (who.length > 1 ? ' are' : ' is') + ' on the way.' : 'Waiting for a response.'}</p>` };
  }
  if (ep.count) {
    const left = Math.max(0, ep.count.until - now);
    return { left: `${Math.ceil(left / 1000)} s`, pct: 100 - (left / T_COUNT) * 100,
      html: `<p><b>Notifying the crew in <span data-dyn="left"></span></b> because the emergency is severe.</p><div class="bar"><i data-dyn="bar"></i></div><div class="row"><button class="btn btn-crit btn-sm" data-act="crew-now">Notify now</button><button class="btn btn-ghost btn-sm" data-act="crew-cancel">Don't notify: I'm fine</button></div>` };
  }
  if (ep.cancelLv >= lv) return { html: `<p>The crew was not notified. If it gets worse, we'll suggest it again.</p><div class="row"><button class="btn btn-ghost btn-sm" data-act="crew-now">Notify now</button></div>` };
  return { html: `<p>If you feel unwell or the value doesn't come down when you measure again, notify the crew.</p><div class="row"><button class="btn btn-ghost btn-sm" data-act="crew-now">Notify now</button></div>` };
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
      <div class="row">${x.acks[me] ? '<span class="tag">You said you\'re on the way</span>' : `<button class="btn btn-primary btn-sm" data-act="ack" data-id="${esc(x.id)}">I'm on my way</button>`}${x.guide ? `<button class="btn btn-ghost btn-sm" data-act="guide" data-id="${x.guide}" data-helper="1">How to help</button>` : ''}<a class="btn btn-ghost btn-sm" href="#equipo">See in Crew</a></div></section>`;
  });
  Store.alerts.filter((x) => alertLive(x) && x.from === me && x.reason === 'manual').slice(0, 1).forEach((x) => {
    const who = Object.keys(x.acks).map((id) => crewById(id).short);
    html += `<section class="banner lvl-${x.level}"><div class="banner-h"><span class="banner-ic">${icon('send')}</span><div><h2>Your crew alert is active</h2><p>${who.length ? esc(who.join(' and ')) + (who.length > 1 ? ' are' : ' is') + ' on the way.' : 'Waiting for a response from your crewmates.'}</p></div></div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-act="resolve" data-id="${esc(x.id)}">I'm fine now: mark as resolved</button></div></section>`;
  });
  if (rt.ep) {
    const top = rt.ep.top, c = COND[top.code], lv = top.level;
    blk = crewBlock(a, rt);
    html += `<section class="banner lvl-${lv}" role="alert"><div class="banner-h"><span class="banner-ic">${icon(LEVELS[lv].ic)}</span><div><h2>${LEVELS[lv].label}: ${esc(c.n)}</h2><p>${esc(c.s)}</p></div></div>
      <div class="banner-crew">${blk.html}</div>
      <div class="row"><button class="btn btn-primary btn-sm" data-act="${lv === 'emergency' ? 'emer' : 'guide'}" data-id="${c.guide}">See what to do, step by step</button></div></section>`;
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

/* ===== Home ===== */
const TILES = [
  { k: 'temp', name: 'Temperature', unit: '°C', ic: 'thermo' },
  { k: 'hr', name: 'Heart rate', unit: 'bpm', ic: 'heart' },
  { k: 'bp', name: 'Blood pressure', unit: 'mmHg', ic: 'gauge', ser: 'sys' },
  { k: 'spo2', name: 'Blood oxygen', unit: '% SpO₂', ic: 'drop' },
  { k: 'rr', name: 'Respiration', unit: 'br/min', ic: 'wind' },
  { k: 'glu', name: 'Blood glucose', unit: 'mg/dL', ic: 'drop2' },
  { k: 'rad', name: 'Radiation', unit: 'µSv/h', ic: 'radiation' },
  { k: 'sleep', name: 'Last night\'s sleep', unit: 'h', ic: 'moon' },
];
function enfoqueHtml(kind, st) {
  return `${ring(st.index, st.level, kind === 'cuerpo' ? 'pulse' : 'smile')}<div class="enf-t"><p class="enf-name">${kind === 'cuerpo' ? 'Body' : 'Mind'}</p><p class="enf-idx"><b>${st.index}</b><span>out of 100</span></p></div>${pill(st.level)}<p class="enf-why">${esc(st.why)}</p>`;
}
function summaryText(st) {
  const b = { ok: 'Your body is stable', watch: 'Your body needs a little attention', alert: 'Your body needs care now', emergency: 'Physical emergency: follow the guide now' }[st.body.level];
  const m = { ok: 'your mind is doing well', watch: 'your mind needs a little care', alert: 'your mind needs support', emergency: 'you need support now' }[st.mind.level];
  return `${b} and ${m}.`;
}
const insightHtml = (i) => `<article class="insight lvl-${i.level}"><span class="insight-ic">${icon(i.ic)}</span><div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p><p class="tipline">${esc(i.tip)}</p><div class="row">${pill(i.level, i.level === 'alert' ? 'Alert' : 'Prevention')}${i.guide ? `<button class="btn btn-soft btn-sm" data-act="guide" data-id="${i.guide}">What to do</button>` : ''}${i.share ? `<button class="btn btn-ghost btn-sm" data-act="sos" data-kind="${i.dom}">Notify the crew</button>` : ''}</div></div></article>`;
function prevHtml(st) {
  const items = [];
  [...st.body.conds, ...st.mind.conds].filter((c) => c.level === 'watch').forEach((c) => {
    const k = COND[c.code];
    items.push(`<article class="insight lvl-watch"><span class="insight-ic">${icon('eye')}</span><div><h3>${esc(cap(k.n))}</h3><p>${esc(k.s)}</p><div class="row">${pill('watch', 'Now')}<button class="btn btn-soft btn-sm" data-act="guide" data-id="${k.guide}">What to do</button></div></div></article>`);
  });
  [...st.body.ins, ...st.mind.ins].forEach((i) => items.push(insightHtml(i)));
  return items.length ? items.join('') : '<div class="empty"><b>All clear</b><span>No trends to watch. Stellar Health checks your data every minute.</span></div>';
}
function suggestionHtml() {
  const x = actById(S.suggestion) || ACTS[0];
  return `${isRestTime() ? '<p class="note" style="margin-bottom:10px">It\'s your sleep period. If you can\'t sleep, try something quiet in low light.</p>' : ''}
    <div class="sticker"><p class="cat">${CATS[x.cat]} · ${x.min} min</p><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p>
    <div class="row">${toolBtn(x)}<button class="btn btn-primary btn-sm" data-act="act-done" data-id="${x.id}">${icon('check')}Done</button><button class="btn btn-ghost btn-sm" data-act="act-next">Another idea</button></div></div>`;
}
const nextRemText = () => (RT[S.profile.id].ep ? 'Reminders paused during the alert' : `Next idea in ${mmss(SCHED.nextAct - Date.now())}`);
const VIEWS = {}, AFTER = {};
VIEWS.inicio = () => {
  const a = S.profile;
  return `<section class="ventana" aria-labelledby="saludo">
    <canvas class="sky" id="sky" aria-hidden="true"></canvas>
    <div class="ventana-in">
      <div class="ventana-top">
        <div class="ventana-txt"><p class="eyebrow">${esc(MISSION.name)} · Day ${MISSION.day} of ${MISSION.total}</p><h1 id="saludo">${greeting()}, ${esc(a.short)}</h1><p class="lede" id="resumen"></p></div>
        <button class="glass-btn" data-act="perfil">${avatar(a)}<span>Switch crew member</span></button>
      </div>
      <div class="enfoques"><a class="enfoque" href="#datos" id="enf-cuerpo" aria-label="Body status. View data"></a><a class="enfoque" href="#mente" id="enf-mente" aria-label="Mind status. View plan"></a></div>
    </div>
  </section>
  <section aria-labelledby="h-vit">
    <div class="sec-h"><h2 id="h-vit">Your latest measurements</h2><p class="sensor" id="sensor"></p><button class="btn btn-soft btn-sm" data-act="med-open">${icon('plus')}Log measurement</button></div>
    <div class="vitals">${TILES.map((t) => `<article class="tile"><div class="tile-h"><span class="tile-ic">${icon(t.ic)}</span><h3>${t.name}</h3></div>
      <p class="tile-val"><span class="num" id="tv-${t.k}">–</span><span class="unit">${t.unit}</span><span class="tile-p" id="tp-${t.k}"></span></p>
      <div id="sp-${t.k}"></div><p class="tile-foot" id="tf-${t.k}"></p></article>`).join('')}</div>
  </section>
  <section aria-labelledby="h-ex">
    <div class="sec-h"><h2 id="h-ex">Today's exercise routine</h2><p class="hint">Check off the exercise that is already part of your routine</p></div>
    <div class="card" id="ex-list">${exHtml(a)}</div>
  </section>
  <div class="cols">
    <section aria-labelledby="h-prev"><div class="sec-h"><h2 id="h-prev">Prevention</h2><p class="hint">What your data signals before it becomes a problem</p></div><div class="panel" id="prev"></div></section>
    <section aria-labelledby="h-ani"><div class="sec-h"><h2 id="h-ani">For your mood</h2><p class="hint" id="next-rem"></p></div><div id="sugerencia"></div></section>
  </div>`;
};
const daySeries = (a, k, n) => H[a.id].days.slice(-n).map((d) => ({ t: d.date, v: d[k] })).filter((p) => p.v != null);
AFTER.inicio = () => {
  const a = S.profile, st = M[a.id].stats;
  const xf = (t) => fDay(t);
  const mk = (k, fmt, unit, minSpan, band, extra) => { CH[k] = makeChart($('#sp-' + k), { compact: true, data: daySeries(a, k, 14), fmt, unit, minSpan, band, xfmt: xf, aria: 'Last 14 days', ...extra }); };
  mk('temp', f1, '°C', 0.8, st.temp);
  mk('hr', f0, 'bpm', 16, st.hr);
  CH.bp = makeChart($('#sp-bp'), { compact: true, data: daySeries(a, 'sys', 14), fmt: f0, unit: 'mmHg', minSpan: 30, band: st.sys, xfmt: xf, aria: 'Last 14 days, systolic' });
  mk('rr', f0, 'br/min', 7, st.rr);
  mk('glu', f0, 'mg/dL', 40, st.glu);
  mk('rad', f0, 'µSv/h', 30, st.rad);
  mk('spo2', f0, '%', 4, { lo: st.spo2.lo, hi: Math.min(100, st.spo2.hi) }, { yMax: 100 });
  CH.sleep = makeChart($('#sp-sleep'), { compact: true, kind: 'bar', data: sleepSeries(a, 7), fmt: f1, unit: 'h', yMin: 0, refs: [{ v: a.need }], xfmt: (t) => 'night of ' + fDay(addDays(t, -1)), aria: 'Hours of sleep for the last 7 nights' });
  setHtml('#sugerencia', suggestionHtml());
  startSky();
  renderInicioLive();
};
function sleepSeries(a, n) {
  return H[a.id].days.filter((d) => d.sleepH != null).slice(-n).map((d) => ({ t: d.date, v: d.sleepH }));
}
function renderInicioLive() {
  const a = S.profile, rt = RT[a.id], rd = rt.reading, lv = rt.last ? rt.last.lv : {}, s = M[a.id].stats, st = S.state;
  const meds = MEDS[a.id], lastMed = meds[meds.length - 1];
  setText('#resumen', summaryText(st));
  setHtml('#enf-cuerpo', enfoqueHtml('cuerpo', st.body));
  setHtml('#enf-mente', enfoqueHtml('mente', st.mind));
  setText('#sensor', lastMed ? `${a.short}'s last measurement: ${ago(lastMed.t)}` : `${a.short} hasn't logged any measurements yet`);
  const set = (k, val, pl, foot) => { setText('#tv-' + k, val); setHtml('#tp-' + k, pl); setText('#tf-' + k, foot); };
  const rest = !rd || rd.state === 'reposo';
  const none = 'Log a measurement to see it here';
  const tile = (k, fmt, foot) => set(k, rd && rd[k] != null ? fmt(rd[k]) : '–', rd && rd[k] != null ? pill(lv[k] || 'ok') : '', rd && rd[k] != null ? foot : none);
  const rg = (x, f) => `${f(x.lo)} to ${f(x.hi)}`;
  tile('temp', f1, `${SPACE_FOOT.temp} · yours: ${rg(s.temp, f1)}`);
  tile('hr', f0, rest ? `${SPACE_FOOT.hr} · yours: ${rg(s.hr, f0)}` : 'It\'s normal for it to rise with activity');
  const hasBp = rd && rd.sys != null;
  set('bp', hasBp ? `${f0(rd.sys)}/${f0(rd.dia)}` : '–', hasBp ? `${pill(lv.bp || 'ok')}<span class="kv">${esc(bpCategory(rd.sys, rd.dia).label)}</span>` : '', hasBp ? `${SPACE_FOOT.bp} · yours: ${f0(s.sys.lo)}-${f0(s.sys.hi)} / ${f0(s.dia.lo)}-${f0(s.dia.hi)}` : none);
  tile('spo2', f0, `${SPACE_FOOT.spo2} · yours: ${f0(s.spo2.lo)} to ${f0(Math.min(100, s.spo2.hi))}`);
  tile('rr', f0, rest ? `${SPACE_FOOT.rr} · yours: ${rg(s.rr, f0)}` : 'It\'s normal for it to rise with activity');
  tile('glu', f0, `${SPACE_FOOT.glu} · yours: ${rg(s.glu, f0)}`);
  tile('rad', f0, `${SPACE_FOOT.rad} · yours: ${rg(s.rad, f0)}`);
  const n = lastNight(a), si = (INS[a.id] || []).find((i) => i.id === 'sueno' || i.id === 'eficiencia');
  set('sleep', f1(n.sleepH), pill(si ? si.level : 'ok'), n.eff == null ? 'Logged by you' : `Efficiency ${f0(n.eff)}% · ${n.awak} ${n.awak === 1 ? 'awakening' : 'awakenings'}`);
  ['temp', 'hr', 'rr', 'spo2', 'glu', 'rad'].forEach((k) => { if (CH[k]) CH[k].update(daySeries(a, k, 14)); });
  if (CH.bp) CH.bp.update(daySeries(a, 'sys', 14));
  if (CH.sleep) CH.sleep.update(sleepSeries(a, 7));
  setHtml('#prev', prevHtml(st));
  setText('#next-rem', nextRemText());
}

/* ===== Mind ===== */
function mindCardHtml() {
  const m = S.state.mind;
  return `<h2>Mental well-being</h2>
    <div class="idx-row">${ring(m.index, m.level, 'smile')}<p class="idx-n"><b>${m.index}</b><span>out of 100</span></p>${pill(m.level)}</div>
    <p class="hint">Calculated from your mood and tension logs, your sleep, your resting heart rate, your activities, and the mission phase.</p>
    <h3>What's influencing it now</h3>
    <ul class="drivers">${m.drivers.map((d) => `<li><span>${esc(d.label)}<small>${esc(d.detail)}</small></span><span class="drv ${d.pts < 0 ? 'neg' : 'pos'}">${d.pts > 0 ? '+' : '−'}${Math.abs(d.pts)}</span></li>`).join('') || '<li><span>Nothing notable right now</span></li>'}</ul>`;
}
function planHtml() {
  const a = S.profile, p = buildPlan(a, S.state), tk = dayKey(new Date());
  return `<div class="sec-h"><h2 id="h-plan">Your care plan</h2><button class="btn btn-ghost btn-sm" data-act="plan-regen">${icon('refresh')}Change activities</button></div>
    <p class="note">Made for ${esc(a.short)} using their sleep, mood, tension, and vital sign data, and the mission phase. It adjusts automatically when that data changes.</p>
    <div class="plan-meta"><span class="kv"><b>${p.chkDay}</b> check-ins a day</span><span class="kv"><b>${p.actsDay}</b> activities a day</span><span class="kv">Current status: <b>${LEVELS[S.state.mind.level].label}</b></span></div>
    <div class="focos">${p.focos.map((f) => `<article class="foco"><h3>${esc(f.title)}</h3><p class="why">${esc(f.why)}</p><ul>${f.todo.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></article>`).join('')}</div>
    <h3 class="sub">Your week</h3>
    <ol class="semana">${p.semana.map((d) => `<li class="dia${dayKey(d.date) === tk ? ' hoy' : ''}"><h4>${dayKey(d.date) === tk ? 'Today' : esc(fWDay(d.date))}</h4><ul>${d.items.map(([t, txt]) => `<li><time>${hm(t)}</time><span>${esc(txt)}</span></li>`).join('')}</ul></li>`).join('')}</ol>
    <h3 class="sub">Who supports you</h3>
    <ul class="apoyo">${p.apoyo.map(([n, t]) => `<li><b>${esc(n)}:</b> ${esc(t)}</li>`).join('')}</ul>`;
}
function actsHtml() {
  const a = S.profile, tk = dayKey(new Date());
  const done = new Set(Store.entries.filter((e) => e.crew === a.id && e.kind === 'actividad' && e.act && dayKey(new Date(e.ts)) === tk).map((e) => e.act));
  return ACTS.filter((x) => S.actFilter === 'todas' || x.cat === S.actFilter || x.group === S.actFilter).map((x) => `<article class="act${done.has(x.id) ? ' done' : ''}"><p class="cat">${CATS[x.cat]} · ${x.min} min</p><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p>
    <div class="row">${toolBtn(x)}<button class="btn ${done.has(x.id) ? 'btn-ghost' : 'btn-primary'} btn-sm" data-act="act-done" data-id="${x.id}">${icon('check')}${done.has(x.id) ? 'Done today' : 'Done'}</button></div></article>`).join('');
}
const actFilterHtml = () => [['todas', 'All'], ...Object.entries(CATS), ...Object.entries(GROUPS)].map(([k, l]) => `<button class="chip" data-act="act-filter" data-k="${k}" aria-pressed="${S.actFilter === k}">${l}</button>`).join('');
function lastCheckinText() {
  const e = Store.entries.find((x) => x.crew === S.profile.id && x.kind === 'checkin');
  return e ? `Last check-in: ${moodLabel(e.mood).toLowerCase()}, ${ago(e.ts)}` : 'You haven\'t done a check-in today';
}
function remInfoText() {
  const p = planNow(), now = Date.now();
  return `Your plan calls for ${p.chkDay} check-ins and ${p.actsDay} activities a day. Next activity in ${mmss(SCHED.nextAct - now)} and next check-in in ${mmss(SCHED.nextChk - now)}.`;
}
function moodSeries(a, n) { return H[a.id].days.slice(-n).map((d) => ({ t: d.date, v: moodOf(a, d) })).filter((p) => p.v != null); }
VIEWS.mente = () => `<header class="vh"><h1>Mind</h1><p>How you're doing today and what helps in this phase of the mission.</p></header>
  <div class="cols">
    <section class="card" aria-labelledby="h-chk"><h2 id="h-chk">How are you feeling right now?</h2>
      <div class="faces" role="radiogroup" aria-label="Mood">${MOODS.map((m) => `<button class="face" role="radio" aria-checked="${S.chk.mood === m.v}" data-act="mood" data-v="${m.v}">${faceSvg(m.v)}<span>${m.label}</span></button>`).join('')}</div>
      <p class="lbl" id="l-ten">How much tension do you feel?</p>
      <div class="chips" role="radiogroup" aria-labelledby="l-ten">${TENSION.map((t, i) => `<button class="chip" role="radio" aria-checked="${S.chk.tension === i + 1}" data-act="tension" data-v="${i + 1}">${t}</button>`).join('')}</div>
      <label class="lbl" for="chk-note">Want to share anything else? (optional)</label>
      <textarea id="chk-note" rows="2" maxlength="600" placeholder="For example: I miss my family, the experiment went well today, I'm tired…"></textarea>
      <div class="row"><button class="btn btn-primary" data-act="checkin-save" id="chk-save" ${S.chk.mood ? '' : 'disabled'}>Save check-in</button><p class="hint" id="chk-last"></p></div>
    </section>
    <section class="card" id="mente-idx" aria-label="Mental well-being"></section>
  </div>
  <section id="mente-plan" aria-labelledby="h-plan"></section>
  <section aria-labelledby="h-acts"><div class="sec-h"><h2 id="h-acts">Activities for your mood</h2><div class="chips" id="act-filter" role="group" aria-label="Activity type"></div></div><div class="acts" id="acts"></div></section>
  <section class="card" aria-labelledby="h-rem"><h2 id="h-rem">Reminders</h2>
    <p>During the day, Stellar Health suggests short activities and asks how you're doing.</p>
    <div class="row"><label class="lbl" for="freq">Activities</label><select id="freq">${[['plan', 'Follow my care plan'], ['30', 'Every 30 minutes'], ['60', 'Every hour'], ['120', 'Every 2 hours'], ['240', 'Every 4 hours']].map(([v, l]) => `<option value="${v}" ${String(settings.freq) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <p class="hint" id="rem-info"></p>
    <div class="row"><button class="btn btn-soft btn-sm" data-act="send-act">Suggest an activity now</button><button class="btn btn-soft btn-sm" data-act="send-check">Ask me how I'm doing</button></div>
  </section>
  <section aria-labelledby="h-mood"><div class="sec-h"><h2 id="h-mood">Your mood over the last 14 days</h2><p class="hint">Scale from 1 (very low) to 5 (very good)</p></div><div class="ccard"><div id="ch-mood"></div></div></section>`;
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
  CH.mood = makeChart($('#ch-mood'), { color: 'var(--mind)', data: moodSeries(a, 14), fmt: f1, tick: f0, unit: 'out of 5', yMin: 1, yMax: 5, height: 170, band: { lo: Math.max(1, st.mood.lo), hi: Math.min(5, st.mood.hi) }, xfmt: fDay, aria: `${a.short}'s daily mood over the last 14 days` });
  refreshMente();
};

/* ===== Log ===== */
const storeStatusText = () => (Store.cloudEntries ? 'Saved to your account. Only you can see it.' : Store.status === 'conectando' ? 'Connecting to your account…' : 'Saved only on this device.');
function entriesHtml() {
  const a = S.profile;
  const list = Store.entries.filter((e) => e.crew === a.id && (S.entFilter === 'todo' || e.kind === S.entFilter));
  if (!list.length) return `<li class="empty"><b>${S.entFilter === 'todo' ? `No entries from ${esc(a.short)} yet` : 'No entries of this type'}</b><span>Start with something simple: how you slept, the best part of your day, or a symptom you want to remember.</span></li>`;
  return list.slice(0, 150).map((e) => {
    const d = new Date(e.ts);
    const kind = e.kind === 'checkin' ? 'Check-in' : e.kind === 'actividad' ? 'Activity' : 'Note';
    let body;
    if (e.kind === 'checkin') body = `${faceSvg(e.mood, 'mini-face')} <b>${moodLabel(e.mood)}</b>${e.stress ? ` · tension: ${TENSION[e.stress - 1].toLowerCase()}` : ''}${e.text ? `<br>${esc(e.text)}` : ''}`;
    else if (e.kind === 'actividad') body = esc(e.text || (actById(e.act) || {}).t || 'Activity');
    else body = `${e.mood ? faceSvg(e.mood, 'mini-face') + ' ' : ''}${esc(e.text)}`;
    const chips = [...e.tags, ...e.syms].map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    return `<li class="entry"><div class="entry-meta"><span class="entry-kind">${kind}</span><time>${esc(fWDay(d))} · ${fTime(d)}</time>${chips}</div>
      <button class="icon-btn" data-act="entry-del" data-id="${esc(e.id)}" aria-label="Delete entry">${icon('trash')}</button>
      <p class="entry-text">${body}</p>${e.img ? `<img src="${e.img}" alt="Drawing saved in the Log" width="220" height="220">` : ''}
      ${S.delAsk === e.id ? `<div class="confirm"><span>Delete this entry? This can't be undone.</span><button class="btn btn-crit btn-sm" data-act="entry-del-yes" data-id="${esc(e.id)}">Yes, delete</button><button class="btn btn-ghost btn-sm" data-act="entry-del-no">Cancel</button></div>` : ''}</li>`;
  }).join('');
}
const entFilterHtml = () => [['todo', 'All'], ['nota', 'Notes'], ['checkin', 'Check-ins'], ['actividad', 'Activities']].map(([k, l]) => `<button class="chip" data-act="ent-filter" data-k="${k}" aria-pressed="${S.entFilter === k}">${l}</button>`).join('');
const draftChipsHtml = () => ({
  tags: TAGS.map((t) => `<button class="chip" data-act="tag" data-t="${t}" aria-pressed="${S.draft.tags.has(t)}">${t}</button>`).join(''),
  syms: SYMS.map((t) => `<button class="chip" data-act="sym" data-t="${t}" aria-pressed="${S.draft.syms.has(t)}">${t}</button>`).join(''),
  mood: MOODS.map((m) => `<button class="face" role="radio" aria-checked="${S.draft.mood === m.v}" aria-label="${m.label}" title="${m.label}" data-act="entry-mood" data-v="${m.v}">${faceSvg(m.v)}</button>`).join(''),
});
function refreshDraft() { const h = draftChipsHtml(); setHtml('#ent-tags', h.tags); setHtml('#ent-sym', h.syms); setHtml('#ent-mood', h.mood); }
VIEWS.bitacora = () => `<header class="vh"><h1>Log</h1><p>Your personal record of what your measurements don't show: symptoms, how you slept, how work is going, or anything you want to remember.</p></header>
  <section class="card" aria-label="New entry">
    <label class="lbl" for="ent-text">New entry</label>
    <textarea id="ent-text" rows="3" maxlength="2000" placeholder="Write whatever you'd like to record here…"></textarea>
    <p class="lbl">Tags</p><div class="chips" id="ent-tags" role="group" aria-label="Tags"></div>
    <p class="lbl">Quick symptoms</p><div class="chips" id="ent-sym" role="group" aria-label="Symptoms"></div>
    <p class="lbl">How are you feeling? (optional)</p><div class="faces faces-sm" id="ent-mood" role="radiogroup" aria-label="Mood" style="max-width:260px"></div>
    <div class="row"><button class="btn btn-primary" data-act="entry-save">Save to the Log</button><p class="hint" id="store-status"></p></div>
    <p class="hint" id="ent-err" role="alert"></p>
  </section>
  <section aria-labelledby="h-ent"><div class="sec-h"><h2 id="h-ent">Your entries</h2><div class="chips" id="ent-filter" role="group" aria-label="Entry type"></div></div><ul class="entries" id="entries"></ul></section>`;
AFTER.bitacora = () => {
  refreshDraft();
  setHtml('#ent-filter', entFilterHtml());
  setHtml('#entries', entriesHtml());
  setText('#store-status', storeStatusText());
  if (S.prefill) { const t = $('#ent-text'); t.value = S.prefill; S.prefill = null; t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
};

/* ===== Data: archive and model ===== */
const SERIES = [
  { k: 'temp', name: 'Temperature', unit: '°C', ic: 'thermo', fmt: f1, minSpan: 1 },
  { k: 'hr', name: 'Resting heart rate', unit: 'bpm', ic: 'heart', fmt: f0, minSpan: 14 },
  { k: 'rr', name: 'Resting respiration', unit: 'br/min', ic: 'wind', fmt: f1, minSpan: 5 },
  { k: 'sys', name: 'Blood pressure (systolic)', unit: 'mmHg', ic: 'gauge', fmt: f0, minSpan: 30 },
  { k: 'dia', name: 'Blood pressure (diastolic)', unit: 'mmHg', ic: 'gauge', fmt: f0, minSpan: 20 },
  { k: 'spo2', name: 'Blood oxygen', unit: '%', ic: 'drop', fmt: f1, minSpan: 4, yMax: 100 },
  { k: 'glu', name: 'Blood glucose', unit: 'mg/dL', ic: 'drop2', fmt: f0, minSpan: 40 },
  { k: 'rad', name: 'Radiation', unit: 'µSv/h', ic: 'radiation', fmt: f0, minSpan: 30, yMin: 0 },
  { k: 'sleepH', name: 'Sleep per night', unit: 'h', ic: 'moon', fmt: f1, kind: 'bar', yMin: 0 },
  { k: 'mood', name: 'Mood', unit: 'out of 5', ic: 'smile', fmt: f1, yMin: 1, yMax: 5, mind: true },
];
function dayLevel(a, d) {
  const p = personalLimits(a);
  let lv = 0;
  if (d.temp >= 38 || d.hr >= 120 || d.rr >= 24 || d.spo2 < 90 || d.sys >= 140 || d.dia >= 90 || d.glu >= 180 || d.rad >= 100) lv = 2;
  else if (d.temp >= p.temp || d.hr >= p.hr || d.rr >= p.rr || d.spo2 <= p.spo2 || d.sys >= 130 || d.dia >= 80 || d.glu >= 126 || d.rad >= 50) lv = 1;
  const m = moodOf(a, d);
  if ((d.sleepH != null && d.sleepH < 5.5) || (m != null && m <= 2.4)) lv = Math.max(lv, 1);
  return LVN[lv];
}
function tableHtml(a, n) {
  const days = H[a.id].days.slice(-n).reverse();
  return `<table><thead><tr><th>Date</th><th>Temp. °C</th><th>Heart rate bpm</th><th>Resp. br/min</th><th>SpO₂ %</th><th>BP mmHg</th><th>Glucose mg/dL</th><th>Radiation µSv/h</th><th>Sleep h</th><th>Efficiency %</th><th>Awakenings</th><th>Exercise min</th><th>Mood</th><th>Status</th></tr></thead><tbody>${days.map((d) => {
    const mo = moodOf(a, d);
    return `<tr><td>${esc(fWDay(d.date))}${d.off === 0 ? ' · today' : ''}</td><td>${f1(d.temp)}</td><td>${f0(d.hr)}</td><td>${f1(d.rr)}</td><td>${f1(d.spo2)}</td><td>${f0(d.sys)}/${f0(d.dia)}</td><td>${f0(d.glu)}</td><td>${f0(d.rad)}</td><td>${d.sleepH == null ? '–' : f1(d.sleepH)}</td><td>${d.eff == null ? '–' : f0(d.eff)}</td><td>${d.awak == null ? '–' : d.awak}</td><td>${d.exMin}</td><td>${mo == null ? '–' : f1(mo)}</td><td>${pill(dayLevel(a, d))}</td></tr>`;
  }).join('')}</tbody></table>`;
}
function csvText(a, n) {
  const rows = [['date', 'temperature_c', 'heart_rate_bpm', 'respiration_brpm', 'spo2_pct', 'systolic_mmhg', 'diastolic_mmhg', 'glucose_mgdl', 'radiation_usvh', 'sleep_h', 'efficiency_pct', 'awakenings', 'exercise_min', 'mood_1to5', 'status']];
  const q = (v, d) => (v == null ? '' : Number(v).toFixed(d));
  H[a.id].days.slice(-n).forEach((d) => rows.push([d.key, q(d.temp, 2), q(d.hr, 1), q(d.rr, 1), q(d.spo2, 1), q(d.sys, 0), q(d.dia, 0), q(d.glu, 0), q(d.rad, 1), q(d.sleepH, 2), q(d.eff, 0), d.awak == null ? '' : d.awak, d.exMin, q(moodOf(a, d), 1), LEVELS[dayLevel(a, d)].label]));
  return rows.map((r) => r.join(',')).join('\n') + '\n';
}
function modelHtml(a) {
  const m = M[a.id], s = m.stats, p = personalLimits(a);
  const rows = [
    ['Temperature', `${f1(s.temp.mean)} °C`, `${f1(s.temp.lo)} to ${f1(s.temp.hi)} °C`, `from ${f1(p.temp)} °C`, `from ${f1(38)} °C`, `from ${f1(39.5)} °C`],
    ['Resting heart rate', `${f0(s.hr.mean)} bpm`, `${f0(s.hr.lo)} to ${f0(s.hr.hi)} bpm`, `from ${f0(p.hr)} bpm`, 'from 120 bpm (130 in normal activity)', 'from 140 bpm'],
    ['Resting respiration', `${f1(s.rr.mean)} br/min`, `${f0(s.rr.lo)} to ${f0(s.rr.hi)} br/min`, `from ${f1(p.rr)} br/min`, 'from 24 br/min', 'from 30 br/min'],
    ['Blood pressure', `${f0(s.sys.mean)}/${f0(s.dia.mean)} mmHg`, `${f0(s.sys.lo)}-${f0(s.sys.hi)} / ${f0(s.dia.lo)}-${f0(s.dia.hi)} mmHg`, '120/80 or more', '130/80 or more (stage 1)', '140/90 or more (stage 2)'],
    ['Blood oxygen', `${f1(s.spo2.mean)}%`, `${f0(s.spo2.lo)} to ${f0(Math.min(100, s.spo2.hi))}%`, `under 95% (${f1(p.spo2)}% or lower)`, 'under 94% (92% with chronic lung disease)', 'under 90%'],
    ['Blood glucose', `${f0(s.glu.mean)} mg/dL`, `${f0(s.glu.lo)} to ${f0(s.glu.hi)} mg/dL`, '126 mg/dL or more, or under 70', '180 mg/dL or more, or under 70 with symptoms', '300 mg/dL or more, or under 54'],
    ['Radiation', `${f0(s.rad.mean)} µSv/h`, `${f0(s.rad.lo)} to ${f0(s.rad.hi)} µSv/h`, '50 µSv/h or more', '100 µSv/h or more', '350 µSv/h or more'],
    ['Sleep', `${f1(s.sleepH.mean)} h`, `${f1(s.sleepH.lo)} to ${f1(s.sleepH.hi)} h`, 'a night under 5 h, or 5 h of sleep debt', '9 h of debt over 5 nights', 'n/a'],
  ];
  return `<div class="sec-h"><h2 id="h-mod">Personal model</h2><span class="kv">Trained on <b>${m.n} days</b> · from ${esc(fDay(m.from))} to ${esc(fDay(m.to))}</span></div>
    <p class="note" style="margin-bottom:12px">Stellar Health doesn't compare ${esc(a.short)} with an Earth average. It learns what their values look like when they're well and alerts you when they drift. In space, what's normal changes: for example, body temperature tends to rise on long missions, so the baseline is learned during the flight.</p>
    <div class="table-wrap"><table class="model"><thead><tr><th>Indicator</th><th>Baseline</th><th>Usual range</th><th>Watch</th><th>Alert</th><th>Emergency</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="txt"><b>${r[0]}</b></td>${r.slice(1).map((c) => `<td class="txt">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="hint" style="margin:8px 0 14px">The Watch column is personal: it uses the more sensitive of the general limit and the learned range. Alert and Emergency are safety limits that are the same for the whole crew. During exercise, the heart rate and respiration limits are relaxed.</p>
    <div class="card"><h3>Training window</h3>
      <div class="opts" role="radiogroup" aria-label="Training window">
        <button class="opt" role="radio" aria-checked="${settings.train === 'base'}" data-act="train" data-m="base"><span class="tile-ic">${icon('shield')}</span><span><b>Baseline: leave out the last week</b><small>Recommended. This way a recent change isn't learned as if it were normal.</small></span></button>
        <button class="opt" role="radio" aria-checked="${settings.train === 'todo'}" data-act="train" data-m="todo"><span class="tile-ic">${icon('clock')}</span><span><b>Full history: all 30 days</b><small>Adapts faster, but may treat abnormal values as normal.</small></span></button>
      </div>
      <div class="row"><button class="btn btn-primary" data-act="retrain">${icon('cpu')}Retrain now</button><p class="hint">Last trained: today at ${fTime(new Date(m.at))}</p></div>
    </div>
    <details class="card" style="margin-top:12px"><summary><b>How Stellar Health decides</b></summary>
      <ol class="apoyo" style="list-style:decimal;padding-left:20px">
        <li><b>Safety limits.</b> If a vital sign crosses a dangerous value, an alert or emergency is raised immediately, with its guide.</li>
        <li><b>Personal deviation.</b> A value that's normal for others may be unusual for you. If you leave your learned range, you get a Watch notice.</li>
        <li><b>Trends.</b> It reviews the last few days. A slow rise in temperature or heart rate, or several short nights in a row, is flagged before it becomes a problem.</li>
        <li><b>Context.</b> When you log a measurement, you say whether you were at rest or right after exercise. A high heart rate after exertion is not an alert.</li>
        <li><b>Persistence.</b> A severe emergency is communicated to the crew, and you can notify them whenever you want.</li>
      </ol>
    </details>`;
}
VIEWS.datos = () => {
  const a = S.profile, n = settings.range;
  return `<header class="vh"><h1>Data</h1><p>The archive of the measurements ${esc(a.short)} has logged and the personal model Stellar Health learned from that data. Days before your first measurements are sample data.</p></header>
  <section aria-labelledby="h-arch">
    <div class="sec-h"><h2 id="h-arch">Archive</h2><div class="chips" role="group" aria-label="Period">${[7, 14, 30].map((d) => `<button class="chip" data-act="range" data-n="${d}" aria-pressed="${n === d}">${d} days</button>`).join('')}</div></div>
    <div class="charts">${SERIES.map((s) => `<article class="ccard"><div class="ccard-h"><span class="tile-ic${s.mind ? ' mind' : ''}">${icon(s.ic)}</span><h3>${s.name}</h3><span class="ccard-v" id="cv-${s.k}"></span></div><div id="ch-${s.k}"></div></article>`).join('')}</div>
  </section>
  <section aria-labelledby="h-tab">
    <div class="sec-h"><h2 id="h-tab">Daily log</h2><div class="row"><button class="btn btn-ghost btn-sm" data-act="csv-copy">${icon('copy')}Copy as CSV</button>${S.dl ? `<button class="btn btn-ghost btn-sm" data-act="csv-save">${icon('download')}Download CSV</button>` : ''}</div></div>
    <div class="table-wrap" id="tabla"></div>
    <p class="hint" style="margin-top:8px">Rows with values outside your personal range are marked Watch. Today's exercise counts up to this moment.</p>
  </section>
  <section aria-labelledby="h-ref"><div class="sec-h"><h2 id="h-ref">Reference values in space</h2></div>
    <div class="table-wrap"><table class="model"><thead><tr><th>Measurement</th><th>How to measure it</th><th>In space</th><th>Expected values</th></tr></thead><tbody>${SPACE_REF.map((r) => `<tr><td class="txt"><b>${r.name}</b></td><td class="txt">${esc(r.how)}</td><td class="txt">${esc(r.space)}</td><td class="txt">${r.lines.map(esc).join('<br>')}</td></tr>`).join('')}</tbody></table></div>
  </section>
  <section aria-labelledby="h-mod" id="modelo"></section>`;
};
AFTER.datos = () => {
  const a = S.profile, n = settings.range, st = M[a.id].stats, days = H[a.id].days.slice(-n);
  SERIES.forEach((s) => {
    let data = days.map((d) => ({ t: d.date, v: s.k === 'mood' ? moodOf(a, d) : d[s.k] })).filter((p) => p.v != null);
    const band = s.k === 'mood' ? { lo: Math.max(1, st.mood.lo), hi: Math.min(5, st.mood.hi) } : s.k === 'spo2' ? { lo: st.spo2.lo, hi: Math.min(100, st.spo2.hi) } : { lo: st[s.k].lo, hi: st[s.k].hi };
    const refs = [];
    if (s.k === 'temp' && Math.max(...data.map((p) => p.v)) >= 37.05) refs.push({ v: 37.3, label: 'general watch level' });
    if (s.k === 'sleepH') refs.push({ v: a.need, label: 'what you need' });
    const last = data[data.length - 1];
    setHtml('#cv-' + s.k, last ? `${s.fmt(last.v)}<small>${s.unit}</small>` : '');
    CH[s.k] = makeChart($('#ch-' + s.k), { kind: s.kind, color: s.mind ? 'var(--mind)' : 'var(--body)', data, band, refs, fmt: s.fmt, tick: s.k === 'mood' || s.k === 'sleepH' || s.k === 'hr' ? f0 : s.fmt, unit: s.unit, minSpan: s.minSpan, yMin: s.yMin, yMax: s.yMax, height: 160,
      xfmt: s.k === 'sleepH' ? (t) => 'night of ' + fDay(addDays(t, -1)) : fDay, aria: `${a.short}'s ${s.name.toLowerCase()} over the last ${n} days` });
    if (s.k === 'sleepH') CH[s.k].update(data, { xfmt: fDay, tipx: true });
  });
  setHtml('#tabla', tableHtml(a, n));
  setHtml('#modelo', modelHtml(a));
};

/* ===== Crew ===== */
function crewListHtml() {
  return CREW.map((c) => {
    const me = c.id === S.profile.id, st = me ? S.state : computeState(c);
    return `<article class="member${me ? ' me' : ''}"><div class="member-h">${avatar(c, me)}<div><h3>${esc(c.name)}${me ? ' <span class="tag">You</span>' : ''}</h3><small>${esc(c.role)}</small></div></div>
      <dl><dt>Body</dt><dd>${pill(st.body.level)}</dd><dt>Mind</dt><dd>${pill(st.mind.level)}</dd></dl>
      ${me ? '' : `<button class="btn btn-ghost btn-sm" data-act="set-profile" data-id="${c.id}">View as ${esc(c.short)}</button>`}</article>`;
  }).join('');
}
function crewAlertsHtml() {
  const me = S.profile.id, list = Store.alerts.slice(0, 20);
  if (!list.length) return '<div class="empty"><b>No alerts</b><span>When someone has a severe emergency or an ongoing alert, it will appear here for the whole crew.</span></div>';
  return list.map((x) => {
    const live = alertLive(x), acks = Object.keys(x.acks).map((id) => crewById(id).short);
    const why = x.reason === 'grave' ? 'automatic notice for a severe emergency' : x.reason === 'continua' ? 'automatic notice because the alert continued' : 'notice sent manually';
    return `<article class="calert lvl-${live ? x.level : 'ok'}${live ? '' : ' off'}"><span class="insight-ic">${icon(live ? (x.level === 'emergency' ? 'octagon' : 'alert') : 'check')}</span><div>
      <h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p>
      <p class="hint">${live ? 'Active' : x.status === 'resuelta' ? 'Resolved' : 'Expired'} · ${ago(x.ts)} · ${why}${acks.length ? ` · on the way: ${esc(acks.join(', '))}` : ''}</p>
      ${live ? `<div class="row" style="margin-top:8px">${x.from !== me && !x.acks[me] ? `<button class="btn btn-primary btn-sm" data-act="ack" data-id="${esc(x.id)}">I'm on my way</button>` : ''}${x.guide ? `<button class="btn btn-ghost btn-sm" data-act="guide" data-id="${x.guide}" data-helper="1">${x.from === me ? 'View guide' : 'How to help'}</button>` : ''}<button class="btn btn-ghost btn-sm" data-act="resolve" data-id="${esc(x.id)}">Mark as resolved</button></div>` : ''}</div></article>`;
  }).join('');
}
const shareNote = () => (Store.cloudAlerts ? 'Alerts are shared live with anyone who opens this page with permission to use it. Each person chooses which crew member they represent.' : 'Not connected to an account: alerts are only visible on this device. To see how another crew member receives them, use "View as".');
VIEWS.equipo = () => `<header class="vh"><h1>Crew</h1><p>Each crew member's overall status and the alerts shared with everyone. Notes and mood logs stay private.</p></header>
  <section aria-labelledby="h-crew"><div class="sec-h"><h2 id="h-crew">Sample profiles</h2><p class="hint">Each profile logs its own measurements</p></div><div class="crew" id="crew-list"></div></section>
  <section aria-labelledby="h-cal"><div class="sec-h"><h2 id="h-cal">Crew alerts</h2><div class="row"><button class="btn btn-crit btn-sm" data-act="sos">${icon('send')}Ask for help</button><button class="btn btn-ghost btn-sm" data-act="alerts-clear">Clear resolved</button></div></div>
    <div class="panel" id="calerts"></div><p class="note" id="share-note" style="margin-top:10px"></p></section>`;
function refreshEquipo() { setHtml('#crew-list', crewListHtml()); setHtml('#calerts', crewAlertsHtml()); setText('#share-note', shareNote()); }
AFTER.equipo = refreshEquipo;

/* ===== Guides ===== */
const guideCard = (id) => { const g = GUIDES[id]; return `<button class="guide" data-act="guide" data-id="${id}"><span class="tile-ic${g.dom === 'mente' ? ' mind' : ''}">${icon(g.ic)}</span><span><h3>${esc(g.title)}</h3><p>${esc(g.when)}</p></span></button>`; };
VIEWS.guias = () => `<header class="vh"><h1>Emergency guides</h1><p>Clear steps for when something goes wrong, for you or to help a crewmate. They open automatically when there's an alert.</p></header>
  <section aria-labelledby="h-gc"><div class="sec-h"><h2 id="h-gc">Body</h2></div><div class="guides">${Object.keys(GUIDES).filter((k) => GUIDES[k].dom === 'cuerpo').map(guideCard).join('')}</div></section>
  <section aria-labelledby="h-gm"><div class="sec-h"><h2 id="h-gm">Mind</h2></div><div class="guides">${Object.keys(GUIDES).filter((k) => GUIDES[k].dom === 'mente').map(guideCard).join('')}</div></section>
  <section class="card"><h2>Need someone now?</h2><p>If the situation is serious or isn't improving, notify the crew. You don't need to be sure to ask for help.</p><div class="row"><button class="btn btn-crit" data-act="sos">${icon('send')}Notify the crew</button></div></section>`;

/* ===== Routing and refresh ===== */
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
  if (S.sheet === 'emer') renderEmCrew();
  if (S.view === 'inicio') renderInicioLive();
  else if (S.view === 'equipo') refreshEquipo();
  else if (S.view === 'mente') { setHtml('#mente-idx', mindCardHtml()); setText('#rem-info', remInfoText()); }
  if (S.tickN % 15 === 0) renderMision();
}
