import { Lexer, Parser, Environment, Evaluator } from './src/lib/interpreter.js';

const fib = `wadah a = 0
wadah b = 1
wadah n = 5
keur n > 0 {
  ngomong(a) atuh
  wadah temp = b
  b = a + b
  a = temp
  n = n - 1
}
`;

let lexer = new Lexer(fib);
let parser = new Parser(lexer);
let program = parser.parseProgram();

let env = new Environment();
env.set('ngomong', { type: 'BUILTIN', fn: (...args) => console.log('OUT:', ...args) });

let evalr = new Evaluator(msg => console.log(msg));
console.log("Starting execution...");
evalr.eval(program, env);
console.log("Execution finished.");
