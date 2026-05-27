// @ts-check
import { defineConfig } from 'eslint/config';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '.output/**',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'src/routeTree.gen.ts',
      '**/*.spec.ts',
    ],
  },
  {
    name: 'eslint-supplement-typescript',
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@angular-eslint': angular.tsPlugin,
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/no-experimental': 'warn',
      '@angular-eslint/no-developer-preview': 'warn',
    },
  },
  {
    name: 'eslint-supplement-angular-templates',
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
    },
  },
]);
