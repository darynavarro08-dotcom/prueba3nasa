/* ===== AI advisor: explains the rule-based priority tree (Groq, Gemini or OpenAI). The rules stay in charge of safety levels. ===== */
const K_AI = 'sh.ia.v1';
const PROVIDERS = {
  groq: { name: 'Groq (free)', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.1-8b-instant', keyUrl: 'https://console.groq.com/keys', ph: 'gsk_...' },
  gemini: { name: 'Google Gemini (free)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.0-flash', keyUrl: 'https://aistudio.google.com/apikey', ph: 'AIza...' },
  openai: { name: 'OpenAI (paid)', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', keyUrl: 'https://platform.openai.com/api-keys', ph: 'sk-...' },
};
const AI = Object.assign({ provider: 'groq', keys: {}, models: {} }, LS.get(K_AI, {}) || {});
if (!PROVIDERS[AI.provider]) AI.provider = 'groq';
AI.keys = AI.keys || {}; AI.models = AI.models || {};
if (AI.key) { AI.keys.openai = AI.key; AI.models.openai = AI.model; AI.provider = 'openai'; delete AI.key; delete AI.model; }
const aiKey = () => AI.keys[AI.provider] || '';
const aiModel = () => AI.models[AI.provider] || PROVIDERS[AI.provider].model;
const AI_OUT = {};
const aiSave = () => LS.set(K_AI, { provider: AI.provider, keys: AI.keys, models: AI.models });

function aiContext(a) {
  const st = S.state, rd = RT[a.id].reading, f = ficha(a);
  const conds = [...st.body.conds, ...st.mind.conds].sort((x, y) => LV[y.level] - LV[x.level])
    .map((c) => ({ level: c.level, what: condTitle(c.code, c.v), guide: COND[c.code].guide }));
  const ins = [...st.body.ins, ...st.mind.ins].map((i) => ({ level: i.level, what: i.title, detail: i.text }));
  const meas = {};
  if (rd) ['temp', 'hr', 'rr', 'spo2', 'sys', 'dia', 'glu', 'rad'].forEach((k) => { if (rd[k] != null) meas[k] = rd[k]; });
  return { dataNote: rd ? 'Measurements are from the last 12 hours.' : 'No measurement in the last 12 hours: vital-sign conditions cannot be assessed. Ask the user to log a measurement, and base advice on insights, mind and training only.', age: f.age, sex: f.sex, history: f.hx, measurementState: rd ? rd.state : null, measurements: meas,
    body: { level: st.body.level, index: st.body.index }, mind: { level: st.mind.level, index: st.mind.index },
    conditions: conds, insights: ins, training: loadTrend(a).filter((x) => x.level !== 'ok').map((x) => ({ exercise: x.name, level: x.level, note: x.note })) };
}
const AI_SYSTEM = `You are the advisor of Stellar Health, a crew health app for astronauts. Follow this priority tree strictly, in this order:
1. EMERGENCY conditions: tell them to follow the emergency guide now and notify the crew.
2. ALERT conditions.
3. WATCH conditions.
4. Prevention insights and training trends (possible muscle or bone loss).
5. Mind and well-being.
Address the highest level present first and mention lower ones only briefly. Never downgrade, dismiss or contradict a level computed by the app. You do not diagnose; for anything serious, direct them to the Medical Officer. If everything is ok, say so and give one small habit tip. Reply in English, in at most 110 words, as a short numbered list of actions in priority order.`;

async function aiAsk(a) {
  const pv = PROVIDERS[AI.provider];
  const r = await fetch(pv.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + aiKey() },
    body: JSON.stringify({ model: aiModel(), temperature: 0.2, max_tokens: 300,
      messages: [{ role: 'system', content: AI_SYSTEM }, { role: 'user', content: JSON.stringify(aiContext(a)) }] }),
  });
  if (!r.ok) {
    let m = '';
    try { m = (await r.json()).error.message; } catch (e) { /* no JSON body */ }
    throw new Error(`${pv.name} error ${r.status}: ${m || 'request failed'}${r.status === 429 ? ' (rate limit reached or no credit)' : ''}`);
  }
  const j = await r.json();
  return String(j.choices && j.choices[0] && j.choices[0].message.content || '').trim();
}
function aiHtml(a) {
  const st = S.state, top = LV[st.body.level] >= LV[st.mind.level] ? st.body : st.mind, o = AI_OUT[a.id];
  const guide = [...st.body.conds, ...st.mind.conds].sort((x, y) => LV[y.level] - LV[x.level])[0];
  return `<div class="card">
    <p class="note">Priority level from the app's rules: ${pill(top.level)}. The AI explains what to do first, but it can't change this level.</p>
    <div id="ai-out" aria-live="polite">${o ? `<p style="white-space:pre-line">${esc(o)}</p>` : ''}</div>
    <div class="row"><button class="btn btn-primary" data-act="ai-ask" ${aiKey() ? '' : 'disabled'}>${icon('cpu')}Ask the AI advisor</button>${guide ? `<button class="btn btn-soft btn-sm" data-act="guide" data-id="${COND[guide.code].guide}">Open the guide</button>` : ''}</div>
    <p class="hint" id="ai-err" role="alert">${aiKey() ? '' : 'Add an API key below to enable it.'}</p>
    <details><summary><b>API key settings</b></summary>
      <div style="display:grid;gap:10px;margin-top:10px"><div><label class="lbl" for="ai-prov">Provider</label><select id="ai-prov">${Object.entries(PROVIDERS).map(([k, v]) => `<option value="${k}"${k === AI.provider ? ' selected' : ''}>${v.name}</option>`).join('')}</select></div>
      <div><label class="lbl" for="ai-key">API key</label><input type="password" id="ai-key" placeholder="${PROVIDERS[AI.provider].ph}" autocomplete="off" value="${esc(aiKey())}"></div>
      <p class="hint">Get a free key at <a href="${PROVIDERS[AI.provider].keyUrl}" target="_blank" rel="noopener">${PROVIDERS[AI.provider].keyUrl.replace('https://', '')}</a></p>
      <div><label class="lbl" for="ai-model">Model</label><input type="text" id="ai-model" value="${esc(aiModel())}" autocomplete="off"></div>
      <p class="hint">The key is saved only in this browser. When you press the button, your current readings and status are sent to the selected provider. Never share a key you don't want others to use.</p>
      <div class="row"><button class="btn btn-soft btn-sm" data-act="ai-save">Save key</button><button class="btn btn-ghost btn-sm" data-act="ai-clear">Remove key</button></div></div>
    </details></div>`;
}
const viewInicio = VIEWS.inicio;
VIEWS.inicio = () => viewInicio().replace('<div class="cols">', `<section aria-labelledby="h-ai"><div class="sec-h"><h2 id="h-ai">AI advisor</h2><p class="hint">Uses the priority tree: emergency, alert, watch, prevention, mind</p></div><div id="ai-card">${aiHtml(S.profile)}</div></section>\n  <div class="cols">`);
Object.assign(ACT, {
  'ai-save': () => { AI.keys[AI.provider] = $('#ai-key').value.replace(/\s+/g, ''); AI.models[AI.provider] = $('#ai-model').value.trim() || PROVIDERS[AI.provider].model; aiSave(); setHtml('#ai-card', aiHtml(S.profile)); },
  'ai-clear': () => { delete AI.keys[AI.provider]; aiSave(); setHtml('#ai-card', aiHtml(S.profile)); },
  'ai-ask': async (el) => {
    const a = S.profile;
    el.disabled = true; setText('#ai-err', 'Thinking…');
    try { AI_OUT[a.id] = await aiAsk(a); setHtml('#ai-card', aiHtml(a)); }
    catch (e) { el.disabled = false; setText('#ai-err', e.message === 'Failed to fetch' ? 'Could not reach the AI provider. Check your connection.' : e.message); }
  },
});
if (booted) route();
document.addEventListener('change', (ev) => {
  if (ev.target.id !== 'ai-prov') return;
  AI.provider = ev.target.value; aiSave();
  const d = $('#ai-card details'); setHtml('#ai-card', aiHtml(S.profile)); if (d) $('#ai-card details').open = true;
});
