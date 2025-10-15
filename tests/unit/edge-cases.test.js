/**
 * Edge Cases Test Suite
 *
 * Tests edge cases and error handling for ENS metadata validation
 */

const fs = require('fs');
const path = require('path');

describe('Edge Cases and Error Handling', () => {
  describe('Circular Inheritance Detection', () => {
    test('should detect circular inheritance in hierarchy', () => {
      const circularHierarchy = {
        projectA: {
          inherits: ['projectB'],
        },
        projectB: {
          inherits: ['projectC'],
        },
        projectC: {
          inherits: ['projectA'], // Circular reference
        },
      };

      // Test circular detection logic
      const detectCircular = (hierarchy) => {
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (node) => {
          if (recursionStack.has(node)) return true;
          if (visited.has(node)) return false;

          visited.add(node);
          recursionStack.add(node);

          const dependencies = hierarchy[node]?.inherits || [];
          for (const dep of dependencies) {
            if (hasCycle(dep)) return true;
          }

          recursionStack.delete(node);
          return false;
        };

        for (const node of Object.keys(hierarchy)) {
          if (hasCycle(node)) return true;
        }
        return false;
      };

      expect(detectCircular(circularHierarchy)).toBe(true);
    });

    test('should handle deep inheritance chains', () => {
      const deepHierarchy = {};
      for (let i = 0; i < 15; i++) {
        deepHierarchy[`level${i}`] = {
          inherits: i > 0 ? [`level${i - 1}`] : [],
        };
      }

      const detectCircular = (hierarchy) => {
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (node) => {
          if (recursionStack.has(node)) return true;
          if (visited.has(node)) return false;

          visited.add(node);
          recursionStack.add(node);

          const dependencies = hierarchy[node]?.inherits || [];
          for (const dep of dependencies) {
            if (hasCycle(dep)) return true;
          }

          recursionStack.delete(node);
          return false;
        };

        for (const node of Object.keys(hierarchy)) {
          if (hasCycle(node)) return true;
        }
        return false;
      };

      expect(detectCircular(deepHierarchy)).toBe(false);
    });
  });

  describe('Cross-Chain Contract Handling', () => {
    test('should validate multiple chain IDs', () => {
      const multiChainMetadata = {
        id: 'uniswap.v3.defi.router.v3.1.1',
        org: 'uniswap',
        protocol: 'v3',
        category: 'defi',
        role: 'router',
        version: 'v3-1-1',
        chainId: 1,
        addresses: [
          { chainId: 1, address: '0xE592427A0AEce92De3Edee1F18E0157C05861564' },
          { chainId: 137, address: '0xE592427A0AEce92De3Edee1F18E0157C05861564' },
          { chainId: 56, address: '0xE592427A0AEce92De3Edee1F18E0157C05861564' },
        ],
      };

      const validateChainIds = (metadata) => {
        const chainIds = metadata.addresses.map((addr) => addr.chainId);
        const uniqueChainIds = [...new Set(chainIds)];
        const supportedChainIds = [1, 137, 56, 250, 43114, 42161, 10, 8453];

        return {
          isValid: uniqueChainIds.every((id) => supportedChainIds.includes(id)),
          chainIds: uniqueChainIds,
          unsupported: uniqueChainIds.filter((id) => !supportedChainIds.includes(id)),
        };
      };

      const result = validateChainIds(multiChainMetadata);
      expect(result.isValid).toBe(true);
      expect(result.chainIds).toEqual([1, 137, 56]);
    });

    test('should reject unsupported chain IDs', () => {
      const unsupportedChainMetadata = {
        addresses: [{ chainId: 999999, address: '0xE592427A0AEce92De3Edee1F18E0157C05861564' }],
      };

      const validateChainIds = (metadata) => {
        const chainIds = metadata.addresses.map((addr) => addr.chainId);
        const uniqueChainIds = [...new Set(chainIds)];
        const supportedChainIds = [1, 137, 56, 250, 43114, 42161, 10, 8453];

        return {
          isValid: uniqueChainIds.every((id) => supportedChainIds.includes(id)),
          chainIds: uniqueChainIds,
          unsupported: uniqueChainIds.filter((id) => !supportedChainIds.includes(id)),
        };
      };

      const result = validateChainIds(unsupportedChainMetadata);
      expect(result.isValid).toBe(false);
      expect(result.unsupported).toEqual([999999]);
    });
  });

  describe('Proxy Variant Validation', () => {
    test('should validate transparent proxy configuration', () => {
      const transparentProxy = {
        proxy: {
          proxyType: 'transparent',
          implementationAddress: '0x1234567890123456789012345678901234567890',
          proxyAdmin: '0x0987654321098765432109876543210987654321',
          implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        },
      };

      const validateProxy = (metadata) => {
        const proxy = metadata.proxy;
        if (!proxy) return { isValid: true };

        const supportedTypes = ['transparent', 'uups', 'beacon', 'diamond', 'minimal', 'immutable'];
        const isValidType = supportedTypes.includes(proxy.proxyType);

        const addressPattern = /^0x[a-fA-F0-9]{40}$/;
        const isValidImplementation = addressPattern.test(proxy.implementationAddress);

        const hasAdmin = proxy.proxyType === 'transparent' ? !!proxy.proxyAdmin : true;

        return {
          isValid: isValidType && isValidImplementation && hasAdmin,
          errors: [],
        };
      };

      const result = validateProxy(transparentProxy);
      expect(result.isValid).toBe(true);
    });

    test('should validate UUPS proxy configuration', () => {
      const uupsProxy = {
        proxy: {
          proxyType: 'uups',
          implementationAddress: '0x1234567890123456789012345678901234567890',
          implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        },
      };

      const validateProxy = (metadata) => {
        const proxy = metadata.proxy;
        if (!proxy) return { isValid: true };

        const supportedTypes = ['transparent', 'uups', 'beacon', 'diamond', 'minimal', 'immutable'];
        const isValidType = supportedTypes.includes(proxy.proxyType);

        const addressPattern = /^0x[a-fA-F0-9]{40}$/;
        const isValidImplementation = addressPattern.test(proxy.implementationAddress);

        const hasAdmin = proxy.proxyType === 'transparent' ? !!proxy.proxyAdmin : true;

        return {
          isValid: isValidType && isValidImplementation && hasAdmin,
          errors: [],
        };
      };

      const result = validateProxy(uupsProxy);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Deprecated Field Handling', () => {
    test('should migrate deprecated domain field to category', () => {
      const deprecatedMetadata = {
        id: 'test.metadata.v1.0.1',
        org: 'test',
        protocol: 'test',
        domain: 'defi', // Deprecated field
        role: 'test',
        version: 'v1-0-0',
        chainId: 1,
        addresses: [],
      };

      const migrateDeprecatedFields = (metadata) => {
        const migrationMap = { domain: 'category' };
        const migrated = { ...metadata };
        const warnings = [];

        for (const [deprecated, newField] of Object.entries(migrationMap)) {
          if (deprecated in migrated) {
            if (!(newField in migrated)) {
              migrated[newField] = migrated[deprecated];
            }
            warnings.push(`Deprecated field '${deprecated}' found. Use '${newField}' instead.`);
            delete migrated[deprecated];
          }
        }

        return { migrated, warnings };
      };

      const result = migrateDeprecatedFields(deprecatedMetadata);
      expect(result.migrated.category).toBe('defi');
      expect(result.migrated.domain).toBeUndefined();
      expect(result.warnings).toContain("Deprecated field 'domain' found. Use 'category' instead.");
    });
  });

  describe('Version Conflict Resolution', () => {
    test('should resolve version conflicts using child-wins strategy', () => {
      const parentMetadata = { version: 'v1-0-0' };
      const childMetadata = { version: 'v2-0-0' };

      const resolveVersionConflict = (parent, child, strategy = 'child-wins') => {
        if (parent.version === child.version) {
          return { version: parent.version, conflict: false };
        }

        switch (strategy) {
          case 'child-wins':
            return { version: child.version, conflict: true, resolved: 'child' };
          case 'parent-wins':
            return { version: parent.version, conflict: true, resolved: 'parent' };
          case 'error':
            throw new Error(`Version conflict: parent=${parent.version}, child=${child.version}`);
          default:
            return { version: child.version, conflict: true, resolved: 'child' };
        }
      };

      const result = resolveVersionConflict(parentMetadata, childMetadata);
      expect(result.version).toBe('v2-0-0');
      expect(result.conflict).toBe(true);
      expect(result.resolved).toBe('child');
    });
  });

  describe('Malformed Address Handling', () => {
    test('should validate Ethereum address format', () => {
      const testAddresses = [
        '0x1234567890123456789012345678901234567890', // Valid
        '0x123456789012345678901234567890123456789', // Too short
        '0x12345678901234567890123456789012345678901', // Too long
        '0x123456789012345678901234567890123456789g', // Invalid character
        '1234567890123456789012345678901234567890', // Missing 0x prefix
        '', // Empty
      ];

      const validateAddress = (address) => {
        const pattern = /^0x[a-fA-F0-9]{40}$/;
        return {
          isValid: pattern.test(address),
          hasPrefix: address.startsWith('0x'),
          correctLength: address.length === 42,
          validChars: /^0x[a-fA-F0-9]+$/.test(address),
        };
      };

      const results = testAddresses.map(validateAddress);

      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(false);
      expect(results[3].isValid).toBe(false);
      expect(results[4].isValid).toBe(false);
      expect(results[5].isValid).toBe(false);
    });

    test('should validate checksummed addresses', () => {
      const checksummedAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
      const lowercaseAddress = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
      const invalidChecksum = '0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED';

      const validateChecksum = (address) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return { isValid: false, reason: 'Invalid format' };
        }

        // Simple checksum validation - check if address has mixed case
        const hasMixedCase = /[a-f]/.test(address) && /[A-F]/.test(address);
        const isAllLowercase = address === address.toLowerCase();
        const isAllUppercase = address === address.toUpperCase();

        // A properly checksummed address should have mixed case
        // An all-lowercase address is valid but not checksummed
        // An all-uppercase address is invalid
        return {
          isValid: hasMixedCase || isAllLowercase,
          isChecksummed: hasMixedCase,
          isAllLowercase: isAllLowercase,
          isAllUppercase: isAllUppercase,
        };
      };

      const result1 = validateChecksum(checksummedAddress);
      const result2 = validateChecksum(lowercaseAddress);
      const result3 = validateChecksum(invalidChecksum);

      expect(result1.isValid).toBe(true);
      expect(result1.isChecksummed).toBe(true);
      expect(result2.isValid).toBe(true);
      expect(result2.isAllLowercase).toBe(true);
      expect(result3.isValid).toBe(false);
      expect(result3.isAllUppercase).toBe(true);
    });
  });

  describe('Empty Metadata Handling', () => {
    test('should reject empty metadata objects', () => {
      const emptyMetadata = {};

      const validateMinimumFields = (metadata) => {
        const requiredFields = [
          'id',
          'org',
          'protocol',
          'category',
          'role',
          'version',
          'chainId',
          'addresses',
        ];
        const missingFields = requiredFields.filter((field) => !(field in metadata));

        return {
          isValid: missingFields.length === 0,
          missingFields,
          hasMinimumFields: Object.keys(metadata).length > 0,
        };
      };

      const result = validateMinimumFields(emptyMetadata);
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual([
        'id',
        'org',
        'protocol',
        'category',
        'role',
        'version',
        'chainId',
        'addresses',
      ]);
      expect(result.hasMinimumFields).toBe(false);
    });

    test('should handle minimal valid metadata', () => {
      const minimalMetadata = {
        id: 'test.metadata.v1.0.1',
        org: 'test',
        protocol: 'test',
        category: 'defi',
        role: 'test',
        version: 'v1-0-0',
        chainId: 1,
        addresses: [],
      };

      const validateMinimumFields = (metadata) => {
        const requiredFields = [
          'id',
          'org',
          'protocol',
          'category',
          'role',
          'version',
          'chainId',
          'addresses',
        ];
        const missingFields = requiredFields.filter((field) => !(field in metadata));

        return {
          isValid: missingFields.length === 0,
          missingFields,
          hasMinimumFields: Object.keys(metadata).length > 0,
        };
      };

      const result = validateMinimumFields(minimalMetadata);
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
      expect(result.hasMinimumFields).toBe(true);
    });
  });

  describe('Null and Undefined Value Handling', () => {
    test('should handle null values gracefully', () => {
      const metadataWithNulls = {
        id: null,
        org: 'test',
        protocol: undefined,
        category: 'defi',
        role: 'test',
        version: 'v1-0-0',
        chainId: 1,
        addresses: [],
      };

      const handleNullValues = (metadata) => {
        const processed = { ...metadata };
        const warnings = [];

        for (const [key, value] of Object.entries(processed)) {
          if (value === null) {
            warnings.push(`Field '${key}' is null`);
            delete processed[key];
          } else if (value === undefined) {
            warnings.push(`Field '${key}' is undefined`);
            delete processed[key];
          }
        }

        return { processed, warnings };
      };

      const result = handleNullValues(metadataWithNulls);
      expect(result.processed.id).toBeUndefined();
      expect(result.processed.protocol).toBeUndefined();
      expect(result.warnings).toContain("Field 'id' is null");
      expect(result.warnings).toContain("Field 'protocol' is undefined");
    });

    test('should apply default values for missing fields', () => {
      const incompleteMetadata = {
        org: 'test',
        protocol: 'test',
        category: 'defi',
        role: 'test',
      };

      const applyDefaults = (metadata) => {
        const defaults = {
          chainId: 1,
          version: 'v1-0-0',
          addresses: [],
        };

        const processed = { ...metadata };
        const appliedDefaults = [];

        for (const [key, value] of Object.entries(defaults)) {
          if (!(key in processed)) {
            processed[key] = value;
            appliedDefaults.push(key);
          }
        }

        return { processed, appliedDefaults };
      };

      const result = applyDefaults(incompleteMetadata);
      expect(result.processed.chainId).toBe(1);
      expect(result.processed.version).toBe('v1-0-0');
      expect(result.processed.addresses).toEqual([]);
      expect(result.appliedDefaults).toEqual(['chainId', 'version', 'addresses']);
    });
  });

  describe('Category and Subcategory Validation', () => {
    test('should validate all supported categories', () => {
      const supportedCategories = [
        'defi',
        'dao',
        'l2',
        'infra',
        'token',
        'nft',
        'gaming',
        'social',
        'identity',
        'privacy',
        'security',
        'wallet',
        'analytics',
        'rwa',
        'supply',
        'health',
        'finance',
        'dev',
        'art',
        'interop',
      ];

      const validateCategory = (category) => {
        return supportedCategories.includes(category);
      };

      supportedCategories.forEach((category) => {
        expect(validateCategory(category)).toBe(true);
      });

      expect(validateCategory('invalid')).toBe(false);
      expect(validateCategory('')).toBe(false);
      expect(validateCategory(null)).toBe(false);
    });

    test('should validate subcategories for each category', () => {
      const categorySubcategories = {
        defi: [
          'amm',
          'lending',
          'stablecoin',
          'yield',
          'perps',
          'options',
          'derivatives',
          'dex-aggregator',
          'asset-management',
          'liquid-staking',
          'cdps',
          'synthetics',
          'insurance',
        ],
        dao: ['governor', 'timelock', 'treasury', 'voting', 'multisig', 'module'],
        l2: [
          'optimistic-rollup',
          'zk-rollup',
          'validium',
          'da-layer',
          'bridge',
          'sequencer',
          'prover',
        ],
        infra: [
          'oracle',
          'relayer',
          'rpc',
          'indexer',
          'subgraph',
          'event-stream',
          'data-availability',
        ],
        token: ['erc20', 'erc721', 'erc1155', 'governance-token', 'rwa', 'wrapped', 'bridged'],
        nft: ['marketplace', 'launchpad', 'royalty', 'metadata', 'rental'],
        gaming: ['nft-game', 'engine', 'marketplace', 'loot', 'economy'],
        social: ['protocol', 'messaging', 'profile', 'feed', 'moderation'],
        identity: ['ens', 'did', 'attestations', 'verifiable-credentials'],
        privacy: ['mixer', 'zk-id', 'shielded-pool', 'fhe', 'mev-protection'],
        security: ['auditor', 'monitoring', 'scanning', 'incident-response', 'bug-bounty'],
        wallet: ['eoa', 'aa-4337', 'mpc', 'custody', 'payment-processor', 'onramp', 'offramp'],
        analytics: ['indexer', 'dashboard', 'analytics-service'],
        rwa: ['real-estate', 'commodities', 'treasuries', 'invoices'],
        supply: ['tracking', 'verification', 'logistics', 'compliance'],
        health: ['medical-records', 'data-sharing', 'consent'],
        finance: ['banking', 'settlement', 'custody', 'compliance'],
        dev: ['framework', 'testing', 'deployment', 'debugging', 'plugins'],
        art: ['platform', 'curation', 'royalty', 'minting'],
        interop: ['bridge', 'messaging', 'light-client'],
      };

      const validateSubcategory = (category, subcategory) => {
        const validSubcategories = categorySubcategories[category] || [];
        return validSubcategories.includes(subcategory);
      };

      // Test valid subcategories
      expect(validateSubcategory('defi', 'amm')).toBe(true);
      expect(validateSubcategory('dao', 'governor')).toBe(true);
      expect(validateSubcategory('l2', 'bridge')).toBe(true);

      // Test invalid subcategories
      expect(validateSubcategory('defi', 'invalid')).toBe(false);
      expect(validateSubcategory('dao', 'amm')).toBe(false);
      expect(validateSubcategory('invalid', 'amm')).toBe(false);
    });
  });

  describe('Alias Handling', () => {
    test('should resolve category aliases', () => {
      const aliases = {
        infrastructure: 'infra',
        healthcare: 'health',
        payments: 'wallet:payment-processor',
        insurance: 'defi:insurance',
        l2: 'l2',
        tokens: 'token',
        developer: 'dev',
        supplychain: 'supply',
      };

      const resolveAlias = (input) => {
        if (aliases[input]) {
          return aliases[input];
        }
        return input;
      };

      expect(resolveAlias('infrastructure')).toBe('infra');
      expect(resolveAlias('healthcare')).toBe('health');
      expect(resolveAlias('tokens')).toBe('token');
      expect(resolveAlias('developer')).toBe('dev');
      expect(resolveAlias('supplychain')).toBe('supply');
      expect(resolveAlias('defi')).toBe('defi'); // No alias
    });
  });
});
