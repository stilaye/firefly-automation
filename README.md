# Playwright-TypeScript Test Automation Framework for Adobe Firefly

This project implements a scalable test automation framework using Playwright and TypeScript, following a clean architecture pattern with 7 distinct layers.

## Core Features

- Modern end-to-end and API testing via Playwright
- Strictly typed test code throughout TypeScript
- Clean, reusable page abstractions using Page Object Model
- Isolated components (NavigationComponent, SettingsComponent) composed into pages
- BasePage and BaseComponent abstract base classes with typed error handling
- Pre-configured page/component objects per test with authenticated sessions
- Detailed, interactive HTML test reports via Allure
- Multi-browser support: Chromium by default; Firefox + WebKit on demand
- Auto-scales workers to CPU count; sequential on CI
- GraphQL endpoint, auth, and account testing via Playwright's request API
- Headless browser execution by default
- Multi-environment configuration via `.env.dev`, `.env.qa`, `.env.prod`
- Structured, levelled console output via Logger class
- Descriptive, catchable error hierarchy (6 typed error classes)
- Centralized test data management (`data/test-data.ts`)
- Type-safe tag constants with regex-based CLI filtering (`data/tags.ts`)
- Screenshot-on-failure auto-fixture with Allure attachment
- Slack webhook alerts with pass/fail counts and failed test details
- Test analytics tracking with flakiness detection and trend analysis
- Data-driven visual regression testing with config-driven page registry
- API mocking utilities for deterministic generation tests
- Performance metrics tracking (page load, generation time)

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

Encapsulated page objects extending `BasePage` with typed locators extracted from the live site. Pages compose reusable components for shared UI sections.

- `base.page.ts` — Abstract base class with goto(), waitForElement(), assertUrl(), takeScreenshot()
- `login.page.ts` — Adobe IMS login flow (`getByLabel('Email address')`, `getByRole('button', { name: 'Sign In' })`)
- `generate.page.ts` — Image generation, composes NavigationComponent + SettingsComponent
- `editor.page.ts` — Image editor, composes NavigationComponent
- `project.page.ts` — Your stuff / files (`getByTestId('your-files-files-container')`, nav tabs, search)
- `user.model.ts` — Generic user page

### 3. Component Object Layer (`/ui/components`)

Reusable UI components that are composed into page objects, eliminating duplication of shared locators and actions.

- `base.component.ts` — Abstract base class with waitForElement(), click(), verifyVisible()
- `navigation.component.ts` — Shared tab bar (Gallery / Generate / Edit) + back button, used across GeneratePage and EditorPage
- `settings.component.ts` — Shared settings panel (model picker, aspect ratio, reference image upload), used across GeneratePage and EditorPage

### 4. Fixture Layer (`/fixtures`)

Custom Playwright fixtures for auth, test data, feature flags, and auto-screenshot.

- `auth.fixture.ts` — Authenticated sessions via `auth.json` storage state (login once, reuse everywhere)
- `data.fixture.ts` — API-based test data setup/teardown with automatic cleanup
- `feature.flag.fixture.ts` — Feature flag toggling via localStorage
- `screenshot.fixture.ts` — Auto-captures full-page screenshot on test failure, attaches to Allure
- `browser.fixture.ts` — Composed entry point merging all fixtures via `mergeTests()`

### 5. Data Layer (`/data`)

Centralized test data and type-safe tag constants.

- `test-data.ts` — Single source of truth for URLs, URL patterns, UI strings, credentials, and timeouts. Uses `requireEnv()` for fail-fast on missing environment variables.
- `tags.ts` — Type-safe tag constants (`@smoke`, `@critical`, `@regression`, `@generation`, `@editing`, `@projects`, `@auth`, `@visual`, `@performance`, `@api`, `@ui`, `@authenticated`) with `as const` for compile-time checking.

### 6. Utility Layer (`/utils`)

Shared helpers for config, logging, API mocking, visual regression, performance, and reporting.

- `config.ts` — Environment config with `requireEnv()` and multi-env support (`TEST_ENV=qa` loads `.env.qa`)
- `logger.ts` — Structured logging (info/error/warn)
- `errors.ts` — Typed error hierarchy (see below)
- `test.context.ts` — Test helpers (unique ID generation)
- `api.mock.ts` — API mocking (`mockGenerationAPI()`, `mockRoute()`, `mockGenerationFailure()`)
- `visual.helper.ts` — Visual regression (`compareScreenshot()`, `compareElementScreenshot()`, `waitForPageReady()`, `getDynamicMasks()`)
- `perf.metrics.ts` — Performance metrics (`measurePageLoad()`, `measureGenerationTime()`)
- `slack.reporter.ts` — Posts test summary to Slack via webhook
- `analytics.reporter.ts` — Tracks results over time with flakiness detection

### 7. Config Layer

- `playwright.config.ts` — Browser projects (Chromium, Firefox, WebKit), parallelism, retries, reporters
- `tsconfig.json` — TypeScript strict mode, path aliases (`@api/*`, `@ui/*`, `@utils/*`, `@fixtures/*`, `@data/*`)
- `.env.dev` / `.env.qa` / `.env.prod` — Environment-specific variables
- `eslint.config.mjs` — ESLint flat config with Playwright + TypeScript rules
- `.prettierrc` — Prettier (single quotes, semicolons, trailing commas, 2-space indent, 100 char width)

### 8. Reporting Layer

Four reporters run after every test execution:

- **HTML Report** — Playwright's built-in interactive report
- **Allure Dashboard** — Rich dashboards with custom categories (failures, timeouts, flaky, skipped) and environment metadata
- **Slack Alerts** (`utils/slack.reporter.ts`) — Posts test summary to Slack via webhook with pass/fail counts, duration, failed test details, and environment context
- **Test Analytics** (`utils/analytics.reporter.ts`) — Tracks results over time in `test-results/analytics.json` with flakiness detection, slow test tracking, and trend analysis

### 9. CI/CD Layer

_Not yet implemented._ Planned: GitHub Actions pipeline with smoke gate, sharded regression, cross-browser smoke, and Allure report deployment to GitHub Pages.

## Typed Error Hierarchy

Descriptive exception hierarchy replacing generic Playwright `TimeoutError` with contextual diagnostics:

| Error Class | Context | Thrown When |
|---|---|---|
| `PageLoadError` | URL, timeout | `goto()` fails or wait-for-locator times out |
| `ElementNotFoundError` | descriptor, timeout | `waitForElement()` times out |
| `NavigationError` | actualUrl, expectedPattern | `assertUrl()` fails |
| `AuthenticationError` | reason | Login flow fails or redirect times out |
| `ApiError` | statusCode, endpoint | HTTP/API call returns unexpected status |
| `TestDataError` | field | Required environment variable is missing |

## BasePage Helper Methods

Core abstraction layer that all page objects extend:

| Method | Description |
|---|---|
| `goto(path, waitForLocator?)` | Navigate to URL, wait for element, throw `PageLoadError` on failure |
| `waitForElement(locator, description, timeout?)` | Wait for visibility, throw `ElementNotFoundError` on timeout |
| `assertUrl(pattern)` | Assert URL matches regex, throw `NavigationError` on mismatch |
| `scrollToElement(locator)` | Scroll element into viewport |
| `getCurrentUrl()` | Return current page URL |
| `getTitle()` | Return page title |
| `takeScreenshot(name)` | Capture full-page screenshot |

## Tag System

Type-safe tag constants for filtering tests via CLI:

| Tag | Purpose |
|---|---|
| `@smoke` | Fast sanity tests for CI gates |
| `@critical` | Must-pass tests for release readiness |
| `@regression` | Full regression coverage |
| `@ui`, `@api` | Execution type |
| `@generation`, `@editing`, `@projects` | Feature area |
| `@auth` | Authentication flows |
| `@visual`, `@performance` | Non-functional testing |
| `@authenticated` | Requires logged-in session |

Usage: `npm run test:smoke` or `npx playwright test --grep @generation`

## Project Structure

```
/
├── api/                            # API layer
│   ├── clients/                    # auth.client.ts, user.client.ts, order.client.ts
│   └── api.types.ts                # API interfaces (User, Order, GenerationRequest, etc.)
├── ui/                             # UI layer
│   ├── pages/                      # Page Object Models (extend BasePage)
│   │   ├── base.page.ts            # Abstract base page (goto, waitForElement, assertUrl)
│   │   ├── login.page.ts           # Adobe IMS login
│   │   ├── generate.page.ts        # Image generation (composes NavigationComponent + SettingsComponent)
│   │   ├── editor.page.ts          # Image editor (composes NavigationComponent)
│   │   ├── project.page.ts         # Your stuff / files
│   │   └── user.model.ts           # Generic user page
│   ├── components/                 # Reusable UI components (extend BaseComponent)
│   │   ├── base.component.ts       # Abstract base component
│   │   ├── navigation.component.ts # Shared tabs: Gallery / Generate / Edit
│   │   └── settings.component.ts   # Shared model picker, aspect ratio
│   ├── validators/                 # Validation logic
│   └── ui.types.ts                 # UI interfaces (GeneratedImage, EditorState, VisualConfig, etc.)
├── data/                           # Centralized test data
│   ├── test-data.ts                # URLs, UI strings, credentials, timeouts
│   └── tags.ts                     # Type-safe tag constants (@smoke, @regression, etc.)
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
│   └── screenshot.fixture.ts       # Auto screenshot-on-failure
├── utils/                          # Core utilities + reporters
│   ├── config.ts                   # Environment config (multi-env support)
│   ├── errors.ts                   # Typed error hierarchy (6 classes)
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

Environment variables are managed using `.env` files. Set `TEST_ENV` to switch environments:

```bash
TEST_ENV=qa npx playwright test   # loads .env.qa
TEST_ENV=prod npx playwright test # loads .env.prod
```

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://firefly.adobe.com` | Application under test |
| `USERNAME` | _(required)_ | Adobe IMS test account email |
| `PASSWORD` | _(required)_ | Adobe IMS test account password |
| `SLACK_WEBHOOK_URL` | _(empty)_ | Slack webhook for test alerts |
| `TEST_ENV` | `dev` | Environment selector (dev/qa/prod) |

## Running Tests

### Primary Commands

| Command | Description |
|---|---|
| `npm test` | Run all tests (headless, parallel) |
| `npm run test:ci` | CI mode (sequential, with retries) |
| `npm run test:headed` | Watch browser interactions |
| `npm run test:debug` | Interactive Playwright debugger |
| `npm run test:ui` | Playwright's visual test runner |

### Browser-Specific Execution

| Command | Description |
|---|---|
| `npm run test:chromium` | Chromium only |
| `npm run test:firefox` | Firefox only |
| `npm run test:webkit` | WebKit (Safari) only |
| `npm run test:cross-browser` | All three browsers |

### Tag-Based Filtering

| Command | Description |
|---|---|
| `npm run test:smoke` | Fast sanity tests |
| `npm run test:critical` | Must-pass release tests |
| `npm run test:regression` | Full regression suite |
| `npm run test:generation` | Image generation tests |
| `npm run test:editing` | Image editing tests |
| `npm run test:projects` | Project/file management tests |
| `npm run test:auth` | Authentication tests |
| `npm run test:visual` | Visual regression tests |
| `npm run test:api` | API tests |

### Other Options

```bash
# Specific test file
npx playwright test tests/generation.flow.spec.ts

# Control parallelism
npx playwright test --workers=4

# List tests without running
npx playwright test --list
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
- **Component Composition**: Shared UI sections (navigation tabs, settings panel) are components composed into page objects — eliminates duplication and mirrors production architecture
- **Typed Errors**: Custom error hierarchy replaces generic `TimeoutError` with contextual diagnostics (URL, timeout, element descriptor)
- **Fail-Fast Config**: `requireEnv()` throws `TestDataError` immediately on missing environment variables instead of failing mid-test
- **Visual Regression**: Hybrid data-driven approach — pages are registered in `tests/visual-config/visual.config.json` (add new pages without touching TypeScript), and `visual.regression.spec.ts` runs them using `authenticatedPage` (no login flakiness), `waitForPageReady()` (event-driven, not `waitForTimeout`), per-page `maskSelectors` for dynamic content, and a 2% pixel threshold. Toggle `SMOKE_ONLY` in the config to switch between fast CI smoke runs and full detailed coverage.

## Contributing Guidelines

- **Filename pattern**: `<feature>.flow.spec.ts` or `<feature>.lifecycle.spec.ts`
- **No inline selectors**: Use Page Objects and Components exclusively
- **Locator priority**: `getByRole()` > `getByLabel()` > `getByTestId()` — avoid CSS selectors (Adobe Firefly uses dynamic class names)
- **{ exact: true }**: Always use on `getByRole()` and `getByLabel()` locators
- **Register new pages as fixtures**: Compose into `browser.fixture.ts` via `mergeTests()`
- **Mandatory tags**: Minimum `@ui`/`@api` plus a severity tag (`@smoke`, `@critical`, `@regression`)
- **Centralize data**: URLs and strings go in `data/test-data.ts`, not hardcoded in tests
- **Extend BasePage**: All new page objects must extend `BasePage` for typed error handling
- **Compose components**: Shared UI sections (nav, settings) should be `BaseComponent` subclasses
- **Never hardcode credentials**: Use `.env` and `Config` class
- **Import from fixtures**: Use `import { test, expect } from '@fixtures/browser.fixture'`, NOT `@playwright/test`

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

Enforces code quality with strict rules:

- **consistent-type-imports**: `import type` required for type-only imports
- **require-top-level-describe**: All tests must be inside `test.describe()` blocks
- **no-explicit-any**: Warned (use typed alternatives)
- **prefer-web-first-assertions**: Warned (use `expect(locator).toBeVisible()` not `isVisible()`)
- **no-wait-for-timeout**: Warned (use event-driven waits)
- **eqeqeq**: Required (`===` not `==`)

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
