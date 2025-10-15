#!/usr/bin/env node

/**
 * Schema Inheritance Manager
 *
 * Manages schema inheritance and deduplication across hierarchical ENS metadata schemas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SchemaInheritanceManager {
  constructor() {
    this.hierarchyConfig = null;
    this.schemaCache = new Map();
    this.inheritanceGraph = new Map();
  }

  /**
   * Load hierarchy configuration
   */
  loadHierarchyConfig() {
    try {
      const configPath = path.join(__dirname, '..', 'data', 'configs', 'schema-hierarchy.json');
      this.hierarchyConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      // Fallback to default configuration
      this.hierarchyConfig = {
        projects: {
          uniswap: {
            domain: 'uniswap.cns.eth',
            traits: {
              inherits: ['cns.eth'],
              overrides: {},
              projectSpecific: {
                requiredFields: ['protocol'],
                validationRules: {
                  protocolPattern: '^uniswap$',
                },
              },
            },
          },
          ens: {
            domain: 'ens.cns.eth',
            traits: {
              inherits: ['cns.eth'],
              overrides: {},
              projectSpecific: {
                requiredFields: ['protocol'],
                validationRules: {
                  protocolPattern: '^ens$',
                },
              },
            },
          },
        },
        categories: {
          defi: {
            domain: 'defi.cns.eth',
            subcategories: [
              {
                name: 'amm',
                domain: 'amm.defi.cns.eth',
                traits: {
                  requiredRoles: ['router', 'factory', 'quoter'],
                  allowedRoles: ['router', 'factory', 'quoter', 'multicall'],
                  contractTypes: ['swap', 'liquidity', 'pricing'],
                },
              },
            ],
            traits: {
              inherits: ['project', 'cns.eth'],
              overrides: {},
              categorySpecific: {
                requiredFields: ['category'],
                validationRules: {
                  categoryPattern: '^defi$',
                },
              },
            },
          },
          dao: {
            domain: 'dao.cns.eth',
            subcategories: [
              {
                name: 'governance',
                domain: 'governance.dao.cns.eth',
                traits: {
                  requiredRoles: ['governor', 'token', 'treasury'],
                  allowedRoles: ['governor', 'token', 'treasury', 'timelock'],
                  contractTypes: ['governance', 'voting', 'treasury'],
                },
              },
            ],
            traits: {
              inherits: ['project', 'cns.eth'],
              overrides: {},
              categorySpecific: {
                requiredFields: ['category'],
                validationRules: {
                  categoryPattern: '^dao$',
                },
              },
            },
          },
        },
        deduplication: {
          rules: [
            {
              field: 'ensRoot',
              strategy: 'inherit',
              priority: 1,
              conditions: { level: { min: 1 } },
            },
          ],
          inheritance: {
            enabled: true,
            maxDepth: 5,
            conflictResolution: 'child',
          },
        },
      };
    }
  }

  /**
   * Build inheritance graph
   */
  buildInheritanceGraph() {
    this.inheritanceGraph.clear();

    // Build graph from hierarchy configuration
    const projects = this.hierarchyConfig?.projects || {};
    for (const [projectName, projectConfig] of Object.entries(projects)) {
      this.inheritanceGraph.set(projectName, {
        type: 'project',
        inherits: projectConfig.traits?.inherits || [],
        overrides: projectConfig.traits?.overrides || {},
        level: 1,
      });
    }

    const categories = this.hierarchyConfig?.categories || {};
    for (const [categoryName, categoryConfig] of Object.entries(categories)) {
      this.inheritanceGraph.set(categoryName, {
        type: 'category',
        inherits: categoryConfig.traits?.inherits || [],
        overrides: categoryConfig.traits?.overrides || {},
        level: 2,
        subcategories: categoryConfig.subcategories || [],
      });

      // Add subcategories to graph
      for (const subcategory of categoryConfig.subcategories) {
        this.inheritanceGraph.set(`${categoryName}.${subcategory.name}`, {
          type: 'subcategory',
          inherits: [categoryName, ...(subcategory.traits?.inherits || [])],
          overrides: subcategory.traits?.overrides || {},
          level: 3,
          parent: categoryName,
        });
      }
    }
  }

  /**
   * Get inheritance chain for a domain
   */
  getInheritanceChain(domain) {
    const domains = domain.split('.');
    const chain = [];

    // Build chain from domain hierarchy
    for (let i = 0; i < domains.length; i++) {
      const currentDomain = domains.slice(i).join('.');
      const level = domains.length - 1 - i;

      chain.push({
        domain: currentDomain,
        level: level,
        inherits: this.getInheritanceForDomain(currentDomain, level),
      });
    }

    return chain;
  }

  /**
   * Get inheritance information for a specific domain and level
   */
  getInheritanceForDomain(domain, level) {
    const inherits = [];

    // Add CNS root inheritance
    if (level > 0) {
      inherits.push('cns.eth');
    }

    // Add project inheritance
    if (level > 1) {
      const projectName = domain.split('.')[0];
      if (this.inheritanceGraph.has(projectName)) {
        inherits.push(projectName);
      }
    }

    // Add category inheritance
    if (level > 2) {
      const parts = domain.split('.');
      if (parts.length >= 2) {
        const categoryName = parts[1];
        if (this.inheritanceGraph.has(categoryName)) {
          inherits.push(categoryName);
        }
      }
    }

    // Add subcategory inheritance
    if (level > 3) {
      const parts = domain.split('.');
      if (parts.length >= 3) {
        const subcategoryName = `${parts[1]}.${parts[2]}`;
        if (this.inheritanceGraph.has(subcategoryName)) {
          inherits.push(subcategoryName);
        }
      }
    }

    return inherits;
  }

  /**
   * Resolve field inheritance
   */
  resolveFieldInheritance(fieldName, domain, level) {
    const inheritanceChain = this.getInheritanceChain(domain);
    const resolution = {
      field: fieldName,
      domain: domain,
      level: level,
      source: null,
      strategy: 'inherit',
      conflicts: [],
    };

    // Check inheritance chain for field
    for (const chainItem of inheritanceChain) {
      if (chainItem.level >= level) continue;

      const fieldSource = this.getFieldSource(fieldName, chainItem.domain, chainItem.level);
      if (fieldSource) {
        if (resolution.source) {
          // Check for conflicts
          if (this.hasFieldConflict(resolution.source, fieldSource)) {
            resolution.conflicts.push({
              domain: chainItem.domain,
              level: chainItem.level,
              source: fieldSource,
            });
          }
        } else {
          resolution.source = fieldSource;
        }
      }
    }

    // Apply conflict resolution strategy
    if (resolution.conflicts.length > 0) {
      resolution.strategy = this.resolveConflict(resolution.conflicts);
    }

    return resolution;
  }

  /**
   * Get field source for a domain and level
   */
  getFieldSource(fieldName, domain, level) {
    // Check if field is defined at this level
    const levelConfig = this.getLevelConfig(domain, level);
    if (levelConfig && levelConfig.properties && levelConfig.properties[fieldName]) {
      return {
        domain: domain,
        level: level,
        definition: levelConfig.properties[fieldName],
      };
    }

    return null;
  }

  /**
   * Get level configuration
   */
  getLevelConfig(domain, level) {
    // This would typically load from generated schemas
    // For now, return a mock configuration
    return {
      properties: {
        // Mock properties based on level
        [level === 0
          ? 'cnsRoot'
          : level === 1
            ? 'projectRoot'
            : level === 2
              ? 'categoryRoot'
              : 'subcategoryRoot']: {
          type: 'string',
          pattern: `^${domain}$`,
        },
      },
    };
  }

  /**
   * Check for field conflicts
   */
  hasFieldConflict(source1, source2) {
    // Compare field definitions
    return JSON.stringify(source1.definition) !== JSON.stringify(source2.definition);
  }

  /**
   * Resolve field conflicts
   */
  resolveConflict(conflicts) {
    const strategy = this.hierarchyConfig.deduplication.inheritance.conflictResolution;

    switch (strategy) {
      case 'parent':
        return 'inherit';
      case 'child':
        return 'override';
      case 'merge':
        return 'merge';
      case 'error':
        throw new Error(`Field conflict detected: ${conflicts.map((c) => c.domain).join(', ')}`);
      default:
        return 'inherit';
    }
  }

  /**
   * Apply deduplication rules
   */
  applyDeduplicationRules(metadata, domain) {
    const rules = this.hierarchyConfig.deduplication.rules;
    const result = { ...metadata };

    for (const rule of rules) {
      if (this.matchesRule(domain, rule)) {
        result = this.applyRule(result, rule);
      }
    }

    return result;
  }

  /**
   * Check if domain matches rule conditions
   */
  matchesRule(domain, rule) {
    if (rule.conditions) {
      if (rule.conditions.domain && !domain.match(rule.conditions.domain)) {
        return false;
      }
      if (rule.conditions.level) {
        const level = domain.split('.').length - 1;
        if (level !== rule.conditions.level) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Apply a deduplication rule
   */
  applyRule(metadata, rule) {
    const result = { ...metadata };

    switch (rule.strategy) {
      case 'inherit':
        // Remove field if it should be inherited
        if (result[rule.field]) {
          delete result[rule.field];
          if (!result._deduplication) result._deduplication = {};
          if (!result._deduplication.inherited) result._deduplication.inherited = [];
          result._deduplication.inherited.push(rule.field);
        }
        break;

      case 'override':
        // Keep field but mark as override
        if (result[rule.field]) {
          if (!result._deduplication) result._deduplication = {};
          if (!result._deduplication.overridden) result._deduplication.overridden = [];
          result._deduplication.overridden.push(rule.field);
        }
        break;

      case 'merge':
        // Merge field with inherited value
        if (result[rule.field]) {
          if (!result._deduplication) result._deduplication = {};
          if (!result._deduplication.merged) result._deduplication.merged = [];
          result._deduplication.merged.push(rule.field);
        }
        break;

      case 'replace':
        // Replace inherited field
        if (result[rule.field]) {
          if (!result._deduplication) result._deduplication = {};
          if (!result._deduplication.replaced) result._deduplication.replaced = [];
          result._deduplication.replaced.push(rule.field);
        }
        break;
    }

    return result;
  }

  /**
   * Generate inheritance report
   */
  generateInheritanceReport(domain) {
    const inheritanceChain = this.getInheritanceChain(domain);
    const report = {
      domain: domain,
      inheritanceChain: inheritanceChain,
      deduplication: {
        inheritedFields: [],
        overriddenFields: [],
        mergedFields: [],
        replacedFields: [],
      },
      conflicts: [],
    };

    // Analyze each level
    for (const chainItem of inheritanceChain) {
      const levelReport = this.analyzeLevel(chainItem);
      report.deduplication.inheritedFields.push(...levelReport.inherited);
      report.deduplication.overriddenFields.push(...levelReport.overridden);
      report.deduplication.mergedFields.push(...levelReport.merged);
      report.deduplication.replacedFields.push(...levelReport.replaced);
      report.conflicts.push(...levelReport.conflicts);
    }

    return report;
  }

  /**
   * Analyze a specific level
   */
  analyzeLevel(chainItem) {
    return {
      inherited: [],
      overridden: [],
      merged: [],
      replaced: [],
      conflicts: [],
    };
  }

  /**
   * Validate inheritance consistency
   */
  validateInheritanceConsistency(metadata, domain) {
    const issues = [];
    const warnings = [];

    // Check for circular inheritance
    const inheritanceChain = this.getInheritanceChain(domain);
    const domains = inheritanceChain.map((item) => item.domain);
    const uniqueDomains = new Set(domains);

    if (domains.length !== uniqueDomains.size) {
      issues.push('Circular inheritance detected');
    }

    // Check for missing required fields
    const requiredFields = this.getRequiredFields(domain);
    for (const field of requiredFields) {
      if (!metadata[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Check for redundant fields
    const redundantFields = this.getRedundantFields(domain);
    for (const field of redundantFields) {
      if (metadata[field]) {
        warnings.push(`Redundant field: ${field} (should be inherited)`);
      }
    }

    return { issues, warnings };
  }

  /**
   * Get required fields for a domain
   */
  getRequiredFields(domain) {
    const level = domain.split('.').length - 1;
    const baseRequired = [
      'id',
      'org',
      'protocol',
      'category',
      'role',
      'version',
      'chainId',
      'addresses',
    ];

    // Add level-specific required fields
    switch (level) {
      case 0: // CNS Root
        return [...baseRequired, 'ensRoot'];
      case 1: // Project
        return [...baseRequired, 'ensRoot', 'projectRoot'];
      case 2: // Category
        return [...baseRequired, 'ensRoot', 'projectRoot', 'categoryRoot'];
      case 3: // Subcategory
        return [...baseRequired, 'ensRoot', 'projectRoot', 'categoryRoot', 'subcategoryRoot'];
      case 4: // Contract
        return [
          ...baseRequired,
          'ensRoot',
          'projectRoot',
          'categoryRoot',
          'subcategoryRoot',
          'contractRoot',
        ];
      default:
        return baseRequired;
    }
  }

  /**
   * Get redundant fields for a domain
   */
  getRedundantFields(domain) {
    const level = domain.split('.').length - 1;
    const redundant = [];

    // Fields that should be inherited from parent levels
    if (level > 0) {
      redundant.push('ensRoot');
    }
    if (level > 1) {
      redundant.push('projectRoot');
    }
    if (level > 2) {
      redundant.push('categoryRoot');
    }
    if (level > 3) {
      redundant.push('subcategoryRoot');
    }

    return redundant;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: schema-inheritance <command> [options]

Manage schema inheritance and deduplication for hierarchical ENS metadata schemas.

Commands:
  report <domain>           Generate inheritance report for a domain
  validate <domain> <file>  Validate inheritance consistency for metadata file
  resolve <domain> <file>   Resolve field inheritance for metadata file
  graph                     Show inheritance graph
  chain <domain>            Show inheritance chain for a domain

Options:
  --help, -h                Show this help message
  --version, -v             Show version information
  --output, -o <file>       Output file for reports
  --verbose                 Verbose output

Examples:
  node bin/schema-inheritance.mjs report uniswap.defi.cns.eth
  node bin/schema-inheritance.mjs validate ens.dao.cns.eth metadata.json
  node bin/schema-inheritance.mjs resolve uniswap.defi.cns.eth metadata.json
  node bin/schema-inheritance.mjs graph
  node bin/schema-inheritance.mjs chain uniswap.defi.cns.eth
`);
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('Schema Inheritance Manager v1.0.0');
    return;
  }

  const command = args[0];
  const manager = new SchemaInheritanceManager();
  manager.loadHierarchyConfig();
  manager.buildInheritanceGraph();

  try {
    switch (command) {
      case 'report':
        if (args.length < 2) {
          console.error('Domain required for report command');
          process.exit(1);
        }
        const domain = args[1];
        const report = manager.generateInheritanceReport(domain);
        console.log(JSON.stringify(report, null, 2));
        break;

      case 'validate':
        if (args.length < 3) {
          console.error('Domain and file required for validate command');
          process.exit(1);
        }
        const validateDomain = args[1];
        const validateFile = args[2];
        const metadata = JSON.parse(fs.readFileSync(validateFile, 'utf8'));
        const validation = manager.validateInheritanceConsistency(metadata, validateDomain);
        console.log('Issues:', validation.issues);
        console.log('Warnings:', validation.warnings);
        break;

      case 'resolve':
        if (args.length < 3) {
          console.error('Domain and file required for resolve command');
          process.exit(1);
        }
        const resolveDomain = args[1];
        const resolveFile = args[2];
        const resolveMetadata = JSON.parse(fs.readFileSync(resolveFile, 'utf8'));
        const resolved = manager.applyDeduplicationRules(resolveMetadata, resolveDomain);
        console.log(JSON.stringify(resolved, null, 2));
        break;

      case 'graph':
        console.log('Inheritance Graph:');
        for (const [domain, config] of manager.inheritanceGraph) {
          console.log(`${domain} (${config.type}, level ${config.level}):`);
          console.log(`  Inherits: ${config.inherits.join(', ')}`);
          console.log(`  Overrides: ${Object.keys(config.overrides).join(', ')}`);
        }
        break;

      case 'chain':
        if (args.length < 2) {
          console.error('Domain required for chain command');
          process.exit(1);
        }
        const chainDomain = args[1];
        const chain = manager.getInheritanceChain(chainDomain);
        console.log('Inheritance Chain:');
        for (const item of chain) {
          console.log(`${item.domain} (level ${item.level}):`);
          console.log(`  Inherits: ${item.inherits.join(', ')}`);
        }
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SchemaInheritanceManager;
