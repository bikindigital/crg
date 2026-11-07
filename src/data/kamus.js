/**
 * Kamus CRG — basa Sunda sapopoe gaya Tangerang (Curug, Mauk).
 * s = kecap CRG, e = padanan di basa programming sejen, d = katerangan, c = conto nu bisa dijalankeun.
 * aktif: false = can dirojong ku interpreter (ditampilkeun jujur salaku "Rencana").
 * Unggal conto aktif dijalankeun ku tes otomatis (tests/interpreter.test.js).
 *
 * @typedef {{ s: string, e: string, d: string, c?: string, aktif?: boolean }} Kecap
 * @typedef {{ name: string, keywords: Kecap[] }} Kategori
 */

/** @type {Kategori[]} */
export const categories = [
  {
    name: 'Wadah & Data',
    keywords: [
      { s: 'wadah', e: 'let / var', d: 'Wadah keur nyimpen data. Eusina bisa dirobah.', aktif: true,
        c: 'wadah ngaran = "Asep"\nngomong("Ngaran: " + ngaran)' },
      { s: 'manten', e: 'const', d: 'Wadah nu eusina geus manten, teu bisa dirobah deui.', aktif: true,
        c: 'manten PI = 3.14\nngomong(PI * 2)' },
      { s: 'bae', e: 'null', d: 'Eweuh nanaon, antepkeun bae.', aktif: true,
        c: 'wadah dompet = bae\nmun dompet == bae {\n  ngomong("Dompet kosong, euy")\n}' },
      { s: 'acan', e: 'undefined', d: 'Acan aya eusian. Wadah tanpa nilai otomatis acan.', aktif: true,
        c: 'wadah rencana\nngomong(rencana)\nngomong(rencana == acan)' },
      { s: '[ ... ]', e: 'array', d: 'Daptar data, dibaris ku koma. Index mimiti ti 0.', aktif: true,
        c: 'wadah lembur = ["Curug", "Mauk", "Legok"]\nngomong(lembur[1])\nngomong(lembur.panjang)' },
      { s: '{ konci: nilai }', e: 'object', d: 'Objek: data nu boga ngaran (konci).', aktif: true,
        c: 'wadah jalma = { ngaran: "Ujang", umur: 20 }\nngomong(jalma.ngaran)\njalma.umur += 1\nngomong(jalma)' },
    ],
  },
  {
    name: 'Kaluaran & Input',
    keywords: [
      { s: 'ngomong / beja', e: 'print', d: 'Nyetak hasil ka layar. Bisa loba eusi, dipisah ku koma.', aktif: true,
        c: 'ngomong("Sampurasun!")\nbeja("Hasil:", 1 + 2)' },
      { s: 'tanya / nanya', e: 'input', d: 'Nanya ka nu make. Hasilna teks; pake angka() keur ngitung.', aktif: true,
        c: 'wadah ngaran = tanya("Saha ngaran maneh?")\nmun ngaran {\n  ngomong("Halo, " + ngaran)\n} munteu {\n  ngomong("Teu dijawab, euy")\n}' },
    ],
  },
  {
    name: 'Logika & Kondisi',
    keywords: [
      { s: 'mun', e: 'if', d: 'Lamun kondisina bener, jalankeun blokna.', aktif: true,
        c: 'wadah hujan = bener\nmun hujan {\n  ngomong("Mawa payung!")\n}' },
      { s: 'munteu', e: 'else', d: 'Mun henteu. Bisa dihijikeun: munteu mun (else if).', aktif: true,
        c: 'wadah nilai = 75\nmun nilai >= 80 {\n  ngomong("Alus pisan")\n} munteu mun nilai >= 60 {\n  ngomong("Lulus")\n} munteu {\n  ngomong("Diajar deui")\n}' },
      { s: 'bener / salah', e: 'true / false', d: 'Nilai bener jeung salah.', aktif: true,
        c: 'ngomong(5 > 3)\nngomong(2 == 3)' },
      { s: 'teu', e: '! (not)', d: 'Ngabalikkeun bener jadi salah, salah jadi bener.', aktif: true,
        c: 'wadah lapar = salah\nmun teu lapar {\n  ngomong("Engke bae dahar")\n}' },
      { s: 'jeung', e: '&& (and)', d: 'Duanana kudu bener.', aktif: true,
        c: 'wadah umur = 20\nwadah boga_sim = bener\nngomong(umur >= 17 jeung boga_sim)' },
      { s: 'atawa', e: '|| (or)', d: 'Salah sahijina cukup bener.', aktif: true,
        c: 'wadah poe = "Minggu"\nngomong(poe == "Saptu" atawa poe == "Minggu")' },
      { s: 'nyaho', e: 'Boolean()', d: 'Ngarobah nilai naon bae jadi bener/salah.', aktif: true,
        c: 'ngomong(nyaho "eusi")\nngomong(nyaho 0)\nngomong(nyaho bae)' },
      { s: 'sabab', e: 'switch', d: 'Milih jalan dumasar kana hiji nilai.', aktif: true,
        c: 'wadah poe = "Jumaah"\nsabab poe {\n  kasus "Saptu", "Minggu" { ngomong("Pere!") }\n  kasus "Jumaah" { ngomong("Jumatan heula") }\n  baku { ngomong("Gawe") }\n}' },
      { s: 'kasus', e: 'case', d: 'Hiji pilihan di jero sabab. Bisa loba nilai, dipisah koma.', aktif: true,
        c: 'sabab 2 {\n  kasus 1 { ngomong("hiji") }\n  kasus 2 { ngomong("dua") }\n}' },
      { s: 'baku', e: 'default', d: 'Pilihan baku mun teu aya kasus nu cocog.', aktif: true,
        c: 'sabab "liburan" {\n  kasus "sakola" { ngomong("Mangkat sakola") }\n  baku { ngomong("Ulin bae") }\n}' },
    ],
  },
  {
    name: 'Perulangan',
    keywords: [
      { s: 'keur', e: 'for / while', d: 'Ngulang salila kondisina bener. Bisa gaya for: keur wadah i = 0; i < 3; i += 1 { }', aktif: true,
        c: 'keur wadah i = 1; i <= 3; i += 1 {\n  ngomong("Puteran ka-" + i)\n}' },
      { s: 'deui', e: 'repeat', d: 'Ulang deui sababaraha kali.', aktif: true,
        c: 'deui 3 {\n  ngomong("Gas!")\n}' },
      { s: 'unggal … di', e: 'for … of', d: 'Ngaliwatan unggal eusi daptar, teks, atawa objek.', aktif: true,
        c: 'unggal lembur, i di ["Curug", "Mauk", "Legok"] {\n  ngomong(i + 1, lembur)\n}' },
      { s: 'enggeus', e: 'break', d: 'Enggeus, eureun tina loop.', aktif: true,
        c: 'keur wadah i = 1; i <= 10; i += 1 {\n  mun i == 4 { enggeus }\n  ngomong(i)\n}' },
      { s: 'tuluy', e: 'continue', d: 'Liwat puteran ieu, tuluy ka nu saterusna.', aktif: true,
        c: 'keur wadah i = 1; i <= 5; i += 1 {\n  mun i % 2 == 0 { tuluy }\n  ngomong(i)\n}' },
    ],
  },
  {
    name: 'Lakon (Fungsi)',
    keywords: [
      { s: 'lakon', e: 'function', d: 'Nyieun lakon (fungsi) nu bisa disauran deui.', aktif: true,
        c: 'lakon sapa(ngaran) {\n  ngomong("Sampurasun, " + ngaran)\n}\nsapa("Asep")\nsapa("Euis")' },
      { s: 'balik', e: 'return', d: 'Mulangkeun hasil tina lakon.', aktif: true,
        c: 'lakon tambah(a, b) {\n  balik a + b\n}\nngomong(tambah(2, 3))' },
      { s: 'geura', e: 'run now', d: 'Gaskeun geura! Ngajalankeun blok atawa lakon saharita.', aktif: true,
        c: 'lakon utama() {\n  ngomong("Program dimimitian")\n}\ngeura utama()\ngeura {\n  wadah samentara = "ngan di dieu"\n  ngomong(samentara)\n}' },
    ],
  },
  {
    name: 'Imah (Kelas)',
    keywords: [
      { s: 'imah', e: 'class', d: 'Cetakan objek. Lakon mimiti dijalankeun waktu nyieun eusi anyar.', aktif: true,
        c: 'imah Ucing {\n  lakon mimiti(ngaran) { ieu.ngaran = ngaran }\n  lakon sora() { ngomong(ieu.ngaran + ": meong!") }\n}\nwadah oyen = anyar Ucing("Oyen")\noyen.sora()' },
      { s: 'anyar', e: 'new', d: 'Nyieun eusi anyar tina hiji imah.', aktif: true,
        c: 'imah Titik {\n  lakon mimiti(x, y) { ieu.x = x\n ieu.y = y }\n}\nngomong(anyar Titik(3, 4))' },
      { s: 'ieu', e: 'this', d: 'Objek nu keur dipake di jero lakon imah.', aktif: true,
        c: 'imah Tabungan {\n  lakon mimiti() { ieu.saldo = 0 }\n  lakon nabung(n) { ieu.saldo += n }\n}\nwadah t = anyar Tabungan()\nt.nabung(5000)\nt.nabung(2000)\nngomong(t.saldo)' },
      { s: 'ti', e: 'extends', d: 'Imah anyar nu ngawaris ti imah sejen.', aktif: true,
        c: 'imah Sato {\n  lakon napas() { ngomong("Ngarenghap...") }\n}\nimah Hayam ti Sato {\n  lakon kongkorongok() { ngomong("Kongkorongok!") }\n}\nwadah h = anyar Hayam()\nh.napas()\nh.kongkorongok()' },
      { s: 'kolot', e: 'super', d: 'Nyauran lakon ti imah kolot.', aktif: true,
        c: 'imah Jalma {\n  lakon mimiti(ngaran) { ieu.ngaran = ngaran }\n}\nimah Murid ti Jalma {\n  lakon mimiti(ngaran, kelas) {\n    kolot.mimiti(ngaran)\n    ieu.kelas = kelas\n  }\n}\nngomong(anyar Murid("Dede", 7))' },
    ],
  },
  {
    name: 'Kasalahan',
    keywords: [
      { s: 'kagok', e: 'throw', d: 'Ngalungkeun kasalahan sorangan.', aktif: true,
        c: 'lakon bagi(a, b) {\n  mun b == 0 { kagok "Ulah dibagi enol, euy!" }\n  balik a / b\n}\nngomong(bagi(10, 2))\nngomong(bagi(1, 0))' },
      { s: 'cobaan', e: 'try', d: 'Cobaan heula, bisi aya kasalahan.', aktif: true,
        c: 'cobaan {\n  ngomong(wadah_nu_euweuh)\n} sanya (e) {\n  ngomong("Katewak: " + e)\n}' },
      { s: 'sanya', e: 'catch', d: 'Nanganan kasalahan tina cobaan.', aktif: true,
        c: 'cobaan {\n  kagok "Listrik pareum"\n} sanya (masalah) {\n  ngomong("Sabar heula: " + masalah)\n}' },
    ],
  },
  {
    name: 'Partikel',
    keywords: [
      { s: 'jasa', e: '!! / ×100', d: 'Panambah sumanget: teks meunang "Jasa!", angka dikali 100.', aktif: true,
        c: 'ngomong("Mantap") jasa\nngomong(5 jasa)' },
      { s: 'atuh', e: ';', d: 'Panutup kalimat, pamanis. Meunang dipake, meunang henteu.', aktif: true,
        c: 'ngomong("Hayu atuh") atuh' },
      { s: '#', e: 'comment', d: 'Koméntar: teu dijalankeun, ngan catetan.', aktif: true,
        c: '# ieu catetan, teu dijalankeun\nngomong("Nu ieu dijalankeun")' },
    ],
  },
  {
    name: 'Lakon Bawaan',
    keywords: [
      { s: 'panjang()', e: 'length', d: 'Panjang daptar, teks, atawa jumlah konci objek.', aktif: true,
        c: 'ngomong(panjang("Curug"))\nngomong(panjang([1, 2, 3]))' },
      { s: 'tambahkeun()', e: 'push', d: 'Nambahkeun eusi ka tukang daptar.', aktif: true,
        c: 'wadah belanja = ["beas"]\ntambahkeun(belanja, "endog", "kecap")\nngomong(belanja)' },
      { s: 'barudak()', e: 'Array.of', d: 'Nyieun daptar tina sababaraha eusi.', aktif: true,
        c: 'wadah b = barudak("Ujang", "Dede", "Euis")\nngomong(b)' },
      { s: 'konci()', e: 'Object.keys', d: 'Nyokot sakabeh konci tina objek.', aktif: true,
        c: 'ngomong(konci({ ngaran: "Asep", lembur: "Curug" }))' },
      { s: 'angka()', e: 'Number()', d: 'Ngarobah teks jadi angka. Mun lain angka, hasilna acan.', aktif: true,
        c: 'ngomong(angka("42") + 8)\nngomong(angka("lima"))' },
      { s: 'teks()', e: 'String()', d: 'Ngarobah nilai naon bae jadi teks.', aktif: true,
        c: 'ngomong(teks(bener) + "!")' },
      { s: 'acak()', e: 'random', d: 'Angka acak (acak(1, 6)) atawa eusi acak tina daptar.', aktif: true,
        c: 'wadah dadu = acak(1, 6)\nngomong(dadu >= 1 jeung dadu <= 6)' },
      { s: 'buleud()', e: 'round', d: 'Ngabuleudkeun angka. Argumen kadua = jumlah koma.', aktif: true,
        c: 'ngomong(buleud(3.567))\nngomong(buleud(3.567, 2))' },
    ],
  },
  {
    name: 'Rencana (Async & Jaringan)',
    keywords: [
      { s: 'isuk', e: 'async', d: 'Engke isuk pageto (Asynchronous).' },
      { s: 'janji', e: 'promise', d: 'Janji heula nya (Promise).' },
      { s: 'saka', e: 'await', d: 'Antosan sakeudeung (Await).' },
      { s: 'jauh', e: 'fetch', d: 'Ngala data ti jauh (Remote API).' },
    ],
  },
];

const all = categories.flatMap((c) => c.keywords);
export const totalAktif = all.filter((k) => k.aktif).length;
export const totalRencana = all.length - totalAktif;
