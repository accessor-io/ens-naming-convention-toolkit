const fs = require('fs');
const path = require('path');
const NamingValidator = require('../bin/naming-validator.mjs');
const SchemaMigrator = require('../bin/migrate-schema.mjs');

describe('Proxy Contract Handling', () => {
  let validator;
  let migrator;

  beforeEach(() => {
    validator = new NamingValidator();
    migrator = new SchemaMigrator();
  });

  describe('Proxy Configuration Validation', () => {
    test('should validate transparent proxy configuration', () => {
      const proxy = {
        proxyType: 'transparent',
        implementationAddress: '0x1234567890123456789012345678901234567890',
        implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        proxyAdmin: '0x0987654321098765432109876543210987654321',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toHaveLength(0);
    });

    test('should validate UUPS proxy configuration', () => {
      const proxy = {
        proxyType: 'uups',
        implementationAddress: '0x1234567890123456789012345678901234567890',
        implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toHaveLength(0);
    });

    test('should reject invalid proxy type', () => {
      const proxy = {
        proxyType: 'custom',
        implementationAddress: '0x1234567890123456789012345678901234567890',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toContain(
        'Invalid proxy type: custom. Must be one of: transparent, uups, beacon, diamond, minimal, immutable'
      );
    });

    test('should reject invalid implementation address', () => {
      const proxy = {
        proxyType: 'transparent',
        implementationAddress: '0xinvalid',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toContain('Implementation address must be a valid Ethereum address');
    });

    test('should warn about missing proxy admin for transparent proxy', () => {
      const proxy = {
        proxyType: 'transparent',
        implementationAddress: '0x1234567890123456789012345678901234567890',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toContain('Transparent proxy should have proxyAdmin address specified');
    });

    test('should warn about missing implementation slot for ERC-1967 proxy', () => {
      const proxy = {
        proxyType: 'transparent',
        implementationAddress: '0x1234567890123456789012345678901234567890',
      };

      const issues = validator.validateProxyConfiguration(proxy);
      expect(issues).toContain('ERC-1967 proxy should have implementationSlot specified');
    });
  });

  describe('Proxy Naming Consistency', () => {
    test('should validate consistent proxy/implementation naming', () => {
      const metadata = {
        proxy: {
          proxyType: 'transparent',
          implementationAddress: '0x1234567890123456789012345678901234567890',
          proxyAdmin: '0x0987654321098765432109876543210987654321',
        },
        subdomains: [
          { label: 'governor', owner: '0x0000000000000000000000000000000000000000' },
          { label: 'governor-impl', owner: '0x0000000000000000000000000000000000000000' },
          { label: 'governor-admin', owner: '0x0000000000000000000000000000000000000000' },
        ],
      };

      const result = validator.validateProxyNamingConsistency(metadata);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should warn about missing implementation address', () => {
      const metadata = {
        proxy: {
          proxyType: 'transparent',
        },
        subdomains: [
          { label: 'governor', owner: '0x0000000000000000000000000000000000000000' },
          { label: 'governor-impl', owner: '0x0000000000000000000000000000000000000000' },
        ],
      };

      const result = validator.validateProxyNamingConsistency(metadata);
      expect(result.warnings).toContain(
        'Implementation subdomain governor-impl exists but no implementation address specified'
      );
    });

    test('should warn about missing proxy admin', () => {
      const metadata = {
        proxy: {
          proxyType: 'transparent',
          implementationAddress: '0x1234567890123456789012345678901234567890',
        },
        subdomains: [
          { label: 'governor', owner: '0x0000000000000000000000000000000000000000' },
          { label: 'governor-admin', owner: '0x0000000000000000000000000000000000000000' },
        ],
      };

      const result = validator.validateProxyNamingConsistency(metadata);
      expect(result.warnings).toContain(
        'Admin subdomain governor-admin exists but no proxy admin address specified'
      );
    });
  });

  describe('Proxy Pattern Detection', () => {
    test('should detect transparent proxy pattern', () => {
      const addressInfo = {
        chainId: 1,
        address: '0x1234567890123456789012345678901234567890',
        implementation: '0x0987654321098765432109876543210987654321',
        implementationSlot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        proxyAdmin: '0x1111111111111111111111111111111111111111',
      };

      const result = migrator.detectProxyPattern(addressInfo);
      expect(result.isProxy).toBe(true);
      expect(result.proxyType).toBe('transparent');
      expect(result.proxyConfig.proxyType).toBe('transparent');
      expect(result.proxyConfig.implementationAddress).toBe(
        '0x0987654321098765432109876543210987654321'
      );
      expect(result.proxyConfig.proxyAdmin).toBe('0x1111111111111111111111111111111111111111');
    });

    test('should detect UUPS proxy pattern', () => {
      const addressInfo = {
        chainId: 1,
        address: '0x1234567890123456789012345678901234567890',
        implementation: '0x0987654321098765432109876543210987654321',
        bytecodeHash: '0xuups1234567890abcdef',
      };

      const result = migrator.detectProxyPattern(addressInfo);
      expect(result.isProxy).toBe(true);
      expect(result.proxyType).toBe('uups');
      expect(result.proxyConfig.proxyType).toBe('uups');
    });

    test('should not detect proxy pattern for regular contract', () => {
      const addressInfo = {
        chainId: 1,
        address: '0x1234567890123456789012345678901234567890',
        bytecodeHash: '0xregular1234567890abcdef',
      };

      const result = migrator.detectProxyPattern(addressInfo);
      expect(result.isProxy).toBe(false);
    });
  });

  describe('Proxy Migration', () => {
    let testFile;

    beforeEach(() => {
      testFile = path.join('./test', 'fixtures', 'proxy-metadata.json');

      // Create test fixture
      const fixtureDir = path.dirname(testFile);
      if (!fs.existsSync(fixtureDir)) {
        fs.mkdirSync(fixtureDir, { recursive: true });
      }

      const proxyMetadata = {
        id: 'ens.ens.domain.governor.v1-0-0.1',
        org: 'ens',
        protocol: 'ens',
        domain: 'dao',
        role: 'governor',
        version: 'v1-0-0',
        chainId: 1,
        addresses: [
          {
            chainId: 1,
            address: '0x1234567890123456789012345678901234567890',
            deployedBlock: 12345678,
            implementation: '0x0987654321098765432109876543210987654321',
            implementationSlot:
              '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
            proxyAdmin: '0x1111111111111111111111111111111111111111',
          },
        ],
      };

      fs.writeFileSync(testFile, JSON.stringify(proxyMetadata, null, 2));
    });

    afterEach(() => {
      // Clean up test files
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }

      const migratedFile = testFile.replace('.json', '-migrated.json');
      if (fs.existsSync(migratedFile)) {
        fs.unlinkSync(migratedFile);
      }
    });

    test('should migrate proxy metadata correctly', () => {
      const result = migrator.migrateFile(testFile, { dryRun: true });

      expect(result.migrated.proxy).toBeDefined();
      expect(result.migrated.proxy.proxyType).toBe('transparent');
      expect(result.migrated.proxy.implementationAddress).toBe(
        '0x0987654321098765432109876543210987654321'
      );
      expect(result.migrated.proxy.proxyAdmin).toBe('0x1111111111111111111111111111111111111111');
      expect(result.migrated.proxy.implementationSlot).toBe(
        '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      );
    });

    test('should detect proxy pattern during migration', () => {
      const result = migrator.migrateFile(testFile, { dryRun: true });

      expect(result.changes).toContain('detected transparent proxy pattern');
    });
  });

  describe('Proxy Subdomain Generation', () => {
    test('should generate proxy subdomain suggestions', () => {
      const answers = {
        org: 'ens',
        protocol: 'ens',
        category: 'dao',
        subcategory: 'governor',
        role: 'governor',
        version: 'v1-0-0',
        chainId: 1,
        variant: null,
        ensRoot: 'ens.dao.cns.eth',
      };

      const { ENSNamingWizard } = require('../bin/ens-naming.mjs');
      const wizard = new ENSNamingWizard();
      const suggestions = wizard.generateSubdomainSuggestions(answers);

      expect(suggestions.suggestions).toHaveLength(6);
      expect(suggestions.suggestions[0].label).toBe('governor');
      expect(suggestions.suggestions[1].label).toBe('governor-impl');
      expect(suggestions.suggestions[2].label).toBe('governor-admin');
    });
  });
});
