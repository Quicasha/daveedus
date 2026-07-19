<h1 align="center">Daveedus</h1>

<p align="center">A workout tracker that lives in your browser. No account, no ads, no server - your data stays on your phone.</p>

<p align="center"><a href="https://quicasha.github.io/daveedus/"><strong>Open the app</strong></a></p>

---

## Install

- **iPhone** - open the link in Safari → **Share** → **Add to Home Screen**
- **Android** - open it in Chrome → **⋮** → **Install app**

Takes half a minute. After that it runs full-screen and works fully offline.

## What you get

- **Programs** - build your split (e.g. Upper / Lower), pin what you're running, the home screen shows which workout is next
- **Fast logging** - last session's numbers sit right next to the inputs; check a set off and the rest clock starts. Green or red tells you if you beat last time
- **Set types** - warm-ups, failure sets, drop sets, supersets
- **Alternatives** - every exercise can have backups; rack taken? Swap with one tap, or pin the alternative as your new main. Each variant keeps its own history, so numbers never mix
- **Rest targets** - optional, per exercise; when time is up the bar flashes and beeps
- **Bodyweight exercises** - pull-ups and dips log added weight separately, while records count the full load you moved
- **Progress** - training rhythm at a glance, weekly stats, muscle balance, per-exercise charts (weight / volume / est. 1RM), rep-specific PRs, tracked lifts
- **Deload** - one light pass over your program when you need it, kept out of your records
- **Share codes** - send a program to a friend as a short code; they paste it and have your exact routine
- **kg / lb, English / Lithuanian, dark / light**

## Your data

Everything is stored on the device, in two places at once - if one breaks, the app restores from the other. A daily snapshot is kept as well (Settings › Data protection).

- **Backup code** - copy it once in a while and keep it somewhere safe; it's the one thing that survives a lost phone
- **Cloud sync** (optional) - every finished workout is pushed to your own private GitHub repo automatically. Your repo, your token; without it nothing ever leaves the device
- **CSV export** - tidy per-set data for Excel or anything else

Updates install themselves the next time you open the app.

---

## Under the hood

Plain HTML, CSS and vanilla JavaScript - no frameworks, no build step, no dependencies. State lives in `localStorage`, mirrored to `IndexedDB` as a safety net; a service worker makes it offline-first and self-updating.

```
index.html              App shell
css/style.css           Styles, dark / light themes
js/app.js               All logic - state, screens, timers, stats, sync, share codes
js/exercises.js         Built-in exercise database
sw.js                   Service worker (offline cache + auto-update)
manifest.webmanifest    PWA manifest
icons/                  App icons
serve.ps1               Zero-dependency local dev server (PowerShell)
```

Weights are stored in kilograms and converted only for display, so switching units is lossless. Share and backup codes are Base64-encoded JSON with a `DVD1.` prefix. Cloud sync PUTs a JSON snapshot to a GitHub repo through the Contents API - the token never leaves the device and is never included in backup codes.

**Run locally** - any static file server: `powershell -File serve.ps1`, then open `http://localhost:8317`.

**Deploy** - push to `main`; GitHub Actions publishes to Pages. Bump `APP_VER` in `js/app.js` and `CACHE` in `sw.js` on every release so installed devices pick up the new files.
