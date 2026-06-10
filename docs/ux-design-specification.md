---
stepsCompleted: [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
inputDocuments: [plan, resume, cortex-pitch, consul-pitch, groundwork-pitch]
project: jakeselby.com
author: Jake Selby
date: 2026-06-09
---

# UX Design Specification — jakeselby.com

---

## 1. Executive Summary

### Project Vision and Positioning

jakeselby.com is a personal branded landing site for Jake Selby — Vice President of Engineering at Arcadia and solo builder of production agentic-AI systems. The site's spine is a rare duality: **the engineer who leads *and* builds**. Jake ran a 48-person org through the CareJourney → Arcadia acquisition *while* solo-shipping three live products (Cortex, Consul, Groundwork). The site doesn't argue this point — it demonstrates it. Every design decision reinforces quiet confidence and building credibility.

The positioning is explicitly *not* a portfolio in the traditional agency-creative sense. It is closer to how senior technical founders present themselves: direct, substantive, no fluff. Patrick Collison's personal site, Guillermo Rauch's rauchg.com, and Lee Robinson's leerob.io are the aesthetic north stars — sites where the person's work does the talking and the design gets out of the way.

### Target Audience

| Visitor type | What they want | Where they land |
|---|---|---|
| **Recruiters / Boards** (VPE, CTO roles) | Validate leadership pedigree and technical depth at a glance | `/` hero → `/resume` |
| **Investors / technical partners** considering building on Cortex or Consul | Understand the product thesis and Jake's builder credibility | `/` → `/projects` → project pitches |
| **Civic-tech / political-org contacts** interested in Groundwork | Evaluate the platform and the builder's intent | `/projects` → Groundwork demo |
| **Peer engineers / builder community** | Peer curiosity: what is this person building? | `/projects` |
| **Conference/speaking context** — people googling after meeting Jake | Confirm identity, connect on LinkedIn/GitHub | `/` footer |

### Key Design Principles

1. **Typography carries the weight.** The aesthetic is text-first. A well-chosen font pair, tight spacing, and careful hierarchy do more than any illustration or gradient.
2. **Projects are identity.** Three production live products are the most distinctive thing about Jake. They surface high (above the fold on desktop), carry their own brand colors, and link out to live pitches — not just GitHub repos.
3. **Confidence without performance.** No hero animations, no scroll-jacking, no particle backgrounds. The site loads fast, renders instantly, and gets out of the way. Speed is a design statement.
4. **Scannable at every scale.** A recruiter spending 30 seconds and a curious engineer spending 5 minutes should both leave with the same mental model. Every section has a clear one-sentence purpose.
5. **Coherent but not uniform.** The personal base palette is consistent across pages. Project cards break from the base with their own brand accents — reinforcing that each project has its own identity while living under a single builder's roof.

### Success Criteria

- A visitor landing on `/` can understand Jake's identity, current role, and that he ships live products — within 10 seconds, without scrolling on a 1280px viewport.
- The three project cards are distinguishable by brand color, each link to a live app *and* a pitch/demo, and include stack context.
- The `/resume` page is print-friendly and produces a clean single-page or two-page PDF via `Cmd+P` with no nav chrome.
- Lighthouse performance score ≥ 95 on desktop; ≥ 90 on mobile (Astro static output helps baseline this).
- WCAG AA color contrast compliance on all text/background pairs.
- Zero JavaScript required for any content — Astro island architecture; interactive enhancements (PDF button) are progressive.

---

## 2. Information Architecture

### Site Map

```
jakeselby.com/
├── /                   Home
│   ├── Nav
│   ├── Hero            Name + one-line identity statement
│   ├── Currently       Single-line role/focus signal
│   ├── About           2–3 sentence paragraph
│   ├── Projects        3-card preview grid
│   └── Footer          Links (email, LinkedIn, GitHub)
│
├── /resume             Full résumé
│   ├── Nav
│   ├── PDF Download    Sticky or top-of-content button
│   ├── Resume Content  Chronological, section-by-section
│   └── Footer (minimal — hidden on print)
│
└── /projects           Project directory
    ├── Nav
    ├── Page Hero       "Things I'm Building"
    ├── Card Grid       3 rich project cards (full detail)
    └── Footer
```

### Navigation Structure

The nav is minimal — three links plus an optional email shortcut. No dropdowns, no mega-menus.

```
[Jake Selby]    ·    Projects    Resume    ↗ jaketselby@gmail.com
```

- **Left:** Name as home link (text, not logo)
- **Right:** `Projects` | `Resume` | email icon-link (aria-label "Email Jake")
- Active state: current page link underlined with accent color
- Mobile: name left, hamburger right → drawer with same links stacked

### Content Hierarchy Per Page

#### Home (`/`)

```
H1  Jake Selby
    [subtitle: VP Engineering · Arcadia]
    [one-line identity: "The engineer who leads and builds."]

H2  Currently
    [single paragraph / line]

    [2–3 sentence bio paragraph — no heading]

H2  Projects
    [ProjectCard: Cortex]
    [ProjectCard: Consul]
    [ProjectCard: Groundwork]

    [footer links — no heading]
```

**Copy guidance — Home:**
- H1 must be `Jake Selby` (exact, for SEO and clarity)
- Subtitle: role + company in muted text, same line or immediately below
- Identity line: one sentence that earns the right to the name. Candidate: *"Engineering leader who builds: 48-person org, three live products, agentic AI since day one."*
- "Currently" section should be honest and specific. Not "I'm passionate about…" — e.g.: *"Currently: VPE at Arcadia (48 engineers) and building Cortex, an ambient agentic-AI cognitive substrate."*
- Bio: 2–3 sentences max. Should cover: acquisition arc (CareJourney→Arcadia), builder credibility (live products), technical breadth (LLMs since 2022). Do not reproduce the resume summary verbatim — tighten it.

#### Resume (`/resume`)

```
H1  Jake Selby
    [Title line: Vice President of Engineering · Arcadia]
    [Contact: email · LinkedIn · GitHub]

H2  Summary
    [prose paragraph]

H2  Experience
    H3  [Company] — [Role]  [Date range]
        [bullets]

H2  Skills
    [tag groups or flat list]

H2  Education
    H3  [Degree · School · Year]
```

**Copy guidance — Resume:**
- H1 stays `Jake Selby` — do not replace with "Resume" or "CV"
- Contact line renders as plain text on print, clickable links on screen
- Section headings (`H2`) use a small-caps or tracked uppercase treatment to visually separate from body copy

#### Projects (`/projects`)

```
H1  Projects
    [Subtitle: "Things I build on the side — three production systems,
     each solving a real problem."]

H2  Cortex         [ProjectCard — full detail]
H2  Consul         [ProjectCard — full detail]
H2  Groundwork     [ProjectCard — full detail]
```

**Copy guidance — Projects:**
- H1: `Projects` (clean, direct)
- Subtitle: one sentence that contextualizes the work — emphasize "production," "solo-built," and the diversity (AI substrate · EA · civic-tech)
- Each project H2 is the project name. The card body carries all detail.

---

## 3. Design System Foundation

### Design System Choice

**Custom design tokens + Tailwind CSS v4 utility classes. No component library (Mantine, Radix, shadcn) for this site.**

Rationale: A component library built for applications introduces visual and bundle overhead that conflicts with the "austere clarity" aesthetic. A personal site needs fewer than 10 distinct component types. Tailwind v4's native CSS variable integration means tokens defined in `@theme` are available as utilities (`text-foreground`, `bg-surface`, etc.) with zero runtime cost. This keeps the implementation fast and the design vocabulary entirely in our control.

---

### Color Palette

#### Personal Base Palette (Light Mode)

All values are CSS custom properties defined in the Tailwind v4 `@theme` block or `globals.css`.

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#FAFAF9` | Page background (warm white, not pure) |
| `--color-surface` | `#F5F4F2` | Card backgrounds, code block backgrounds |
| `--color-surface-raised` | `#FFFFFF` | Floating elements, hover-lift cards |
| `--color-border` | `#E5E2DE` | Dividers, card borders, input borders |
| `--color-border-subtle` | `#EEECE9` | Very subtle dividers (between resume sections) |
| `--color-text-primary` | `#18181B` | Headings, primary body copy |
| `--color-text-secondary` | `#52525B` | Subtitles, meta, supporting copy |
| `--color-text-muted` | `#A1A1AA` | Timestamps, placeholder text, disabled states |
| `--color-accent` | `#3B3B3B` | Personal accent — dark charcoal (underlines, focus rings, active nav) |
| `--color-accent-hover` | `#000000` | Accent on hover |

**Rationale for warm-off-white background:** Pure `#FFFFFF` reads clinical. `#FAFAF9` (warm stone-ish off-white) creates a paper-like quality that suits the typography-forward approach and references printed matter — which connects to the resume context.

#### Project Brand Accent Colors (used only on ProjectCard components)

| Project | Token | Hex | Usage |
|---|---|---|---|
| Cortex | `--color-cortex` | `#60a5fa` | Card left-border accent, tag underline, link hover |
| Consul | `--color-consul` | `#1E3A8A` | Card left-border accent, tag underline, link hover |
| Groundwork | `--color-groundwork` | `#2D6A4F` | Card left-border accent, tag underline, link hover |

**Critical constraint:** These exact hex values MUST be preserved. They are defined in each project's brand identity and appear in the live production apps.

#### Contrast Ratios (verify before shipping)

| Pair | Ratio requirement |
|---|---|
| `text-primary` (#18181B) on `background` (#FAFAF9) | Must ≥ 7:1 (AAA) |
| `text-secondary` (#52525B) on `background` (#FAFAF9) | Must ≥ 4.5:1 (AA) |
| `text-muted` (#A1A1AA) on `background` (#FAFAF9) | Decorative only — never use for meaningful text |
| Cortex blue `#60a5fa` as text on `background` | Do NOT use as text color — use as border/decoration only |
| Consul navy `#1E3A8A` as text on `surface-raised` (#FFFFFF) | Acceptable for short labels (check: ≥ 4.5:1) |
| Groundwork green `#2D6A4F` as text on `surface-raised` (#FFFFFF) | Check ≥ 4.5:1 |

---

### Typography

#### Font Family Choices

| Role | Family | Source | Rationale |
|---|---|---|---|
| **Display / Headings** | Bricolage Grotesque | Google Fonts | Confident, slightly quirky variable grotesque. Anchors the personal brand. Used in Consul — keeps Jake's products visually coherent. |
| **Body / UI** | IBM Plex Sans | Google Fonts | Humanist sans-serif with technical credibility. Excellent at small sizes. Used in Cortex + Consul projects. |
| **Monospace / Code** | IBM Plex Mono | Google Fonts | Matches IBM Plex Sans; used for stack pills, code snippets in resume |

Load strategy: Use `font-display: swap`. Subset via Google Fonts `&display=swap&subset=latin`. Only load weights actually used (see below).

```css
/* globals.css — font import */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

#### Type Scale

Using Tailwind v4 `@theme` to define a consistent scale. All values in `rem` (base 16px).

| Token | rem | px equiv | Usage |
|---|---|---|---|
| `--text-xs` | `0.75rem` | 12px | Stack pills, status badges, fine print |
| `--text-sm` | `0.875rem` | 14px | Meta text, date ranges, footer links |
| `--text-base` | `1rem` | 16px | Body copy, bullet points |
| `--text-lg` | `1.125rem` | 18px | Lead paragraph, card taglines |
| `--text-xl` | `1.25rem` | 20px | Card titles, resume section subtitles |
| `--text-2xl` | `1.5rem` | 24px | Resume H2 section headings |
| `--text-3xl` | `1.875rem` | 30px | Page H1 subtitles, `/projects` H1 |
| `--text-4xl` | `2.25rem` | 36px | Home H1 name on tablet |
| `--text-5xl` | `3rem` | 48px | Home H1 name on desktop |

#### Weight Usage

| Weight | Usage |
|---|---|
| 400 (Regular) | All body copy, bullets, meta |
| 500 (Medium) | Card taglines, nav links, "Currently" value |
| 600 (SemiBold) | Card titles, resume role titles, H3 |
| 700 (Bold) | H1 name (home), page H1s, resume company names |

#### Line Height and Letter Spacing

```css
/* Heading track: tighter for large sizes */
--leading-display: 1.1;    /* H1 at 5xl */
--leading-heading: 1.2;    /* H2–H3 */
--leading-body: 1.65;      /* Body copy */
--leading-tight: 1.3;      /* Card taglines, lead */

/* Letter spacing */
--tracking-tight: -0.02em;  /* Display headings */
--tracking-normal: 0;        /* Body */
--tracking-wide: 0.06em;    /* All-caps labels (section dividers, badge text) */
```

---

### Spacing Scale

Tailwind's default spacing scale is used directly. Key values for layout:

| Usage | Value |
|---|---|
| Body max-width | `768px` (prose), `1024px` (page container) |
| Section vertical padding | `py-16` (4rem) desktop, `py-10` (2.5rem) mobile |
| Card padding | `p-6` (1.5rem) |
| Between cards (gap) | `gap-6` (1.5rem) |
| Nav height | `56px` (3.5rem) |
| Footer padding | `py-8` (2rem) |

---

### Border Radius, Shadow, Transition Tokens

```css
/* Border radius */
--radius-sm: 4px;    /* Stack pills, badges */
--radius-md: 8px;    /* Project cards */
--radius-lg: 12px;   /* (reserved for modals/drawers if added) */

/* Shadows */
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);
--shadow-card-hover: 0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06);
/* No dramatic drop shadows — subtle elevation only */

/* Transitions */
--transition-fast: 120ms ease;    /* Color/opacity changes */
--transition-base: 200ms ease;    /* Hover lift, border color */
--transition-slow: 300ms ease;    /* Page fade (View Transitions) */
```

---

## 4. Page Layouts

### 4.1 Home (`/`)

#### Overall Layout

Single-column content, centered, max-width `768px` for text content, `1024px` for card grid. Page background: `--color-background`.

```
┌─────────────────────────────────────────────────────┐
│ [Nav]                                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Hero]                                             │
│    H1: Jake Selby                                   │
│    Sub: VP Engineering · Arcadia                    │
│    [identity line]                                  │
│                                                     │
│  [Currently]                                        │
│    Currently: [value]                               │
│                                                     │
│  [About — 2–3 sentences, no heading]                │
│                                                     │
│  [Projects heading]                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │Cortex  │  │Consul  │  │Gndwrk  │                │
│  └────────┘  └────────┘  └────────┘                │
│                 [View all projects →]               │
│                                                     │
│  [Footer]                                           │
└─────────────────────────────────────────────────────┘
```

#### Navigation (SiteNav)

- **Position:** sticky top (`position: sticky; top: 0`) with `backdrop-blur-sm` and a very thin bottom border (`1px solid --color-border-subtle`) that appears on scroll.
- **Background:** `background-color: rgb(250 250 249 / 0.92)` — matches page background at 92% opacity for the blur effect.
- **Height:** 56px
- **Content:**
  - Left: `Jake Selby` in IBM Plex Sans 500, links to `/`
  - Right: `Projects` · `Resume` · email icon (↗ icon, 16px)
- **Active state:** current route link gets a bottom border in `--color-accent` (2px)
- **Mobile (< 640px):** Name left, hamburger right. On tap: slide-down drawer (not full overlay — drawer max-height ~200px, contains the same three links stacked, 48px touch targets).

#### Hero Section

- **Vertical padding:** `pt-20 pb-8` (desktop), `pt-14 pb-6` (mobile)
- **H1:** `Jake Selby` — Bricolage Grotesque 700, `text-5xl` desktop / `text-4xl` mobile, `tracking-tight`, `leading-display`, color `text-primary`
- **Subtitle line:** `Vice President of Engineering · Arcadia` — IBM Plex Sans 400, `text-base`, color `text-secondary`, rendered immediately below H1 with `mt-1`
- **Identity line:** Single sentence in IBM Plex Sans 400, `text-lg`, color `text-secondary`, `mt-3`. No decorative element, no quote marks. This line should not be bold — it earns attention by being measured, not loud.
  - Candidate copy: *"Engineering leader who helped build CareJourney from employee #7 through acquisition — now running 48 engineers at Arcadia while building agentic-AI products on the side."*
- **No decorative image, avatar, or background graphic in the hero.** The name is the visual anchor.

#### "Currently" Section

- **Vertical padding:** `py-4`
- **Border:** top `1px solid --color-border-subtle`
- **Format:** `Currently` label in IBM Plex Sans 500, `text-sm`, `tracking-wide`, uppercase, `text-muted` — followed by the value on the same line (or new line on mobile) in IBM Plex Sans 400, `text-base`, `text-secondary`.
- **Copy:** *"VPE at Arcadia (48 engineers) · Building Cortex, an ambient agentic-AI cognitive substrate in production."*
- **Rationale:** The "Currently" pattern (popularized by /now pages and adopted by leerob.io) signals that the site is maintained and anchors visitors in Jake's present state — not just past achievements.

#### About Paragraph

- **No section heading** — flows naturally after "Currently"
- **Vertical padding:** `py-6`
- **Typography:** IBM Plex Sans 400, `text-base`, `leading-body`, `text-secondary`, max-width `65ch`
- **Copy (draft):** *"I joined CareJourney as employee #7, built the production data platform, and led engineering through its acquisition by Arcadia in July 2024. Now I run a 48-person org while solo-shipping production agentic-AI systems — Cortex (cognitive substrate), Consul (EA), and Groundwork (civic field-ops). I've been building with LLMs since ChatGPT launched; agent-first ever since."*

#### Projects Preview Section

- **Section heading:** `Projects` — Bricolage Grotesque 600, `text-2xl`, `text-primary`, `mb-6`
- **Border:** top `1px solid --color-border` with `pt-10`
- **Grid layout:**
  - Desktop (≥ 1024px): 3 columns (`grid-cols-3 gap-6`)
  - Tablet (640–1023px): 2 columns (`grid-cols-2 gap-5`) — Groundwork wraps to second row, centered or left-aligned
  - Mobile (< 640px): 1 column (`grid-cols-1 gap-4`)
- **Card variant on home:** Compact — tagline + status badge + primary CTA link + stack pills (max 3). No full description paragraph. See Section 5 for full `ProjectCard` anatomy.
- **"View all projects" link:** right-aligned, `text-sm`, IBM Plex Sans 500, `text-accent`, underline on hover, arrow icon `→` (16px Lucide `ArrowRight`)

#### Footer

- **Border:** top `1px solid --color-border`
- **Padding:** `py-8`
- **Layout:** single row, flex, space-between on desktop; stacked on mobile
- **Left:** `© 2026 Jake Selby` in `text-sm text-muted`
- **Right:** three icon-text links — Email (`Mail` icon), LinkedIn (`Linkedin` icon), GitHub (`Github` icon) — each 16px Lucide icon + label, `text-sm text-secondary`, gap-4 between them
- **Hover:** text transitions to `text-primary` at `--transition-fast`

---

### 4.2 Resume (`/resume`)

#### Overall Layout

Constrained single-column prose. Content max-width `768px`, centered. This intentionally matches the resume reader's expectation of a document — not a web app.

```
┌─────────────────────────────────────────────────────┐
│ [Nav — hidden on print]                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [PDF Download button — top right of content]       │
│                                                     │
│  H1: Jake Selby                                     │
│  [Vice President of Engineering · Arcadia]          │
│  [email · linkedin · github]                        │
│                                                     │
│  ── Summary ──────────────────────────────────────  │
│  [prose]                                            │
│                                                     │
│  ── Experience ────────────────────────────────────  │
│  [ResumeSection × N]                                │
│                                                     │
│  ── Skills ────────────────────────────────────────  │
│  [tag groups]                                       │
│                                                     │
│  ── Education ─────────────────────────────────────  │
│  [entry]                                            │
│                                                     │
│  [Footer — hidden on print]                         │
└─────────────────────────────────────────────────────┘
```

#### PDF Download Button

- **Position:** Fixed sticky bar at top of content area (below nav), right-aligned. On scroll past the H1, this button becomes a floating fixed-position button in the bottom-right corner (`fixed bottom-6 right-6 z-50`).
- **Label:** `Download PDF` with `Download` Lucide icon (16px)
- **Behavior:** Triggers `window.print()` with a `@media print` stylesheet that hides nav, footer, and the button itself. The browser's native print-to-PDF produces a clean output.
- **Style:** IBM Plex Sans 500, `text-sm`, background `--color-accent` (`#3B3B3B`), text white, `rounded-md`, `px-4 py-2`. On hover: background `--color-accent-hover` (`#000000`).
- **Print note:** `@media print` sets `@page { size: A4; margin: 1.5cm; }`. Nav and footer set to `display: none`. The download button itself: `display: none`.

#### H1 and Contact Header

- **H1:** `Jake Selby` — Bricolage Grotesque 700, `text-4xl`, `tracking-tight`
- **Title line:** `Vice President of Engineering · Arcadia` — IBM Plex Sans 400, `text-lg`, `text-secondary`, `mt-1`
- **Contact row:** email · LinkedIn · GitHub as inline links, `text-sm`, `text-secondary`, `gap-3` with `·` separators, `mt-2`

#### Section Order and Heading Treatment

Section headings (`H2`) use: IBM Plex Sans 600, `text-xs`, `tracking-wide`, uppercase, `text-muted` — with a full-width `1px solid --color-border` rule below and `mb-4 mt-10`.

This treatment makes sections scannable without competing with the job title H3s.

Experience entry structure (`ResumeSection`):
```
[Company Name] — [Role Title]    [Date Range]
[Location if relevant]
• Bullet
• Bullet
```

- Company: IBM Plex Sans 700, `text-base`, `text-primary`
- Role: IBM Plex Sans 500, `text-base`, `text-secondary` (same line, separated by `·`)
- Date range: IBM Plex Sans 400, `text-sm`, `text-muted`, right-aligned (flex row, space-between)
- Bullets: IBM Plex Sans 400, `text-base`, `text-secondary`, `leading-body`, `ml-4`

#### Print Media Requirements

```css
@media print {
  /* Hide chrome */
  nav, footer, .pdf-download-btn { display: none !important; }

  /* Remove background colors for ink */
  body { background: white !important; }
  .resume-card, .resume-section { box-shadow: none !important; border: none !important; }

  /* Page setup */
  @page { size: A4; margin: 1.5cm 1.8cm; }

  /* Prevent orphaned headings */
  h2, h3 { page-break-after: avoid; }

  /* Keep experience entries together where possible */
  .resume-entry { page-break-inside: avoid; }

  /* Link URLs visible in print */
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.75rem; color: #666; }
  a[href^="mailto"]::after { content: none; } /* Don't repeat email */
}
```

---

### 4.3 Projects (`/projects`)

#### Overall Layout

Page max-width `1024px`, centered. Card grid fills the width.

```
┌─────────────────────────────────────────────────────┐
│ [Nav]                                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  H1: Projects                                       │
│  [subtitle — one sentence]                          │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  [ProjectCard — Cortex — full detail]          │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  [ProjectCard — Consul — full detail]          │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  [ProjectCard — Groundwork — full detail]      │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  [Footer]                                           │
└─────────────────────────────────────────────────────┘
```

#### Page Hero

- **H1:** `Projects` — Bricolage Grotesque 700, `text-4xl`, `tracking-tight`, `text-primary`
- **Subtitle:** IBM Plex Sans 400, `text-lg`, `text-secondary`, `mt-2`, max-width `55ch`
  - Copy: *"Three production systems, each solving a real problem. Solo-built, spec-driven, live."*
- **Padding:** `pt-16 pb-10`

#### Card Grid on `/projects`

On the full projects page, cards are **stacked vertically** (single column, full-width cards), not a grid. This allows richer card content (full description, both links, all stack pills) without cramping.

Desktop card width: full content column (`max-w-3xl` = `768px`), centered.

Each card is separated by `mb-6`.

#### Full `ProjectCard` Anatomy (`/projects` variant)

```
┌─[left accent bar: 4px, project brand color]───────────────────────────┐
│                                                                         │
│  [Project Name]  H2  +  [StatusBadge]              [right-align links] │
│  [Tagline]  — IBM Plex Sans 500, text-lg, text-secondary               │
│                                                                         │
│  [Description paragraph — 2–4 sentences]                               │
│                                                                         │
│  Role: [Jake's role — 1 sentence]                                       │
│                                                                         │
│  Stack: [StackPill] [StackPill] [StackPill] ...                        │
│                                                                         │
│  [ExternalLink: App →]  [ExternalLink: Pitch →]                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Card structural details:**

- **Left accent bar:** `4px` wide, full card height, positioned `absolute left-0 top-0 bottom-0`, color = project brand color. Card has `relative overflow-hidden` + `pl-6` to clear the bar.
- **Background:** `--color-surface-raised` (`#FFFFFF`)
- **Border:** `1px solid --color-border`, `border-radius: --radius-md`
- **Shadow:** `--shadow-card`, transitions to `--shadow-card-hover` on hover
- **Hover lift:** `transform: translateY(-2px)` at `--transition-base`
- **Project name (H2 on `/projects` page):** Bricolage Grotesque 600, `text-xl`, `text-primary`
- **Tagline:** IBM Plex Sans 500, `text-lg`, `text-secondary`, `mt-1`
- **Description:** IBM Plex Sans 400, `text-base`, `leading-body`, `text-secondary`, `mt-3`
- **Role attribution:** Prefixed with `Role:` in IBM Plex Sans 500, `text-sm`, `text-secondary`, `mt-3`
- **Stack pills:** `flex flex-wrap gap-2 mt-4` — see `StackPill` component
- **Link row:** `flex gap-4 mt-5 pt-4 border-t border-[--color-border]`

**StatusBadge placement:** inline with H2, right side of name row (flex space-between).

**Compact variant (used on home `/` preview):**
- No description paragraph
- No role attribution line
- Max 3 stack pills
- Single CTA link (primary link — App)
- Same left accent bar and hover behavior

---

## 5. Component Inventory

### `SiteNav`

**Purpose:** Persistent top navigation across all pages.

**Props:**
```typescript
interface SiteNavProps {
  currentPath: string; // e.g. "/", "/projects", "/resume"
}
```

**Variants:** Default (transparent, no scroll), Scrolled (with backdrop blur + border)

**States:**
- Default: clean, no border
- Scrolled (via `IntersectionObserver` on a sentinel div at top): `border-b border-[--color-border-subtle]` + backdrop blur
- Mobile: hamburger open / closed

**Accessibility:**
- `<nav>` landmark with `aria-label="Main navigation"`
- Active link: `aria-current="page"`
- Hamburger button: `aria-expanded`, `aria-controls="mobile-menu"`, `aria-label="Open navigation menu"` / `"Close navigation menu"`
- Mobile menu: `id="mobile-menu"`, `role="dialog"`, `aria-modal="true"` if full overlay (drawer is fine without `role="dialog"`)

---

### `SiteFooter`

**Purpose:** Consistent footer with contact links.

**Props:** None (static content)

**Variants:** Full (home, projects), Print-hidden (resume)

**Accessibility:**
- `<footer>` landmark with `aria-label="Site footer"`
- Each link: descriptive `aria-label` (e.g. `aria-label="Email Jake Selby"`, `aria-label="Jake Selby on LinkedIn"`)

---

### `ProjectCard`

**Purpose:** Visual unit representing a project — used in compact form on home, full form on `/projects`.

**Props:**
```typescript
interface ProjectCardProps {
  name: string;
  tagline: string;
  description?: string;        // Full form only
  role?: string;               // Full form only ("Solo-built. ...")
  brandColor: string;          // hex — MUST match brand: Cortex #60a5fa, Consul #1E3A8A, Groundwork #2D6A4F
  status: "live" | "staging" | "donating";
  stack: string[];             // tech tags
  links: {
    app: { href: string; label: string };
    pitch?: { href: string; label: string };
  };
  variant: "compact" | "full";
}
```

**States:**
- Default
- Hover: shadow elevation + 2px Y lift + left border color subtly brightens (filter: brightness(1.1))
- Focus-visible: `outline: 2px solid --color-accent; outline-offset: 2px`

**Accessibility:**
- Card is NOT a `<a>` wrapper (multiple internal links). Use `<article>` element.
- Card title is a heading (`<h2>` on `/projects` page, `<h3>` on home page)
- External links have `target="_blank" rel="noopener noreferrer"` with visually-hidden " (opens in new tab)" text for screen readers

---

### `ResumeSection`

**Purpose:** Wraps a single experience entry on the resume.

**Props:**
```typescript
interface ResumeSectionProps {
  company: string;
  role: string;
  dateRange: string;
  location?: string;
  bullets: string[];
}
```

**Variants:** Experience (above), Education (simplified — no bullets, just institution + degree + year)

**States:** None (static)

**Accessibility:**
- Each entry wrapped in `<article>` or `<section>` with appropriate role
- Date ranges use `<time>` element with machine-readable `dateTime` attribute where possible

---

### `StackPill`

**Purpose:** Displays a technology name as a tag/badge within a ProjectCard.

**Props:**
```typescript
interface StackPillProps {
  label: string;
  accentColor?: string; // optional — if provided, bottom border uses project brand color
}
```

**Variants:**
- Default: neutral (`bg-surface`, `text-secondary`, `border border-border`)
- Accented: adds `border-b-2` in project brand color

**Dimensions:** `px-2.5 py-0.5`, `rounded-sm` (`--radius-sm`), `text-xs`, IBM Plex Mono 400

**States:** Static (no hover) — pills are decorative/informational, not interactive.

**Accessibility:** None beyond semantic rendering in a `<ul>` with `<li>` items. The list should have `aria-label="Tech stack"`.

---

### `StatusBadge`

**Purpose:** Communicates project maturity / deployment state.

**Props:**
```typescript
interface StatusBadgeProps {
  status: "live" | "staging" | "donating";
}
```

**Variants and visual treatment:**

| Status | Label | Colors |
|---|---|---|
| `live` | Live | `bg-emerald-50 text-emerald-700 border border-emerald-200` |
| `staging` | Staging | `bg-amber-50 text-amber-700 border border-amber-200` |
| `donating` | Donating | `bg-blue-50 text-blue-700 border border-blue-200` |

**Dimensions:** `px-2 py-0.5`, `rounded-sm`, `text-xs`, IBM Plex Sans 500, `tracking-wide`

**States:** Static

**Accessibility:** `role="status"` if status is dynamic; if static, plain text is fine. Include a visually-hidden prefix: *"Project status:"* for screen reader context.

---

### `ExternalLink`

**Purpose:** Consistent treatment for links that open external sites. Used in project cards and footer.

**Props:**
```typescript
interface ExternalLinkProps {
  href: string;
  label: string;
  icon?: "arrow-up-right" | "external-link"; // Lucide icon name
  variant?: "default" | "button-ghost";
}
```

**Variants:**
- `default`: inline text link, `text-secondary`, IBM Plex Sans 500, underline on hover, `ArrowUpRight` icon (12px) inline-after
- `button-ghost`: pill/button treatment — `border border-border`, `rounded-md`, `px-3 py-1.5`, `text-sm` — used for primary CTAs in ProjectCard link row

**States:**
- Default rest: color `text-secondary`
- Hover: color `text-primary`, underline (or border darkens for button variant)
- Focus-visible: `outline: 2px solid --color-accent; outline-offset: 2px`

**Accessibility:**
- Always `target="_blank" rel="noopener noreferrer"`
- Always include `<span class="sr-only"> (opens in new tab)</span>` immediately after visible label
- Icon is `aria-hidden="true"`

---

## 6. Visual Foundation & Design Tokens

### Full CSS Custom Property Token Table

Paste into `src/styles/globals.css` inside a `@layer base` block (Tailwind v4) or directly in `:root`:

```css
:root {
  /* ─── Palette ─────────────────────────────────────────── */
  --color-background:      #FAFAF9;
  --color-surface:         #F5F4F2;
  --color-surface-raised:  #FFFFFF;
  --color-border:          #E5E2DE;
  --color-border-subtle:   #EEECE9;

  /* Text */
  --color-text-primary:    #18181B;
  --color-text-secondary:  #52525B;
  --color-text-muted:      #A1A1AA;

  /* Accent (personal — not project-specific) */
  --color-accent:          #3B3B3B;
  --color-accent-hover:    #000000;

  /* Project brand colors */
  --color-cortex:          #60a5fa;
  --color-consul:          #1E3A8A;
  --color-groundwork:      #2D6A4F;

  /* ─── Typography ──────────────────────────────────────── */
  --font-display:  'Bricolage Grotesque', system-ui, sans-serif;
  --font-body:     'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:     'IBM Plex Mono', 'Fira Code', monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;

  --leading-display: 1.1;
  --leading-heading: 1.2;
  --leading-tight:   1.3;
  --leading-body:    1.65;

  --tracking-tight:  -0.02em;
  --tracking-normal: 0;
  --tracking-wide:   0.06em;

  /* ─── Spacing ─────────────────────────────────────────── */
  --max-w-content: 768px;
  --max-w-page:    1024px;

  /* ─── Shape ───────────────────────────────────────────── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* ─── Shadow ──────────────────────────────────────────── */
  --shadow-card:       0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  --shadow-card-hover: 0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06);

  /* ─── Motion ──────────────────────────────────────────── */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* ─── Nav ─────────────────────────────────────────────── */
  --nav-height: 56px;
}
```

### Tailwind v4 `@theme` Integration

```css
/* tailwind.config equivalent for v4 — inside @theme block in CSS */
@theme {
  --color-background: #FAFAF9;
  --color-surface: #F5F4F2;
  --color-surface-raised: #FFFFFF;
  --color-border: #E5E2DE;
  --color-border-subtle: #EEECE9;
  --color-text-primary: #18181B;
  --color-text-secondary: #52525B;
  --color-text-muted: #A1A1AA;
  --color-accent: #3B3B3B;
  --color-cortex: #60a5fa;
  --color-consul: #1E3A8A;
  --color-groundwork: #2D6A4F;
  --font-family-display: 'Bricolage Grotesque', system-ui, sans-serif;
  --font-family-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-family-mono: 'IBM Plex Mono', monospace;
}
```

This makes `bg-background`, `text-text-primary`, `text-cortex`, `font-display`, etc. available as Tailwind utilities.

---

### Dark Mode Strategy

**Recommendation: Launch light-only.** 

Rationale:
1. The warm off-white `#FAFAF9` background is already a considered aesthetic choice — it reflects the "printed document" quality appropriate for a resume-forward personal site.
2. Dark mode done badly (pure `#000000` background, insufficient contrast tuning) looks worse than no dark mode. A personal site represents the builder; quality over coverage.
3. Astro + Tailwind v4 make it straightforward to add later. The token architecture above is dark-mode-ready — a `[data-theme="dark"]` block on `:root` would override the palette tokens without touching component classes.

**Annotation for future dark mode** (add to `globals.css` when ready):
```css
/* Future dark mode — DO NOT SHIP YET */
/*
[data-theme="dark"] {
  --color-background:      #0F0F0E;
  --color-surface:         #1A1917;
  --color-surface-raised:  #232220;
  --color-border:          #2C2A27;
  --color-border-subtle:   #242220;
  --color-text-primary:    #FAFAF9;
  --color-text-secondary:  #A1A1AA;
  --color-text-muted:      #52525B;
  --color-accent:          #E5E2DE;
  --color-accent-hover:    #FAFAF9;
}
*/
```

---

### Icon Set

**Use [Lucide](https://lucide.dev/) icons.**

Rationale: Lucide is MIT-licensed, tree-shakeable (`lucide-astro` package exists), uses consistent 24px / 2px-stroke geometry, and is the most actively maintained of the open icon sets. The alternative (Tabler) is also fine but Lucide has better Astro integration and wider ecosystem familiarity.

Icons used on this site:
- `ArrowUpRight` — external links
- `ArrowRight` — "View all projects" CTA
- `Download` — PDF download button
- `Mail` — Email link in footer/nav
- `Linkedin` — LinkedIn link
- `Github` — GitHub link
- `Menu` — hamburger (mobile nav)
- `X` — close (mobile nav drawer)

Install: `npm install lucide-astro` (or the framework-appropriate package).

All icon instances: `aria-hidden="true"`, paired with visible text or `aria-label` on the parent element.

---

## 7. Responsive Design

### Breakpoints

Aligned with Tailwind defaults:

| Name | Range | Tailwind prefix |
|---|---|---|
| Mobile | `< 640px` | (default, no prefix) |
| Tablet | `640px – 1023px` | `sm:` |
| Desktop | `≥ 1024px` | `lg:` |

Wide desktop (`≥ 1280px`, `xl:`) uses the same layout as desktop — max-width container prevents line lengths from becoming uncomfortable.

---

### Home (`/`)

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| H1 font size | `text-4xl` (36px) | `text-4xl` | `text-5xl` (48px) |
| H1 tracking | `-0.015em` | `-0.02em` | `-0.02em` |
| Section padding | `py-10` (40px) | `py-12` | `py-16` (64px) |
| "Currently" | stacked (label above value) | inline | inline |
| Projects grid | 1 column | 2 columns | 3 columns |
| "View all" link | centered below grid | right-aligned | right-aligned |
| Footer layout | stacked, centered | row, space-between | row, space-between |

---

### Resume (`/resume`)

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Content padding | `px-4` | `px-8` | `px-0` (max-w-2xl centered) |
| Experience entry layout | stacked (role below company) | row (company · role · date) | row |
| PDF button | full-width at bottom | fixed bottom-right | fixed bottom-right |
| Font size (body) | `text-sm` (14px) | `text-base` | `text-base` |

---

### Projects (`/projects`)

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Page H1 | `text-3xl` | `text-4xl` | `text-4xl` |
| Cards | full-width, stacked | full-width, stacked | full-width, stacked (max `768px` centered) |
| Card padding | `p-4` | `p-6` | `p-6` |
| Stack pills | wrap, max 4 shown | wrap, all shown | wrap, all shown |
| Link row | stacked | row | row |

---

### Navigation Mobile Treatment

**Pattern: Slide-down link drawer (not full-screen overlay).**

Rationale: Three links don't warrant a full overlay. A compact slide-down drawer (max-height ~180px) is less disruptive and feels proportionate to the simple nav.

Implementation:
- Hamburger button: `Menu` icon (24px), `aria-expanded` toggled
- Drawer: `div` below the nav bar, `max-h-0` collapsed → `max-h-[180px]` expanded, `overflow: hidden`, `transition: max-height 200ms ease`
- Links in drawer: `block py-3 px-4 text-base font-medium text-text-primary border-b border-border-subtle`
- Last link has no bottom border
- Tap outside drawer: closes it (click-outside handler)

---

### Typography Scale Adjustments

The `text-5xl` H1 (48px, 3rem) is desktop-only. On mobile it steps down to `text-4xl` (36px) to maintain comfortable line lengths on narrow viewports. All other text sizes are unchanged across breakpoints — Tailwind's defaults handle line-length gracefully at 16px body.

```html
<!-- Example Astro/Tailwind implementation -->
<h1 class="font-display font-bold text-4xl lg:text-5xl tracking-tight leading-[1.1] text-text-primary">
  Jake Selby
</h1>
```

---

## 8. Accessibility

### WCAG AA Compliance Requirements

This site targets **WCAG 2.1 AA** as the minimum. Specific requirements:

- All text content: minimum 4.5:1 contrast ratio against its background
- Large text (18pt / 14pt bold and above): minimum 3:1 ratio
- UI components and graphical objects: minimum 3:1 against adjacent colors
- All interactive elements reachable and operable via keyboard
- No seizure-triggering flashes
- Focus indicators visible and distinguishable

---

### Color Contrast Requirements

Pairs to verify with a tool (e.g. [Colour Contrast Checker](https://colourcontrast.cc/)):

| Foreground | Background | Minimum | Notes |
|---|---|---|---|
| `#18181B` (text-primary) | `#FAFAF9` (background) | 4.5:1 (target 7:1) | Main body — should easily pass AAA |
| `#52525B` (text-secondary) | `#FAFAF9` (background) | 4.5:1 AA | All secondary copy — verify |
| `#52525B` (text-secondary) | `#F5F4F2` (surface) | 4.5:1 AA | Cards — verify |
| `#FFFFFF` (white) | `#3B3B3B` (accent / button bg) | 4.5:1 AA | Download PDF button |
| `#1E3A8A` (Consul blue) | `#FFFFFF` (surface-raised) | 4.5:1 AA | Consul status badge text — verify |
| `#2D6A4F` (Groundwork green) | `#FFFFFF` (surface-raised) | 4.5:1 AA | Groundwork status badge text — verify |
| `#A1A1AA` (text-muted) | `#FAFAF9` (background) | **Decorative only** | Never use for meaningful text |
| `#60a5fa` (Cortex blue) | Any | **Do not use as text** | Use only as decorative border/accent |

**Action items:**
- `#52525B` on `#FAFAF9`: computed ratio is approximately 5.9:1 ✓ (passes AA, just under AAA)
- `#1E3A8A` on `#FFFFFF`: approximately 10.7:1 ✓ (passes AAA)
- `#2D6A4F` on `#FFFFFF`: approximately 7.2:1 ✓ (passes AAA)

---

### Keyboard Navigation Requirements

- Tab order follows visual reading order (top-left to bottom-right)
- All interactive elements (links, buttons) are focusable and operable with Enter/Space
- Mobile nav drawer: when opened, focus moves to first link inside drawer; `Escape` closes and returns focus to hamburger button
- PDF download button: focusable, Enter triggers print
- Skip-to-content link: `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to content</a>` as first element in `<body>`

---

### Screen Reader Annotations

**Landmark regions:**

```html
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>

<main id="main-content">
  <section aria-label="Hero">...</section>
  <section aria-label="Currently">...</section>
  <section aria-label="Projects">...</section>
</main>

<footer aria-label="Site footer">...</footer>
```

**Alt text policy:**
- This site has no images in v1. If a headshot or project screenshot is added later: alt text describes the image content, not "photo of Jake Selby" but substantive description.
- Lucide icons: all `aria-hidden="true"`. Their meaning conveyed by adjacent visible text or parent `aria-label`.
- StatusBadge: add `<span class="sr-only">Project status: </span>` before the visible text.

---

### Focus Indicator Style

Default browser focus rings are insufficient in most browsers. Apply a consistent custom focus style:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* Remove outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

This ensures keyboard users see a clear `#3B3B3B` outline ring while mouse users don't see the ring on click.

---

## 9. Micro-interactions & Motion

### Philosophy

**Minimal and purposeful.** The site does not animate to be interesting — it animates to confirm that interactions worked. The motion budget is:

- **Hover states:** always. They confirm interactivity.
- **Focus transitions:** color/outline transitions at `--transition-fast` (120ms).
- **Card hover lift:** `translateY(-2px)` + shadow change at `--transition-base` (200ms).
- **Nav backdrop blur:** appears smoothly on scroll via CSS transition, not JS.
- **No:** entrance animations, scroll-triggered reveals, parallax, background motion, or page-level transitions that add latency.

### Respecting `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All transitions defined above are purely cosmetic — this override is safe and complete.

---

### Specific Transitions

#### Text links (nav, footer, inline)

```css
.link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.link:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

#### ProjectCard hover

```css
.project-card {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

#### Button (PDF download, CTA buttons)

```css
.btn {
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.btn:hover {
  background-color: var(--color-accent-hover);
}
```

#### Nav backdrop transition

```css
.site-nav {
  border-bottom: 1px solid transparent;
  background-color: transparent;
  transition: border-color var(--transition-base), background-color var(--transition-base), backdrop-filter var(--transition-base);
}
.site-nav.scrolled {
  border-bottom-color: var(--color-border-subtle);
  background-color: rgb(250 250 249 / 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

#### Mobile drawer

```css
.mobile-nav-drawer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-base);
}
.mobile-nav-drawer.open {
  max-height: 200px;
}
```

---

### Astro View Transitions

**Optional enhancement, not required for v1.**

If added, use Astro's built-in `<ViewTransitions />` component for a smooth fade between pages. Configure:

```astro
<!-- src/layouts/BaseLayout.astro -->
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
```

The default `fade` transition (150ms) is appropriate. Do NOT use `slide` or custom dramatic transitions — they conflict with the "fast and confident" aesthetic.

Add `transition:name` attributes to the nav and footer so they persist across transitions:

```astro
<nav transition:persist="site-nav">...</nav>
```

---

## 10. Copy Guidelines

### Voice and Tone

| Quality | What it means in practice |
|---|---|
| **Direct** | No hedging. Not "I've had the opportunity to work on…" — "I built X, shipped Y, acquired Z." |
| **Specific** | Numbers, dates, real outcomes. "48-person org" not "large engineering team." "Employee #7" not "early employee." |
| **Understated** | The work speaks. No superlatives ("world-class," "passionate," "innovative"). |
| **Builder-credible** | Technical specificity earns trust. Stack names, architectural choices, deployment details are appropriate — not showing off, just being real. |
| **Present tense where possible** | "I run a 48-person org" not "I have led teams of 48+." |

**Avoid:**
- Marketing-speak: "leverage," "synergy," "impactful," "solutions"
- Self-description as traits: "I'm a passionate engineer" (show, don't tell)
- Hedging: "I've been fortunate to…", "I've had the chance to…"
- Vague scope: "large scale," "high traffic," "complex systems" without specifics

---

### Hero Headline Approach

The H1 is the name: `Jake Selby`. The *identity line* below it does the positioning work.

**Template for identity line:**
> `[what Jake has done at scale] · [what Jake builds independently]`

**Approved draft:**
> *"Engineering leader who helped build CareJourney from employee #7 through acquisition — now running 48 engineers at Arcadia while building agentic-AI products on the side."*

**Alternative (shorter, punchier):**
> *"VPE at Arcadia. Solo-shipping agentic-AI products. Both at once."*

The "Currently" line (directly below) provides the present-tense update. The identity line can be slightly more evergreen.

---

### Project Card Copy Template

Each `ProjectCard` carries the following copy slots:

```
NAME:        [Project name — one word, title case]
TAGLINE:     [One sentence. First-person or product-voice. Concrete benefit or identity.]
DESCRIPTION: [2–4 sentences. What it is, what problem it solves, why it's notable.
              No fluff. Mention architecture if genuinely interesting.]
ROLE:        [Jake's role in one sentence: "Solo-built. [key decision / technical frame]"]
STATUS:      [live | staging | donating]
STACK:       [comma-separated tech names, most distinctive first]
LINK_APP:    [label] → [URL]     (e.g. "Open app →")
LINK_PITCH:  [label] → [URL]     (e.g. "Read pitch →" or "View demo →")
```

**Filled examples:**

**Cortex:**
```
NAME:        Cortex
TAGLINE:     "An AI that remembers who matters to you, tracks what you've committed to, and earns the right to act on your behalf."
DESCRIPTION: Ambient agentic-AI cognitive substrate — pgvector episode store, behavioral rules with lifecycle,
             per-counterparty trust governance, 17-tool MCP server (OAuth), and an action ledger with full provenance.
             Phase 0 founder dogfood. Running in production on ECS Fargate.
ROLE:        Solo-built. Full BMAD product thesis: Hono agent-runtime, Next.js BFF, spec-driven delivery.
STATUS:      live
STACK:       TypeScript, Hono, Next.js, PostgreSQL + pgvector, AWS ECS, Auth0, MCP
LINK_APP:    "Open app →" → cortex.jakeselby.com
LINK_PITCH:  "Read pitch →" → cortex.jakeselby.com/pitch/builders
```

**Consul:**
```
NAME:        Consul
TAGLINE:     "Your ambient AI assistant."
DESCRIPTION: Personal executive assistant built on the Cortex substrate.
             Web + iOS + Mac surfaces for memory review, rules, trust ledger, and conversation.
             Single-user Phase 0 — the EA surface layer above Cortex's cognitive engine.
ROLE:        Solo-built. Next.js 15 App Router, React 19, Tailwind + Mantine.
STATUS:      live
STACK:       TypeScript, Next.js 15, React 19, Tailwind, Mantine, ECS Fargate
LINK_APP:    "Open app →" → consul.jakeselby.com
LINK_PITCH:  "Read pitch →" → consul.jakeselby.com/pitch
```

**Groundwork:**
```
NAME:        Groundwork
TAGLINE:     "Modern voter contact, built for campaigns that move fast."
DESCRIPTION: NGP VAN alternative for challenger campaigns — voter file, canvassing management,
             offline-first iOS app (Swift/GRDB), and an AI field assistant.
             Donating to a movement org after validating the build.
ROLE:        Solo-built. Full BMAD brief + Nx monorepo. PostGIS voter file, offline-first Swift.
STATUS:      donating
STACK:       React 19 + Vite, NestJS, PostgreSQL + PostGIS, AWS S3/CloudFront, Swift (iOS)
LINK_APP:    "View demo →" → groundwork.staging.jakeselby.com/demo
LINK_PITCH:  (none for now — demo link serves both purposes)
```

---

### Resume Page Introduction Copy

The resume H1 is `Jake Selby`. The summary section content:

**Draft summary (for `ResumeSection` — Summary variant):**

> Engineering leader who helped build CareJourney from employee #7 through its acquisition by Arcadia (July 2024), now running a 48-person org. Early, hands-on builder of agentic systems: architects and directs agents to ship production-quality software, authors spec-driven PRDs, and builds personal agentic-AI products. Building with LLMs since ChatGPT launched (Nov 2022); agent-first ever since. Spec-driven delivery, MCP, Cursor + Claude.

This is a tightened version of the source resume summary. It front-loads the acquisition narrative (credibility anchor), states the current scope (48-person org), and immediately signals the builder identity.

---

## Appendix A — File Structure Suggestion

```
src/
├── components/
│   ├── SiteNav.astro
│   ├── SiteFooter.astro
│   ├── ProjectCard.astro
│   ├── ResumeSection.astro
│   ├── StackPill.astro
│   ├── StatusBadge.astro
│   └── ExternalLink.astro
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   ├── resume.astro
│   └── projects.astro
├── styles/
│   └── globals.css       ← tokens, @theme, @layer base
└── data/
    └── projects.ts        ← ProjectCard data (name, tagline, description, etc.)
```

Keeping project data in `src/data/projects.ts` allows a single source of truth for both the home preview cards and the full `/projects` page. Type the array against the `ProjectCardProps` interface defined in Section 5.

---

## Appendix B — Implementation Checklist

- [ ] Set up Astro 5 project with Tailwind CSS v4 and TypeScript
- [ ] Add Google Fonts import (Bricolage Grotesque + IBM Plex Sans + IBM Plex Mono)
- [ ] Define all tokens in `globals.css` `:root` block
- [ ] Wire Tailwind v4 `@theme` block to CSS variables
- [ ] Install `lucide-astro`
- [ ] Build `BaseLayout.astro` with ViewTransitions + skip-to-content link + meta tags
- [ ] Build `SiteNav.astro` with scroll detection + mobile drawer
- [ ] Build `SiteFooter.astro`
- [ ] Build `StackPill.astro`, `StatusBadge.astro`, `ExternalLink.astro` (leaf components first)
- [ ] Build `ProjectCard.astro` with `compact` and `full` variants + project brand color prop
- [ ] Build `ResumeSection.astro`
- [ ] Populate `src/data/projects.ts` from copy in Section 10
- [ ] Build `index.astro` (home)
- [ ] Build `resume.astro` with print stylesheet
- [ ] Build `projects.astro`
- [ ] Run Lighthouse; target ≥ 95 performance desktop, ≥ 90 mobile
- [ ] Check contrast pairs listed in Section 8 with a contrast checker
- [ ] Keyboard-navigate full site; verify tab order + focus rings
- [ ] Test print-to-PDF from `/resume` in Chrome and Safari
- [ ] Deploy to S3 + CloudFront; verify `https://jakeselby.com` resolves
- [ ] Set `<meta name="robots" content="index, follow">` and add `sitemap.xml` (use `@astrojs/sitemap`)
