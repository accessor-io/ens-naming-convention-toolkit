#!/usr/bin/env node

/**
 * Cross-Reference Validator for ENS Metadata
 *
 * Validates metadata consistency and cross-references between fields
 * Ensures ID grammar matches canonical pattern and field consistency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CrossReferenceValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationRules = null;
  }

  /**
   * Load validation rules from config
   */
  loadValidationRules() {
    try {
      const rulesPath = path.join(__dirname, '..', 'data', 'configs', 'qa-validation-rules.json');
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      this.validationRules = JSON.parse(rulesContent);
      return true;
    } catch (error) {
      console.warn(`Warning: Could not load validation rules: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate metadata cross-references
   */
  validate(metadata, options = {}) {
    this.errors = [];
    this.warnings = [];

    const { strict = false, verbose = false } = options;

    // Core cross-reference validations
    this.validateIdGrammar(metadata);
    this.validateDomainConsistency(metadata);
    this.validateChainIdConsistency(metadata);
    this.validateAddressConsistency(metadata);
    this.validateVersionConsistency(metadata);
    this.validateLifecycleConsistency(metadata);
    this.validateSecurityConsistency(metadata);
    this.validateStandardsConsistency(metadata);

    if (strict) {
      this.validateSubdomainConsistency(metadata);
      this.validateArtifactsConsistency(metadata);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      score: this.calculateScore(),
    };
  }

  /**
   * Validate ID matches canonical grammar pattern
   */
  validateIdGrammar(metadata) {
    if (!metadata.id) {
      this.errors.push('ID field is required for cross-reference validation');
      return;
    }

    // Canonical grammar: org.protocol.domain.role[.variant].v{semver}.{chainId}
    const grammarPattern =
      /^([a-z0-9-]+)\.([a-z0-9.-]+)\.([a-z]+)\.([a-z0-9-]+)(?:\.([a-z0-9-]+))?\.v([0-9]+\.[0-9]+\.[0-9]+)\.([0-9]+)$/;
    const match = metadata.id.match(grammarPattern);

    if (!match) {
      this.errors.push(
        `ID '${metadata.id}' does not match canonical grammar pattern: org.protocol.domain.role[.variant].v{semver}.{chainId}`
      );
      return;
    }

    const [, org, protocol, domain, role, variant, version, chainId] = match;

    // Validate extracted components
    this.validateIdComponent('org', org, metadata.org);
    this.validateIdComponent('protocol', protocol, metadata.protocol);
    this.validateIdComponent('domain', domain, metadata.domain);
    this.validateIdComponent('role', role, metadata.role);
    this.validateIdComponent('version', version, metadata.version);
    this.validateIdComponent('chainId', chainId, metadata.chainId?.toString());

    if (variant) {
      this.validateIdComponent('variant', variant, metadata.variant);
    }
  }

  /**
   * Validate individual ID component matches metadata field
   */
  validateIdComponent(componentName, idValue, metadataValue) {
    if (metadataValue === undefined) {
      this.warnings.push(
        `ID component '${componentName}' (${idValue}) has no corresponding metadata field`
      );
      return;
    }

    if (idValue !== metadataValue.toString()) {
      this.errors.push(
        `ID component '${componentName}' (${idValue}) does not match metadata field (${metadataValue})`
      );
    }
  }

  /**
   * Validate domain field matches ID domain component
   */
  validateDomainConsistency(metadata) {
    if (!metadata.id || !metadata.domain) return;

    const domainMatch = metadata.id.match(/^[^.]+\.[^.]+\\.([^.]+)\./);
    if (domainMatch) {
      const idDomain = domainMatch[1];
      if (idDomain !== metadata.domain) {
        this.errors.push(
          `Domain field '${metadata.domain}' does not match ID domain component '${idDomain}'`
        );
      }
    }

    // Validate domain is registered
    const validDomains = [
      'defi',
      'dao',
      'l2',
      'infra',
      'token',
      'nft',
      'gaming',
      'social',
      'identity',
      'privacy',
      'security',
      'wallet',
      'analytics',
      'rwa',
      'supply',
      'health',
      'finance',
      'dev',
      'art',
    ];

    if (!validDomains.includes(metadata.domain)) {
      this.errors.push(`Domain '${metadata.domain}' is not a registered root domain`);
    }
  }

  /**
   * Validate chainId consistency across metadata
   */
  validateChainIdConsistency(metadata) {
    if (metadata.chainId === undefined) return;

    // Validate chainId is positive integer
    if (!Number.isInteger(metadata.chainId) || metadata.chainId < 1) {
      this.errors.push('ChainId must be a positive integer');
    }

    // Validate addresses chainId matches metadata chainId
    if (metadata.addresses && Array.isArray(metadata.addresses)) {
      metadata.addresses.forEach((addressObj, index) => {
        if (addressObj.chainId !== metadata.chainId) {
          this.warnings.push(
            `Address[${index}]: chainId (${addressObj.chainId}) does not match metadata chainId (${metadata.chainId})`
          );
        }
      });
    }
  }

  /**
   * Validate address consistency and format
   */
  validateAddressConsistency(metadata) {
    if (!metadata.addresses || !Array.isArray(metadata.addresses)) {
      this.warnings.push('No addresses array found');
      return;
    }

    metadata.addresses.forEach((addressObj, index) => {
      // Validate address format
      if (!addressObj.address || !/^0x[a-fA-F0-9]{40}$/.test(addressObj.address)) {
        this.errors.push(`Address[${index}]: invalid Ethereum address format`);
      }

      // Validate chainId
      if (!Number.isInteger(addressObj.chainId) || addressObj.chainId < 1) {
        this.errors.push(`Address[${index}]: chainId must be a positive integer`);
      }

      // Check for duplicate addresses
      const duplicates = metadata.addresses.filter(
        (addr, i) =>
          i !== index && addr.address === addressObj.address && addr.chainId === addressObj.chainId
      );
      if (duplicates.length > 0) {
        this.warnings.push(`Address[${index}]: duplicate address found`);
      }
    });
  }

  /**
   * Validate version consistency
   */
  validateVersionConsistency(metadata) {
    if (!metadata.version) return;

    // Validate semantic versioning
    const semverPattern =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    if (!semverPattern.test(metadata.version)) {
      this.errors.push(`Version '${metadata.version}' does not follow semantic versioning`);
    }

    // Check version consistency with ID
    if (metadata.id) {
      const versionMatch = metadata.id.match(/\.v([0-9]+\.[0-9]+\.[0-9]+)\./);
      if (versionMatch) {
        const idVersion = versionMatch[1];
        if (idVersion !== metadata.version) {
          this.errors.push(
            `Version '${metadata.version}' does not match ID version component '${idVersion}'`
          );
        }
      }
    }
  }

  /**
   * Validate lifecycle consistency
   */
  validateLifecycleConsistency(metadata) {
    if (!metadata.lifecycle) return;

    const validStatuses = [
      'planning',
      'development',
      'testing',
      'deployed',
      'deprecated',
      'discontinued',
    ];

    if (metadata.lifecycle.status && !validStatuses.includes(metadata.lifecycle.status)) {
      this.errors.push(`Lifecycle status '${metadata.lifecycle.status}' is not valid`);
    }

    // Validate date format
    if (metadata.lifecycle.since) {
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!datePattern.test(metadata.lifecycle.since)) {
        this.errors.push('Lifecycle.since must be in ISO 8601 format');
      }
    }

    // Validate deprecation requirements
    if (metadata.lifecycle.status === 'deprecated' && !metadata.lifecycle.replacedBy) {
      this.warnings.push(
        'Deprecated contracts should specify a replacement in lifecycle.replacedBy'
      );
    }
  }

  /**
   * Validate security consistency
   */
  validateSecurityConsistency(metadata) {
    if (!metadata.security) return;

    // Validate audit information
    if (metadata.security.audits && Array.isArray(metadata.security.audits)) {
      metadata.security.audits.forEach((audit, index) => {
        if (!audit.firm || typeof audit.firm !== 'string') {
          this.errors.push(`Security.audits[${index}]: firm must be a string`);
        }
        if (!audit.date || typeof audit.date !== 'string') {
          this.errors.push(`Security.audits[${index}]: date must be a string`);
        }
        if (audit.report && !this.isValidUrl(audit.report)) {
          this.warnings.push(`Security.audits[${index}]: report should be a valid URL`);
        }
      });
    }

    // Validate owner addresses
    if (metadata.security.owners && Array.isArray(metadata.security.owners)) {
      metadata.security.owners.forEach((owner, index) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
          this.errors.push(`Security.owners[${index}]: must be a valid Ethereum address`);
        }
      });
    }

    // Validate upgradeability
    const validUpgradeability = ['immutable', 'proxy', 'diamond', 'beacon', 'minimal-proxy'];
    if (
      metadata.security.upgradeability &&
      !validUpgradeability.includes(metadata.security.upgradeability)
    ) {
      this.warnings.push(
        `Security.upgradeability '${metadata.security.upgradeability}' is not a recognized type`
      );
    }
  }

  /**
   * Validate standards consistency
   */
  validateStandardsConsistency(metadata) {
    if (!metadata.standards) return;

    const validERCs = [
      'ERC20',
      'ERC721',
      'ERC1155',
      'ERC165',
      'ERC173',
      'ERC1967',
      'ERC2535',
      'ERC4337',
    ];

    if (metadata.standards.ercs && Array.isArray(metadata.standards.ercs)) {
      metadata.standards.ercs.forEach((erc, index) => {
        if (!validERCs.includes(erc)) {
          this.warnings.push(`Standards.ercs[${index}]: '${erc}' is not a recognized ERC standard`);
        }
      });
    }

    if (metadata.standards.interfaces && Array.isArray(metadata.standards.interfaces)) {
      metadata.standards.interfaces.forEach((interfaceId, index) => {
        if (!/^0x[a-fA-F0-9]{8}$/.test(interfaceId)) {
          this.errors.push(
            `Standards.interfaces[${index}]: must be a valid interface ID (0x + 8 hex chars)`
          );
        }
      });
    }
  }

  /**
   * Validate subdomain consistency
   */
  validateSubdomainConsistency(metadata) {
    if (!metadata.subdomains || !Array.isArray(metadata.subdomains)) return;

    metadata.subdomains.forEach((subdomain, index) => {
      if (!subdomain.label || typeof subdomain.label !== 'string') {
        this.errors.push(`Subdomains[${index}]: label must be a string`);
      }

      if (!subdomain.owner || !/^0x[a-fA-F0-9]{40}$/.test(subdomain.owner)) {
        this.errors.push(`Subdomains[${index}]: owner must be a valid Ethereum address`);
      }

      if (subdomain.controller && !/^0x[a-fA-F0-9]{40}$/.test(subdomain.controller)) {
        this.errors.push(`Subdomains[${index}]: controller must be a valid Ethereum address`);
      }

      if (subdomain.resolver && !/^0x[a-fA-F0-9]{40}$/.test(subdomain.resolver)) {
        this.errors.push(`Subdomains[${index}]: resolver must be a valid Ethereum address`);
      }
    });
  }

  /**
   * Validate artifacts consistency
   */
  validateArtifactsConsistency(metadata) {
    if (!metadata.artifacts) return;

    if (metadata.artifacts.abiHash && !/^0x[a-fA-F0-9]{64}$/.test(metadata.artifacts.abiHash)) {
      this.warnings.push('Artifacts.abiHash should be a valid keccak256 hash (0x + 64 hex chars)');
    }

    if (metadata.artifacts.sourceUri && !this.isValidUrl(metadata.artifacts.sourceUri)) {
      this.warnings.push('Artifacts.sourceUri should be a valid URL');
    }
  }

  /**
   * Check if string is a valid URL
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate validation score
   */
  calculateScore() {
    const totalChecks = 15; // Approximate number of cross-reference checks
    const errorPenalty = this.errors.length * 10;
    const warningPenalty = this.warnings.length * 2;

    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  /**
   * Generate validation report
   */
  generateReport(result) {
    const report = [];

    report.push('\nCROSS-REFERENCE VALIDATION REPORT');
    report.push('═'.repeat(50));
    report.push(`Score: ${result.score.toFixed(1)}/100`);
    report.push(`Status: ${result.isValid ? 'CONSISTENT' : 'INCONSISTENT'}`);
    report.push('');

    if (result.errors.length > 0) {
      report.push(`ERRORS (${result.errors.length}):`);
      result.errors.forEach((error, i) => {
        report.push(`  ${i + 1}. ${error}`);
      });
      report.push('');
    }

    if (result.warnings.length > 0) {
      report.push(`WARNINGS (${result.warnings.length}):`);
      result.warnings.forEach((warning, i) => {
        report.push(`  ${i + 1}. ${warning}`);
      });
      report.push('');
    }

    report.push('SUMMARY:');
    report.push(
      `  • ID Grammar: ${result.errors.filter((e) => e.includes('ID')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Domain Consistency: ${result.errors.filter((e) => e.includes('Domain')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Chain ID Consistency: ${result.errors.filter((e) => e.includes('chainId')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Address Validation: ${result.errors.filter((e) => e.includes('Address')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Version Consistency: ${result.errors.filter((e) => e.includes('Version')).length === 0 ? 'OK' : 'FAIL'}`
    );

    return report.join('\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('\nCross-Reference Validator for ENS Metadata');
    console.log('═'.repeat(45));
    console.log('Usage: node cross-reference-validator.js <metadata-file> [options]');
    console.log('\nOptions:');
    console.log('  --strict          Enable strict validation (check all fields)');
    console.log('  --verbose         Verbose output');
    console.log('  --batch <dir>     Validate all JSON files in directory');
    console.log('\nExamples:');
    console.log('  node cross-reference-validator.js metadata.json');
    console.log('  node cross-reference-validator.js metadata.json --strict');
    console.log('  node cross-reference-validator.js --batch metadata/');
    process.exit(1);
  }

  const validator = new CrossReferenceValidator();

  // Parse options
  const strict = args.includes('--strict');
  const verbose = args.includes('--verbose');
  const batchIndex = args.indexOf('--batch');

  if (batchIndex !== -1) {
    // Batch validation mode
    const batchDir = args[batchIndex + 1] || args[0];

    try {
      const files = fs
        .readdirSync(batchDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(batchDir, file));

      console.log(`\nBatch Cross-Reference Validation: ${files.length} files`);
      console.log('═'.repeat(55));

      let totalValid = 0;
      let totalScore = 0;

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const metadata = JSON.parse(content);
          const result = validator.validate(metadata, { strict, verbose });

          const status = result.isValid ? 'OK' : 'FAIL';
          const score = result.score.toFixed(0);
          console.log(`${path.basename(file)} ${status} ${score}/100`);

          if (result.isValid) totalValid++;
          totalScore += result.score;

          if (verbose && (result.errors.length > 0 || result.warnings.length > 0)) {
            if (result.errors.length > 0) {
              result.errors.slice(0, 2).forEach((error) => {
                console.log(`     • ${error}`);
              });
              if (result.errors.length > 2) {
                console.log(`     • ... and ${result.errors.length - 2} more errors`);
              }
            }
          }
        } catch (error) {
          console.log(`${path.basename(file)} Parse Error: ${error.message}`);
        }
      }

      const avgScore = totalScore / files.length;
      console.log(`\nSUMMARY:`);
      console.log(
        `  Consistent: ${totalValid}/${files.length} (${((totalValid / files.length) * 100).toFixed(1)}%)`
      );
      console.log(`  Average Score: ${avgScore.toFixed(1)}/100`);
    } catch (error) {
      console.error(`Failed to process batch directory: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Single file validation
    const metadataFile = args[0];

    try {
      const content = fs.readFileSync(metadataFile, 'utf8');
      const metadata = JSON.parse(content);
      const result = validator.validate(metadata, { strict, verbose });

      console.log(validator.generateReport(result));

      if (!result.isValid) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`Failed to validate file: ${error.message}`);
      process.exit(1);
    }
  }
}

// Export for use as module
export default CrossReferenceValidator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
