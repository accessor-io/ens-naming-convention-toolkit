#!/usr/bin/env node

/**
 * Ethereum Contract Naming Convention Validator
 *
 * Comprehensive validation system for Ethereum contract naming conventions
 * across all categories and ENS standards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation rules for each category
const VALIDATION_RULES = {
  dao: {
    requiredPatterns: [
      // Must include 'dao' or be a known DAO name
      /(.*dao.*)|(.*governance.*)/i,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow standard DAO patterns
      /^(.*dao\.eth|.*-dao\.eth)$/,
      // Should have appropriate subdomains
      /^(governor|token|timelock|treasury|operations|wallet|dao)\./
    ],
    forbiddenPatterns: [
      // Should not have conflicting categories
      /(defi|lending|amm|dex)\./i,
      // Should not use generic names
      /^(dao\.eth|dao1\.eth|testdao\.eth)$/i
    ],
    subdomains: {
      governor: {
        required: ['governance', 'proposal'],
        recommended: ['timelock', 'token', 'voting']
      },
      token: {
        required: ['erc20', 'voting'],
        recommended: ['governance', 'supply']
      },
      treasury: {
        required: ['treasury', 'funds'],
        recommended: ['multisig', 'operations']
      }
    }
  },

  defi: {
    requiredPatterns: [
      // Must indicate DeFi category
      /(amm|lending|derivatives|stablecoin|yield|dex)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow protocol naming
      /^[a-z0-9]+\.(amm|lending|derivatives|stablecoin|yield)\.eth$/,
      // Should have version indicators
      /(v[0-9]+|version)\./i
    ],
    categorySpecific: {
      amm: {
        requiredSubdomains: ['router', 'factory', 'pairs'],
        recommendedSubdomains: ['quoter', 'multicall', 'positions']
      },
      lending: {
        requiredSubdomains: ['pool', 'market'],
        recommendedSubdomains: ['oracle', 'liquidator', 'rewards']
      },
      derivatives: {
        requiredSubdomains: ['factory', 'market'],
        recommendedSubdomains: ['oracle', 'settlement']
      }
    }
  },

  l2: {
    requiredPatterns: [
      // Must indicate L2 category
      /(l2|rollup|sidechain|bridge|sequencer|da)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow L2 naming conventions
      /^[a-z0-9]+\.(l2|rollup|sidechain)\.eth$/,
      // Should indicate technology type
      /(optimistic|zk|pos|poa)/i
    ]
  },

  tokens: {
    requiredPatterns: [
      // Must indicate token type
      /(token|nft|multitoken|rwa|gov)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow token naming
      /^[a-z0-9]+\.(token|nft|multitoken|rwa|gov)\.eth$/,
      // Should include symbol or asset name
      /^[a-z]{2,6}\.(token|nft|multitoken|rwa|gov)\.eth$/
    ],
    tokenSpecific: {
      erc20: {
        requiredMetadata: ['symbol', 'decimals', 'supply'],
        recommendedMetadata: ['name', 'description', 'circulating_supply']
      },
      erc721: {
        requiredMetadata: ['name', 'symbol'],
        recommendedMetadata: ['description', 'total_supply', 'max_supply']
      },
      governance: {
        requiredMetadata: ['proposal_threshold', 'voting_delay', 'voting_period'],
        recommendedMetadata: ['quorum', 'timelock']
      }
    }
  },

  infrastructure: {
    requiredPatterns: [
      // Must indicate infrastructure type
      /(oracle|factory|proxy|multisig|smartaccount|bridge)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow infrastructure naming
      /^[a-z0-9]+\.(oracle|factory|proxy|multisig|smartaccount)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Gaming & NFT Platforms
  gaming: {
    requiredPatterns: [
      // Must indicate gaming category
      /(gaming|game|play|arcade)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow gaming naming
      /^[a-z0-9]+\.(gaming|game)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Social & Communication
  social: {
    requiredPatterns: [
      // Must indicate social category
      /(social|community|network|platform)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow social naming
      /^[a-z0-9]+\.(social|community)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Real World Assets (RWA)
  rwa: {
    requiredPatterns: [
      // Must indicate RWA category
      /(rwa|asset|property|real-estate|commodity)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow RWA naming
      /^[a-z0-9]+\.rwa\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Privacy & Security
  privacy: {
    requiredPatterns: [
      // Must indicate privacy category
      /(privacy|security|mixer|anonymous)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow privacy naming
      /^[a-z0-9]+\.(privacy|security)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Developer Tools
  developer: {
    requiredPatterns: [
      // Must indicate developer category
      /(dev|framework|tool|sdk|library)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow developer naming
      /^[a-z0-9]+\.dev\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Analytics & Indexing
  analytics: {
    requiredPatterns: [
      // Must indicate analytics category
      /(analytics|indexer|data|dashboard)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow analytics naming
      /^[a-z0-9]+\.(analytics|indexer)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Wallets & Payments
  wallet: {
    requiredPatterns: [
      // Must indicate wallet category
      /(wallet|payment|pay|checkout)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow wallet naming
      /^[a-z0-9]+\.(wallet|payment)\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Insurance & Risk
  insurance: {
    requiredPatterns: [
      // Must indicate insurance category
      /(insurance|coverage|risk|pool)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow insurance naming
      /^[a-z0-9]+\.insurance\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Art & Creative
  art: {
    requiredPatterns: [
      // Must indicate art category
      /(art|creative|gallery|museum|platform)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow art naming
      /^[a-z0-9]+\.art\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Supply Chain
  supplychain: {
    requiredPatterns: [
      // Must indicate supply chain category
      /(supplychain|supply-chain|logistics|tracking)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow supply chain naming
      /^[a-z0-9]+\.supplychain\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Healthcare
  healthcare: {
    requiredPatterns: [
      // Must indicate healthcare category
      /(healthcare|medical|health|patient)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow healthcare naming
      /^[a-z0-9]+\.healthcare\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  },

  // Finance
  finance: {
    requiredPatterns: [
      // Must indicate finance category
      /(finance|banking|financial|bank)\.eth$/,
      // Must end with .eth
      /\.eth$/
    ],
    recommendedPatterns: [
      // Should follow finance naming
      /^[a-z0-9]+\.finance\.eth$/,
      // Should be descriptive
      /^(?!.*generic.*).*/
    ]
  }
};

class NamingValidator {
  constructor() {
    this.rules = VALIDATION_RULES;
  }

  /**
   * Comprehensive validation of a domain name
   */
  async validateDomain(domain, category, options = {}) {
    const { strict = false, metadata = null } = options;
    const results = {
      domain,
      category,
      isValid: true,
      score: 0,
      maxScore: 100,
      issues: [],
      warnings: [],
      suggestions: [],
      metadata: {
        compliance: {},
        coverage: {}
      }
    };

    // Basic format validation
    const formatResult = this.validateFormat(domain);
    results.issues.push(...formatResult.issues);
    results.warnings.push(...formatResult.warnings);

    // Category-specific validation
    const categoryResult = this.validateCategory(domain, category, strict);
    results.issues.push(...categoryResult.issues);
    results.warnings.push(...categoryResult.warnings);
    results.suggestions.push(...categoryResult.suggestions);

    // Metadata validation (if provided)
    if (metadata) {
      const metadataResult = this.validateMetadata(metadata, category);
      results.issues.push(...metadataResult.issues);
      results.warnings.push(...metadataResult.warnings);
      results.metadata = metadataResult.metadata;
    }

    // Calculate overall validity and score
    results.isValid = results.issues.length === 0;
    results.score = this.calculateScore(results);

    return results;
  }

  /**
   * Validate basic domain format
   */
  validateFormat(domain) {
    const issues = [];
    const warnings = [];

    // Basic checks
    if (!domain) {
      issues.push('Domain name is required');
    }

    if (!domain.endsWith('.eth')) {
      issues.push('Domain must end with .eth');
    }

    if (domain.includes(' ')) {
      issues.push('Domain cannot contain spaces');
    }

    if (domain.length > 63) {
      warnings.push('Domain name is quite long (consider shortening)');
    }

    // Character validation
    if (!/^[a-z0-9.-]+$/.test(domain.replace('.eth', ''))) {
      issues.push('Domain can only contain lowercase letters, numbers, and hyphens');
    }

    return { issues, warnings };
  }

  /**
   * Validate category-specific rules
   */
  validateCategory(domain, category, strict = false) {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    const rules = this.rules[category];
    if (!rules) {
      issues.push(`Unknown category: ${category}`);
      return { issues, warnings, suggestions };
    }

    // Check required patterns
    const requiredPatterns = rules.requiredPatterns || [];
    const hasRequiredPattern = requiredPatterns.some(pattern => pattern.test(domain));

    if (!hasRequiredPattern) {
      issues.push(`Domain does not match required pattern for ${category} category`);
      suggestions.push(`Use pattern: ${requiredPatterns.map(p => p.source).join(' or ')}`);
    }

    // Check recommended patterns (warnings only)
    if (!strict) {
      const recommendedPatterns = rules.recommendedPatterns || [];
      const hasRecommendedPattern = recommendedPatterns.some(pattern => pattern.test(domain));

      if (!hasRecommendedPattern) {
        warnings.push(`Domain does not follow recommended ${category} naming pattern`);
        suggestions.push(`Consider using: ${recommendedPatterns.map(p => p.source).join(' or ')}`);
      }
    }

    // Check forbidden patterns
    const forbiddenPatterns = rules.forbiddenPatterns || [];
    const hasForbiddenPattern = forbiddenPatterns.some(pattern => pattern.test(domain));

    if (hasForbiddenPattern) {
      issues.push(`Domain uses forbidden pattern for ${category} category`);
    }

    // Category-specific validation
    if (rules.categorySpecific && rules.categorySpecific[category]) {
      const categoryRules = rules.categorySpecific[category];

      if (categoryRules.requiredSubdomains) {
        const missingSubdomains = categoryRules.requiredSubdomains.filter(
          subdomain => !domain.includes(subdomain)
        );

        if (missingSubdomains.length > 0) {
          warnings.push(`Consider adding subdomains: ${missingSubdomains.join(', ')}`);
        }
      }
    }

    return { issues, warnings, suggestions };
  }

  /**
   * Validate ENS metadata
   */
  validateMetadata(metadata, category) {
    const issues = [];
    const warnings = [];
    const metadataValidation = {
      compliance: {},
      coverage: {}
    };

    if (!metadata || typeof metadata !== 'object') {
      issues.push('Metadata must be a valid object');
      return { issues, warnings, metadata: metadataValidation };
    }

    // Category-specific metadata requirements
    const categoryRules = this.rules[category];
    if (categoryRules && categoryRules.tokenSpecific) {
      Object.entries(categoryRules.tokenSpecific).forEach(([tokenType, requirements]) => {
        if (metadata.category === tokenType || metadata.category === category) {
          // Check required metadata fields
          if (requirements.requiredMetadata) {
            requirements.requiredMetadata.forEach(field => {
              if (!(field in metadata)) {
                issues.push(`Required metadata field missing: ${field}`);
              } else {
                metadataValidation.compliance[field] = true;
              }
            });
          }

          // Check recommended metadata fields
          if (requirements.recommendedMetadata) {
            requirements.recommendedMetadata.forEach(field => {
              if (!(field in metadata)) {
                warnings.push(`Recommended metadata field missing: ${field}`);
              } else {
                metadataValidation.compliance[field] = true;
              }
            });
          }
        }
      });
    }

    // General metadata validation
    const requiredFields = ['name', 'description', 'category'];
    requiredFields.forEach(field => {
      if (!metadata[field]) {
        issues.push(`Required metadata field missing: ${field}`);
      }
    });

    // Calculate coverage
    const totalFields = Object.keys(metadata).length;
    const compliantFields = Object.values(metadataValidation.compliance).filter(Boolean).length;
    metadataValidation.coverage = {
      total: totalFields,
      compliant: compliantFields,
      percentage: totalFields > 0 ? Math.round((compliantFields / totalFields) * 100) : 0
    };

    return { issues, warnings, metadata: metadataValidation };
  }

  /**
   * Calculate validation score
   */
  calculateScore(results) {
    let score = 100;

    // Deduct points for issues
    score -= results.issues.length * 20;

    // Deduct points for warnings (less severe)
    score -= results.warnings.length * 5;

    // Bonus points for following recommended patterns
    if (results.suggestions.length === 0) {
      score += 10;
    }

    // Metadata compliance bonus
    if (results.metadata.coverage.percentage >= 80) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate compliance report
   */
  generateReport(results) {
    const report = [];

    report.push(`\nNAMING CONVENTION VALIDATION REPORT`);
    report.push(`═`.repeat(50));
    report.push(`Domain: ${results.domain}`);
    report.push(`Category: ${results.category}`);
    report.push(`Score: ${results.score}/100`);
    report.push(`Status: ${results.isValid ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
    report.push(``);

    if (results.issues.length > 0) {
      report.push(`ISSUES (${results.issues.length}):`);
      results.issues.forEach((issue, i) => {
        report.push(`  ${i + 1}. ${issue}`);
      });
      report.push(``);
    }

    if (results.warnings.length > 0) {
      report.push(`WARNINGS (${results.warnings.length}):`);
      results.warnings.forEach((warning, i) => {
        report.push(`  ${i + 1}. ${warning}`);
      });
      report.push(``);
    }

    if (results.suggestions.length > 0) {
      report.push(`SUGGESTIONS:`);
      results.suggestions.forEach((suggestion, i) => {
        report.push(`  ${i + 1}. ${suggestion}`);
      });
      report.push(``);
    }

    if (results.metadata.coverage.total > 0) {
      report.push(`METADATA COMPLIANCE:`);
      report.push(`  Coverage: ${results.metadata.coverage.percentage}%`);
      report.push(`  Compliant Fields: ${results.metadata.coverage.compliant}/${results.metadata.coverage.total}`);
      report.push(``);
    }

    report.push(`SUMMARY:`);
    report.push(`  • Format Validation: ${results.issues.filter(i => i.includes('format') || i.includes('Domain')).length === 0 ? '✅' : '❌'}`);
    report.push(`  • Category Compliance: ${results.issues.filter(i => i.includes('category') || i.includes('pattern')).length === 0 ? '✅' : '❌'}`);
    report.push(`  • Metadata Quality: ${results.metadata.coverage.percentage >= 80 ? 'Good' : 'Needs Improvement'}`);

    return report.join('\n');
  }

  /**
   * Batch validation for multiple domains
   */
  async validateBatch(domains, category) {
    const results = [];

    for (const domain of domains) {
      const result = await this.validateDomain(domain, category);
      results.push(result);
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('\nEthereum Contract Naming Validator');
    console.log('═'.repeat(40));
    console.log('Usage: node naming-validator.js <domain> <category> [options]');
    console.log('\nOptions:');
    console.log('  --strict          Strict validation mode');
    console.log('  --metadata <file> Load metadata from JSON file');
    console.log('  --batch <file>    Validate multiple domains from file');
    console.log('\nExamples:');
    console.log('  node naming-validator.js governor.ensdao.eth dao');
    console.log('  node naming-validator.js uniswap.amm.eth defi --strict');
    console.log('  node naming-validator.js uni.token.eth tokens --metadata token-metadata.json');
    process.exit(1);
  }

  const [domain, category] = args;
  const options = {};

  // Parse options
  const strictIndex = args.indexOf('--strict');
  if (strictIndex !== -1) {
    options.strict = true;
  }

  const metadataIndex = args.indexOf('--metadata');
  if (metadataIndex !== -1 && args[metadataIndex + 1]) {
    try {
      const metadataFile = args[metadataIndex + 1];
      options.metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    } catch (e) {
      console.error(`❌ Failed to load metadata file: ${e.message}`);
      process.exit(1);
    }
  }

  const batchIndex = args.indexOf('--batch');
  if (batchIndex !== -1 && args[batchIndex + 1]) {
    // Batch validation mode
    try {
      const batchFile = args[batchIndex + 1];
      const domains = fs.readFileSync(batchFile, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      console.log(`\nBatch Validation: ${domains.length} domains`);
      console.log('═'.repeat(45));

      const validator = new NamingValidator();
      const results = await validator.validateBatch(domains, category);

      results.forEach((result, i) => {
        const status = result.isValid ? '✅' : '❌';
        const score = result.score.toFixed(0);
        console.log(`${i + 1}. ${domains[i]} ${status} ${score}/100`);

        if (result.issues.length > 0) {
          result.issues.slice(0, 2).forEach(issue => {
            console.log(`     • ${issue}`);
          });
          if (result.issues.length > 2) {
            console.log(`     • ... and ${result.issues.length - 2} more issues`);
          }
        }
      });

      const summary = {
        total: results.length,
        valid: results.filter(r => r.isValid).length,
        avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
      };

      console.log(`\n📊 SUMMARY:`);
      console.log(`  Valid: ${summary.valid}/${summary.total} (${((summary.valid/summary.total)*100).toFixed(1)}%)`);
      console.log(`  Average Score: ${summary.avgScore.toFixed(1)}/100`);

    } catch (e) {
      console.error(`❌ Failed to process batch file: ${e.message}`);
      process.exit(1);
    }
  } else {
    // Single domain validation
    const validator = new NamingValidator();
    const result = await validator.validateDomain(domain, category, options);

    console.log(validator.generateReport(result));

    if (!result.isValid) {
      process.exit(1);
    }
  }
}

// Export for use as module
export default NamingValidator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
