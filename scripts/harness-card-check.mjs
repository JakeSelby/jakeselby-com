#!/usr/bin/env node
// Keeps the Agent Harness card honest about the latest agent-harness release. The card carries
// no version literal (agent-harness-card.test.mjs), so no release makes it look stale, but a
// release can still make its copy wrong: a new headline, a changed support claim. This keeps one
// `release-drift` issue open until the copy has been reviewed against the latest release, that
// copy is live, and both placements resolve, then closes it. `reviewedFor` in
// src/data/agent-harness.review.json names the release the copy was last reviewed against.
// .github/workflows/harness-card.yml runs it; the decision and the issue text live here for the tests.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const HARNESS_REPO = 'JakeSelby/agent-harness';
export const RELEASE_LINK = 'https://github.com/JakeSelby/agent-harness/releases/latest';
export const PLACEMENTS = ['https://jakeselby.com/', 'https://jakeselby.com/projects/'];
export const COPY_FIELDS = ['tagline', 'reason', 'description', 'role'];
export const LABEL = 'release-drift';

const root = new URL('..', import.meta.url);

// The card's prose, read from the source the way agent-harness-card.test.mjs reads it.
export function cardCopy(source) {
  const copy = {};
  for (const [, key, value] of source.matchAll(/^\s+(\w+): '((?:[^'\\]|\\.)*)',?$/gm)) {
    if (COPY_FIELDS.includes(key)) copy[key] = value.replace(/\\(.)/g, '$1');
  }
  return copy;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function pageText(html) {
  return html.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
    if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? entity;
    const hex = name[1] === 'x' || name[1] === 'X';
    return String.fromCodePoint(hex ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
  });
}

// `placements` is [{ url, status, text }]: `status` null when the page could not be fetched,
// `text` its decoded HTML. Every piece of committed copy has to appear on at least one live page.
export function decide({ reviewedFor, latestTag, copy, placements }) {
  const problems = [];
  if (reviewedFor !== latestTag) {
    problems.push(`The copy was last reviewed for ${reviewedFor}; the latest release is ${latestTag}.`);
  }
  for (const { url, status, text } of placements) {
    if (status === null) problems.push(`${url} could not be fetched.`);
    else if (status !== 200) problems.push(`${url} answered ${status}.`);
    else if (!text.includes(RELEASE_LINK)) problems.push(`${url} does not link the latest release.`);
  }
  const live = placements.filter(({ status }) => status === 200).map(({ text }) => text);
  const missing = Object.keys(copy).filter((key) => !live.some((text) => text.includes(copy[key])));
  if (live.length && missing.length) {
    problems.push(`The live card lacks the committed ${missing.join(', ')}: main has copy that is not deployed.`);
  }
  if (problems.length) return { status: 'behind', problems };
  return { status: 'current', reason: `the card is reviewed for ${latestTag} and live on both placements` };
}

// What the reviewer needs from the release, beside the card's committed copy.
export function facts({ latestTag, product, catalog, copy }) {
  const byStatus = {};
  for (const client of catalog?.clients ?? []) (byStatus[client.status] ??= []).push(client.id);
  const statuses = Object.entries(byStatus).map(([status, ids]) => `${status}: ${ids.join(', ')}`);
  const tagline = copy.tagline === product.headline ? 'matches it' : `is "${copy.tagline}"`;
  return [
    `**What ${latestTag} says**`,
    '',
    `- \`product.json\` headline: "${product.headline}" (the card's tagline ${tagline}).`,
    `- \`product.json\` description: "${product.description}"`,
    `- Compatibility catalog: ${statuses.join('; ') || 'no clients listed'}.`,
    `- The card's role line: "${copy.role}"`,
  ].join('\n');
}

export function issue({ latestTag, decision, facts: detail }) {
  const lines = decision.problems.map((problem) => `- ${problem}`);
  if (detail) lines.push('', detail);
  lines.push(
    '',
    `**To close:** review \`src/data/agent-harness.ts\` against ${latestTag}, set \`reviewedFor\` in ` +
      `\`src/data/agent-harness.review.json\` to \`${latestTag}\`, merge, deploy, then dispatch the ` +
      '`harness card` workflow. It closes this issue once the card is current.',
  );
  return { title: `Agent Harness card is not current for ${latestTag}`, body: lines.join('\n') };
}

// One open issue while the card is behind, none once it is current.
export function plan(decision, open, text) {
  if (decision.status === 'behind') {
    return open.length ? [{ op: 'edit', number: open[0].number, ...text }] : [{ op: 'create', ...text }];
  }
  return open.map(({ number }) => ({ op: 'close', number, comment: `Closed: ${decision.reason}.` }));
}

// The issue text exists only for a card that is behind: a current decision has no problems to list.
export function actionsFor({ latestTag, decision, open, facts: detail }) {
  return plan(decision, open, decision.status === 'behind' ? issue({ latestTag, decision, facts: detail }) : {});
}

const gh = (args, input) =>
  execFileSync('gh', args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'inherit'] });
const ghJson = (args) => JSON.parse(gh(args));
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

async function fetchPage(url) {
  try {
    const response = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
    return { url, status: response.status, text: pageText(await response.text()) };
  } catch {
    return { url, status: null, text: '' };
  }
}

async function releaseFacts(latestTag, copy) {
  const raw = async (path) => {
    const response = await fetch(`https://raw.githubusercontent.com/${HARNESS_REPO}/${latestTag}/${path}`);
    if (!response.ok) throw new Error(`${path} answered ${response.status}`);
    return response.json();
  };
  try {
    const [product, catalog] = await Promise.all([raw('product.json'), raw('compatibility/catalog.json')]);
    return facts({ latestTag, product, catalog, copy });
  } catch (error) {
    return `**What ${latestTag} says** could not be read (${error.message}); see its release notes.`;
  }
}

function apply(site, actions) {
  for (const action of actions) {
    if (action.op === 'create') {
      gh(['label', 'create', LABEL, '-R', site, '--force', '--color', 'B60205',
        '--description', 'A live surface lags the latest agent-harness release']);
      gh(['issue', 'create', '-R', site, '--title', action.title, '--label', LABEL, '--body-file', '-'], action.body);
    } else if (action.op === 'edit') {
      gh(['issue', 'edit', String(action.number), '-R', site, '--title', action.title, '--body-file', '-'], action.body);
    } else if (action.op === 'close') {
      gh(['issue', 'close', String(action.number), '-R', site, '--comment', action.comment]);
    }
  }
}

// A card that is behind ends the run green with a warning: the issue is the signal, and a red
// run every six hours would only bury it in mail. A run that cannot read the card fails.
export async function main(argv, env = process.env) {
  const dryRun = argv.includes('--dry-run');
  const site = env.GH_REPO || 'JakeSelby/jakeselby-com';
  const copy = cardCopy(read('src/data/agent-harness.ts'));
  if (!Object.keys(copy).length) throw new Error('no card copy found in src/data/agent-harness.ts');
  const { reviewedFor } = JSON.parse(read('src/data/agent-harness.review.json'));
  const latestTag = ghJson(['api', `repos/${HARNESS_REPO}/releases/latest`]).tag_name;
  const placements = await Promise.all(PLACEMENTS.map(fetchPage));
  const decision = decide({ reviewedFor, latestTag, copy, placements });
  const open = ghJson(['issue', 'list', '-R', site, '--label', LABEL, '--state', 'open', '--json', 'number']);
  const detail = decision.status === 'behind' ? await releaseFacts(latestTag, copy) : '';
  const actions = actionsFor({ latestTag, decision, open, facts: detail });
  const summary = decision.status === 'behind'
    ? `behind: ${decision.problems.join(' ')}`
    : `current: ${decision.reason}`;
  console.log(decision.status === 'behind' ? `::warning::${summary}` : summary);
  for (const action of actions) {
    console.log(`${dryRun ? 'would ' : ''}${action.op}${action.number ? ` #${action.number}` : ''}` +
      (action.title ? `: ${action.title}` : ''));
  }
  if (dryRun && detail) console.log(detail);
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  if (!dryRun) apply(site, actions);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`✗ ${error.message}`);
      process.exit(1);
    },
  );
}
