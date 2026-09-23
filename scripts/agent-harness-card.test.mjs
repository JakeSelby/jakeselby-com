import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/data/agent-harness.ts', import.meta.url), 'utf8');
// Single-quoted literals, escapes included, so copy with an apostrophe (`can\'t`) stays one string.
const strings = [...source.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((match) => match[1].replace(/\\(.)/g, '$1'));

test('the card carries no version literal, so a release never makes it stale', () => {
  assert.ok(strings.length > 0, 'no string literals found in the card data');
  const versioned = strings.filter((value) => /v\d+(\.\d+)+/.test(value));
  assert.deepEqual(versioned, []);
});

test('the repository link points at the latest release rather than a tag', () => {
  assert.ok(
    strings.includes('https://github.com/JakeSelby/agent-harness/releases/latest'),
    'expected the repo link to resolve to the latest release',
  );
  assert.doesNotMatch(source, /releases\/tag\//);
});
