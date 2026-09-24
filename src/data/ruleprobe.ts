/** Shared across the homepage and project listing; detector scores live on the reference site. */
export const ruleprobe = {
  name: 'ruleprobe',
  tagline: 'Find out which of your agent rules actually fire.',
  reason: 'I want to know which of my rules change what my agents do, counted from the transcripts they already write instead of guessed.',
  description: 'A small Python package that reads the transcripts Claude Code and Codex already write and counts the observable things your rules are meant to change. Standard library only, nothing leaves your machine, and every detector is scored against a labelled corpus.',
  role: 'Reads Claude Code and Codex session transcripts. How each detector scores against the corpus, release by release, is on the reference site.',
  brandColor: '#0d9488',
  statusLabel: 'Open source',
  statusTone: 'beta' as const,
  stack: ['Python', 'Standard library only', 'Claude Code', 'Codex'],
  links: {
    app: { href: 'https://ruleprobe.jakeselby.com', label: 'Reference' },
    repo: { href: 'https://github.com/JakeSelby/ruleprobe/releases/latest', label: 'Latest release' },
  },
};
