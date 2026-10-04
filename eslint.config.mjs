import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', '.next/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      'no-constant-binary-expression': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      'no-empty': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // `next lint` was removed in Next 16, so the App Router rules it used to
    // provide are wired up directly here.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // App Router only — the rule hunts for a `pages/` directory and warns
      // on every run when it finds none.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'next', message: 'Domain layer must not depend on Next.js.' },
            { name: 'react', message: 'Domain layer must not depend on React.' },
            { name: 'react-dom', message: 'Domain layer must not depend on React DOM.' },
          ],
          patterns: [
            { group: ['next/**', 'next'], message: 'Domain layer must not depend on Next.js.' },
            { group: ['react/**', 'react-dom/**'], message: 'Domain layer must not depend on React.' },
            { group: ['#/infrastructure/**', '#/infrastructure'], message: 'Domain layer must not depend on infrastructure layer.' },
            { group: ['#/app/**', '#/app'], message: 'Domain layer must not depend on app layer.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ports/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'next', message: 'Ports layer must not depend on Next.js.' },
          ],
          patterns: [
            { group: ['next/**', 'next'], message: 'Ports layer must not depend on Next.js.' },
            { group: ['#/infrastructure/**', '#/infrastructure'], message: 'Ports layer must not depend on infrastructure layer.' },
            { group: ['#/app/**', '#/app'], message: 'Ports layer must not depend on app layer.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['#/infrastructure/**', '#/infrastructure'], message: 'Modules must not depend directly on infrastructure layer.' },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      // bun:test types vi.mock/mock.module as returning a Promise, but module mocks are hoisted and never awaited.
      '@typescript-eslint/no-floating-promises': [
        'error',
        { allowForKnownSafeCalls: [{ from: 'package', name: ['mock', 'module'], package: 'bun:test' }] },
      ],
      '@typescript-eslint/require-await': 'off',
    },
  }
);
