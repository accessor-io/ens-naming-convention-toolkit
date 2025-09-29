#!/usr/bin/env node

/**
 * Enhanced Ethereum Subdomain Planner with Interactive Guidance
 *
 * Guides users through category selection and generates complete subdomain
 * hierarchies with metadata for different protocol types.
 */

import fs from 'fs';
import inquirer from 'inquirer';
import { generateMetadata } from './metadata-generator.mjs';

// Subdomain hierarchies for different protocol categories (rooted under evmd.eth)
const SUBDOMAIN_HIERARCHIES = {
  defi: {
    amm: {
      structure: [
        'amm.<protocol>.defi.evmd.eth',
        '├── factory.amm.<protocol>.defi.evmd.eth',
        '├── router.amm.<protocol>.defi.evmd.eth',
        '├── quoter.amm.<protocol>.defi.evmd.eth',
        '├── multicall.amm.<protocol>.defi.evmd.eth',
        '└── positions.amm.<protocol>.defi.evmd.eth',
        'amm.v2.<protocol>.defi.evmd.eth',
        '└── factory.amm.v2.<protocol>.defi.evmd.eth',
        'amm.legacy.<protocol>.defi.evmd.eth'
      ],
      metadata: {
        'amm.<protocol>.defi.evmd.eth': { category: 'amm', version: '3' },
        'factory.amm.<protocol>.defi.evmd.eth': { contractType: 'factory' },
        'router.amm.<protocol>.defi.evmd.eth': { contractType: 'router' },
        'quoter.amm.<protocol>.defi.evmd.eth': { contractType: 'quoter' },
        'multicall.amm.<protocol>.defi.evmd.eth': { contractType: 'multicall' },
        'positions.amm.<protocol>.defi.evmd.eth': { contractType: 'positions' },
        'amm.v2.<protocol>.defi.evmd.eth': { category: 'amm', version: '2' },
        'factory.amm.v2.<protocol>.defi.evmd.eth': { contractType: 'factory' },
        'amm.legacy.<protocol>.defi.evmd.eth': { category: 'amm', version: 'legacy' }
      }
    },

    lending: {
      structure: [
        'lending.<protocol>.defi.evmd.eth',
        '├── pool.lending.<protocol>.defi.evmd.eth',
        '├── pool-configurator.lending.<protocol>.defi.evmd.eth',
        '├── rewards-controller.lending.<protocol>.defi.evmd.eth',
        '├── price-oracle.lending.<protocol>.defi.evmd.eth',
        '└── ui-helpers.lending.<protocol>.defi.evmd.eth',
        'incentives.lending.<protocol>.defi.evmd.eth',
        '└── incentives-controller.incentives.lending.<protocol>.defi.evmd.eth',
        'governance.<protocol>.lending.eth'
      ],
      metadata: {
        'lending.<protocol>.defi.evmd.eth': { category: 'lending', version: '3' },
        'pool.lending.<protocol>.defi.evmd.eth': { contractType: 'pool' },
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
        '<game>.gaming.evmd.eth',
        '├── assets.<game>.gaming.evmd.eth',
        '│   ├── collection.assets.<game>.gaming.evmd.eth',
        '│   ├── marketplace.assets.<game>.gaming.evmd.eth',
        '│   └── staking.assets.<game>.gaming.evmd.eth',
        '├── gameplay.<game>.gaming.evmd.eth',
        '│   ├── mechanics.gameplay.<game>.gaming.evmd.eth',
        '│   ├── rewards.gameplay.<game>.gaming.evmd.eth',
        '│   └── achievements.gameplay.<game>.gaming.evmd.eth',
        '└── social.<game>.gaming.evmd.eth',
        '    ├── guilds.social.<game>.gaming.evmd.eth',
        '    ├── tournaments.social.<game>.gaming.evmd.eth',
        '    └── chat.social.<game>.gaming.evmd.eth'
      ],
      metadata: {
        '<game>.gaming.evmd.eth': { category: 'gaming', type: 'nft-game' },
        'assets.<game>.gaming.evmd.eth': { category: 'gaming', type: 'assets' },
        'collection.assets.<game>.gaming.evmd.eth': { contractType: 'nft-collection' },
        'marketplace.assets.<game>.gaming.evmd.eth': { contractType: 'marketplace' },
        'staking.assets.<game>.gaming.evmd.eth': { contractType: 'staking' },
        'gameplay.<game>.gaming.evmd.eth': { category: 'gaming', type: 'gameplay' },
        'mechanics.gameplay.<game>.gaming.evmd.eth': { contractType: 'mechanics' },
        'rewards.gameplay.<game>.gaming.evmd.eth': { contractType: 'rewards' },
        'achievements.gameplay.<game>.gaming.evmd.eth': { contractType: 'achievements' },
        'social.<game>.gaming.evmd.eth': { category: 'gaming', type: 'social' },
        'guilds.social.<game>.gaming.evmd.eth': { contractType: 'guilds' },
        'tournaments.social.<game>.gaming.evmd.eth': { contractType: 'tournaments' },
        'chat.social.<game>.gaming.evmd.eth': { contractType: 'chat' }
      }
    }
  },

  // Social & Communication
  social: {
    platform: {
      structure: [
        '<platform>.social.evmd.eth',
        '├── content.<platform>.social.evmd.eth',
        '│   ├── posts.content.<platform>.social.evmd.eth',
        '│   ├── media.content.<platform>.social.evmd.eth',
        '│   └── moderation.content.<platform>.social.evmd.eth',
        '├── users.<platform>.social.evmd.eth',
        '│   ├── profiles.users.<platform>.social.evmd.eth',
        '│   ├── connections.users.<platform>.social.evmd.eth',
        '│   └── privacy.users.<platform>.social.evmd.eth',
        '└── monetization.<platform>.social.evmd.eth',
        '    ├── tokens.monetization.<platform>.social.evmd.eth',
        '    ├── subscriptions.monetization.<platform>.social.evmd.eth',
        '    └── ads.monetization.<platform>.social.evmd.eth'
      ],
      metadata: {
        '<platform>.social.evmd.eth': { category: 'social', type: 'platform' },
        'content.<platform>.social.evmd.eth': { category: 'social', type: 'content' },
        'posts.content.<platform>.social.evmd.eth': { contractType: 'posts' },
        'media.content.<platform>.social.evmd.eth': { contractType: 'media' },
        'moderation.content.<platform>.social.evmd.eth': { contractType: 'moderation' },
        'users.<platform>.social.evmd.eth': { category: 'social', type: 'users' },
        'profiles.users.<platform>.social.evmd.eth': { contractType: 'profiles' },
        'connections.users.<platform>.social.evmd.eth': { contractType: 'connections' },
        'privacy.users.<platform>.social.evmd.eth': { contractType: 'privacy' },
        'monetization.<platform>.social.evmd.eth': { category: 'social', type: 'monetization' },
        'tokens.monetization.<platform>.social.evmd.eth': { contractType: 'tokens' },
        'subscriptions.monetization.<platform>.social.evmd.eth': { contractType: 'subscriptions' },
        'ads.monetization.<platform>.social.evmd.eth': { contractType: 'ads' }
      }
    }
  },

  // Real World Assets (RWA)
  rwa: {
    realestate: {
      structure: [
        '<property>.rwa.evmd.eth',
        '├── ownership.<property>.rwa.evmd.eth',
        '│   ├── registry.ownership.<property>.rwa.evmd.eth',
        '│   ├── transfer.ownership.<property>.rwa.evmd.eth',
        '│   └── voting.ownership.<property>.rwa.evmd.eth',
        '├── finance.<property>.rwa.evmd.eth',
        '│   ├── mortgage.finance.<property>.rwa.evmd.eth',
        '│   ├── insurance.finance.<property>.rwa.evmd.eth',
        '│   └── dividends.finance.<property>.rwa.evmd.eth',
        '└── compliance.<property>.rwa.evmd.eth',
        '    ├── legal.compliance.<property>.rwa.evmd.eth',
        '    ├── regulatory.compliance.<property>.rwa.evmd.eth',
        '    └── audit.compliance.<property>.rwa.evmd.eth'
      ],
      metadata: {
        '<property>.rwa.evmd.eth': { category: 'rwa', type: 'real-estate' },
        'ownership.<property>.rwa.evmd.eth': { category: 'rwa', type: 'ownership' },
        'registry.ownership.<property>.rwa.evmd.eth': { contractType: 'registry' },
        'transfer.ownership.<property>.rwa.evmd.eth': { contractType: 'transfer' },
        'voting.ownership.<property>.rwa.evmd.eth': { contractType: 'voting' },
        'finance.<property>.rwa.evmd.eth': { category: 'rwa', type: 'finance' },
        'mortgage.finance.<property>.rwa.evmd.eth': { contractType: 'mortgage' },
        'insurance.finance.<property>.rwa.evmd.eth': { contractType: 'insurance' },
        'dividends.finance.<property>.rwa.evmd.eth': { contractType: 'dividends' },
        'compliance.<property>.rwa.evmd.eth': { category: 'rwa', type: 'compliance' },
        'legal.compliance.<property>.rwa.evmd.eth': { contractType: 'legal' },
        'regulatory.compliance.<property>.rwa.evmd.eth': { contractType: 'regulatory' },
        'audit.compliance.<property>.rwa.evmd.eth': { contractType: 'audit' }
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

    // Add metadata for root domains
    const primaryDomain = `${plan.category}.evmd.eth`;
    const protocolDomain = `${plan.protocol}.${plan.category}.evmd.eth`;

    plan.metadata[primaryDomain] = {
      category: plan.category,
      type: 'category-root',
      contractName: `${plan.category.toUpperCase()} Category Root`,
      description: `${plan.category} category root domain under evmd.eth`,
      level: 'category',
      lastUpdated: new Date().toISOString()
    };

    plan.metadata[protocolDomain] = {
      category: plan.category,
      type: plan.type,
      contractName: `${plan.protocol.toUpperCase()} ${plan.category.toUpperCase()} Protocol Root`,
      description: `${plan.protocol} ${plan.category} protocol root domain`,
      level: 'protocol',
      lastUpdated: new Date().toISOString()
    };

    // Generate subdomains with metadata
    hierarchy.structure.forEach(subdomainPattern => {
      const subdomain = subdomainPattern
        .replace('<protocol>', protocol)
        .replace('<dao>', protocol)
        .replace('<provider>', protocol);

      const subdomainKey = subdomain.replace('.evmd.eth', '');
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

    // Register primary domain first (rooted under evmd.eth)
    const primaryDomain = `${plan.category}.evmd.eth`;
    script.push(`# Register primary domain`);
    script.push(`ens-contract register ${primaryDomain} --type ${plan.category}`);
    script.push(``);
    script.push(`# Set metadata for category root`);
    script.push(`ens-contract metadata ${primaryDomain} --data "${JSON.stringify(plan.metadata[primaryDomain])}"`);
    script.push(``);

    // Register protocol subdomain under primary domain
    const protocolDomain = `${plan.protocol}.${plan.category}.evmd.eth`;
    script.push(`# Register protocol subdomain`);
    script.push(`ens-contract register ${protocolDomain} --parent ${primaryDomain} --type ${plan.type}`);
    script.push(``);
    script.push(`# Set metadata for protocol root`);
    script.push(`ens-contract metadata ${protocolDomain} --data "${JSON.stringify(plan.metadata[protocolDomain])}"`);
    script.push(``);

    // Register subdomains under protocol domain
    plan.subdomains.forEach(({ subdomain, metadata }) => {
      script.push(`# Register subdomain: ${subdomain}`);
      script.push(`ens-contract register ${subdomain} --parent ${protocolDomain}`);

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
    console.log(`\nSUBDOMAIN PLAN: ${plan.protocol.toUpperCase()}`);
    console.log(`═`.repeat(60));
    console.log(`Category: ${plan.category.toUpperCase()}`);
    console.log(`Type: ${plan.type.toUpperCase()}`);
    console.log(`Variables: ${JSON.stringify(plan.variables, null, 2)}`);
    console.log(``);

    console.log(`SUBDOMAIN HIERARCHY:`);
    plan.subdomains.forEach(({ pattern, subdomain, metadata }) => {
      const indent = '  '.repeat(pattern.split('├──').length - 1);
      console.log(`${indent}${subdomain}`);
      if (metadata.contractType) {
        console.log(`${indent}  └─ ${metadata.contractType}`);
      }
    });

    console.log(`\nCROSS-REFERENCES:`);
    Object.entries(plan.crossReferences).forEach(([domain, refs]) => {
      console.log(`  ${domain}:`);
      Object.entries(refs).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    });

    console.log(`\nREGISTRATION SCRIPT:`);
    console.log('═'.repeat(30));
    plan.registrationScript.slice(0, 20).forEach(line => {
      console.log(`  ${line}`);
    });
    if (plan.registrationScript.length > 20) {
      console.log(`  ... (${plan.registrationScript.length - 20} more lines)`);
    }

    console.log(`\nFILES GENERATED:`);
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
        const metadataPath = `${outputDir}/${subdomain.replace('.evmd.eth', '')}-metadata.json`;
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

// Interactive Category Selection
const CATEGORY_GUIDANCE = {
  defi: {
    name: "Decentralized Finance",
    description: "Protocols for lending, borrowing, trading, and financial services",
    subcategories: {
      amm: "Automated Market Makers (Uniswap, SushiSwap, PancakeSwap)",
      lending: "Lending & Borrowing (Aave, Compound, MakerDAO)",
      stablecoin: "Stablecoin Protocols (DAI, USDC, algorithmic stables)",
      derivatives: "Derivatives & Options (Synthetix, dYdX)",
      yield: "Yield Farming & Liquid Staking (Yearn, Convex, Lido)"
    },
    examples: ["Uniswap", "Aave", "Compound", "Synthetix", "MakerDAO"]
  },
  dao: {
    name: "Decentralized Autonomous Organizations",
    description: "Governance and organizational protocols",
    subcategories: {
      governor: "Governance Systems (ENS, Uniswap, Compound)",
      treasury: "Treasury Management (DAOhaus, Gnosis Safe)",
      multisig: "Multi-signature Wallets (Gnosis Safe, Argent)"
    },
    examples: ["ENS", "Uniswap", "Compound", "Aragon"]
  },
  infrastructure: {
    name: "Protocol Infrastructure",
    description: "Core blockchain infrastructure and utilities",
    subcategories: {
      oracle: "Price Oracles (Chainlink, Tellor, Pyth)",
      bridge: "Cross-chain Bridges (Polygon Bridge, Arbitrum Bridge)",
      indexer: "Data Indexing (The Graph, Covalent)",
      rpc: "RPC & Node Infrastructure"
    },
    examples: ["Chainlink", "The Graph", "Infura", "Alchemy"]
  },
  gaming: {
    name: "Gaming & NFTs",
    description: "Gaming platforms, NFT marketplaces, and virtual worlds",
    subcategories: {
      nft: "NFT Gaming (Axie Infinity, CryptoKitties)",
      marketplace: "NFT Marketplaces (OpenSea, Rarible, LooksRare)",
      metaverse: "Virtual Worlds (Decentraland, The Sandbox)"
    },
    examples: ["Axie Infinity", "OpenSea", "Decentraland", "The Sandbox"]
  },
  social: {
    name: "Social & Content",
    description: "Social networks, content platforms, and creator economies",
    subcategories: {
      platform: "Social Networks (Lens Protocol, Farcaster)",
      content: "Content Platforms (Mirror, Paragraph)",
      creator: "Creator Economy (Patreon on-chain, Mirror)"
    },
    examples: ["Lens Protocol", "Farcaster", "Mirror", "Paragraph"]
  },
  rwa: {
    name: "Real World Assets",
    description: "Tokenization of physical assets and commodities",
    subcategories: {
      realestate: "Real Estate (Manhattan, RealT)",
      commodities: "Commodities (gold, oil, carbon credits)",
      art: "Fine Art & Collectibles",
      securities: "Traditional Securities"
    },
    examples: ["Manhattan", "RealT", "Centrifuge", "Goldfinch"]
  },
  privacy: {
    name: "Privacy & Security",
    description: "Privacy-preserving protocols and security tools",
    subcategories: {
      mixer: "Privacy Mixers (Tornado Cash)",
      zkp: "Zero-Knowledge Proofs",
      encryption: "Encryption Protocols"
    },
    examples: ["Tornado Cash", "Semaphore", "Haven Protocol"]
  },
  tokens: {
    name: "Token Standards & Infrastructure",
    description: "ERC standards, token utilities, and infrastructure",
    subcategories: {
      erc20: "ERC-20 Tokens",
      erc721: "ERC-721 NFTs",
      erc1155: "ERC-1155 Multi-tokens",
      dao: "DAO Tokens & Governance"
    },
    examples: ["ERC-20", "ERC-721", "Compound Token", "Uniswap Token"]
  },
  analytics: {
    name: "Analytics & Data",
    description: "On-chain analytics, dashboards, and data platforms",
    subcategories: {
      dashboard: "Analytics Dashboards (Dune, Nansen)",
      indexer: "Data Indexing Services",
      oracle: "Analytics Oracles"
    },
    examples: ["Dune Analytics", "Nansen", "IntoTheBlock"]
  },
  wallet: {
    name: "Wallets & Custody",
    description: "Wallet infrastructure and custody solutions",
    subcategories: {
      hardware: "Hardware Wallets",
      software: "Software Wallets",
      custody: "Institutional Custody",
      multisig: "Multi-signature Solutions"
    },
    examples: ["MetaMask", "Ledger", "Fireblocks", "Gnosis Safe"]
  },
  insurance: {
    name: "Insurance & Risk",
    description: "Decentralized insurance and risk management",
    subcategories: {
      parametric: "Parametric Insurance",
      traditional: "Traditional Insurance",
      reinsurance: "Reinsurance Protocols"
    },
    examples: ["Nexus Mutual", "Etherisc", "Cover Protocol"]
  },
  art: {
    name: "Digital Art & Culture",
    description: "NFT art platforms and cultural institutions",
    subcategories: {
      marketplace: "Art Marketplaces",
      gallery: "Digital Galleries",
      curation: "Art Curation Platforms"
    },
    examples: ["Foundation", "SuperRare", "Zora", "KnownOrigin"]
  },
  supplychain: {
    name: "Supply Chain & Logistics",
    description: "Supply chain tracking and logistics on blockchain",
    subcategories: {
      tracking: "Product Tracking",
      provenance: "Provenance Verification",
      logistics: "Logistics Coordination"
    },
    examples: ["VeChain", "Provenance", "Everledger"]
  },
  healthcare: {
    name: "Healthcare & Medical",
    description: "Healthcare data, medical records, and biotech",
    subcategories: {
      records: "Medical Records",
      research: "Medical Research",
      insurance: "Health Insurance"
    },
    examples: ["MedicalChain", "Robomed", "Nure"]
  },
  finance: {
    name: "Traditional Finance",
    description: "Traditional finance services on blockchain",
    subcategories: {
      banking: "Digital Banking",
      payments: "Payment Systems",
      lending: "Traditional Lending"
    },
    examples: ["Revolut", "Monzo", "Traditional Banks"]
  },
  developer: {
    name: "Developer Tools",
    description: "Development frameworks, libraries, and tools",
    subcategories: {
      framework: "Development Frameworks",
      library: "Smart Contract Libraries",
      testing: "Testing & Verification Tools"
    },
    examples: ["Hardhat", "OpenZeppelin", "Truffle"]
  }
};

// Interactive guidance functions
async function getProjectDescription() {
  const { projectType } = await inquirer.prompt([{
    type: 'list',
    name: 'projectType',
    message: 'What type of project are you building?',
    choices: [
      { name: 'DeFi Protocol (AMM, lending, yield farming)', value: 'defi' },
      { name: 'DAO/Governance System', value: 'dao' },
      { name: 'Infrastructure/Oracle/Bridge', value: 'infrastructure' },
      { name: 'Gaming/NFT Platform', value: 'gaming' },
      { name: 'Social/Content Platform', value: 'social' },
      { name: 'Real World Assets (RWA)', value: 'rwa' },
      { name: 'Privacy/Security Protocol', value: 'privacy' },
      { name: 'Token/Standards Implementation', value: 'tokens' },
      { name: 'Analytics/Dashboard Platform', value: 'analytics' },
      { name: 'Wallet/Custody Solution', value: 'wallet' },
      { name: 'Insurance/Risk Management', value: 'insurance' },
      { name: 'Digital Art/Culture Platform', value: 'art' },
      { name: 'Supply Chain/Logistics', value: 'supplychain' },
      { name: 'Healthcare/Medical Platform', value: 'healthcare' },
      { name: 'Traditional Finance Services', value: 'finance' },
      { name: 'Developer Tools/Framework', value: 'developer' }
    ]
  }]);

  return projectType;
}

async function getSubcategory(category) {
  const categoryInfo = CATEGORY_GUIDANCE[category];
  const subcategories = Object.keys(categoryInfo.subcategories);

  const { subcategory } = await inquirer.prompt([{
    type: 'list',
    name: 'subcategory',
    message: `What specific ${categoryInfo.name.toLowerCase()} functionality?`,
    choices: subcategories.map(key => ({
      name: `${categoryInfo.subcategories[key]}`,
      value: key
    }))
  }]);

  return subcategory;
}

async function getProjectDetails(category, subcategory) {
  const categoryInfo = CATEGORY_GUIDANCE[category];

  console.log(`\nSelected: ${categoryInfo.name} → ${subcategory}`);
  console.log(`${categoryInfo.description}`);
  console.log(`Examples: ${categoryInfo.examples.join(', ')}\n`);

  const { protocolName } = await inquirer.prompt([{
    type: 'input',
    name: 'protocolName',
    message: 'What is your protocol/project name?',
    validate: input => input.length > 0 || 'Protocol name is required'
  }]);

  const { version } = await inquirer.prompt([{
    type: 'input',
    name: 'version',
    message: 'What version is this? (leave empty for latest)',
    default: 'v1'
  }]);

  // Category-specific questions
  const options = { version };

  if (category === 'defi' && subcategory === 'amm') {
    const { tvl } = await inquirer.prompt([{
      type: 'input',
      name: 'tvl',
      message: 'Estimated TVL (Total Value Locked) in USD?',
      default: '1000000'
    }]);
    options.tvl = tvl;
  }

  if (category === 'dao') {
    const { tokenSymbol } = await inquirer.prompt([{
      type: 'input',
      name: 'tokenSymbol',
      message: 'Governance token symbol?',
      default: 'GOV'
    }]);
    options.token = tokenSymbol;
  }

  if (category === 'gaming' && subcategory === 'nft') {
    const { gameType } = await inquirer.prompt([{
      type: 'list',
      name: 'gameType',
      message: 'What type of NFT game?',
      choices: [
        { name: 'Play-to-Earn (Axie, CryptoKitties)', value: 'playtoearn' },
        { name: 'Competitive Gaming', value: 'competitive' },
        { name: 'Virtual World/Metaverse', value: 'metaverse' },
        { name: 'Collectible/Card Game', value: 'collectible' }
      ]
    }]);
    options.gameType = gameType;
  }

  return { protocolName, category, subcategory, options };
}

async function interactiveMode() {
  console.log('\nENHANCED SUBDOMAIN PLANNER');
  console.log('═'.repeat(40));
  console.log('Guided category selection for optimal subdomain structure\n');

  try {
    // Step 1: Get project category
    const category = await getProjectDescription();

    // Step 2: Get subcategory
    const subcategory = await getSubcategory(category);

    // Step 3: Get project details
    const { protocolName, options } = await getProjectDetails(category, subcategory);

    // Step 4: Generate and display plan
    const planner = new SubdomainPlanner();
    const plan = planner.generatePlan(protocolName, category, subcategory, options);

    console.log('\nGENERATED SUBDOMAIN PLAN:');
    console.log('═'.repeat(40));
    planner.displayPlan(plan);

    // Step 5: Save and fill metadata
    const { savePlan } = await inquirer.prompt([{
      type: 'confirm',
      name: 'savePlan',
      message: 'Save this subdomain plan?',
      default: true
    }]);

    let outputDir;
    if (savePlan) {
      const outputResponse = await inquirer.prompt([{
        type: 'input',
        name: 'outputDir',
        message: 'Output directory?',
        default: `./plans/${protocolName}`
      }]);
      outputDir = outputResponse.outputDir;

      planner.savePlan(plan, outputDir);
      console.log(`Plan saved to ${outputDir}`);

      // Offer to fill metadata
      const { fillMetadata } = await inquirer.prompt([{
        type: 'confirm',
        name: 'fillMetadata',
        message: 'Fill metadata templates with real contract data?',
        default: true
      }]);

      if (fillMetadata) {
        console.log('\nLaunching metadata filler...');
        try {
          const { default: MetadataFiller } = await import('./metadata-filler.js');
          const filler = new MetadataFiller();
          await filler.fillPlan(outputDir, { ...options, protocolName });
          console.log('Metadata filling complete!');
        } catch (error) {
          console.log(`Metadata filling failed: ${error.message}`);
          console.log('You can run it manually later with: npm run fill -- --plan ' + outputDir);
        }
      }
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Enhanced CLI Interface
function main() {
  const args = process.argv.slice(2);

  // Interactive mode
  if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
    interactiveMode();
    return;
  }

  // Legacy CLI mode
  if (args.length < 3) {
    console.log('\nEnhanced Ethereum Subdomain Planner');
    console.log('═'.repeat(45));
    console.log('\nINTERACTIVE MODE (Recommended):');
    console.log('  node subdomain-planner.js --interactive');
    console.log('  # or');
    console.log('  node subdomain-planner.js -i');
    console.log('\nThis will guide you through category selection step-by-step\n');

    console.log('DIRECT MODE (Advanced):');
    console.log('Usage: node subdomain-planner.js <protocol> <category> <type> [options]');
    console.log('\nAvailable Categories:');
    Object.keys(CATEGORY_GUIDANCE).forEach(cat => {
      const info = CATEGORY_GUIDANCE[cat];
      console.log(`  ${cat.padEnd(15)} - ${info.name}`);
    });

    console.log('\nExamples:');
    console.log('  node subdomain-planner.js uniswap defi amm --version 3 --tvl 5000000000');
    console.log('  node subdomain-planner.js ens dao governor --token ENS');
    console.log('  node subdomain-planner.js chainlink infrastructure oracle');

    console.log('\nOptions:');
    console.log('  --version <ver>   Protocol version');
    console.log('  --output <dir>    Output directory');
    console.log('  --tvl <amount>    Total value locked');
    console.log('  --token <symbol>  Token symbol');
    console.log('  --interactive     Launch interactive mode');
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
    console.error(`Error: ${error.message}`);
    console.log('\nTry interactive mode: node subdomain-planner.js --interactive');
    process.exit(1);
  }
}

export default SubdomainPlanner;

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
