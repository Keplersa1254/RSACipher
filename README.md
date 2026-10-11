# RSA Cipher

A small Windows app to encrypt/decrypt text with RSA. Clean, minimal UI with
**dark and light themes**. Built with Electron + Node's built-in `crypto`.

**Ready to use:** download `RSA-Cipher.exe` from the
[Releases](https://github.com/Keplersa1254/RSACipher/releases) page — it is a
**portable single file**. No install needed. Just double-click to run.

---

## How to use the app

**Theme:** click the 🌙 / ☀️ button (top-right) to switch between dark and light.

**Auto-Generate tab (easiest)**
1. Type your message.
2. Click **Encrypt**.
3. Copy the **Ciphertext** and the **Private key**. Keep the private key safe —
   you need it to decrypt.

**Custom Key tab**
- **Encrypt:** set mode to Encrypt, paste a *Public key*, type your text, click Run.
- **Decrypt:** set mode to Decrypt, paste your *Private key*, paste the
  ciphertext, click Run.

Every output box has a **Copy** button.

> Note: keys use RSA-2048 with OAEP/SHA-256. Max ~190 characters of text per
> encryption. Decryption only works with the matching private key.

---

## Run from source (developers)

You need [Node.js](https://nodejs.org/) installed.

```bat
npm install
npm start
```

## Build the .exe yourself

```bat
npm install
npm run dist
```

The file appears at `dist/RSA-Cipher.exe`.

> On Linux, Wine may freeze on an optional metadata step. This project sets
> `signAndEditExecutable: false` to skip it. If you rebuild on a normal Windows
> machine you can remove that flag.

## Files

| File | What it does |
|------|--------------|
| `main.js` | Creates the window + all RSA crypto operations |
| `preload.js` | Safe bridge between the UI and crypto |
| `index.html` | The interface, styling, and theme |
| `renderer.js` | Buttons, tabs, copy, theme toggle, logic |
| `package.json` | Settings and build config |
| `dist/RSA-Cipher.exe` | The built Windows app |


