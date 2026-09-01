import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

type Rational = { n: bigint; d: bigint };
type Token = { type: "number"; value: bigint } | { type: "op"; value: string };

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0 ? -a : a;
  let y = b < 0 ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x || BigInt(1);
}

function reduce(n: bigint, d: bigint): Rational {
  if (d === BigInt(0)) throw new Error("Division by zero is not allowed.");
  if (d < 0) return reduce(-n, -d);
  const divisor = gcd(n, d);
  const result = { n: n / divisor, d: d / divisor };
  if (result.n.toString().replace("-", "").length > 60 || result.d.toString().length > 60) {
    throw new Error("Calculation result is too large.");
  }
  return result;
}

function tokenize(input: string): Token[] {
  if (!input.trim() || input.length > 200) throw new Error("Invalid expression.");
  const tokens: Token[] = [];
  let index = 0;
  while (index < input.length) {
    const char = input[index];
    if (/\s/u.test(char)) { index += 1; continue; }
    if (/\d/u.test(char)) {
      let literal = char;
      while (index + 1 < input.length && /\d/u.test(input[index + 1])) {
        literal += input[++index];
      }
      const value = BigInt(literal);
      if (value > MAX_TRANSACTION_AMOUNT) throw new Error("Number is too large.");
      tokens.push({ type: "number", value });
    } else if ("+-*/()".includes(char)) {
      tokens.push({ type: "op", value: char });
    } else {
      throw new Error("Calculator character is not supported.");
    }
    index += 1;
  }
  if (tokens.length > 101) throw new Error("Expression is too long.");
  return tokens;
}

export function calculateExpression(input: string): string {
  const tokens = tokenize(input);
  let position = 0;
  let depth = 0;

  const parseFactor = (): Rational => {
    const token = tokens[position++];
    if (!token) throw new Error("Expression is incomplete.");
    if (token.type === "number") return { n: token.value, d: BigInt(1) };
    if (token.value === "+" || token.value === "-") {
      const result = parseFactor();
      return token.value === "-" ? { n: -result.n, d: result.d } : result;
    }
    if (token.value === "(") {
      if (++depth > 10) throw new Error("Parentheses are too deeply nested.");
      const result = parseExpression();
      const close = tokens[position++];
      depth -= 1;
      if (close?.type !== "op" || close.value !== ")") throw new Error("Mismatched parentheses.");
      return result;
    }
    throw new Error("Invalid expression.");
  };

  const parseTerm = (): Rational => {
    let left = parseFactor();
    while (true) {
      const candidate = tokens[position];
      if (candidate?.type !== "op" || !["*", "/"].includes(candidate.value)) break;
      const operator = candidate.value;
      position += 1;
      const right = parseFactor();
      left = operator === "*"
        ? reduce(left.n * right.n, left.d * right.d)
        : reduce(left.n * right.d, left.d * right.n);
    }
    return left;
  };

  const parseExpression = (): Rational => {
    let left = parseTerm();
    while (true) {
      const candidate = tokens[position];
      if (candidate?.type !== "op" || !["+", "-"].includes(candidate.value)) break;
      const operator = candidate.value;
      position += 1;
      const right = parseTerm();
      left = operator === "+"
        ? reduce(left.n * right.d + right.n * left.d, left.d * right.d)
        : reduce(left.n * right.d - right.n * left.d, left.d * right.d);
    }
    return left;
  };

  const result = parseExpression();
  if (position !== tokens.length) throw new Error("Invalid expression.");
  if (result.n <= BigInt(0)) throw new Error("Result must be greater than zero.");
  const quotient = result.n / result.d;
  const remainder = result.n % result.d;
  const rounded = quotient + (remainder * BigInt(2) >= result.d ? BigInt(1) : BigInt(0));
  if (rounded <= BigInt(0) || rounded > MAX_TRANSACTION_AMOUNT) {
    throw new Error("Result is outside the supported range.");
  }
  return rounded.toString();
}
