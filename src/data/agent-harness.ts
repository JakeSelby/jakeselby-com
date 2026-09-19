/** Shared across the homepage and project listing; support facts live in the reference catalog. */
export const agentHarness = {
  name: 'Agent Harness',
  tagline: 'Your way of working, across AI agents.',
  reason: 'I want my agents to work in ways I choose, with personal stances I can switch and custom primitives I can carry across model providers.',
  description: 'A general-purpose, model-provider-agnostic harness built around the user. Shared rules, skills, roles, workflows and custom primitives make your working style portable. Personal stances turn preferences about delegation, testing, communication and autonomy into explicit switches you can change or extend without rewriting instructions.',
  role: 'Claude Code and Codex are supported integration targets. The reference compatibility catalog lists qualified clients and capability gaps; Cursor and Grok integrations are planned.',
  brandColor: '#d97706',
  statusLabel: 'Open source',
  statusTone: 'beta' as const,
  stack: ['Custom primitives', 'Personal stances', 'Python', 'Markdown'],
  links: {
    app: { href: 'https://agent-harness.jakeselby.com', label: 'Reference and compatibility' },
    repo: { href: 'https://github.com/JakeSelby/agent-harness', label: 'GitHub' },
  },
};
