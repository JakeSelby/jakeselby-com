#!/usr/bin/env node
// Keeps the ruleprobe card honest about the latest ruleprobe release, the way
// harness-card-check.mjs does for the Agent Harness card: one `release-drift` issue, titled for
// this card alone, stays open until the copy in src/data/ruleprobe.ts has been reviewed against
// the latest release (`reviewedFor` in src/data/ruleprobe.review.json), that copy is live, and
// both placements resolve and link the latest release and the reference site. The shared logic is
// in card-check.mjs; .github/workflows/ruleprobe-card.yml runs this.
import { pathToFileURL } from 'node:url';

import * as shared from './card-check.mjs';

export const RULEPROBE_REPO = 'JakeSelby/ruleprobe';
export const RELEASE_LINK = 'https://github.com/JakeSelby/ruleprobe/releases/latest';
export const SITE_LINK = 'https://ruleprobe.jakeselby.com';
export const TITLE_PREFIX = 'ruleprobe card is not current';

export function decide(args) {
  return shared.decide({ ...args, releaseLink: RELEASE_LINK, siteLink: SITE_LINK });
}

// The README's own pitch: the first line under the H1, then the paragraph after it.
export function readmeFacts(markdown) {
  const lines = markdown.split(/\r?\n/);
  let at = lines.findIndex((line) => /^# /.test(line));
  const paragraph = () => {
    while (at < lines.length && !lines[at].trim()) at += 1;
    const start = at;
    while (at < lines.length && lines[at].trim() && !/^#/.test(lines[at])) at += 1;
    return lines.slice(start, at).map((line) => line.trim()).join(' ');
  };
  if (at === -1) return { tagline: '', lead: '' };
  at += 1;
  const tagline = paragraph();
  return { tagline, lead: paragraph() };
}

// What the reviewer needs from the release, beside the card's committed copy.
export function facts({ latestTag, readme, copy }) {
  const tagline = copy.tagline === readme.tagline ? 'matches it' : `is "${copy.tagline}"`;
  return [
    `**What ${latestTag} says**`,
    '',
    `- \`README.md\` tagline: "${readme.tagline}" (the card's tagline ${tagline}).`,
    `- \`README.md\` lead: "${readme.lead}"`,
    `- The card's role line: "${copy.role}"`,
  ].join('\n');
}

async function releaseFacts(latestTag, copy, fetchImpl) {
  try {
    const readme = readmeFacts(await shared.rawFile(fetchImpl, RULEPROBE_REPO, latestTag, 'README.md'));
    return facts({ latestTag, readme, copy });
  } catch (error) {
    return `**What ${latestTag} says** could not be read (${error.message}); see its release notes.`;
  }
}

export const CARD = {
  productRepo: RULEPROBE_REPO,
  releaseLink: RELEASE_LINK,
  siteLink: SITE_LINK,
  dataFile: 'src/data/ruleprobe.ts',
  reviewFile: 'src/data/ruleprobe.review.json',
  titlePrefix: TITLE_PREFIX,
  workflow: 'ruleprobe card',
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
