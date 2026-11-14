/* ===== Gráficas SVG: línea o barras de una sola serie, con banda de rango personal,
   líneas de referencia, lectura al pasar el cursor y con teclado ===== */
function niceTicks(lo, hi, n) {
  const span = hi - lo || 1, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))), f = step0 / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag, out = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}
function makeChart(host, cfg) {
  host.classList.add('chart');
  host.style.setProperty('--c', cfg.color || 'var(--body)');
  host.innerHTML = '<svg role="img"></svg><div class="tip" hidden></div>';
  const svg = host.firstChild, tip = host.lastChild;
  svg.setAttribute('aria-label', cfg.aria || '');
  if (!cfg.compact) host.tabIndex = 0;
  const bar = cfg.kind === 'bar';
  let hover = -1, geo = null, raf = 0;

  function draw() {
    const data = cfg.data, n = data.length;
    const W = Math.max(110, host.clientWidth || 300), Hh = cfg.height || (cfg.compact ? 46 : 150);
    const m = cfg.compact ? { l: 3, r: 8, t: 7, b: 5 } : { l: 34, r: bar ? 10 : 42, t: 12, b: 22 };
    const iw = W - m.l - m.r, ih = Hh - m.t - m.b;
    if (!n) { svg.innerHTML = ''; return; }
    const vals = data.map((d) => d.v);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (cfg.band) { lo = Math.min(lo, cfg.band.lo); hi = Math.max(hi, cfg.band.hi); }
    (cfg.refs || []).forEach((r) => { lo = Math.min(lo, r.v); hi = Math.max(hi, r.v); });
    if (cfg.minSpan && hi - lo < cfg.minSpan) { const mid = (hi + lo) / 2; lo = mid - cfg.minSpan / 2; hi = mid + cfg.minSpan / 2; }
    const pad = (hi - lo) * 0.1;
    lo = cfg.yMin != null ? cfg.yMin : lo - pad;
    hi = cfg.yMax != null ? Math.max(cfg.yMax, hi) : hi + pad;
    const slot = iw / n;
    const x = (i) => (bar ? m.l + slot * (i + 0.5) : m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw));
    const y = (v) => m.t + (1 - (v - lo) / (hi - lo)) * ih;
    geo = { m, iw, n, slot, x, y, W };
    let s = '';
    if (!cfg.compact) {
      niceTicks(lo, hi, 3).forEach((t) => {
        s += `<line class="ch-grid" x1="${m.l}" x2="${m.l + iw}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="ch-axis" x="${m.l - 6}" y="${(y(t) + 3.5).toFixed(1)}" text-anchor="end">${esc(cfg.tick ? cfg.tick(t) : cfg.fmt(t))}</text>`;
      });
    }
    if (cfg.band) {
      const y1 = y(Math.min(hi, cfg.band.hi)), y2 = y(Math.max(lo, cfg.band.lo));
      s += `<rect class="ch-band" x="${m.l}" y="${y1.toFixed(1)}" width="${iw}" height="${Math.max(0, y2 - y1).toFixed(1)}" rx="3"/>`;
      if (!cfg.compact && y2 - y1 >= 15) s += `<text class="ch-bandl" x="${m.l + 5}" y="${(y1 + 11).toFixed(1)}">tu rango habitual</text>`;
    }
    (cfg.refs || []).forEach((r) => {
      s += `<line class="ch-ref" x1="${m.l}" x2="${m.l + iw}" y1="${y(r.v).toFixed(1)}" y2="${y(r.v).toFixed(1)}"/>`;
      if (!cfg.compact && r.label) s += `<text class="ch-axis" x="${m.l + iw}" y="${(y(r.v) - 4).toFixed(1)}" text-anchor="end">${esc(r.label)}</text>`;
    });
    if (bar) {
      const bw = Math.max(2, Math.min(24, slot - 2)), yb = y(lo);
      data.forEach((d, i) => {
        const x0 = x(i) - bw / 2, x1 = x0 + bw, y0 = Math.min(yb, y(d.v)), r = Math.min(4, bw / 2, yb - y0);
        s += `<path class="ch-bar${hover >= 0 && hover !== i ? ' dim' : ''}" d="M${x0.toFixed(1)} ${yb.toFixed(1)}V${(y0 + r).toFixed(1)}Q${x0.toFixed(1)} ${y0.toFixed(1)} ${(x0 + r).toFixed(1)} ${y0.toFixed(1)}H${(x1 - r).toFixed(1)}Q${x1.toFixed(1)} ${y0.toFixed(1)} ${x1.toFixed(1)} ${(y0 + r).toFixed(1)}V${yb.toFixed(1)}Z"/>`;
      });
    } else {
      s += `<path class="ch-line" d="${data.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d.v).toFixed(1)).join('')}"/>`;
      const li = n - 1;
      s += `<circle class="ch-dot" cx="${x(li).toFixed(1)}" cy="${y(data[li].v).toFixed(1)}" r="4"/>`;
      if (!cfg.compact) s += `<text class="ch-end" x="${(x(li) + 8).toFixed(1)}" y="${(y(data[li].v) + 4).toFixed(1)}">${esc(cfg.fmt(data[li].v))}</text>`;
    }
    if (!cfg.compact) {
      const idx = Array.from(new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1]));
      idx.forEach((i) => {
        const anchor = bar ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
        s += `<text class="ch-axis" x="${x(i).toFixed(1)}" y="${Hh - 6}" text-anchor="${anchor}">${esc(cfg.xfmt(data[i].t))}</text>`;
      });
    }
    if (hover >= 0 && hover < n) {
      const hx = x(hover), hy = y(data[hover].v);
      if (!bar) s += `<line class="ch-cross" x1="${hx.toFixed(1)}" x2="${hx.toFixed(1)}" y1="${m.t}" y2="${m.t + ih}"/><circle class="ch-dot" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="5"/>`;
      tip.hidden = false;
      tip.innerHTML = `<b>${esc(cfg.fmt(data[hover].v))} ${esc(cfg.unit || '')}</b><br><span>${esc(cfg.xfmt(data[hover].t))}</span>`;
      tip.style.left = clamp(hx, 46, W - 46) + 'px';
      tip.style.top = Math.max(26, hy - 9) + 'px';
    } else tip.hidden = true;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.setAttribute('height', Hh);
    svg.innerHTML = s;
  }
  const setHover = (i) => { if (i !== hover) { hover = i; draw(); } };
  const fromEvent = (e) => {
    if (!geo) return -1;
    const px = e.clientX - svg.getBoundingClientRect().left;
    const i = bar ? Math.floor((px - geo.m.l) / geo.slot) : Math.round(((px - geo.m.l) / geo.iw) * (geo.n - 1));
    return clamp(i, 0, geo.n - 1);
  };
  host.addEventListener('pointermove', (e) => setHover(fromEvent(e)));
  host.addEventListener('pointerdown', (e) => setHover(fromEvent(e)));
  host.addEventListener('pointerleave', () => setHover(-1));
  if (!cfg.compact) {
    host.addEventListener('focus', () => { if (hover < 0) setHover(cfg.data.length - 1); });
    host.addEventListener('blur', () => setHover(-1));
    host.addEventListener('keydown', (e) => {
      const n = cfg.data.length, k = e.key;
      const i = k === 'ArrowLeft' ? Math.max(0, hover - 1) : k === 'ArrowRight' ? Math.min(n - 1, hover + 1) : k === 'Home' ? 0 : k === 'End' ? n - 1 : -2;
      if (i > -2) { e.preventDefault(); setHover(i); }
    });
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }) : null;
  if (ro) ro.observe(host);
  draw();
  return {
    update(data, patch) { cfg.data = data; if (patch) Object.assign(cfg, patch); if (hover >= data.length) hover = -1; draw(); },
    destroy() { if (ro) ro.disconnect(); cancelAnimationFrame(raf); },
  };
}

/* ===== Actograma: movimiento por hora del día, una fila por día ===== */
function makeActogram(host, a, nDays) {
  const days = H[a.id].days.slice(-nDays);
  host.classList.add('acto');
  host.innerHTML = `<svg role="img" aria-label="Actograma de ${esc(a.short)}: movimiento por hora del día en los últimos ${nDays} días, con los periodos de sueño sombreados"></svg><p class="acto-read"></p>`;
  const svg = host.firstChild, read = host.lastChild;
  const idle = 'Pasa el cursor o toca una fila para leer ese momento.';
  read.textContent = idle;
  const BIN = 10, NB = 144, rowH = 20, padL = 50, padT = 6, padB = 20, padR = 6;
  let W = 0, iw = 0, raf = 0;
  const intervals = (d) => {
    const iv = [];
    const a1 = Math.max(0, d.night.bed), b1 = Math.min(d.night.wake, d.upto);
    if (b1 > a1) iv.push([a1, b1]);
    const a2 = 1440 + d.next.bed, b2 = Math.min(1440, d.upto);
    if (a2 < 1440 && b2 > a2) iv.push([a2, b2]);
    return iv;
  };
  function draw() {
    W = Math.max(250, host.clientWidth || 600);
    iw = W - padL - padR;
    const Hh = padT + days.length * rowH + padB, bw = iw / NB;
    let s = '';
    for (const h of [0, 6, 12, 18, 24]) {
      const x = padL + (h / 24) * iw;
      s += `<line class="ch-grid" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${padT}" y2="${padT + days.length * rowH}"/><text class="ch-axis" x="${x.toFixed(1)}" y="${Hh - 6}" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${String(h).padStart(2, '0')}:00</text>`;
    }
    days.forEach((d, i) => {
      const y0 = padT + i * rowH, base = y0 + rowH - 2;
      s += `<text class="ch-axis" x="${padL - 7}" y="${base - 4}" text-anchor="end">${esc(fDay(d.date))}</text>`;
      intervals(d).forEach(([m0, m1]) => { s += `<rect class="acto-sleep" x="${(padL + (m0 / 1440) * iw).toFixed(1)}" y="${y0 + 1}" width="${(((m1 - m0) / 1440) * iw).toFixed(1)}" height="${rowH - 3}" rx="3"/>`; });
      let p = '';
      for (let b = 0; b < NB; b++) {
        const m0 = b * BIN;
        if (m0 >= d.upto) break;
        let sum = 0;
        for (let k = 0; k < BIN; k++) sum += d.ep[m0 + k];
        const c = sum / BIN;
        if (c < 2) continue;
        const h = Math.min(rowH - 4, (Math.log10(c + 1) / 3.1) * (rowH - 4));
        p += `M${(padL + b * bw).toFixed(1)} ${base}v${(-h).toFixed(1)}h${Math.max(1, bw - 0.5).toFixed(1)}v${h.toFixed(1)}z`;
      }
      if (p) s += `<path class="acto-bars" d="${p}"/>`;
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.setAttribute('height', Hh);
    svg.innerHTML = s;
  }
  const onMove = (e) => {
    const r = svg.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const i = Math.floor((py - padT) / rowH), min = Math.floor(((px - padL) / iw) * 1440);
    if (i < 0 || i >= days.length || min < 0 || min >= 1440) { read.textContent = idle; return; }
    const d = days[i];
    if (min >= d.upto) { read.textContent = `${fWDay(d.date)} · ${hm(min)} · todavía sin datos`; return; }
    const asleep = intervals(d).some(([m0, m1]) => min >= m0 && min < m1);
    read.textContent = `${fWDay(d.date)} · ${hm(min)} · ${f0(d.ep[min])} cuentas/min · ${asleep ? 'periodo de sueño' : 'despierto'}`;
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerdown', onMove);
  host.addEventListener('pointerleave', () => { read.textContent = idle; });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }) : null;
  if (ro) ro.observe(host);
  draw();
  return { update() { draw(); }, destroy() { if (ro) ro.disconnect(); cancelAnimationFrame(raf); } };
}

/* ===== Ventana al espacio: aurora sobre el horizonte (decorativa) ===== */
const SKY = { raf: 0, last: 0 };
function drawSky(cv, t) {
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#090d22'); bg.addColorStop(1, '#151b42');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  const r = rng(7);
  for (let i = 0; i < 80; i++) {
    const x = r() * w, y = r() * h * 0.8, s = r() * 1.1 + 0.3, al = 0.3 + 0.5 * r();
    c.globalAlpha = al * (0.75 + 0.25 * Math.sin(t * 0.9 + i * 1.7));
    c.fillStyle = i % 6 === 0 ? '#ffe9a8' : '#ffffff';
    c.beginPath(); c.arc(x, y, s, 0, 6.3); c.fill();
  }
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'lighter';
  const sw = 7, n = Math.ceil(w / sw) + 1;
  for (let i = 0; i < n; i++) {
    const u = i / n, x = i * sw;
    const edge = 0.35 + 0.65 * u;
    const base = h * (0.7 + 0.1 * Math.sin(u * 5.2 + t * 0.16) + 0.04 * Math.sin(u * 13 + t * 0.27));
    const tall = h * (0.42 + 0.2 * Math.sin(u * 7.1 + 1.3 + t * 0.12));
    const k = (0.07 + 0.11 * (0.5 + 0.5 * Math.sin(u * 17 + t * 0.45))) * edge;
    const g = c.createLinearGradient(0, base - tall, 0, base);
    g.addColorStop(0, 'rgba(154,140,255,0)');
    g.addColorStop(0.45, `rgba(154,140,255,${(k * 0.6).toFixed(3)})`);
    g.addColorStop(0.86, `rgba(67,224,200,${k.toFixed(3)})`);
    g.addColorStop(1, 'rgba(67,224,200,0)');
    c.fillStyle = g; c.fillRect(x, base - tall, sw + 0.6, tall);
  }
  c.globalCompositeOperation = 'source-over';
  const R = Math.max(w * 1.5, 900), cy = h + R - Math.min(34, h * 0.14);
  c.beginPath(); c.arc(w * 0.5, cy, R, 0, 6.3);
  c.fillStyle = '#081430'; c.fill();
  c.lineWidth = 7; c.strokeStyle = 'rgba(120,220,255,.10)';
  c.beginPath(); c.arc(w * 0.5, cy, R + 2, Math.PI * 1.2, Math.PI * 1.8); c.stroke();
  c.lineWidth = 1.6; c.strokeStyle = 'rgba(140,228,255,.6)';
  c.beginPath(); c.arc(w * 0.5, cy, R, Math.PI * 1.2, Math.PI * 1.8); c.stroke();
}
function startSky() {
  const cv = $('#sky');
  if (!cv) return;
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  drawSky(cv, 0);
  if (still) { SKY.ro = new ResizeObserver(() => drawSky(cv, 0)); SKY.ro.observe(cv); return; }
  const loop = (now) => {
    SKY.raf = requestAnimationFrame(loop);
    if (document.hidden || now - SKY.last < 90) return;
    SKY.last = now;
    drawSky(cv, (now - t0) / 1000);
  };
  SKY.raf = requestAnimationFrame(loop);
}
function stopSky() { cancelAnimationFrame(SKY.raf); SKY.raf = 0; if (SKY.ro) { SKY.ro.disconnect(); SKY.ro = null; } }
