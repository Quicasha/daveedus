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
- **Weekly schedule** - assign workouts to fixed weekdays; the home screen marks TODAY and counts your week. A missed day is simply skipped, nothing shifts
- **Fast logging** - last session's numbers sit right next to the inputs; check a set off and the rest clock starts. Green or red tells you if you beat last time
- **Progression hints** - opt-in per exercise: when every working set hits the top of the rep range, next session offers the weight bump (+1.25 / +2.5 / +5) with one tap
- **Goals** - set a target e1RM on a tracked lift: progress bar, an honest "at this pace ~May 2027" projection and a dashed goal line on the chart
- **Stall watch + wave mode** - a tracked lift that stops setting e1RM bests gets a nudge; one tap starts a 4-week 5/4/3/6 wave with an auto-suggested starting weight (~86% of your recent best e1RM). The wave ends itself: new best = job done, three dry rounds = time to deload
- **Set types** - warm-ups, failure sets, drop sets (opt-in per exercise), supersets
- **Alternatives** - every exercise can have backups; rack taken? Swap with one tap, or pin the alternative as your new main. Each variant keeps its own history, so numbers never mix
- **Machine base weight** - enter what the machine weighs empty once; from then on you log only the plates you add, while records count the full load. Remembered per machine
- **Rest targets** - optional, per exercise; when time is up the bar flashes and beeps
- **Bodyweight exercises** - pull-ups and dips log added weight separately, while records count the full load you moved
- **Progress** - training rhythm at a glance, weekly stats, muscle balance, per-exercise charts (weight / volume / est. 1RM), rep-specific PRs, tracked lifts with goal targets
- **Deload** - one light pass over your program when you need it (pick the load, down to "same weight, half the sets"), kept out of your records; an optional calendar reminder nudges you every N weeks
- **Undo, not "Are you sure?"** - deletions apply instantly and offer a five-second Undo instead of a dialog
- **Share codes** - send a program to a friend as a short code; they paste it and have your exact routine
- **kg / lb, dark / light, seven styles** - from Ice Cold and Locked In to Golden Era and Princess Treatment, each with its own dark and light palette

## Your data

Everything is stored on the device, in two places at once - if one breaks, the app restores from the other.

- **Backup code** - copy it once in a while and keep it somewhere safe; it's the one thing that survives a lost phone
- **Cloud sync** (optional) - every finished workout is pushed to your own private GitHub repo automatically. Your repo, your token; without it nothing ever leaves the device. On a new phone, connect and tap **Restore from cloud** - everything comes back
- **CSV export** - tidy per-set data for Excel or anything else

Updates install themselves the next time you open the app.

---

## Under the hood

Plain HTML, CSS and vanilla JavaScript - no frameworks, no build step, no dependencies. State lives in `localStorage`, mirrored to `IndexedDB` as a safety net; a service worker makes it offline-first and self-updating.

The code is split into small per-domain scripts, loaded in dependency order (everything is global by design - inline handlers resolve against global scope):

```
index.html              App shell + script load order
css/style.css           Styles, dark / light themes
js/exercises.js         Built-in exercise database (ids are permanent)
js/i18n.js              App version + every user-facing string
js/util.js              Formatting, unit conversion, DB lookups, theme
js/state.js             The S state object: schema, validation, persistence
js/ui.js                Render core: navigation, topbar, tab bar, modal
js/home.js              Home screen (week plan, reminders, program cards)
js/deload.js            Deload cycle logic + options sheet
js/workout.js           The active session: logging, ghosts, rest, finish
js/program.js           Programs and the template editor
js/exercises-ui.js      Exercise picker, browser, custom form, detail view
js/stats.js             Records, e1RM, PR feed, tracked lifts, charts
js/history.js           History list, search, editing, body weight
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
