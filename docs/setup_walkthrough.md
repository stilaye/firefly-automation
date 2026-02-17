# Playwright Framework Setup Walkthrough

## Overview

I have successfully initialized the Playwright-TypeScript test automation framework for "Adobe Firefly" based on the provided architecture diagram.

## Project Structure

The following directory structure has been created:

```
/Users/avyaan/firefly/
├── api/
│   ├── clients/
│   │   ├── auth.client.ts
│   │   ├── user.client.ts
│   │   └── order.client.ts
│   └── api.types.ts
├── ui/
│   ├── models/
│   │   └── user.model.ts
│   ├── validators/
│   │   ├── user.validator.ts
│   │   └── order.validator.ts
│   └── ui.types.ts
├── tests/
│   ├── login.flow.spec.ts
│   ├── checkout.flow.spec.ts
│   └── user.lifecycle.spec.ts
├── fixtures/
│   ├── browser.fixture.ts
│   └── test.context.ts
├── utils/ (Core Utilities)
│   ├── config.ts
│   ├── logger.ts
│   └── test.context.ts (shared)
├── reports/ (Created by Playwright on run)
├── .env.dev
├── .env.qa (Note: currently pointing to dev env vars as placeholders)
├── .env.prod (Note: currently pointing to dev env vars as placeholders)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Verification

I ran `npx playwright test --list` to verify that the tests are detected correctly.

Output:

```
Listing tests:
  [chromium] › checkout.flow.spec.ts:4:9 › Checkout Flow › should complete checkout
  [chromium] › login.flow.spec.ts:5:9 › Login Flow › should login successfully
  [chromium] › user.lifecycle.spec.ts:5:9 › User Lifecycle › should create and delete user
Total: 3 tests in 3 files
```

## Next Steps

- Implement the actual logic inside the placeholder files.
- Add real environment variables to `.env` files.
- Run tests using `npx playwright test`.

## Skills Usage

I also demonstrated the usage of the `playwright-cli` skill by opening the Adobe Firefly website:

```bash
playwright-cli open https://firefly.adobe.com/
```

Result:

- Page opened successfully.
- Title: Adobe Firefly - Generative AI - Log In
