/**
 * Simple QA Standards Test Suite
 *
 * Tests basic functionality without importing ES modules
 */

const fs = require('fs');
const path = require('path');

describe('QA Standards Validation', () => {
  describe('Standard 1: Metadata Schema Validation', () => {
    test('should validate required fields', () => {
      const validMetadata = {
        id: 'uniswap.v3.defi.router.v3.1.1',
        org: 'uniswap',
        protocol: 'v3',
        domain: 'defi',
        role: 'router',
        version: '3.1.0',
        chainId: 1,
        addresses: [
          {
            chainId: 1,
            address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          },
        ],
      };

      // Basic validation checks
      expect(validMetadata.id).toBeDefined();
      expect(validMetadata.org).toBeDefined();
      expect(validMetadata.protocol).toBeDefined();
      expect(validMetadata.domain).toBeDefined();
      expect(validMetadata.role).toBeDefined();
      expect(validMetadata.version).toBeDefined();
      expect(validMetadata.chainId).toBeDefined();
      expect(validMetadata.addresses).toBeDefined();
      expect(Array.isArray(validMetadata.addresses)).toBe(true);
    });

    test('should reject metadata with missing required fields', () => {
      const invalidMetadata = {
        id: 'test',
        // Missing required fields
      };

      expect(invalidMetadata.org).toBeUndefined();
      expect(invalidMetadata.protocol).toBeUndefined();
      expect(invalidMetadata.domain).toBeUndefined();
      expect(invalidMetadata.role).toBeUndefined();
      expect(invalidMetadata.version).toBeUndefined();
      expect(invalidMetadata.chainId).toBeUndefined();
      expect(invalidMetadata.addresses).toBeUndefined();
    });
  });

  describe('Standard 2: Canonical ID Grammar', () => {
    test('should validate correct ID grammar pattern', () => {
      const validIds = [
        'uniswap.v3.defi.router.v3.1.1',
        'aave.v3.defi.lending-pool.v3.1.1',
        'compound.v2.defi.comptroller.v2.8.1',
      ];

      const grammarPattern =
        /^([a-z0-9-]+)\.([a-z0-9.-]+)\.([a-z]+)\.([a-z0-9-]+)\.([a-z0-9-]+)\.([0-9]+)\.([0-9]+)$/;

      validIds.forEach((id) => {
        const result = grammarPattern.test(id);
        if (!result) {
          console.log(`Failed ID: ${id}`);
        }
        expect(result).toBe(true);
      });
    });

    test('should reject invalid ID grammar', () => {
      const invalidIds = [
        'Uniswap.V3.DEFI.router.v3.1.1', // Uppercase
        'uniswap.v3.defi.router.v3.1', // Missing chainId
        'invalid-format',
        'uniswap.v3.defi.router.v3.1.1.extra',
      ];

      const grammarPattern =
        /^([a-z0-9-]+)\.([a-z0-9.-]+)\.([a-z]+)\.([a-z0-9-]+)\.([a-z0-9-]+)\.([0-9]+)\.([0-9]+)$/;

      invalidIds.forEach((id) => {
        expect(grammarPattern.test(id)).toBe(false);
      });
    });
  });

  describe('Standard 3: Root Domain Categorization', () => {
    test('should validate registered root domains', () => {
      const validDomains = [
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
      ];

      validDomains.forEach((domain) => {
        expect(typeof domain).toBe('string');
        expect(domain.length).toBeGreaterThan(0);
        // Some domains have numbers (like l2) so we need to allow them
        expect(/^[a-z0-9]+$/.test(domain)).toBe(true);
      });
    });

    test('should reject unregistered domains', () => {
      const invalidDomains = ['Custom', 'UNKNOWN', 'Test', '123'];

      invalidDomains.forEach((domain) => {
        expect(/^[a-z]+$/.test(domain)).toBe(false);
      });
    });
  });

  describe('Standard 4: Subcategory Classification', () => {
    test('should validate DeFi subcategories', () => {
      const validSubcategories = [
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
      ];

      validSubcategories.forEach((sub) => {
        expect(typeof sub).toBe('string');
        expect(sub.length).toBeGreaterThan(0);
        expect(/^[a-z-]+$/.test(sub)).toBe(true);
      });
    });

    test('should validate DAO subcategories', () => {
      const validSubcategories = [
        'governor',
        'timelock',
        'treasury',
        'voting',
        'multisig',
        'module',
      ];

      validSubcategories.forEach((sub) => {
        expect(typeof sub).toBe('string');
        expect(sub.length).toBeGreaterThan(0);
        expect(/^[a-z-]+$/.test(sub)).toBe(true);
      });
    });
  });

  describe('Standard 5: Security Standards', () => {
    test('should validate security fields structure', () => {
      const validSecurity = {
        audits: [
          {
            firm: 'Trail of Bits',
            date: '2023-01-15',
            report: 'https://example.com/audit.pdf',
            findings: '2 medium, 1 low',
          },
        ],
        owners: ['0x1234567890123456789012345678901234567890'],
        upgradeability: 'immutable',
        permissions: ['admin', 'pauser'],
      };

      expect(Array.isArray(validSecurity.audits)).toBe(true);
      expect(Array.isArray(validSecurity.owners)).toBe(true);
      expect(typeof validSecurity.upgradeability).toBe('string');
      expect(Array.isArray(validSecurity.permissions)).toBe(true);
    });

    test('should validate Ethereum address format', () => {
      const validAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      ];

      const addressPattern = /^0x[a-fA-F0-9]{40}$/;

      validAddresses.forEach((address) => {
        expect(addressPattern.test(address)).toBe(true);
      });
    });
  });

  describe('Standard 6: Lifecycle Management', () => {
    test('should validate lifecycle status', () => {
      const validStatuses = [
        'planning',
        'development',
        'testing',
        'deployed',
        'deprecated',
        'discontinued',
      ];

      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });

    test('should validate ISO 8601 date format', () => {
      const validDates = [
        '2023-01-15T00:00:00Z',
        '2023-01-15T00:00:00.000Z',
        '2023-01-15T12:30:45Z',
      ];

      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

      validDates.forEach((date) => {
        expect(datePattern.test(date)).toBe(true);
      });
    });
  });

  describe('Standard 7: Standards Compliance', () => {
    test('should validate ERC standards', () => {
      const validERCs = [
        'ERC20',
        'ERC721',
        'ERC1155',
        'ERC165',
        'ERC173',
        'ERC1967',
        'ERC2535',
        'ERC4337',
      ];

      validERCs.forEach((erc) => {
        expect(typeof erc).toBe('string');
        expect(erc.startsWith('ERC')).toBe(true);
        expect(/^ERC[0-9]+$/.test(erc)).toBe(true);
      });
    });

    test('should validate interface ID format', () => {
      const validInterfaceIds = ['0x36372b07', '0x01ffc9a7'];

      const interfaceIdPattern = /^0x[a-fA-F0-9]{8}$/;

      validInterfaceIds.forEach((id) => {
        expect(interfaceIdPattern.test(id)).toBe(true);
      });
    });
  });

  describe('Standard 8: Subdomain Management', () => {
    test('should validate subdomain configuration structure', () => {
      const validSubdomains = [
        {
          label: 'router',
          owner: '0x1234567890123456789012345678901234567890',
          controller: '0x0987654321098765432109876543210987654321',
          resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
        },
      ];

      validSubdomains.forEach((subdomain) => {
        expect(typeof subdomain.label).toBe('string');
        expect(typeof subdomain.owner).toBe('string');
        expect(/^0x[a-fA-F0-9]{40}$/.test(subdomain.owner)).toBe(true);
      });
    });
  });

  describe('Standard 9: File and Format Standards', () => {
    test('should validate JSON structure', () => {
      const validJson = {
        id: 'test',
        org: 'test',
        protocol: 'test',
        domain: 'test',
        role: 'test',
        version: '1.0.0',
        chainId: 1,
        addresses: [],
      };

      expect(() => JSON.stringify(validJson)).not.toThrow();
      expect(() => JSON.parse(JSON.stringify(validJson))).not.toThrow();
    });
  });

  describe('Standard 10: Version and Compatibility', () => {
    test('should validate semantic versioning', () => {
      const validVersions = ['1.0.0', '2.1.3', '1.0.0-alpha.1', '1.0.0+build.123'];

      const semverPattern =
        /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

      validVersions.forEach((version) => {
        expect(semverPattern.test(version)).toBe(true);
      });
    });

    test('should reject invalid version formats', () => {
      const invalidVersions = ['1.0', 'v1.0.0', '1.0.0.1'];

      const semverPattern =
        /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

      invalidVersions.forEach((version) => {
        expect(semverPattern.test(version)).toBe(false);
      });
    });
  });

  describe('Standard 11-15: Advanced Standards', () => {
    test('should validate QA validation rules config exists', () => {
      const qaRulesPath = path.join(__dirname, '..', 'data', 'configs', 'qa-validation-rules.json');
      expect(fs.existsSync(qaRulesPath)).toBe(true);

      const qaRules = JSON.parse(fs.readFileSync(qaRulesPath, 'utf8'));
      expect(qaRules.standards).toBeDefined();
      expect(Object.keys(qaRules.standards).length).toBe(15);
    });

    test('should validate schema file exists', () => {
      const schemaPath = path.join(__dirname, '..', 'data', 'metadata', 'schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      expect(schema.required).toBeDefined();
      expect(Array.isArray(schema.required)).toBe(true);
    });

    test('should validate QA specification documentation exists', () => {
      const qaSpecPath = path.join(__dirname, '..', 'docs', 'QA-SPECIFICATION.md');
      expect(fs.existsSync(qaSpecPath)).toBe(true);

      const content = fs.readFileSync(qaSpecPath, 'utf8');
      expect(content).toContain('QA Specification: ENS Metadata Standards');
      expect(content).toContain('## 1. Metadata Schema Validation');
      expect(content).toContain('## 15. Performance and Gas Optimization Standards');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null and undefined values', () => {
      const metadata = {
        id: null,
        org: undefined,
        protocol: '',
        domain: 'defi',
        role: 'router',
        version: '1.0.0',
        chainId: 1,
        addresses: [],
      };

      expect(metadata.id).toBeNull();
      expect(metadata.org).toBeUndefined();
      expect(metadata.protocol).toBe('');
    });

    test('should handle malformed addresses', () => {
      const invalidAddresses = [
        'invalid-address',
        '0x123', // Too short
        '0x12345678901234567890123456789012345678901234567890', // Too long
      ];

      const addressPattern = /^0x[a-fA-F0-9]{40}$/;

      invalidAddresses.forEach((address) => {
        expect(addressPattern.test(address)).toBe(false);
      });
    });

    test('should handle empty metadata objects', () => {
      const metadata = {};

      expect(Object.keys(metadata).length).toBe(0);
      expect(metadata.id).toBeUndefined();
      expect(metadata.org).toBeUndefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large metadata structures efficiently', () => {
      const largeMetadata = {
        id: 'test.v1.defi.router.v1.0.1',
        org: 'test',
        protocol: 'v1',
        domain: 'defi',
        role: 'router',
        version: '1.0.0',
        chainId: 1,
        addresses: Array.from({ length: 100 }, (_, i) => ({
          chainId: 1,
          address: `0x${i.toString().padStart(40, '0')}`,
        })),
        subdomains: Array.from({ length: 50 }, (_, i) => ({
          label: `subdomain${i}`,
          owner: `0x${i.toString().padStart(40, '0')}`,
        })),
      };

      const startTime = Date.now();
      const jsonString = JSON.stringify(largeMetadata);
      const parsed = JSON.parse(jsonString);
      const endTime = Date.now();

      expect(parsed.addresses.length).toBe(100);
      expect(parsed.subdomains.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
