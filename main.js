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

// Auto: generate a fresh 2048-bit key pair and encrypt the text with it.
ipcMain.handle('rsa:auto', (e, plainText) => {
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
});

// Encrypt with a user-supplied public key.
ipcMain.handle('rsa:encrypt', (e, publicKeyPem, plainText) => ({
  ciphertext: crypto.publicEncrypt({ key: publicKeyPem, ...PAD }, Buffer.from(plainText, 'utf8')).toString('base64')
}));

// Decrypt with a user-supplied private key.
ipcMain.handle('rsa:decrypt', (e, privateKeyPem, ciphertextB64) => ({
  plaintext: crypto.privateDecrypt({ key: privateKeyPem, ...PAD }, Buffer.from(ciphertextB64, 'base64')).toString('utf8')
}));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

