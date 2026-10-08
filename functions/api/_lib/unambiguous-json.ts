/** Reject duplicate decoded object keys before JSON.parse can discard evidence. */
export function parseUnambiguousJson(raw: string): unknown {
  let cursor = 0;
  const whitespace = () => { while (/[\t\n\r ]/.test(raw[cursor] ?? '') && cursor < raw.length) cursor++; };
  const fail = () => { throw new SyntaxError('Invalid or ambiguous JSON.'); };
  const string = (): string => {
    if (raw[cursor] !== '"') return fail();
    const start = cursor++;
    while (cursor < raw.length) {
      const char = raw[cursor++];
      if (char === '\\') cursor++;
      else if (char === '"') return JSON.parse(raw.slice(start, cursor)) as string;
    }
    return fail();
  };
  const value = (depth: number): void => {
    if (depth > 64) return fail();
    whitespace();
    const char = raw[cursor];
    if (char === '{') {
      cursor++; whitespace();
      const keys = new Set<string>();
      if (raw[cursor] === '}') { cursor++; return; }
      while (cursor < raw.length) {
        whitespace(); const key = string();
        if (keys.has(key)) return fail();
        keys.add(key); whitespace();
        if (raw[cursor++] !== ':') return fail();
        value(depth + 1); whitespace();
        const separator = raw[cursor++];
        if (separator === '}') return;
        if (separator !== ',') return fail();
      }
      return fail();
    }
    if (char === '[') {
      cursor++; whitespace();
      if (raw[cursor] === ']') { cursor++; return; }
      while (cursor < raw.length) {
        value(depth + 1); whitespace();
        const separator = raw[cursor++];
        if (separator === ']') return;
        if (separator !== ',') return fail();
      }
      return fail();
    }
    if (char === '"') { string(); return; }
    const start = cursor;
    while (cursor < raw.length && !/[\t\n\r ,}\]]/.test(raw[cursor])) cursor++;
    if (start === cursor) return fail();
    JSON.parse(raw.slice(start, cursor));
  };
  value(0); whitespace();
  if (cursor !== raw.length) return fail();
  return JSON.parse(raw);
}
