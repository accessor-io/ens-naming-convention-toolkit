#!/usr/bin/env node

/**
 * Ethereum Subdomain Planner
 *
 * Generates complete subdomain hierarchies with metadata for different
 * protocol types, enabling systematic contract organization and discovery.
 */

const fs = require('fs');
const { generateMetadata } = require('./metadata-generator');

// Subdomain hierarchies for different protocol categories
const SUBDOMAIN_HIERARCHIES = {
  defi: {
    amm: {
      structure: [
        'v3.<protocol>.amm.eth',
        '├── factory.v3.<protocol>.amm.eth',
        '├── router.v3.<protocol>.amm.eth',
        '├── quoter.v3.<protocol>.amm.eth',
        '├── multicall.v3.<protocol>.amm.eth',
        '└── positions.v3.<protocol>.amm.eth',
        'v2.<protocol>.amm.eth',
        '└── factory.v2.<protocol>.amm.eth',
        'legacy.<protocol>.amm.eth'
      ],
      metadata: {
        'v3.<protocol>.amm.eth': { category: 'amm', version: '3' },
        'factory.v3.<protocol>.amm.eth': { contractType: 'factory' },
        'router.v3.<protocol>.amm.eth': { contractType: 'router' },
        'quoter.v3.<protocol>.amm.eth': { contractType: 'quoter' },
        'multicall.v3.<protocol>.amm.eth': { contractType: 'multicall' },
        'positions.v3.<protocol>.amm.eth': { contractType: 'positions' },
        'v2.<protocol>.amm.eth': { category: 'amm', version: '2' },
        'factory.v2.<protocol>.amm.eth': { contractType: 'factory' },
        'legacy.<protocol>.amm.eth': { category: 'amm', version: 'legacy' }
      }
    },

    lending: {
      structure: [
        'v3.<protocol>.lending.eth',
        '├── pool.v3.<protocol>.lending.eth',
        '├── pool-configurator.v3.<protocol>.lending.eth',
        '├── rewards-controller.v3.<protocol>.lending.eth',
        '├── price-oracle.v3.<protocol>.lending.eth',
        '└── ui-helpers.v3.<protocol>.lending.eth',
        'incentives.<protocol>.lending.eth',
        '└── incentives-controller.incentives.<protocol>.lending.eth',
        'governance.<protocol>.lending.eth'
      ],
      metadata: {
        'v3.<protocol>.lending.eth': { category: 'lending', version: '3' },
        'pool.v3.<protocol>.lending.eth': { contractType: 'pool' },
        'pool-configurator.v3.<protocol>.lending.eth': { contractType: 'pool-configurator' },
        'rewards-controller.v3.<protocol>.lending.eth': { contractType: 'rewards-controller' },
        'price-oracle.v3.<protocol>.lending.eth': { contractType: 'price-oracle' },
        'ui-helpers.v3.<protocol>.lending.eth': { contractType: 'ui-helpers' },
        'incentives.<protocol>.lending.eth': { category: 'lending', type: 'incentives' },
        'incentives-controller.incentives.<protocol>.lending.eth': { contractType: 'incentives-controller' },
        'governance.<protocol>.lending.eth': { category: 'lending', type: 'governance' }
      }
    }
  },

  dao: {
    governor: {
      structure: [
        '<dao>.eth',
        '├── governance.<dao>.eth',
        '│   ├── governor.governance.<dao>.eth',
        '│   ├── token.governance.<dao>.eth',
        '│   ├── timelock.governance.<dao>.eth',
        '│   └── treasury.governance.<dao>.eth',
        '├── operations.<dao>.eth',
        '│   ├── wallet.operations.<dao>.eth',
        '│   ├── delegate.operations.<dao>.eth',
        '│   └── emergency.operations.<dao>.eth',
        '└── meta.<dao>.eth',
        '    ├── docs.meta.<dao>.eth',
        '    ├── forum.meta.<dao>.eth',
        '    └── discord.meta.<dao>.eth'
      ],
      metadata: {
        '<dao>.eth': { category: 'dao', type: 'primary' },
        'governance.<dao>.eth': { category: 'governance', type: 'governance' },
        'governor.governance.<dao>.eth': { contractType: 'governor' },
        'token.governance.<dao>.eth': { contractType: 'token' },
        'timelock.governance.<dao>.eth': { contractType: 'timelock' },
        'treasury.governance.<dao>.eth': { contractType: 'treasury' },
        'operations.<dao>.eth': { category: 'operations', type: 'operations' },
        'wallet.operations.<dao>.eth': { contractType: 'wallet' },
        'delegate.operations.<dao>.eth': { contractType: 'delegate' },
        'emergency.operations.<dao>.eth': { contractType: 'emergency' },
        'meta.<dao>.eth': { category: 'meta', type: 'meta' },
        'docs.meta.<dao>.eth': { contractType: 'docs' },
        'forum.meta.<dao>.eth': { contractType: 'forum' },
        'discord.meta.<dao>.eth': { contractType: 'discord' }
      }
    }
  },

  infrastructure: {
    oracle: {
      structure: [
        '<provider>.oracle.eth',
        '├── feeds.<provider>.oracle.eth',
        '│   ├── eth-usd.feeds.<provider>.oracle.eth',
        '│   ├── btc-usd.feeds.<provider>.oracle.eth',
        '│   ├── link-usd.feeds.<provider>.oracle.eth',
        '│   └── aggregator.feeds.<provider>.oracle.eth',
        '├── nodes.<provider>.oracle.eth',
        '└── registry.<provider>.oracle.eth'
      ],
      metadata: {
        '<provider>.oracle.eth': { category: 'oracle', type: 'provider' },
        'feeds.<provider>.oracle.eth': { category: 'oracle', type: 'feeds' },
        'eth-usd.feeds.<provider>.oracle.eth': { feedType: 'price-feed', baseAsset: 'ETH', quoteAsset: 'USD' },
        'btc-usd.feeds.<provider>.oracle.eth': { feedType: 'price-feed', baseAsset: 'BTC', quoteAsset: 'USD' },
        'link-usd.feeds.<provider>.oracle.eth': { feedType: 'price-feed', baseAsset: 'LINK', quoteAsset: 'USD' },
        'aggregator.feeds.<provider>.oracle.eth': { contractType: 'aggregator' },
        'nodes.<provider>.oracle.eth': { category: 'oracle', type: 'nodes' },
        'registry.<provider>.oracle.eth': { contractType: 'registry' }
      }
    }
  },

  // Gaming & NFT Platforms
  gaming: {
    nft: {
      structure: [
        '<game>.gaming.eth',
        '├── assets.<game>.gaming.eth',
        '│   ├── collection.assets.<game>.gaming.eth',
        '│   ├── marketplace.assets.<game>.gaming.eth',
        '│   └── staking.assets.<game>.gaming.eth',
        '├── gameplay.<game>.gaming.eth',
        '│   ├── mechanics.gameplay.<game>.gaming.eth',
        '│   ├── rewards.gameplay.<game>.gaming.eth',
        '│   └── achievements.gameplay.<game>.gaming.eth',
        '└── social.<game>.gaming.eth',
        '    ├── guilds.social.<game>.gaming.eth',
        '    ├── tournaments.social.<game>.gaming.eth',
        '    └── chat.social.<game>.gaming.eth'
      ],
      metadata: {
        '<game>.gaming.eth': { category: 'gaming', type: 'nft-game' },
        'assets.<game>.gaming.eth': { category: 'gaming', type: 'assets' },
        'collection.assets.<game>.gaming.eth': { contractType: 'nft-collection' },
        'marketplace.assets.<game>.gaming.eth': { contractType: 'marketplace' },
        'staking.assets.<game>.gaming.eth': { contractType: 'staking' },
        'gameplay.<game>.gaming.eth': { category: 'gaming', type: 'gameplay' },
        'mechanics.gameplay.<game>.gaming.eth': { contractType: 'mechanics' },
        'rewards.gameplay.<game>.gaming.eth': { contractType: 'rewards' },
        'achievements.gameplay.<game>.gaming.eth': { contractType: 'achievements' },
        'social.<game>.gaming.eth': { category: 'gaming', type: 'social' },
        'guilds.social.<game>.gaming.eth': { contractType: 'guilds' },
        'tournaments.social.<game>.gaming.eth': { contractType: 'tournaments' },
        'chat.social.<game>.gaming.eth': { contractType: 'chat' }
      }
    }
  },

  // Social & Communication
  social: {
    platform: {
      structure: [
        '<platform>.social.eth',
        '├── content.<platform>.social.eth',
        '│   ├── posts.content.<platform>.social.eth',
        '│   ├── media.content.<platform>.social.eth',
        '│   └── moderation.content.<platform>.social.eth',
        '├── users.<platform>.social.eth',
        '│   ├── profiles.users.<platform>.social.eth',
        '│   ├── connections.users.<platform>.social.eth',
        '│   └── privacy.users.<platform>.social.eth',
        '└── monetization.<platform>.social.eth',
        '    ├── tokens.monetization.<platform>.social.eth',
        '    ├── subscriptions.monetization.<platform>.social.eth',
        '    └── ads.monetization.<platform>.social.eth'
      ],
      metadata: {
        '<platform>.social.eth': { category: 'social', type: 'platform' },
        'content.<platform>.social.eth': { category: 'social', type: 'content' },
        'posts.content.<platform>.social.eth': { contractType: 'posts' },
        'media.content.<platform>.social.eth': { contractType: 'media' },
        'moderation.content.<platform>.social.eth': { contractType: 'moderation' },
        'users.<platform>.social.eth': { category: 'social', type: 'users' },
        'profiles.users.<platform>.social.eth': { contractType: 'profiles' },
        'connections.users.<platform>.social.eth': { contractType: 'connections' },
        'privacy.users.<platform>.social.eth': { contractType: 'privacy' },
        'monetization.<platform>.social.eth': { category: 'social', type: 'monetization' },
        'tokens.monetization.<platform>.social.eth': { contractType: 'tokens' },
        'subscriptions.monetization.<platform>.social.eth': { contractType: 'subscriptions' },
        'ads.monetization.<platform>.social.eth': { contractType: 'ads' }
      }
    }
  },

  // Real World Assets (RWA)
  rwa: {
    realestate: {
      structure: [
        '<property>.rwa.eth',
        '├── ownership.<property>.rwa.eth',
        '│   ├── registry.ownership.<property>.rwa.eth',
        '│   ├── transfer.ownership.<property>.rwa.eth',
        '│   └── voting.ownership.<property>.rwa.eth',
        '├── finance.<property>.rwa.eth',
        '│   ├── mortgage.finance.<property>.rwa.eth',
        '│   ├── insurance.finance.<property>.rwa.eth',
        '│   └── dividends.finance.<property>.rwa.eth',
        '└── compliance.<property>.rwa.eth',
        '    ├── legal.compliance.<property>.rwa.eth',
        '    ├── regulatory.compliance.<property>.rwa.eth',
        '    └── audit.compliance.<property>.rwa.eth'
      ],
      metadata: {
        '<property>.rwa.eth': { category: 'rwa', type: 'real-estate' },
        'ownership.<property>.rwa.eth': { category: 'rwa', type: 'ownership' },
        'registry.ownership.<property>.rwa.eth': { contractType: 'registry' },
        'transfer.ownership.<property>.rwa.eth': { contractType: 'transfer' },
        'voting.ownership.<property>.rwa.eth': { contractType: 'voting' },
        'finance.<property>.rwa.eth': { category: 'rwa', type: 'finance' },
        'mortgage.finance.<property>.rwa.eth': { contractType: 'mortgage' },
        'insurance.finance.<property>.rwa.eth': { contractType: 'insurance' },
        'dividends.finance.<property>.rwa.eth': { contractType: 'dividends' },
        'compliance.<property>.rwa.eth': { category: 'rwa', type: 'compliance' },
        'legal.compliance.<property>.rwa.eth': { contractType: 'legal' },
        'regulatory.compliance.<property>.rwa.eth': { contractType: 'regulatory' },
        'audit.compliance.<property>.rwa.eth': { contractType: 'audit' }
      }
    }
  }
};

class SubdomainPlanner {
  constructor() {
    this.hierarchies = SUBDOMAIN_HIERARCHIES;
  }

  /**
   * Generate complete subdomain plan for a protocol
   */
  generatePlan(protocol, category, type, variables = {}) {
    const hierarchy = this.hierarchies[category]?.[type];

    if (!hierarchy) {
      throw new Error(`Hierarchy not found for ${category}/${type}`);
    }

    const plan = {
      protocol,
      category,
      type,
      variables,
      subdomains: [],
      metadata: {},
      registrationScript: [],
      crossReferences: {}
    };

    // Generate subdomains with metadata
    hierarchy.structure.forEach(subdomainPattern => {
      const subdomain = subdomainPattern
        .replace('<protocol>', protocol)
        .replace('<dao>', protocol)
        .replace('<provider>', protocol);

      const subdomainKey = subdomain.replace('.eth', '');
      const metadataKey = subdomainPattern
        .replace('<protocol>', protocol)
        .replace('<dao>', protocol)
        .replace('<provider>', protocol);

      plan.subdomains.push({
        pattern: subdomainPattern,
        subdomain,
        metadata: this.generateSubdomainMetadata(subdomainKey, hierarchy.metadata[metadataKey] || {}, variables)
      });

      // Generate metadata for this subdomain
      const metadataVars = { ...variables, ...hierarchy.metadata[metadataKey] };
      try {
        plan.metadata[subdomain] = generateMetadata(category, type, metadataVars);
      } catch (e) {
        // Skip metadata generation if template doesn't exist
        plan.metadata[subdomain] = { error: e.message };
      }
    });

    // Generate registration script
    plan.registrationScript = this.generateRegistrationScript(plan);

    // Generate cross-references
    plan.crossReferences = this.generateCrossReferences(plan);

    return plan;
  }

  /**
   * Generate metadata for a specific subdomain
   */
  generateSubdomainMetadata(subdomain, baseMetadata, variables) {
    return {
      subdomain,
      ...baseMetadata,
      variables,
      generatedAt: new Date().toISOString(),
      relationships: this.analyzeRelationships(subdomain, variables)
    };
  }

  /**
   * Analyze relationships between subdomains
   */
  analyzeRelationships(subdomain, variables) {
    const relationships = {
      parent: null,
      children: [],
      siblings: [],
      dependencies: []
    };

    // Simple relationship analysis based on subdomain structure
    const parts = subdomain.split('.');
    if (parts.length > 1) {
      relationships.parent = parts.slice(1).join('.');
    }

    // Add protocol-level relationships
    if (variables.protocol) {
      relationships.protocol = `${variables.protocol}.${variables.category || 'protocol'}.eth`;
    }

    return relationships;
  }

  /**
   * Generate registration script
   */
  generateRegistrationScript(plan) {
    const script = [];

    script.push(`#!/bin/bash`);
    script.push(`# Subdomain Registration Script for ${plan.protocol}`);
    script.push(`# Generated on ${new Date().toISOString()}`);
    script.push(`# Category: ${plan.category}, Type: ${plan.type}`);
    script.push(``);

    // Register primary domain first
    const primaryDomain = `${plan.protocol}.${plan.category}.eth`;
    script.push(`# Register primary domain`);
    script.push(`ens-contract register ${primaryDomain} --type ${plan.type}`);
    script.push(``);

    // Register subdomains
    plan.subdomains.forEach(({ subdomain, metadata }) => {
      script.push(`# Register subdomain: ${subdomain}`);
      script.push(`ens-contract register ${subdomain} --parent ${primaryDomain}`);

      if (metadata.contractType) {
        script.push(`# Set metadata for ${subdomain}`);
        script.push(`ens-contract metadata ${subdomain} --data "${JSON.stringify(plan.metadata[subdomain])}"`);
      }

      script.push(``);
    });

    // Set cross-references
    script.push(`# Set cross-references`);
    Object.entries(plan.crossReferences).forEach(([domain, references]) => {
      Object.entries(references).forEach(([key, value]) => {
        script.push(`ens-contract metadata ${domain} --set ${key}=${value}`);
      });
    });

    return script;
  }

  /**
   * Generate cross-references between subdomains
   */
  generateCrossReferences(plan) {
    const references = {};

    plan.subdomains.forEach(({ subdomain, metadata }) => {
      references[subdomain] = {};

      // Add protocol reference
      if (plan.variables.protocol) {
        references[subdomain]['protocol.domain'] = `${plan.protocol}.${plan.category}.eth`;
      }

      // Add contract type references
      if (metadata.contractType) {
        const relatedDomains = plan.subdomains
          .filter(s => s.metadata.contractType && s.subdomain !== subdomain)
          .map(s => s.subdomain);

        if (relatedDomains.length > 0) {
          references[subdomain][`related.contracts`] = relatedDomains.join(',');
        }
      }
    });

    return references;
  }

  /**
   * Display subdomain plan
   */
  displayPlan(plan) {
    console.log(`\n🏗️  SUBDOMAIN PLAN: ${plan.protocol.toUpperCase()}`);
    console.log(`═`.repeat(60));
    console.log(`Category: ${plan.category.toUpperCase()}`);
    console.log(`Type: ${plan.type.toUpperCase()}`);
    console.log(`Variables: ${JSON.stringify(plan.variables, null, 2)}`);
    console.log(``);

    console.log(`📋 SUBDOMAIN HIERARCHY:`);
    plan.subdomains.forEach(({ pattern, subdomain, metadata }) => {
      const indent = '  '.repeat(pattern.split('├──').length - 1);
      console.log(`${indent}${subdomain}`);
      if (metadata.contractType) {
        console.log(`${indent}  └─ ${metadata.contractType}`);
      }
    });

    console.log(`\n🔗 CROSS-REFERENCES:`);
    Object.entries(plan.crossReferences).forEach(([domain, refs]) => {
      console.log(`  ${domain}:`);
      Object.entries(refs).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    });

    console.log(`\n📝 REGISTRATION SCRIPT:`);
    console.log('═'.repeat(30));
    plan.registrationScript.slice(0, 20).forEach(line => {
      console.log(`  ${line}`);
    });
    if (plan.registrationScript.length > 20) {
      console.log(`  ... (${plan.registrationScript.length - 20} more lines)`);
    }

    console.log(`\n💾 FILES GENERATED:`);
    console.log(`  • Registration script: ${plan.protocol}-${plan.category}-${plan.type}-setup.sh`);
    console.log(`  • Metadata files: ${Object.keys(plan.metadata).length} subdomain metadata files`);
  }

  /**
   * Save plan to files
   */
  savePlan(plan, outputPath = null) {
    // Determine output directory
    let outputDir = './';
    let scriptFilename = `${plan.protocol}-${plan.category}-${plan.type}-setup.sh`;

    if (outputPath) {
      // Check if it's a directory or file
      if (outputPath.endsWith('.sh')) {
        // It's a filename, use current directory
        scriptFilename = outputPath;
      } else if (outputPath.endsWith('/')) {
        // It's a directory path
        outputDir = outputPath;
      } else {
        // Assume it's a directory
        outputDir = outputPath;
      }
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save registration script
    const scriptPath = `${outputDir}/${scriptFilename}`;
    fs.writeFileSync(scriptPath, plan.registrationScript.join('\n'));
    console.log(`✅ Registration script: ${scriptPath}`);

    // Save metadata files
    Object.entries(plan.metadata).forEach(([subdomain, metadata]) => {
      if (!metadata.error) {
        const metadataPath = `${outputDir}/${subdomain.replace('.eth', '')}-metadata.json`;
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`✅ Metadata file: ${metadataPath}`);
      }
    });

    // Save plan summary
    const planPath = `${outputDir}/${plan.protocol}-${plan.category}-${plan.type}-plan.json`;
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
    console.log(`✅ Plan summary: ${planPath}`);
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('\n🏗️  Ethereum Subdomain Planner');
    console.log('═'.repeat(35));
    console.log('Usage: node subdomain-planner.js <protocol> <category> <type> [options]');
    console.log('\nCategories and Types:');
    console.log('  defi amm          - AMM protocols (Uniswap, Balancer)');
    console.log('  defi lending      - Lending protocols (Aave, Compound)');
    console.log('  dao governor      - DAO governance (ENS, Uniswap)');
    console.log('  infrastructure oracle - Oracle networks (Chainlink)');
    console.log('  gaming nft        - NFT gaming platforms (Axie, CryptoKitties)');
    console.log('  social platform   - Social networks (Lens, Farcaster)');
    console.log('  rwa realestate    - Real estate tokenization');
    console.log('  rwa commodities   - Commodity tokenization (gold, oil)');
    console.log('\nExamples:');
    console.log('  node subdomain-planner.js uniswap defi amm --version 3 --tvl 5000000000');
    console.log('  node subdomain-planner.js ens dao governor --dao ENS --token ENS');
    console.log('  node subdomain-planner.js chainlink infrastructure oracle --provider chainlink');
    console.log('\nOptions:');
    console.log('  --version <ver>   Protocol version');
    console.log('  --output <dir>    Output directory');
    console.log('  --tvl <amount>    Total value locked');
    console.log('  --dao <name>      DAO name');
    console.log('  --token <symbol>  Token symbol');
    process.exit(1);
  }

  const [protocol, category, type] = args;
  const options = {};

  // Parse additional arguments
  for (let i = 3; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      options[key] = args[i + 1];
    }
  }

  try {
    const planner = new SubdomainPlanner();
    const plan = planner.generatePlan(protocol, category, type, options);

    planner.displayPlan(plan);

    if (options.output) {
      planner.savePlan(plan, options.output);
    } else {
      planner.savePlan(plan);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = SubdomainPlanner;

// Run CLI if called directly
if (require.main === module) {
  main();
}
