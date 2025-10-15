# Bin Tools Reference

## Overview

This document provides a technical analysis of the functions and functionality in the `bin/` directory tools.

## Core CLI Tools

### `bin/metadata-generator.mjs`

**Purpose**: Generate standardized metadata templates for different contract categories and types.

**Key Functions**:

#### `generateMetadata(category, type, variables)`

- **Purpose**: Main metadata generation function
- **Parameters**:
  - `category` (string): Protocol category (defi, dao, infrastructure, tokens, gaming, social, rwa, privacy, developer, analytics)
  - `type` (string): Protocol type (amm, lending, governor, erc20, etc.)
  - `variables` (object): Template variables for interpolation
- **Returns**: Generated metadata object
- **Logic**: Loads appropriate template, interpolates variables, validates against schema

#### `generateAllTemplates(category, variables)`

- **Purpose**: Generate all templates for a specific category
- **Parameters**:
  - `category` (string): Protocol category
  - `variables` (object): Template variables
- **Returns**: Array of generated metadata objects
- **Logic**: Iterates through all types in category, generates metadata for each

#### `interpolateTemplate(template, variables)`

- **Purpose**: Variable interpolation in templates
- **Parameters**:
  - `template` (object): Template object
  - `variables` (object): Variables to interpolate
- **Returns**: Interpolated template
- **Logic**: Recursively replaces `{{variable}}` placeholders with actual values

#### `saveMetadataToFile(metadata, filename)`

- **Purpose**: Save metadata to file system
- **Parameters**:
  - `metadata` (object): Metadata to save
  - `filename` (string): Output filename
- **Returns**: Promise<void>
- **Logic**: Validates metadata, formats JSON, writes to file

**Template Categories Supported**:

- DeFi: AMM, lending, stablecoin protocols
- DAO: Governance, treasury management
- Infrastructure: Oracles, bridges, RPC providers
- Tokens: ERC-20, ERC-721, governance tokens
- Gaming: NFT games, marketplaces, virtual worlds
- Social: Platforms, messaging, content systems
- RWA: Real estate, commodities, securities
- Privacy: Mixers, security tools, encryption
- Developer: Frameworks, libraries, testing tools
- Analytics: Indexers, dashboards, data platforms

### `bin/naming-validator.mjs`

**Purpose**: Validate ENS naming conventions and metadata compliance.

**Key Functions**:

#### `validateDomain(domain, category, options)`

- **Purpose**: Main validation function
- **Parameters**:
  - `domain` (string): ENS domain to validate
  - `category` (string): Expected category
  - `options` (object): Validation options
- **Returns**: Validation result object
- **Logic**: Performs format, category, metadata, and QA validation

#### `validateFormat(domain)`

- **Purpose**: Basic domain format validation
- **Parameters**:
  - `domain` (string): Domain to validate
- **Returns**: Format validation result
- **Logic**: Checks domain structure, character restrictions, length limitations

#### `validateCategory(domain, category, strict)`

- **Purpose**: Category-specific validation
- **Parameters**:
  - `domain` (string): Domain to validate
  - `category` (string): Expected category
  - `strict` (boolean): Strict validation mode
- **Returns**: Category validation result
- **Logic**: Applies category-specific rules and naming conventions

#### `validateMetadata(metadata, category)`

- **Purpose**: Metadata compliance validation
- **Parameters**:
  - `metadata` (object): Metadata to validate
  - `category` (string): Category for validation
- **Returns**: Metadata validation result
- **Logic**: Validates required fields, data types, schema compliance

#### `validateQAStandards(metadata, options)`

- **Purpose**: QA standards validation
- **Parameters**:
  - `metadata` (object): Metadata to validate
  - `options` (object): QA validation options
- **Returns**: QA validation result
- **Logic**: Checks QA compliance, generates recommendations

**Validation Rules**:

- Format validation: Domain structure, character restrictions
- Category compliance: Pattern matching, naming conventions
- Metadata validation: Required fields, data types
- Cross-reference validation: Consistency checks
- Security validation: Proxy patterns, naming conflicts

### `bin/subdomain-planner.mjs`

**Purpose**: Plan and organize subdomain structures for protocols.

**Key Functions**:

#### `generatePlan(protocol, category, type, variables)`

- **Purpose**: Main planning function
- **Parameters**:
  - `protocol` (string): Protocol name
  - `category` (string): Protocol category
  - `type` (string): Protocol type
  - `variables` (object): Planning variables
- **Returns**: Subdomain plan object
- **Logic**: Generates hierarchical subdomain structure based on category and type

#### `generateSubdomainMetadata(subdomain, baseMetadata, variables)`

- **Purpose**: Generate metadata for individual subdomains
- **Parameters**:
  - `subdomain` (object): Subdomain information
  - `baseMetadata` (object): Base metadata template
  - `variables` (object): Variables for customization
- **Returns**: Subdomain metadata object
- **Logic**: Customizes base metadata for specific subdomain

#### `generateRegistrationScript(plan)`

- **Purpose**: Generate shell script for subdomain registration
- **Parameters**:
  - `plan` (object): Subdomain plan
- **Returns**: Shell script string
- **Logic**: Creates executable script with ENS contract commands

#### `generateCrossReferences(plan)`

- **Purpose**: Generate cross-reference mappings
- **Parameters**:
  - `plan` (object): Subdomain plan
- **Returns**: Cross-reference object
- **Logic**: Maps relationships between subdomains

#### `savePlan(plan, outputPath)`

- **Purpose**: Save plan to file system
- **Parameters**:
  - `plan` (object): Plan to save
  - `outputPath` (string): Output path
- **Returns**: Promise<void>
- **Logic**: Saves plan and related files to specified path

**Planning Features**:

- Interactive category selection
- Hierarchical subdomain structures
- Metadata generation for each subdomain
- Registration script creation
- Cross-reference management

### `bin/security-analyzer.mjs`

**Purpose**: Analyze ENS domain security posture and identify vulnerabilities.

**Key Functions**:

#### `analyzeSecurity(domain, options)`

- **Purpose**: Main security analysis function
- **Parameters**:
  - `domain` (string): Domain to analyze
  - `options` (object): Analysis options
- **Returns**: Security analysis result
- **Logic**: Performs fuse, expiry, resolver, and verification analysis

#### `analyzeFuses(domain)`

- **Purpose**: Name Wrapper fuse analysis
- **Parameters**:
  - `domain` (string): Domain to analyze
- **Returns**: Fuse analysis result
- **Logic**: Checks fuse configuration, identifies security implications

#### `analyzeExpiry(domain)`

- **Purpose**: Registration expiry validation
- **Parameters**:
  - `domain` (string): Domain to analyze
- **Returns**: Expiry analysis result
- **Logic**: Checks registration status, expiry date, renewal requirements

#### `analyzeResolver(domain)`

- **Purpose**: Resolver security assessment
- **Parameters**:
  - `domain` (string): Domain to analyze
- **Returns**: Resolver analysis result
- **Logic**: Assesses resolver configuration, identifies vulnerabilities

#### `analyzeVerification(domain)`

- **Purpose**: Identity verification check
- **Parameters**:
  - `domain` (string): Domain to analyze
- **Returns**: Verification analysis result
- **Logic**: Checks identity verification status, providers, levels

**Security Checks**:

- Fuse analysis: Critical and recommended fuses
- Expiry validation: Registration status and timing
- Resolver security: Vulnerability assessment
- Identity verification: Trust and authenticity
- Overall scoring: Weighted security grade

### `bin/ens-contract.mjs`

**Purpose**: Perform ENS contract operations including registration and management.

**Key Functions**:

#### `register(name, options)`

- **Purpose**: Subdomain registration
- **Parameters**:
  - `name` (string): Domain name to register
  - `options` (object): Registration options
- **Returns**: Registration result
- **Logic**: Executes ENS registration transaction

#### `setResolver(name, address)`

- **Purpose**: Resolver configuration
- **Parameters**:
  - `name` (string): Domain name
  - `address` (string): Resolver address
- **Returns**: Transaction result
- **Logic**: Sets resolver address for domain

#### `setFuses(name, fuses)`

- **Purpose**: Name Wrapper fuse management
- **Parameters**:
  - `name` (string): Domain name
  - `fuses` (array): Fuses to set
- **Returns**: Transaction result
- **Logic**: Sets Name Wrapper fuses for enhanced security

#### `setRecord(name, options)`

- **Purpose**: Record setting operations
- **Parameters**:
  - `name` (string): Domain name
  - `options` (object): Record options
- **Returns**: Transaction result
- **Logic**: Sets ENS records (address, text, content hash)

#### `getInfo(name)`

- **Purpose**: Domain information retrieval
- **Parameters**:
  - `name` (string): Domain name
- **Returns**: Domain information object
- **Logic**: Retrieves domain details from ENS contracts

**Operations Supported**:

- Subdomain registration with ownership
- Resolver address configuration
- Name Wrapper fuse management
- Address, text, and content hash records
- Reverse record management
- Domain information queries

### `bin/cache-browser.mjs`

**Purpose**: Interactive browser for exploring resolver cache data.

**Key Functions**:

#### `loadCache()`

- **Purpose**: Cache data loading and parsing
- **Parameters**: None
- **Returns**: Cache data object
- **Logic**: Loads and parses cache data from file system

#### `searchDomains(term)`

- **Purpose**: Domain search functionality
- **Parameters**:
  - `term` (string): Search term
- **Returns**: Search results array
- **Logic**: Searches cache data for matching domains

#### `listEntries(page)`

- **Purpose**: Paginated entry listing
- **Parameters**:
  - `page` (number): Page number
- **Returns**: Page of entries
- **Logic**: Returns paginated list of cache entries

#### `showStats()`

- **Purpose**: Cache statistics and analytics
- **Parameters**: None
- **Returns**: Statistics object
- **Logic**: Calculates and returns cache statistics

#### `exportData(format)`

- **Purpose**: Data export capabilities
- **Parameters**:
  - `format` (string): Export format (json, csv, html)
- **Returns**: Exported data
- **Logic**: Exports cache data in specified format

**Browser Features**:

- Interactive command interface
- Search and filtering capabilities
- Statistical analysis
- Data export (JSON/CSV)
- Detailed entry viewing

## Supporting Tools

### `bin/qa-report-generator.mjs`

**Purpose**: Generate QA reports for metadata compliance.

**Key Functions**:

#### `generateQAReport(metadata, options)`

- **Purpose**: Main QA report generation
- **Parameters**:
  - `metadata` (object): Metadata to analyze
  - `options` (object): QA options
- **Returns**: QA report object
- **Logic**: Analyzes metadata compliance, generates recommendations

#### `scoreCompliance(metadata, standards)`

- **Purpose**: Compliance scoring
- **Parameters**:
  - `metadata` (object): Metadata to score
  - `standards` (array): Standards to check
- **Returns**: Compliance score
- **Logic**: Calculates compliance score based on standards

#### `identifyIssues(metadata, rules)`

- **Purpose**: Issue identification
- **Parameters**:
  - `metadata` (object): Metadata to analyze
  - `rules` (array): Rules to check
- **Returns**: Issues array
- **Logic**: Identifies compliance issues and violations

#### `generateRecommendations(issues)`

- **Purpose**: Recommendation generation
- **Parameters**:
  - `issues` (array): Issues to address
- **Returns**: Recommendations array
- **Logic**: Generates actionable recommendations for issues

### `bin/cross-reference-validator.mjs`

**Purpose**: Validate cross-references between metadata files.

**Key Functions**:

#### `validateCrossReferences(metadata, options)`

- **Purpose**: Main cross-reference validation
- **Parameters**:
  - `metadata` (object): Metadata to validate
  - `options` (object): Validation options
- **Returns**: Validation result
- **Logic**: Validates cross-references between metadata files

#### `checkConsistency(references)`

- **Purpose**: Consistency checking
- **Parameters**:
  - `references` (object): Cross-references to check
- **Returns**: Consistency result
- **Logic**: Checks consistency of cross-references

#### `reportErrors(errors)`

- **Purpose**: Error reporting
- **Parameters**:
  - `errors` (array): Errors to report
- **Returns**: Error report
- **Logic**: Formats and reports validation errors

#### `suggestFixes(errors)`

- **Purpose**: Fix suggestions
- **Parameters**:
  - `errors` (array): Errors to fix
- **Returns**: Fix suggestions array
- **Logic**: Generates suggestions for fixing errors

### `bin/schema-validator.mjs`

**Purpose**: Validate metadata against JSON schemas.

**Key Functions**:

#### `validateSchema(metadata, schema)`

- **Purpose**: Main schema validation
- **Parameters**:
  - `metadata` (object): Metadata to validate
  - `schema` (object): Schema to validate against
- **Returns**: Validation result
- **Logic**: Validates metadata against JSON schema

#### `reportSchemaErrors(errors)`

- **Purpose**: Schema error reporting
- **Parameters**:
  - `errors` (array): Schema errors
- **Returns**: Error report
- **Logic**: Formats and reports schema validation errors

#### `suggestSchemaFixes(errors)`

- **Purpose**: Schema fix suggestions
- **Parameters**:
  - `errors` (array): Schema errors
- **Returns**: Fix suggestions array
- **Logic**: Generates suggestions for fixing schema errors

#### `loadSchema(schemaPath)`

- **Purpose**: Schema loading
- **Parameters**:
  - `schemaPath` (string): Path to schema file
- **Returns**: Schema object
- **Logic**: Loads and parses JSON schema from file

### `bin/metadata-filler.mjs`

**Purpose**: Fill metadata templates with real contract data.

**Key Functions**:

#### `fillTemplate(template, data)`

- **Purpose**: Main template filling
- **Parameters**:
  - `template` (object): Template to fill
  - `data` (object): Data to fill with
- **Returns**: Filled template
- **Logic**: Fills template with real contract data

#### `validateFilledData(data)`

- **Purpose**: Data validation
- **Parameters**:
  - `data` (object): Data to validate
- **Returns**: Validation result
- **Logic**: Validates filled data against schema

#### `handleErrors(errors)`

- **Purpose**: Error handling
- **Parameters**:
  - `errors` (array): Errors to handle
- **Returns**: Error handling result
- **Logic**: Handles and reports filling errors

#### `trackProgress(progress)`

- **Purpose**: Progress tracking
- **Parameters**:
  - `progress` (object): Progress information
- **Returns**: Progress tracking result
- **Logic**: Tracks and reports filling progress

### `bin/edge-case-validator.mjs`

**Purpose**: Validate edge cases and special scenarios.

**Key Functions**:

#### `validateEdgeCases(scenarios)`

- **Purpose**: Main edge case validation
- **Parameters**:
  - `scenarios` (array): Edge case scenarios
- **Returns**: Validation result
- **Logic**: Validates edge cases and special scenarios

#### `testPerformance(iterations)`

- **Purpose**: Performance testing
- **Parameters**:
  - `iterations` (number): Number of iterations
- **Returns**: Performance result
- **Logic**: Tests performance under various conditions

#### `testStress(load)`

- **Purpose**: Stress testing
- **Parameters**:
  - `load` (number): Load level
- **Returns**: Stress test result
- **Logic**: Tests system under stress conditions

#### `reportResults(results)`

- **Purpose**: Results reporting
- **Parameters**:
  - `results` (object): Test results
- **Returns**: Results report
- **Logic**: Formats and reports test results

## Migration Tools

### `bin/migrate-schema.mjs`

**Purpose**: Migrate existing metadata to new schema versions.

**Key Functions**:

#### `migrateSchema(metadata, targetSchema)`

- **Purpose**: Main schema migration
- **Parameters**:
  - `metadata` (object): Metadata to migrate
  - `targetSchema` (string): Target schema version
- **Returns**: Migrated metadata
- **Logic**: Migrates metadata to new schema version

#### `validateMigration(metadata, schema)`

- **Purpose**: Migration validation
- **Parameters**:
  - `metadata` (object): Migrated metadata
  - `schema` (object): Target schema
- **Returns**: Validation result
- **Logic**: Validates migrated metadata against target schema

#### `rollbackMigration(metadata, originalSchema)`

- **Purpose**: Migration rollback
- **Parameters**:
  - `metadata` (object): Metadata to rollback
  - `originalSchema` (string): Original schema version
- **Returns**: Rolled back metadata
- **Logic**: Rolls back metadata to original schema

### `bin/schema-inheritance.mjs`

**Purpose**: Manage schema inheritance and deduplication.

**Key Functions**:

#### `manageInheritance(schema, parentSchema)`

- **Purpose**: Schema inheritance management
- **Parameters**:
  - `schema` (object): Child schema
  - `parentSchema` (object): Parent schema
- **Returns**: Inherited schema
- **Logic**: Manages schema inheritance relationships

#### `deduplicateFields(schema)`

- **Purpose**: Field deduplication
- **Parameters**:
  - `schema` (object): Schema to deduplicate
- **Returns**: Deduplicated schema
- **Logic**: Removes duplicate fields from schema

#### `validateConsistency(schema)`

- **Purpose**: Consistency validation
- **Parameters**:
  - `schema` (object): Schema to validate
- **Returns**: Validation result
- **Logic**: Validates schema consistency

#### `generateReport(schema)`

- **Purpose**: Report generation
- **Parameters**:
  - `schema` (object): Schema to report on
- **Returns**: Schema report
- **Logic**: Generates schema analysis report

## Next Steps

- [Prober Tools](prober-tools.md) - Tools in `tools/prober/` directory
- [Scripts](scripts.md) - Scripts in `scripts/` directory
- [API Documentation](../API/) - Programmatic usage
- [Interconnectivity](../Interconnectivity.md) - How tools work together
