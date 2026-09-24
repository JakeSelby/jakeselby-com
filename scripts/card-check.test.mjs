import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { LABEL_DESCRIPTION, apply, cardCopy, ownIssues } from './card-check.mjs';
import * as harness from './harness-card-check.mjs';
import * as ruleprobe from './ruleprobe-card-check.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

// Both cards share the label, so each check's open list holds the other card's issue too.
const listed = [
  { number: 7, title: 'Agent Harness card is not current for v0.12.0' },
  { number: 8, title: 'ruleprobe card is not current for v0.1.0' },
];

// Runs a check end to end with `gh` and `fetch` faked: the card is current (reviewed for the
// latest tag, its copy and links live on both pages) and both issues are open.
async function runCurrent(check) {
  const { CARD } = check;
  const copy = cardCopy(read(CARD.dataFile));
  const { reviewedFor } = JSON.parse(read(CARD.reviewFile));
  const page = [CARD.releaseLink, CARD.siteLink ?? '', ...Object.values(copy)].join(' ');
  const calls = [];
  const gh = (args) => {
    if (args[0] === 'api') return JSON.stringify({ tag_name: reviewedFor });
    if (args[0] === 'issue' && args[1] === 'list') return JSON.stringify(listed);
    calls.push(args);
    return '';
  };
  const fetch = async () => ({ ok: true, status: 200, text: async () => page });
  const log = [];
  await check.main([], { GH_REPO: 'owner/site' }, { gh, fetch, log: (line) => log.push(line) });
  return { calls, log };
}

test('each check keeps only the open issues titled for its own card', () => {
  assert.deepEqual(ownIssues(listed, harness.TITLE_PREFIX), [listed[0]]);
  assert.deepEqual(ownIssues(listed, ruleprobe.TITLE_PREFIX), [listed[1]]);
  assert.deepEqual(ownIssues([{ number: 9 }], ruleprobe.TITLE_PREFIX), []);
});

test('a current ruleprobe card closes its own issue and leaves the Agent Harness one untouched', async () => {
  const { calls, log } = await runCurrent(ruleprobe);
  assert.match(log[0], /^current: /);
  assert.deepEqual(calls.map((args) => args.slice(0, 3)), [['issue', 'close', '8']]);
});

test('a current Agent Harness card closes its own issue and leaves the ruleprobe one untouched', async () => {
  const { calls, log } = await runCurrent(harness);
  assert.match(log[0], /^current: /);
  assert.deepEqual(calls.map((args) => args.slice(0, 3)), [['issue', 'close', '7']]);
});

test('a created issue labels itself with the shared description', () => {
  const calls = [];
  apply('owner/site', [{ op: 'create', title: 't', body: 'b' }], (args, input) => calls.push([args, input]));
  assert.equal(LABEL_DESCRIPTION, 'A live surface lags the latest release it shows');
  assert.ok(calls[0][0].includes(LABEL_DESCRIPTION));
  assert.deepEqual(calls[1], [['issue', 'create', '-R', 'owner/site', '--title', 't', '--label', 'release-drift', '--body-file', '-'], 'b']);
});
