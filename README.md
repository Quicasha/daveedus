# Daveedus 🏋️

Asmeninis treniruočių sekimo PWA — greitas setų loginimas salėje, splitai, progresas, viskas telefone be jokio backend'o.

**Live:** https://quicasha.github.io/daveedus/

## Funkcijos

- **Splitai ir programos** — susigrupuoji dienas (Upper A, Lower A...) į splitus, home ekrane matai kurią treniruotę daryt kitą (KITA ženkliukas)
- **Treniruotės režimas** — bendras trukmės laikmatis, „Anksčiau" stulpelis su praeitos sesijos svoriais, vieno paspaudimo setų žymėjimas, warmup setai (W), poilsio chronometras po kiekvieno seto
- **Progresija** — jei praeitą kartą pasiekei target reps, pasiūlo +2.5 kg
- **~90 pratimų bazė** — paieška, filtrai pagal raumenų grupes, savo pratimų kūrimas, svorio grafikai
- **Dalinimasis kodais** — programos, splito ar pilno backup'o kodas (`DVD1....`), nusiunti draugui, jis įsiveda ir turi
- **Dark / Light / Auto temos**, LT / EN kalbos
- **Offline-first** — service worker, veikia be interneto; duomenys localStorage

## Naudojimas telefone

1. Atsidaryk https://quicasha.github.io/daveedus/ per Safari
2. Share → **Add to Home Screen**
3. Atsidarai nuo home screen — veikia kaip appsas (fullscreen, offline)

## Struktūra

```
index.html          — shell
css/style.css       — stiliai + dark/light temos
js/app.js           — visa logika (i18n, state, ekranai, timeriai, kodai)
js/exercises.js     — pratimų bazė
sw.js               — offline cache
manifest.webmanifest, icons/ — PWA
serve.ps1           — lokalus dev serveris (PowerShell, be priklausomybių)
```

Lokalus testavimas: `powershell -File serve.ps1` → http://localhost:8317
