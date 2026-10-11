const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe bridge from the renderer UI to the crypto IPC handlers.
contextBridge.exposeInMainWorld('rsa', {
  auto: (text) => ipcRenderer.invoke('rsa:auto', text),
  encrypt: (pubPem, text) => ipcRenderer.invoke('rsa:encrypt', pubPem, text),
  decrypt: (privPem, ct) => ipcRenderer.invoke('rsa:decrypt', privPem, ct)
});

