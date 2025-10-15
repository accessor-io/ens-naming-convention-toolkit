#!/usr/bin/env node

/**
 * Schema Validator for ENS Metadata
 *
 * Validates metadata files against the JSON Schema defined in data/metadata/schema.json
 * Provides detailed error reporting with field paths and validation context.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON Schema validator implementation
class SchemaValidator {
  constructor() {
    this.schema = null;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Load JSON Schema from file
   */
  loadSchema(schemaPath) {
    try {
      const fullPath = path.resolve(schemaPath);
      const schemaContent = fs.readFileSync(fullPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
      return true;
    } catch (error) {
      this.errors.push(`Failed to load schema: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate metadata against schema
   */
  validate(metadata, options = {}) {
    this.errors = [];
    this.warnings = [];

    if (!this.schema) {
      this.errors.push('Schema not loaded');
      return { isValid: false, errors: this.errors, warnings: this.warnings };
    }

    const { strict = false } = options;

    // Validate required fields
    this.validateRequiredFields(metadata);

    // Validate field types
    this.validateFieldTypes(metadata);

    // Validate field constraints
    this.validateFieldConstraints(metadata);

    // Validate nested objects
    this.validateNestedObjects(metadata);

    // Additional validations
    this.validateAddresses(metadata);
    this.validateVersion(metadata);
    this.validateChainId(metadata);

    if (strict) {
      this.validateRecommendedFields(metadata);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      score: this.calculateScore(),
    };
  }

  /**
   * Validate required fields are present
   */
  validateRequiredFields(metadata) {
    const requiredFields = this.schema.required || [];

    requiredFields.forEach((field) => {
      if (!(field in metadata)) {
        this.errors.push(`Missing required field: ${field}`);
      } else if (metadata[field] === null || metadata[field] === undefined) {
        this.errors.push(`Required field '${field}' cannot be null or undefined`);
      } else if (typeof metadata[field] === 'string' && metadata[field].trim() === '') {
        this.errors.push(`Required field '${field}' cannot be empty`);
      }
    });
  }

  /**
   * Validate field types match schema
   */
  validateFieldTypes(metadata) {
    const properties = this.schema.properties || {};

    Object.entries(properties).forEach(([field, fieldSchema]) => {
      if (!(field in metadata)) return;

      const value = metadata[field];
      const expectedType = fieldSchema.type;

      if (expectedType === 'string' && typeof value !== 'string') {
        this.errors.push(`Field '${field}' must be a string, got ${typeof value}`);
      } else if (expectedType === 'integer' && !Number.isInteger(value)) {
        this.errors.push(`Field '${field}' must be an integer, got ${typeof value}`);
      } else if (expectedType === 'array' && !Array.isArray(value)) {
        this.errors.push(`Field '${field}' must be an array, got ${typeof value}`);
      } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        this.errors.push(`Field '${field}' must be an object, got ${typeof value}`);
      }
    });
  }

  /**
   * Validate field constraints
   */
  validateFieldConstraints(metadata) {
    const properties = this.schema.properties || {};

    Object.entries(properties).forEach(([field, fieldSchema]) => {
      if (!(field in metadata)) return;

      const value = metadata[field];

      // String constraints
      if (fieldSchema.type === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          this.errors.push(
            `Field '${field}' must be at least ${fieldSchema.minLength} characters long`
          );
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          this.errors.push(
            `Field '${field}' must be at most ${fieldSchema.maxLength} characters long`
          );
        }
        if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
          this.errors.push(
            `Field '${field}' does not match required pattern: ${fieldSchema.pattern}`
          );
        }
        if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
          this.errors.push(`Field '${field}' must be one of: ${fieldSchema.enum.join(', ')}`);
        }
      }

      // Number constraints
      if (fieldSchema.type === 'integer') {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          this.errors.push(`Field '${field}' must be at least ${fieldSchema.minimum}`);
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          this.errors.push(`Field '${field}' must be at most ${fieldSchema.maximum}`);
        }
      }

      // Array constraints
      if (fieldSchema.type === 'array') {
        if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
          this.errors.push(`Field '${field}' must have at least ${fieldSchema.minItems} items`);
        }
        if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
          this.errors.push(`Field '${field}' must have at most ${fieldSchema.maxItems} items`);
        }
      }
    });
  }

  /**
   * Validate nested objects
   */
  validateNestedObjects(metadata) {
    // Validate addresses array
    if (metadata.addresses && Array.isArray(metadata.addresses)) {
      metadata.addresses.forEach((address, index) => {
        if (!address.chainId || !Number.isInteger(address.chainId)) {
          this.errors.push(`Address[${index}]: chainId must be an integer`);
        }
        if (!address.address || typeof address.address !== 'string') {
          this.errors.push(`Address[${index}]: address must be a string`);
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(address.address)) {
          this.errors.push(`Address[${index}]: address must be a valid Ethereum address`);
        }
      });
    }

    // Validate standards object
    if (metadata.standards) {
      if (metadata.standards.ercs && Array.isArray(metadata.standards.ercs)) {
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
        metadata.standards.ercs.forEach((erc, index) => {
          if (!validERCs.includes(erc)) {
            this.warnings.push(
              `Standards.ercs[${index}]: '${erc}' is not a recognized ERC standard`
            );
          }
        });
      }
    }

    // Validate security object
    if (metadata.security) {
      if (metadata.security.audits && Array.isArray(metadata.security.audits)) {
        metadata.security.audits.forEach((audit, index) => {
          if (!audit.firm || typeof audit.firm !== 'string') {
            this.errors.push(`Security.audits[${index}]: firm must be a string`);
          }
          if (!audit.date || typeof audit.date !== 'string') {
            this.errors.push(`Security.audits[${index}]: date must be a string`);
          }
        });
      }

      if (metadata.security.owners && Array.isArray(metadata.security.owners)) {
        metadata.security.owners.forEach((owner, index) => {
          if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
            this.errors.push(`Security.owners[${index}]: must be a valid Ethereum address`);
          }
        });
      }
    }

    // Validate lifecycle object
    if (metadata.lifecycle) {
      const validStatuses = [
        'planning',
        'development',
        'testing',
        'deployed',
        'deprecated',
        'discontinued',
      ];
      if (metadata.lifecycle.status && !validStatuses.includes(metadata.lifecycle.status)) {
        this.errors.push(`Lifecycle.status must be one of: ${validStatuses.join(', ')}`);
      }

      if (
        metadata.lifecycle.since &&
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(metadata.lifecycle.since)
      ) {
        this.errors.push('Lifecycle.since must be in ISO 8601 format');
      }
    }

    // Validate subdomains array
    if (metadata.subdomains && Array.isArray(metadata.subdomains)) {
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
      });
    }
  }

  /**
   * Validate Ethereum addresses
   */
  validateAddresses(metadata) {
    if (metadata.addresses && Array.isArray(metadata.addresses)) {
      metadata.addresses.forEach((addressObj, index) => {
        if (addressObj.address) {
          // Check if address is checksummed
          const address = addressObj.address;
          const checksummed = this.toChecksumAddress(address);
          if (address !== checksummed && address !== address.toLowerCase()) {
            this.warnings.push(`Address[${index}]: address should be checksummed: ${checksummed}`);
          }
        }
      });
    }
  }

  /**
   * Validate semantic version
   */
  validateVersion(metadata) {
    if (metadata.version) {
      // ENSIP-19 version format: v{num}, v{num}-{num}, or v{num}-{num}-{num}
      const ensipVersionPattern = /^v[0-9]+(-[0-9]+)?(-[0-9]+)?$/;
      if (!ensipVersionPattern.test(metadata.version)) {
        this.errors.push('Version must follow ENSIP-19 format (e.g., v1-0-0)');
      }
    }
  }

  /**
   * Validate chain ID
   */
  validateChainId(metadata) {
    if (metadata.chainId !== undefined) {
      if (!Number.isInteger(metadata.chainId) || metadata.chainId < 1) {
        this.errors.push('ChainId must be a positive integer');
      }

      // Check if addresses chainId matches metadata chainId
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
  }

  /**
   * Validate recommended fields
   */
  validateRecommendedFields(metadata) {
    const recommendedFields = [
      'variant',
      'standards',
      'artifacts',
      'lifecycle',
      'security',
      'tags',
      'subdomains',
    ];

    recommendedFields.forEach((field) => {
      if (!(field in metadata)) {
        this.warnings.push(`Recommended field '${field}' is missing`);
      }
    });
  }

  /**
   * Calculate validation score
   */
  calculateScore() {
    const errorPenalty = this.errors.length * 5;
    const warningPenalty = this.warnings.length * 1;

    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  /**
   * Convert address to checksum format
   */
  toChecksumAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return address;
    }

    const addr = address.toLowerCase().slice(2);
    const hash = this.sha3(addr);
    let checksum = '0x';

    for (let i = 0; i < addr.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
        checksum += addr[i].toUpperCase();
      } else {
        checksum += addr[i];
      }
    }

    return checksum;
  }

  /**
   * Simple SHA3 implementation (for checksum calculation)
   */
  sha3(str) {
    // This is a simplified implementation for checksum calculation
    // In production, you'd want to use a proper crypto library
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate validation report
   */
  generateReport(result) {
    const report = [];

    report.push('\nSCHEMA VALIDATION REPORT');
    report.push('═'.repeat(50));
    report.push(`Score: ${result.score.toFixed(1)}/100`);
    report.push(`Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
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
    report.push(`  • Schema Compliance: ${result.isValid ? 'OK' : 'FAIL'}`);
    report.push(
      `  • Required Fields: ${result.errors.filter((e) => e.includes('Missing required')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Field Types: ${result.errors.filter((e) => e.includes('must be')).length === 0 ? 'OK' : 'FAIL'}`
    );
    report.push(
      `  • Constraints: ${result.errors.filter((e) => e.includes('must be at least') || e.includes('must be at most')).length === 0 ? 'OK' : 'FAIL'}`
    );

    return report.join('\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help')) {
    console.log('\nSchema Validator for ENS Metadata');
    console.log('═'.repeat(40));
    console.log('Usage: node schema-validator.js <metadata-file> [options]');
    console.log('\nOptions:');
    console.log(
      '  --schema <path>    Path to JSON schema file (default: data/metadata/schema.json)'
    );
    console.log('  --strict          Enable strict validation (check recommended fields)');
    console.log('  --verbose         Verbose output');
    console.log('  --batch <dir>     Validate all JSON files in directory');
    console.log('\nExamples:');
    console.log('  node schema-validator.js metadata.json');
    console.log('  node schema-validator.js metadata.json --strict --verbose');
    console.log('  node schema-validator.js --batch metadata/');
    process.exit(1);
  }

  const validator = new SchemaValidator();

  // Parse options
  const schemaIndex = args.indexOf('--schema');
  const schemaPath =
    schemaIndex !== -1 && args[schemaIndex + 1]
      ? args[schemaIndex + 1]
      : path.join(__dirname, '..', 'data', 'metadata', 'schema.json');

  const strict = args.includes('--strict');
  const verbose = args.includes('--verbose');
  const batchIndex = args.indexOf('--batch');

  // Load schema
  if (!validator.loadSchema(schemaPath)) {
    console.error('Failed to load schema');
    process.exit(1);
  }

  if (batchIndex !== -1) {
    // Batch validation mode
    const batchDir = args[batchIndex + 1] || args[0];

    try {
      const files = fs
        .readdirSync(batchDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(batchDir, file));

      console.log(`\nBatch Validation: ${files.length} files`);
      console.log('═'.repeat(45));

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
        `  Valid: ${totalValid}/${files.length} (${((totalValid / files.length) * 100).toFixed(1)}%)`
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
export default SchemaValidator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
