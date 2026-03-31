/**
 * SUCUTANG (Sunda Curug Tangerang) Interpreter V2
 * Full AST-based Lexer, Parser, dan Evaluator.
 */

// 1. TOKEN TYPES
export const TOKEN_TYPES = {
  ILLEGAL: 'ILLEGAL', EOF: 'EOF',
  IDENT: 'IDENT', INT: 'INT', STRING: 'STRING',
  ASSIGN: '=', PLUS: '+', MINUS: '-', BANG: '!',
  ASTERISK: '*', SLASH: '/', LT: '<', GT: '>',
  EQ: '==', NOT_EQ: '!=', LTE: '<=', GTE: '>=',
  AND: '&&', OR: '||', COMMA: ',', SEMICOLON: ';',
  LPAREN: '(', RPAREN: ')', LBRACE: '{', RBRACE: '}',
  LBRACK: '[', RBRACK: ']',
  // Keywords
  WADAH: 'WADAH', MANTEN: 'MANTEN', BEJA: 'BEJA', 
  MUN: 'MUN', MUNTEU: 'MUNTEU', KEUR: 'KEUR', BALIK: 'BALIK',
  BENER: 'BENER', SALAH: 'SALAH', BAE: 'BAE', LAKON: 'LAKON',
  JASA: 'JASA', ATUH: 'ATUH', NYAHO: 'NYAHO'
};

const KEYWORDS = {
  wadah: TOKEN_TYPES.WADAH, manten: TOKEN_TYPES.MANTEN,
  mun: TOKEN_TYPES.MUN, munteu: TOKEN_TYPES.MUNTEU,
  keur: TOKEN_TYPES.KEUR, balik: TOKEN_TYPES.BALIK,
  bener: TOKEN_TYPES.BENER, salah: TOKEN_TYPES.SALAH,
  bae: TOKEN_TYPES.BAE, lakon: TOKEN_TYPES.LAKON,
  jasa: TOKEN_TYPES.JASA, atuh: TOKEN_TYPES.ATUH,
  nyaho: TOKEN_TYPES.NYAHO
};

// 2. LEXER
export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = 0;
    this.readChar();
  }
  readChar() {
    this.ch = this.readPosition >= this.input.length ? 0 : this.input[this.readPosition];
    this.position = this.readPosition;
    this.readPosition++;
  }
  peekChar() {
    return this.readPosition >= this.input.length ? 0 : this.input[this.readPosition];
  }
  nextToken() {
    this.skipWhitespace();
    let tok;
    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') { this.readChar(); tok = { type: TOKEN_TYPES.EQ, literal: '==' }; }
        else { tok = { type: TOKEN_TYPES.ASSIGN, literal: '=' }; }
        break;
      case '!':
        if (this.peekChar() === '=') { this.readChar(); tok = { type: TOKEN_TYPES.NOT_EQ, literal: '!=' }; }
        else { tok = { type: TOKEN_TYPES.BANG, literal: '!' }; }
        break;
      case '<':
        if (this.peekChar() === '=') { this.readChar(); tok = { type: TOKEN_TYPES.LTE, literal: '<=' }; }
        else { tok = { type: TOKEN_TYPES.LT, literal: '<' }; }
        break;
      case '>':
        if (this.peekChar() === '=') { this.readChar(); tok = { type: TOKEN_TYPES.GTE, literal: '>=' }; }
        else { tok = { type: TOKEN_TYPES.GT, literal: '>' }; }
        break;
      case '&':
        if (this.peekChar() === '&') { this.readChar(); tok = { type: TOKEN_TYPES.AND, literal: '&&' }; }
        else { tok = { type: TOKEN_TYPES.ILLEGAL, literal: this.ch }; }
        break;
      case '|':
        if (this.peekChar() === '|') { this.readChar(); tok = { type: TOKEN_TYPES.OR, literal: '||' }; }
        else { tok = { type: TOKEN_TYPES.ILLEGAL, literal: this.ch }; }
        break;
      case '+': tok = { type: TOKEN_TYPES.PLUS, literal: '+' }; break;
      case '-': tok = { type: TOKEN_TYPES.MINUS, literal: '-' }; break;
      case '*': tok = { type: TOKEN_TYPES.ASTERISK, literal: '*' }; break;
      case '/': tok = { type: TOKEN_TYPES.SLASH, literal: '/' }; break;
      case ',': tok = { type: TOKEN_TYPES.COMMA, literal: ',' }; break;
      case ';': tok = { type: TOKEN_TYPES.SEMICOLON, literal: ';' }; break;
      case '(': tok = { type: TOKEN_TYPES.LPAREN, literal: '(' }; break;
      case ')': tok = { type: TOKEN_TYPES.RPAREN, literal: ')' }; break;
      case '{': tok = { type: TOKEN_TYPES.LBRACE, literal: '{' }; break;
      case '}': tok = { type: TOKEN_TYPES.RBRACE, literal: '}' }; break;
      case '[': tok = { type: TOKEN_TYPES.LBRACK, literal: '[' }; break;
      case ']': tok = { type: TOKEN_TYPES.RBRACK, literal: ']' }; break;
      case '"':
      case "'":
        tok = { type: TOKEN_TYPES.STRING, literal: this.readString(this.ch) };
        break;
      case 0: tok = { type: TOKEN_TYPES.EOF, literal: '' }; break;
      default:
        if (this.isLetter(this.ch)) {
          let literal = this.readIdentifier();
          let type = KEYWORDS[literal] || TOKEN_TYPES.IDENT;
          return { type, literal };
        } else if (this.isDigit(this.ch)) {
          return { type: TOKEN_TYPES.INT, literal: this.readNumber() };
        } else {
          tok = { type: TOKEN_TYPES.ILLEGAL, literal: this.ch };
        }
    }
    this.readChar();
    return tok;
  }
  skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') this.readChar();
  }
  isLetter(ch) { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'; }
  isDigit(ch) { return ch >= '0' && ch <= '9'; }
  readIdentifier() {
    let pos = this.position;
    while (this.isLetter(this.ch) || this.isDigit(this.ch)) this.readChar();
    return this.input.substring(pos, this.position);
  }
  readNumber() {
    let pos = this.position;
    while (this.isDigit(this.ch) || this.ch === '.') this.readChar();
    return this.input.substring(pos, this.position);
  }
  readString(quote) {
    let pos = this.position + 1;
    while (true) {
      this.readChar();
      if (this.ch === quote || this.ch === 0) break;
    }
    return this.input.substring(pos, this.position);
  }
}

// 3. PRECEDENCES & PARSER
const PRECEDENCES = {
  LOWEST: 1, ASSIGN: 2, OR: 3, AND: 4, EQUALS: 5, LESSGREATER: 6,
  SUM: 7, PRODUCT: 8, PREFIX: 9, CALL: 10, INDEX: 11, POSTFIX: 12
};

const precedencesMap = {
  [TOKEN_TYPES.ASSIGN]: PRECEDENCES.ASSIGN,
  [TOKEN_TYPES.EQ]: PRECEDENCES.EQUALS, [TOKEN_TYPES.NOT_EQ]: PRECEDENCES.EQUALS,
  [TOKEN_TYPES.LT]: PRECEDENCES.LESSGREATER, [TOKEN_TYPES.GT]: PRECEDENCES.LESSGREATER,
  [TOKEN_TYPES.LTE]: PRECEDENCES.LESSGREATER, [TOKEN_TYPES.GTE]: PRECEDENCES.LESSGREATER,
  [TOKEN_TYPES.PLUS]: PRECEDENCES.SUM, [TOKEN_TYPES.MINUS]: PRECEDENCES.SUM,
  [TOKEN_TYPES.SLASH]: PRECEDENCES.PRODUCT, [TOKEN_TYPES.ASTERISK]: PRECEDENCES.PRODUCT,
  [TOKEN_TYPES.AND]: PRECEDENCES.AND, [TOKEN_TYPES.OR]: PRECEDENCES.OR,
  [TOKEN_TYPES.LPAREN]: PRECEDENCES.CALL, [TOKEN_TYPES.LBRACK]: PRECEDENCES.INDEX,
  [TOKEN_TYPES.JASA]: PRECEDENCES.POSTFIX
};

export class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.errors = [];
    this.prefixParseFns = {};
    this.infixParseFns = {};
    
    this.registerPrefix(TOKEN_TYPES.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TOKEN_TYPES.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPES.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPES.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKEN_TYPES.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKEN_TYPES.BENER, this.parseBoolean.bind(this));
    this.registerPrefix(TOKEN_TYPES.SALAH, this.parseBoolean.bind(this));
    this.registerPrefix(TOKEN_TYPES.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(TOKEN_TYPES.LBRACK, this.parseArrayLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPES.MUN, this.parseIfExpression.bind(this));
    this.registerPrefix(TOKEN_TYPES.NYAHO, this.parseNyahoPrefix.bind(this));
    this.registerPrefix(TOKEN_TYPES.LAKON, this.parseFunctionLiteral.bind(this));

    this.registerInfix(TOKEN_TYPES.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.LTE, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.GTE, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.AND, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.OR, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.LBRACK, this.parseIndexExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.ASSIGN, this.parseAssignExpression.bind(this));
    this.registerInfix(TOKEN_TYPES.JASA, this.parseJasaPostfix.bind(this));

    this.nextToken();
    this.nextToken();
  }
  registerPrefix(tokenType, fn) { this.prefixParseFns[tokenType] = fn; }
  registerInfix(tokenType, fn) { this.infixParseFns[tokenType] = fn; }

  nextToken() {
    this.curToken = this.peekTokenVal;
    this.peekTokenVal = this.lexer.nextToken();
    // atuh is an optional terminator, treat as Semicolon
    if (this.curToken && this.curToken.type === TOKEN_TYPES.ATUH) {
       this.curToken.type = TOKEN_TYPES.SEMICOLON;
    }
    if (this.peekTokenVal && this.peekTokenVal.type === TOKEN_TYPES.ATUH) {
       this.peekTokenVal.type = TOKEN_TYPES.SEMICOLON;
    }
  }
  
  peekPrecedence() { return precedencesMap[this.peekTokenVal.type] || PRECEDENCES.LOWEST; }
  curPrecedence() { return precedencesMap[this.curToken.type] || PRECEDENCES.LOWEST; }

  parseProgram() {
    let program = { type: 'Program', statements: [] };
    while (this.curToken.type !== TOKEN_TYPES.EOF) {
      let stmt = this.parseStatement();
      if (stmt != null) program.statements.push(stmt);
      this.nextToken();
    }
    return program;
  }

  parseStatement() {
    if (this.curToken.type === TOKEN_TYPES.WADAH || this.curToken.type === TOKEN_TYPES.MANTEN) {
      return this.parseLetStatement();
    } else if (this.curToken.type === TOKEN_TYPES.BALIK) {
      return this.parseReturnStatement();
    } else if (this.curToken.type === TOKEN_TYPES.KEUR) {
      return this.parseForStatement();
    } else {
      return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    let stmt = { type: 'LetStatement', name: null, value: null };
    if (this.peekTokenVal.type !== TOKEN_TYPES.IDENT) return null;
    this.nextToken();
    stmt.name = { type: 'Identifier', value: this.curToken.literal };
    if (this.peekTokenVal.type !== TOKEN_TYPES.ASSIGN) return null;
    this.nextToken(); // cur is ASSIGN
    this.nextToken(); // skip ASSIGN
    stmt.value = this.parseExpression(PRECEDENCES.LOWEST);
    if (this.peekTokenVal.type === TOKEN_TYPES.SEMICOLON) this.nextToken();
    return stmt;
  }

  parseReturnStatement() {
    let stmt = { type: 'ReturnStatement', returnValue: null };
    this.nextToken();
    stmt.returnValue = this.parseExpression(PRECEDENCES.LOWEST);
    if (this.peekTokenVal.type === TOKEN_TYPES.SEMICOLON) this.nextToken();
    return stmt;
  }

  parseForStatement() {
    // keur wadah i = 0; i < 3; i = i + 1 { ... }  OR keur status { ... }
    let stmt = { type: 'ForStatement', init: null, cond: null, update: null, body: null };
    this.nextToken(); // skip 'keur'
    
    // Simple parsing logic mapping: parse until {
    let insideParen = false;
    if (this.curToken.type === TOKEN_TYPES.LPAREN) { insideParen = true; this.nextToken(); }
    
    // If next is WADAH, it's a 3-part for loop
    if (this.curToken.type === TOKEN_TYPES.WADAH || this.curToken.type === TOKEN_TYPES.MANTEN) {
       stmt.init = this.parseLetStatement();
       this.nextToken(); // skip to cond
       stmt.cond = this.parseExpression(PRECEDENCES.LOWEST);
       this.nextToken(); // skip to ;
       if (this.curToken.type === TOKEN_TYPES.SEMICOLON) this.nextToken();
       stmt.update = this.parseExpressionStatement();
    } else {
       // Single condition (While)
       stmt.cond = this.parseExpression(PRECEDENCES.LOWEST);
    }
    
    if (insideParen && this.peekTokenVal.type === TOKEN_TYPES.RPAREN) this.nextToken();
    
    while(this.curToken.type !== TOKEN_TYPES.LBRACE && this.curToken.type !== TOKEN_TYPES.EOF) {
       this.nextToken();
    }
    
    if (this.curToken.type !== TOKEN_TYPES.LBRACE) return null;
    stmt.body = this.parseBlockStatement();
    return stmt;
  }

  parseExpressionStatement() {
    let stmt = { type: 'ExpressionStatement', expression: this.parseExpression(PRECEDENCES.LOWEST) };
    if (this.peekTokenVal.type === TOKEN_TYPES.SEMICOLON) this.nextToken();
    return stmt;
  }

  parseBlockStatement() {
    let block = { type: 'BlockStatement', statements: [] };
    this.nextToken(); // skip {
    while (this.curToken.type !== TOKEN_TYPES.RBRACE && this.curToken.type !== TOKEN_TYPES.EOF) {
      let stmt = this.parseStatement();
      if (stmt != null) block.statements.push(stmt);
      this.nextToken();
    }
    return block;
  }

  parseExpression(precedence) {
    let prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) return null;
    let leftExp = prefix();
    while (this.peekTokenVal.type !== TOKEN_TYPES.SEMICOLON && precedence < this.peekPrecedence()) {
      let infix = this.infixParseFns[this.peekTokenVal.type];
      if (!infix) return leftExp;
      this.nextToken();
      leftExp = infix(leftExp);
    }
    return leftExp;
  }

  parseIdentifier() { return { type: 'Identifier', value: this.curToken.literal }; }
  parseIntegerLiteral() { return { type: 'IntegerLiteral', value: Number(this.curToken.literal) }; }
  parseStringLiteral() { return { type: 'StringLiteral', value: this.curToken.literal }; }
  parseBoolean() { return { type: 'Boolean', value: this.curToken.type === TOKEN_TYPES.BENER }; }
  
  parsePrefixExpression() {
    let expr = { type: 'PrefixExpression', operator: this.curToken.literal, right: null };
    this.nextToken();
    expr.right = this.parseExpression(PRECEDENCES.PREFIX);
    return expr;
  }

  parseNyahoPrefix() {
    // nyaho is treated as purely stylistic/wrapper typing, just skip it and parse next
    this.nextToken();
    return this.parseExpression(PRECEDENCES.PREFIX);
  }

  parseGroupedExpression() {
    this.nextToken();
    let exp = this.parseExpression(PRECEDENCES.LOWEST);
    if (this.peekTokenVal.type !== TOKEN_TYPES.RPAREN) return null;
    this.nextToken();
    return exp;
  }

  parseIfExpression() {
    let exp = { type: 'IfExpression', condition: null, consequence: null, alternative: null };
    this.nextToken(); // skip mun
    exp.condition = this.parseExpression(PRECEDENCES.LOWEST);
    if (this.peekTokenVal.type === TOKEN_TYPES.LBRACE) this.nextToken();
    exp.consequence = this.parseBlockStatement();
    
    if (this.peekTokenVal.type === TOKEN_TYPES.MUNTEU) {
      this.nextToken();
      if (this.peekTokenVal.type === TOKEN_TYPES.MUN) {
          // else if (munteu mun)
          this.nextToken();
          exp.alternative = { type: 'BlockStatement', statements: [ {type: 'ExpressionStatement', expression: this.parseIfExpression()} ] };
      } else {
          if (this.peekTokenVal.type === TOKEN_TYPES.LBRACE) this.nextToken();
          exp.alternative = this.parseBlockStatement();
      }
    }
    return exp;
  }

  parseArrayLiteral() {
    let arr = { type: 'ArrayLiteral', elements: [] };
    this.nextToken();
    if (this.curToken.type === TOKEN_TYPES.RBRACK) return arr;
    arr.elements.push(this.parseExpression(PRECEDENCES.LOWEST));
    while (this.peekTokenVal.type === TOKEN_TYPES.COMMA) {
      this.nextToken(); // to comma
      this.nextToken(); // to next exp
      arr.elements.push(this.parseExpression(PRECEDENCES.LOWEST));
    }
    if (this.peekTokenVal.type !== TOKEN_TYPES.RBRACK) return null;
    this.nextToken();
    return arr;
  }

  parseFunctionLiteral() {
    let fn = { type: 'FunctionLiteral', parameters: [], body: null };
    if (this.peekTokenVal.type === TOKEN_TYPES.LPAREN) this.nextToken();
    this.nextToken();
    if (this.curToken.type !== TOKEN_TYPES.RPAREN) {
       fn.parameters.push({ type: 'Identifier', value: this.curToken.literal });
       while (this.peekTokenVal.type === TOKEN_TYPES.COMMA) {
         this.nextToken(); this.nextToken();
         fn.parameters.push({ type: 'Identifier', value: this.curToken.literal });
       }
    }
    if (this.curToken.type !== TOKEN_TYPES.RPAREN) this.nextToken();
    if (this.peekTokenVal.type === TOKEN_TYPES.LBRACE) this.nextToken();
    fn.body = this.parseBlockStatement();
    return fn;
  }

  parseInfixExpression(left) {
    let exp = { type: 'InfixExpression', operator: this.curToken.literal, left: left, right: null };
    let precedence = this.curPrecedence();
    this.nextToken();
    exp.right = this.parseExpression(precedence);
    return exp;
  }
  
  parseCallExpression(functionNode) {
    let exp = { type: 'CallExpression', function: functionNode, args: [] };
    this.nextToken();
    if (this.curToken.type === TOKEN_TYPES.RPAREN) return exp;
    exp.args.push(this.parseExpression(PRECEDENCES.LOWEST));
    while (this.peekTokenVal.type === TOKEN_TYPES.COMMA) {
      this.nextToken(); this.nextToken();
      exp.args.push(this.parseExpression(PRECEDENCES.LOWEST));
    }
    if (this.peekTokenVal.type !== TOKEN_TYPES.RPAREN) return null;
    this.nextToken();
    return exp;
  }
  
  parseIndexExpression(left) {
    let exp = { type: 'IndexExpression', left: left, index: null };
    this.nextToken();
    exp.index = this.parseExpression(PRECEDENCES.LOWEST);
    if (this.peekTokenVal.type !== TOKEN_TYPES.RBRACK) return null;
    this.nextToken();
    return exp;
  }

  parseAssignExpression(left) {
    let exp = { type: 'AssignExpression', left: left, value: null };
    let precedence = this.curPrecedence();
    this.nextToken();
    exp.value = this.parseExpression(precedence);
    return exp;
  }

  parseJasaPostfix(left) {
    if (left.type === 'CallExpression' && left.function.type === 'Identifier' && (left.function.value === 'ngomong' || left.function.value === 'beja')) {
      if (left.args.length > 0) {
         left.args[0] = { type: 'PostfixJasa', left: left.args[0] };
      }
      return left;
    }
    return { type: 'PostfixJasa', left: left };
  }
}

// 4. ENVIRONMENT (Scoping)
class Environment {
  constructor(outer = null) {
    this.store = new Map();
    this.outer = outer;
  }
  get(name) {
    let obj = this.store.get(name);
    if (obj === undefined && this.outer) obj = this.outer.get(name);
    return obj;
  }
  set(name, val) {
    this.store.set(name, val);
    return val;
  }
  // For mutating existing vars
  update(name, val) {
     if (this.store.has(name)) {
         this.store.set(name, val);
         return val;
     } else if (this.outer) {
         return this.outer.update(name, val);
     }
     return null; // Not found
  }
}

// 5. EVALUATOR
class Evaluator {
  constructor(outputCallback) {
    this.outputCallback = outputCallback;
  }
  
  eval(node, env) {
    if (!node) return null;
    switch (node.type) {
      case 'Program': return this.evalProgram(node, env);
      case 'BlockStatement': return this.evalBlockStatement(node, env);
      case 'ExpressionStatement': return this.eval(node.expression, env);
      case 'LetStatement':
        let val = this.eval(node.value, env);
        if (this.isError(val)) return val;
        env.set(node.name.value, val);
        return val;
      case 'ReturnStatement':
        let rval = this.eval(node.returnValue, env);
        if (this.isError(rval)) return rval;
        return { isReturn: true, value: rval };
      case 'ForStatement': return this.evalForStatement(node, env);
      case 'IfExpression': return this.evalIfExpression(node, env);
      case 'IntegerLiteral': return node.value;
      case 'StringLiteral': return node.value;
      case 'Boolean': return node.value;
      case 'Identifier': return this.evalIdentifier(node, env);
      case 'ArrayLiteral':
        let arr = node.elements.map(e => this.eval(e, env));
        return arr;
      case 'IndexExpression':
        let left = this.eval(node.left, env);
        let index = this.eval(node.index, env);
        if (Array.isArray(left) && typeof index === 'number') return left[index];
        return this.error(`Kagok Jasa! Teu bisa di-index: ${left}`);
      case 'PrefixExpression':
        let right = this.eval(node.right, env);
        return this.evalPrefixExpression(node.operator, right);
      case 'InfixExpression':
        let leftInfix = this.eval(node.left, env);
        let rightInfix = this.eval(node.right, env);
        return this.evalInfixExpression(node.operator, leftInfix, rightInfix);
      case 'AssignExpression':
        let valAssign = this.eval(node.value, env);
        if (node.left.type === 'Identifier') {
           env.update(node.left.value, valAssign);
           return valAssign;
        }
        return this.error(`Kagok Jasa! Gagal assign ka ${node.left.type}`);
      case 'PostfixJasa':
        let base = this.eval(node.left, env);
        if (typeof base === 'string') return base + " Jasa!";
        if (typeof base === 'number') return base * 100;
        return base;
      case 'CallExpression':
        let func = this.eval(node.function, env);
        let args = node.args.map(a => this.eval(a, env));
        if (func && func.type === 'BUILTIN') {
          return func.fn(...args);
        }
        return null; // functions ignored for brevity if not builtin
    }
  }

  evalProgram(program, env) {
    let result;
    for (let stmt of program.statements) {
      result = this.eval(stmt, env);
      if (result && result.isReturn) return result.value;
      if (this.isError(result)) return result;
    }
    return result;
  }

  evalBlockStatement(block, env) {
    let result;
    for (let stmt of block.statements) {
      result = this.eval(stmt, env);
      if (result && result.isReturn) return result;
      if (this.isError(result)) return result;
    }
    return result;
  }

  evalIfExpression(node, env) {
    let cond = this.eval(node.condition, env);
    if (this.isTruthy(cond)) {
      return this.eval(node.consequence, env);
    } else if (node.alternative != null) {
      return this.eval(node.alternative, env);
    }
    return null;
  }

  evalForStatement(node, env) {
    let loopEnv = new Environment(env);
    if (node.init) {
       this.eval(node.init, loopEnv);
    }
    let result;
    while (true) {
       let cond = this.eval(node.cond, loopEnv);
       if (!this.isTruthy(cond)) break;
       result = this.eval(node.body, loopEnv);
       if (result && result.isReturn) return result;
       if (node.update) this.eval(node.update, loopEnv);
    }
    return result;
  }

  evalPrefixExpression(operator, right) {
    if (operator === '!') return !this.isTruthy(right);
    if (operator === '-') return -right;
    return null;
  }

  evalInfixExpression(operator, left, right) {
    if (operator === '+') return left + right;
    if (operator === '-') return left - right;
    if (operator === '*') return left * right;
    if (operator === '/') return left / right;
    if (operator === '<') return left < right;
    if (operator === '>') return left > right;
    if (operator === '<=') return left <= right;
    if (operator === '>=') return left >= right;
    if (operator === '==') return left === right;
    if (operator === '!=') return left !== right;
    if (operator === '&&') return left && right;
    if (operator === '||') return left || right;
    return null;
  }

  evalIdentifier(node, env) {
    let val = env.get(node.value);
    if (val !== undefined && val !== null) return val;
    // fallback builtins directly just in case
    return this.error(`Kagok Jasa! Teu kenal wadah: ${node.value}`);
  }

  isTruthy(obj) {
    if (obj === null || obj === false || obj === 0 || obj === '') return false;
    return true;
  }

  isError(obj) { return obj && obj.type === 'ERROR'; }
  error(msg) { return { type: 'ERROR', message: msg }; }
}

// 6. MAIN INTERPRETER WRAPPER
export class Interpreter {
  constructor(outputCallback) {
    this.outputCallback = outputCallback || console.log;
    this.globalEnv = new Environment();
    
    // Register Native Builtins
    this.globalEnv.set('ngomong', { 
      type: 'BUILTIN', 
      fn: (...args) => {
        const text = args.join(' ');
        this.outputCallback(text);
        return null;
      }
    });
    this.globalEnv.set('beja', this.globalEnv.get('ngomong'));
  }

  execute(code) {
    try {
      const lexer = new Lexer(code);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      
      if (parser.errors.length > 0) {
        parser.errors.forEach(e => this.outputCallback(`Kagok Parsing! ${e}`));
        const eggs = ["Haduh ngetik naon ieu teh 🤦‍♂️", "Sing bener atuh mang ngetikna!", "Dipariksa deui nyak, lalaunan bae ☕"];
        this.outputCallback("=> " + eggs[Math.floor(Math.random() * eggs.length)]);
        return;
      }

      const evaluator = new Evaluator(this.outputCallback);
      const result = evaluator.eval(program, this.globalEnv);

      if (result && result.type === 'ERROR') {
        this.outputCallback(result.message);
        const eggs = ["Pusing euy 🤦‍♂️", "Lieur ih, benerin deui kodenya!", "Ulah poho ngopi heula mang ☕"];
        this.outputCallback("=> " + eggs[Math.floor(Math.random() * eggs.length)]);
      }
    } catch (err) {
      this.outputCallback(`Kagok Fatal Jasa! ${err.message}`);
    }
  }
}
