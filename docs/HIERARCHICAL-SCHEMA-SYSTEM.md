# Hierarchical Schema System for ENS Metadata

## Overview

The hierarchical schema system provides a structured approach to ENS metadata management with inheritance, deduplication, and domain-specific validation. This system prevents redundant data while maintaining consistency across different levels of the domain hierarchy.

## Domain Hierarchy Structure

### Level 0: CNS Root (`cns.eth`)

- **Domain**: `cns.eth`
- **Purpose**: Root domain for all ENS metadata
- **Required Fields**: `ensRoot`
- **Inherits**: None (root level)

### Level 1: Project (`{project}.cns.eth`)

- **Domain**: `{project}.cns.eth` (e.g., `uniswap.cns.eth`, `ens.cns.eth`)
- **Purpose**: Project-specific root domain
- **Required Fields**: `projectRoot`
- **Inherits**: `cns.eth`

### Level 2: Category (`{project}.{category}.cns.eth`)

- **Domain**: `{project}.{category}.cns.eth` (e.g., `uniswap.defi.cns.eth`)
- **Purpose**: Category-specific domain within a project
- **Required Fields**: `categoryRoot`
- **Inherits**: `{project}.cns.eth`, `cns.eth`

### Level 3: Subcategory (`{project}.{category}.{subcategory}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.cns.eth` (e.g., `uniswap.defi.amm.cns.eth`)
- **Purpose**: Subcategory-specific domain within a category
- **Required Fields**: `subcategoryRoot`
- **Inherits**: `{project}.{category}.cns.eth`, `{project}.cns.eth`, `cns.eth`

### Level 4: Contract (`{project}.{category}.{subcategory}.{contract}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.{contract}.cns.eth` (e.g., `uniswap.defi.amm.router.cns.eth`)
- **Purpose**: Individual contract domain
- **Required Fields**: `contractRoot`
- **Inherits**: All parent levels

## Schema Inheritance

### Inheritance Chain

Each level inherits properties and validation rules from its parent levels:

```
cns.eth (Level 0)
├── uniswap.cns.eth (Level 1)
│   ├── uniswap.defi.cns.eth (Level 2)
│   │   ├── uniswap.defi.amm.cns.eth (Level 3)
│   │   │   ├── uniswap.defi.amm.router.cns.eth (Level 4)
│   │   │   └── uniswap.defi.amm.factory.cns.eth (Level 4)
│   │   └── uniswap.defi.lending.cns.eth (Level 3)
│   └── uniswap.dao.cns.eth (Level 2)
└── ens.cns.eth (Level 1)
    └── ens.dao.cns.eth (Level 2)
        └── ens.dao.governance.cns.eth (Level 3)
```

### Field Inheritance Rules

#### Inherited Fields

Fields that are inherited from parent levels and should not be duplicated:

- **Level 1+**: `ensRoot` (inherited from `cns.eth`)
- **Level 2+**: `projectRoot` (inherited from `{project}.cns.eth`)
- **Level 3+**: `categoryRoot` (inherited from `{project}.{category}.cns.eth`)
- **Level 4+**: `subcategoryRoot` (inherited from `{project}.{category}.{subcategory}.cns.eth`)

#### Overridden Fields

Fields that can be overridden at child levels:

- **Level 1+**: `protocol` (can be overridden by project-specific rules)
- **Level 2+**: `category` (can be overridden by category-specific rules)
- **Level 3+**: `subcategory` (can be overridden by subcategory-specific rules)

#### Merged Fields

Fields that are merged from multiple parent levels:

- **All Levels**: `validationRules` (merged from all parent levels)
- **All Levels**: `requiredFields` (merged from all parent levels)
- **All Levels**: `optionalFields` (merged from all parent levels)

## Deduplication Strategies

### 1. Inherit Strategy

Fields are inherited from parent levels and removed from child metadata:

```json
{
  "ensRoot": "uniswap.defi.cns.eth",
  "_deduplication": {
    "inherited": ["ensRoot", "projectRoot"]
  }
}
```

### 2. Override Strategy

Fields are overridden at child levels with explicit marking:

```json
{
  "protocol": "uniswap-v3",
  "_deduplication": {
    "overridden": ["protocol"]
  }
}
```

### 3. Merge Strategy

Fields are merged from multiple parent levels:

```json
{
  "validationRules": {
    "domainPattern": "^[a-z0-9.-]+\\.cns\\.eth$",
    "protocolPattern": "^uniswap$",
    "categoryPattern": "^defi$"
  },
  "_deduplication": {
    "merged": ["validationRules"]
  }
}
```

### 4. Replace Strategy

Fields replace inherited values completely:

```json
{
  "category": "defi-v2",
  "_deduplication": {
    "replaced": ["category"]
  }
}
```

## Schema Generation

### Automatic Schema Generation

The system automatically generates schemas for each domain level:

```bash
# Generate hierarchical schemas for a domain
node bin/schema-generator.mjs uniswap.defi.amm.cns.eth

# Output:
# - cns-eth-level-0-schema.json
# - uniswap-cns-eth-level-1-schema.json
# - uniswap-defi-cns-eth-level-2-schema.json
# - uniswap-defi-amm-cns-eth-level-3-schema.json
```

### Schema Validation

Each generated schema includes:

1. **Base Schema**: Common properties and validation rules
2. **Level-Specific Properties**: Properties unique to that level
3. **Inheritance Definitions**: References to parent schemas
4. **Deduplication Rules**: Rules for field inheritance and overrides

## Configuration Files

### Hierarchy Configuration (`data/configs/schema-hierarchy.json`)

Defines the hierarchy structure, inheritance rules, and deduplication strategies:

```json
{
  "hierarchy": {
    "levels": [
      { "level": 0, "name": "CNS Root", "pattern": "^cns\\.eth$" },
      { "level": 1, "name": "Project", "pattern": "^[a-z0-9-]+\\.cns\\.eth$" },
      { "level": 2, "name": "Category", "pattern": "^[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$" },
      {
        "level": 3,
        "name": "Subcategory",
        "pattern": "^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$"
      },
      {
        "level": 4,
        "name": "Contract",
        "pattern": "^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.cns\\.eth$"
      }
    ]
  },
  "deduplication": {
    "rules": [
      {
        "field": "ensRoot",
        "strategy": "inherit",
        "priority": 1,
        "conditions": { "level": { "min": 1 } }
      }
    ]
  }
}
```

### Project Configuration

Defines project-specific traits and inheritance rules:

```json
{
  "projects": {
    "uniswap": {
      "domain": "uniswap.cns.eth",
      "traits": {
        "inherits": ["cns.eth"],
        "projectSpecific": {
          "requiredFields": ["protocol"],
          "validationRules": {
            "protocolPattern": "^uniswap$"
          }
        }
      }
    }
  }
}
```

### Category Configuration

Defines category-specific traits and subcategories:

```json
{
  "categories": {
    "defi": {
      "domain": "defi.cns.eth",
      "subcategories": [
        {
          "name": "amm",
          "domain": "amm.defi.cns.eth",
          "traits": {
            "requiredRoles": ["router", "factory", "quoter"],
            "allowedRoles": ["router", "factory", "quoter", "multicall"]
          }
        }
      ]
    }
  }
}
```

## Usage Examples

### 1. Generate Hierarchical Schemas

```bash
# Generate schemas for Uniswap DeFi AMM
node bin/schema-generator.mjs uniswap.defi.amm.cns.eth --output ./schemas

# Generate schemas for ENS DAO Governance
node bin/schema-generator.mjs ens.dao.governance.cns.eth --output ./schemas
```

### 2. Manage Schema Inheritance

```bash
# Generate inheritance report
node bin/schema-inheritance.mjs report uniswap.defi.amm.cns.eth

# Validate inheritance consistency
node bin/schema-inheritance.mjs validate uniswap.defi.amm.cns.eth metadata.json

# Resolve field inheritance
node bin/schema-inheritance.mjs resolve uniswap.defi.amm.cns.eth metadata.json

# Show inheritance graph
node bin/schema-inheritance.mjs graph

# Show inheritance chain
node bin/schema-inheritance.mjs chain uniswap.defi.amm.cns.eth
```

### 3. Metadata Examples

#### Level 0: CNS Root

```json
{
  "id": "cns.eth",
  "ensRoot": "cns.eth",
  "domainHierarchy": {
    "level": 0,
    "parent": null,
    "children": ["uniswap.cns.eth", "ens.cns.eth"]
  },
  "traits": {
    "namingConventions": {
      "separator": ".",
      "case": "lowercase",
      "allowedChars": "a-z0-9-"
    }
  }
}
```

#### Level 1: Project

```json
{
  "id": "uniswap.cns.eth",
  "ensRoot": "cns.eth",
  "projectRoot": "uniswap.cns.eth",
  "domainHierarchy": {
    "level": 1,
    "parent": "cns.eth",
    "children": ["uniswap.defi.cns.eth", "uniswap.dao.cns.eth"]
  },
  "traits": {
    "inheritedFrom": ["cns.eth"],
    "projectSpecific": {
      "requiredFields": ["protocol"],
      "validationRules": {
        "protocolPattern": "^uniswap$"
      }
    }
  }
}
```

#### Level 2: Category

```json
{
  "id": "uniswap.defi.cns.eth",
  "ensRoot": "cns.eth",
  "projectRoot": "uniswap.cns.eth",
  "categoryRoot": "uniswap.defi.cns.eth",
  "domainHierarchy": {
    "level": 2,
    "parent": "uniswap.cns.eth",
    "children": ["uniswap.defi.amm.cns.eth", "uniswap.defi.lending.cns.eth"]
  },
  "traits": {
    "inheritedFrom": ["uniswap.cns.eth", "cns.eth"],
    "categorySpecific": {
      "requiredFields": ["category"],
      "validationRules": {
        "categoryPattern": "^defi$"
      }
    }
  }
}
```

#### Level 3: Subcategory

```json
{
  "id": "uniswap.defi.amm.cns.eth",
  "ensRoot": "cns.eth",
  "projectRoot": "uniswap.cns.eth",
  "categoryRoot": "uniswap.defi.cns.eth",
  "subcategoryRoot": "uniswap.defi.amm.cns.eth",
  "domainHierarchy": {
    "level": 3,
    "parent": "uniswap.defi.cns.eth",
    "children": ["uniswap.defi.amm.router.cns.eth", "uniswap.defi.amm.factory.cns.eth"]
  },
  "traits": {
    "inheritedFrom": ["uniswap.defi.cns.eth", "uniswap.cns.eth", "cns.eth"],
    "subcategorySpecific": {
      "requiredRoles": ["router", "factory", "quoter"],
      "allowedRoles": ["router", "factory", "quoter", "multicall"],
      "contractTypes": ["swap", "liquidity", "pricing"]
    }
  }
}
```

#### Level 4: Contract

```json
{
  "id": "uniswap.defi.amm.router.cns.eth",
  "ensRoot": "cns.eth",
  "projectRoot": "uniswap.cns.eth",
  "categoryRoot": "uniswap.defi.cns.eth",
  "subcategoryRoot": "uniswap.defi.amm.cns.eth",
  "contractRoot": "uniswap.defi.amm.router.cns.eth",
  "domainHierarchy": {
    "level": 4,
    "parent": "uniswap.defi.amm.cns.eth",
    "children": []
  },
  "traits": {
    "inheritedFrom": [
      "uniswap.defi.amm.cns.eth",
      "uniswap.defi.cns.eth",
      "uniswap.cns.eth",
      "cns.eth"
    ],
    "contractSpecific": {
      "role": "router",
      "contractType": "swap",
      "validationRules": {
        "rolePattern": "^router$"
      }
    }
  }
}
```

## Benefits

### 1. **Prevents Redundant Data**

- Fields are inherited from parent levels
- No duplication of common properties
- Automatic deduplication during validation

### 2. **Maintains Consistency**

- Validation rules are inherited and merged
- Naming conventions are enforced across levels
- Schema compliance is maintained

### 3. **Enables Scalability**

- New projects can inherit from existing schemas
- Categories and subcategories can be extended
- Contract-specific rules can be added without affecting parents

### 4. **Provides Flexibility**

- Fields can be overridden at child levels
- Custom validation rules can be added
- Inheritance can be disabled for specific fields

### 5. **Ensures Data Integrity**

- Circular inheritance is detected and prevented
- Missing required fields are flagged
- Redundant fields are identified and removed

## Integration with Existing System

### CLI Integration

The hierarchical schema system integrates with the existing CLI:

```bash
# Use hierarchical schemas in wizard
node bin/ens-naming.mjs wizard --schema hierarchical

# Validate against hierarchical schema
node bin/ens-naming.mjs validate-name uniswap.defi.amm.router.cns.eth defi --schema hierarchical

# Generate metadata with inheritance
node bin/ens-naming.mjs generate-metadata uniswap uniswap defi router v1-0-0 1 --schema hierarchical
```

### Migration Support

Existing metadata can be migrated to use hierarchical schemas:

```bash
# Migrate to hierarchical schema
node bin/migrate-schema.mjs metadata.json --schema hierarchical

# Validate inheritance after migration
node bin/schema-inheritance.mjs validate uniswap.defi.amm.cns.eth metadata.json
```

### QA Integration

QA reports can include inheritance analysis:

```bash
# Generate QA report with inheritance analysis
node bin/ens-naming.mjs qa-report metadata.json --include-inheritance

# Check for redundant fields
node bin/ens-naming.mjs check metadata.json --check-redundancy
```

This hierarchical schema system provides a robust foundation for ENS metadata management while preventing redundant data and maintaining consistency across the entire domain hierarchy.
