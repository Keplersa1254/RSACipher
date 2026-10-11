# RSA Cipher

A small Windows app to encrypt/decrypt text with RSA. Pure black, clean UI.
Built with Electron + Node's built-in `crypto`.

**Ready to use:** the built app is at `dist/RSA-Cipher.exe`. Just double-click it
— no install needed (portable, single file).

---

## How to use the app

**Auto-Generate tab (easiest)**
1. Type your message.
2. Click **Encrypt & Generate Key**.
3. Copy the **Ciphertext** and the **Private Key**. Keep the private key safe —
   you need it to decrypt.

**Custom Key tab**
- **Encrypt:** paste a *Public Key*, type your text, click Run.
- **Decrypt:** switch the action to Decrypt, paste your *Private Key*, paste the
  ciphertext, click Run.

Both tabs have a **Copy** button on every output box.

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
| `index.html` | The interface and styling |
| `renderer.js` | Buttons, tabs, copy, logic |
| `package.json` | Settings and build config |
| `dist/RSA-Cipher.exe` | The built Windows app |

