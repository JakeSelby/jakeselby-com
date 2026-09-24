import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { RELEASE_LINK, SITE_LINK, actionsFor, decide, facts, issue, readmeFacts } from './ruleprobe-card-check.mjs';

const review = JSON.parse(readFileSync(new URL('../src/data/ruleprobe.review.json', import.meta.url), 'utf8'));

const copy = { tagline: 'Old headline.', role: 'Reads transcripts.' };
const links = `<a href="${RELEASE_LINK}">x</a><a href="${SITE_LINK}">y</a>`;
const page = (url, body, status = 200) => ({ url, status, text: `${links}${body}` });
const livePages = [page('https://a.test/', 'Old headline.'), page('https://a.test/projects/', 'Old headline. Reads transcripts.')];

test('the review file names the release the copy was last reviewed against', () => {
  assert.match(review.reviewedFor, /^v\d+\.\d+\.\d+$/);
});

test('the card is current when reviewed for the latest release, live and linked on both pages', () => {
  const decision = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.1.0', copy, placements: livePages });
  assert.equal(decision.status, 'current');
});

test('a release after the last review keeps the card behind', () => {
  const decision = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.2.0', copy, placements: livePages });
  assert.deepEqual(decision.problems, ['The copy was last reviewed for v0.1.0; the latest release is v0.2.0.']);
});

test('a placement missing the reference site link is behind, even with the release linked', () => {
  const placements = livePages.map((p, i) => (i ? p : { ...p, text: p.text.replace(SITE_LINK, '') }));
  const decision = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.1.0', copy, placements });
  assert.deepEqual(decision.problems, [`https://a.test/ does not link ${SITE_LINK}.`]);
});

test('a placement that fails or drops both links reports each', () => {
  const placements = [
    { url: 'https://a.test/', status: null, text: '' },
    { url: 'https://a.test/other/', status: 200, text: 'Old headline. Reads transcripts.' },
  ];
  const decision = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.1.0', copy, placements });
  assert.deepEqual(decision.problems, [
    'https://a.test/ could not be fetched.',
    'https://a.test/other/ does not link the latest release.',
    `https://a.test/other/ does not link ${SITE_LINK}.`,
  ]);
});

test('readmeFacts takes the line under the H1 and the lead paragraph after it', () => {
  const readme = '# ruleprobe\n\nFind out which rules fire.\n\nYou wrote rules.\nThis counts them.\n\n## Next\n\nMore.\n';
  assert.deepEqual(readmeFacts(readme), { tagline: 'Find out which rules fire.', lead: 'You wrote rules. This counts them.' });
  assert.deepEqual(readmeFacts('no heading'), { tagline: '', lead: '' });
});

test('the review facts carry the README tagline, lead and the role line', () => {
  const detail = facts({ latestTag: 'v0.1.0', readme: { tagline: 'New.', lead: 'Lead.' }, copy });
  assert.match(detail, /tagline: "New\." \(the card's tagline is "Old headline\."\)/);
  assert.match(detail, /lead: "Lead\."/);
  assert.match(detail, /role line: "Reads transcripts\."/);
  assert.match(facts({ latestTag: 'v0.1.0', readme: { tagline: 'Old headline.', lead: '' }, copy }), /tagline matches it/);
});

test('the issue is titled for this card and says how to close it', () => {
  const { title, body } = issue({ latestTag: 'v0.2.0', decision: { status: 'behind', problems: ['one'] }, facts: 'FACTS' });
  assert.equal(title, 'ruleprobe card is not current for v0.2.0');
  assert.match(body, /^- one\n\nFACTS\n\n\*\*To close:\*\*/);
  assert.match(body, /`reviewedFor` in `src\/data\/ruleprobe\.review\.json` to `v0\.2\.0`/);
  assert.match(body, /dispatch the `ruleprobe card` workflow/);
});

test('a current card closes its issue; a behind one opens one', () => {
  const decision = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.1.0', copy, placements: livePages });
  assert.deepEqual(actionsFor({ latestTag: 'v0.1.0', decision, open: [{ number: 4 }], facts: '' }), [
    { op: 'close', number: 4, comment: 'Closed: the card is reviewed for v0.1.0 and live on both placements.' },
  ]);
  const behind = decide({ reviewedFor: 'v0.1.0', latestTag: 'v0.2.0', copy, placements: livePages });
  assert.equal(actionsFor({ latestTag: 'v0.2.0', decision: behind, open: [], facts: 'F' })[0].op, 'create');
});
