import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SchemaMigrator from '../bin/migrate-schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Schema Migration', () => {
  let migrator;
  let testFile;

  beforeEach(() => {
    migrator = new SchemaMigrator();
    testFile = path.join(__dirname, 'fixtures', 'old-schema.json');

    // Create test fixture
    const fixtureDir = path.dirname(testFile);
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }

    const oldSchema = {
      id: 'uniswap.uniswap.domain.router.v1.0.0.1',
      org: 'uniswap',
      protocol: 'uniswap',
      domain: 'defi',
      role: 'router',
      version: '1.0.0',
      chainId: 1,
      addresses: [
        {
          chainId: 1,
          address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          deployedBlock: 12369621,
        },
      ],
    };

    fs.writeFileSync(testFile, JSON.stringify(oldSchema, null, 2));
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

  test('should migrate domain to category', () => {
    const result = migrator.migrateFile(testFile, { dryRun: true });

    expect(result.migrated).toBeDefined();
    expect(result.migrated.category).toBe('defi');
    expect(result.migrated.domain).toBeUndefined();
    expect(result.migrated._deprecated.domain).toBe('defi');
  });

  test('should migrate version format from dots to hyphens', () => {
    const result = migrator.migrateFile(testFile, { dryRun: true });

    expect(result.migrated.version).toBe('v1-0-0');
  });

  test('should update canonical ID', () => {
    const result = migrator.migrateFile(testFile, { dryRun: true });

    expect(result.migrated.id).toBe('uniswap.uniswap.category.router.v1-0-0.1');
  });

  test('should infer ensRoot', () => {
    const result = migrator.migrateFile(testFile, { dryRun: true });

    expect(result.migrated.ensRoot).toBe('uniswap.defi.cns.eth');
  });

  test('should infer subcategory for DeFi', () => {
    const result = migrator.migrateFile(testFile, { dryRun: true });

    expect(result.migrated.subcategory).toBe('amm');
  });

  test('should create migrated file', () => {
    const result = migrator.migrateFile(testFile, { dryRun: false });

    expect(result.outputPath).toBeDefined();
    expect(fs.existsSync(result.outputPath)).toBe(true);

    const migratedContent = JSON.parse(fs.readFileSync(result.outputPath, 'utf8'));
    expect(migratedContent.category).toBe('defi');
    expect(migratedContent._migration).toBeDefined();
  });

  test('should handle in-place migration', () => {
    const originalContent = fs.readFileSync(testFile, 'utf8');

    migrator.migrateFile(testFile, { dryRun: false, inPlace: true });

    const migratedContent = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    expect(migratedContent.category).toBe('defi');
    expect(migratedContent.domain).toBeUndefined();
  });
});
