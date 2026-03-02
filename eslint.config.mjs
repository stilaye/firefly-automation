import typescriptEslint from '@typescript-eslint/eslint-plugin';
import playwright from 'eslint-plugin-playwright';
import typescriptParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/playwright-report',
      '**/test-results',
      '**/allure-results',
      '**/allure-report',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/playwright-test',
    'prettier',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      playwright,
      jsdoc,
    },

    languageOptions: {
      parser: typescriptParser,
    },

    rules: {
      // Playwright best practices
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'warn',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/require-top-level-describe': 'error',

      // TypeScript strictness
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',

      // General best practices
      'no-console': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',

      // JSDoc
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      'jsdoc/require-description': 'warn',
    },
  },
];
