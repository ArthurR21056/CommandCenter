module.exports = {
  testEnvironment: 'node',
  resetModules: true,
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    // index.js excluded: require.main===module branch can't be hit in tests
    // db/database.js excluded: migration false-branch unreachable with fresh :memory: DB
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
  },
};
