#!/usr/bin/env node

/**
 * Ethereum Contract Naming Conventions CLI Tool
 *
 * A comprehensive tool for managing contract naming conventions,
 * subdomain generation, and ENS metadata management across the Ethereum ecosystem.
 */

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const program = new Command();

// Naming convention configurations
const NAMING_CONVENTIONS = {
  dao: {
    primaryDomains: ['<org>.eth', '<org>dao.eth', '<org>-dao.eth'],
    subdomains: {
      governor: 'governor.<dao>.eth',
      token: ['token.<dao>.eth', '<symbol>.<dao>.eth'],
      timelock: ['timelock.<dao>.eth', 'executor.<dao>.eth'],
      treasury: 'treasury.<dao>.eth',
      operations: ['operations.<dao>.eth', 'wallet.<dao>.eth'],
      voting: 'voting.<dao>.eth'
    }
  },
  defi: {
    categories: {
      amm: '<protocol>.amm.eth',
      lending: '<protocol>.lending.eth',
      derivatives: '<protocol>.derivatives.eth',
      stablecoin: '<protocol>.stablecoin.eth',
      yield: '<protocol>.yield.eth'
    },
    subdomains: {
      router: 'router.<protocol>.amm.eth',
      factory: 'factory.<protocol>.amm.eth',
      pairs: 'pairs.<protocol>.amm.eth',
      pool: 'pool.<protocol>.lending.eth',
      market: 'market.<protocol>.lending.eth'
    }
  },
  l2: {
    categories: {
      rollup: '<protocol>.l2.eth',
      sidechain: '<chain>.sidechain.eth',
      bridge: 'bridge.<protocol>.eth',
      sequencer: 'sequencer.<protocol>.eth',
      da: 'da.<protocol>.eth'
    }
  },
  tokens: {
    erc20: '<symbol>.token.eth',
    erc721: '<project>.nft.eth',
    erc1155: '<project>.multitoken.eth',
    rwa: '<asset>.rwa.eth',
    governance: '<symbol>.gov.eth'
  },
  infrastructure: {
    oracle: '<provider>.oracle.eth',
    factory: 'factory.<protocol>.eth',
    proxy: 'proxy.<contract>.eth',
    multisig: '<name>.multisig.eth',
    smartaccount: '<name>.smartaccount.eth'
  }
};

// Metadata templates by category
const METADATA_TEMPLATES = {
  dao: {
    governor: {
      name: "DAO Governor",
      description: "Governance contract for proposal creation and execution",
      category: "governance",
      license: "MIT",
      proxy: "false"
    },
    token: {
      name: "Governance Token",
      description: "ERC-20 token for voting rights",
      category: "erc20",
      license: "MIT"
    },
    treasury: {
      name: "DAO Treasury",
      description: "Fund storage and management contract",
      category: "treasury",
      license: "MIT"
    }
  },
  defi: {
    amm: {
      name: "AMM Protocol",
      description: "Automated Market Maker decentralized exchange",
      category: "defi",
      license: "MIT"
    },
    lending: {
      name: "Lending Protocol",
      description: "Money market and lending platform",
      category: "defi",
      license: "MIT"
    }
  },
  tokens: {
    erc20: {
      name: "Token",
      description: "ERC-20 fungible token",
      category: "erc20",
      license: "MIT"
    },
    erc721: {
      name: "NFT Collection",
      description: "ERC-721 non-fungible token collection",
      category: "erc721",
      license: "MIT"
    }
  }
};

class ContractNamingTool {
  constructor() {
    this.conventions = NAMING_CONVENTIONS;
    this.templates = METADATA_TEMPLATES;
  }

  /**
   * Generate subdomain suggestions for a given protocol and category
   */
  generateSubdomains(protocol, category, options = {}) {
    const { verbose = false } = options;
    const suggestions = [];

    if (category === 'dao') {
      const daoDomain = protocol.includes('.eth') ? protocol : `${protocol}dao.eth`;

      Object.entries(this.conventions.dao.subdomains).forEach(([contract, pattern]) => {
        const patterns = Array.isArray(pattern) ? pattern : [pattern];
        patterns.forEach(p => {
          const subdomain = p.replace('<dao>', daoDomain);
          suggestions.push({
            contract,
            subdomain,
            category: 'dao',
            description: this.getContractDescription(contract, 'dao')
          });
        });
      });
    }

    else if (category === 'defi') {
      const protocolDomain = `${protocol}.${category}.eth`;

      Object.entries(this.conventions.defi.subdomains).forEach(([contract, pattern]) => {
        const subdomain = pattern.replace('<protocol>', protocol);
        suggestions.push({
          contract,
          subdomain,
          category: 'defi',
          description: this.getContractDescription(contract, 'defi')
        });
      });
    }

    else if (category === 'tokens') {
      const tokenTypes = ['erc20', 'erc721', 'erc1155', 'governance'];
      tokenTypes.forEach(type => {
        const pattern = this.conventions.tokens[type];
        const subdomain = pattern
          .replace('<symbol>', protocol.toLowerCase())
          .replace('<project>', protocol.toLowerCase())
          .replace('<asset>', protocol.toLowerCase());

        suggestions.push({
          contract: type,
          subdomain,
          category: 'tokens',
          description: this.getContractDescription(type, 'tokens')
        });
      });
    }

    if (verbose) {
      console.log('\nGenerated Subdomain Suggestions:');
      console.log('=' .repeat(50));
      suggestions.forEach((s, i) => {
        console.log(`${i + 1}. ${s.contract.padEnd(12)} → ${s.subdomain}`);
        console.log(`   ${s.description}`);
        console.log('');
      });
    }

    return suggestions;
  }

  /**
   * Validate naming convention compliance
   */
  validateNaming(name, category) {
    const issues = [];
    const warnings = [];

    // Basic format checks
    if (!name.endsWith('.eth')) {
      issues.push('Domain must end with .eth');
    }

    if (name.includes(' ')) {
      issues.push('Domain cannot contain spaces');
    }

    // Category-specific validation
    switch (category) {
      case 'dao':
        if (!name.includes('dao') && !name.includes('governance')) {
          warnings.push('DAO domains typically include "dao" in the name');
        }
        break;

      case 'defi':
        const validDefiCategories = ['amm', 'lending', 'derivatives', 'stablecoin', 'yield'];
        if (!validDefiCategories.some(cat => name.includes(cat))) {
          warnings.push(`DeFi domains should include category: ${validDefiCategories.join(', ')}`);
        }
        break;

      case 'tokens':
        if (!name.includes('token') && !name.includes('nft') && !name.includes('rwa')) {
          warnings.push('Token domains should indicate token type');
        }
        break;
    }

    // Length checks
    if (name.length > 63) {
      issues.push('Domain name is too long (max 63 characters)');
    }

    return { isValid: issues.length === 0, issues, warnings };
  }

  /**
   * Generate metadata template for a contract
   */
  generateMetadata(contractType, category, customFields = {}) {
    let template = {};

    if (category === 'dao' && this.templates.dao[contractType]) {
      template = { ...this.templates.dao[contractType] };
    } else if (category === 'defi' && this.templates.defi[contractType]) {
      template = { ...this.templates.defi[contractType] };
    } else if (category === 'tokens' && this.templates.tokens[contractType]) {
      template = { ...this.templates.tokens[contractType] };
    }

    // Apply custom fields
    template = { ...template, ...customFields };

    return template;
  }

  /**
   * Generate registration script
   */
  generateRegistrationScript(protocol, category, subdomains) {
    const script = [];

    script.push(`#!/bin/bash`);
    script.push(`# Contract Registration Script for ${protocol}`);
    script.push(`# Generated on ${new Date().toISOString()}`);
    script.push(``);

    if (category === 'dao') {
      const primaryDomain = protocol.includes('dao') ? protocol : `${protocol}dao.eth`;
      script.push(`# Primary DAO domain`);
      script.push(`ens-contract register ${primaryDomain} --type dao`);
      script.push(``);
    }

    subdomains.forEach(subdomain => {
      script.push(`# Register ${subdomain.contract} contract`);
      script.push(`ens-contract register ${subdomain.subdomain} --type ${subdomain.contract}`);
      script.push(`ens-contract metadata ${subdomain.subdomain} --data '${JSON.stringify(this.generateMetadata(subdomain.contract, category), null, 2)}'`);
      script.push(``);
    });

    return script.join('\n');
  }

  getContractDescription(contract, category) {
    const descriptions = {
      dao: {
        governor: 'Core governance contract handling proposals and voting',
        token: 'ERC-20 token for voting rights',
        timelock: 'Delay mechanism for proposal execution',
        treasury: 'Fund storage and management contract',
        operations: 'Main operational multi-signature wallet',
        voting: 'Specialized voting mechanism contracts'
      },
      defi: {
        router: 'Main contract for token swaps and liquidity operations',
        factory: 'Contract deployment factory for pools/pairs',
        pool: 'Lending pool for asset deposits and borrowing',
        market: 'Money market for lending and borrowing operations'
      },
      tokens: {
        erc20: 'Fungible token contract',
        erc721: 'Non-fungible token collection',
        erc1155: 'Multi-token contract supporting both fungible and non-fungible tokens',
        governance: 'Protocol governance token'
      }
    };

    return descriptions[category]?.[contract] || 'Contract for protocol operations';
  }
}

// CLI Commands
program
  .name('contract-naming-cli')
  .description('Ethereum Contract Naming Conventions CLI Tool')
  .version('1.0.0');

program
  .command('suggest')
  .description('Generate subdomain suggestions for a protocol')
  .argument('<protocol>', 'Protocol name')
  .argument('<category>', 'Category (dao, defi, l2, tokens, infrastructure)')
  .option('-v, --verbose', 'Show detailed output')
  .action((protocol, category, options) => {
    const tool = new ContractNamingTool();
    const suggestions = tool.generateSubdomains(protocol, category, options);

    console.log(`\nSubdomain suggestions for ${protocol} (${category}):`);
    console.log('=' .repeat(50));

    suggestions.forEach((s, i) => {
      console.log(`${i + 1}. ${s.subdomain}`);
      console.log(`   ${s.description}`);
      console.log('');
    });

    // Save suggestions to file
    const filename = `${protocol}-${category}-suggestions.json`;
    fs.writeFileSync(filename, JSON.stringify(suggestions, null, 2));
    console.log(`Suggestions saved to ${filename}`);
  });

program
  .command('validate')
  .description('Validate naming convention compliance')
  .argument('<domain>', 'Domain name to validate')
  .argument('<category>', 'Category (dao, defi, l2, tokens, infrastructure)')
  .action((domain, category) => {
    const tool = new ContractNamingTool();
    const result = tool.validateNaming(domain, category);

    console.log(`\nValidation Results for: ${domain}`);
    console.log('=' .repeat(40));

    if (result.isValid) {
      console.log('✅ Valid naming convention');
    } else {
      console.log('❌ Invalid naming convention');
      result.issues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
  });

program
  .command('metadata')
  .description('Generate metadata template for a contract')
  .argument('<contract-type>', 'Type of contract')
  .argument('<category>', 'Category (dao, defi, tokens)')
  .option('-o, --output <file>', 'Output file for metadata')
  .option('-c, --custom <fields>', 'Custom fields as JSON string')
  .action((contractType, category, options) => {
    const tool = new ContractNamingTool();
    let customFields = {};

    if (options.custom) {
      try {
        customFields = JSON.parse(options.custom);
      } catch (e) {
        console.error('Invalid custom fields JSON');
        process.exit(1);
      }
    }

    const metadata = tool.generateMetadata(contractType, category, customFields);

    console.log(`\nGenerated Metadata Template:`);
    console.log('=' .repeat(30));
    console.log(JSON.stringify(metadata, null, 2));

    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(metadata, null, 2));
      console.log(`\nMetadata saved to ${options.output}`);
    }
  });

program
  .command('register')
  .description('Generate registration script for a protocol')
  .argument('<protocol>', 'Protocol name')
  .argument('<category>', 'Category')
  .option('-o, --output <file>', 'Output file for script')
  .action((protocol, category, options) => {
    const tool = new ContractNamingTool();
    const subdomains = tool.generateSubdomains(protocol, category);
    const script = tool.generateRegistrationScript(protocol, category, subdomains);

    console.log(`\nGenerated Registration Script:`);
    console.log('=' .repeat(35));
    console.log(script);

    const filename = options.output || `${protocol}-${category}-registration.sh`;
    fs.writeFileSync(filename, script);
    console.log(`\nScript saved to ${filename}`);
  });

program
  .command('categories')
  .description('List available categories and their conventions')
  .action(() => {
    console.log(`\n📂 Available Categories:`);
    console.log('=' .repeat(25));

    Object.entries(NAMING_CONVENTIONS).forEach(([category, config]) => {
      console.log(`\n🔹 ${category.toUpperCase()}`);
      console.log('-'.repeat(20));

      if (config.primaryDomains) {
        console.log('Primary domains:');
        config.primaryDomains.forEach(domain => console.log(`  • ${domain}`));
      }

      if (config.categories) {
        console.log('Categories:');
        Object.entries(config.categories).forEach(([type, pattern]) => {
          console.log(`  • ${type}: ${pattern}`);
        });
      }

      if (config.subdomains) {
        console.log('Common subdomains:');
        Object.entries(config.subdomains).forEach(([contract, pattern]) => {
          const patterns = Array.isArray(pattern) ? pattern : [pattern];
          console.log(`  • ${contract}: ${patterns[0]}`);
        });
      }
    });
  });

program.parse();

module.exports = ContractNamingTool;
