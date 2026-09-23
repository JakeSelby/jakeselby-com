/** Shared across the homepage and project listing; support facts live in the reference catalog. */
export const agentHarness = {
  name: 'Agent Harness',
  tagline: 'Find out which of your agent rules actually fire.',
  reason: 'I want my agents to work in ways I choose, with personal stances I can switch and custom primitives I can carry across model providers.',
  description: 'An open-source layer over the Claude Code and Codex you already run. It keeps your rules, skills, roles and workflows in one place, makes every rule name a detector over the transcript or say why it can\'t have one, and shows how often each rule actually fired.',
  role: 'Built for the Claude Code and Codex CLIs, with Cursor and Grok adapters planned. Qualification status for each release is on the reference site.',
  brandColor: '#d97706',
  statusLabel: 'Open source',
  statusTone: 'beta' as const,
  stack: ['Custom primitives', 'Personal stances', 'Python', 'Markdown'],
  links: {
    app: { href: 'https://agent-harness.jakeselby.com', label: 'Reference and compatibility' },
    repo: { href: 'https://github.com/JakeSelby/agent-harness/releases/latest', label: 'Latest release' },
  },
};
