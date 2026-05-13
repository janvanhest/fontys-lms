// ---------- Tabs ----------
const tabs = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('main section');
tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.toggle('active', b === btn));
    const target = btn.dataset.tab;
    sections.forEach((s) => s.classList.toggle('active', s.id === `tab-${target}`));
    if (target === 'relational') loadRelational();
    if (target === 'vector') loadVector();
    if (target === 'info') loadInfo();
  });
});

// ---------- Chat ----------
const log = document.getElementById('log');
const form = document.getElementById('chat-form');
const input = document.getElementById('message');
const sendBtn = document.getElementById('send');
const history = [];

document.querySelectorAll('.scenario').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.msg;
    input.focus();
  });
});

function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (role === 'assistant' && window.marked) {
    div.innerHTML = window.marked.parse(text, { breaks: true, gfm: true });
  } else {
    div.textContent = text;
  }
  log.appendChild(div);
  requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
}

function appendTools(toolCalls) {
  if (!toolCalls || toolCalls.length === 0) return;
  toolCalls.forEach((t, i) => {
    const details = document.createElement('details');
    details.className = 'tool-call';
    const inputStr = JSON.stringify(t.input);
    const resultStr = JSON.stringify(t.result, null, 2);
    const count = Array.isArray(t.result) ? `${t.result.length} rij(en)` : '1 object';
    details.innerHTML = `
      <summary><strong>${i + 1}. ${escapeHtml(t.name)}</strong>(${escapeHtml(inputStr)}) -> ${count} <span style="color:#666;">(klik voor details)</span></summary>
      <pre>${escapeHtml(resultStr)}</pre>
    `;
    log.appendChild(details);
  });
  requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
}

const statusEl = document.getElementById('status');

function setStatus(html, mode = 'pending') {
  statusEl.className = 'status active' + (mode === 'error' ? ' error' : mode === 'done' ? ' done' : '');
  statusEl.innerHTML = html;
}

function clearStatus() {
  statusEl.className = 'status';
  statusEl.innerHTML = '';
}

function appendStatusStep(text, done = false) {
  const div = document.createElement('span');
  div.className = 'status-step';
  div.innerHTML = done ? `<span class="check">v</span>${text}` : `<span class="dot"></span>${text}`;
  statusEl.appendChild(div);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMsg('user', message);
  history.push({ role: 'user', content: message });
  input.value = '';
  sendBtn.disabled = true;

  setStatus('<span class="dot"></span>Verbinden met backend...');

  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, student_id: 1, history: history.slice(0, -1) }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let activeSteps = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const ev = parseSse(chunk);
        if (!ev) continue;
        handleSseEvent(ev.event, ev.data, activeSteps);
      }
    }
  } catch (err) {
    setStatus('<span class="status-step">Fout: ' + (err.message || String(err)) + '</span>', 'error');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

function parseSse(chunk) {
  const lines = chunk.split('\n');
  let event = null;
  let data = null;
  for (const line of lines) {
    if (line.startsWith('event: ')) event = line.slice(7);
    else if (line.startsWith('data: ')) data = line.slice(6);
  }
  if (!event || data === null) return null;
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

function handleSseEvent(event, data, activeSteps) {
  if (event === 'status') {
    if (data.phase === 'thinking') {
      activeSteps.push('Aan het denken (eerste Claude-call)...');
      renderSteps(activeSteps);
    } else if (data.phase === 'writing') {
      activeSteps.push('Antwoord aan het schrijven...');
      renderSteps(activeSteps);
    }
  } else if (event === 'tool_call') {
    activeSteps.push(`Tool: ${data.name}(${JSON.stringify(data.input)})`);
    renderSteps(activeSteps);
  } else if (event === 'tool_result') {
    activeSteps.push(`Resultaat van ${data.name}: ${data.count} rij(en)`);
    renderSteps(activeSteps, true);
  } else if (event === 'final') {
    appendTools(data.tool_calls);
    appendMsg('assistant', data.answer);
    history.push({ role: 'assistant', content: data.answer });
    setStatus('<span class="status-step"><span class="check">v</span>Klaar</span>', 'done');
    setTimeout(clearStatus, 1500);
  } else if (event === 'error') {
    setStatus('<span class="status-step">Fout: ' + (data.message || 'onbekend') + '</span>', 'error');
  }
}

function renderSteps(steps, lastDone = false) {
  statusEl.innerHTML = '';
  steps.forEach((text, i) => {
    const isLast = i === steps.length - 1;
    appendStatusStep(text, !isLast || lastDone);
  });
}

// ---------- Relationele DB ----------
const relationalContent = document.getElementById('relational-content');
document.getElementById('refresh-relational').addEventListener('click', loadRelational);

async function loadRelational() {
  relationalContent.textContent = 'Laden...';
  try {
    const res = await fetch('/api/db/students');
    const students = await res.json();
    relationalContent.innerHTML = students.map(renderStudent).join('');
  } catch (err) {
    relationalContent.textContent = 'Fout: ' + err.message;
  }
}

function renderStudent(s) {
  const voortgangRows = (s.voortgang || []).map((v) => `
    <tr>
      <td>${v.laag}</td>
      <td>${v.activiteit}</td>
      <td>${v.niveau_behaald ?? '-'}</td>
      <td>${v.niveau_bezig ?? '-'}</td>
      <td>${escapeHtml(v.toelichting || '')}</td>
    </tr>
  `).join('');

  const activiteitRows = (s.activiteiten || []).map((a) => `
    <tr>
      <td>${a.datum?.slice(0, 10) || '-'}</td>
      <td>${a.type || '-'}</td>
      <td>${escapeHtml(a.titel)}</td>
      <td><span class="badge ${a.afgerond ? 'badge-true' : 'badge-false'}">${a.afgerond ? 'afgerond' : 'open'}</span></td>
      <td>${escapeHtml(a.beschrijving || '')}</td>
    </tr>
  `).join('');

  return `
    <div class="student-card">
      <h3>#${s.id} ${escapeHtml(s.naam)} <span class="badge">${escapeHtml(s.opleiding || '')}</span> <span class="badge">semester ${s.semester}</span></h3>
      <div class="project">${escapeHtml(s.project_beschrijving || '')}</div>

      <details open>
        <summary><strong>Voortgang</strong> (${s.voortgang.length})</summary>
        <table>
          <thead><tr><th>Laag</th><th>Activiteit</th><th>Behaald</th><th>Bezig</th><th>Toelichting</th></tr></thead>
          <tbody>${voortgangRows}</tbody>
        </table>
      </details>

      <details>
        <summary><strong>Activiteiten</strong> (${s.activiteiten.length})</summary>
        <table>
          <thead><tr><th>Datum</th><th>Type</th><th>Titel</th><th>Status</th><th>Beschrijving</th></tr></thead>
          <tbody>${activiteitRows}</tbody>
        </table>
      </details>
    </div>
  `;
}

// ---------- Vector DB ----------
const vectorContent = document.getElementById('vector-content');
const chunkForm = document.getElementById('chunk-form');
const formLaag = document.getElementById('form-laag');
const formActiviteit = document.getElementById('form-activiteit');
const formNiveau = document.getElementById('form-niveau');
const formContent = document.getElementById('form-content');
let editingId = null;

document.getElementById('refresh-vector').addEventListener('click', loadVector);
document.getElementById('new-chunk').addEventListener('click', () => openForm(null));
document.getElementById('form-cancel').addEventListener('click', closeForm);
document.getElementById('form-save').addEventListener('click', saveChunk);

async function loadVector() {
  vectorContent.textContent = 'Laden...';
  try {
    const res = await fetch('/api/db/hbo-chunks');
    const chunks = await res.json();
    if (chunks.length === 0) {
      vectorContent.innerHTML = `
        <div class="empty-state">
          <strong>De vector DB is leeg.</strong><br><br>
          De seed heeft geen chunks aangemaakt. Meest waarschijnlijke oorzaak: Ollama was niet bereikbaar tijdens opstart.<br><br>
          Fix:<br>
          1. Check dat Ollama draait: <code>curl.exe http://localhost:11434/api/tags</code><br>
          2. Reset stack: <code>docker compose down -v &amp;&amp; docker compose up --build</code><br>
          3. Kijk in de logs naar de regel <code>[SeedService] HBO chunks geseed: 15</code>
        </div>
      `;
      return;
    }
    vectorContent.innerHTML = `
      <table class="vector-table">
        <thead>
          <tr><th>ID</th><th>Laag</th><th>Activiteit</th><th>Niveau</th><th>Content</th><th></th></tr>
        </thead>
        <tbody>
          ${chunks.map(renderChunk).join('')}
        </tbody>
      </table>
    `;
    vectorContent.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => openForm(chunks.find((c) => c.id === Number(b.dataset.edit)))),
    );
    vectorContent.querySelectorAll('[data-delete]').forEach((b) =>
      b.addEventListener('click', () => deleteChunk(Number(b.dataset.delete))),
    );
  } catch (err) {
    vectorContent.textContent = 'Fout: ' + err.message;
  }
}

function renderChunk(c) {
  return `
    <tr class="chunk-row">
      <td>${c.id}</td>
      <td>${escapeHtml(c.laag || '-')}</td>
      <td>${escapeHtml(c.activiteit || '-')}</td>
      <td><span class="badge badge-niv${c.niveau}">N${c.niveau}</span></td>
      <td class="content">${escapeHtml(c.content)}</td>
      <td>
        <button class="secondary" data-edit="${c.id}">Edit</button>
        <button class="danger" data-delete="${c.id}">Delete</button>
      </td>
    </tr>
  `;
}

function openForm(chunk) {
  editingId = chunk?.id ?? null;
  formLaag.value = chunk?.laag || 'Infrastructure';
  formActiviteit.value = chunk?.activiteit || '';
  formNiveau.value = chunk?.niveau || 1;
  formContent.value = chunk?.content || '';
  chunkForm.classList.add('active');
  chunkForm.scrollIntoView({ behavior: 'smooth' });
}

function closeForm() {
  editingId = null;
  chunkForm.classList.remove('active');
}

async function saveChunk() {
  const body = {
    laag: formLaag.value.trim(),
    activiteit: formActiviteit.value.trim(),
    niveau: Number(formNiveau.value),
    content: formContent.value.trim(),
  };
  if (!body.laag || !body.activiteit || !body.content) {
    alert('Vul laag, activiteit en content in.');
    return;
  }
  try {
    const url = editingId ? `/api/db/hbo-chunks/${editingId}` : '/api/db/hbo-chunks';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    closeForm();
    await loadVector();
  } catch (err) {
    alert('Opslaan mislukt: ' + err.message);
  }
}

async function deleteChunk(id) {
  if (!confirm(`Chunk ${id} verwijderen?`)) return;
  try {
    const res = await fetch(`/api/db/hbo-chunks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadVector();
  } catch (err) {
    alert('Verwijderen mislukt: ' + err.message);
  }
}

// ---------- Info tab ----------
const infoContent = document.getElementById('info-content');

async function loadInfo() {
  infoContent.textContent = 'Laden...';
  try {
    const res = await fetch('/api/info');
    const data = await res.json();
    infoContent.innerHTML = renderInfo(data);
  } catch (err) {
    infoContent.textContent = 'Fout: ' + err.message;
  }
}

function renderInfo(data) {
  const stats = `
    <div class="stats">
      <div class="stat"><div class="num">${data.counts.students}</div><div class="lbl">studenten</div></div>
      <div class="stat"><div class="num">${data.counts.voortgang_rows}</div><div class="lbl">voortgang rijen</div></div>
      <div class="stat"><div class="num">${data.counts.activiteit_rows}</div><div class="lbl">activiteiten</div></div>
      <div class="stat"><div class="num">${data.counts.hbo_chunks}</div><div class="lbl">HBO-i chunks</div></div>
    </div>
  `;

  const archDiagram = `
    <pre class="arch-diagram">browser (chat UI)
   |  HTTP / SSE
   v
NestJS backend (poort 3000)
 |  - POST /api/chat          synchrone tool-use loop
 |  - POST /api/chat/stream   live progress via SSE
 |  - GET  /api/db/*          DB viewer endpoints
 |  - GET  /api/info          deze pagina
 |
 +--> Anthropic Claude Sonnet 4.5    (chat + tool-use beslissingen)
 |
 +--> Ollama nomic-embed-text        (lokale embedding van vragen + seed)
 |       host.docker.internal:11434
 |
 +--> PostgreSQL 16 + pgvector
         |  relationele tabellen: student, voortgang, activiteit
         +- vector tabel:         hbo_chunk (768-dim embeddings)</pre>
  `;

  const patterns = data.patterns.map((p, i) => {
    const cls = ['rag', 'fc', 'hyb'][i] || '';
    return `
      <div class="pattern-card ${cls}">
        <h4>${escapeHtml(p.naam)}</h4>
        <p>${escapeHtml(p.uitleg)}</p>
        <div class="meta"><strong>Tool:</strong> <code>${escapeHtml(p.tool)}</code><br><strong>Datasource:</strong> ${escapeHtml(p.datasource)}</div>
      </div>
    `;
  }).join('');

  const stack = `
    <dl class="kv">
      <dt>Backend</dt><dd>${escapeHtml(data.stack.backend)}</dd>
      <dt>Database</dt><dd>${escapeHtml(data.stack.database)}</dd>
      <dt>Relationele tabellen</dt><dd>${data.stack.relational_tables.map(t => `<code>${escapeHtml(t)}</code>`).join(', ')}</dd>
      <dt>Vector tabel</dt><dd><code>${escapeHtml(data.stack.vector_table)}</code></dd>
      <dt>Chat model</dt><dd>${escapeHtml(data.stack.chat_model)}</dd>
      <dt>Embedding model</dt><dd>${escapeHtml(data.stack.embedding_model)}</dd>
      <dt>Frontend</dt><dd>${escapeHtml(data.stack.frontend)}</dd>
    </dl>
  `;

  const tools = data.tools.map(renderTool).join('');

  return `
    <div class="info-card">
      <h3>Live status</h3>
      ${stats}
      <p style="margin-top:0.6rem;font-size:0.78rem;color:#888;">Live counts uit Postgres. Verwacht 3 / 18 / 21 / 15 op een verse seed (3 studenten, 6 voortgang per student = 18, ongeveer 21 activiteiten, 15 HBO-i chunks).</p>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h3>Architectuur</h3>
        ${archDiagram}
      </div>
      <div class="info-card">
        <h3>Stack</h3>
        ${stack}
      </div>
    </div>

    <div class="info-card">
      <h3>De drie patronen</h3>
      <div class="info-grid" style="grid-template-columns: repeat(3, 1fr);">
        ${patterns}
      </div>
    </div>

    <div class="info-card">
      <h3>Tool-definities</h3>
      <p>Dit zijn de vier tools zoals Claude ze ziet via de Anthropic SDK. Hij kiest zelf wanneer hij welke aanroept.</p>
      ${tools}
    </div>

    <div class="info-card">
      <h3>System prompt</h3>
      <p>De instructie-tekst die voor elke vraag aan Claude wordt meegegeven. Bepaalt zijn gedrag: wanneer welke tool, hoe te combineren, in welke taal te antwoorden.</p>
      <details class="info-expand">
        <summary><strong>Klik om de volledige system prompt te zien</strong></summary>
        <pre>${escapeHtml(data.system_prompt)}</pre>
      </details>
    </div>

    <div class="info-card">
      <h3>Demo-trucs</h3>
      <ul>
        <li><strong>Bewijs dat de vector DB de bron is:</strong> verwijder een chunk in de Vector DB tab, stel Scenario A opnieuw, Claude vindt hem nu niet meer. Voeg terug, werkt weer.</li>
        <li><strong>Bewijs dat de relationele DB de bron is:</strong> zelfde data zou andere antwoorden geven voor <code>student_id=2</code> (Jana, UX-focus) versus <code>student_id=1</code> (Sam, Infra-focus).</li>
        <li><strong>Bewijs het hybride patroon:</strong> stel Scenario C, klap beide tool-calls uit, laat zien dat Claude RAG en function calling combineert in één antwoord.</li>
        <li><strong>Probeer een chunk live aan te passen:</strong> wijzig in de Vector DB tab de tekst van een chunk, save, vraag de chatbot ernaar, antwoord weerspiegelt jouw aanpassing (re-embed gebeurt automatisch).</li>
      </ul>
    </div>
  `;
}

function renderTool(t) {
  const props = t.input_schema?.properties || {};
  const required = new Set(t.input_schema?.required || []);
  const params = Object.entries(props).map(([name, def]) => {
    const isReq = required.has(name);
    return `<span class="${isReq ? 'req' : ''}">${escapeHtml(name)}: ${escapeHtml(def.type || 'any')}${isReq ? ' *' : ''}</span>`;
  }).join(', ');
  return `
    <div class="tool-list-item">
      <div class="name">${escapeHtml(t.name)}</div>
      <div class="desc">${escapeHtml(t.description)}</div>
      <div class="params">params: ${params || '(geen)'}${required.size ? ' &nbsp; <span class="req">* = verplicht</span>' : ''}</div>
    </div>
  `;
}

// ---------- util ----------
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
