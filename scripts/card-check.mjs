// The release-drift check shared by every project card that shows a product release. A card
// carries no version literal, so no release makes it look stale, but a release can still make its
// copy wrong. Each check keeps one `release-drift` issue open until the copy has been reviewed
// against the latest release, that copy is live, and both placements resolve and link what they
// should, then closes it. Checks share the label, so each one reads and touches only the open
// issues whose title starts with its own prefix: one card's check never edits or closes another's.
//
// A card is described by an object:
//   productRepo   `owner/name` whose latest release the card shows
//   releaseLink   the link every placement must carry to that release
//   siteLink      optional; a link every placement must also carry
//   dataFile      the card's source, relative to the repository root
//   reviewFile    JSON naming, as `reviewedFor`, the release the copy was last reviewed against
//   titlePrefix   the start of this card's issue title; the title is `<prefix> for <tag>`
//   workflow      the workflow name the issue tells the reader to dispatch
//   releaseFacts  async (latestTag, copy, fetch) => markdown the reviewer needs from the release
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export const SITE_REPO = 'JakeSelby/jakeselby-com';
export const PLACEMENTS = ['https://jakeselby.com/', 'https://jakeselby.com/projects/'];
export const COPY_FIELDS = ['tagline', 'reason', 'description', 'role'];
export const LABEL = 'release-drift';
export const LABEL_DESCRIPTION = 'A live surface lags the latest release it shows';

const root = new URL('..', import.meta.url);

// The card's prose, read from the source the way the card tests read it.
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
export function decide({ reviewedFor, latestTag, copy, placements, releaseLink, siteLink }) {
  const problems = [];
  if (reviewedFor !== latestTag) {
    problems.push(`The copy was last reviewed for ${reviewedFor}; the latest release is ${latestTag}.`);
  }
  for (const { url, status, text } of placements) {
    if (status === null) problems.push(`${url} could not be fetched.`);
    else if (status !== 200) problems.push(`${url} answered ${status}.`);
    else {
      if (!text.includes(releaseLink)) problems.push(`${url} does not link the latest release.`);
      if (siteLink && !text.includes(siteLink)) problems.push(`${url} does not link ${siteLink}.`);
    }
  }
  const live = placements.filter(({ status }) => status === 200).map(({ text }) => text);
  const missing = Object.keys(copy).filter((key) => !live.some((text) => text.includes(copy[key])));
  if (live.length && missing.length) {
    problems.push(`The live card lacks the committed ${missing.join(', ')}: main has copy that is not deployed.`);
  }
  if (problems.length) return { status: 'behind', problems };
  return { status: 'current', reason: `the card is reviewed for ${latestTag} and live on both placements` };
}

export function issue({ latestTag, decision, facts: detail, card }) {
  const lines = decision.problems.map((problem) => `- ${problem}`);
  if (detail) lines.push('', detail);
  lines.push(
    '',
    `**To close:** review \`${card.dataFile}\` against ${latestTag}, set \`reviewedFor\` in ` +
      `\`${card.reviewFile}\` to \`${latestTag}\`, merge, deploy, then dispatch the ` +
      `\`${card.workflow}\` workflow. It closes this issue once the card is current.`,
  );
  return { title: `${card.titlePrefix} for ${latestTag}`, body: lines.join('\n') };
}

// The open `release-drift` issues that belong to this card; every other card's are left alone.
export function ownIssues(open, titlePrefix) {
  return open.filter(({ title }) => typeof title === 'string' && title.startsWith(titlePrefix));
}

// One open issue while the card is behind, none once it is current.
export function plan(decision, open, text) {
  if (decision.status === 'behind') {
    return open.length ? [{ op: 'edit', number: open[0].number, ...text }] : [{ op: 'create', ...text }];
  }
  return open.map(({ number }) => ({ op: 'close', number, comment: `Closed: ${decision.reason}.` }));
}

// The issue text exists only for a card that is behind: a current decision has no problems to list.
export function actionsFor({ latestTag, decision, open, facts: detail, card }) {
  return plan(decision, open, decision.status === 'behind' ? issue({ latestTag, decision, facts: detail, card }) : {});
}

export async function fetchPage(url, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(url, { headers: { 'cache-control': 'no-cache' } });
    return { url, status: response.status, text: pageText(await response.text()) };
  } catch {
    return { url, status: null, text: '' };
  }
}

// A file from the product repository at a tag, as text.
export async function rawFile(fetchImpl, repo, tag, path) {
  const response = await fetchImpl(`https://raw.githubusercontent.com/${repo}/${tag}/${path}`);
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.text();
}

export const runGh = (args, input) =>
  execFileSync('gh', args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'inherit'] });

export function apply(site, actions, gh = runGh) {
  for (const action of actions) {
    if (action.op === 'create') {
      gh(['label', 'create', LABEL, '-R', site, '--force', '--color', 'B60205', '--description', LABEL_DESCRIPTION]);
      gh(['issue', 'create', '-R', site, '--title', action.title, '--label', LABEL, '--body-file', '-'], action.body);
    } else if (action.op === 'edit') {
      gh(['issue', 'edit', String(action.number), '-R', site, '--title', action.title, '--body-file', '-'], action.body);
    } else if (action.op === 'close') {
      gh(['issue', 'close', String(action.number), '-R', site, '--comment', action.comment]);
    }
  }
}

const readFile = (path) => fs.readFileSync(new URL(path, root), 'utf8');

// A card that is behind ends the run green with a warning: the issue is the signal, and a red
// run every six hours would only bury it in mail. A run that cannot read the card fails.
// `io` replaces `gh`, `fetch`, `read` and `log` for the tests.
export async function run(card, argv, env = process.env, io = {}) {
  const { gh = runGh, fetch: fetchImpl = globalThis.fetch, read = readFile, log = console.log } = io;
  const ghJson = (args) => JSON.parse(gh(args));
  const dryRun = argv.includes('--dry-run');
  const site = env.GH_REPO || SITE_REPO;
  const copy = cardCopy(read(card.dataFile));
  if (!Object.keys(copy).length) throw new Error(`no card copy found in ${card.dataFile}`);
  const { reviewedFor } = JSON.parse(read(card.reviewFile));
  const latestTag = ghJson(['api', `repos/${card.productRepo}/releases/latest`]).tag_name;
  const placements = await Promise.all(PLACEMENTS.map((url) => fetchPage(url, fetchImpl)));
  const decision = decide({
    reviewedFor, latestTag, copy, placements, releaseLink: card.releaseLink, siteLink: card.siteLink,
  });
  const listed = ghJson(['issue', 'list', '-R', site, '--label', LABEL, '--state', 'open', '--json', 'number,title']);
  const open = ownIssues(listed, card.titlePrefix);
  const detail = decision.status === 'behind' ? await card.releaseFacts(latestTag, copy, fetchImpl) : '';
  const actions = actionsFor({ latestTag, decision, open, facts: detail, card });
  const summary = decision.status === 'behind'
    ? `behind: ${decision.problems.join(' ')}`
    : `current: ${decision.reason}`;
  log(decision.status === 'behind' ? `::warning::${summary}` : summary);
  for (const action of actions) {
    log(`${dryRun ? 'would ' : ''}${action.op}${action.number ? ` #${action.number}` : ''}` +
      (action.title ? `: ${action.title}` : ''));
  }
  if (dryRun && detail) log(detail);
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  if (!dryRun) apply(site, actions, gh);
  return 0;
}

// The entry point both check scripts share.
export function cli(card) {
  run(card, process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`✗ ${error.message}`);
      process.exit(1);
    },
  );
}
