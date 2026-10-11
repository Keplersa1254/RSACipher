// Renderer: UI wiring + calls to the crypto API exposed by preload.js.
const $ = (id) => document.getElementById(id);
const api = window.rsa;

// Defensive: if the preload bridge failed, show a clear message.
if (!api) {
  alert('App failed to start: the crypto bridge is missing. Please reinstall.');
  throw new Error('window.rsa is not available');
}

function status(el, msg, kind) {
  el.textContent = msg || '';
  el.className = 'status' + (kind ? ' ' + kind : '');
}

// Strip Electron's "Error invoking remote method '...': Error: " wrapper so the
// user only sees the clear message produced in main.js.
function cleanErr(err) {
  let m = String(err && err.message ? err.message : err);
  const i = m.lastIndexOf('Error: ');
  if (i !== -1) m = m.slice(i + 7);
  return m;
}

// ---- Theme toggle (dark <-> light) ----
const html = document.documentElement;
function setTheme(light) {
  html.classList.toggle('light', light);
  $('theme').textContent = light ? '☀️' : '🌙';
  try { localStorage.setItem('rsa-theme', light ? 'light' : 'dark'); } catch (e) {}
}
let saved = 'dark';
try { saved = localStorage.getItem('rsa-theme') || 'dark'; } catch (e) {}
setTheme(saved === 'light');
$('theme').addEventListener('click', () => setTheme(!html.classList.contains('light')));

// ---- Tab switching ----
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ---- Copy buttons ----
document.querySelectorAll('.copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const el = $(btn.dataset.copy);
    if (!el.value) return;
    try {
      await navigator.clipboard.writeText(el.value);
      const old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = old), 1000);
    } catch (e) {
      el.select(); // fallback for environments without clipboard access
    }
  });
});

// ---- Auto-Generate tab ----
const aIn = $('a-in');
const aCount = $('a-count');
function updateCount() {
  aCount.textContent = String(aIn.value.length);
}
aIn.addEventListener('input', updateCount);
updateCount();

$('a-clear').addEventListener('click', () => {
  aIn.value = '';
  $('a-ct').value = '';
  $('a-key').value = '';
  updateCount();
  status($('a-status'), '');
});

$('a-go').addEventListener('click', async () => {
  const text = $('a-in').value;
  if (!text) return status($('a-status'), 'Enter some text first.', 'error');
  status($('a-status'), 'Generating key and encrypting...');
  try {
    const { ciphertext, privateKey } = await api.auto(text);
    $('a-ct').value = ciphertext;
    $('a-key').value = privateKey;
    status($('a-status'), 'Done. Save the private key to decrypt later.', 'ok');
  } catch (err) {
    status($('a-status'), cleanErr(err), 'error');
  }
});

// ---- Custom Key tab ----
const mode = $('c-mode');
function syncMode() {
  const enc = mode.value === 'encrypt';
  $('c-key-label').textContent = enc ? 'Public key (PEM)' : 'Private key (PEM)';
  $('c-in-label').textContent = enc ? 'Plain text' : 'Ciphertext (Base64)';
  $('c-key').placeholder = enc ? '-----BEGIN PUBLIC KEY----- ...' : '-----BEGIN PRIVATE KEY----- ...';
  $('c-in').placeholder = enc ? 'Text to encrypt...' : 'Paste base64 ciphertext...';
  $('c-out-label').textContent = enc ? 'Ciphertext (Base64)' : 'Plain text';
}
mode.addEventListener('change', syncMode);
syncMode();

$('c-clear').addEventListener('click', () => {
  $('c-key').value = '';
  $('c-in').value = '';
  $('c-out').value = '';
  status($('c-status'), '');
});

$('c-go').addEventListener('click', async () => {
  const key = $('c-key').value.trim();
  const data = $('c-in').value.trim();
  if (!key) return status($('c-status'), 'Paste a key first.', 'error');
  if (!data) return status($('c-status'), 'Enter the input data.', 'error');
  status($('c-status'), mode.value === 'encrypt' ? 'Encrypting...' : 'Decrypting...');
  try {
    const enc = mode.value === 'encrypt';
    const res = enc ? await api.encrypt(key, data) : await api.decrypt(key, data);
    $('c-out').value = enc ? res.ciphertext : res.plaintext;
    status($('c-status'), 'Done.', 'ok');
  } catch (err) {
    status($('c-status'), cleanErr(err), 'error');
  }
});
