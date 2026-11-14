/* ===== Training: routine checklist, stopwatch and load/performance logbook ===== */
const SW = { run: false, since: 0, acc: 0, ex: null };
const swMs = () => SW.acc + (SW.run ? Date.now() - SW.since : 0);
const swText = (ms) => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600); return `${h ? h + ':' : ''}${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const swBtnText = () => `${icon(SW.run ? 'pause' : 'clock')}${SW.run ? 'Pause' : SW.acc ? 'Resume' : 'Start'}`;
setInterval(() => { const el = $('#sw-time'); if (el) el.textContent = swText(swMs()); }, 250);

const exOptions = (a, sel) => exList(a).map((x) => `<option value="${x.id}"${x.id === sel ? ' selected' : ''}>${esc(x.t)}</option>`).join('');
function logListHtml(a) {
  const rows = trData(a).log.slice(-8).reverse();
  if (!rows.length) return '<li><span>No entries yet. Log your first session above.</span></li>';
  return rows.map((e) => `<li><span><b>${esc(e.name)}</b> · ${e.kg > 0 ? f1(e.kg) + ' kg' : 'bodyweight'}${e.reps ? ' × ' + e.reps + ' reps' : ''} · ${PERF.find((p) => p[0] === e.perf)[1].toLowerCase()}<small>${esc(fDay(new Date(e.t)))}${e.note ? ' · ' + esc(e.note) : ''}</small></span><button type="button" class="btn btn-ghost btn-sm" data-act="lg-del" data-t="${e.t}" aria-label="Delete this entry">${icon('trash')}</button></li>`).join('');
}
function trendHtml(a) {
  const tr = loadTrend(a);
  if (!tr.length) return '<div class="empty"><b>No data yet</b><span>Log the load you use and how it went. After a few days, this shows whether your strength is holding up.</span></div>';
  return `<div class="table-wrap"><table class="model"><thead><tr><th>Exercise</th><th>Latest</th><th>Change</th><th>Status</th><th>What it means</th></tr></thead><tbody>${tr.map((x) => `<tr><td class="txt"><b>${esc(x.name)}</b></td><td class="txt">${f1(x.last.v)} ${x.unit}</td><td class="txt">${x.change == null ? '–' : (x.change > 0 ? '+' : '') + f0(x.change * 100) + '%'}</td><td class="txt">${pill(x.level)}</td><td class="txt">${esc(x.note)}</td></tr>`).join('')}</tbody></table></div>`;
}
VIEWS.entreno = () => {
  const a = S.profile, list = exList(a);
  if (!S.perf) S.perf = 3;
  if (!SW.ex || !list.some((x) => x.id === SW.ex)) SW.ex = list[0] ? list[0].id : null;
  const tr = loadTrend(a);
  if (!S.trEx || !tr.some((x) => x.id === S.trEx)) S.trEx = tr[0] ? tr[0].id : null;
  return `<header class="vh"><h1>Training</h1><p>Your daily routine, a stopwatch for each session, and a logbook of the load you use and how it went. Falling loads or performance over time can point to muscle or bone loss that affects mobility.</p></header>
  <div class="cols">
    <section aria-labelledby="h-rt"><div class="sec-h"><h2 id="h-rt">Today's routine</h2></div>
      <div class="card"><div id="ex-list">${exHtml(a)}</div>
        <details><summary><b>Edit routine</b></summary>
          <ul class="drivers" style="margin:10px 0">${list.map((x) => `<li><span>${esc(x.t)}<small>${x.min} min</small></span><button type="button" class="btn btn-ghost btn-sm" data-act="rt-del" data-id="${x.id}" aria-label="Remove ${esc(x.t)}">${icon('trash')}</button></li>`).join('') || '<li><span>No exercises</span></li>'}</ul>
          <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:10px"><div><label class="lbl" for="rt-name">Exercise</label><input type="text" id="rt-name" maxlength="60" placeholder="Squats with ARED" autocomplete="off"></div><div><label class="lbl" for="rt-min">Minutes</label><input type="text" inputmode="numeric" id="rt-min" placeholder="20" autocomplete="off"></div></div>
          <p class="hint" id="rt-err" role="alert"></p>
          <button class="btn btn-soft btn-sm" data-act="rt-add">${icon('plus')}Add to routine</button>
        </details></div></section>
    <section aria-labelledby="h-sw"><div class="sec-h"><h2 id="h-sw">Stopwatch</h2></div>
      <div class="card">
        <p class="tile-val"><span class="num" id="sw-time" style="font-size:44px">${swText(swMs())}</span></p>
        <div><label class="lbl" for="sw-ex">Exercise</label><select id="sw-ex">${exOptions(a, SW.ex)}</select></div>
        <div class="row"><button class="btn btn-primary" id="sw-btn" data-act="sw-toggle">${swBtnText()}</button><button class="btn btn-ghost" data-act="sw-reset">Reset</button><button class="btn btn-soft" data-act="sw-finish">${icon('check')}Finish and check off</button></div>
        <p class="hint" id="sw-today">Trained today: <b>${f0(trainedSec(a) / 60)} min</b></p>
      </div></section>
  </div>
  <section aria-labelledby="h-lg"><div class="sec-h"><h2 id="h-lg">Training logbook</h2></div>
    <div class="card">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px"><div><label class="lbl" for="lg-ex">Exercise</label><select id="lg-ex">${exOptions(a)}</select></div><div><label class="lbl" for="lg-kg">Weight used (kg)</label><input type="text" inputmode="decimal" id="lg-kg" placeholder="40 (0 = bodyweight)" autocomplete="off"></div><div><label class="lbl" for="lg-reps">Reps (optional)</label><input type="text" inputmode="numeric" id="lg-reps" placeholder="10" autocomplete="off"></div></div>
      <div><p class="lbl" id="l-perf">How did it go?</p><div class="chips" role="radiogroup" aria-labelledby="l-perf" id="lg-perf">${chipSet('lg-perf', 'perf', PERF.map(([k, l]) => [String(k), l]), (k) => S.perf === Number(k), true)}</div></div>
      <div><label class="lbl" for="lg-note">Note (optional)</label><input type="text" id="lg-note" maxlength="120" placeholder="Felt weak in the legs" autocomplete="off"></div>
      <p class="hint" id="lg-err" role="alert"></p>
      <div class="row"><button class="btn btn-primary" data-act="lg-save">${icon('check')}Save entry</button></div>
      <h3>Latest entries</h3><ul class="drivers" id="lg-list">${logListHtml(a)}</ul>
    </div></section>
  <section aria-labelledby="h-tr"><div class="sec-h"><h2 id="h-tr">Strength trend</h2><p class="hint">First days logged vs. the latest ones</p></div>
    <div id="tr-table">${trendHtml(a)}</div>
    ${tr.length ? `<article class="ccard" style="margin-top:12px"><div class="ccard-h"><h3>Load over time</h3></div><div class="chips" role="radiogroup" aria-label="Exercise">${chipSet('tr-chart', 'id', tr.map((x) => [x.id, x.name]), (k) => S.trEx === k, true)}</div><div id="ch-load"></div></article>` : ''}
  </section>`;
};
AFTER.entreno = () => {
  const x = loadTrend(S.profile).find((t) => t.id === S.trEx), host = $('#ch-load');
  if (!x || !host) return;
  CH.load = makeChart(host, { data: x.days.map((d) => ({ t: new Date(d.t), v: d.v })), fmt: f1, unit: x.unit, minSpan: x.unit === 'kg' ? 10 : 6, height: 160, xfmt: fDay, aria: `${x.name}: ${x.unit} used per day` });
};
