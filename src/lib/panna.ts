export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

function valueOf(d: Digit) {
  return d === 0 ? 10 : d;
}

export function sortPanna(a: Digit, b: Digit, c: Digit) {
  const arr = [a, b, c];
  arr.sort((x, y) => valueOf(x) - valueOf(y));
  return arr.join("");
}

export function isSinglePanna(a: Digit, b: Digit, c: Digit) {
  const s = new Set([a, b, c]);
  return s.size === 3;
}

export function isDoublePanna(a: Digit, b: Digit, c: Digit) {
  const s = new Set([a, b, c]);
  return s.size === 2;
}

export function isTriplePanna(a: Digit, b: Digit, c: Digit) {
  return a === b && b === c;
}

export function suggestionsForPrefix(prefix: string) {
  const clean = prefix.replace(/\D/g, "");
  const digits: Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out = new Set<string>();

  if (clean.length === 0) {
    return [];
  }

  if (clean.length === 1) {
    const a = Number(clean[0]) as Digit;
    for (const b of digits) {
      if (b === a) continue;
      for (const c of digits) {
        if (c === a || c === b) continue;
        out.add(sortPanna(a, b, c));
      }
    }
  } else if (clean.length === 2) {
    const a = Number(clean[0]) as Digit;
    const b = Number(clean[1]) as Digit;
    for (const c of digits) {
      if (new Set([a, b, c]).size !== 3) continue;
      out.add(sortPanna(a, b, c));
    }
  } else {
    const a = Number(clean[0]) as Digit;
    const b = Number(clean[1]) as Digit;
    const c = Number(clean[2]) as Digit;
    out.add(sortPanna(a, b, c));
  }

  return Array.from(out).sort((x, y) => x.localeCompare(y)).slice(0, 20);
}
