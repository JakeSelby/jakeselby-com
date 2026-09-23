import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { RELEASE_LINK, cardCopy, decide, facts, issue, pageText, plan } from './harness-card-check.mjs';

const source = readFileSync(new URL('../src/data/agent-harness.ts', import.meta.url), 'utf8');
const review = JSON.parse(readFileSync(new URL('../src/data/agent-harness.review.json', import.meta.url), 'utf8'));

const copy = { tagline: 'Old headline.', role: 'Qualified on the CLIs.' };
const page = (url, body, status = 200) => ({ url, status, text: `<a href="${RELEASE_LINK}">x</a>${body}` });
const livePages = [page('https://a.test/', 'Old headline.'), page('https://a.test/projects/', 'Old headline. Qualified on the CLIs.')];

test('the review file names the release the copy was last reviewed against', () => {
  assert.match(review.reviewedFor, /^v\d+\.\d+\.\d+$/);
});

test('cardCopy reads the prose fields of the committed card and nothing else', () => {
  const committed = cardCopy(source);
  assert.deepEqual(Object.keys(committed).sort(), ['description', 'reason', 'role', 'tagline']);
  assert.ok(committed.tagline.length > 0);
  assert.deepEqual(cardCopy("  tagline: 'It\\'s here',\n  brandColor: '#fff',\n"), { tagline: "It's here" });
});

test('pageText decodes the entities a static build writes', () => {
  assert.equal(pageText('It&#39;s &amp; &quot;it&#x27;s&quot; &lt;b&gt; &unknown;'), 'It\'s & "it\'s" <b> &unknown;');
});

test('the card is current when reviewed for the latest release, live and linked on both pages', () => {
  const decision = decide({ reviewedFor: 'v0.12.0', latestTag: 'v0.12.0', copy, placements: livePages });
  assert.equal(decision.status, 'current');
});

test('a release after the last review keeps the card behind', () => {
  const decision = decide({ reviewedFor: 'v0.11.1', latestTag: 'v0.12.0', copy, placements: livePages });
  assert.equal(decision.status, 'behind');
  assert.deepEqual(decision.problems, ['The copy was last reviewed for v0.11.1; the latest release is v0.12.0.']);
});

test('committed copy missing from every live page reads as not deployed', () => {
  const edited = { ...copy, tagline: 'New headline.' };
  const decision = decide({ reviewedFor: 'v0.12.0', latestTag: 'v0.12.0', copy: edited, placements: livePages });
  assert.deepEqual(decision.problems, ['The live card lacks the committed tagline: main has copy that is not deployed.']);
});

test('a placement that fails, errors or drops the release link is a problem of its own', () => {
  const placements = [
    { url: 'https://a.test/', status: null, text: '' },
    { url: 'https://a.test/projects/', status: 404, text: '' },
    { url: 'https://a.test/other/', status: 200, text: 'Old headline. Qualified on the CLIs.' },
  ];
  const decision = decide({ reviewedFor: 'v0.12.0', latestTag: 'v0.12.0', copy, placements });
  assert.deepEqual(decision.problems, [
    'https://a.test/ could not be fetched.',
    'https://a.test/projects/ answered 404.',
    'https://a.test/other/ does not link the latest release.',
  ]);
});

test('the review facts carry the headline, description, catalog statuses and role line', () => {
  const product = { headline: 'New headline.', description: 'What it is.' };
  const catalog = { clients: [{ id: 'cli-a', status: 'unqualified' }, { id: 'cli-b', status: 'unqualified' }, { id: 'x', status: 'planned' }] };
  const detail = facts({ latestTag: 'v0.12.0', product, catalog, copy });
  assert.match(detail, /headline: "New headline\." \(the card's tagline is "Old headline\."\)/);
  assert.match(detail, /description: "What it is\."/);
  assert.match(detail, /unqualified: cli-a, cli-b; planned: x\./);
  assert.match(detail, /role line: "Qualified on the CLIs\."/);
  assert.match(facts({ latestTag: 'v0.12.0', product: { headline: 'Old headline.' }, catalog: {}, copy }), /tagline matches it/);
});

test('the issue lists the problems, the facts and how to close it', () => {
  const decision = { status: 'behind', problems: ['one', 'two'] };
  const { title, body } = issue({ latestTag: 'v0.12.0', decision, facts: 'FACTS' });
  assert.equal(title, 'Agent Harness card is not current for v0.12.0');
  assert.match(body, /^- one\n- two\n\nFACTS\n\n\*\*To close:\*\*/);
  assert.match(body, /`reviewedFor` in `src\/data\/agent-harness\.review\.json` to `v0\.12\.0`/);
});

test('behind opens one issue or edits the open one; current closes them all', () => {
  const text = { title: 't', body: 'b' };
  assert.deepEqual(plan({ status: 'behind' }, [], text), [{ op: 'create', title: 't', body: 'b' }]);
  assert.deepEqual(plan({ status: 'behind' }, [{ number: 3 }], text), [{ op: 'edit', number: 3, title: 't', body: 'b' }]);
  assert.deepEqual(plan({ status: 'current', reason: 'r' }, [{ number: 3 }], text), [
    { op: 'close', number: 3, comment: 'Closed: r.' },
  ]);
  assert.deepEqual(plan({ status: 'current', reason: 'r' }, [], text), []);
});
