# Correlation & Regression Playground

An interactive statistics lab for exploring Pearson correlation and simple linear regression. Edit observations and immediately see the scatter plot, fitted line, equation, and statistics change.

Built with **React, TypeScript, Vite, Recharts, and Tailwind CSS**, with accessible Radix/shadcn controls. The application runs entirely in the browser and needs no backend, API keys, or environment variables.

## Features

- Edit, add, and remove paired X/Y observations.
- Five example datasets, random data generation, clear, and reset.
- Responsive scatter plot, selectable points, regression line, and optional residuals.
- Live Pearson r, R², slope, intercept, observation count, and X/Y means.
- Plain-English interpretations, equations, and concise lessons.
- A moving-point experiment showing how one observation changes the fitted relationship.
- Four quiz questions with immediate feedback and answer review.
- Keyboard-accessible controls and responsive desktop/mobile layouts.
- Explicit handling of missing or invalid inputs, duplicate observations, constant series, and extreme values.

## Requirements

- **Node.js 22.13 or newer**; Node 22 is selected in `.nvmrc`.
- npm, included with Node.js.

## Run locally

```bash
git clone https://github.com/modShik/correlation-and-regression-playground.git
cd correlation-and-regression-playground
npm ci
npm run dev
```

Open **http://127.0.0.1:5173** (or the address printed by Vite if that port is occupied).

If you already have this folder locally, skip the clone and start with `npm ci`.

## Commands

- `npm run dev` — start the development server.
- `npm run typecheck` — check the TypeScript source.
- `npm test` — run the 17 mathematical tests.
- `npm run build` — generate the production site in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run check` — run type checking, tests, and the production build together.

## Project structure

```text
correlation-and-regression-playground/
├── .github/workflows/ci.yml     # GitHub Actions: typecheck, tests, build
├── docs/
│   ├── GITHUB.md               # First push and later updates
│   └── MATHEMATICS.md          # Formulae, conventions, and edge cases
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                # Page composition and shared observation state
│   ├── main.tsx               # React entry point
│   ├── components/
│   │   ├── lab/               # Editor, chart, lessons, quiz, optional browser tools
│   │   └── ui/                # Only the six UI primitives the app uses
│   ├── lib/
│   │   ├── statistics.ts      # Pure calculations, parsing, and example datasets
│   │   └── utils.ts           # Shared class-name helpers
│   └── styles/
│       ├── globals.css        # Theme and responsive layouts
│       └── vendor/            # Vendored stylesheet and its license
├── tests/
│   ├── run.mjs                # Portable TypeScript test runner
│   └── statistics.test.mjs    # 17 numerical regression tests
├── .gitignore
├── .nvmrc
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── vite.config.ts
```

The `@/` import alias points to `src/`. Calculations are separated from rendering so they can be tested independently.

## Checks and deployment

GitHub Actions runs `npm ci` and `npm run check` on pushes to `main`, pull requests, or a manual run. No repository secrets are required.

Run `npm run build` to create a static website in `dist/`. It can be served by any static host. Vite uses relative asset URLs so builds also work under a repository subpath such as `/correlation-and-regression-playground/`. The included workflow validates the project; it does not deploy it.

Do not open `dist/index.html` directly through `file://`. Use `npm run preview` or an HTTP static server.

See [GitHub setup and push instructions](docs/GITHUB.md).

## Academic scope

The lab teaches the Pearson correlation and simple-regression foundations for Probability & Statistics, Module 3. It is based on the supplied syllabus excerpt: “Correlation and Regression – Rank Correlation; Partial and Multiple correlation; Multiple regression.” The original PDF was not available; brief notes orient students to the broader module without implementing those advanced models.

See [mathematical conventions and numerical behavior](docs/MATHEMATICS.md).

## Data and browser support

Observations stay in browser memory and reset on reload. There are no application network requests or server-side calculations. An optional WebMCP adapter exposes the same lab controls to supporting browsers; ordinary browsers work without it.

Third-party UI license notices are retained in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
