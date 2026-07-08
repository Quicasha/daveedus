<p align="right"><strong>🇬🇧 English</strong> · <a href="README.lt.md">🇱🇹 Lietuviškai</a></p>

<h1 align="center">Daveedus</h1>

<p align="center"><em>A fast, private workout tracker that lives on your phone.</em></p>

<p align="center"><a href="https://quicasha.github.io/daveedus/"><strong>▶ Open the app</strong></a></p>

---

Daveedus is a simple, good-looking gym log. You build your training program, tap in your weights and reps between sets, and it quietly keeps track of everything — what you lifted last time, whether you beat it, and how you're progressing over the weeks and months.

It works **completely offline** and keeps **all of your data on your own phone**. Nothing is uploaded, there is no account to create, and there are no ads. It's built for one person: you.

## Getting it on your phone

Daveedus installs straight from your browser — there's no App Store or Play Store download. It takes about thirty seconds.

**iPhone / iPad (Safari)**
1. Open **https://quicasha.github.io/daveedus/** in Safari.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open it from the new Daveedus icon on your home screen.

**Android (Chrome)**
1. Open **https://quicasha.github.io/daveedus/** in Chrome.
2. Tap the **⋮** menu in the top-right corner.
3. Tap **Install app** (or **Add to Home screen**).
4. Open it from the Daveedus icon in your app drawer.

Once installed, it opens full-screen like a normal app and works without any internet connection — perfect for a basement gym with no signal.

## What it does

**Programs and workouts.** Create a program (your split, e.g. *Upper / Lower*) and fill it with individual workouts (*Upper A*, *Lower A*, and so on). Pin the ones you're currently running and the home screen highlights which workout is up **next**.

**Logging that's fast.** Pick a workout and go. Each exercise shows what you did **last time** right next to the entry boxes, so you always know what to beat. Tap a set as done and a rest timer starts counting automatically. A green or red marker tells you at a glance whether you beat your previous session.

**Every kind of set.** Tap a set's number to mark it as a **warm-up (W)** or a set taken **to failure (F)**. Add **drop sets** with one tap, and link exercises together as **supersets**.

**Bodyweight moves done right.** For pull-ups, dips and the like, your body weight fills in automatically and stays separate from the extra plates you add — so a set with no added weight just reads "× 8", while your records still count the full load you moved.

**Progress you can see.** A stats dashboard shows your training calendar, workouts per week, and how many sets each muscle group is getting. Every exercise has its own chart you can switch between **weight**, **volume** and **estimated 1‑rep‑max**, plus your all-time records.

**Extras that help.** A built-in plate calculator tells you which plates to load, a quick +/− button nudges the weight while you type, you can track your body weight over time, and finishing a workout shows a clean summary — with confetti when you hit a personal record. 🎉

**Your language, your units.** English and Lithuanian, kilograms or pounds, and a dark, light or automatic theme — all in Settings.

## Sharing with a friend

Every program and workout can be turned into a short **share code**. Send it to a friend in a message; they paste it into their copy of Daveedus and instantly have your exact routine. It works the same whether they're on an iPhone or an Android.

## Keeping your data safe

Because everything lives on your phone, Daveedus works hard to protect it:

- Your data is saved in two separate places on the device, so if one is cleared the app quietly restores from the other.
- A fresh backup snapshot is kept automatically each day; you can roll back to a recent one from **Settings › Data protection**.
- The app asks your browser to mark its storage as permanent so the system won't wipe it to free up space.

For real peace of mind, every so often use **Settings › Copy backup code** and paste that code somewhere safe (your Notes or a message to yourself). It's the one thing that survives losing or replacing the phone. The app will remind you now and then.

## Updates

You don't have to do anything. When a new version is released, the app notices the next time you open it, refreshes itself, and shows a short "updated" message. The version number is at the bottom of the Settings screen.

---

## Under the hood

For the curious or anyone who wants to tinker.

Daveedus is a small, dependency-free **Progressive Web App** — plain HTML, CSS and vanilla JavaScript, no build step and no frameworks. Everything runs in the browser and all data is kept in the device's `localStorage`, mirrored to `IndexedDB` as a safety net.

```
index.html              App shell and markup
css/style.css           Styling, plus dark / light themes
js/app.js               All app logic — state, screens, timers, stats, share codes
js/exercises.js         The built-in exercise database
sw.js                   Service worker (offline caching + auto-update)
manifest.webmanifest    PWA metadata for "install to home screen"
icons/                  App icons in every required size
serve.ps1               Tiny zero-dependency local dev server (PowerShell)
```

Weights are stored canonically in kilograms and converted for display, so switching between kg and lb is lossless. Share and backup codes are just Base64‑encoded JSON with a short `DVD1.` prefix.

**Run it locally:** serve the folder over HTTP (for example `powershell -File serve.ps1`, then open `http://localhost:8317`). Any static file server works.

**Hosting:** the app is deployed as static files to GitHub Pages via a GitHub Actions workflow. To release an update, commit and push, then bump the version in `js/app.js` (`APP_VER`) and the cache name in `sw.js` so installed devices pick up the new files.
