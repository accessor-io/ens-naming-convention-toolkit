#!/usr/bin/env node

/**
 * Ethereum Contract Metadata Generator
 *
 * Generates standardized metadata templates for different contract categories
 * and types, enabling rich, discoverable contract naming conventions.
 */

import fs from 'fs';
import crypto from 'crypto';

// Base metadata templates for different contract categories
const METADATA_TEMPLATES = {
  // DeFi Protocol Templates
  defi: {
    amm: {
      protocol: {
        name: '{{protocol}} V{{version}}',
        version: '{{version}}',
        category: 'automated-market-maker',
        description: '{{protocol}} automated market maker protocol',
        ecosystem: 'ethereum',
        launchDate: '{{launchDate}}',
        feeTiers: [500, 3000, 10000],
        supportedNetworks: ['mainnet', 'polygon', 'arbitrum', 'optimism'],
      },
      contract: {
        type: '{{contractType}}',
        interfaces: [],
        deploymentBlock: '{{deploymentBlock}}',
        auditReports: [],
        security: {
          audits: [],
          bugBounty: '{{bugBounty}}',
          insurance: '{{insurance}}',
        },
      },
      liquidity: {
        totalValueLocked: '{{tvl}}',
        activePairs: '{{activePairs}}',
        dailyVolume: '{{dailyVolume}}',
        uniqueUsers: '{{uniqueUsers}}',
      },
      tokenomics: {
        governanceToken: '{{govToken}}',
        rewards: '{{rewards}}',
        staking: '{{staking}}',
      },
    },

    lending: {
      protocol: {
        name: '{{protocol}} V{{version}}',
        version: '{{version}}',
        category: 'lending-protocol',
        description: '{{protocol}} money market and lending platform',
        ecosystem: 'ethereum',
        launchDate: '{{launchDate}}',
        riskFramework: '{{riskFramework}}',
        supportedAssets: '{{supportedAssets}}',
      },
      contract: {
        type: '{{contractType}}',
        interfaces: [],
        deploymentBlock: '{{deploymentBlock}}',
        isolationMode: '{{isolationMode}}',
        eModeCategories: [],
        liquidationParameters: {
          healthFactor: 1.0,
          liquidationBonus: 0.05,
        },
      },
      risk: {
        collateralizationRatio: '{{collateralRatio}}',
        borrowLimit: '{{borrowLimit}}',
        reserveFactor: '{{reserveFactor}}',
        liquidationThreshold: '{{liquidationThreshold}}',
      },
      metrics: {
        totalValueLocked: '{{tvl}}',
        totalBorrowed: '{{totalBorrowed}}',
        activeUsers: '{{activeUsers}}',
        utilizationRate: '{{utilizationRate}}',
      },
    },

    stablecoin: {
      protocol: {
        name: '{{protocol}}',
        version: '{{version}}',
        category: 'stablecoin',
        description: 'Decentralized stablecoin protocol',
        ecosystem: 'ethereum',
        peg: 'USD',
        mechanism: '{{mechanism}}',
        collateralRatio: '{{collateralRatio}}',
      },
      contract: {
        type: '{{contractType}}',
        interfaces: ['IERC20', 'IERC20Metadata'],
        deploymentBlock: '{{deploymentBlock}}',
        mintingPaused: false,
        redemptionPaused: false,
      },
      supply: {
        circulating: '{{circulating}}',
        total: '{{total}}',
        backedBy: '{{backedBy}}',
        backingRatio: '{{backingRatio}}',
      },
    },
  },

  // DAO/Governance Templates
  dao: {
    governor: {
      dao: {
        name: '{{daoName}}',
        mission: '{{mission}}',
        foundingDate: '{{foundingDate}}',
        memberCount: '{{memberCount}}',
        activeProposals: '{{activeProposals}}',
        treasuryValue: '{{treasuryValue}}',
      },
      governance: {
        type: 'token-based',
        framework: '{{framework}}',
        proposalThreshold: '{{proposalThreshold}}',
        votingDelay: '{{votingDelay}}',
        votingPeriod: '{{votingPeriod}}',
        quorum: '{{quorum}}',
        executionDelay: '{{executionDelay}}',
        delegationEnabled: '{{delegationEnabled}}',
      },
      token: {
        symbol: '{{tokenSymbol}}',
        name: '{{tokenName}}',
        totalSupply: '{{totalSupply}}',
        circulatingSupply: '{{circulatingSupply}}',
        decimals: 18,
        delegationEnabled: '{{delegationEnabled}}',
      },
      contract: {
        type: 'governor',
        interfaces: ['IGovernor', 'IVotes'],
        deploymentBlock: '{{deploymentBlock}}',
        upgradeable: '{{upgradeable}}',
      },
    },

    treasury: {
      dao: {
        name: '{{daoName}}',
        treasuryType: '{{treasuryType}}',
        multiSig: '{{multiSig}}',
      },
      funds: {
        totalValue: '{{totalValue}}',
        assets: [],
        strategies: [],
        yield: '{{yield}}',
      },
      contract: {
        type: 'treasury',
        interfaces: ['ITreasury', 'IMulticall'],
        deploymentBlock: '{{deploymentBlock}}',
        accessControl: '{{accessControl}}',
      },
    },
  },

  // Infrastructure Templates
  infrastructure: {
    oracle: {
      oracle: {
        name: '{{feedName}}',
        feedType: '{{feedType}}',
        baseAsset: '{{baseAsset}}',
        quoteAsset: '{{quoteAsset}}',
        heartbeat: '{{heartbeat}}',
        deviationThreshold: '{{deviationThreshold}}',
      },
      data: {
        currentPrice: '{{currentPrice}}',
        lastUpdate: '{{lastUpdate}}',
        roundId: '{{roundId}}',
        answer: '{{answer}}',
        answeredInRound: '{{answeredInRound}}',
      },
      reliability: {
        uptime: '{{uptime}}',
        responseTime: '{{responseTime}}',
        historicalAccuracy: '{{historicalAccuracy}}',
        dataSources: '{{dataSources}}',
      },
      contract: {
        type: 'price-oracle',
        interfaces: ['IAggregatorV3'],
        deploymentBlock: '{{deploymentBlock}}',
        network: '{{network}}',
      },
    },

    bridge: {
      bridge: {
        name: '{{bridgeName}}',
        bridgeType: '{{bridgeType}}',
        sourceChain: '{{sourceChain}}',
        targetChain: '{{targetChain}}',
        nativeBridge: '{{nativeBridge}}',
      },
      parameters: {
        maxAmount: '{{maxAmount}}',
        minAmount: '{{minAmount}}',
        fee: '{{fee}}',
        finalityTime: '{{finalityTime}}',
        supportedTokens: '{{supportedTokens}}',
      },
      security: {
        validators: '{{validators}}',
        threshold: '{{threshold}}',
        fraudProofs: '{{fraudProofs}}',
        audits: '{{audits}}',
      },
      contract: {
        type: 'bridge',
        interfaces: ['IBridge', 'IMessageBridge'],
        deploymentBlock: '{{deploymentBlock}}',
        upgradeable: '{{upgradeable}}',
      },
    },
  },

  // Token Templates
  tokens: {
    erc20: {
      token: {
        name: '{{tokenName}}',
        symbol: '{{tokenSymbol}}',
        decimals: '{{decimals}}',
        totalSupply: '{{totalSupply}}',
        circulatingSupply: '{{circulatingSupply}}',
        maxSupply: '{{maxSupply}}',
      },
      metadata: {
        description: '{{description}}',
        website: '{{website}}',
        social: {
          twitter: '{{twitter}}',
          discord: '{{discord}}',
          github: '{{github}}',
        },
      },
      contract: {
        type: 'erc20',
        interfaces: ['IERC20', 'IERC20Metadata'],
        deploymentBlock: '{{deploymentBlock}}',
        mintable: '{{mintable}}',
        burnable: '{{burnable}}',
      },
    },

    erc721: {
      nft: {
        name: '{{collectionName}}',
        symbol: '{{symbol}}',
        description: '{{description}}',
        totalSupply: '{{totalSupply}}',
        maxSupply: '{{maxSupply}}',
        royalty: '{{royalty}}',
      },
      contract: {
        type: 'erc721',
        interfaces: ['IERC721', 'IERC721Metadata', 'IERC721Enumerable'],
        deploymentBlock: '{{deploymentBlock}}',
        enumerable: '{{enumerable}}',
        uriStorage: '{{uriStorage}}',
      },
    },

    governance: {
      governance: {
        proposalThreshold: '{{proposalThreshold}}',
        votingDelay: '{{votingDelay}}',
        votingPeriod: '{{votingPeriod}}',
        quorum: '{{quorum}}',
        timelock: '{{timelock}}',
      },
      token: {
        symbol: '{{tokenSymbol}}',
        totalSupply: '{{totalSupply}}',
        delegationEnabled: '{{delegationEnabled}}',
      },
      contract: {
        type: 'governance-token',
        interfaces: ['IVotes', 'IERC6372'],
        deploymentBlock: '{{deploymentBlock}}',
      },
    },
  },

  // Gaming & NFT Platforms
  gaming: {
    nft: {
      game: {
        name: '{{gameName}}',
        genre: '{{genre}}',
        platform: '{{platform}}',
        playerCount: '{{playerCount}}',
        activeUsers: '{{activeUsers}}',
      },
      collection: {
        name: '{{collectionName}}',
        theme: '{{theme}}',
        rarity: '{{rarity}}',
        totalSupply: '{{totalSupply}}',
        maxSupply: '{{maxSupply}}',
      },
      contract: {
        type: 'nft-game',
        interfaces: ['IERC721', 'IERC721Enumerable', 'IGameAssets'],
        deploymentBlock: '{{deploymentBlock}}',
        upgradeable: '{{upgradeable}}',
        crossChain: '{{crossChain}}',
      },
      economy: {
        tokenSymbol: '{{tokenSymbol}}',
        staking: '{{staking}}',
        rewards: '{{rewards}}',
        marketplace: '{{marketplace}}',
      },
    },

    gambling: {
      game: {
        name: '{{gameName}}',
        type: '{{gameType}}',
        houseEdge: '{{houseEdge}}',
        maxBet: '{{maxBet}}',
        minBet: '{{minBet}}',
      },
      contract: {
        type: 'gambling',
        interfaces: ['IGambling', 'IRandomness'],
        deploymentBlock: '{{deploymentBlock}}',
        provablyFair: '{{provablyFair}}',
        licensed: '{{licensed}}',
      },
      security: {
        audits: '{{audits}}',
        insurance: '{{insurance}}',
        kyc: '{{kyc}}',
      },
    },
  },

  // Social & Communication
  social: {
    platform: {
      social: {
        name: '{{platformName}}',
        type: '{{platformType}}',
        userCount: '{{userCount}}',
        activeUsers: '{{activeUsers}}',
        contentTypes: '{{contentTypes}}',
      },
      contract: {
        type: 'social-platform',
        interfaces: ['ISocial', 'IContent'],
        deploymentBlock: '{{deploymentBlock}}',
        moderation: '{{moderation}}',
        decentralized: '{{decentralized}}',
      },
      features: {
        messaging: '{{messaging}}',
        groups: '{{groups}}',
        events: '{{events}}',
        marketplace: '{{marketplace}}',
      },
    },

    messaging: {
      protocol: {
        name: '{{protocolName}}',
        encryption: '{{encryption}}',
        routing: '{{routing}}',
        crossChain: '{{crossChain}}',
      },
      contract: {
        type: 'messaging',
        interfaces: ['IMessaging', 'IRouting'],
        deploymentBlock: '{{deploymentBlock}}',
        privacy: '{{privacy}}',
        spamProtection: '{{spamProtection}}',
      },
    },
  },

  // Real World Assets (RWA)
  rwa: {
    realestate: {
      asset: {
        name: '{{assetName}}',
        type: '{{assetType}}',
        location: '{{location}}',
        value: '{{value}}',
        ownership: '{{ownership}}',
      },
      tokenization: {
        tokenStandard: '{{tokenStandard}}',
        fractional: '{{fractional}}',
        governance: '{{governance}}',
        dividends: '{{dividends}}',
      },
      contract: {
        type: 'rwa-real-estate',
        interfaces: ['IERC20', 'IERC721', 'IRWA'],
        deploymentBlock: '{{deploymentBlock}}',
        legal: '{{legal}}',
        compliance: '{{compliance}}',
      },
    },

    commodities: {
      asset: {
        name: '{{commodityName}}',
        type: '{{commodityType}}',
        grade: '{{grade}}',
        origin: '{{origin}}',
        quantity: '{{quantity}}',
      },
      contract: {
        type: 'rwa-commodity',
        interfaces: ['IERC20', 'IRWA', 'ICommodity'],
        deploymentBlock: '{{deploymentBlock}}',
        storage: '{{storage}}',
        insurance: '{{insurance}}',
      },
    },
  },

  // Privacy & Security
  privacy: {
    mixer: {
      protocol: {
        name: '{{protocolName}}',
        anonymitySet: '{{anonymitySet}}',
        fee: '{{fee}}',
        circuit: '{{circuit}}',
      },
      contract: {
        type: 'privacy-mixer',
        interfaces: ['IMixer', 'IVerifier'],
        deploymentBlock: '{{deploymentBlock}}',
        trustedSetup: '{{trustedSetup}}',
        auditability: '{{auditability}}',
      },
    },

    security: {
      tool: {
        name: '{{toolName}}',
        type: '{{toolType}}',
        threatModel: '{{threatModel}}',
        coverage: '{{coverage}}',
      },
      contract: {
        type: 'security-tool',
        interfaces: ['ISecurity', 'IMonitoring'],
        deploymentBlock: '{{deploymentBlock}}',
        realTime: '{{realTime}}',
        automated: '{{automated}}',
      },
    },
  },

  // Developer Tools & Infrastructure
  developer: {
    framework: {
      tool: {
        name: '{{frameworkName}}',
        language: '{{language}}',
        paradigm: '{{paradigm}}',
        maturity: '{{maturity}}',
      },
      contract: {
        type: 'dev-framework',
        interfaces: ['IDevelopment', 'ITesting'],
        deploymentBlock: '{{deploymentBlock}}',
        documentation: '{{documentation}}',
        community: '{{community}}',
      },
      features: {
        testing: '{{testing}}',
        deployment: '{{deployment}}',
        debugging: '{{debugging}}',
        plugins: '{{plugins}}',
      },
    },

    oracle: {
      service: {
        name: '{{serviceName}}',
        dataTypes: '{{dataTypes}}',
        updateFrequency: '{{updateFrequency}}',
        reliability: '{{reliability}}',
      },
      contract: {
        type: 'dev-oracle',
        interfaces: ['IOracle', 'IDataProvider'],
        deploymentBlock: '{{deploymentBlock}}',
        gasOptimized: '{{gasOptimized}}',
        crossChain: '{{crossChain}}',
      },
    },
  },

  // Analytics & Indexing
  analytics: {
    indexer: {
      service: {
        name: '{{serviceName}}',
        dataScope: '{{dataScope}}',
        updateLatency: '{{updateLatency}}',
        retention: '{{retention}}',
      },
      contract: {
        type: 'indexer',
        interfaces: ['IIndexer', 'ISubgraph'],
        deploymentBlock: '{{deploymentBlock}}',
        realTime: '{{realTime}}',
        decentralized: '{{decentralized}}',
      },
      performance: {
        querySpeed: '{{querySpeed}}',
        throughput: '{{throughput}}',
        uptime: '{{uptime}}',
      },
    },

    dashboard: {
      platform: {
        name: '{{platformName}}',
        dataSources: '{{dataSources}}',
        visualizations: '{{visualizations}}',
        realTime: '{{realTime}}',
      },
      contract: {
        type: 'analytics-dashboard',
        interfaces: ['IAnalytics', 'IDataVisualization'],
        deploymentBlock: '{{deploymentBlock}}',
        api: '{{api}}',
        export: '{{export}}',
      },
    },
  },

  // Wallets & Payment Systems
  wallet: {
    infrastructure: {
      wallet: {
        name: '{{walletName}}',
        type: '{{walletType}}',
        supportedChains: '{{supportedChains}}',
        features: '{{features}}',
      },
      contract: {
        type: 'wallet-infrastructure',
        interfaces: ['IWallet', 'IAccount'],
        deploymentBlock: '{{deploymentBlock}}',
        multiSig: '{{multiSig}}',
        socialRecovery: '{{socialRecovery}}',
      },
      security: {
        audits: '{{audits}}',
        insurance: '{{insurance}}',
        recovery: '{{recovery}}',
      },
    },

    payments: {
      system: {
        name: '{{systemName}}',
        currencies: '{{currencies}}',
        settlement: '{{settlement}}',
        fees: '{{fees}}',
      },
      contract: {
        type: 'payment-system',
        interfaces: ['IPayment', 'ISettlement'],
        deploymentBlock: '{{deploymentBlock}}',
        instant: '{{instant}}',
        crossChain: '{{crossChain}}',
      },
    },
  },

  // Insurance & Risk Management
  insurance: {
    protocol: {
      coverage: {
        name: '{{coverageName}}',
        type: '{{coverageType}}',
        capacity: '{{capacity}}',
        premium: '{{premium}}',
      },
      contract: {
        type: 'insurance',
        interfaces: ['IInsurance', 'IRiskPool'],
        deploymentBlock: '{{deploymentBlock}}',
        claims: '{{claims}}',
        governance: '{{governance}}',
      },
      risk: {
        assessment: '{{assessment}}',
        diversification: '{{diversification}}',
        reinsurance: '{{reinsurance}}',
      },
    },
  },

  // Art & Creative Platforms
  art: {
    platform: {
      creative: {
        name: '{{platformName}}',
        medium: '{{medium}}',
        artists: '{{artists}}',
        artworks: '{{artworks}}',
      },
      contract: {
        type: 'art-platform',
        interfaces: ['IArt', 'ICreative', 'IRoyalty'],
        deploymentBlock: '{{deploymentBlock}}',
        minting: '{{minting}}',
        curation: '{{curation}}',
      },
      marketplace: {
        primary: '{{primary}}',
        secondary: '{{secondary}}',
        royalties: '{{royalties}}',
      },
    },
  },

  // Supply Chain & Logistics
  supplychain: {
    tracking: {
      system: {
        name: '{{systemName}}',
        industry: '{{industry}}',
        participants: '{{participants}}',
        transparency: '{{transparency}}',
      },
      contract: {
        type: 'supply-chain',
        interfaces: ['ISupplyChain', 'ITracking', 'IVerification'],
        deploymentBlock: '{{deploymentBlock}}',
        iot: '{{iot}}',
        blockchain: '{{blockchain}}',
      },
      compliance: {
        standards: '{{standards}}',
        certifications: '{{certifications}}',
        regulations: '{{regulations}}',
      },
    },
  },

  // Healthcare & Life Sciences
  healthcare: {
    medical: {
      system: {
        name: '{{systemName}}',
        type: '{{systemType}}',
        compliance: '{{compliance}}',
        privacy: '{{privacy}}',
      },
      contract: {
        type: 'healthcare',
        interfaces: ['IHealthcare', 'IMedical', 'IPrivacy'],
        deploymentBlock: '{{deploymentBlock}}',
        hipaa: '{{hipaa}}',
        gdpr: '{{gdpr}}',
      },
      data: {
        records: '{{records}}',
        sharing: '{{sharing}}',
        consent: '{{consent}}',
      },
    },
  },

  // Finance & Traditional Integrations
  finance: {
    banking: {
      service: {
        name: '{{serviceName}}',
        type: '{{serviceType}}',
        regulation: '{{regulation}}',
        compliance: '{{compliance}}',
      },
      contract: {
        type: 'banking',
        interfaces: ['IBanking', 'ICompliance', 'IKYC'],
        deploymentBlock: '{{deploymentBlock}}',
        custody: '{{custody}}',
        settlement: '{{settlement}}',
      },
      integration: {
        swift: '{{swift}}',
        sepa: '{{sepa}}',
        ach: '{{ach}}',
      },
    },
  },
};

// Utility functions

function interpolateTemplate(template, variables) {
  const result = JSON.parse(JSON.stringify(template));

  function processObject(obj) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        // Simple variable interpolation
        Object.keys(variables).forEach((varName) => {
          const placeholder = `{{${varName}}}`;
          obj[key] = obj[key].replace(new RegExp(placeholder, 'g'), variables[varName]);
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }
    });
  }

  processObject(result);
  return result;
}

/**
 * Generate metadata hash per ENSIP-19 specification
 * @param {Object} metadata - Metadata object
 * @returns {string} SHA-256 hash with 0x prefix
 */
function generateMetadataHash(metadata) {
  // Remove metadataHash field if present
  // eslint-disable-next-line no-unused-vars
  const { metadataHash, ...metadataWithoutHash } = metadata;

  // Sort keys alphabetically for canonical JSON
  const sortedMetadata = {};
  Object.keys(metadataWithoutHash)
    .sort()
    .forEach((key) => {
      sortedMetadata[key] = metadataWithoutHash[key];
    });

  // Serialize to canonical JSON (no whitespace, sorted keys)
  const canonicalJson = JSON.stringify(sortedMetadata);

  // Apply SHA-256
  const hash = crypto.createHash('sha256').update(canonicalJson).digest('hex');

  // Prefix with 0x for Ethereum compatibility
  return `0x${hash}`;
}

/**
 * Generate canonical ID per ENSIP-19 grammar
 * @param {Object} params - ID components
 * @returns {string} Canonical ID
 */
function generateCanonicalId(params) {
  const { org, protocol, category, role, variant, version, chainId } = params;

  // Validate required components
  if (!org || !protocol || !category || !role || !version || !chainId) {
    throw new Error(
      'Missing required ID components: org, protocol, category, role, version, chainId'
    );
  }

  // Build canonical ID: org.protocol.category.role[.variant].v{version}.{chainId}
  let id = `${org}.${protocol}.${category}.${role}`;

  // Add variant if provided
  if (variant) {
    id += `.${variant}`;
  }

  // Add version and chainId
  id += `.${version}.${chainId}`;

  return id;
}

function generateMetadata(category, type, variables = {}) {
  const template = METADATA_TEMPLATES[category]?.[type];

  if (!template) {
    throw new Error(`Template not found for category: ${category}, type: ${type}`);
  }

  // Set default variables if not provided
  const defaultVariables = {
    protocol: 'ProtocolName',
    version: 'v1-0-0',
    contractType: type,
    deploymentBlock: '0',
    launchDate: new Date().toISOString().split('T')[0],
    ...variables,
  };

  const result = interpolateTemplate(template, defaultVariables);

  // Add ENSIP-19 required fields
  const idParams = {
    org: (variables.org || variables.name || defaultVariables.protocol)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-'),
    protocol: (variables.protocol || variables.name || defaultVariables.protocol)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-'),
    category,
    role: type,
    variant: variables.variant,
    version: defaultVariables.version,
    chainId: variables.chainId || 1,
  };

  // Generate canonical ID
  result.id = generateCanonicalId(idParams);

  // Add required ENSIP-19 fields
  result.org = idParams.org;
  result.protocol = idParams.protocol;
  result.category = category;
  result.role = type;
  result.version = idParams.version;
  result.chainId = idParams.chainId;

  // Add addresses array if not present
  if (!result.addresses) {
    result.addresses = [
      {
        chainId: idParams.chainId,
        address: variables.address || '0x0000000000000000000000000000000000000000',
      },
    ];
  }

  // Generate metadata hash
  result.metadataHash = generateMetadataHash(result);

  return result;
}

function generateAllTemplates(category, variables = {}) {
  const templates = {};

  if (METADATA_TEMPLATES[category]) {
    Object.keys(METADATA_TEMPLATES[category]).forEach((type) => {
      try {
        templates[type] = generateMetadata(category, type, variables);
      } catch (error) {
        console.warn(`Skipping ${type}: ${error.message}`);
      }
    });
  }

  return templates;
}

function saveMetadataToFile(metadata, filename) {
  const jsonContent = JSON.stringify(metadata, null, 2);
  fs.writeFileSync(filename, jsonContent);
  console.log(`OK: Metadata saved to ${filename}`);
}

function displayMetadata(metadata, title = 'Generated Metadata') {
  console.log(`\n${title}`);
  console.log('═'.repeat(50));
  console.log(JSON.stringify(metadata, null, 2));
  console.log('');
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  let category = null;
  let type = null;
  const options = {};

  if (args.length === 0) {
    console.log('\nEthereum Contract Metadata Generator');
    console.log('═'.repeat(45));
    console.log('Usage: node metadata-generator.js --category <category> --type <type> [options]');
    console.log('\nCategories:');
    console.log(
      '  defi, dao, infrastructure, tokens, gaming, social, rwa, privacy, developer, analytics, wallet, insurance, art, supplychain, healthcare, finance'
    );
    console.log('\nTypes by Category:');
    console.log('  DeFi: amm, lending, stablecoin');
    console.log('  DAO: governor, treasury');
    console.log('  Infrastructure: oracle, bridge');
    console.log('  Tokens: erc20, erc721, governance');
    console.log('  Gaming: nft, gambling');
    console.log('  Social: platform, messaging');
    console.log('  RWA: realestate, commodities');
    console.log('  Privacy: mixer, security');
    console.log('  Developer: framework, oracle');
    console.log('  Analytics: indexer, dashboard');
    console.log('  Wallet: infrastructure, payments');
    console.log('  Insurance: protocol');
    console.log('  Art: platform');
    console.log('  Supply Chain: tracking');
    console.log('  Healthcare: medical');
    console.log('  Finance: banking');
    console.log('\nExamples:');
    console.log(
      '  node metadata-generator.js --category defi --type amm --name Uniswap --version 3'
    );
    console.log(
      '  node metadata-generator.js --category dao --type governor --dao ENS --token ENS'
    );
    console.log(
      '  node metadata-generator.js --category tokens --type erc20 --symbol UNI --supply 1000000000'
    );
    console.log('\nOptions:');
    console.log('  --category <cat>  Protocol category');
    console.log('  --type <type>     Protocol type');
    console.log('  --name <name>     Protocol/contract name');
    console.log('  --version <ver>   Version number');
    console.log('  --symbol <sym>    Token symbol');
    console.log('  --supply <num>    Token supply');
    console.log('  --output <file>   Save to file');
    process.exit(1);
  }

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1];
      i++; // Skip next argument
    } else if (args[i] === '--type' && args[i + 1]) {
      type = args[i + 1];
      i++; // Skip next argument
    } else if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++; // Skip next argument as it's the value
      } else {
        options[key] = true;
      }
    }
  }

  if (!category || !type) {
    console.error('Error: Both --category and --type are required');
    process.exit(1);
  }

  // Special handling for common variables
  if (options.name) options.protocol = options.name;
  if (options.dao) options.daoName = options.dao;
  if (options.token) options.tokenSymbol = options.token;

  try {
    const metadata = generateMetadata(category, type, options);

    if (options.output) {
      saveMetadataToFile(metadata, options.output);
    } else {
      displayMetadata(metadata, `${category.toUpperCase()} ${type.toUpperCase()} Metadata`);
    }

    // Show usage examples
    console.log('\nUsage Examples:');
    console.log(`  # Register with ENS:`);
    console.log(
      `  ens-contract register ${type}.${options.name || 'protocol'}.${category}.eth --type ${type}`
    );
    console.log(
      `  ens-contract metadata ${type}.${options.name || 'protocol'}.${category}.eth --data metadata.json`
    );
    console.log('');
    console.log(`  # Set cross-references:`);
    console.log(
      `  ens-contract metadata ${type}.${options.name || 'protocol'}.${category}.eth --set protocol.factory=factory.${options.name || 'protocol'}.${category}.eth`
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);

    // Suggest similar templates
    console.log('\nAvailable templates:');
    if (METADATA_TEMPLATES[category]) {
      Object.keys(METADATA_TEMPLATES[category]).forEach((availableType) => {
        console.log(`  • ${category} ${availableType}`);
      });
    } else {
      console.log('  Available categories: defi, dao, infrastructure, tokens');
    }

    process.exit(1);
  }
}

// Export functions for use as module
export {
  generateMetadata,
  generateAllTemplates,
  generateMetadataHash,
  generateCanonicalId,
  METADATA_TEMPLATES,
  saveMetadataToFile,
  displayMetadata,
};

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
