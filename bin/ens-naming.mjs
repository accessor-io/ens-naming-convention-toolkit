#!/usr/bin/env node

/**
 * ENS Naming Convention CLI Tool
 *
 * Unified tool for managing contract naming conventions, subdomain generation,
 * and ENS metadata management across the Ethereum ecosystem.
 */

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import validation tools
import SchemaValidator from './schema-validator.mjs';
import CrossReferenceValidator from './cross-reference-validator.mjs';
import NamingValidator from './naming-validator.mjs';
import QAReportGenerator from './qa-report-generator.mjs';
import SchemaMigrator from './migrate-schema.mjs';

// Load registries
function loadCategoryRegistry(baseDir) {
  const p = path.join(baseDir, '..', 'docs', 'category-registry.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadRootDomains(baseDir) {
  const p = path.join(baseDir, '..', 'docs', 'root-domains.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const CATEGORY_REGISTRY = loadCategoryRegistry(__dirname);
const ROOT_DOMAINS = loadRootDomains(__dirname);

// Interactive wizard for guided contract naming
class ENSNamingWizard {
  constructor() {
    this.namingValidator = new NamingValidator();
    this.schemaValidator = new SchemaValidator();
    this.crossRefValidator = new CrossReferenceValidator();
  }

  async runWizard() {
    console.log('\nENS Contract Naming Wizard');
    console.log('='.repeat(40));
    console.log('This wizard will guide you through creating compliant contract metadata.');
    console.log('');

    const answers = await this.collectAnswers();
    const suggestions = this.generateSubdomainSuggestions(answers);
    const metadata = this.generateMetadata(answers, suggestions);

    this.displayResults(answers, suggestions, metadata);

    return { answers, suggestions, metadata };
  }

  async collectAnswers() {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt) =>
      new Promise((resolve) => {
        rl.question(prompt, resolve);
      });

    const answers = {};

    try {
      // Organization
      while (!answers.org) {
        answers.org = await question('Organization name (lowercase, hyphen-separated): ');
        if (!answers.org) {
          console.log('Organization name is required');
          continue;
        }
        if (!/^[a-z0-9-]+$/.test(answers.org)) {
          console.log(
            'Organization name must contain only lowercase letters, numbers, and hyphens'
          );
          answers.org = '';
        }
      }

      // Protocol
      while (!answers.protocol) {
        answers.protocol = await question('Protocol name (lowercase, hyphen-separated): ');
        if (!answers.protocol) {
          console.log('Protocol name is required');
          continue;
        }
        if (!/^[a-z0-9.-]+$/.test(answers.protocol)) {
          console.log(
            'Protocol name must contain only lowercase letters, numbers, dots, and hyphens'
          );
          answers.protocol = '';
        }
      }

      // Category selection
      console.log('\nAvailable categories:');
      CATEGORY_REGISTRY.roots.forEach((cat, i) => {
        console.log(`  ${i + 1}. ${cat}`);
      });

      const categoryIndex = await question('\nSelect category (number): ');
      const categoryNum = parseInt(categoryIndex) - 1;
      if (categoryNum < 0 || categoryNum >= CATEGORY_REGISTRY.roots.length) {
        throw new Error('Invalid category selection');
      }
      answers.category = CATEGORY_REGISTRY.roots[categoryNum];

      // Subcategory
      const subcategories = CATEGORY_REGISTRY.subcategories[answers.category] || [];
      if (subcategories.length > 0) {
        console.log(`\nAvailable subcategories for ${answers.category}:`);
        subcategories.forEach((sub, i) => {
          console.log(`  ${i + 1}. ${sub}`);
        });

        const subcategoryIndex = await question(
          '\nSelect subcategory (number, or press Enter to skip): '
        );
        if (subcategoryIndex.trim()) {
          const subcategoryNum = parseInt(subcategoryIndex) - 1;
          if (subcategoryNum >= 0 && subcategoryNum < subcategories.length) {
            answers.subcategory = subcategories[subcategoryNum];
          }
        }
      }

      // Role
      answers.role = await question('Contract role/function (e.g., router, factory, governor): ');
      if (!answers.role) {
        throw new Error('Contract role is required');
      }

      // Version
      while (!answers.version) {
        answers.version = await question('Version (e.g., v1, v1-0, v1-0-0): ');
        if (!answers.version) {
          answers.version = 'v1';
          break;
        }
        const versionPattern = /^v[0-9]+(-[0-9]+)?(-[0-9]+)?$/;
        if (!versionPattern.test(answers.version)) {
          console.log(
            'Version must follow format: v{num}, v{num}-{num}, or v{num}-{num}-{num} (e.g., v1, v1-0, v1-0-0)'
          );
          answers.version = '';
        }
      }

      // Chain ID
      while (!answers.chainId) {
        const chainIdInput = await question('Chain ID (e.g., 1 for mainnet): ');
        const chainIdNum = parseInt(chainIdInput);
        if (isNaN(chainIdNum) || chainIdNum < 1) {
          console.log('Chain ID must be a positive integer');
          continue;
        }
        answers.chainId = chainIdNum;
      }

      // Optional variant
      answers.variant = await question('Variant (optional, press Enter to skip): ');
      if (!answers.variant.trim()) {
        answers.variant = null;
      }

      // ENS Root
      answers.ensRoot = await question(
        `ENS root domain (e.g., ${answers.protocol}.${answers.category}.cns.eth): `
      );
      if (!answers.ensRoot) {
        answers.ensRoot = `${answers.protocol}.${answers.category}.cns.eth`;
      }
    } finally {
      rl.close();
    }

    return answers;
  }

  generateSubdomainSuggestions(answers) {
    const suggestions = [];
    const { org, protocol, category, subcategory, role, ensRoot } = answers;

    // Generate canonical ID
    const variantPart = answers.variant ? `.${answers.variant}` : '';
    const canonicalId = `${org}.${protocol}.${category}.${role}${variantPart}.v${answers.version}.${answers.chainId}`;

    // Generate subdomain suggestions based on category and subcategory
    if (category === 'dao') {
      suggestions.push(
        {
          label: 'governor',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Core governance contract',
          fullDomain: `governor.${ensRoot}`,
        },
        {
          label: 'governor-impl',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Governance implementation contract',
          fullDomain: `governor-impl.${ensRoot}`,
        },
        {
          label: 'governor-admin',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Governance proxy admin',
          fullDomain: `governor-admin.${ensRoot}`,
        },
        {
          label: 'token',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Governance token',
          fullDomain: `token.${ensRoot}`,
        },
        {
          label: 'treasury',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Treasury management',
          fullDomain: `treasury.${ensRoot}`,
        },
        {
          label: 'timelock',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Proposal execution delay',
          fullDomain: `timelock.${ensRoot}`,
        }
      );
    } else if (category === 'defi') {
      if (subcategory === 'amm') {
        suggestions.push(
          {
            label: 'router',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Main swap router',
            fullDomain: `router.${ensRoot}`,
          },
          {
            label: 'router-impl',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Router implementation contract',
            fullDomain: `router-impl.${ensRoot}`,
          },
          {
            label: 'factory',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Pool factory',
            fullDomain: `factory.${ensRoot}`,
          },
          {
            label: 'factory-impl',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Factory implementation contract',
            fullDomain: `factory-impl.${ensRoot}`,
          },
          {
            label: 'quoter',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Price quoter',
            fullDomain: `quoter.${ensRoot}`,
          },
          {
            label: 'multicall',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Batch call contract',
            fullDomain: `multicall.${ensRoot}`,
          }
        );
      } else if (subcategory === 'lending') {
        suggestions.push(
          {
            label: 'pool',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Lending pool',
            fullDomain: `pool.${ensRoot}`,
          },
          {
            label: 'oracle',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Price oracle',
            fullDomain: `oracle.${ensRoot}`,
          },
          {
            label: 'liquidator',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Liquidation contract',
            fullDomain: `liquidator.${ensRoot}`,
          }
        );
      } else {
        // Generic DeFi suggestions
        suggestions.push(
          {
            label: 'core',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Core protocol contract',
            fullDomain: `core.${ensRoot}`,
          },
          {
            label: 'governance',
            owner: '0x0000000000000000000000000000000000000000',
            description: 'Governance contract',
            fullDomain: `governance.${ensRoot}`,
          }
        );
      }
    } else if (category === 'tokens') {
      suggestions.push({
        label: 'token',
        owner: '0x0000000000000000000000000000000000000000',
        description: 'Token contract',
        fullDomain: `token.${ensRoot}`,
      });
    } else if (category === 'l2') {
      suggestions.push(
        {
          label: 'bridge',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Bridge contract',
          fullDomain: `bridge.${ensRoot}`,
        },
        {
          label: 'sequencer',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Sequencer contract',
          fullDomain: `sequencer.${ensRoot}`,
        }
      );
    } else if (category === 'infra') {
      suggestions.push(
        {
          label: 'oracle',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Oracle service',
          fullDomain: `oracle.${ensRoot}`,
        },
        {
          label: 'relayer',
          owner: '0x0000000000000000000000000000000000000000',
          description: 'Relayer service',
          fullDomain: `relayer.${ensRoot}`,
        }
      );
    } else {
      // Generic suggestions for other categories
      suggestions.push({
        label: 'core',
        owner: '0x0000000000000000000000000000000000000000',
        description: 'Core contract',
        fullDomain: `core.${ensRoot}`,
      });
    }

    return { canonicalId, suggestions };
  }

  generateMetadata(answers, suggestions) {
    const { org, protocol, category, subcategory, role, version, chainId, variant, ensRoot } =
      answers;

    const metadata = {
      id: suggestions.canonicalId,
      org,
      protocol,
      category,
      role,
      version,
      chainId,
      addresses: [
        {
          chainId,
          address: '0x0000000000000000000000000000000000000000',
          deployedBlock: 0,
        },
      ],
      subdomains: suggestions.suggestions.map((sub) => ({
        label: sub.label,
        owner: sub.owner,
        description: sub.description,
      })),
    };

    if (subcategory) {
      metadata.subcategory = subcategory;
    }

    if (variant) {
      metadata.variant = variant;
    }

    if (ensRoot) {
      metadata.ensRoot = ensRoot;
    }

    return metadata;
  }

  displayResults(answers, suggestions, metadata) {
    console.log('\n' + '='.repeat(50));
    console.log('WIZARD RESULTS');
    console.log('='.repeat(50));

    console.log('\nCanonical ID:');
    console.log(`  ${suggestions.canonicalId}`);

    console.log('\nSuggested Subdomains:');
    suggestions.suggestions.forEach((sub, i) => {
      console.log(`  ${i + 1}. ${sub.fullDomain}`);
      console.log(`     ${sub.description}`);
    });

    console.log('\nGenerated Metadata:');
    console.log(JSON.stringify(metadata, null, 2));

    console.log('\nNext Steps:');
    console.log('1. Review and customize the metadata');
    console.log('2. Fill in actual contract addresses');
    console.log('3. Run validation: ens-naming validate-name <domain>');
    console.log('4. Generate registration script: ens-naming register <metadata-file>');
  }
}

// CLI Commands
const program = new Command();

program.name('ens-naming').description('ENS Contract Naming Convention CLI Tool').version('2.0.0');

program
  .command('wizard')
  .description('Interactive wizard for guided contract naming')
  .action(async () => {
    const wizard = new ENSNamingWizard();
    await wizard.runWizard();
  });

program
  .command('suggest')
  .description('Generate subdomain suggestions for a protocol')
  .argument('<protocol>', 'Protocol name')
  .argument('<category>', `Category (${CATEGORY_REGISTRY.roots.join(', ')})`)
  .option('-v, --verbose', 'Show detailed output')
  .action((protocol, category, options) => {
    console.log(`\nSubdomain suggestions for ${protocol} (${category}):`);
    console.log('='.repeat(50));
    console.log('Use the wizard command for interactive guidance');
  });

program
  .command('validate-name')
  .description('Validate naming convention compliance')
  .argument('<domain>', 'Domain name to validate')
  .argument('<category>', `Category (${CATEGORY_REGISTRY.roots.join(', ')})`)
  .option('--strict', 'Enable strict validation')
  .option('--metadata <file>', 'Load metadata from JSON file')
  .action(async (domain, category, options) => {
    const validator = new NamingValidator();
    const metadata = options.metadata
      ? JSON.parse(fs.readFileSync(options.metadata, 'utf8'))
      : null;

    const result = await validator.validateDomain(domain, category, {
      strict: options.strict,
      metadata,
      includeQA: true,
    });

    console.log(validator.generateReport(result));

    if (!result.isValid) {
      process.exit(1);
    }
  });

program
  .command('generate-metadata')
  .description('Generate metadata template for a contract')
  .argument('<contract-type>', 'Type of contract')
  .argument('<category>', 'Category')
  .option('-o, --output <file>', 'Output file for metadata')
  .action((contractType, category, options) => {
    console.log(`\nGenerated Metadata Template:`);
    console.log('='.repeat(30));
    console.log('Use the wizard command for interactive metadata generation');
  });

program
  .command('register')
  .description('Generate registration script for a protocol')
  .argument('<metadata-file>', 'Metadata JSON file')
  .option('-o, --output <file>', 'Output file for script')
  .action((metadataFile, options) => {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

      console.log(`\nGenerated Registration Script:`);
      console.log('='.repeat(35));

      const script = [];
      script.push('#!/bin/bash');
      script.push(`# ENS Registration Script for ${metadata.protocol}`);
      script.push(`# Generated on ${new Date().toISOString()}`);
      script.push('');

      if (metadata.subdomains) {
        metadata.subdomains.forEach((subdomain) => {
          const fullDomain = `${subdomain.label}.${metadata.ensRoot || `${metadata.protocol}.${metadata.category}.eth`}`;
          script.push(`# Register ${subdomain.label} contract`);
          script.push(`ens-contract register ${fullDomain} --owner ${subdomain.owner}`);
          if (subdomain.controller) {
            script.push(`ens-contract set-controller ${fullDomain} ${subdomain.controller}`);
          }
          if (subdomain.resolver) {
            script.push(`ens-contract set-resolver ${fullDomain} ${subdomain.resolver}`);
          }
          script.push('');
        });
      }

      const scriptContent = script.join('\n');
      console.log(scriptContent);

      const filename = options.output || `${metadata.protocol}-registration.sh`;
      fs.writeFileSync(filename, scriptContent);
      console.log(`\nScript saved to ${filename}`);
    } catch (error) {
      console.error(`Failed to generate registration script: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('qa-report')
  .description('Generate QA compliance report')
  .argument('<file|directory>', 'Metadata file or directory')
  .option('--strict', 'Enable strict validation')
  .option('--format <type>', 'Output format (markdown, json)', 'markdown')
  .option('--output <file>', 'Output file path')
  .action(async (target, options) => {
    const generator = new QAReportGenerator();

    try {
      const stat = fs.statSync(target);
      let report;

      if (stat.isDirectory()) {
        report = await generator.generateBatchReport(target, options);
      } else {
        report = await generator.generateReport(target, options);
      }

      let outputContent;
      if (options.format === 'json') {
        outputContent = generator.generateJSONReport(report);
      } else {
        outputContent = generator.generateMarkdownReport(report);
      }

      if (options.output) {
        fs.writeFileSync(options.output, outputContent);
        console.log(`Report written to: ${options.output}`);
      } else {
        console.log(outputContent);
      }
    } catch (error) {
      console.error(`Failed to generate report: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Migrate metadata from old schema to new schema')
  .argument('<file|directory>', 'Metadata file or directory to migrate')
  .option('--in-place', 'Modify files in place')
  .option('--dry-run', 'Show what would be migrated without making changes')
  .action(async (target, options) => {
    const migrator = new SchemaMigrator();

    try {
      const stat = fs.statSync(target);
      let results;

      if (stat.isDirectory()) {
        results = migrator.migrateDirectory(target, {
          dryRun: options.dryRun,
          inPlace: options.inPlace,
        });
      } else {
        const result = migrator.migrateFile(target, {
          dryRun: options.dryRun,
          inPlace: options.inPlace,
        });
        results = [result];
      }

      const report = migrator.generateReport(results);

      console.log('\nMigration Report:');
      console.log('═'.repeat(20));
      console.log(`Total files: ${report.summary.total}`);
      console.log(`Successful: ${report.summary.successful}`);
      console.log(`Errors: ${report.summary.errors}`);

      if (options.dryRun) {
        console.log('\nDry run completed. Use --in-place to apply changes.');
      } else {
        console.log(`\nMigration completed. ${migrator.migrations} files migrated.`);
      }
    } catch (error) {
      console.error(`Migration failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Check metadata compliance against all standards')
  .argument('<file>', 'Metadata file to check')
  .option('--strict', 'Enable strict validation')
  .action(async (file, options) => {
    const validator = new NamingValidator();
    const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Extract domain from metadata
    const domain = metadata.ensRoot || `${metadata.protocol}.${metadata.category}.eth`;
    const category = metadata.category || metadata.domain;

    const result = await validator.validateDomain(domain, category, {
      strict: options.strict,
      metadata,
      includeQA: true,
    });

    console.log(validator.generateReport(result));

    if (!result.isValid) {
      process.exit(1);
    }
  });

program
  .command('categories')
  .description('List available categories and their conventions')
  .action(() => {
    console.log(`\nAvailable Categories:`);
    console.log('='.repeat(25));
    CATEGORY_REGISTRY.roots.forEach((category) => {
      console.log(`\n${category.toUpperCase()}`);
      console.log('-'.repeat(20));

      const subs = CATEGORY_REGISTRY.subcategories[category] || [];
      if (subs.length) {
        console.log('Subcategories:');
        subs.forEach((s) => console.log(`  • ${s}`));
      }
    });
  });

program.parse();
