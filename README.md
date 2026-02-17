# Playwright-TypeScript Test Automation Framework for Adobe Firefly

This project implements a scalable test automation framework using Playwright and TypeScript, following a clean architecture pattern.

![Architecture Diagram](https://raw.githubusercontent.com/username/repo/main/docs/architecture.png)

## Architecture Overview

The framework is structured to separate concerns and ensure maintainability:

- **API Layer (`/api`)**: Handles all API interactions.
  - `clients/`: Business-logic specific API clients.
- **UI Layer (`/ui`)**: Encapsulates UI interactions and validations.
  - `models/`: Page Object Models (POM) for interacting with UI elements.
  - `validators/`: Reusable validation logic.
- **Tests (`/tests`)**: Contains the actual test scenarios (Business Flows).
  - Tests contain zero logic; they orchestrate the flow using API and UI layers.
- **Fixtures (`/fixtures`)**: Playwright fixtures for test isolation and setup (e.g., authentication, browser context).
- **Utilities (`/utils`)**: Core framework utilities (config, logging, helpers).

## Project Structure

```
/
├── api/             # API clients and types
├── ui/              # Page objects and validators
├── tests/           # Test specifications
├── fixtures/        # Playwright fixtures
├── utils/           # Core utilities (config, logger)
├── reports/         # Test reports
├── .env.*           # Environment variables
├── playwright.config.ts # Playwright configuration
└── tsconfig.json    # TypeScript configuration
```

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

3.  Install Playwright browsers:

```bash
npx playwright install
```

## Skills Pattern & CLI

This framework includes a `skills/` directory for high-level, reusable business capabilities (e.g., "Login", "Purchase").

### Installing Playwright CLI & Tools

To install the Playwright CLI globally (optional, project-local is recommended):

```bash
npm install -g @playwright/cli
```

To install browser binaries and dependencies:

```bash
npx playwright install --with-deps
```

**Note regarding `playwright install --skills`**: This command is specific to certain AI agent environments and is not a standard Playwright CLI command. The `skills/` directory in this project is a structural implementation of the pattern.

## Configuration

Environment variables are managed using `.env` files.

- `.env.dev`: Development environment (default)
- `.env.qa`: QA environment
- `.env.prod`: Production environment

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run specific test file:

```bash
npx playwright test tests/login.flow.spec.ts
```

Run tests in UI mode:

```bash
npx playwright test --ui
```

## Reports

### HTML Report (Default)

After running tests, an HTML report is generated. Serve it with:

```bash
npx playwright show-report
```

### Allure Report

This framework supports Allure reporting.

**Prerequisite:** valid Java Runtime Environment (JRE) installed.

1.  Run tests (Allure results are automatically generated in `./allure-results`):
    ```bash
    npm test
    ```
2.  Generate and open the Allure report:
    ```bash
    npm run report:allure
    npm run show-report:allure
    ```

## Static Analysis & QA

To ensure code quality, this framework includes linting and formatting tools. These should be run before pushing code.

### Linting (ESLint)

Checks for syntax errors and best practices.

```bash
npm run lint
```

Auto-fix fixable issues:

```bash
npm run lint:fix
```

### Formatting (Prettier)

Ensures consistent code style.

```bash
npm run format
```
