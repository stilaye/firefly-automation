# Playwright Tips, Tricks & Best Practices for Adobe Firefly Framework

This guide outlines best practices for using Playwright tools to build and maintain the Adobe Firefly Test Automation Framework.

## 1. General Best Practices

### Locators

- **Prioritize User-Facing Attributes**: Use locators that resemble how a user interacts with the page.
  - ✅ `page.getByRole('button', { name: 'Sign In' })`
  - ✅ `page.getByLabel('Username')`
  - ✅ `page.getByTestId('submit-btn')`
  - ❌ `page.locator('div > span > button.btn-primary')` (Brittle!)
- **Avoid Dynamic Classes**: Adobe products often use dynamic CSS modules (e.g., `class="Button-sc-1xyz"`). Avoid relying on these as they change between builds. Use stable attributes or text content.

### Assertions

- **Use Web-First Assertions**: These automatically wait/retry until the condition is met.
  - ✅ `await expect(page.getByText('Welcome')).toBeVisible();`
  - ❌ `expect(await page.isVisible('text=Welcome')).toBe(true);` (Doesn't retry correctly)

### Test Isolation

- **Independent Tests**: Each test should run independently with a fresh context. Do not depend on the state left by previous tests.
- **Use Fixtures**: Use the custom `fixtures/` to handle setup (auth, data) behind the scenes.

---

## 2. Using Playwright Codegen (`codegen`)

`codegen` is a powerful tool to record interactions and generate code. However, **do not copy-paste raw code directly into tests**. Refactor it into the Page Object Model (POM).

### Workflow

1.  **Launch Codegen**:
    ```bash
    npx playwright codegen https://firefly.adobe.com/
    ```
2.  **Perform Actions**: Click, type, and assert in the browser.
3.  **Extract Locators**: Look at the generated code to find the best locators.
4.  **Implement in POM**:
    - Take the locator (e.g., `getByRole('button', { name: 'Generate' })`).
    - Add it to the relevant Page Object (e.g., `ui/models/generation.page.ts`).
    - Create a method (e.g., `async clickGenerate()`).

**Example Refactoring**:

_Generated Code_:

```typescript
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByLabel('Email address').fill('test@adobe.com');
```

_Refactored to POM (`ui/models/login.page.ts`)_:

```typescript
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string) {
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.getByLabel('Email address').fill(email);
  }
}
```

---

## 3. Using Playwright CLI Skill (`playwright-cli`)

The `playwright-cli` (installed in `skills/`) is excellent for **exploration, debugging, and AI-assisted workflows**.

### When to use it?

- **Exploration**: When you want to quickly see the state of a page or test a selector without running a full test suite.
- **Debugging**: To inspect the browser state (cookies, storage, network) during a failure reproduction.
- **AI Assistance**: You can ask the AI agent to "open Firefly and check the text of the Generate button" using this tool.

### Useful Commands

**Open and Inspect**:

```bash
# Opens the browser and waits
playwright-cli open https://firefly.adobe.com/
```

**Find Selectors interactively**:
You can use the `eval` command or simply click elements in the open session to see their locators in the output log.

**Take a Snapshot**:

```bash
playwright-cli snapshot
```

Useful for sharing the current page state with the team or attaching to a bug report.

---

## 4. Handling Authentication (Adobe Firefly Specific)

Since Firefly requires Adobe ID login:

1.  **Avoid UI Login in Every Test**: It's slow and flaky.
2.  **Use `auth.json` Storage State**:
    - Login _once_ in a `global-setup` or a specific auth spec.
    - Save the state: `await context.storageState({ path: 'auth.json' });` \* Load it in `playwright.config.ts`:
      `typescript
use: {
  storageState: 'auth.json',
}
`
      This is already partially set up in your `api/clients/auth.client.ts` and `fixtures/`.

---

## 5. Summary Table

| Tool                      | Purpose                 | Best Practice                                             |
| :------------------------ | :---------------------- | :-------------------------------------------------------- |
| **VS Code Extension**     | Running/Debugging Tests | Use for day-to-day test execution and breakpoints.        |
| **`codegen`**             | Finding Locators        | Generate code -> Extract Locators -> Move to POM.         |
| **`playwright-cli`**      | Ad-hoc Tasks / AI       | Use for quick checks, snapshots, or asking AI to explore. |
| **`npx playwright test`** | CI / Regression         | Run this locally before pushing code.                     |
