// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // This should point to your tsconfig
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    node: true,
    browser: true,
    jest: true,
    es2020: true,
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest', 'react'],
  extends: [
    'google',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // TypeScript rules
    'plugin:prettier/recommended', // Prettier plugin
    'plugin:jest/recommended', // Jest rules
    'plugin:react/recommended', // React rules
    'plugin:react-hooks/recommended', // React hooks
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  overrides: [
    {
      // Override for allowing require() in config files
      files: ['.eslintrc.js'], // Only apply to this file
      rules: {
        '@typescript-eslint/no-require-imports': 'off', // Allow require()
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
      },
    },
    {
      // For Jest test files and mocks
      files: ['__tests__/**/*', '__mocks__/**/*'],
      parserOptions: {
        project: './tsconfig.jest.json', // Use Jest-specific tsconfig
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx', '**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-empty': ['warn'],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {argsIgnorePattern: '^_', varsIgnorePattern: '^ignored'},
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Allow require in JS files
        'no-empty': ['warn'],
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'dist/**/*',
    'coverage/',
    'jest/',
    'metro/**',
    '.expo/',
    '.expo-shared/',
    'coverage/',
    'coverage/**',
    'generated/**/*',
    '__tests__/',
    '__mocks__/',
  ],
}
