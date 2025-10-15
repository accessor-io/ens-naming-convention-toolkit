const { ethers } = require('ethers');
const { ENSOperations } = require('../../src/core/ens-operations.js');

// Mock ethers for testing
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      namehash: jest.fn((name) => {
        // Simple mock implementation
        return '0x' + '0'.repeat(64);
      }),
      keccak256: jest.fn((data) => {
        return '0x' + '0'.repeat(64);
      }),
      toUtf8Bytes: jest.fn((str) => {
        return Buffer.from(str, 'utf8');
      }),
      formatEther: jest.fn((wei) => {
        return '1.0';
      }),
      parseEther: jest.fn((ether) => {
        return '1000000000000000000'; // 1 ETH in wei
      }),
      defaultAbiCoder: {
        encode: jest.fn((types, values) => {
          return '0x' + '0'.repeat(64);
        }),
      },
    },
    providers: {
      JsonRpcProvider: jest.fn(),
      Web3Provider: jest.fn(),
    },
    Contract: jest.fn(),
    constants: {
      AddressZero: '0x0000000000000000000000000000000000000000',
      HashZero: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
  },
}));

describe('ENS Operations', () => {
  let mockProvider;
  let mockSigner;
  let mockContracts;
  let ensOperations;

  beforeEach(() => {
    // Mock provider
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({
        name: 'mainnet',
        chainId: 1,
      }),
      getGasPrice: jest.fn().mockResolvedValue(ethers.utils.parseUnits('20', 'gwei')),
      estimateGas: jest.fn().mockResolvedValue(ethers.utils.parseUnits('21000', 'wei')),
    };

    // Mock signer
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      getBalance: jest.fn().mockResolvedValue(ethers.utils.parseEther('1.0')),
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
        wait: jest.fn().mockResolvedValue({
          blockNumber: 12345,
          gasUsed: ethers.utils.parseUnits('21000', 'wei'),
          status: 1,
        }),
      }),
    };

    // Mock contracts
    mockContracts = {
      registry: {
        owner: jest.fn(),
        resolver: jest.fn(),
        ttl: jest.fn(),
        recordExists: jest.fn(),
        setSubnodeOwner: jest.fn(),
        setResolver: jest.fn(),
        setTTL: jest.fn(),
      },
      nameWrapper: {
        isWrapped: jest.fn(),
        getData: jest.fn(),
        setSubnodeRecord: jest.fn(),
        setFuses: jest.fn(),
      },
      publicResolver: {
        setAddr: jest.fn(),
        setText: jest.fn(),
        setContenthash: jest.fn(),
      },
      reverseRegistrar: {
        setName: jest.fn(),
        claim: jest.fn(),
        claimWithResolver: jest.fn(),
      },
    };

    // Mock Contract constructor
    ethers.Contract.mockImplementation((address, abi, provider) => {
      if (address.includes('registry')) return mockContracts.registry;
      if (address.includes('nameWrapper')) return mockContracts.nameWrapper;
      if (address.includes('resolver')) return mockContracts.publicResolver;
      if (address.includes('reverseRegistrar')) return mockContracts.reverseRegistrar;
      return {};
    });

    ensOperations = new ENSOperations(mockProvider, mockSigner, 'mainnet');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Name hashing', () => {
    test('should generate namehash for domain', () => {
      const name = 'test.eth';
      const hash = ensOperations.namehash(name);
      expect(ethers.utils.namehash).toHaveBeenCalledWith(name);
      expect(hash).toMatch(/^0x[a-fA-F0-9]+$/);
    });

    test('should generate labelhash for label', () => {
      const label = 'test';
      const hash = ensOperations.labelhash(label);
      expect(ethers.utils.keccak256).toHaveBeenCalled();
      expect(hash).toMatch(/^0x[a-fA-F0-9]+$/);
    });
  });

  describe('Name information', () => {
    test('should get info for ENSv2 name', async () => {
      const name = 'test.eth';
      mockContracts.registry.owner.mockResolvedValue('0x1234567890123456789012345678901234567890');
      mockContracts.registry.resolver.mockResolvedValue(
        '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
      );
      mockContracts.registry.ttl.mockResolvedValue(3600);
      mockContracts.nameWrapper.isWrapped.mockResolvedValue(false);

      const info = await ensOperations.getInfo(name);

      expect(info.name).toBe(name);
      expect(info.isWrapped).toBe(false);
      expect(info.owner).toBe('0x1234567890123456789012345678901234567890');
      expect(info.resolver).toBe('0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63');
      expect(info.ttl).toBe(3600);
    });

    test('should get info for ENSv3 wrapped name', async () => {
      const name = 'test.eth';
      mockContracts.nameWrapper.isWrapped.mockResolvedValue(true);
      mockContracts.nameWrapper.getData.mockResolvedValue([
        '0x1234567890123456789012345678901234567890', // owner
        7, // fuses
        1234567890, // expiry
      ]);
      mockContracts.registry.resolver.mockResolvedValue(
        '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
      );

      const info = await ensOperations.getInfo(name);

      expect(info.name).toBe(name);
      expect(info.isWrapped).toBe(true);
      expect(info.owner).toBe('0x1234567890123456789012345678901234567890');
      expect(info.fuses).toBe(7);
      expect(info.expiry).toBe(1234567890);
    });
  });

  describe('Subdomain registration', () => {
    test('should register subdomain with ENSv2', async () => {
      const name = 'sub.test.eth';
      const options = {
        owner: '0x1234567890123456789012345678901234567890',
      };

      mockContracts.nameWrapper.isWrapped.mockResolvedValue(false);
      mockContracts.registry.setSubnodeOwner.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.register(name, options);

      expect(mockContracts.registry.setSubnodeOwner).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should register subdomain with ENSv3', async () => {
      const name = 'sub.test.eth';
      const options = {
        owner: '0x1234567890123456789012345678901234567890',
        fuses: 7,
        expiry: 1234567890,
      };

      mockContracts.nameWrapper.isWrapped.mockResolvedValue(true);
      mockContracts.nameWrapper.setSubnodeRecord.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.register(name, options);

      expect(mockContracts.nameWrapper.setSubnodeRecord).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should throw error if owner not provided', async () => {
      const name = 'sub.test.eth';
      const options = {};

      await expect(ensOperations.register(name, options)).rejects.toThrow(
        'Owner address is required'
      );
    });
  });

  describe('Resolver operations', () => {
    test('should set resolver', async () => {
      const name = 'test.eth';
      const resolver = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

      mockContracts.registry.setResolver.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setResolver(name, resolver);

      expect(mockContracts.registry.setResolver).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should set TTL', async () => {
      const name = 'test.eth';
      const ttl = 3600;

      mockContracts.registry.setTTL.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setTTL(name, ttl);

      expect(mockContracts.registry.setTTL).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });
  });

  describe('Fuse management', () => {
    test('should set fuses for wrapped name', async () => {
      const name = 'test.eth';
      const fuses = 7;

      mockContracts.nameWrapper.isWrapped.mockResolvedValue(true);
      mockContracts.nameWrapper.setFuses.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setFuses(name, fuses);

      expect(mockContracts.nameWrapper.setFuses).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should throw error for non-wrapped name', async () => {
      const name = 'test.eth';
      const fuses = 7;

      mockContracts.nameWrapper.isWrapped.mockResolvedValue(false);

      await expect(ensOperations.setFuses(name, fuses)).rejects.toThrow('is not wrapped');
    });

    test('should use fuse template', async () => {
      const name = 'test.eth';
      const template = 'locked';

      mockContracts.nameWrapper.isWrapped.mockResolvedValue(true);
      mockContracts.nameWrapper.setFuses.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setFuses(name, template);

      expect(mockContracts.nameWrapper.setFuses).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });
  });

  describe('Record operations', () => {
    test('should set ETH address', async () => {
      const name = 'test.eth';
      const address = '0x1234567890123456789012345678901234567890';

      mockContracts.publicResolver.setAddr.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setAddress(name, address);

      expect(mockContracts.publicResolver.setAddr).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should set text record', async () => {
      const name = 'test.eth';
      const key = 'description';
      const value = 'Test domain';

      mockContracts.publicResolver.setText.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setText(name, key, value);

      expect(mockContracts.publicResolver.setText).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should set content hash', async () => {
      const name = 'test.eth';
      const hash = '0x' + '0'.repeat(64);

      mockContracts.publicResolver.setContenthash.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setContentHash(name, hash);

      expect(mockContracts.publicResolver.setContenthash).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });
  });

  describe('Reverse resolution', () => {
    test('should set reverse record', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      const name = 'test.eth';

      mockContracts.reverseRegistrar.setName.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.setReverseRecord(address, name);

      expect(mockContracts.reverseRegistrar.setName).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });

    test('should claim reverse record', async () => {
      const address = '0x1234567890123456789012345678901234567890';

      mockContracts.reverseRegistrar.claim.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const result = await ensOperations.claimReverseRecord(address);

      expect(mockContracts.reverseRegistrar.claim).toHaveBeenCalled();
      expect(result.hash).toBe('0x' + '0'.repeat(64));
    });
  });

  describe('Fuse information', () => {
    test('should get fuse information', async () => {
      const name = 'test.eth';
      mockContracts.nameWrapper.isWrapped.mockResolvedValue(true);
      mockContracts.nameWrapper.getData.mockResolvedValue([
        '0x1234567890123456789012345678901234567890', // owner
        7, // fuses (CANNOT_UNWRAP | CANNOT_BURN_FUSES | CANNOT_TRANSFER)
        1234567890, // expiry
      ]);

      const fuseInfo = await ensOperations.getFuses(name);

      expect(fuseInfo.isWrapped).toBe(true);
      expect(fuseInfo.fuses).toBe(7);
      expect(fuseInfo.expiry).toBe(1234567890);
      expect(fuseInfo.burnedFuses).toHaveLength(3);
    });

    test('should return empty for non-wrapped name', async () => {
      const name = 'test.eth';
      mockContracts.nameWrapper.isWrapped.mockResolvedValue(false);

      const fuseInfo = await ensOperations.getFuses(name);

      expect(fuseInfo.isWrapped).toBe(false);
      expect(fuseInfo.fuses).toBe(null);
      expect(fuseInfo.expiry).toBe(null);
    });
  });

  describe('Utility functions', () => {
    test('should check if name exists', async () => {
      const name = 'test.eth';
      mockContracts.registry.recordExists.mockResolvedValue(true);

      const exists = await ensOperations.nameExists(name);

      expect(exists).toBe(true);
      expect(mockContracts.registry.recordExists).toHaveBeenCalled();
    });

    test('should get fuse templates', () => {
      const templates = ensOperations.getFuseTemplates();

      expect(templates).toHaveProperty('locked');
      expect(templates).toHaveProperty('immutable');
      expect(templates).toHaveProperty('subdomain-locked');
    });

    test('should get fuse definitions', () => {
      const definitions = ensOperations.getFuseDefinitions();

      expect(definitions).toHaveProperty('CANNOT_UNWRAP');
      expect(definitions).toHaveProperty('CANNOT_BURN_FUSES');
      expect(definitions).toHaveProperty('CANNOT_TRANSFER');
    });
  });

  describe('Batch operations', () => {
    test('should execute batch operations', async () => {
      const operations = [
        {
          type: 'setResolver',
          name: 'test.eth',
          resolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
        },
        {
          type: 'setText',
          name: 'test.eth',
          key: 'description',
          value: 'Test domain',
        },
      ];

      mockContracts.registry.setResolver.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });
      mockContracts.publicResolver.setText.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const results = await ensOperations.batch(operations);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    test('should handle batch operation failures', async () => {
      const operations = [
        {
          type: 'setResolver',
          name: 'test.eth',
          resolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
        },
        {
          type: 'invalidOperation',
          name: 'test.eth',
        },
      ];

      mockContracts.registry.setResolver.mockResolvedValue({
        hash: '0x' + '0'.repeat(64),
      });

      const results = await ensOperations.batch(operations);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('Unknown operation type');
    });
  });
});
