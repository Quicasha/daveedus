<p align="center">
  <a href="https://quicasha.github.io/daveedus/"><img src="shots/hero.png" alt="Daveedus - log a set in one tap, the training brain does the rest" width="100%"></a>
</p>

<p align="center">
  <a href="https://quicasha.github.io/daveedus/"><b>Open the app</b></a>
  &nbsp;·&nbsp; <a href="#install">Install</a>
  &nbsp;·&nbsp; <a href="#what-it-does">Features</a>
  &nbsp;·&nbsp; <a href="docs/RESEARCH-TRAINING.md">The evidence</a>
  &nbsp;·&nbsp; <a href="#under-the-hood">Under the hood</a>
</p>

<p align="center">
  <a href="https://github.com/Quicasha/daveedus/actions/workflows/test.yml"><img alt="Tests" src="https://github.com/Quicasha/daveedus/actions/workflows/test.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Vanilla JS" src="https://img.shields.io/badge/vanilla_JS-no_dependencies-f7df1e.svg">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-offline--first-5a0fc8.svg">
  <img alt="Local-first" src="https://img.shields.io/badge/data-local--first-2ea44f.svg">
</p>

**Daveedus** is a workout tracker for people who lift. Logging has to be instant, because nobody types between heavy sets, and the decisions have to be right, because a bad suggestion costs a training week. So the set row takes one tap, and behind it sits a training brain: double progression, a wave for a stalled lift, deloads earned from performance, eased-in comebacks after a break, and trend lines that refuse to read noise as progress. Every threshold it uses is traced to a study, a coaching consensus or a stated inference in [the evidence document](docs/RESEARCH-TRAINING.md).

It runs entirely in the browser, installs to the home screen, works offline and keeps every number on the device. No account, no ads, no server.

<table>
  <tr>
    <td align="center" width="33%"><img src="shots/home.png" width="250" alt="Home screen"><br><b>Home</b><br><sub>Today's workout, the week's plan and the deload gauge</sub></td>
    <td align="center" width="33%"><img src="shots/workout.png" width="250" alt="A workout in progress"><br><b>Workout</b><br><sub>Last session as the placeholder, one tap per set, the rest clock in the bar</sub></td>
    <td align="center" width="33%"><img src="shots/history.png" width="250" alt="History and tracked lifts"><br><b>History</b><br><sub>Rhythm, tracked lifts, goals with a date only when the trend earns one</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="shots/exercise.png" width="250" alt="Exercise detail"><br><b>Every lift</b><br><sub>Records, rep records and the estimated 1RM against your goal</sub></td>
    <td align="center"><img src="shots/workout-progress.png" width="250" alt="Progress of one workout"><br><b>Every workout</b><br><sub>Volume per session and each lift measured inside that workout alone</sub></td>
    <td align="center"><img src="shots/weekly-sets.png" width="250" alt="Weekly sets per muscle"><br><b>Every muscle</b><br><sub>Weekly sets against the 10-20 set research band</sub></td>
  </tr>
</table>

<p align="center"><img src="shots/skins.png" alt="Seven skins, each with a dark and a light palette" width="100%"></p>

## Install

- **iPhone** - open [the app](https://quicasha.github.io/daveedus/) in Safari → **Share** → **Add to Home Screen**
- **Android** - open it in Chrome → **⋮** → **Install app**

Half a minute. After that it runs full-screen, works fully offline and updates itself the next time it opens.

## What it does

### Logging that stays out of the way

- **One tap per set.** Last session's numbers are the placeholders; confirm and the rest clock starts with the target for that exercise.
- **Honest colours.** A set is green or red for the session so far, never one set against one set: a heavier first set followed by a shorter second one stays green, because you are ahead.
- **Warm-ups in one tap**, loaded the way a lifter loads a bar and tapered the way the evidence says: empty bar, big plates only, the last one short and at or under 90%. On the way to 140 kg that reads 20 / 60 / 80 / 100 / 120.
- **The gym details covered:** drop sets, supersets, a plate calculator, machine base weight, bodyweight lifts with your body weight counted, dumbbell pairs, kg or lb.
- **Alternatives per exercise.** Bench taken? Swap in one tap; each variant keeps its own history.
- **Max tests when you feel like one.** Warm up to the opener, take three attempts suggested from what the lift shows now, log each one made or missed. A made single is a record, even on a deload day, and a test never bends your training trend.

### Progress, measured honestly

- **Estimated 1RM trends** with a dead band wider than day-to-day noise, so a good Tuesday is not called a breakthrough.
- **Tracked lifts with goals.** A projected date appears only when the trend actually climbs and the data spans enough time to mean it.
- **Stall watch and the 4-week wave.** When a tracked lift stops setting bests, the app offers a 4-week wave: fives at a base, fours and threes a step heavier each, sixes back at the base, then the next round one step up. It ends itself on a new best or after three rounds without one.
- **Deloads, earned or planned.** A passive advisor speaks when performance and accumulated weeks say so, or a calendar reminder does it every 6, 7 or 8 weeks. A deload is one light pass over every workout of the main program, kept out of records and trends.
- **Comebacks eased in.** After a break the suggested weights come back a notch lower and climb back session by session, following the detraining research.
- **A new program is a new block.** Trends, stalls and the deload check compare a lift only inside the program you run now, so a new program's first quiet week is not read as a verdict on the last one.
- **Progress per workout and per muscle.** Each workout's own volume trend and lifts, so a bench climbing in Upper A cannot hide one stalling in Upper B, and weekly sets per muscle against the 10-20 set band.

### Programs

- **Rotation programs** suggest what is NEXT, a weekday plan marks TODAY, and a star marks the main program that the plan and the deload follow.
- **Free-pick splits** (gym / bar / home) skip rotation and deload and show how often and how long ago instead.
- **Level ladders** for bodyweight work, from knee raises to toes-to-bar: two clean sessions at the top of the range and the next level loads itself.
- **Programs side by side.** Compare blocks on length, cadence, volume and every shared lift's change per week, so a 6-week block and a 20-week one answer the same question.
- **Archive and order.** Finished programs move to an archive with every record kept; the rest go in the order Home should show them.
- **Share a program** as a short code.

## Your data

Everything is stored on the device, in two places at once. If one breaks, the app restores from the other.

- **Backup code** - copy it now and then and keep it somewhere safe; it survives a lost phone.
- **Cloud sync** (optional) - every finished workout goes to your own private GitHub repository. Your repository, your token; without it nothing ever leaves the device. On a new phone, connect and tap **Restore from cloud**. A device that has never synced never replaces an existing backup without asking, a restore shows what it will bring before it does, and the repository only gets a commit when the data actually changed.
- **CSV export** - tidy per-set data for Excel or anything else.

## Evidence, not opinions

The training brain does not guess. Each rule names where its numbers come from and how strong that evidence is, from strong (meta-analyses, a Delphi consensus of coaches) down to folk practice and plain inference, and says where the evidence stops:

- [**docs/RESEARCH-TRAINING.md**](docs/RESEARCH-TRAINING.md) - volume, effort, frequency, rest, load and rep ranges, estimated 1RM and its noise floor, trends, waves, deloads, layoffs, warm-ups, ladders, and what deliberately was not built.
- [**docs/RESEARCH-APP.md**](docs/RESEARCH-APP.md) - why people stop logging, what feedback does to motivation, what a set row must get right, and why there are no streaks, points or per-set effort ratings.

## Under the hood

| | |
|---|---|
| **Stack** | Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies |
| **Storage** | `localStorage` mirrored to `IndexedDB`; writes debounced and flushed when the app is backgrounded; on launch the newer copy wins and the other is parked, never destroyed |
| **Offline** | A service worker caches each release and swaps in the next one by itself |
| **Units** | Stored in kilograms, converted only for display, so switching units loses nothing |
| **Sync** | Optional, to the user's own GitHub repository through the Contents API; identical snapshots are never pushed twice; the token stays on the device and out of every backup code |
| **Tests** | A `node:test` suite that loads the real app scripts into a sandbox and checks the training brain, the data layer and sync. CI runs it on every push; new rules are checked by breaking them on purpose and watching the tests fail |

The code is split into small per-domain scripts loaded in dependency order. Everything is global by design, because inline handlers resolve against global scope.

<details>
<summary><b>Project structure</b></summary>

```
index.html              App shell and script load order
css/style.css           Styles: seven skins, each with a dark and a light palette
js/exercises.js         Built-in exercise database (ids are permanent)
js/i18n.js              App version and every user-facing string
js/util.js              Formatting, the volume and 1RM formulas, toasts, skins and theme
js/state.js             The state object: schema, validation and repair, persistence, units
js/ui.js                Render core: navigation, top bar, tab bar, sheets, icons
js/home.js              Home: week plan, reminders, program cards
js/deload.js            Deload cycle, options sheet, the passive deload advisor
js/workout.js           The live session: logging, ghosts, warm-ups, waves, comebacks, finish
js/program.js           Programs, archive, order and the workout editor
js/exercises-ui.js      Exercise picker, browser, custom exercises, detail view, charts
js/stats.js             1RM series and trends, tracked lifts, records, rhythm, comparisons
js/history.js           History list, search, editing, body weight, plate calculator
js/settings.js          Settings
js/data.js              Share and backup codes, import, CSV, GitHub cloud sync
js/boot.js              Startup, rest signal, wake lock, onboarding
test/                   node:test suite and the sandbox harness (no DOM, no dependencies)
docs/                   The evidence behind every rule
sw.js                   Service worker: offline cache and self-update
manifest.webmanifest    PWA manifest
serve.ps1               Zero-dependency local server (PowerShell)
```

</details>

**Run locally** - any static file server works; on Windows `powershell -File serve.ps1`, then open `http://localhost:8317`.

**Test** - `npm test` (Node 20 or newer, nothing to install).

**Release** - bump `APP_VER` in `js/i18n.js` and `CACHE` in `sw.js`, push to `main`, and GitHub Actions runs the tests and publishes to Pages. Installed phones pick up the new files on their next launch.

## License

[MIT](LICENSE) © 2026 Dovydas Jonikas. Use it, fork it, ship it. Attribution is appreciated, and an issue with feedback even more so.

<p align="center"><sub>Built by <b>Dovydas Jonikas</b>, who logs every session with it.</sub></p>
