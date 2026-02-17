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
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
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
