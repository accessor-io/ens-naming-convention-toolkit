// Test setup file for Jest

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.RPC_URL = 'https://eth-mainnet.alchemyapi.io/v2/demo';
process.env.SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

// Global test timeout
jest.setTimeout(30000);
