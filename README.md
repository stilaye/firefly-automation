# Playwright-TypeScript Test Automation Framework for Adobe Firefly

This project implements a scalable test automation framework using Playwright and TypeScript, following a clean architecture pattern with 7 distinct layers.

## Architecture Layers

### 1. Test Layer (`/tests`)

Playwright specs organized by feature in TypeScript strict mode. Tests contain zero business logic — they orchestrate flows using API clients and UI page objects.

- `login.flow.spec.ts` — Authentication flow (3 tests)
- `generation.flow.spec.ts` — Text-to-image generation (9 tests)
- `editing.flow.spec.ts` — Image editor (8 tests)
- `projects.flow.spec.ts` — Project/file management (8 tests)
- `checkout.flow.spec.ts` — Checkout flow
- `user.lifecycle.spec.ts` — User lifecycle
- `visual.regression.spec.ts` — Data-driven visual regression (reads `visual-config/visual.config.json`)

### 2. Page Object Layer (`/ui/pages`)

Encapsulated page objects with typed locators extracted from the live site.

- `login.page.ts` — Adobe IMS login flow (`getByLabel('Email address')`, `getByRole('button', { name: 'Sign In' })`)
- `generate.page.ts` — Image generation (`[data-testid="generate-image-generate-button"]`, `getByLabel('Prompt')`)
- `editor.page.ts` — Image editor (`[data-testid="instruct-generate-button"]`, upload area, tab navigation)
- `project.page.ts` — Your stuff / files (`[data-testid="your-files-files-container"]`, nav tabs, search)
- `user.model.ts` — Generic user page

### 3. Fixture Layer (`/fixtures`)

Custom Playwright fixtures for auth, test data, and feature flags.

- `auth.fixture.ts` — Authenticated sessions via `auth.json` storage state (login once, reuse everywhere)
- `data.fixture.ts` — API-based test data setup/teardown with automatic cleanup
- `feature.flag.fixture.ts` — Feature flag toggling via localStorage
- `browser.fixture.ts` — Composed entry point merging all fixtures via `mergeTests()`

### 4. Utility Layer (`/utils`)

Shared helpers for config, logging, API mocking, visual regression, and performance.

- `config.ts` — Environment config (`BASE_URL`, `USERNAME`, `PASSWORD`, `SLACK_WEBHOOK_URL`)
- `logger.ts` — Structured logging (info/error/warn)
- `test.context.ts` — Test helpers (unique ID generation)
- `api.mock.ts` — API mocking (`mockGenerationAPI()`, `mockRoute()`, `mockGenerationFailure()`)
- `visual.helper.ts` — Visual regression (`compareScreenshot()`, `compareElementScreenshot()`, `waitForPageReady()`, `getDynamicMasks()`)
- `perf.metrics.ts` — Performance metrics (`measurePageLoad()`, `measureGenerationTime()`)

### 5. Config Layer

- `playwright.config.ts` — Browser projects (Chromium, Firefox, WebKit), parallelism, retries, reporters
- `tsconfig.json` — TypeScript strict mode, path aliases (`@api/*`, `@ui/*`, `@utils/*`, `@fixtures/*`)
- `.env.dev` / `.env.qa` / `.env.prod` — Environment-specific variables
- `eslint.config.mjs` — ESLint flat config with Playwright + TypeScript rules
- `.prettierrc` — Prettier (single quotes, semicolons, trailing commas, 2-space indent, 100 char width)

### 6. CI/CD Layer

_Not yet implemented._ Planned: GitHub Actions / Jenkins pipelines for PR tests, nightly regression, deployment gates.

### 7. Reporting Layer

Four reporters run after every test execution:

- **HTML Report** — Playwright's built-in interactive report
- **Allure Dashboard** — Rich dashboards with custom categories (failures, timeouts, flaky, skipped) and environment metadata
- **Slack Alerts** (`utils/slack.reporter.ts`) — Posts test summary to Slack via webhook with pass/fail counts, duration, failed test details, and environment context
- **Test Analytics** (`utils/analytics.reporter.ts`) — Tracks results over time in `test-results/analytics.json` with flakiness detection, slow test tracking, and trend analysis

## Project Structure

```
/
├── api/                            # API layer
│   ├── clients/                    # auth.client.ts, user.client.ts, order.client.ts
│   └── api.types.ts                # API interfaces (User, Order, GenerationRequest, etc.)
├── ui/                             # UI layer
│   ├── pages/                      # Page Object Models
│   │   ├── login.page.ts           # Adobe IMS login
│   │   ├── generate.page.ts        # Image generation
│   │   ├── editor.page.ts          # Image editor
│   │   ├── project.page.ts         # Your stuff / files
│   │   └── user.model.ts           # Generic user page
│   ├── validators/                 # Validation logic
│   └── ui.types.ts                 # UI interfaces (GeneratedImage, EditorState, VisualConfig, etc.)
├── tests/                          # Test specifications
│   ├── visual-config/
│   │   └── visual.config.json      # Data-driven visual regression registry (pages, masks, flags)
│   ├── login.flow.spec.ts
│   ├── generation.flow.spec.ts
│   ├── editing.flow.spec.ts
│   ├── projects.flow.spec.ts
│   ├── checkout.flow.spec.ts
│   ├── user.lifecycle.spec.ts
│   └── visual.regression.spec.ts   # Hybrid visual regression (reads visual.config.json)
├── fixtures/                       # Playwright fixtures
│   ├── browser.fixture.ts          # Composed entry point (import test/expect from here)
│   ├── auth.fixture.ts             # Auth with storage state
│   ├── data.fixture.ts             # API test data setup/teardown
│   ├── feature.flag.fixture.ts     # Feature flag toggling
│   └── test.context.ts             # Context extensions
├── utils/                          # Core utilities + reporters
│   ├── config.ts                   # Environment config
│   ├── logger.ts                   # Logging utility
│   ├── test.context.ts             # Test helpers
│   ├── api.mock.ts                 # API mocking helpers
│   ├── visual.helper.ts            # Visual regression helpers
│   ├── perf.metrics.ts             # Performance metrics
│   ├── slack.reporter.ts           # Slack webhook reporter
│   └── analytics.reporter.ts       # Test analytics reporter
├── docs/                           # Documentation
├── .env.dev                        # Dev environment variables
├── .env.qa                         # QA environment variables
├── .env.prod                       # Prod environment variables
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
└── eslint.config.mjs               # ESLint flat config
```

## Prerequisites

- Node.js (v18 or higher)
- npm
- Java Runtime Environment (JRE) — for Allure reports only

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

## Configuration

Environment variables are managed using `.env` files.

- `.env.dev`: Development environment (default)
- `.env.qa`: QA environment
- `.env.prod`: Production environment

Key variables: `BASE_URL`, `USERNAME`, `PASSWORD`, `SLACK_WEBHOOK_URL`

## Running Tests

**Default (Headless)**:
Tests run in headless mode by default.

```bash
npx playwright test
```

**CI Mode** (sequential, with retries):

```bash
npm run test:ci
```

**Headed Mode** (Visible Browser):

```bash
npx playwright test --headed
```

**Specific Browser**:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Parallel Execution**:
By default, tests run in parallel. Control the number of workers:

```bash
npx playwright test --workers=4
```

**Specific Test File**:

```bash
npx playwright test tests/generation.flow.spec.ts
```

**UI Mode** (Interactive detailed view):

```bash
npx playwright test --ui
```

**List tests without running**:

```bash
npx playwright test --list
```

**Visual Regression Only**:

```bash
npx playwright test tests/visual.regression.spec.ts
```

## Visual Regression Testing

Visual regression tests are fully data-driven. All page configuration lives in `tests/visual-config/visual.config.json` — no TypeScript changes needed to add or remove pages.

### Adding a new page

Edit `visual.config.json` and add an entry to `pages.smoke` or `pages.detailed`:

```json
{
  "name": "projects-empty-state",
  "path": "/your-stuff",
  "active": true,
  "maskSelectors": [
    "[data-testid='user-avatar-account-icon']",
    "[data-testid='credits-counter-remaining-credits']"
  ]
}
```

### Toggling smoke vs full coverage

| Config flag           | Behaviour                                                   |
| --------------------- | ----------------------------------------------------------- |
| `"SMOKE_ONLY": true`  | Only `pages.smoke` entries run — fast CI gate               |
| `"SMOKE_ONLY": false` | `pages.detailed` + `pages.smoke` both run — full regression |

### Temporarily skipping a page

Set `"active": false` on any entry. The page is preserved in config but skipped at runtime.

### Updating baselines

When a visual change is intentional, update the stored snapshots:

```bash
npx playwright test tests/visual.regression.spec.ts --update-snapshots
```

## Reports

### HTML Report

```bash
npm run report:show
```

### Allure Dashboard

```bash
npm run report:allure
npm run show-report:allure
```

Includes custom categories (failures, timeouts, flaky, skipped) and environment metadata.

### Slack Alerts

Set `SLACK_WEBHOOK_URL` in your `.env` file to receive test summaries in Slack after each run. The message includes:

- Pass/fail/skipped/flaky counts
- Total duration
- Failed test details with file names and error messages
- Environment and branch context

### Test Analytics

View trends across historical runs:

```bash
npm run report:analytics
```

Analytics data is stored in `test-results/analytics.json` and tracks:

- Per-test pass/fail/duration history
- Flaky test frequency (tests that pass on retry)
- Slowest test trends (rolling average)

## Key Design Decisions

- **Test Data**: API fixtures for setup/teardown — never UI for setup

- **AI Output Testing**: Mock generation API for deterministic tests; separate smoke tests for non-deterministic with broad assertions
- **Parallelism**: Playwright `fullyParallel: true` locally, sequential on CI with browser contexts for isolation
- **Visual Regression**: Hybrid data-driven approach — pages are registered in `tests/visual-config/visual.config.json` (add new pages without touching TypeScript), and `visual.regression.spec.ts` runs them using `authenticatedPage` (no login flakiness), `waitForPageReady()` (event-driven, not `waitForTimeout`), per-page `maskSelectors` for dynamic content, and a 2% pixel threshold. Toggle `SMOKE_ONLY` in the config to switch between fast CI smoke runs and full detailed coverage.

## Development Workflow

### Pull Requests

We use a standard template for all Pull Requests (PRs) to ensure consistency and quality. When you open a PR, the description will be automatically populated with:

- **JIRA Ticket**: Link to the tracking ticket.
- **Problem**: Context on what is being solved.
- **Solution**: Technical details of the implementation.
- **Test Results**: Evidence of testing (screenshots, logs).

Please fill out all sections before requesting a review.

## Static Analysis & QA

### Linting (ESLint)

Enforces code quality and **mandatory documentation**.

- **JSDoc/TSDoc**: All functions, classes, and methods must have documentation comments.
- **Rules**: Playwright best practices + TypeScript recommendations.

```bash
npm run lint
npm run lint:fix
```

### Formatting (Prettier)

```bash
npm run format
```

## Before Pushing Code

1. `npm run lint` — fix any lint errors
2. `npm run format` — ensure consistent formatting
3. `npx playwright test` — ensure all tests pass
