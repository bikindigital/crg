// Tes interpreter CRG. Jalankeun: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interpreter } from '../src/lib/interpreter.js';
import { categories } from '../src/data/kamus.js';
import { templates } from '../src/data/templates.js';

/** Ngajalankeun kode, mulangkeun { out, res }. */
function run(code, opts = {}) {
  const out = [];
  const res = new Interpreter((m) => out.push(m), { eggs: false, ...opts }).execute(code);
  return { out, res };
}
const outOf = (code, opts) => run(code, opts).out;

test('conto hero jeung template lila tetep jalan', () => {
  assert.deepEqual(
    outOf(`# Halo Barudak Curug!
wadah ngaran = "Asep"
wadah umur = 17
ngomong("Sampurasun, " + ngaran)
mun umur > 17 {
  ngomong("Geus kolot!") jasa
} munteu {
  ngomong("Masih budak")
} atuh`),
    ['Sampurasun, Asep', 'Masih budak'],
  );
  assert.deepEqual(
    outOf(`wadah barudak = ["Curug", "Legok", "Bitung", "Legok"]
ngomong("Sapa barudak kabeh: ") atuh
keur wadah i = 0; i < 3; i = i + 1 {
  ngomong("Halo " + barudak[i] + " Jasa!") atuh
}
wadah status = bener
mun status {
  ngomong("CRG Gaskeun Geura!") jasa atuh
} munteu {
  ngomong("Acan bener bae...") atuh
}`),
    ['Sapa barudak kabeh: ', 'Halo Curug Jasa!', 'Halo Legok Jasa!', 'Halo Bitung Jasa!', 'CRG Gaskeun Geura! Jasa!'],
  );
});

test('kode nu ahirna kecap/angka teu ngahang (bug lila)', () => {
  assert.deepEqual(outOf('ngomong("a") jasa atuh'), ['a Jasa!']);
  assert.deepEqual(outOf('wadah x = 5\nngomong(x)'), ['5']);
});

test('lakon jeung balik', () => {
  assert.deepEqual(outOf('lakon tambah(a, b) { balik a + b }\nngomong(tambah(2, 3))'), ['5']);
  assert.deepEqual(outOf('wadah f = lakon(x) { balik x * 2 }\nngomong(f(21))'), ['42']);
  assert.deepEqual(outOf('lakon fak(n) { mun n <= 1 { balik 1 }\n balik n * fak(n - 1) }\nngomong(fak(5))'), ['120']);
  // closure
  assert.deepEqual(
    outOf('lakon penghitung() { wadah n = 0\n balik lakon() { n += 1\n balik n } }\nwadah c = penghitung()\nc()\nngomong(c())'),
    ['2'],
  );
});

test('pesan kasalahan jelas jeung aya nomer baris', () => {
  const { out, res } = run('wadah a = 1\nngomong(b)');
  assert.equal(res.ok, false);
  assert.equal(res.line, 2);
  assert.match(out[0], /^Kagok di baris 2! Teu kenal wadah "b"/);
  assert.match(run('ngomong(1 / 0)').out[0], /dibagi enol/);
  assert.match(run('manten x = 1\nx = 2').out[0], /manten/);
  assert.match(run('ngomong("a"').out[0], /Kagok/);
  assert.match(run('enggeus').out[0], /di jero loop/);
});

test('loop kabablasan dieureunkeun, teu ngahang', () => {
  const { out, res } = run('wadah n = 1\nkeur n > 0 { }', { maxSteps: 10_000 });
  assert.equal(res.ok, false);
  assert.match(out[0], /teu eureun-eureun/);
  // cobaan teu bisa newak loop kabablasan
  assert.match(run('cobaan { keur bener { } } sanya { ngomong("katewak") }', { maxSteps: 10_000 }).out[0], /teu eureun-eureun/);
  // rekursi kabablasan
  assert.match(run('lakon f() { balik f() }\nf()').out[0], /kabablasan/);
});

test('kondisi: teu, jeung, atawa, sabab', () => {
  assert.deepEqual(outOf('ngomong(teu bener, bener jeung salah, salah atawa bener)'), ['salah salah bener']);
  assert.deepEqual(outOf('sabab 3 { kasus 1, 2 { ngomong("leutik") } kasus 3 { ngomong("tilu") } baku { ngomong("?") } }'), ['tilu']);
  assert.deepEqual(outOf('sabab 9 { kasus 1 { ngomong("hiji") } baku { ngomong("baku") } }'), ['baku']);
});

test('loop: deui, unggal, enggeus, tuluy', () => {
  assert.deepEqual(outOf('deui 2 { ngomong("x") }'), ['x', 'x']);
  assert.deepEqual(outOf('unggal h, i di "ab" { ngomong(i, h) }'), ['0 a', '1 b']);
  assert.deepEqual(outOf('unggal k di { a: 1, b: 2 } { ngomong(k) }'), ['a', 'b']);
  assert.deepEqual(outOf('keur wadah i = 0; i < 6; i += 1 { mun i == 1 { tuluy }\n mun i == 4 { enggeus }\n ngomong(i) }'), ['0', '2', '3']);
});

test('imah, anyar, ieu, ti, kolot', () => {
  assert.deepEqual(
    outOf(`imah Jalma {
  lakon mimiti(ngaran) { ieu.ngaran = ngaran }
  lakon sapa() { balik "Abdi " + ieu.ngaran }
}
imah Murid ti Jalma {
  lakon mimiti(ngaran, kelas) { kolot.mimiti(ngaran)
    ieu.kelas = kelas }
  lakon sapa() { balik kolot.sapa() + ", kelas " + ieu.kelas }
}
wadah m = anyar Murid("Dede", 7)
ngomong(m.sapa())
ngomong(m)`),
    ['Abdi Dede, kelas 7', 'Murid { ngaran: "Dede", kelas: 7 }'],
  );
});

test('kagok, cobaan, sanya', () => {
  assert.deepEqual(outOf('cobaan { kagok "duh" } sanya (e) { ngomong("katewak " + e) }'), ['katewak duh']);
  const { out, res } = run('kagok "lepat"');
  assert.equal(res.ok, false);
  assert.match(out[0], /Kagok di baris 1! lepat/);
});

test('tanya make fungsi input', () => {
  assert.deepEqual(outOf('wadah n = tanya("Umur?")\nngomong(angka(n) + 1)', { input: () => '17' }), ['18']);
  assert.deepEqual(outOf('ngomong(tanya("?"))'), ['acan']);
});

test('lakon bawaan', () => {
  assert.deepEqual(
    outOf('wadah d = [1]\ntambahkeun(d, 2, 3)\nngomong(d, panjang(d), buleud(2.345, 1), teks(bae), angka("x"))'),
    ['[1, 2, 3] 3 2.3 bae acan'],
  );
});

test('unggal template Playground jalan tanpa kagok', () => {
  for (const t of templates) {
    const { out, res } = run(t.code, { input: (q) => (q.includes('umur') ? '20' : 'Asep') });
    assert.equal(res.ok, true, `template "${t.label}" gagal: ${out.join(' | ')}`);
    assert.ok(out.length > 0, `template "${t.label}" teu ngaluarkeun nanaon`);
  }
});

test('unggal conto aktif di Kamus jalan tanpa kagok', () => {
  for (const cat of categories) {
    for (const k of cat.keywords) {
      if (!k.aktif) continue;
      assert.ok(k.c, `conto keur ${k.s} kosong`);
      const isThrowDemo = k.s === 'kagok';
      const { out, res } = run(k.c, { input: () => 'Asep' });
      if (isThrowDemo) {
        assert.equal(out[0], '5', 'kagok: baris kahiji kudu jalan');
        assert.match(out[1], /Ulah dibagi enol/);
      } else {
        assert.equal(res.ok, true, `conto "${k.s}" gagal: ${out.join(' | ')}`);
        assert.ok(out.length > 0, `conto "${k.s}" teu ngaluarkeun nanaon`);
      }
    }
  }
});
