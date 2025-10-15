/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.mjs',
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.mjs',
  ],
  collectCoverageFrom: [
    'bin/**/*.mjs',
    'tools/**/*.js',
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      branches: 70,
      functions: 75,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  moduleFileExtensions: ['js', 'mjs', 'json'],
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(ethers|@ethersproject)/)'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
