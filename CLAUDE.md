# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**Firefly** is a Playwright + TypeScript test automation framework for **Adobe Firefly** (https://firefly.adobe.com). It follows a clean architecture pattern separating API clients, UI page objects, fixtures, and test flows.

## Tech Stack

- **Language**: TypeScript (strict mode, ES2016 target, CommonJS modules)
- **Test Framework**: Playwright Test (`@playwright/test`)
- **Reporting**: Playwright HTML + Allure
- **Linting**: ESLint (flat config) with `@typescript-eslint`, `eslint-plugin-playwright`, Prettier integration
- **Formatting**: Prettier (single quotes, semicolons, trailing commas, 2-space tabs, 100 char width)
- **Environment**: dotenv (`.env.dev`, `.env.qa`, `.env.prod`)

## Project Structure

```
/
├── api/                    # API layer
│   ├── clients/            # Business-logic API clients (auth, user, order)
│   └── api.types.ts        # Shared API interfaces (User, Order)
├── ui/                     # UI layer
│   ├── models/             # Page Object Models (POMs)
│   └── validators/         # Reusable validation logic
│   └── ui.types.ts         # Shared UI interfaces
├── tests/                  # Test specs (business flows, zero logic)
├── fixtures/               # Playwright custom fixtures (browser, context)
├── utils/                  # Core utilities
│   ├── config.ts           # Config class (env vars: BASE_URL, USERNAME, PASSWORD)
│   ├── logger.ts           # Logger class (info, error, warn)
│   └── test.context.ts     # TestContext helpers (e.g., ID generation)
├── docs/                   # Documentation
├── playwright.config.ts    # Playwright config
├── tsconfig.json           # TypeScript config with path aliases
├── eslint.config.mjs       # ESLint flat config
└── .prettierrc             # Prettier config
```

## Path Aliases (tsconfig)

- `@api/*` -> `api/*`
- `@ui/*` -> `ui/*`
- `@utils/*` -> `utils/*`
- `@fixtures/*` -> `fixtures/*`

## Common Commands

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/login.flow.spec.ts

# Run tests in UI mode
npx playwright test --ui

# List tests without running
npx playwright test --list

# Show HTML report
npx playwright show-report

# Generate Allure report (requires JRE)
npm run report:allure
npm run show-report:allure

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

## Architecture Conventions

### Tests (`tests/`)

- File naming: `<feature>.flow.spec.ts` or `<feature>.lifecycle.spec.ts`
- Tests contain **zero business logic** - they orchestrate flows using API clients and UI page objects
- Import `test` and `expect` from `fixtures/browser.fixture` (NOT directly from `@playwright/test`)
- Use `test.describe()` blocks to group related test cases

### API Clients (`api/clients/`)

- File naming: `<resource>.client.ts`
- Each client is a class that takes `APIRequestContext` in the constructor
- Encapsulate all HTTP interactions here

### Page Objects (`ui/pages/`)

- File naming: `<page>.model.ts` or `<page>.page.ts`
- Each POM is a class that takes Playwright `Page` in the constructor
- Use user-facing locators: `getByRole()`, `getByLabel()`, `getByTestId()` - avoid brittle CSS selectors
- Adobe Firefly uses dynamic CSS class names - never rely on them

### Validators (`ui/validators/`)

- File naming: `<resource>.validator.ts`
- Static validation methods for response/UI assertion logic

### Fixtures (`fixtures/`)

- Extend Playwright's `base.test` using `base.extend({})`
- Export custom `test` and `expect` for use in test files
- Handle setup/teardown (auth, browser context, logging)

### Types

- API interfaces go in `api/api.types.ts`
- UI interfaces go in `ui/ui.types.ts`

## Key Patterns

- **Authentication**: Use `auth.json` storage state for session reuse - avoid UI login in every test
- **Logging**: Use `Logger` class from `utils/logger.ts` (info/error/warn)
- **Configuration**: Use `Config` class from `utils/config.ts` for environment variables
- **Test isolation**: Each test should be independent with a fresh context
- **Web-first assertions**: Always use auto-retrying assertions (`await expect(...).toBeVisible()`)

## Playwright Configuration

- **Test directory**: `./tests`
- **Parallel execution**: Fully parallel locally, sequential on CI
- **Retries**: 2 on CI, 0 locally
- **Browser**: Chromium only (Firefox/WebKit commented out)
- **Trace**: Collected on first retry
- **Reporters**: HTML + Allure

## ESLint Rules

- `playwright/missing-playwright-await`: error
- `playwright/no-focused-test`: warn
- `no-console`: warn
- `@typescript-eslint/no-explicit-any`: off

## Environment

- Environment variables loaded from `.env.dev` by default
- Key variables: `BASE_URL`, `USERNAME`, `PASSWORD`
- Never commit `.env` files with real credentials (`.env` is gitignored)

## Before Pushing Code

1. Run `npm run lint` - fix any lint errors
2. Run `npm run format` - ensure consistent formatting
3. Run `npx playwright test` - ensure all tests pass
