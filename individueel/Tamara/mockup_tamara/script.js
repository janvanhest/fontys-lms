function showScreen(name, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.topnav button').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  btn.classList.add('active');
}

/* ── Week overzicht ──────────────────────────────────── */
function toggleAddForm() {
  const form = document.getElementById('add-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addTask() {
  const input = document.querySelector('#add-form input[type=text]');
  const compSelect = document.querySelector('#add-form select:first-of-type');
  const bySelect = document.querySelector('#add-form select:last-of-type');

  const name = input.value.trim();
  if (!name) return;

  const comp = compSelect.value === 'Competentie koppelen...' ? null : compSelect.value;
  const byDocent = bySelect.value.includes('Docent');

  const tagMap = {
    'Analyse':             'analyse',
    'Advice':              'advice',
    'Design':              'design',
    'Realisation':         'realisation',
    'Manage & Control':    'manage',
    'Personal Leadership': 'personal',
    'Professional Standard': 'professional',
  };

  const tagClass = comp ? (tagMap[comp] || 'communiceren') : '';
  const tagHtml = comp
    ? `<span class="tag ${tagClass}">${comp}</span>`
    : '';
  const byHtml = byDocent
    ? `<span class="by-badge by-docent">👨‍🏫 Docent</span>`
    : `<span class="by-badge by-student">🎓 Jijzelf</span>`;

  const row = document.createElement('div');
  row.className = 'activity-row';
  row.innerHTML = `
    <input type="checkbox" />
    <span class="act-name">${name}</span>
    ${tagHtml}
    ${byHtml}
  `;

  document.getElementById('activity-list').appendChild(row);

  // reset form
  input.value = '';
  compSelect.selectedIndex = 0;
  bySelect.selectedIndex = 0;
  toggleAddForm();
}

function nudgeDismiss(btn) {
  btn.closest('.nudge-card').style.display = 'none';
}

/* ── Chatbot ─────────────────────────────────────────── */
function sendChip(chip) {
  const text = chip.textContent;
  chip.closest('.suggestion-chips').remove();
  addUserBubble(text);
  setTimeout(() => addBotBubble('Goed punt! Dit is een demo — in het echte systeem geef ik hier een antwoord op. 😊'), 600);
}

function sendChipBot(chip, userText, botReply) {
  chip.closest('.suggestion-chips').remove();
  addUserBubble(userText);
  setTimeout(() => addBotBubble(botReply), 600);
}

function doKoppelen(chip) {
  chip.closest('.suggestion-chips').remove();
  addUserBubble('Ja, koppel en maak taak aan');
  setTimeout(() => addBotBubble('✅ <strong>Gekoppeld!</strong> Projectplan is verbonden aan <strong>Analyse</strong> en staat nu in je leerpad voor deze week.'), 600);
}

function doKoppelenNudge(chip) {
  chip.closest('.suggestion-chips').remove();
  addUserBubble('Ja, koppel projectplan');
  setTimeout(() => addBotBubble('✅ <strong>Gekoppeld!</strong> Je projectplan is nu verbonden aan <strong>Analyse</strong>. Zichtbaar in je leerpad. Nog 2 competenties open deze week: <em>Realiseren</em> en <em>Personal Leadership</em>. Wil je daar ook taken voor aanmaken?'), 600);
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserBubble(text);
  setTimeout(() => addBotBubble('Interessante vraag! Dit is een paper prototype — in de echte versie zoek ik dit op uit jouw Canvas-data en geef ik een persoonlijk antwoord. 🤖'), 700);
}

function addUserBubble(text) {
  const win = document.getElementById('chat-window');
  win.innerHTML += `
    <div class="bubble-wrap user">
      <div class="avatar user">T</div>
      <div class="bubble user">${text}</div>
    </div>`;
  win.scrollTop = win.scrollHeight;
}

function addBotBubble(text) {
  const win = document.getElementById('chat-window');
  win.innerHTML += `
    <div class="bubble-wrap">
      <div class="avatar bot">AI</div>
      <div class="bubble bot">${text}</div>
    </div>`;
  win.scrollTop = win.scrollHeight;
}
