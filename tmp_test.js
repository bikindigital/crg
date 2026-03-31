import { Interpreter } from './src/lib/interpreter.js';

const hitung_mundur = `wadah angka = 5
ngomong("Siap-siap meluncur...") atuh

keur angka > 0 {
  ngomong(angka) atuh
  angka = angka - 1
}

ngomong("Maburrr!") jasa atuh`;

let interp = new Interpreter((msg) => console.log('OUT:', msg));
interp.execute(hitung_mundur);

const fibonacci = `wadah a = 0
wadah b = 1
wadah n = 10

ngomong("Deret Fibonacci Curug:") atuh

keur n > 0 {
  ngomong(a) atuh
  wadah temp = b
  b = a + b
  a = temp
  n = n - 1
}

ngomong("Sakitu ti abdi!") jasa atuh`;

console.log("--- FIBONACCI ---");
interp.execute(fibonacci);
