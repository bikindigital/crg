/** Conto kode di dropdown Playground. Unggal conto dijalankeun ku tes otomatis. */
export const templates = [
  {
    value: 'default',
    label: 'Default CRG',
    code: `wadah barudak = ["Curug", "Legok", "Bitung", "Mauk"]
ngomong("Sapa barudak kabeh: ") atuh

keur wadah i = 0; i < 3; i = i + 1 {
  ngomong("Halo " + barudak[i] + " Jasa!") atuh
}

wadah status = bener
mun status {
  ngomong("CRG Gaskeun Geura!") jasa atuh
} munteu {
  ngomong("Acan bener bae...") atuh
}`,
  },
  {
    value: 'cek_umur',
    label: 'Cek umur',
    code: `wadah umur = 20
ngomong("Umur maneh: " + umur) atuh

mun umur > 17 {
  ngomong("Geus kolot gening!") jasa atuh
} munteu {
  ngomong("Masih budak keneh.") atuh
}`,
  },
  {
    value: 'fibonacci',
    label: 'Fibonacci',
    code: `# Deret Fibonacci
wadah a = 0
wadah b = 1

deui 10 {
  ngomong(a) atuh
  wadah samentara = b
  b = a + b
  a = samentara
}`,
  },
  {
    value: 'lakon',
    label: 'Lakon (fungsi)',
    code: `# Lakon nu nyauran dirina sorangan
lakon faktorial(n) {
  mun n <= 1 { balik 1 }
  balik n * faktorial(n - 1)
}

unggal n di [3, 5, 7] {
  ngomong(n + "! = " + faktorial(n))
}`,
  },
  {
    value: 'belanja',
    label: 'Daptar belanja',
    code: `wadah belanja = [
  { barang: "Beas", harga: 14000 },
  { barang: "Endog", harga: 28000 },
  { barang: "Kecap", harga: 9000 },
]

wadah total = 0
unggal item, i di belanja {
  ngomong(i + 1, item.barang, "Rp" + item.harga)
  total += item.harga
}
ngomong("Total: Rp" + total) jasa`,
  },
  {
    value: 'imah',
    label: 'Imah (kelas)',
    code: `imah Sato {
  lakon mimiti(ngaran) { ieu.ngaran = ngaran }
  lakon sora() { balik "..." }
  lakon kenalan() { ngomong(ieu.ngaran + " nyarios: " + ieu.sora()) }
}

imah Hayam ti Sato {
  lakon sora() { balik "Kongkorongok!" }
}

imah Embe ti Sato {
  lakon sora() { balik "Mbeeek!" }
}

unggal s di [anyar Hayam("Jago"), anyar Embe("Si Bodas")] {
  s.kenalan()
}`,
  },
  {
    value: 'sabab',
    label: 'Sabab (pilihan)',
    code: `unggal poe di ["Senen", "Jumaah", "Minggu"] {
  sabab poe {
    kasus "Saptu", "Minggu" { ngomong(poe + ": pere, ulin ka Mauk!") }
    kasus "Jumaah" { ngomong(poe + ": Jumatan heula") }
    baku { ngomong(poe + ": mangkat gawe") }
  }
}`,
  },
  {
    value: 'cobaan',
    label: 'Cobaan & kagok',
    code: `lakon tarik(saldo, jumlah) {
  mun jumlah > saldo { kagok "Saldo teu cukup, euy!" }
  balik saldo - jumlah
}

cobaan {
  ngomong("Sesa: " + tarik(50000, 20000))
  ngomong("Sesa: " + tarik(10000, 25000))
} sanya (e) {
  ngomong("Gagal narik: " + e)
}`,
  },
  {
    value: 'tanya',
    label: 'Tanya (input)',
    code: `wadah ngaran = tanya("Saha ngaran maneh?")
wadah umur = angka(tanya("Sabaraha umur maneh?"))

mun umur == acan {
  ngomong("Umur kudu angka, euy")
} munteu {
  ngomong("Sampurasun, " + ngaran + "! Taun hareup umur maneh " + (umur + 1))
}`,
  },
];
