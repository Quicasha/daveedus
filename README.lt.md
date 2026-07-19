<p align="right"><a href="README.md">English</a> · <strong>Lietuviškai</strong></p>

<h1 align="center">Daveedus</h1>

<p align="center">Treniruočių dienoraštis naršyklėje. Jokios paskyros, jokių reklamų, jokio serverio — duomenys lieka tavo telefone.</p>

<p align="center"><a href="https://quicasha.github.io/daveedus/"><strong>Atsidaryti programėlę</strong></a></p>

---

## Įsidiegimas

- **iPhone** — atsidaryk nuorodą per Safari → **Share** → **Add to Home Screen**
- **Android** — atsidaryk per Chrome → **⋮** → **Įdiegti programą**

Užtrunka pusę minutės. Toliau veikia per visą ekraną ir visiškai be interneto.

## Ką turi

- **Programos** — susidėlioji splitą (pvz. Upper / Lower), prisisegi aktyvias, o pradžios ekranas rodo, kuri treniruotė eilėje
- **Greitas vedimas** — praeito karto skaičiai iškart šalia laukelių; pažymi setą — startuoja poilsio laikrodis. Žalia ar raudona iškart aišku, ar pamušei
- **Setų tipai** — apšilimas, iki failure, drop setai, supersetai
- **Alternatyvos** — kiekvienas pratimas gali turėti atsarginius variantus; užimtas stovas — persijungi vienu paspaudimu arba prisisegi alternatyvą kaip naują pagrindinį. Kiekvieno varianto istorija atskira, skaičiai niekada nesusimaišo
- **Poilsio taikinys** — jei nori, kiekvienam pratimui atskirai; laikui suėjus juosta sumirksi ir pyptelės
- **Kūno svorio pratimai** — prisitraukimai ir dipsai papildomą svorį veda atskirai, o rekordai skaičiuoja visą keliamą apkrovą
- **Progresas** — treniruočių ritmas iš pirmo žvilgsnio, savaitės statistika, raumenų balansas, pratimų grafikai (svoris / apimtis / ~1RM), rekordų srautas, sekami pratimai
- **Deload** — vienas lengvas ratas per programą, kai jauti, kad reikia; į rekordus neįskaitomas
- **Dalinimosi kodai** — programą draugui nusiunti kaip trumpą kodą; jis įsiklijuoja ir turi lygiai tavo rutiną
- **kg / lb, lietuvių / anglų, tamsi / šviesi**

## Tavo duomenys

Viskas saugoma pačiame telefone, iškart dviejose vietose — jei viena sugestų, programėlė atsistato iš kitos. Kasdien pasidaro ir atsarginė kopija, prie kurios gali grįžti (Nustatymai › Duomenų apsauga).

- **Atsarginis kodas** — retkarčiais nusikopijuok ir pasidėk saugiai; tai vienintelis dalykas, kuris išlieka pametus telefoną
- **Sinchronizacija su debesim** (nebūtina) — kiekviena baigta treniruotė automatiškai nukeliauja į tavo privatų GitHub repo. Tavo repo, tavo raktas; be jo iš telefono neišeina niekas
- **CSV eksportas** — tvarkingi duomenys po setą, tinka Excel ar bet kam kitam

Atnaujinimai įsidiegia patys, kai kitą kartą atsidarai programėlę.

---

## Iš vidaus

Grynas HTML, CSS ir JavaScript — jokių karkasų, jokio build žingsnio, jokių priklausomybių. Būsena gyvena `localStorage`, dubliuojasi į `IndexedDB` dėl saugumo; service worker duoda veikimą be interneto ir savaiminius atnaujinimus.

```
index.html              Programos karkasas
css/style.css           Stiliai, tamsi / šviesi temos
js/app.js               Visa logika — būsena, ekranai, laikmačiai, statistika, sinchronizacija, kodai
js/exercises.js         Įmontuota pratimų bazė
sw.js                   Service worker (offline cache + auto-atnaujinimas)
manifest.webmanifest    PWA manifestas
icons/                  Ikonos
serve.ps1               Lokalus dev serveris be priklausomybių (PowerShell)
```

Svoriai viduje laikomi kilogramais ir konvertuojami tik rodymui, tad vienetų perjungimas nieko nepraranda. Dalinimosi ir atsarginiai kodai — Base64 užkoduotas JSON su `DVD1.` priešdėliu. Sinchronizacija deda JSON kopiją į GitHub repo per Contents API — raktas niekada nepalieka įrenginio ir niekada nepatenka į atsarginius kodus.

**Paleisti lokaliai** — tinka bet koks statinis serveris: `powershell -File serve.ps1` ir atsidaryk `http://localhost:8317`.

**Deploy** — push į `main`; GitHub Actions sudeda į Pages. Su kiekvienu leidimu pakelk `APP_VER` (`js/app.js`) ir `CACHE` (`sw.js`), kad įsidiegę telefonai pasiimtų naujus failus.
