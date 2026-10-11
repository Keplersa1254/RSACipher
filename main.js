const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 760,
    minWidth: 640,
    minHeight: 600,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      // Preload script bridges the renderer to Node's crypto module securely.
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

// ---- RSA operations using Node's built-in crypto module ----

// IPC: generate a fresh 2048-bit RSA key pair and encrypt the given text with it.
ipcMain.handle('rsa:auto-encrypt', (event, plainText) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const ciphertext = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(plainText, 'utf8')
  ).toString('base64');

  return { ciphertext, privateKey };
});

// IPC: encrypt text using a user-supplied public key.
ipcMain.handle('rsa:encrypt', (event, publicKeyPem, plainText) => {
  const ciphertext = crypto.publicEncrypt(
    { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(plainText, 'utf8')
  ).toString('base64');

  return { ciphertext };
});

// IPC: decrypt base64 ciphertext using a user-supplied private key.
ipcMain.handle('rsa:decrypt', (event, privateKeyPem, ciphertextB64) => {
  const decrypted = crypto.privateDecrypt(
    { key: privateKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(ciphertextB64, 'base64')
  ).toString('utf8');

  return { plaintext: decrypted };
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
