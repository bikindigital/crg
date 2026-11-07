/**
 * CRG (Curug Language) — interpreter.
 * Lexer → Parser (Pratt, AST) → Evaluator (tree-walking).
 *
 * Kecap konci ngagunakeun basa Sunda sapopoe gaya Tangerang (Curug, Mauk).
 * Ieu hiji-hijina salinan interpreter: Playground ngimpor file ieu langsung (di-bundle ku Vite).
 */

// ─────────────────────────────────────────────────────────────
// 1. KECAP KONCI & FUNGSI BAWAAN
// ─────────────────────────────────────────────────────────────

export const KEYWORDS = {
  wadah: 'WADAH', manten: 'MANTEN', bae: 'BAE', acan: 'ACAN', bener: 'BENER', salah: 'SALAH',
  mun: 'MUN', munteu: 'MUNTEU', keur: 'KEUR', deui: 'DEUI', unggal: 'UNGGAL', di: 'DI',
  lakon: 'LAKON', balik: 'BALIK', enggeus: 'ENGGEUS', tuluy: 'TULUY', geura: 'GEURA',
  sabab: 'SABAB', kasus: 'KASUS', baku: 'BAKU', teu: 'TEU', jeung: 'JEUNG', atawa: 'ATAWA', nyaho: 'NYAHO',
  kagok: 'KAGOK', cobaan: 'COBAAN', sanya: 'SANYA',
  imah: 'IMAH', ti: 'TI', anyar: 'ANYAR', ieu: 'IEU', kolot: 'KOLOT',
  jasa: 'JASA', atuh: 'ATUH',
};

export const KEYWORD_LIST = Object.keys(KEYWORDS);
export const BUILTIN_LIST = [
  'ngomong', 'beja', 'tanya', 'nanya', 'barudak', 'konci',
  'panjang', 'tambahkeun', 'angka', 'teks', 'acak', 'buleud',
];

// ─────────────────────────────────────────────────────────────
// 2. KASALAHAN & SINYAL KONTROL
// ─────────────────────────────────────────────────────────────

export class CrgError extends Error {
  constructor(message, line, fatal = false) {
    super(message);
    this.line = line;
    this.fatal = fatal; // fatal = teu bisa ditewak ku cobaan (loop/rekursi kabablasan)
  }
}
class ReturnSignal {
  constructor(value) { this.value = value; }
}
class ThrowSignal {
  constructor(value, line) { this.value = value; this.line = line; }
}
const BREAK = { signal: 'enggeus' };
const CONTINUE = { signal: 'tuluy' };

// ─────────────────────────────────────────────────────────────
// 3. LEXER
// ─────────────────────────────────────────────────────────────

const isDigit = (c) => typeof c === 'string' && c >= '0' && c <= '9';
const isLetter = (c) => typeof c === 'string' && /[A-Za-z_À-ɏ]/.test(c);
const TWO_CHAR = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-='];
const ONE_CHAR = '=+-*/%<>!,;:.(){}[]';

export class Lexer {
  constructor(input) {
    this.src = String(input ?? '');
    this.i = 0;
    this.line = 1;
  }
  peek(o = 0) { return this.src[this.i + o]; }
  advance() {
    const c = this.src[this.i++];
    if (c === '\n') this.line++;
    return c;
  }
  tokenize() {
    const toks = [];
    for (;;) {
      let sawNewline = false;
      // Lewatkeun spasi, baris anyar, jeung komentar '#'
      for (;;) {
        const c = this.peek();
        if (c === ' ' || c === '\t' || c === '\r') this.advance();
        else if (c === '\n') { sawNewline = true; this.advance(); }
        else if (c === '#') { while (this.peek() !== undefined && this.peek() !== '\n') this.advance(); }
        else break;
      }
      const line = this.line;
      const nlBefore = sawNewline || toks.length === 0;
      const push = (type, value) => toks.push({ type, value, line, nlBefore });
      const c = this.peek();

      if (c === undefined) { push('EOF', ''); return toks; }

      if (isDigit(c)) {
        let s = '';
        while (isDigit(this.peek())) s += this.advance();
        if (this.peek() === '.' && isDigit(this.peek(1))) {
          s += this.advance();
          while (isDigit(this.peek())) s += this.advance();
        }
        push('NUMBER', Number(s));
        continue;
      }

      if (isLetter(c)) {
        let s = '';
        while (isLetter(this.peek()) || isDigit(this.peek())) s += this.advance();
        const kw = KEYWORDS[s];
        if (kw === 'ATUH') push(';', s); // atuh = panutup kalimat (siga ';')
        else push(kw || 'IDENT', s);
        continue;
      }

      if (c === '"' || c === "'") {
        const quote = this.advance();
        let s = '';
        for (;;) {
          const d = this.peek();
          if (d === undefined || d === '\n') throw new CrgError('Teks (string) can ditutup ku tanda kutip', line);
          this.advance();
          if (d === quote) break;
          if (d === '\\') {
            const e = this.advance();
            s += e === 'n' ? '\n' : e === 't' ? '\t' : e ?? '';
          } else s += d;
        }
        push('STRING', s);
        continue;
      }

      const two = c + (this.peek(1) ?? '');
      if (TWO_CHAR.includes(two)) { this.advance(); this.advance(); push(two, two); continue; }
      if (ONE_CHAR.includes(c)) { this.advance(); push(c, c); continue; }

      throw new CrgError(`Hurup "${c}" teu dikenal`, line);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 4. PARSER (Pratt)
// ─────────────────────────────────────────────────────────────

const P = { LOWEST: 0, ASSIGN: 1, OR: 2, AND: 3, EQUALS: 4, CMP: 5, SUM: 6, PRODUCT: 7, PREFIX: 8, POSTFIX: 9, CALL: 10 };
const INFIX = {
  '=': P.ASSIGN, '+=': P.ASSIGN, '-=': P.ASSIGN,
  '||': P.OR, ATAWA: P.OR, '&&': P.AND, JEUNG: P.AND,
  '==': P.EQUALS, '!=': P.EQUALS,
  '<': P.CMP, '>': P.CMP, '<=': P.CMP, '>=': P.CMP,
  '+': P.SUM, '-': P.SUM, '*': P.PRODUCT, '/': P.PRODUCT, '%': P.PRODUCT,
  JASA: P.POSTFIX, '(': P.CALL, '[': P.CALL, '.': P.CALL,
};

const describe = (tok) => (tok.type === 'EOF' ? 'ahir kode' : `"${tok.value}"`);

export class Parser {
  constructor(tokens) {
    this.t = tokens;
    this.p = 0;
  }
  get cur() { return this.t[this.p]; }
  peekTok(o = 1) { return this.t[Math.min(this.p + o, this.t.length - 1)]; }
  next() {
    const tok = this.t[this.p];
    if (this.p < this.t.length - 1) this.p++;
    return tok;
  }
  is(type) { return this.cur.type === type; }
  eat(type, what) {
    if (this.cur.type !== type) {
      throw new CrgError(`Kuduna aya ${what}, tapi manggih ${describe(this.cur)}`, this.cur.line);
    }
    return this.next();
  }
  skipSemis() { while (this.is(';')) this.next(); }

  parseProgram() {
    const body = [];
    this.skipSemis();
    while (!this.is('EOF')) {
      body.push(this.statement());
      this.skipSemis();
    }
    return { type: 'Program', body };
  }

  block() {
    const open = this.eat('{', '"{"');
    const body = [];
    this.skipSemis();
    while (!this.is('}')) {
      if (this.is('EOF')) throw new CrgError('Kurung "{" can ditutup ku "}"', open.line);
      body.push(this.statement());
      this.skipSemis();
    }
    this.next();
    return { type: 'Block', body, line: open.line };
  }

  ident(what = 'ngaran wadah') { return this.eat('IDENT', what).value; }

  statement() {
    const tok = this.cur;
    const line = tok.line;
    switch (tok.type) {
      case 'WADAH':
      case 'MANTEN': {
        this.next();
        const name = this.ident();
        let value = null;
        if (this.is('=')) { this.next(); value = this.expression(); }
        else if (tok.type === 'MANTEN') throw new CrgError(`manten "${name}" kudu langsung dieusian`, line);
        return { type: 'Let', name, value, isConst: tok.type === 'MANTEN', line };
      }
      case 'BALIK': {
        this.next();
        let value = null;
        if (!this.is('}') && !this.is(';') && !this.is('EOF') && !this.cur.nlBefore) value = this.expression();
        return { type: 'Return', value, line };
      }
      case 'ENGGEUS': this.next(); return { type: 'Break', line };
      case 'TULUY': this.next(); return { type: 'Continue', line };
      case 'KEUR': return this.forStatement();
      case 'DEUI': {
        this.next();
        const count = this.expression();
        return { type: 'Repeat', count, body: this.block(), line };
      }
      case 'UNGGAL': {
        this.next();
        const item = this.ident();
        let index = null;
        if (this.is(',')) { this.next(); index = this.ident(); }
        this.eat('DI', 'kecap "di"');
        const iter = this.expression();
        return { type: 'ForEach', item, index, iter, body: this.block(), line };
      }
      case 'LAKON':
        if (this.peekTok().type === 'IDENT') {
          this.next();
          const name = this.next().value;
          return { type: 'Let', name, value: this.functionRest(name, line), isConst: false, line };
        }
        break;
      case 'IMAH': return this.classStatement();
      case 'SABAB': return this.switchStatement();
      case 'COBAAN': {
        this.next();
        const body = this.block();
        this.eat('SANYA', 'kecap "sanya" sanggeus blok cobaan');
        let param = null;
        if (this.is('(')) { this.next(); param = this.ident(); this.eat(')', '")"'); }
        else if (this.is('IDENT')) param = this.next().value;
        return { type: 'Try', body, param, handler: this.block(), line };
      }
      case 'KAGOK': this.next(); return { type: 'Throw', value: this.expression(), line };
      case 'GEURA':
        this.next();
        if (this.is('{')) return { type: 'BlockStmt', body: this.block(), line };
        return { type: 'Expr', expr: this.expression(), line };
    }
    return { type: 'Expr', expr: this.expression(), line };
  }

  forStatement() {
    const line = this.next().line;
    if (this.is('WADAH')) {
      // keur wadah i = 0; i < 3; i = i + 1 { ... }
      const init = this.statement();
      this.eat(';', '";" sanggeus wadah');
      const cond = this.expression();
      this.eat(';', '";" sanggeus kondisi');
      const update = this.expression();
      return { type: 'For', init, cond, update, body: this.block(), line };
    }
    // keur kondisi { ... }
    const cond = this.expression();
    return { type: 'For', init: null, cond, update: null, body: this.block(), line };
  }

  functionRest(name, line) {
    this.eat('(', '"(" sanggeus lakon');
    const params = [];
    if (!this.is(')')) {
      params.push(this.ident('ngaran parameter'));
      while (this.is(',')) { this.next(); params.push(this.ident('ngaran parameter')); }
    }
    this.eat(')', '")"');
    return { type: 'Function', name, params, body: this.block(), line };
  }

  classStatement() {
    const line = this.next().line;
    const name = this.ident('ngaran imah');
    let parent = null;
    if (this.is('TI')) { this.next(); parent = this.ident('ngaran imah kolot'); }
    this.eat('{', '"{"');
    const methods = [];
    this.skipSemis();
    while (!this.is('}')) {
      if (this.is('EOF')) throw new CrgError(`imah ${name} can ditutup ku "}"`, line);
      const l = this.eat('LAKON', 'kecap "lakon" (di jero imah ngan aya lakon)').line;
      const mname = this.ident('ngaran lakon');
      methods.push(this.functionRest(mname, l));
      this.skipSemis();
    }
    this.next();
    return { type: 'Class', name, parent, methods, line };
  }

  switchStatement() {
    const line = this.next().line;
    const subject = this.expression();
    this.eat('{', '"{" sanggeus sabab');
    const cases = [];
    let def = null;
    this.skipSemis();
    while (!this.is('}')) {
      if (this.is('KASUS')) {
        this.next();
        const values = [this.expression()];
        while (this.is(',')) { this.next(); values.push(this.expression()); }
        cases.push({ values, body: this.block() });
      } else if (this.is('BAKU')) {
        this.next();
        def = this.block();
      } else {
        throw new CrgError(`Di jero sabab ngan meunang "kasus" atawa "baku", lain ${describe(this.cur)}`, this.cur.line);
      }
      this.skipSemis();
    }
    this.next();
    return { type: 'Switch', subject, cases, def, line };
  }

  expression(prec = P.LOWEST) {
    let left = this.prefix();
    for (;;) {
      const tok = this.cur;
      const p = INFIX[tok.type];
      if (p === undefined || p <= prec) break;
      // Baris anyar nu dimimitian ku ( atawa [ = kalimat anyar, lain nyauran/index
      if ((tok.type === '(' || tok.type === '[') && tok.nlBefore) break;
      left = this.infix(left);
    }
    return left;
  }

  list(close) {
    const items = [];
    while (!this.is(close)) {
      items.push(this.expression());
      if (this.is(',')) this.next();
      else break;
    }
    this.eat(close, `"${close}"`);
    return items;
  }

  hash(line) {
    const entries = [];
    while (!this.is('}')) {
      const k = this.next();
      if (!['IDENT', 'STRING', 'NUMBER'].includes(k.type) && !KEYWORDS[k.value]) {
        throw new CrgError(`Konci objek kudu ngaran atawa teks, lain ${describe(k)}`, k.line);
      }
      this.eat(':', '":" sanggeus konci objek');
      entries.push([String(k.value), this.expression()]);
      if (this.is(',')) this.next();
      else break;
    }
    this.eat('}', '"}"');
    return { type: 'Hash', entries, line };
  }

  ifExpr(line) {
    const cond = this.expression();
    const cons = this.block();
    let alt = null;
    if (this.is('MUNTEU')) {
      this.next();
      if (this.is('MUN')) alt = this.ifExpr(this.next().line);
      else alt = this.block();
    }
    return { type: 'If', cond, cons, alt, line };
  }

  prefix() {
    const tok = this.next();
    const line = tok.line;
    switch (tok.type) {
      case 'NUMBER': return { type: 'Num', value: tok.value, line };
      case 'STRING': return { type: 'Str', value: tok.value, line };
      case 'BENER': return { type: 'Bool', value: true, line };
      case 'SALAH': return { type: 'Bool', value: false, line };
      case 'BAE': return { type: 'Null', line };
      case 'ACAN': return { type: 'Undef', line };
      case 'IDENT': return { type: 'Ident', name: tok.value, line };
      case 'IEU': return { type: 'This', line };
      case 'KOLOT': return { type: 'Super', line };
      case '(': {
        const e = this.expression();
        this.eat(')', '")"');
        return e;
      }
      case '[': return { type: 'Array', items: this.list(']'), line };
      case '{': return this.hash(line);
      case '-': return { type: 'Unary', op: '-', right: this.expression(P.PREFIX), line };
      case '!':
      case 'TEU': return { type: 'Unary', op: '!', right: this.expression(P.PREFIX), line };
      case 'NYAHO': return { type: 'Unary', op: 'nyaho', right: this.expression(P.PREFIX), line };
      case 'LAKON': {
        const name = this.is('IDENT') ? this.next().value : null;
        return this.functionRest(name, line);
      }
      case 'ANYAR': {
        const cls = this.ident('ngaran imah sanggeus anyar');
        let args = [];
        if (this.is('(')) { this.next(); args = this.list(')'); }
        return { type: 'New', cls, args, line };
      }
      case 'MUN': return this.ifExpr(line);
    }
    if (tok.type === 'EOF') throw new CrgError('Kode eureun di tengah-tengah, aya nu kurang', line);
    throw new CrgError(`Teu ngarti ${describe(tok)} di dieu`, line);
  }

  infix(left) {
    const tok = this.next();
    const line = tok.line;
    switch (tok.type) {
      case '=':
      case '+=':
      case '-=': {
        if (!['Ident', 'Index', 'Member'].includes(left.type)) {
          throw new CrgError('Ngan wadah, index, atawa sipat objek nu bisa dieusian', line);
        }
        return { type: 'Assign', op: tok.type, target: left, value: this.expression(P.ASSIGN - 1), line };
      }
      case '(': return { type: 'Call', callee: left, args: this.list(')'), line };
      case '[': {
        const index = this.expression();
        this.eat(']', '"]"');
        return { type: 'Index', obj: left, index, line };
      }
      case '.': {
        const name = this.next();
        if (name.type !== 'IDENT' && !KEYWORDS[name.value]) throw new CrgError('Sanggeus "." kudu aya ngaran', line);
        return { type: 'Member', obj: left, name: name.value, line };
      }
      case 'JASA': {
        // ngomong("...") jasa → jasa nempel ka eusi nu diomongkeun
        if (left.type === 'Call' && left.callee.type === 'Ident' && ['ngomong', 'beja'].includes(left.callee.name) && left.args.length) {
          left.args[0] = { type: 'Jasa', expr: left.args[0], line };
          return left;
        }
        return { type: 'Jasa', expr: left, line };
      }
      default: {
        const op = tok.type === 'JEUNG' ? '&&' : tok.type === 'ATAWA' ? '||' : tok.type;
        return { type: 'Binary', op, left, right: this.expression(INFIX[tok.type]), line };
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 5. ENVIRONMENT (wengkuan / scope)
// ─────────────────────────────────────────────────────────────

export class Environment {
  constructor(outer = null) {
    this.vars = new Map();
    this.consts = new Set();
    this.outer = outer;
  }
  define(name, value, isConst = false, line) {
    if (this.consts.has(name)) throw new CrgError(`"${name}" teh manten, teu bisa dirobah`, line);
    this.vars.set(name, value);
    if (isConst) this.consts.add(name);
  }
  lookup(name) {
    for (let e = this; e; e = e.outer) if (e.vars.has(name)) return e;
    return null;
  }
  get(name, line) {
    const e = this.lookup(name);
    if (!e) throw new CrgError(`Teu kenal wadah "${name}". Jieun heula: wadah ${name} = ...`, line);
    return e.vars.get(name);
  }
  assign(name, value, line) {
    const e = this.lookup(name);
    if (!e) throw new CrgError(`Wadah "${name}" acan dijieun. Jieun heula: wadah ${name} = ...`, line);
    if (e.consts.has(name)) throw new CrgError(`"${name}" teh manten, teu bisa dirobah`, line);
    e.vars.set(name, value);
    return value;
  }
}

// ─────────────────────────────────────────────────────────────
// 6. TAMPILAN NILAI
// ─────────────────────────────────────────────────────────────

export function tampil(v, nested = false, depth = 0) {
  if (v === null) return 'bae';
  if (v === undefined) return 'acan';
  if (v === true) return 'bener';
  if (v === false) return 'salah';
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return 'lain angka';
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
  }
  if (typeof v === 'string') return nested ? JSON.stringify(v) : v;
  if (depth > 5) return '…';
  if (Array.isArray(v)) return `[${v.map((x) => tampil(x, true, depth + 1)).join(', ')}]`;
  switch (v.kind) {
    case 'lakon': return `<lakon ${v.name || 'tanpa ngaran'}>`;
    case 'terikat': return `<lakon ${v.fn.name}>`;
    case 'bawaan': return `<lakon bawaan ${v.name}>`;
    case 'imah': return `<imah ${v.name}>`;
    case 'objek': {
      const inner = [...v.fields].map(([k, x]) => `${k}: ${tampil(x, true, depth + 1)}`).join(', ');
      return `${v.cls ? `${v.cls.name} ` : ''}${inner ? `{ ${inner} }` : '{}'}`;
    }
  }
  return String(v);
}

// ─────────────────────────────────────────────────────────────
// 7. EVALUATOR
// ─────────────────────────────────────────────────────────────

const isLoopSignal = (s) => s === BREAK || s === CONTINUE;

export class Evaluator {
  constructor({ maxSteps = 2_000_000, maxDepth = 400 } = {}) {
    this.maxSteps = maxSteps;
    this.maxDepth = maxDepth;
    this.steps = 0;
    this.depth = 0;
  }

  tick(line) {
    if (++this.steps > this.maxSteps) {
      throw new CrgError(
        `Program teu eureun-eureun (leuwih ti ${this.maxSteps.toLocaleString('id-ID')} langkah). Pariksa deui loop maneh, bisi kondisina teu pernah salah.`,
        line,
        true,
      );
    }
  }

  run(program, env) {
    let last;
    for (const s of program.body) last = this.exec(s, env);
    return last;
  }

  execBlock(block, env) {
    let last;
    for (const s of block.body) last = this.exec(s, env);
    return last;
  }

  /** Ngajalankeun awak loop; mulangkeun false lamun kudu eureun (enggeus). */
  loopBody(body, env) {
    try {
      this.execBlock(body, env);
    } catch (s) {
      if (s === BREAK) return false;
      if (s !== CONTINUE) throw s;
    }
    return true;
  }

  exec(node, env) {
    this.tick(node.line);
    switch (node.type) {
      case 'Expr': return this.eval(node.expr, env);
      case 'Let': {
        const v = node.value ? this.eval(node.value, env) : undefined;
        env.define(node.name, v, node.isConst, node.line);
        return v;
      }
      case 'Return': throw new ReturnSignal(node.value ? this.eval(node.value, env) : null);
      case 'Break': throw BREAK;
      case 'Continue': throw CONTINUE;
      case 'BlockStmt': return this.execBlock(node.body, new Environment(env));
      case 'For': {
        const loopEnv = new Environment(env);
        if (node.init) this.exec(node.init, loopEnv);
        while (this.truthy(this.eval(node.cond, loopEnv))) {
          this.tick(node.line);
          if (!this.loopBody(node.body, new Environment(loopEnv))) break;
          if (node.update) this.eval(node.update, loopEnv);
        }
        return null;
      }
      case 'Repeat': {
        const n = this.eval(node.count, env);
        if (typeof n !== 'number') throw new CrgError('deui butuh angka, conto: deui 3 { ... }', node.line);
        for (let i = 0; i < n; i++) {
          this.tick(node.line);
          if (!this.loopBody(node.body, new Environment(env))) break;
        }
        return null;
      }
      case 'ForEach': {
        const it = this.eval(node.iter, env);
        let items;
        if (Array.isArray(it)) items = it.map((v, i) => [v, i]);
        else if (typeof it === 'string') items = [...it].map((v, i) => [v, i]);
        else if (it && it.kind === 'objek') items = [...it.fields.keys()].map((k, i) => [k, i]);
        else throw new CrgError('unggal ngan bisa dipake keur daptar, teks, atawa objek', node.line);
        for (const [v, i] of items) {
          this.tick(node.line);
          const e = new Environment(env);
          e.define(node.item, v);
          if (node.index) e.define(node.index, i);
          if (!this.loopBody(node.body, e)) break;
        }
        return null;
      }
      case 'Class': {
        const parent = node.parent ? env.get(node.parent, node.line) : null;
        if (node.parent && (!parent || parent.kind !== 'imah')) throw new CrgError(`"${node.parent}" lain imah`, node.line);
        const cls = { kind: 'imah', name: node.name, parent, methods: new Map() };
        for (const m of node.methods) {
          cls.methods.set(m.name, { kind: 'lakon', name: m.name, params: m.params, body: m.body, env, cls });
        }
        env.define(node.name, cls, false, node.line);
        return null;
      }
      case 'Switch': {
        const v = this.eval(node.subject, env);
        for (const c of node.cases) {
          for (const cv of c.values) {
            if (v === this.eval(cv, env)) return this.execBlock(c.body, new Environment(env));
          }
        }
        if (node.def) return this.execBlock(node.def, new Environment(env));
        return null;
      }
      case 'Try': {
        try {
          this.execBlock(node.body, new Environment(env));
        } catch (e) {
          let caught;
          if (e instanceof ThrowSignal) caught = e.value;
          else if (e instanceof CrgError && !e.fatal) caught = e.message;
          else throw e;
          const h = new Environment(env);
          if (node.param) h.define(node.param, caught);
          this.execBlock(node.handler, h);
        }
        return null;
      }
      case 'Throw': throw new ThrowSignal(this.eval(node.value, env), node.line);
    }
    throw new CrgError(`Teu bisa ngajalankeun ${node.type}`, node.line);
  }

  eval(node, env) {
    switch (node.type) {
      case 'Num':
      case 'Str':
      case 'Bool': return node.value;
      case 'Null': return null;
      case 'Undef': return undefined;
      case 'Ident': return env.get(node.name, node.line);
      case 'This': {
        const e = env.lookup('ieu');
        if (!e) throw new CrgError('ieu ngan bisa dipake di jero lakon imah', node.line);
        return e.vars.get('ieu');
      }
      case 'Super': {
        const e = env.lookup('ieu');
        const c = env.lookup('__imah');
        if (!e || !c) throw new CrgError('kolot ngan bisa dipake di jero lakon imah', node.line);
        const cls = c.vars.get('__imah');
        if (!cls.parent) throw new CrgError(`imah ${cls.name} teu boga kolot (pake "imah ${cls.name} ti ...")`, node.line);
        return { kind: 'kolot', cls: cls.parent, self: e.vars.get('ieu') };
      }
      case 'Array': return node.items.map((i) => this.eval(i, env));
      case 'Hash': {
        const fields = new Map();
        for (const [k, v] of node.entries) fields.set(k, this.eval(v, env));
        return { kind: 'objek', cls: null, fields };
      }
      case 'Function': return { kind: 'lakon', name: node.name, params: node.params, body: node.body, env, cls: null };
      case 'Unary': {
        const r = this.eval(node.right, env);
        if (node.op === '!') return !this.truthy(r);
        if (node.op === 'nyaho') return this.truthy(r);
        if (typeof r !== 'number') throw new CrgError(`Teu bisa nga-minus-keun ${tampil(r, true)}`, node.line);
        return -r;
      }
      case 'Binary': return this.binary(node, env);
      case 'Assign': return this.assign(node, env);
      case 'Index': return this.getIndex(this.eval(node.obj, env), this.eval(node.index, env), node.line);
      case 'Member': return this.getMember(this.eval(node.obj, env), node.name, node.line);
      case 'Call': {
        const callee = this.eval(node.callee, env);
        const args = node.args.map((a) => this.eval(a, env));
        return this.callValue(callee, args, node.line);
      }
      case 'New': {
        const cls = env.get(node.cls, node.line);
        if (!cls || cls.kind !== 'imah') throw new CrgError(`"${node.cls}" lain imah, teu bisa dipake ku anyar`, node.line);
        const inst = { kind: 'objek', cls, fields: new Map() };
        const args = node.args.map((a) => this.eval(a, env));
        const ctor = this.findMethod(cls, 'mimiti');
        if (ctor) this.invoke(ctor, args, node.line, inst);
        return inst;
      }
      case 'Jasa': {
        const v = this.eval(node.expr, env);
        if (typeof v === 'string') return `${v} Jasa!`;
        if (typeof v === 'number') return v * 100;
        return v;
      }
      case 'If': {
        if (this.truthy(this.eval(node.cond, env))) return this.execBlock(node.cons, new Environment(env));
        if (!node.alt) return null;
        return node.alt.type === 'If' ? this.eval(node.alt, env) : this.execBlock(node.alt, new Environment(env));
      }
    }
    throw new CrgError(`Teu bisa ngitung ${node.type}`, node.line);
  }

  binary(node, env) {
    const { op, line } = node;
    if (op === '&&') { const l = this.eval(node.left, env); return this.truthy(l) ? this.eval(node.right, env) : l; }
    if (op === '||') { const l = this.eval(node.left, env); return this.truthy(l) ? l : this.eval(node.right, env); }
    const l = this.eval(node.left, env);
    const r = this.eval(node.right, env);
    switch (op) {
      case '==': return l === r;
      case '!=': return l !== r;
      case '<': case '>': case '<=': case '>=': {
        const ok = (typeof l === 'number' && typeof r === 'number') || (typeof l === 'string' && typeof r === 'string');
        if (!ok) throw new CrgError(`Teu bisa ngabandingkeun ${tampil(l, true)} ${op} ${tampil(r, true)}`, line);
        return op === '<' ? l < r : op === '>' ? l > r : op === '<=' ? l <= r : l >= r;
      }
    }
    return this.arith(op, l, r, line);
  }

  arith(op, l, r, line) {
    if (op === '+') {
      if (typeof l === 'string' || typeof r === 'string') return tampil(l) + tampil(r);
      if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r];
    }
    if (typeof l !== 'number' || typeof r !== 'number') {
      throw new CrgError(`Teu bisa ngitung ${tampil(l, true)} ${op} ${tampil(r, true)}`, line);
    }
    switch (op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/':
        if (r === 0) throw new CrgError('Teu bisa dibagi enol', line);
        return l / r;
      case '%':
        if (r === 0) throw new CrgError('Teu bisa dibagi enol', line);
        return l % r;
    }
    throw new CrgError(`Operator "${op}" teu dikenal`, line);
  }

  assign(node, env) {
    const val = this.eval(node.value, env);
    const t = node.target;
    const combine = (old) => (node.op === '=' ? val : this.arith(node.op === '+=' ? '+' : '-', old, val, node.line));

    if (t.type === 'Ident') {
      const old = node.op === '=' ? undefined : env.get(t.name, t.line);
      return env.assign(t.name, combine(old), node.line);
    }
    const o = this.eval(t.obj, env);
    if (t.type === 'Index') {
      const i = this.eval(t.index, env);
      if (Array.isArray(o) && Number.isInteger(i) && i >= 0) return (o[i] = combine(o[i]));
      if (o && o.kind === 'objek') {
        const k = tampil(i);
        const v = combine(o.fields.get(k));
        o.fields.set(k, v);
        return v;
      }
      throw new CrgError(`Teu bisa ngeusian ${tampil(o, true)}[${tampil(i, true)}]`, node.line);
    }
    // Member
    if (!o || o.kind !== 'objek') throw new CrgError(`Teu bisa ngeusian ".${t.name}" dina ${tampil(o, true)}`, node.line);
    const v = combine(o.fields.get(t.name));
    o.fields.set(t.name, v);
    return v;
  }

  getIndex(o, i, line) {
    if (Array.isArray(o) || typeof o === 'string') {
      if (typeof i !== 'number') throw new CrgError(`Index kudu angka, lain ${tampil(i, true)}`, line);
      const v = o[i];
      return v === undefined ? undefined : v;
    }
    if (o && o.kind === 'objek') return o.fields.get(tampil(i));
    throw new CrgError(`${tampil(o, true)} teu bisa di-index`, line);
  }

  findMethod(cls, name) {
    for (let c = cls; c; c = c.parent) if (c.methods.has(name)) return c.methods.get(name);
    return null;
  }

  getMember(o, name, line) {
    if (o && o.kind === 'objek') {
      if (o.fields.has(name)) return o.fields.get(name);
      const m = o.cls && this.findMethod(o.cls, name);
      return m ? { kind: 'terikat', fn: m, self: o } : undefined;
    }
    if (o && o.kind === 'kolot') {
      const m = this.findMethod(o.cls, name);
      if (!m) throw new CrgError(`imah ${o.cls.name} teu boga lakon "${name}"`, line);
      return { kind: 'terikat', fn: m, self: o.self };
    }
    if ((Array.isArray(o) || typeof o === 'string') && name === 'panjang') return o.length;
    throw new CrgError(`Teu bisa nyokot ".${name}" tina ${tampil(o, true)}`, line);
  }

  callValue(f, args, line) {
    if (f && f.kind === 'bawaan') return f.fn(args, line);
    if (f && f.kind === 'terikat') return this.invoke(f.fn, args, line, f.self);
    if (f && f.kind === 'lakon') return this.invoke(f, args, line, null);
    if (f && f.kind === 'imah') throw new CrgError(`Pake "anyar ${f.name}(...)" keur nyieun eusi imah`, line);
    throw new CrgError(`${tampil(f, true)} lain lakon, teu bisa disauran`, line);
  }

  invoke(fn, args, line, self) {
    this.depth++;
    try {
      if (this.depth > this.maxDepth) {
        throw new CrgError(`Lakon "${fn.name || 'tanpa ngaran'}" nyauran dirina sorangan kabablasan (leuwih ti ${this.maxDepth} kali)`, line, true);
      }
      const e = new Environment(fn.env);
      fn.params.forEach((p, i) => e.define(p, args[i]));
      if (self) {
        e.define('ieu', self);
        e.define('__imah', fn.cls);
      }
      this.execBlock(fn.body, e);
      return null;
    } catch (s) {
      if (s instanceof ReturnSignal) return s.value;
      if (isLoopSignal(s)) throw new CrgError(`"${s.signal}" ngan bisa dipake di jero loop`, line);
      throw s;
    } finally {
      this.depth--;
    }
  }

  truthy(v) {
    return !(v === null || v === undefined || v === false || v === 0 || v === '' || Number.isNaN(v));
  }
}

// ─────────────────────────────────────────────────────────────
// 8. INTERPRETER (bungkus utama)
// ─────────────────────────────────────────────────────────────

const EGGS = [
  'Haduh, ngetik naon ieu teh 🤦‍♂️',
  'Sing bener atuh mang ngetikna!',
  'Dipariksa deui nyak, lalaunan bae ☕',
  'Lieur euy, benerkeun deui kodena!',
  'Ulah poho ngopi heula mang ☕',
];

export class Interpreter {
  /**
   * @param {(text: string) => void} outputCallback  tempat hasil ngomong/beja
   * @param {{ input?: (pananya: string) => string | null, maxSteps?: number, maxDepth?: number, eggs?: boolean }} options
   */
  constructor(outputCallback, options = {}) {
    this.out = outputCallback || console.log;
    this.input = options.input || null;
    this.maxSteps = options.maxSteps ?? 2_000_000;
    this.maxDepth = options.maxDepth ?? 400;
    this.eggs = options.eggs ?? true;
    this.globals = this.makeGlobals();
  }

  makeGlobals() {
    const g = new Environment();
    const def = (name, fn) => g.define(name, { kind: 'bawaan', name, fn });
    const needArray = (x, name, line) => {
      if (!Array.isArray(x)) throw new CrgError(`${name} butuh daptar (barudak), lain ${tampil(x, true)}`, line);
    };

    const ngomong = (args) => { this.out(args.map((a) => tampil(a)).join(' ')); return null; };
    def('ngomong', ngomong);
    def('beja', ngomong);

    const tanya = (args) => {
      const q = args.length ? tampil(args[0]) : '';
      const r = this.input ? this.input(q) : undefined;
      return r === null || r === undefined ? undefined : String(r);
    };
    def('tanya', tanya);
    def('nanya', tanya);

    def('barudak', (args) => [...args]);
    def('konci', ([o], line) => {
      if (o && o.kind === 'objek') return [...o.fields.keys()];
      throw new CrgError(`konci butuh objek, lain ${tampil(o, true)}`, line);
    });
    def('panjang', ([x], line) => {
      if (Array.isArray(x) || typeof x === 'string') return x.length;
      if (x && x.kind === 'objek') return x.fields.size;
      throw new CrgError(`panjang butuh daptar, teks, atawa objek, lain ${tampil(x, true)}`, line);
    });
    def('tambahkeun', ([arr, ...vals], line) => {
      needArray(arr, 'tambahkeun', line);
      arr.push(...vals);
      return arr;
    });
    def('angka', ([x]) => {
      if (typeof x === 'number') return x;
      if (typeof x !== 'string' || x.trim() === '') return undefined;
      const n = Number(x.replace(',', '.'));
      return Number.isNaN(n) ? undefined : n;
    });
    def('teks', ([x]) => tampil(x));
    def('acak', ([a, b], line) => {
      if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
      if (typeof a === 'number' && typeof b === 'number') return a + Math.floor(Math.random() * (b - a + 1));
      if (typeof a === 'number') return Math.floor(Math.random() * a);
      throw new CrgError('acak butuh angka (acak(1, 6)) atawa daptar (acak(daptar))', line);
    });
    def('buleud', ([x, d = 0], line) => {
      if (typeof x !== 'number') throw new CrgError(`buleud butuh angka, lain ${tampil(x, true)}`, line);
      const f = 10 ** d;
      return Math.round(x * f) / f;
    });
    return g;
  }

  /** Ngajalankeun kode CRG. Mulangkeun { ok, steps, error?, line? }. */
  execute(code) {
    const evaluator = new Evaluator({ maxSteps: this.maxSteps, maxDepth: this.maxDepth });
    try {
      const program = new Parser(new Lexer(code).tokenize()).parseProgram();
      evaluator.run(program, new Environment(this.globals));
      return { ok: true, steps: evaluator.steps };
    } catch (e) {
      if (e instanceof ReturnSignal) return { ok: true, steps: evaluator.steps };
      let msg;
      let line;
      if (e instanceof CrgError) { msg = e.message; line = e.line; }
      else if (e instanceof ThrowSignal) { msg = tampil(e.value); line = e.line; }
      else if (isLoopSignal(e)) msg = `"${e.signal}" ngan bisa dipake di jero loop`;
      else if (e instanceof RangeError) msg = 'Program kajeroan teuing. Pariksa lakon nu nyauran dirina sorangan.';
      else msg = `Aya nu salah di jero interpreter: ${e && e.message}`;
      this.out(`Kagok${line ? ` di baris ${line}` : ''}! ${msg}`);
      if (this.eggs) this.out(`=> ${EGGS[Math.floor(Math.random() * EGGS.length)]}`);
      return { ok: false, steps: evaluator.steps, error: msg, line };
    }
  }
}
