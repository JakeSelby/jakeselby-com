/** Shared across the homepage and project listing; support facts live in the reference catalog. */
export const agentHarness = {
  name: 'Agent Harness',
  tagline: 'The control plane for your coding agents, however you run them.',
  reason: 'I want my agents to work in ways I choose, with personal stances I can switch and custom primitives I can carry across model providers.',
  description: 'An open-source layer under the Claude Code and Codex you already run. It keeps your rules, skills, roles and stances in one place, projects them into each agent, enforces them with hooks, and tracks what every session did and spent.',
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
