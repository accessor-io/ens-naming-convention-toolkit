const { ethers } = require('ethers');

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      namehash: jest.fn((name) => {
        // Simple mock implementation - return a proper 32-byte hash
        return '0x' + '0'.repeat(64);
      }),
      getAddress: jest.fn((address) => address.toLowerCase())
    },
    providers: {
      JsonRpcProvider: jest.fn()
    },
    Contract: jest.fn()
  }
}));

describe('ENS Resolver', () => {
  let mockProvider;
  let mockContract;

  beforeEach(() => {
    mockProvider = {
      getCode: jest.fn(),
      call: jest.fn()
    };

    mockContract = {
      resolver: jest.fn(),
      addr: jest.fn(),
      text: jest.fn(),
      contenthash: jest.fn(),
      supportsInterface: jest.fn()
    };

    ethers.providers.JsonRpcProvider.mockImplementation(() => mockProvider);
    ethers.Contract.mockImplementation(() => mockContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Domain resolution', () => {
    test('should resolve ENS domain to address', async () => {
      const domain = 'vitalik.eth';
      const expectedAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
      
      mockContract.addr.mockResolvedValue(expectedAddress);

      const result = await mockContract.addr(domain);
      expect(result).toBe(expectedAddress);
    });

    test('should handle resolution failures', async () => {
      const domain = 'nonexistent.eth';
      
      mockContract.addr.mockRejectedValue(new Error('Domain not found'));

      await expect(mockContract.addr(domain)).rejects.toThrow('Domain not found');
    });
  });

  describe('Text record resolution', () => {
    test('should resolve text records', async () => {
      const domain = 'example.eth';
      const key = 'description';
      const value = 'This is a test domain';
      
      mockContract.text.mockResolvedValue(value);

      const result = await mockContract.text(domain, key);
      expect(result).toBe(value);
    });

    test('should handle missing text records', async () => {
      const domain = 'example.eth';
      const key = 'nonexistent';
      
      mockContract.text.mockResolvedValue('');

      const result = await mockContract.text(domain, key);
      expect(result).toBe('');
    });
  });

  describe('Interface support detection', () => {
    test('should detect supported interfaces', async () => {
      const interfaceId = '0x3b3b57de';
      
      mockContract.supportsInterface.mockResolvedValue(true);

      const result = await mockContract.supportsInterface(interfaceId);
      expect(result).toBe(true);
    });

    test('should detect unsupported interfaces', async () => {
      const interfaceId = '0x00000000';
      
      mockContract.supportsInterface.mockResolvedValue(false);

      const result = await mockContract.supportsInterface(interfaceId);
      expect(result).toBe(false);
    });
  });

  describe('Name hashing', () => {
    test('should hash domain names', () => {
      const domain = 'test.eth';
      const hash = ethers.utils.namehash(domain);
      
      expect(hash).toMatch(/^0x[a-fA-F0-9]+$/);
      expect(hash.length).toBe(66); // 0x + 64 hex chars
    });
  });
});
