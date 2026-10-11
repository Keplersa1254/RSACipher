// Renderer process: handles all UI interactions and calls the preload API.

const $ = (id) => document.getElementById(id);
const api = window.rsaAPI;

// ---- Tab switching ----
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $('panel-' + tab.dataset.tab).classList.add('active');
  });
});

function setStatus(el, message, kind) {
  el.textContent = message;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

// ---- Copy buttons ----
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = $(btn.dataset.copy);
    if (!target.value) return;
    try {
      await navigator.clipboard.writeText(target.value);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = original), 1200);
    } catch (e) {
      /* clipboard may be unavailable; ignore */
    }
  });
});

// ---- Auto-Generate Mode ----
$('auto-clear').addEventListener('click', () => {
  $('auto-plain').value = '';
  $('auto-cipher').value = '';
  $('auto-key').value = '';
  setStatus($('auto-status'), '');
});

$('auto-encrypt').addEventListener('click', async () => {
  const plain = $('auto-plain').value;
  if (!plain) {
    setStatus($('auto-status'), 'Please enter some plain text first.', 'error');
    return;
  }
  setStatus($('auto-status'), 'Generating 2048-bit key pair and encrypting...');
  try {
    const { ciphertext, privateKey } = await api.autoEncrypt(plain);
    $('auto-cipher').value = ciphertext;
    $('auto-key').value = privateKey;
    setStatus($('auto-status'), 'Done. A new key pair was generated for this message.', 'success');
  } catch (err) {
    setStatus($('auto-status'), 'Encryption failed: ' + err.message, 'error');
  }
});

// ---- Custom Key Mode ----
const actionSelect = $('custom-action');
function syncCustomLabels() {
  const isEncrypt = actionSelect.value === 'encrypt';
  $('custom-key-label').textContent = isEncrypt ? 'Public Key (PEM)' : 'Private Key (PEM)';
  $('custom-data-label').textContent = isEncrypt ? 'Plain Text' : 'Ciphertext (Base64)';
  $('custom-key').placeholder = isEncrypt
    ? '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'
    : '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----';
  $('custom-data').placeholder = isEncrypt ? 'Enter text to encrypt...' : 'Paste base64 ciphertext to decrypt...';
  $('custom-output-label').textContent = isEncrypt ? 'Ciphertext (Base64)' : 'Plain Text';
}
actionSelect.addEventListener('change', syncCustomLabels);
syncCustomLabels();

$('custom-clear').addEventListener('click', () => {
  $('custom-key').value = '';
  $('custom-data').value = '';
  $('custom-output').value = '';
  setStatus($('custom-status'), '');
});

$('custom-run').addEventListener('click', async () => {
  const key = $('custom-key').value.trim();
  const data = $('custom-data').value;
  if (!key) {
    setStatus($('custom-status'), 'Please provide a key.', 'error');
    return;
  }
  if (!data.trim()) {
    setStatus($('custom-status'), 'Please provide input data.', 'error');
    return;
  }

  const isEncrypt = actionSelect.value === 'encrypt';
  setStatus($('custom-status'), isEncrypt ? 'Encrypting...' : 'Decrypting...');
  try {
    let result;
    if (isEncrypt) {
      result = await api.encrypt(key, data);
      $('custom-output').value = result.ciphertext;
    } else {
      result = await api.decrypt(key, data.trim());
      $('custom-output').value = result.plaintext;
    }
    setStatus($('custom-status'), 'Done.', 'success');
  } catch (err) {
    setStatus($('custom-status'), 'Operation failed: ' + err.message, 'error');
  }
});
