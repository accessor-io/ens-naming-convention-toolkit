/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.test.mjs',
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.mjs'
  ],
  collectCoverageFrom: [
    'bin/**/*.js',
    'bin/**/*.mjs',
    'prober/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  moduleFileExtensions: ['js', 'mjs', 'json'],
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ethers|@ethersproject)/)'
  ],
  testTimeout: 30000,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
