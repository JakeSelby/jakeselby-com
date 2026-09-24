#!/usr/bin/env node
// Keeps the Agent Harness card honest about the latest agent-harness release. The card carries
// no version literal (agent-harness-card.test.mjs), so no release makes it look stale, but a
// release can still make its copy wrong: a new headline, a changed support claim. This keeps one
// `release-drift` issue open until the copy has been reviewed against the latest release, that
// copy is live, and both placements resolve, then closes it. `reviewedFor` in
// src/data/agent-harness.review.json names the release the copy was last reviewed against.
// .github/workflows/harness-card.yml runs it. The decision, the issue text and the run are shared
// with the other cards in card-check.mjs; what is particular to this card lives here.
import { pathToFileURL } from 'node:url';

import * as shared from './card-check.mjs';

export { COPY_FIELDS, LABEL, PLACEMENTS, cardCopy, pageText, plan } from './card-check.mjs';

export const HARNESS_REPO = 'JakeSelby/agent-harness';
export const RELEASE_LINK = 'https://github.com/JakeSelby/agent-harness/releases/latest';
export const TITLE_PREFIX = 'Agent Harness card is not current';

export function decide(args) {
  return shared.decide({ ...args, releaseLink: RELEASE_LINK });
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

async function releaseFacts(latestTag, copy, fetchImpl) {
  const raw = async (path) => JSON.parse(await shared.rawFile(fetchImpl, HARNESS_REPO, latestTag, path));
  try {
    const [product, catalog] = await Promise.all([raw('product.json'), raw('compatibility/catalog.json')]);
    return facts({ latestTag, product, catalog, copy });
  } catch (error) {
    return `**What ${latestTag} says** could not be read (${error.message}); see its release notes.`;
  }
}

export const CARD = {
  productRepo: HARNESS_REPO,
  releaseLink: RELEASE_LINK,
  dataFile: 'src/data/agent-harness.ts',
  reviewFile: 'src/data/agent-harness.review.json',
  titlePrefix: TITLE_PREFIX,
  workflow: 'harness card',
  releaseFacts,
};

export function issue(args) {
  return shared.issue({ ...args, card: CARD });
}

export function actionsFor(args) {
  return shared.actionsFor({ ...args, card: CARD });
}

export function main(argv, env = process.env, io = {}) {
  return shared.run(CARD, argv, env, io);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) shared.cli(CARD);
