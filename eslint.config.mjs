// eslint.config.mjs
// import globals from 'globals'
import react from 'eslint-plugin-react'
import prettier from 'eslint-plugin-prettier'
import jest from 'eslint-plugin-jest'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import tseslintParser from '@typescript-eslint/parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  {
    ignores: [
      '**/*.d.ts', // Ignore declaration files
      '.eslintrc.js', // Ignore ESLint config
      '.prettierrc.js', // Ignore Prettier config
      'babel.config.js', // Ignore Babel config
      'metro.config.ts', // Ignore Metro config
      'jest.config.js',
      '.expo/',
      '.expo-shared/',
      'coverage/',
      'coverage/**',
      'node_modules/',
      'node_modules/**',
      'dist/',
      'dist/**/*',
      'generated/**/*',
      '__tests__/**/*',
      '__mocks__/**/*',
      'testRequireContext.js',
      'jest/setup.js',
      'dataconnect/**/*',
      'metro.config.js',
    ],
    files: ['**/*.{js,ts,tsx}'], // Lint these extensions
    languageOptions: {
      parser: tseslintParser, // TypeScript-ESLint parser
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.json'), // Point to your tsconfig.json
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      prettier,
      jest,
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      'prettier/prettier': ['error', {}, {usePrettierrc: true}],
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  // Jest test files configuration
  {
    files: ['__tests__/**/*', '__mocks__/**/*'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.jest.json'), // Use tsconfig.jest.json for test files
        sourceType: 'module',
      },
    },
    plugins: {
      jest,
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
]
