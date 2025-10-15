#!/usr/bin/env node

/**
 * ENS Metadata Filler
 *
 * Interactive tool to populate metadata templates with real contract data,
 * addresses, and protocol information for ENS subdomain deployments.
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

class MetadataFiller {
  constructor() {
    this.templates = {};
    this.filledData = {};
  }

  // Load metadata templates for a category
  loadTemplates(category, subcategory) {
    const templateDir = path.join(process.cwd(), 'metadata');
    const templates = {};

    // Load base category templates
    fs.readdirSync(templateDir)
      .filter(
        (file) =>
          file.includes(`${category}-metadata.json`) ||
          file.includes(`${category}.evmd-metadata.json`)
      )
      .forEach((file) => {
        const templatePath = path.join(templateDir, file);
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        templates[file.replace('-metadata.json', '').replace('.evmd-metadata.json', '')] = template;
      });

    // Load subcategory-specific templates
    fs.readdirSync(templateDir)
      .filter(
        (file) =>
          file.includes(`${subcategory}.${category}-metadata.json`) ||
          file.includes(`${subcategory}.${category}.evmd-metadata.json`)
      )
      .forEach((file) => {
        const templatePath = path.join(templateDir, file);
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        templates[file.replace('-metadata.json', '').replace('.evmd-metadata.json', '')] = template;
      });

    this.templates = templates;
    return templates;
  }

  // Interactive metadata filling
  async fillMetadata(category, subcategory, options = {}) {
    const templates = this.loadTemplates(category, subcategory);
    const filledMetadata = {};

    console.log(`\nFilling metadata for ${category}/${subcategory}`);
    console.log('='.repeat(50));

    for (const [templateName, template] of Object.entries(templates)) {
      console.log(`\nFilling ${templateName}...`);

      const filled = await this.fillTemplate(template, templateName, options);
      filledMetadata[templateName] = filled;
    }

    this.filledData = filledMetadata;
    return filledMetadata;
  }

  // Fill a single template with user input
  async fillTemplate(template, templateName, options) {
    const filled = JSON.parse(JSON.stringify(template)); // Deep copy

    // Handle different template sections
    if (filled.protocol) {
      filled.protocol = await this.fillProtocolSection(filled.protocol, options);
    }

    if (filled.contract) {
      filled.contract = await this.fillContractSection(filled.contract, options);
    }

    if (filled.tokenomics || filled.economics) {
      filled.tokenomics = await this.fillEconomicsSection(
        filled.tokenomics || filled.economics,
        options
      );
    }

    if (filled.security) {
      filled.security = await this.fillSecuritySection(filled.security, options);
    }

    // Fill any remaining placeholder values
    filled.lastUpdated = new Date().toISOString();
    filled.version = options.version || filled.version || '1.0.0';

    return filled;
  }

  async fillProtocolSection(protocol, options) {
    console.log('  Protocol Information:');

    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Protocol name:',
        default: protocol.name || options.protocolName,
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: protocol.version || options.version || '1.0.0',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: protocol.description,
      },
      {
        type: 'input',
        name: 'website',
        message: 'Website URL:',
        default: protocol.website,
      },
      {
        type: 'input',
        name: 'documentation',
        message: 'Documentation URL:',
        default: protocol.documentation,
      },
    ];

    const answers = await inquirer.prompt(questions);

    return {
      ...protocol,
      ...answers,
      ecosystem: protocol.ecosystem || 'ethereum',
      launchDate: protocol.launchDate || new Date().toISOString().split('T')[0],
    };
  }

  async fillContractSection(contract, options) {
    console.log('  Contract Information:');

    const questions = [
      {
        type: 'input',
        name: 'address',
        message: 'Contract address:',
        validate: (input) =>
          /^0x[a-fA-F0-9]{40}$/.test(input) || 'Must be a valid Ethereum address',
      },
      {
        type: 'input',
        name: 'deploymentBlock',
        message: 'Deployment block number:',
        validate: (input) => !isNaN(input) || 'Must be a valid block number',
      },
      {
        type: 'list',
        name: 'network',
        message: 'Deployment network:',
        choices: ['mainnet', 'goerli', 'sepolia', 'polygon', 'arbitrum', 'optimism'],
        default: 'mainnet',
      },
    ];

    // Add category-specific questions
    if (options.category === 'defi' && options.subcategory === 'amm') {
      questions.push({
        type: 'input',
        name: 'feeTiers',
        message: 'Fee tiers (comma-separated):',
        default: '500,3000,10000',
      });
    }

    if (options.category === 'gaming') {
      questions.push({
        type: 'input',
        name: 'maxSupply',
        message: 'Max token supply:',
        default: '10000000',
      });
    }

    const answers = await inquirer.prompt(questions);

    return {
      ...contract,
      ...answers,
      interfaces: contract.interfaces || ['ERC165'],
      compiler: contract.compiler || { version: '0.8.19', optimizer: true },
    };
  }

  async fillEconomicsSection(economics, options) {
    console.log('  Economics Information:');

    const questions = [];

    if (economics.totalSupply !== undefined) {
      questions.push({
        type: 'input',
        name: 'totalSupply',
        message: 'Total token supply:',
        default: economics.totalSupply,
      });
    }

    if (economics.circulatingSupply !== undefined) {
      questions.push({
        type: 'input',
        name: 'circulatingSupply',
        message: 'Circulating supply:',
        default: economics.circulatingSupply,
      });
    }

    if (options.category === 'defi') {
      questions.push(
        {
          type: 'input',
          name: 'tvl',
          message: 'Total Value Locked (USD):',
          default: options.tvl || '0',
        },
        {
          type: 'input',
          name: 'dailyVolume',
          message: 'Daily volume (USD):',
          default: '0',
        }
      );
    }

    if (options.category === 'dao') {
      questions.push({
        type: 'input',
        name: 'totalProposals',
        message: 'Total proposals created:',
        default: '0',
      });
    }

    const answers = await inquirer.prompt(questions);

    return {
      ...economics,
      ...answers,
      lastUpdated: new Date().toISOString(),
    };
  }

  async fillSecuritySection(security, _options) {
    console.log('  Security Information:');

    const questions = [
      {
        type: 'confirm',
        name: 'hasAudits',
        message: 'Has the contract been audited?',
        default: false,
      },
      {
        type: 'input',
        name: 'auditReports',
        message: 'Audit report URLs (comma-separated):',
        when: (answers) => answers.hasAudits,
      },
      {
        type: 'confirm',
        name: 'hasBugBounty',
        message: 'Is there an active bug bounty program?',
        default: false,
      },
      {
        type: 'input',
        name: 'bugBountyUrl',
        message: 'Bug bounty URL:',
        when: (answers) => answers.hasBugBounty,
      },
    ];

    const answers = await inquirer.prompt(questions);

    return {
      ...security,
      audits: answers.hasAudits
        ? answers.auditReports
          ? answers.auditReports
              .split(',')
              .map((url) => url.trim())
              .filter(Boolean)
          : []
        : [],
      bugBounty: answers.hasBugBounty ? { url: answers.bugBountyUrl, active: true } : null,
      riskAssessment: security.riskAssessment || 'Low',
    };
  }

  // Save filled metadata to files
  saveMetadata(outputDir, metadata) {
    const outputPath = path.join(process.cwd(), outputDir || 'filled-metadata');

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    for (const [filename, data] of Object.entries(metadata)) {
      const filePath = path.join(outputPath, `${filename}-metadata.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Saved ${filePath}`);
    }

    return outputPath;
  }

  // Validate filled metadata
  validateMetadata(metadata) {
    const errors = [];

    for (const [name, data] of Object.entries(metadata)) {
      // Check required fields
      if (!data.protocol?.name) {
        errors.push(`${name}: Missing protocol name`);
      }

      if (!data.contract?.address) {
        errors.push(`${name}: Missing contract address`);
      }

      if (!data.lastUpdated) {
        errors.push(`${name}: Missing last updated timestamp`);
      }
    }

    return errors;
  }

  // Generate metadata for a subdomain plan
  async fillPlan(planPath, _options = {}) {
    const planFile = path.join(process.cwd(), planPath, 'plan.json');

    if (!fs.existsSync(planFile)) {
      throw new Error(`Plan file not found: ${planFile}`);
    }

    const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));

    console.log(`\nFilling metadata for plan: ${plan.protocol.name}`);
    console.log(`Category: ${plan.category}/${plan.subcategory}`);

    const filledMetadata = await this.fillMetadata(plan.category, plan.subcategory, {
      ...plan.options,
      protocolName: plan.protocol.name,
    });

    // Validate
    const errors = this.validateMetadata(filledMetadata);
    if (errors.length > 0) {
      console.log('\nValidation Errors:');
      errors.forEach((error) => console.log(`  - ${error}`));
      throw new Error('Metadata validation failed');
    }

    // Save
    const outputDir = path.join(planPath, 'metadata');
    this.saveMetadata(outputDir, filledMetadata);

    return filledMetadata;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('\nENS Metadata Filler');
    console.log('='.repeat(30));
    console.log('Populate metadata templates with real contract data');
    console.log('\nUsage:');
    console.log('  node metadata-filler.js <category> <subcategory> [options]');
    console.log('  node metadata-filler.js --plan <plan-directory>');
    console.log('\nExamples:');
    console.log('  node metadata-filler.js defi amm --protocol uniswap');
    console.log('  node metadata-filler.js dao governor --token ENS');
    console.log('  node metadata-filler.js --plan ./plans/MyProtocol');
    console.log('\nOptions:');
    console.log('  --protocol <name>   Protocol name');
    console.log('  --version <ver>     Protocol version');
    console.log('  --output <dir>      Output directory');
    console.log('  --plan <dir>        Fill metadata for existing plan');
    process.exit(0);
  }

  const filler = new MetadataFiller();
  const options = {};

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      options[key] = args[i + 1];
      i++; // Skip next arg
    }
  }

  if (options.plan) {
    // Fill from existing plan
    filler
      .fillPlan(options.plan, options)
      .then(() => {
        console.log('\nMetadata filling complete!');
      })
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      });
  } else {
    // Interactive filling
    const [category, subcategory] = args;

    if (!category || !subcategory) {
      console.log('Error: Category and subcategory required');
      console.log('Run with --help for usage information');
      process.exit(1);
    }

    filler
      .fillMetadata(category, subcategory, options)
      .then((metadata) => {
        const errors = filler.validateMetadata(metadata);
        if (errors.length > 0) {
          console.log('\nValidation Errors:');
          errors.forEach((error) => console.log(`  - ${error}`));
          process.exit(1);
        }

        const outputDir = options.output || `./metadata/${category}-${subcategory}`;
        filler.saveMetadata(outputDir, metadata);
        console.log('\nMetadata filling complete!');
      })
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      });
  }
}

export default MetadataFiller;

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
