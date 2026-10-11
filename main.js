const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');

const PAD = { padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' };

function createWindow() {
  const win = new BrowserWindow({
    width: 620,
    height: 680,
    minWidth: 480,
    minHeight: 540,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  // Absolute path so it works both in dev and in the packaged .exe.
  win.loadFile(path.join(__dirname, 'index.html'));
}

// ---- RSA operations using Node's built-in crypto module ----
// Each handler translates cryptic crypto errors into clear, human messages.

function friendlyError(err) {
  let m = String(err && err.message ? err.message : err);
  // Electron wraps thrown handler errors; keep only the useful tail.
  const idx = m.lastIndexOf('Error: ');
  if (idx !== -1) m = m.slice(idx + 7);
  if (/too.?large|too long|key.?size|maxsize|DATA_TOO_LARGE/i.test(m)) {
    return 'Message is too long. RSA can only encrypt about 190 characters at a time.';
  }
  if (/BEGIN|PEM|asn1|bad decrypt|wrong|decoder|unable to load|invalid|expected/i.test(m)) {
    return 'That key or ciphertext looks invalid. Make sure you pasted the full text including the BEGIN/END lines.';
  }
  return m;
}

// Auto: generate a fresh 2048-bit key pair and encrypt the text with it.
ipcMain.handle('rsa:auto', async (e, plainText) => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const ciphertext = crypto.publicEncrypt(
      { key: publicKey, ...PAD },
      Buffer.from(plainText, 'utf8')
    ).toString('base64');
    return { ciphertext, privateKey };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
});

// Encrypt with a user-supplied public key.
ipcMain.handle('rsa:encrypt', async (e, publicKeyPem, plainText) => {
  try {
    return {
      ciphertext: crypto.publicEncrypt({ key: publicKeyPem, ...PAD }, Buffer.from(plainText, 'utf8')).toString('base64')
    };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
});

// Decrypt with a user-supplied private key.
ipcMain.handle('rsa:decrypt', async (e, privateKeyPem, ciphertextB64) => {
  try {
    return {
      plaintext: crypto.privateDecrypt({ key: privateKeyPem, ...PAD }, Buffer.from(ciphertextB64, 'base64')).toString('utf8')
    };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

