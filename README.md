# Astro Starter Kit: Minimal

## Deployment configuration

Copy `.env.infra.example` to `.env.infra` and fill in the existing AWS account,
Route53 hosted-zone ID, S3 bucket name, and CloudFront function name. The file is
gitignored and must use shell-compatible `KEY=value` assignments. Choose an
`AWS_PROFILE` if needed; otherwise the standard AWS credential chain is used.
Do not put credentials in tracked files.

`npm run deploy` loads this file before building and deploying. CDK also loads it
when run from `infra/`; missing configuration or a mismatched AWS account stops
the operation. Keep existing resource names when configuring an existing stack
to avoid replacements. The deployment reads bucket and distribution outputs
from the `JakeSelby` CloudFormation stack and refuses to sync unexpected outputs.
The site domain stays public in source; configuration is for deployment IDs.

Validation: `npm ci`, `npm test`, `npm ci --prefix infra`,
`npm run build --prefix infra`, `npm test --prefix infra`, `npm run build`.
Infrastructure tests use synthetic IDs and need no AWS access.

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Analytics

Google Analytics 4 is wired through [src/components/Analytics.astro](src/components/Analytics.astro)
and rendered from the shared layout, so every page is covered.

Copy `.env.example` to `.env` and set `PUBLIC_GA_MEASUREMENT_ID` to the measurement id of your
web data stream (`G-XXXXXXXXXX`). The tag is emitted only in production builds — `npm run dev`
never reports traffic — and `scripts/deploy.sh` refuses to ship a build that carries no tag
unless you pass `ALLOW_NO_ANALYTICS=1`.
