import { defineConfig } from 'oxlint';
import lintAngular from '@benjavicente/lint-angular';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  categories: { correctness: 'error' },
  ignorePatterns: ['.output/**', 'dist/**', 'coverage/**', 'src/routeTree.gen.ts', '**/*.spec.ts'],
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
    '@benjavicente/lint-angular/no-resource-api': 'off',
    '@benjavicente/lint-angular/no-rxjs-state-in-component': 'off',
    '@benjavicente/lint-angular/no-writing-signals-in-reactive-context': 'off',
    '@benjavicente/lint-angular/prefer-load-component-over-load-children': 'off',
    '@benjavicente/lint-angular/prefer-private-elements': 'off',
    '@benjavicente/lint-angular/public-component-interface': 'off',
    '@benjavicente/lint-angular/rules-of-inject': 'off',
    '@angular-eslint/component-selector': 'off',
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
