# Call-to-Cash Academy (offline app)

A medical VA guide and simulator, from the first phone call to the final payment.
Everything is in this folder and works with **no internet** once it is installed.

## What is inside

| File | What it is |
|---|---|
| `index.html` | The whole app in one file (fonts included). |
| `manifest.webmanifest` | Name, icon and colours, so the browser can install it as an app. |
| `sw.js` | The offline cache (service worker). |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons. |

## Option A: put it on your phone with no hosting (simplest)

1. Send `index.html` to your phone (Google Drive, email to yourself, or a USB cable).
2. Open it with Chrome (Android). It runs fully offline.
3. Your progress is saved on that phone, in that browser.

Tip: keep the file in Downloads or Drive so you can open it again without internet.

## Option B: install it like a real app (needs free hosting once)

1. Host this folder on any HTTPS site. The free way is GitHub Pages:
   Repository **Settings → Pages → Build and deployment → Deploy from a branch**,
   pick the branch that has this `academy` folder and the `/ (root)` folder, then Save.
   The app will be at `https://<your-user>.github.io/<repo>/academy/`.
2. Open that address once while online, on your phone and on your computer.
3. Install it:
   - **Android (Chrome):** ⋮ menu → **Install app** (or **Add to Home screen**).
   - **iPhone (Safari):** Share → **Add to Home Screen**.
   - **Computer (Chrome or Edge):** the install icon in the address bar, or menu → **Install**.
4. After that it opens from its icon, offline.

## The Coach offline

The Coach answers from the Academy's own content: the step you are on, the best matching step,
and the glossary (with Tagalog and Bisaya). It does not use Claude here.
For Claude-powered answers, open the Academy artifact inside claude.ai.

## Updating

When `index.html` changes, edit `VERSION` in `sw.js` (for example `c2c-academy-v2`) so installed copies refresh.

## Notes

- All patients and the clinic in the examples are made up.
- Progress is stored in each device's browser. It does not sync between devices.
