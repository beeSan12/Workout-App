// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|expo-router|expo-asset|expo-splash-screen|expo-modules-core|expo-font|firebase|@firebase|react-countdown|pullstate)/)',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: '<rootDir>/__tests__/docs/Report/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status',
      },
    ],
  ],
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/lib/commonjs/index.js',
    '\\.(ttf|png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.tsx', // Mock image imports
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/FirebaseConfig.ts',
    '<rootDir>/app/hooks/store.tsx',
  ],
}