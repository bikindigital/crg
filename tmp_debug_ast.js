import { Lexer, Parser } from './src/lib/interpreter.js';
import util from 'util';

const hitung_mundur = `wadah angka = 5
ngomong("Siap-siap meluncur...") atuh

keur angka > 0 {
  ngomong(angka) atuh
  angka = angka - 1
}`;

let lexer = new Lexer(hitung_mundur);
let parser = new Parser(lexer);
let program = parser.parseProgram();

console.log(util.inspect(program, {showHidden: false, depth: null, colors: true}));

console.log("ERRORS:", parser.errors);
