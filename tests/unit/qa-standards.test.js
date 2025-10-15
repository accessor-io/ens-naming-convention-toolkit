/**
 * Comprehensive QA Standards Test Suite
 *
 * Tests all 15 QA standards for ENS metadata validation
 */

const fs = require('fs');
const path = require('path');

// Import validation tools (ES modules)
let SchemaValidator, CrossReferenceValidator, NamingValidator, QAReportGenerator;

beforeAll(async () => {
  const schemaValidatorModule = await import('../bin/schema-validator.mjs');
  const crossRefValidatorModule = await import('../bin/cross-reference-validator.mjs');
  const namingValidatorModule = await import('../bin/naming-validator.mjs');
  const qaReportGeneratorModule = await import('../bin/qa-report-generator.mjs');

  SchemaValidator = schemaValidatorModule.default;
  CrossReferenceValidator = crossRefValidatorModule.default;
  NamingValidator = namingValidatorModule.default;
  QAReportGenerator = qaReportGeneratorModule.default;
});

describe('QA Standards Validation', () => {
  let schemaValidator;
  let crossRefValidator;
  let namingValidator;
  let qaReportGenerator;

  beforeEach(() => {
    schemaValidator = new SchemaValidator();
    crossRefValidator = new CrossReferenceValidator();
    namingValidator = new NamingValidator();
    qaReportGenerator = new QAReportGenerator();

    // Load schema
    const schemaPath = path.join(__dirname, '..', 'data', 'metadata', 'schema.json');
    schemaValidator.loadSchema(schemaPath);
  });

  describe('Standard 1: Metadata Schema Validation', () => {
    test('should validate complete metadata against schema', () => {
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

      const result = schemaValidator.validate(validMetadata);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should reject metadata with missing required fields', () => {
      const invalidMetadata = {
        id: 'test',
        // Missing required fields
      };

      const result = schemaValidator.validate(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate field types correctly', () => {
      const invalidMetadata = {
        id: 'test',
        org: 'test',
        protocol: 'test',
        domain: 'test',
        role: 'test',
        version: 'test',
        chainId: 'invalid', // Should be integer
        addresses: 'invalid', // Should be array
      };

      const result = schemaValidator.validate(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('must be an integer'))).toBe(true);
      expect(result.errors.some((e) => e.includes('must be an array'))).toBe(true);
    });
  });

  describe('Standard 2: Canonical ID Grammar', () => {
    test('should validate correct ID grammar', () => {
      const validIds = [
        'uniswap.v3.defi.router.v3.1.1',
        'aave.v3.defi.lending-pool.v3.1.1',
        'compound.v2.defi.comptroller.v2.8.1',
      ];

      validIds.forEach((id) => {
        const result = namingValidator.validateCanonicalId(id);
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

      invalidIds.forEach((id) => {
        const result = namingValidator.validateCanonicalId(id);
        expect(result).toBe(false);
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
        const metadata = { domain };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.filter((e) => e.includes('not a registered root domain')).length).toBe(
          0
        );
      });
    });

    test('should reject unregistered domains', () => {
      const invalidDomains = ['custom', 'unknown', 'test'];

      invalidDomains.forEach((domain) => {
        const metadata = { domain };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.some((e) => e.includes('not a registered root domain'))).toBe(true);
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
        const metadata = { domain: 'defi', tags: [sub] };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.filter((e) => e.includes('subcategory')).length).toBe(0);
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
        const metadata = { domain: 'dao', tags: [sub] };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.filter((e) => e.includes('subcategory')).length).toBe(0);
      });
    });
  });

  describe('Standard 5: Security Standards', () => {
    test('should validate security fields', () => {
      const validSecurity = {
        security: {
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
        },
      };

      const result = crossRefValidator.validate(validSecurity);
      expect(result.errors.filter((e) => e.includes('Security')).length).toBe(0);
    });

    test('should require audits for production contracts', () => {
      const invalidSecurity = {
        security: {
          owners: ['0x1234567890123456789012345678901234567890'],
          upgradeability: 'immutable',
          // Missing audits
        },
      };

      const result = crossRefValidator.validate(invalidSecurity);
      expect(result.warnings.some((w) => w.includes('audit'))).toBe(true);
    });
  });

  describe('Standard 6: Lifecycle Management', () => {
    test('should validate lifecycle status', () => {
      const validLifecycle = {
        lifecycle: {
          status: 'deployed',
          since: '2023-01-15T00:00:00Z',
        },
      };

      const result = crossRefValidator.validate(validLifecycle);
      expect(result.errors.filter((e) => e.includes('Lifecycle')).length).toBe(0);
    });

    test('should validate status transitions', () => {
      const validStatuses = [
        'planning',
        'development',
        'testing',
        'deployed',
        'deprecated',
        'discontinued',
      ];

      validStatuses.forEach((status) => {
        const metadata = { lifecycle: { status } };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.filter((e) => e.includes('status')).length).toBe(0);
      });
    });

    test('should require replacement for deprecated contracts', () => {
      const deprecatedLifecycle = {
        lifecycle: {
          status: 'deprecated',
          // Missing replacedBy
        },
      };

      const result = crossRefValidator.validate(deprecatedLifecycle);
      expect(result.warnings.some((w) => w.includes('replacement'))).toBe(true);
    });
  });

  describe('Standard 7: Standards Compliance', () => {
    test('should validate ERC standards', () => {
      const validStandards = {
        standards: {
          ercs: ['ERC20', 'ERC165', 'ERC173'],
          interfaces: ['0x36372b07', '0x01ffc9a7'],
        },
      };

      const result = crossRefValidator.validate(validStandards);
      expect(result.errors.filter((e) => e.includes('Standards')).length).toBe(0);
    });

    test('should reject invalid ERC standards', () => {
      const invalidStandards = {
        standards: {
          ercs: ['ERC999', 'INVALID'], // Non-existent standards
          interfaces: ['0xinvalid'], // Invalid interface ID
        },
      };

      const result = crossRefValidator.validate(invalidStandards);
      expect(result.warnings.some((w) => w.includes('not a recognized ERC standard'))).toBe(true);
      expect(result.errors.some((e) => e.includes('interface ID'))).toBe(true);
    });
  });

  describe('Standard 8: Subdomain Management', () => {
    test('should validate subdomain configuration', () => {
      const validSubdomains = {
        subdomains: [
          {
            label: 'router',
            owner: '0x1234567890123456789012345678901234567890',
            controller: '0x0987654321098765432109876543210987654321',
            resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
          },
        ],
      };

      const result = crossRefValidator.validate(validSubdomains);
      expect(result.errors.filter((e) => e.includes('Subdomains')).length).toBe(0);
    });

    test('should validate address formats in subdomains', () => {
      const invalidSubdomains = {
        subdomains: [
          {
            label: 'router',
            owner: 'invalid-address',
          },
        ],
      };

      const result = crossRefValidator.validate(invalidSubdomains);
      expect(result.errors.some((e) => e.includes('valid Ethereum address'))).toBe(true);
    });
  });

  describe('Standard 9: File and Format Standards', () => {
    test('should validate JSON format', () => {
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

      const result = schemaValidator.validate(validJson);
      expect(result.isValid).toBe(true);
    });

    test('should handle malformed JSON gracefully', () => {
      expect(() => {
        JSON.parse('{ invalid json }');
      }).toThrow();
    });
  });

  describe('Standard 10: Version and Compatibility', () => {
    test('should validate semantic versioning', () => {
      const validVersions = ['1.0.0', '2.1.3', '1.0.0-alpha.1', '1.0.0+build.123'];

      validVersions.forEach((version) => {
        const metadata = { version };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.filter((e) => e.includes('semantic versioning')).length).toBe(0);
      });
    });

    test('should reject invalid version formats', () => {
      const invalidVersions = ['1.0', 'v1.0.0', '1.0.0.1'];

      invalidVersions.forEach((version) => {
        const metadata = { version };
        const result = crossRefValidator.validate(metadata);
        expect(result.errors.some((e) => e.includes('semantic versioning'))).toBe(true);
      });
    });
  });

  describe('Standard 11: Schema Validation Integration', () => {
    test('should integrate with JSON Schema validation', () => {
      const metadata = {
        id: 'test.v1.defi.router.v1.0.1',
        org: 'test',
        protocol: 'v1',
        domain: 'defi',
        role: 'router',
        version: '1.0.0',
        chainId: 1,
        addresses: [
          {
            chainId: 1,
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
      };

      const result = schemaValidator.validate(metadata);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Standard 12: Cross-Reference Validation', () => {
    test('should validate ID consistency with metadata fields', () => {
      const metadata = {
        id: 'uniswap.v3.defi.router.v3.1.1',
        org: 'uniswap',
        protocol: 'v3',
        domain: 'defi',
        role: 'router',
        version: '3.1.0',
        chainId: 1,
      };

      const result = crossRefValidator.validate(metadata);
      expect(result.errors.filter((e) => e.includes('does not match')).length).toBe(0);
    });

    test('should detect ID inconsistencies', () => {
      const metadata = {
        id: 'uniswap.v3.defi.router.v3.1.1',
        org: 'aave', // Mismatch
        protocol: 'v3',
        domain: 'defi',
        role: 'router',
        version: '3.1.0',
        chainId: 1,
      };

      const result = crossRefValidator.validate(metadata);
      expect(result.errors.some((e) => e.includes('does not match'))).toBe(true);
    });
  });

  describe('Standard 13: Dependency and Compatibility', () => {
    test('should validate dependency documentation', () => {
      const metadata = {
        id: 'test.v1.defi.router.v1.0.1',
        org: 'test',
        protocol: 'v1',
        domain: 'defi',
        role: 'router',
        version: '1.0.0',
        chainId: 1,
        addresses: [],
        artifacts: {
          dependencies: ['uniswap-v3-core', 'uniswap-v3-periphery'],
          compatibility: {
            minVersion: '1.0.0',
            maxVersion: '2.0.0',
          },
        },
      };

      const result = schemaValidator.validate(metadata);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Standard 14: Security Audit Validation', () => {
    test('should validate audit requirements', () => {
      const metadata = {
        security: {
          audits: [
            {
              firm: 'Trail of Bits',
              date: '2023-01-15',
              report: 'https://example.com/audit.pdf',
              coverage: 0.85,
              findings: '2 medium, 1 low',
            },
          ],
          owners: ['0x1234567890123456789012345678901234567890'],
          upgradeability: 'immutable',
        },
      };

      const result = crossRefValidator.validate(metadata);
      expect(result.errors.filter((e) => e.includes('audit')).length).toBe(0);
    });
  });

  describe('Standard 15: Performance and Gas Standards', () => {
    test('should validate performance documentation', () => {
      const metadata = {
        artifacts: {
          performance: {
            maxGasPerTransaction: 400000,
            functionComplexity: 12,
            storageOptimization: 'documented',
            batchOperations: true,
          },
        },
      };

      const result = schemaValidator.validate(metadata);
      expect(result.isValid).toBe(true);
    });
  });

  describe('QA Report Generator Integration', () => {
    test('should generate comprehensive QA report', async () => {
      const metadata = {
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
        security: {
          audits: [
            {
              firm: 'Trail of Bits',
              date: '2023-01-15',
              report: 'https://example.com/audit.pdf',
            },
          ],
          owners: ['0x1234567890123456789012345678901234567890'],
          upgradeability: 'immutable',
        },
        lifecycle: {
          status: 'deployed',
          since: '2023-01-15T00:00:00Z',
        },
      };

      // Create temporary file for testing
      const tempFile = path.join(__dirname, 'temp-metadata.json');
      fs.writeFileSync(tempFile, JSON.stringify(metadata, null, 2));

      try {
        const report = await qaReportGenerator.generateReport(tempFile);
        expect(report.compliance).toBeDefined();
        expect(report.compliance.score).toBeGreaterThan(0);
        expect(report.validators).toBeDefined();
        expect(report.standards).toBeDefined();
      } finally {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null and undefined values gracefully', () => {
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

      const result = schemaValidator.validate(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle malformed addresses', () => {
      const metadata = {
        addresses: [
          { chainId: 1, address: 'invalid-address' },
          { chainId: 'invalid', address: '0x1234567890123456789012345678901234567890' },
          { chainId: 1, address: '0x123' }, // Too short
        ],
      };

      const result = crossRefValidator.validate(metadata);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle empty metadata objects', () => {
      const metadata = {};

      const result = schemaValidator.validate(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Missing required field'))).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should validate large metadata files efficiently', () => {
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
      const result = schemaValidator.validate(largeMetadata);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
