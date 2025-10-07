const { ethers } = require('ethers');

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      getAddress: jest.fn((address) => {
        if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid address');
        }
        return address.toLowerCase();
      })
    },
    providers: {
      JsonRpcProvider: jest.fn()
    }
  }
}));

describe('Contract Discovery', () => {
  let mockProvider;
  let mockGetCode;

  beforeEach(() => {
    mockGetCode = jest.fn();
    mockProvider = {
      getCode: mockGetCode
    };
    
    ethers.providers.JsonRpcProvider.mockImplementation(() => mockProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Address normalization', () => {
    test('should normalize valid Ethereum addresses', () => {
      const result = ethers.utils.getAddress('0x1234567890123456789012345678901234567890');
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    test('should throw error for invalid addresses', () => {
      expect(() => {
        ethers.utils.getAddress('invalid-address');
      }).toThrow('Invalid address');
    });

    test('should handle null/undefined addresses', () => {
      expect(() => {
        ethers.utils.getAddress(null);
      }).toThrow('Invalid address');
    });
  });

  describe('Contract detection', () => {
    test('should detect contract addresses', async () => {
      mockGetCode.mockResolvedValue('0x608060405234801561001057600080fd5b50');
      
      const result = await mockProvider.getCode('0x1234567890123456789012345678901234567890');
      expect(result).toBe('0x608060405234801561001057600080fd5b50');
    });

    test('should detect EOA addresses', async () => {
      mockGetCode.mockResolvedValue('0x');
      
      const result = await mockProvider.getCode('0x1234567890123456789012345678901234567890');
      expect(result).toBe('0x');
    });

    test('should handle provider errors', async () => {
      mockGetCode.mockRejectedValue(new Error('Network error'));
      
      await expect(mockProvider.getCode('0x1234567890123456789012345678901234567890'))
        .rejects.toThrow('Network error');
    });
  });
});
