# CRG — Curug Language

Basa coding gaya santai khas Sunda Tangerang (Curug, Mauk). Tulis kode ku kecap sapopoe, jalankeun langsung di browser.

**Web:** https://crg.web.id · © BikinDigital — https://bikindigital.id

```crg
# Halo Barudak Curug!
wadah ngaran = "Asep"

lakon sapa(saha) {
  balik "Sampurasun, " + saha
}

ngomong(sapa(ngaran)) jasa
```

## Kecap konci

| CRG | Padanan | | CRG | Padanan |
| --- | --- | --- | --- | --- |
| `wadah` / `manten` | let / const | | `lakon` / `balik` | function / return |
| `bae` / `acan` | null / undefined | | `geura` | jalankeun saharita |
| `bener` / `salah` | true / false | | `imah` / `anyar` | class / new |
| `mun` / `munteu` | if / else | | `ieu` / `ti` / `kolot` | this / extends / super |
| `teu` / `jeung` / `atawa` | ! / && / \|\| | | `kagok` | throw |
| `sabab` / `kasus` / `baku` | switch / case / default | | `cobaan` / `sanya` | try / catch |
| `keur` | for / while | | `jasa` | teks + "Jasa!", angka × 100 |
| `deui` | repeat N | | `atuh` / `;` | panutup kalimat |
| `unggal … di` | for … of | | `#` | koméntar |
| `enggeus` / `tuluy` | break / continue | | `nyaho` | Boolean() |

Lakon bawaan: `ngomong`/`beja`, `tanya`/`nanya`, `panjang`, `tambahkeun`, `barudak`, `konci`, `angka`, `teks`, `acak`, `buleud`.

Kamus lengkap jeung conto nu bisa dicoba aya di halaman web (bagian Kamus). Rencana: `isuk`, `janji`, `saka` (async) jeung `jauh` (fetch).

## Struktur

```text
src/lib/interpreter.js   Lexer → Parser (Pratt, AST) → Evaluator. Hiji-hijina salinan interpreter.
src/data/kamus.js        Data Kamus + conto unggal kecap konci
src/data/templates.js    Conto kode di dropdown Playground
src/components/          Navbar, Playground, Kamus, Icon, LogoMark
tests/                   Tes interpreter (node:test)
```

Interpreter boga pangaman: loop kabablasan dieureunkeun sanggeus 2 juta langkah, rekursi sanggeus 400 tingkat, jeung unggal kasalahan nyebutkeun nomer baris.

## Ngajalankeun

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # tes interpreter + unggal conto Kamus & Playground
npm run build
```

## Make interpreter di JavaScript

```js
import { Interpreter } from './src/lib/interpreter.js';

const crg = new Interpreter((teks) => console.log(teks), {
  input: (pananya) => '17', // keur tanya()
});
const hasil = crg.execute('ngomong("Halo") jasa'); // → "Halo Jasa!"
// hasil = { ok: true, steps: 2 }
```
