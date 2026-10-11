const { contextBridge, ipcRenderer } = require('electron');

// Securely expose a minimal API from the main process to the renderer.
contextBridge.exposeInMainWorld('rsaAPI', {
  autoEncrypt: (plainText) => ipcRenderer.invoke('rsa:auto-encrypt', plainText),
  encrypt: (publicKeyPem, plainText) => ipcRenderer.invoke('rsa:encrypt', publicKeyPem, plainText),
  decrypt: (privateKeyPem, ciphertextB64) => ipcRenderer.invoke('rsa:decrypt', privateKeyPem, ciphertextB64)
});
