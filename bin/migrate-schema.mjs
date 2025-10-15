#!/usr/bin/env node

/**
 * Schema Migration Tool
 *
 * Migrates metadata files from old schema (domain field) to new schema (category field)
 * with backward compatibility and automatic ensRoot inference.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SchemaMigrator {
  constructor() {
    this.migrations = 0;
    this.errors = 0;
    this.warnings = [];
  }

  /**
   * Migrate a single metadata file
   */
  migrateFile(filePath, options = {}) {
    const { dryRun = false, inPlace = false } = options;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = JSON.parse(content);

      const migrated = this.migrateMetadata(metadata, filePath);

      if (dryRun) {
        console.log(`Would migrate: ${filePath}`);
        console.log('Changes:');
        this.showChanges(metadata, migrated);
        return { migrated, changes: this.getChanges(metadata, migrated) };
      }

      const outputPath = inPlace ? filePath : this.getOutputPath(filePath);
      fs.writeFileSync(outputPath, JSON.stringify(migrated, null, 2));

      console.log(`Migrated: ${filePath} -> ${outputPath}`);
      this.migrations++;

      return { migrated, outputPath };
    } catch (error) {
      console.error(`Error migrating ${filePath}: ${error.message}`);
      this.errors++;
      return { error: error.message };
    }
  }

  /**
   * Migrate metadata object
   */
  migrateMetadata(metadata, filePath) {
    const migrated = { ...metadata };
    const changes = [];

    // Migrate domain -> category
    if (migrated.domain && !migrated.category) {
      migrated.category = migrated.domain;
      migrated._deprecated = migrated._deprecated || {};
      migrated._deprecated.domain = migrated.domain;
      delete migrated.domain;
      changes.push('domain -> category');
    }

    // Update canonical ID if it contains domain
    if (migrated.id && migrated.id.includes('.domain.')) {
      migrated.id = migrated.id.replace('.domain.', '.category.');
      changes.push('updated canonical ID');
    }

    // Update version format if it uses dots
    if (migrated.version && migrated.version.includes('.')) {
      const oldVersion = migrated.version;
      migrated.version = migrated.version.replace(/\./g, '-');
      if (!migrated.version.startsWith('v')) {
        migrated.version = 'v' + migrated.version;
      }
      changes.push(`version format updated: ${oldVersion} -> ${migrated.version}`);
    }

    // Update ensRoot to use cns.eth if it ends with .eth but not .cns.eth
    if (
      migrated.ensRoot &&
      migrated.ensRoot.endsWith('.eth') &&
      !migrated.ensRoot.endsWith('.cns.eth')
    ) {
      const oldEnsRoot = migrated.ensRoot;
      migrated.ensRoot = migrated.ensRoot.replace('.eth', '.cns.eth');
      changes.push(`ensRoot updated to use cns.eth: ${oldEnsRoot} -> ${migrated.ensRoot}`);
    }

    // Infer ensRoot if not present
    if (!migrated.ensRoot && migrated.protocol && migrated.category) {
      migrated.ensRoot = `${migrated.protocol}.${migrated.category}.cns.eth`;
      changes.push('inferred ensRoot');
    }

    // Infer subcategory based on common patterns
    if (!migrated.subcategory && migrated.category) {
      const subcategory = this.inferSubcategory(migrated);
      if (subcategory) {
        migrated.subcategory = subcategory;
        changes.push(`inferred subcategory: ${subcategory}`);
      }
    }

    // Detect and migrate proxy patterns
    if (migrated.addresses && migrated.addresses.length > 0) {
      const proxyInfo = this.detectProxyPattern(migrated.addresses[0]);
      if (proxyInfo.isProxy) {
        migrated.proxy = proxyInfo.proxyConfig;
        changes.push(`detected ${proxyInfo.proxyType} proxy pattern`);
      }
    }

    // Add migration metadata
    migrated._migration = {
      migratedAt: new Date().toISOString(),
      migratedFrom: filePath,
      changes: changes,
    };

    return migrated;
  }

  /**
   * Infer subcategory from metadata patterns
   */
  inferSubcategory(metadata) {
    const { category, role, protocol } = metadata;

    // DAO patterns
    if (category === 'dao') {
      if (role?.includes('governor')) return 'governor';
      if (role?.includes('token')) return 'token';
      if (role?.includes('treasury')) return 'treasury';
      if (role?.includes('timelock')) return 'timelock';
    }

    // DeFi patterns
    if (category === 'defi') {
      if (role?.includes('router') || role?.includes('swap')) return 'amm';
      if (role?.includes('pool') || role?.includes('lending')) return 'lending';
      if (role?.includes('stable')) return 'stablecoin';
      if (role?.includes('yield')) return 'yield';
    }

    // Token patterns
    if (category === 'tokens') {
      if (role?.includes('erc20')) return 'erc20';
      if (role?.includes('erc721') || role?.includes('nft')) return 'erc721';
      if (role?.includes('erc1155')) return 'erc1155';
      if (role?.includes('governance')) return 'governance-token';
    }

    // L2 patterns
    if (category === 'l2') {
      if (protocol?.includes('optimistic')) return 'optimistic-rollup';
      if (protocol?.includes('zk')) return 'zk-rollup';
      if (role?.includes('bridge')) return 'bridge';
    }

    return null;
  }

  /**
   * Detect proxy patterns from address metadata
   */
  detectProxyPattern(addressInfo) {
    const result = {
      isProxy: false,
      proxyType: null,
      proxyConfig: null,
    };

    // Check for implementation address (ERC-1967)
    if (addressInfo.implementation) {
      result.isProxy = true;
      result.proxyType = 'transparent'; // Default assumption
      result.proxyConfig = {
        proxyType: 'transparent',
        implementationAddress: addressInfo.implementation,
        implementationSlot:
          addressInfo.implementationSlot ||
          '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
      };
    }

    // Check for proxy admin patterns
    if (addressInfo.proxyAdmin) {
      result.proxyConfig.proxyAdmin = addressInfo.proxyAdmin;
    }

    // Check for UUPS patterns (implementation in contract itself)
    if (addressInfo.bytecodeHash && addressInfo.bytecodeHash.includes('uups')) {
      result.proxyType = 'uups';
      result.proxyConfig.proxyType = 'uups';
    }

    return result;
  }

  /**
   * Get output path for migrated file
   */
  getOutputPath(filePath) {
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, '.json');
    return path.join(dir, `${name}-migrated.json`);
  }

  /**
   * Show changes between original and migrated metadata
   */
  showChanges(original, migrated) {
    const changes = this.getChanges(original, migrated);
    changes.forEach((change) => {
      console.log(`  - ${change}`);
    });
  }

  /**
   * Get list of changes made during migration
   */
  getChanges(original, migrated) {
    const changes = [];

    if (original.domain && !original.category && migrated.category) {
      changes.push(`domain "${original.domain}" -> category "${migrated.category}"`);
    }

    if (original.id !== migrated.id) {
      changes.push(`canonical ID updated`);
    }

    if (!original.ensRoot && migrated.ensRoot) {
      changes.push(`ensRoot added: "${migrated.ensRoot}"`);
    }

    if (
      original.ensRoot &&
      original.ensRoot.endsWith('.eth') &&
      !original.ensRoot.endsWith('.cns.eth')
    ) {
      changes.push(
        `ensRoot updated to use cns.eth: "${original.ensRoot}" -> "${migrated.ensRoot}"`
      );
    }

    if (!original.subcategory && migrated.subcategory) {
      changes.push(`subcategory added: "${migrated.subcategory}"`);
    }

    return changes;
  }

  /**
   * Migrate all files in a directory
   */
  migrateDirectory(dirPath, options = {}) {
    const { dryRun = false, inPlace = false, recursive = true } = options;

    try {
      const files = this.findMetadataFiles(dirPath, recursive);

      console.log(`Found ${files.length} metadata files to migrate`);

      const results = [];
      for (const file of files) {
        const result = this.migrateFile(file, { dryRun, inPlace });
        results.push({ file, ...result });
      }

      return results;
    } catch (error) {
      console.error(`Error migrating directory ${dirPath}: ${error.message}`);
      return [];
    }
  }

  /**
   * Find all metadata files in directory
   */
  findMetadataFiles(dirPath, recursive = true) {
    const files = [];

    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && recursive) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          // Check if it looks like metadata
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(content);
            if (data.id || data.protocol || data.category || data.domain) {
              files.push(fullPath);
            }
          } catch (e) {
            // Skip non-JSON files
          }
        }
      }
    };

    scanDir(dirPath);
    return files;
  }

  /**
   * Generate migration report
   */
  generateReport(results) {
    const report = {
      summary: {
        total: results.length,
        successful: results.filter((r) => !r.error).length,
        errors: results.filter((r) => r.error).length,
        migrations: this.migrations,
      },
      details: results,
    };

    return report;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help')) {
    console.log('\nSchema Migration Tool');
    console.log('═'.repeat(30));
    console.log('Usage: node migrate-schema.mjs <file|directory> [options]');
    console.log('\nOptions:');
    console.log('  --dry-run       Show what would be migrated without making changes');
    console.log('  --in-place      Modify files in place (default: create -migrated.json)');
    console.log('  --recursive     Recursively scan directories (default: true)');
    console.log('  --output <dir>  Output directory for migrated files');
    console.log('\nExamples:');
    console.log('  node migrate-schema.mjs metadata.json --dry-run');
    console.log('  node migrate-schema.mjs metadata/ --in-place');
    console.log('  node migrate-schema.mjs metadata/protocols/ --output migrated/');
    process.exit(1);
  }

  const migrator = new SchemaMigrator();
  const target = args[0];

  // Parse options
  const dryRun = args.includes('--dry-run');
  const inPlace = args.includes('--in-place');
  const recursive = !args.includes('--no-recursive');
  const outputDir = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

  try {
    const stat = fs.statSync(target);
    let results;

    if (stat.isDirectory()) {
      console.log(`Migrating directory: ${target}`);
      results = migrator.migrateDirectory(target, { dryRun, inPlace, recursive });
    } else {
      console.log(`Migrating file: ${target}`);
      const result = migrator.migrateFile(target, { dryRun, inPlace });
      results = [result];
    }

    // Generate and display report
    const report = migrator.generateReport(results);

    console.log('\nMigration Report:');
    console.log('═'.repeat(20));
    console.log(`Total files: ${report.summary.total}`);
    console.log(`Successful: ${report.summary.successful}`);
    console.log(`Errors: ${report.summary.errors}`);

    if (dryRun) {
      console.log('\nDry run completed. Use --in-place to apply changes.');
    } else {
      console.log(`\nMigration completed. ${migrator.migrations} files migrated.`);
    }

    // Show errors if any
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
export default SchemaMigrator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
