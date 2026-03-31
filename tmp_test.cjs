const fs = require('fs');

const interpreterCode = fs.readFileSync('d:/Project/crg/public/interpreter.js', 'utf-8');

// Evaluate the interpreter file content to inject Lexer, Parser, Evaluator, Interpreter 
eval(interpreterCode);

const hitung_mundur = `wadah angka = 5
ngomong("Siap-siap meluncur...") atuh

keur angka > 0 {
  ngomong(angka) atuh
  angka = angka - 1
}

ngomong("Maburrr!") jasa atuh`;

let interp = new Interpreter((msg) => console.log('OUT:', msg));
interp.execute(hitung_mundur);
