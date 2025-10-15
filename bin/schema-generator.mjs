#!/usr/bin/env node

/**
 * Hierarchical Schema Generator
 *
 * Generates hierarchical schemas based on domain hierarchy and inheritance rules
 * to prevent redundant data and maintain deduplication across ENS metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HierarchicalSchemaGenerator {
  constructor() {
    this.hierarchyConfig = null;
    this.baseSchema = null;
    this.generatedSchemas = new Map();
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
        hierarchy: {
          levels: [
            {
              level: 0,
              name: 'CNS Root',
              pattern: '^cns\\.eth$',
              required: ['ensRoot'],
              inherits: [],
            },
            {
              level: 1,
              name: 'Project',
              pattern: '^[a-z0-9-]+\\.cns\\.eth$',
              required: ['projectRoot'],
              inherits: ['cns.eth'],
            },
            {
              level: 2,
              name: 'Category',
              pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
              required: ['categoryRoot'],
              inherits: ['project', 'cns.eth'],
            },
            {
              level: 3,
              name: 'Subcategory',
              pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
              required: ['subcategoryRoot'],
              inherits: ['category', 'project', 'cns.eth'],
            },
            {
              level: 4,
              name: 'Contract',
              pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
              required: ['contractRoot'],
              inherits: ['subcategory', 'category', 'project', 'cns.eth'],
            },
          ],
        },
        cnsRoot: {
          domain: 'cns.eth',
          traits: {
            namingConventions: {
              separator: '.',
              case: 'lowercase',
              allowedChars: 'a-z0-9-',
            },
            requiredFields: [
              'id',
              'org',
              'protocol',
              'category',
              'role',
              'version',
              'chainId',
              'addresses',
            ],
            optionalFields: ['subcategory', 'variant', 'ensRoot', 'subdomains'],
            validationRules: {
              domainPattern: '^[a-z0-9.-]+\\.cns\\.eth$',
              versionPattern: '^v[0-9]+(-[0-9]+)?(-[0-9]+)?$',
              addressPattern: '^0x[a-fA-F0-9]{40}$',
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
   * Load base schema
   */
  loadBaseSchema() {
    const schemaPath = path.join(__dirname, '..', 'data', 'metadata', 'hierarchical-schema.json');
    this.baseSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }

  /**
   * Generate schema for a specific domain level
   */
  generateSchemaForLevel(domain, level, parentSchema = null) {
    let levelConfig = this.hierarchyConfig?.hierarchy?.levels?.find((l) => l.level === level);
    if (!levelConfig) {
      // Fallback to default level configuration
      const defaultLevels = [
        { level: 0, name: 'CNS Root', pattern: '^cns\\.eth$', required: ['ensRoot'], inherits: [] },
        {
          level: 1,
          name: 'Project',
          pattern: '^[a-z0-9-]+\\.cns\\.eth$',
          required: ['projectRoot'],
          inherits: ['cns.eth'],
        },
        {
          level: 2,
          name: 'Category',
          pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
          required: ['categoryRoot'],
          inherits: ['project', 'cns.eth'],
        },
        {
          level: 3,
          name: 'Subcategory',
          pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
          required: ['subcategoryRoot'],
          inherits: ['category', 'project', 'cns.eth'],
        },
        {
          level: 4,
          name: 'Contract',
          pattern: '^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$',
          required: ['contractRoot'],
          inherits: ['subcategory', 'category', 'project', 'cns.eth'],
        },
      ];
      levelConfig = defaultLevels.find((l) => l.level === level);
      if (!levelConfig) {
        throw new Error(`Level ${level} not found in hierarchy configuration`);
      }
    }

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `${levelConfig.name} Schema for ${domain}`,
      type: 'object',
      allOf: [],
    };

    // Inherit from parent schema if available
    if (parentSchema) {
      schema.allOf.push({ $ref: `#/definitions/parentSchema` });
    }

    // Add level-specific properties
    const levelProperties = this.generateLevelProperties(domain, level, levelConfig);
    schema.allOf.push({
      type: 'object',
      required: levelConfig.required || [],
      properties: levelProperties,
    });

    // Add definitions
    schema.definitions = this.generateDefinitions(domain, level, levelConfig);

    return schema;
  }

  /**
   * Generate properties for a specific level
   */
  generateLevelProperties(domain, level, levelConfig) {
    const properties = {};

    // Add domain hierarchy information
    properties.domainHierarchy = {
      type: 'object',
      properties: {
        level: { type: 'integer', const: level },
        domain: { type: 'string', const: domain },
        parent: { type: ['string', 'null'] },
        children: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    // Add level-specific traits
    properties.traits = {
      type: 'object',
      properties: {
        inheritedFrom: { type: 'array', items: { type: 'string' } },
        levelSpecific: { type: 'object' },
        overrides: { type: 'object' },
      },
    };

    // Add deduplication information
    properties.deduplication = {
      type: 'object',
      properties: {
        inheritedFields: { type: 'array', items: { type: 'string' } },
        overriddenFields: { type: 'array', items: { type: 'string' } },
        mergedFields: { type: 'array', items: { type: 'string' } },
      },
    };

    return properties;
  }

  /**
   * Generate definitions for a specific level
   */
  generateDefinitions(domain, level, levelConfig) {
    const definitions = {};

    // Add parent schema definition if inheriting
    if (levelConfig.inherits && levelConfig.inherits.length > 0) {
      definitions.parentSchema = {
        type: 'object',
        properties: {},
      };

      // Add inherited properties
      for (const inheritFrom of levelConfig.inherits) {
        const inheritedSchema = this.generatedSchemas.get(inheritFrom);
        if (inheritedSchema) {
          definitions.parentSchema.properties = {
            ...definitions.parentSchema.properties,
            ...inheritedSchema.properties,
          };
        }
      }
    }

    // Add level-specific definitions
    definitions.levelSpecific = {
      type: 'object',
      properties: this.generateLevelSpecificProperties(domain, level, levelConfig),
    };

    return definitions;
  }

  /**
   * Generate level-specific properties
   */
  generateLevelSpecificProperties(domain, level, levelConfig) {
    const properties = {};

    switch (level) {
      case 0: // CNS Root
        properties.cnsRoot = {
          type: 'object',
          properties: {
            domain: { type: 'string', const: 'cns.eth' },
            traits: this.hierarchyConfig?.cnsRoot?.traits || {
              namingConventions: {
                separator: '.',
                case: 'lowercase',
                allowedChars: 'a-z0-9-',
              },
              requiredFields: [
                'id',
                'org',
                'protocol',
                'category',
                'role',
                'version',
                'chainId',
                'addresses',
              ],
              optionalFields: ['subcategory', 'variant', 'ensRoot', 'subdomains'],
              validationRules: {
                domainPattern: '^[a-z0-9.-]+\\.cns\\.eth$',
                versionPattern: '^v[0-9]+(-[0-9]+)?(-[0-9]+)?$',
                addressPattern: '^0x[a-fA-F0-9]{40}$',
              },
            },
          },
        };
        break;

      case 1: // Project
        properties.projectRoot = {
          type: 'string',
          pattern: `^${domain}$`,
        };
        properties.projectTraits = {
          type: 'object',
          properties: {
            inheritedFrom: { type: 'array', items: { type: 'string' } },
            projectSpecific: { type: 'object' },
            overrides: { type: 'object' },
          },
        };
        break;

      case 2: // Category
        properties.categoryRoot = {
          type: 'string',
          pattern: `^${domain}$`,
        };
        properties.categoryTraits = {
          type: 'object',
          properties: {
            inheritedFrom: { type: 'array', items: { type: 'string' } },
            categorySpecific: { type: 'object' },
            overrides: { type: 'object' },
          },
        };
        break;

      case 3: // Subcategory
        properties.subcategoryRoot = {
          type: 'string',
          pattern: `^${domain}$`,
        };
        properties.subcategoryTraits = {
          type: 'object',
          properties: {
            inheritedFrom: { type: 'array', items: { type: 'string' } },
            subcategorySpecific: { type: 'object' },
            overrides: { type: 'object' },
          },
        };
        break;

      case 4: // Contract
        properties.contractRoot = {
          type: 'string',
          pattern: `^${domain}$`,
        };
        properties.contractTraits = {
          type: 'object',
          properties: {
            inheritedFrom: { type: 'array', items: { type: 'string' } },
            contractSpecific: { type: 'object' },
            overrides: { type: 'object' },
          },
        };
        break;
    }

    return properties;
  }

  /**
   * Generate complete hierarchical schema
   */
  generateHierarchicalSchema(domainPath) {
    const domains = domainPath.split('.');
    const schemas = [];

    // Generate schema for each level
    for (let i = 0; i < domains.length; i++) {
      const domain = domains.slice(i).join('.');
      const level = domains.length - 1 - i;
      const parentSchema = i > 0 ? schemas[i - 1] : null;

      const schema = this.generateSchemaForLevel(domain, level, parentSchema);
      schemas.push(schema);
      this.generatedSchemas.set(domain, schema);
    }

    return schemas;
  }

  /**
   * Apply deduplication rules
   */
  applyDeduplicationRules(schema, domain, level) {
    const rules = this.hierarchyConfig?.deduplication?.rules || [];

    for (const rule of rules) {
      if (this.matchesRule(domain, level, rule)) {
        schema = this.applyRule(schema, rule);
      }
    }

    return schema;
  }

  /**
   * Check if domain and level match rule conditions
   */
  matchesRule(domain, level, rule) {
    if (rule.conditions) {
      if (rule.conditions.level && rule.conditions.level !== level) {
        return false;
      }
      if (rule.conditions.domain && !domain.match(rule.conditions.domain)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Apply a deduplication rule
   */
  applyRule(schema, rule) {
    switch (rule.strategy) {
      case 'inherit':
        return this.applyInheritRule(schema, rule);
      case 'override':
        return this.applyOverrideRule(schema, rule);
      case 'merge':
        return this.applyMergeRule(schema, rule);
      case 'replace':
        return this.applyReplaceRule(schema, rule);
      default:
        return schema;
    }
  }

  /**
   * Apply inherit rule
   */
  applyInheritRule(schema, rule) {
    // Add field to inherited fields list
    if (!schema.properties.deduplication) {
      schema.properties.deduplication = { type: 'object', properties: {} };
    }
    if (!schema.properties.deduplication.properties.inheritedFields) {
      schema.properties.deduplication.properties.inheritedFields = {
        type: 'array',
        items: { type: 'string' },
      };
    }

    return schema;
  }

  /**
   * Apply override rule
   */
  applyOverrideRule(schema, rule) {
    // Add field to overridden fields list
    if (!schema.properties.deduplication) {
      schema.properties.deduplication = { type: 'object', properties: {} };
    }
    if (!schema.properties.deduplication.properties.overriddenFields) {
      schema.properties.deduplication.properties.overriddenFields = {
        type: 'array',
        items: { type: 'string' },
      };
    }

    return schema;
  }

  /**
   * Apply merge rule
   */
  applyMergeRule(schema, rule) {
    // Add field to merged fields list
    if (!schema.properties.deduplication) {
      schema.properties.deduplication = { type: 'object', properties: {} };
    }
    if (!schema.properties.deduplication.properties.mergedFields) {
      schema.properties.deduplication.properties.mergedFields = {
        type: 'array',
        items: { type: 'string' },
      };
    }

    return schema;
  }

  /**
   * Apply replace rule
   */
  applyReplaceRule(schema, rule) {
    // Remove field from inherited fields and add to overridden fields
    if (!schema.properties.deduplication) {
      schema.properties.deduplication = { type: 'object', properties: {} };
    }
    if (!schema.properties.deduplication.properties.overriddenFields) {
      schema.properties.deduplication.properties.overriddenFields = {
        type: 'array',
        items: { type: 'string' },
      };
    }

    return schema;
  }

  /**
   * Generate schema for a specific domain
   */
  generateSchemaForDomain(domain) {
    this.loadHierarchyConfig();
    this.loadBaseSchema();

    const schemas = this.generateHierarchicalSchema(domain);

    // Apply deduplication rules to each schema
    const domains = domain.split('.');
    for (let i = 0; i < schemas.length; i++) {
      const level = domains.length - 1 - i;
      const currentDomain = domains.slice(i).join('.');
      schemas[i] = this.applyDeduplicationRules(schemas[i], currentDomain, level);
    }

    return schemas;
  }

  /**
   * Save generated schema to file
   */
  saveSchema(schema, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
  }

  /**
   * Generate and save schema for a domain
   */
  generateAndSaveSchema(domain, outputDir) {
    const schemas = this.generateSchemaForDomain(domain);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save each level schema
    const domains = domain.split('.');
    for (let i = 0; i < schemas.length; i++) {
      const level = domains.length - 1 - i;
      const currentDomain = domains.slice(i).join('.');
      const filename = `${currentDomain.replace(/\./g, '-')}-level-${level}-schema.json`;
      const outputPath = path.join(outputDir, filename);

      this.saveSchema(schemas[i], outputPath);
      console.log(`Generated schema for ${currentDomain} (level ${level}): ${outputPath}`);
    }

    return schemas;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: schema-generator <domain> [options]

Generate hierarchical schemas for ENS metadata domains.

Arguments:
  domain                    Domain to generate schema for (e.g., "uniswap.defi.cns.eth")

Options:
  --output, -o <dir>        Output directory for generated schemas (default: ./generated-schemas)
  --help, -h                Show this help message
  --version, -v              Show version information

Examples:
  node bin/schema-generator.mjs uniswap.defi.cns.eth
  node bin/schema-generator.mjs ens.dao.cns.eth --output ./schemas
  node bin/schema-generator.mjs --help
`);
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('Schema Generator v1.0.0');
    return;
  }

  const domain = args[0];
  const outputIndex =
    args.indexOf('--output') !== -1 ? args.indexOf('--output') : args.indexOf('-o');
  const outputDir =
    outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : './generated-schemas';

  try {
    const generator = new HierarchicalSchemaGenerator();
    const schemas = generator.generateAndSaveSchema(domain, outputDir);

    console.log(`\nSuccessfully generated ${schemas.length} hierarchical schemas for ${domain}`);
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error(`Error generating schema: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default HierarchicalSchemaGenerator;
