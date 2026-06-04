import { defineConfig } from 'oxlint';
import lintAngular from '@benjavicente/lint-angular';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  categories: { correctness: 'error' },
  ignorePatterns: ['.output/**', 'dist/**', 'coverage/**', 'src/routeTree.gen.ts'],
  env: { builtin: true, browser: true },
  jsPlugins: [
    '@angular-eslint/eslint-plugin',
    '@benjavicente/lint-angular',
    'eslint-plugin-unused-imports',
  ],
  rules: {
    ...lintAngular.configs.recommended.rules,
    'no-unused-vars': 'off',
    '@benjavicente/lint-angular/class-member-order': 'off',
    '@benjavicente/lint-angular/decorator-filename-suffix': 'off',
    '@angular-eslint/component-selector': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'unicorn/no-useless-spread': 'off',
  },
});
