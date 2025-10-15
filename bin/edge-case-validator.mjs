#!/usr/bin/env node

/**
 * Edge Case Validator
 *
 * Validates ENS metadata against edge cases and provides detailed error reporting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EdgeCaseValidator {
  constructor() {
    this.categoryRegistry = null;
    this.hierarchyConfig = null;
    this.validationRules = null;
    this.loadConfigurations();
  }

  /**
   * Load configuration files
   */
  loadConfigurations() {
    try {
      // Load category registry
      const categoryRegistryPath = path.join(__dirname, '..', 'docs', 'category-registry.json');
      this.categoryRegistry = JSON.parse(fs.readFileSync(categoryRegistryPath, 'utf8'));

      // Load hierarchy configuration
      const hierarchyConfigPath = path.join(__dirname, '..', 'config', 'schema-hierarchy.json');
      this.hierarchyConfig = JSON.parse(fs.readFileSync(hierarchyConfigPath, 'utf8'));

      // Load validation rules
      const validationRulesPath = path.join(__dirname, '..', 'config', 'qa-validation-rules.json');
      this.validationRules = JSON.parse(fs.readFileSync(validationRulesPath, 'utf8'));
    } catch (error) {
      console.warn(`Warning: Could not load configuration files: ${error.message}`);
      this.loadDefaultConfigurations();
    }
  }

  /**
   * Load default configurations if files are not available
   */
  loadDefaultConfigurations() {
    this.categoryRegistry = {
      roots: [
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
        'interop',
      ],
      aliases: {
        infrastructure: 'infra',
        healthcare: 'health',
        payments: 'wallet:payment-processor',
        insurance: 'defi:insurance',
        l2: 'l2',
        tokens: 'token',
        developer: 'dev',
        supplychain: 'supply',
      },
    };

    this.hierarchyConfig = {
      edgeCaseHandling: {
        circularInheritance: { detection: true, maxDepth: 10 },
        crossChainContracts: {
          allowMultipleChainIds: true,
          supportedChainIds: [1, 137, 56, 250, 43114, 42161, 10, 8453],
        },
        proxyVariants: {
          supportedTypes: ['transparent', 'uups', 'beacon', 'diamond', 'minimal', 'immutable'],
        },
        deprecatedFields: { warnOnDeprecated: true, autoMigrate: false },
        versionConflicts: { conflictResolution: 'child-wins', warnOnConflict: true },
        malformedAddresses: { validateChecksum: true, allowLowerCase: false, errorOnInvalid: true },
        emptyMetadata: { errorOnEmpty: true },
        nullUndefinedValues: { handleNullValues: true, handleUndefinedValues: true },
      },
    };
  }

  /**
   * Validate metadata against all edge cases
   */
  validateEdgeCases(metadata) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      edgeCaseResults: {},
    };

    // Run all edge case validations
    results.edgeCaseResults.circularInheritance = this.validateCircularInheritance(metadata);
    results.edgeCaseResults.crossChainContracts = this.validateCrossChainContracts(metadata);
    results.edgeCaseResults.proxyVariants = this.validateProxyVariants(metadata);
    results.edgeCaseResults.deprecatedFields = this.validateDeprecatedFields(metadata);
    results.edgeCaseResults.versionConflicts = this.validateVersionConflicts(metadata);
    results.edgeCaseResults.malformedAddresses = this.validateMalformedAddresses(metadata);
    results.edgeCaseResults.emptyMetadata = this.validateEmptyMetadata(metadata);
    results.edgeCaseResults.nullUndefinedValues = this.validateNullUndefinedValues(metadata);
    results.edgeCaseResults.categoryValidation = this.validateCategoryAndSubcategory(metadata);

    // Aggregate results
    Object.values(results.edgeCaseResults).forEach((result) => {
      if (result.errors && result.errors.length > 0) {
        results.errors.push(...result.errors);
        results.isValid = false;
      }
      if (result.warnings && result.warnings.length > 0) {
        results.warnings.push(...result.warnings);
      }
      if (result.suggestions && result.suggestions.length > 0) {
        results.suggestions.push(...result.suggestions);
      }
    });

    return results;
  }

  /**
   * Validate circular inheritance
   */
  validateCircularInheritance(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // This would need the full hierarchy context to properly detect circular inheritance
    // For now, we'll check for basic patterns that could indicate circular references

    if (metadata.inherits && Array.isArray(metadata.inherits)) {
      const inherits = metadata.inherits;
      const duplicates = inherits.filter((item, index) => inherits.indexOf(item) !== index);

      if (duplicates.length > 0) {
        result.errors.push(`Duplicate inheritance references found: ${duplicates.join(', ')}`);
      }

      if (inherits.length > 10) {
        result.warnings.push(
          `Deep inheritance chain detected (${inherits.length} levels). Consider flattening the hierarchy.`
        );
      }
    }

    return result;
  }

  /**
   * Validate cross-chain contracts
   */
  validateCrossChainContracts(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    if (!metadata.addresses || !Array.isArray(metadata.addresses)) {
      return result;
    }

    const config = this.hierarchyConfig.edgeCaseHandling?.crossChainContracts || {};
    const supportedChainIds = config.supportedChainIds || [1, 137, 56, 250, 43114, 42161, 10, 8453];

    const chainIds = metadata.addresses
      .map((addr) => addr.chainId)
      .filter((id) => id !== undefined);
    const uniqueChainIds = [...new Set(chainIds)];

    // Check for unsupported chain IDs
    const unsupportedChainIds = uniqueChainIds.filter((id) => !supportedChainIds.includes(id));
    if (unsupportedChainIds.length > 0) {
      result.errors.push(`Unsupported chain IDs found: ${unsupportedChainIds.join(', ')}`);
    }

    // Check for multiple chain IDs
    if (uniqueChainIds.length > 1) {
      if (!config.allowMultipleChainIds) {
        result.errors.push(`Multiple chain IDs not allowed: ${uniqueChainIds.join(', ')}`);
      } else {
        result.warnings.push(`Multiple chain IDs detected: ${uniqueChainIds.join(', ')}`);
      }
    }

    // Validate chainId consistency
    if (metadata.chainId && !uniqueChainIds.includes(metadata.chainId)) {
      result.warnings.push(
        `Metadata chainId (${metadata.chainId}) doesn't match any address chainId`
      );
    }

    return result;
  }

  /**
   * Validate proxy variants
   */
  validateProxyVariants(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    if (!metadata.proxy) {
      return result;
    }

    const config = this.hierarchyConfig.edgeCaseHandling?.proxyVariants || {};
    const supportedTypes = config.supportedTypes || [
      'transparent',
      'uups',
      'beacon',
      'diamond',
      'minimal',
      'immutable',
    ];

    const proxy = metadata.proxy;

    // Validate proxy type
    if (proxy.proxyType && !supportedTypes.includes(proxy.proxyType)) {
      result.errors.push(`Unsupported proxy type: ${proxy.proxyType}`);
    }

    // Validate implementation address
    if (proxy.implementationAddress) {
      const addressPattern = /^0x[a-fA-F0-9]{40}$/;
      if (!addressPattern.test(proxy.implementationAddress)) {
        result.errors.push(`Invalid implementation address format: ${proxy.implementationAddress}`);
      }
    }

    // Validate proxy admin for transparent proxies
    if (proxy.proxyType === 'transparent' && !proxy.proxyAdmin) {
      result.warnings.push('Transparent proxy should have a proxyAdmin address');
    }

    // Validate implementation slot
    if (proxy.implementationSlot) {
      const slotPattern = /^0x[a-fA-F0-9]{64}$/;
      if (!slotPattern.test(proxy.implementationSlot)) {
        result.errors.push(`Invalid implementation slot format: ${proxy.implementationSlot}`);
      }
    }

    return result;
  }

  /**
   * Validate deprecated fields
   */
  validateDeprecatedFields(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    const config = this.hierarchyConfig.edgeCaseHandling?.deprecatedFields || {};
    const migrationMap = config.migrationMap || { domain: 'category' };

    for (const [deprecated, replacement] of Object.entries(migrationMap)) {
      if (deprecated in metadata) {
        if (config.warnOnDeprecated) {
          result.warnings.push(
            `Deprecated field '${deprecated}' found. Use '${replacement}' instead.`
          );
        }

        if (config.autoMigrate && !(replacement in metadata)) {
          metadata[replacement] = metadata[deprecated];
          result.suggestions.push(`Auto-migrated '${deprecated}' to '${replacement}'`);
        }
      }
    }

    return result;
  }

  /**
   * Validate version conflicts
   */
  validateVersionConflicts(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    const config = this.hierarchyConfig.edgeCaseHandling?.versionConflicts || {};

    // This would need parent metadata to properly detect conflicts
    // For now, we'll validate the version format
    if (metadata.version) {
      const versionPattern = /^v[0-9]+(-[0-9]+)?(-[0-9]+)?$/;
      if (!versionPattern.test(metadata.version)) {
        result.errors.push(
          `Invalid version format: ${metadata.version}. Expected format: v{num}, v{num}-{num}, or v{num}-{num}-{num}`
        );
      }
    }

    return result;
  }

  /**
   * Validate malformed addresses
   */
  validateMalformedAddresses(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    const config = this.hierarchyConfig.edgeCaseHandling?.malformedAddresses || {};

    if (!metadata.addresses || !Array.isArray(metadata.addresses)) {
      return result;
    }

    for (const addressObj of metadata.addresses) {
      if (!addressObj.address) {
        result.errors.push('Address object missing address field');
        continue;
      }

      const address = addressObj.address;
      const addressPattern = /^0x[a-fA-F0-9]{40}$/;

      if (!addressPattern.test(address)) {
        result.errors.push(`Invalid address format: ${address}`);
        continue;
      }

      // Validate checksum if required
      if (config.validateChecksum) {
        const isValidChecksum = this.validateAddressChecksum(address);
        if (!isValidChecksum) {
          if (config.errorOnInvalid) {
            result.errors.push(`Invalid address checksum: ${address}`);
          } else {
            result.warnings.push(`Address checksum validation failed: ${address}`);
          }
        }
      }

      // Check for lowercase addresses
      if (
        !config.allowLowerCase &&
        address !== address.toLowerCase() &&
        address !== address.toUpperCase()
      ) {
        result.warnings.push(`Address should be checksummed: ${address}`);
      }
    }

    return result;
  }

  /**
   * Validate address checksum
   */
  validateAddressChecksum(address) {
    try {
      const addressHash = require('crypto')
        .createHash('sha3-256')
        .update(address.slice(2).toLowerCase())
        .digest('hex');

      let checksum = '0x';
      for (let i = 0; i < 40; i++) {
        if (parseInt(addressHash[i], 16) >= 8) {
          checksum += address.slice(2 + i, 3 + i).toUpperCase();
        } else {
          checksum += address.slice(2 + i, 3 + i).toLowerCase();
        }
      }

      return address === checksum;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate empty metadata
   */
  validateEmptyMetadata(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    const config = this.hierarchyConfig.edgeCaseHandling?.emptyMetadata || {};
    const minRequiredFields = config.minRequiredFields || [
      'id',
      'org',
      'protocol',
      'category',
      'role',
      'version',
      'chainId',
      'addresses',
    ];

    if (!metadata || typeof metadata !== 'object') {
      result.errors.push('Metadata must be a valid object');
      return result;
    }

    const metadataKeys = Object.keys(metadata);
    if (metadataKeys.length === 0) {
      if (config.errorOnEmpty) {
        result.errors.push('Empty metadata object not allowed');
      } else {
        result.warnings.push('Empty metadata object detected');
      }
      return result;
    }

    const missingFields = minRequiredFields.filter((field) => !(field in metadata));
    if (missingFields.length > 0) {
      result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return result;
  }

  /**
   * Validate null and undefined values
   */
  validateNullUndefinedValues(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    const config = this.hierarchyConfig.edgeCaseHandling?.nullUndefinedValues || {};

    if (!metadata || typeof metadata !== 'object') {
      return result;
    }

    for (const [key, value] of Object.entries(metadata)) {
      if (value === null && config.handleNullValues) {
        result.warnings.push(`Field '${key}' is null`);
      } else if (value === undefined && config.handleUndefinedValues) {
        result.warnings.push(`Field '${key}' is undefined`);
      }
    }

    return result;
  }

  /**
   * Validate category and subcategory
   */
  validateCategoryAndSubcategory(metadata) {
    const result = { errors: [], warnings: [], suggestions: [] };

    if (!this.categoryRegistry) {
      return result;
    }

    // Validate category
    if (metadata.category) {
      if (!this.categoryRegistry.roots.includes(metadata.category)) {
        // Check if it's an alias
        const alias = this.categoryRegistry.aliases[metadata.category];
        if (alias) {
          result.suggestions.push(
            `Category '${metadata.category}' is an alias for '${alias}'. Consider using '${alias}' directly.`
          );
        } else {
          result.errors.push(`Invalid category: ${metadata.category}`);
        }
      }
    }

    // Validate subcategory
    if (metadata.subcategory && metadata.category) {
      const categorySubcategories = this.categoryRegistry.subcategories[metadata.category];
      if (categorySubcategories && !categorySubcategories.includes(metadata.subcategory)) {
        result.warnings.push(
          `Subcategory '${metadata.subcategory}' not found for category '${metadata.category}'`
        );
      }
    }

    return result;
  }

  /**
   * Generate edge case report
   */
  generateReport(metadata, outputPath = null) {
    const results = this.validateEdgeCases(metadata);

    const report = {
      timestamp: new Date().toISOString(),
      metadata: {
        id: metadata.id || 'unknown',
        category: metadata.category || 'unknown',
        version: metadata.version || 'unknown',
      },
      summary: {
        isValid: results.isValid,
        totalErrors: results.errors.length,
        totalWarnings: results.warnings.length,
        totalSuggestions: results.suggestions.length,
      },
      edgeCaseResults: results.edgeCaseResults,
      errors: results.errors,
      warnings: results.warnings,
      suggestions: results.suggestions,
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`Edge case report written to: ${outputPath}`);
    }

    return report;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node edge-case-validator.mjs <metadata-file> [output-file]');
    console.log('Example: node edge-case-validator.mjs metadata.json edge-case-report.json');
    process.exit(1);
  }

  const metadataFile = args[0];
  const outputFile = args[1] || null;

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    const validator = new EdgeCaseValidator();
    const report = validator.generateReport(metadata, outputFile);

    console.log('\nEdge Case Validation Report');
    console.log('==========================');
    console.log(`Status: ${report.summary.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`Errors: ${report.summary.totalErrors}`);
    console.log(`Warnings: ${report.summary.totalWarnings}`);
    console.log(`Suggestions: ${report.summary.totalSuggestions}`);

    if (report.errors.length > 0) {
      console.log('\nErrors:');
      report.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (report.warnings.length > 0) {
      console.log('\nWarnings:');
      report.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (report.suggestions.length > 0) {
      console.log('\nSuggestions:');
      report.suggestions.forEach((suggestion) => console.log(`  - ${suggestion}`));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export default EdgeCaseValidator;
