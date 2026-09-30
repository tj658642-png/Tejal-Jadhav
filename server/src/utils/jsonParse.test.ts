import { describe, expect, it } from 'vitest';
import { parseJsonLoose } from './jsonParse.js';

describe('parseJsonLoose', () => {
  it('parses direct json', () => {
    expect(parseJsonLoose<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses fenced json', () => {
    expect(parseJsonLoose<{ a: number }>('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
});
