<h1 align="center">Daveedus</h1>

<p align="center">A workout tracker that lives in your browser. No account, no ads, no server - your data stays on your phone.</p>

<p align="center"><a href="https://quicasha.github.io/daveedus/"><strong>Open the app</strong></a></p>

---

## Install

- **iPhone** - open the link in Safari → **Share** → **Add to Home Screen**
- **Android** - open it in Chrome → **⋮** → **Install app**

Takes half a minute. After that it runs full-screen and works fully offline.

## What it does

- Logs sets fast - last session's numbers are the placeholders, one tap confirms, green or red shows how it went, the rest clock starts itself
- Programs with alternatives per exercise - bench taken, swap in one tap; each variant keeps its own history
- Progression runs quietly in the background - rep-range hints, a 4-week wave for stalled lifts, deloads, eased-in suggestions after a break
- Records and charts - estimated 1RM trends, rep records, tracked lifts with goals and projections
- The gym details covered: warm-ups, drop sets, supersets, rest timers, machine base weight, bodyweight exercises, kg / lb
- Share a program as a short code

## Your data

Everything is stored on the device, in two places at once - if one breaks, the app restores from the other.

- **Backup code** - copy it once in a while and keep it somewhere safe; it's the one thing that survives a lost phone
- **Cloud sync** (optional) - every finished workout is pushed to your own private GitHub repo automatically. Your repo, your token; without it nothing ever leaves the device. On a new phone, connect and tap **Restore from cloud** - everything comes back
- **CSV export** - tidy per-set data for Excel or anything else

Updates install themselves the next time you open the app.

---

## Under the hood

Plain HTML, CSS and vanilla JavaScript - no frameworks, no build step, no dependencies. State lives in `localStorage`, mirrored to `IndexedDB` as a safety net: writes are debounced and flushed when the app is backgrounded, on launch the newer of the two copies wins, and a copy that loses is parked rather than destroyed. A service worker makes the app offline-first and self-updating.

The code is split into small per-domain scripts, loaded in dependency order (everything is global by design - inline handlers resolve against global scope):

```
index.html              App shell + script load order
css/style.css           Styles: seven themes, each with dark and light palettes
js/exercises.js         Built-in exercise database (ids are permanent)
js/i18n.js              App version + every user-facing string
js/util.js              Formatting, volume formula, toast, skin registry + theme
js/state.js             The S state object: schema, validation, persistence, units
js/ui.js                Render core: navigation, topbar, tab bar, modal
js/home.js              Home screen (week plan, reminders, program cards)
js/deload.js            Deload cycle, options sheet, passive deload advisor
js/workout.js           The active session: logging, ghosts, wave, comeback easing, finish
js/program.js           Programs and the template editor
js/exercises-ui.js      Exercise picker, browser, custom form, detail view
js/stats.js             e1RM trends, tracked lifts, PR feed, rhythm views, charts
js/history.js           History list, search, editing, body weight, plate calculator
js/settings.js          Settings screen
js/data.js              Share/backup codes, import, CSV, GitHub cloud sync
js/boot.js              Startup, rest signal, wake lock, onboarding
sw.js                   Service worker (offline cache + auto-update)
manifest.webmanifest    PWA manifest
icons/                  App icons
serve.ps1               Zero-dependency local dev server (PowerShell)
```

Weights are stored in kilograms and converted only for display, so switching units is lossless. Share and backup codes are Base64-encoded JSON with a `DVD1.` prefix. Cloud sync PUTs a JSON snapshot to a GitHub repo through the Contents API - the token never leaves the device and is never included in backup codes.

**Run locally** - any static file server: `powershell -File serve.ps1`, then open `http://localhost:8317`.

**Deploy** - push to `main`; GitHub Actions publishes to Pages. Bump `APP_VER` in `js/i18n.js` and `CACHE` in `sw.js` on every release so installed devices pick up the new files.
