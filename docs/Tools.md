# Local Tools

## Overview

This document describes the local tools available in the ENS Metadata Tools system, including their functionality, usage examples, and integration patterns.

## Core CLI Tools

### Metadata Generator (`bin/metadata-generator.mjs`)

**Purpose**: Generate standardized metadata templates for different contract categories and types.

**Functionality**:

- Template-based metadata generation
- Variable interpolation
- Schema validation
- Multiple output formats
- Batch generation

**Usage Examples**:

```bash
# Generate DeFi AMM metadata
metadata-generator --category defi --type amm --name Uniswap --version 3

# Generate DAO governance metadata
metadata-generator --category dao --type governor --name ENS --token ENS

# Generate token metadata
metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000

# Batch generation
metadata-generator --category defi --all --output defi-templates/
```

**Key Functions**:

- `generateMetadata(category, type, variables)` - Main generation function
- `generateAllTemplates(category, variables)` - Generate all templates for category
- `interpolateTemplate(template, variables)` - Variable interpolation
- `saveMetadataToFile(metadata, filename)` - Save to file system

### Naming Validator (`bin/naming-validator.mjs`)

**Purpose**: Validate ENS naming conventions and metadata compliance.

**Functionality**:

- Domain format validation
- Category-specific validation
- Metadata compliance checking
- QA standards validation
- Cross-reference validation

**Usage Examples**:

```bash
# Basic validation
ens-validator uniswap.amm.eth defi

# Strict validation with QA
ens-validator uniswap.amm.eth defi --strict --qa

# Metadata validation
ens-validator uniswap.amm.eth defi --metadata uniswap-metadata.json

# Batch validation
ens-validator --batch domains.txt --category defi --output batch-report.json
```

**Key Functions**:

- `validateDomain(domain, category, options)` - Main validation function
- `validateFormat(domain)` - Basic domain format validation
- `validateCategory(domain, category, strict)` - Category-specific validation
- `validateMetadata(metadata, category)` - Metadata compliance validation
- `validateQAStandards(metadata, options)` - QA standards validation

### Subdomain Planner (`bin/subdomain-planner.mjs`)

**Purpose**: Plan and organize subdomain structures for protocols.

**Functionality**:

- Interactive planning mode
- Template-based planning
- Hierarchy generation
- Registration script creation
- Cross-reference management

**Usage Examples**:

```bash
# Interactive planning
subdomain-planner --interactive

# Direct planning
subdomain-planner --domain uniswap.eth --category defi --type amm --output uniswap-plan.json

# Template-based planning
subdomain-planner --template defi-amm.json --variables uniswap-vars.json

# Plan validation
subdomain-planner --domain uniswap.eth --category defi --type amm --validate
```

**Key Functions**:

- `generatePlan(protocol, category, type, variables)` - Main planning function
- `generateSubdomainMetadata(subdomain, baseMetadata, variables)` - Metadata generation
- `generateRegistrationScript(plan)` - Shell script generation
- `generateCrossReferences(plan)` - Cross-reference mapping
- `savePlan(plan, outputPath)` - Plan persistence

### Security Analyzer (`bin/security-analyzer.mjs`)

**Purpose**: Analyze ENS domain security posture and identify vulnerabilities.

**Functionality**:

- Name Wrapper fuse analysis
- Registration expiry validation
- Resolver security assessment
- Identity verification checking
- Security scoring and grading

**Usage Examples**:

```bash
# Basic security analysis
security-analyzer vitalik.eth

# Comprehensive analysis
security-analyzer vitalik.eth --check-fuses --check-verification --check-expiry --check-resolver

# Batch analysis
security-analyzer --batch domains.txt --output batch-security-report.json

# Security validation
security-analyzer vitalik.eth --validate
```

**Key Functions**:

- `analyzeSecurity(domain, options)` - Main security analysis function
- `analyzeFuses(domain)` - Name Wrapper fuse analysis
- `analyzeExpiry(domain)` - Registration expiry validation
- `analyzeResolver(domain)` - Resolver security assessment
- `analyzeVerification(domain)` - Identity verification check

### ENS Contract Operations (`bin/ens-contract.mjs`)

**Purpose**: Perform ENS contract operations including registration and management.

**Functionality**:

- Subdomain registration
- Resolver configuration
- Record setting
- Name Wrapper operations
- Batch operations

**Usage Examples**:

```bash
# Register subdomain
ens-contract register router.uniswap.defi.eth --owner 0x1234... --resolver 0x231b...

# Set resolver
ens-contract set-resolver domain.eth --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15

# Set fuses
ens-contract set-fuses domain.eth --fuses CANNOT_UNWRAP,CANNOT_BURN_FUSES

# Batch registration
ens-contract batch-register subdomains.json

# Gas estimation
ens-contract estimate-gas register router.uniswap.defi.eth --owner 0x1234...
```

**Key Functions**:

- `register(name, options)` - Subdomain registration
- `setResolver(name, address)` - Resolver configuration
- `setFuses(name, fuses)` - Name Wrapper fuse management
- `setRecord(name, options)` - Record setting operations
- `getInfo(name)` - Domain information retrieval

### Cache Browser (`bin/cache-browser.mjs`)

**Purpose**: Interactive browser for exploring resolver cache data.

**Functionality**:

- Interactive command interface
- Domain search and filtering
- Statistical analysis
- Data export capabilities
- Cache management

**Usage Examples**:

```bash
# Interactive browser
ens-cache-browser --interactive

# Domain-specific browser
ens-cache-browser --domain uniswap.eth --verbose

# Category filtering
ens-cache-browser --category defi --list

# Data export
ens-cache-browser --export json --output cache-data.json

# Cache management
ens-cache-browser --refresh
ens-cache-browser --validate
ens-cache-browser --cleanup
```

**Key Functions**:

- `loadCache()` - Cache data loading and parsing
- `searchDomains(term)` - Domain search functionality
- `listEntries(page)` - Paginated entry listing
- `showStats()` - Cache statistics and analytics
- `exportData(format)` - Data export capabilities

### EVM Metadata Operations (`bin/evmd.js`)

**Purpose**: EVM-specific metadata operations and contract analysis.

**Functionality**:

- Contract analysis
- Metadata generation
- Function probing
- Standard validation
- Network support

**Usage Examples**:

```bash
# Contract analysis
evmd analyze 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20

# Metadata generation
evmd generate metadata --type erc20 --address 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984

# Function probing
evmd probe 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --functions name,symbol,decimals

# Standard validation
evmd validate 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --standard ERC20
```

**Key Functions**:

- `analyzeContract(address, contractType)` - Contract analysis
- `generateMetadata(type, options)` - Metadata generation
- `probeContract(address, functions)` - Function probing
- `validateContract(address, standard)` - Standard validation

## Supporting Tools

### QA Report Generator (`bin/qa-report-generator.mjs`)

**Purpose**: Generate QA reports for metadata compliance.

**Functionality**:

- Compliance scoring
- Issue identification
- Recommendation generation
- Report formatting
- Batch processing

**Usage Examples**:

```bash
# Generate QA report
qa-report-generator --metadata uniswap-metadata.json

# Batch QA reports
qa-report-generator --batch metadata/ --output qa-reports/

# All metadata QA
qa-report-generator --all
```

**Key Functions**:

- `generateQAReport(metadata, options)` - Main QA report generation
- `scoreCompliance(metadata, standards)` - Compliance scoring
- `identifyIssues(metadata, rules)` - Issue identification
- `generateRecommendations(issues)` - Recommendation generation

### Cross-Reference Validator (`bin/cross-reference-validator.mjs`)

**Purpose**: Validate cross-references between metadata files.

**Functionality**:

- Cross-reference validation
- Consistency checking
- Error reporting
- Fix suggestions
- Batch processing

**Usage Examples**:

```bash
# Single file validation
cross-reference-validator --metadata uniswap-metadata.json

# Batch validation
cross-reference-validator --batch metadata/

# Specific cross-reference check
cross-reference-validator --check factory.uniswap.eth router.uniswap.eth
```

**Key Functions**:

- `validateCrossReferences(metadata, options)` - Main validation function
- `checkConsistency(references)` - Consistency checking
- `reportErrors(errors)` - Error reporting
- `suggestFixes(errors)` - Fix suggestions

### Schema Validator (`bin/schema-validator.mjs`)

**Purpose**: Validate metadata against JSON schemas.

**Functionality**:

- Schema validation
- Error reporting
- Fix suggestions
- Batch processing
- Multiple schema support

**Usage Examples**:

```bash
# Single file validation
schema-validator --metadata uniswap-metadata.json

# Batch validation
schema-validator --batch metadata/

# Specific schema validation
schema-validator --metadata uniswap-metadata.json --schema defi-amm-schema.json
```

**Key Functions**:

- `validateSchema(metadata, schema)` - Main validation function
- `reportSchemaErrors(errors)` - Error reporting
- `suggestSchemaFixes(errors)` - Fix suggestions
- `loadSchema(schemaPath)` - Schema loading

### Metadata Filler (`bin/metadata-filler.mjs`)

**Purpose**: Fill metadata templates with real contract data.

**Functionality**:

- Template filling
- Data validation
- Error handling
- Progress tracking
- Batch processing

**Usage Examples**:

```bash
# Fill single template
metadata-filler --template uniswap-template.json --data contract-data.json

# Fill from plan
metadata-filler --plan ./plans/uniswap

# Batch filling
metadata-filler --batch templates/ --data contract-data/
```

**Key Functions**:

- `fillTemplate(template, data)` - Main filling function
- `validateFilledData(data)` - Data validation
- `handleErrors(errors)` - Error handling
- `trackProgress(progress)` - Progress tracking

### Edge Case Validator (`bin/edge-case-validator.mjs`)

**Purpose**: Validate edge cases and special scenarios.

**Functionality**:

- Edge case testing
- Special scenario validation
- Error condition testing
- Performance testing
- Stress testing

**Usage Examples**:

```bash
# Edge case validation
edge-case-validator --scenarios edge-cases.json

# Performance testing
edge-case-validator --performance --iterations 1000

# Stress testing
edge-case-validator --stress --load 100
```

**Key Functions**:

- `validateEdgeCases(scenarios)` - Main validation function
- `testPerformance(iterations)` - Performance testing
- `testStress(load)` - Stress testing
- `reportResults(results)` - Results reporting

## Prober Tools

### Multicall Prober (`tools/prober/probe-multicall.js`)

**Purpose**: Probe multiple contracts using multicall for efficient batch operations.

**Functionality**:

- Batch contract function calls
- Support for ERC-20, ERC-721, and ENS contracts
- Efficient multicall implementation
- Results formatting and export
- Network support

**Usage Examples**:

```bash
# Single contract probe
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20

# Multiple contract probe
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 0x1234... --type erc20

# Batch probe with output
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --output results.json
```

**Key Functions**:

- `probeContract(address, contractType)` - Single contract probing
- `probeContracts(addresses, contractType)` - Batch contract probing
- `displayResults(results)` - Results formatting and display
- `exportResults(results, format)` - Results export

### Resolver Name Lookup (`tools/prober/lookup-resolver-names.js`)

**Purpose**: Lookup ENS names by resolver address.

**Functionality**:

- Resolver-based name discovery
- Batch name resolution
- Results filtering and sorting
- Export capabilities
- Performance optimization

**Usage Examples**:

```bash
# Single resolver lookup
node tools/prober/lookup-resolver-names.js --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15

# Batch resolver lookup
node tools/prober/lookup-resolver-names.js --resolvers resolvers.txt

# Lookup with output
node tools/prober/lookup-resolver-names.js --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15 --output names.json
```

**Key Functions**:

- `lookupNamesByResolver(resolver, options)` - Main lookup function
- `batchLookup(resolvers, options)` - Batch lookup
- `filterResults(results, criteria)` - Results filtering
- `exportResults(results, format)` - Results export

## Scripts

### Analysis Scripts

#### Resolver Analysis (`scripts/analyze-resolvers.cjs`)

**Purpose**: Analyze resolver addresses and their usage patterns.

**Functionality**:

- Resolver address analysis
- Usage pattern identification
- Performance metrics
- Security assessment
- Statistical analysis

**Usage Examples**:

```bash
# Analyze resolvers
node scripts/analyze-resolvers.cjs

# Analyze with output
node scripts/analyze-resolvers.cjs --output resolver-analysis.json

# Analyze specific resolvers
node scripts/analyze-resolvers.cjs --resolvers resolvers.txt
```

#### Real Resolver Extraction (`scripts/get-real-resolvers.cjs`)

**Purpose**: Extract real resolver addresses from ENS data.

**Functionality**:

- Real resolver discovery
- Address validation
- Usage statistics
- Export capabilities
- Data cleaning

**Usage Examples**:

```bash
# Extract real resolvers
node scripts/get-real-resolvers.cjs

# Extract with validation
node scripts/get-real-resolvers.cjs --validate

# Extract with output
node scripts/get-real-resolvers.cjs --output real-resolvers.json
```

#### ENS Resolver Query (`scripts/query-ens-resolvers.cjs`)

**Purpose**: Query ENS resolvers for domain information.

**Functionality**:

- Domain information retrieval
- Resolver status checking
- Performance monitoring
- Error handling
- Batch processing

**Usage Examples**:

```bash
# Query resolvers
node scripts/query-ens-resolvers.cjs

# Query specific domains
node scripts/query-ens-resolvers.cjs --domains domains.txt

# Query with output
node scripts/query-ens-resolvers.cjs --output query-results.json
```

### Migration Scripts

#### Schema Migration (`bin/migrate-schema.mjs`)

**Purpose**: Migrate existing metadata to new schema versions.

**Functionality**:

- Schema version migration
- Data transformation
- Validation during migration
- Rollback capabilities
- Batch migration

**Usage Examples**:

```bash
# Migrate single file
node bin/migrate-schema.mjs metadata.json --schema hierarchical

# Batch migration
node bin/migrate-schema.mjs --batch metadata/ --schema hierarchical

# Migration with validation
node bin/migrate-schema.mjs metadata.json --schema hierarchical --validate
```

#### Schema Inheritance (`bin/schema-inheritance.mjs`)

**Purpose**: Manage schema inheritance and deduplication.

**Functionality**:

- Inheritance chain management
- Field deduplication
- Consistency validation
- Report generation
- Optimization

**Usage Examples**:

```bash
# Schema inheritance report
node bin/schema-inheritance.mjs report uniswap.defi.amm.cns.eth

# Schema optimization
node bin/schema-inheritance.mjs optimize --schema defi-amm-schema.json

# Schema validation
node bin/schema-inheritance.mjs validate --schema defi-amm-schema.json
```

### Documentation Scripts

#### CLI Documentation Generator (`scripts/generate-cli-docs.mjs`)

**Purpose**: Generate CLI documentation from code.

**Functionality**:

- Documentation generation
- Command reference creation
- Example generation
- Format conversion
- Automation

**Usage Examples**:

```bash
# Generate CLI docs
node scripts/generate-cli-docs.mjs

# Generate with specific format
node scripts/generate-cli-docs.mjs --format markdown

# Generate with examples
node scripts/generate-cli-docs.mjs --include-examples
```

#### Domain Update Script (`scripts/update-domains.js`)

**Purpose**: Update domain information and configurations.

**Functionality**:

- Domain information updates
- Configuration management
- Change tracking
- Validation
- Batch processing

**Usage Examples**:

```bash
# Update domains
node scripts/update-domains.js --domains domains.json

# Update with validation
node scripts/update-domains.js --domains domains.json --validate

# Update with output
node scripts/update-domains.js --domains domains.json --output updated-domains.json
```

## Testing Tools

### Unit Tests (`tests/unit/`)

**Purpose**: Unit tests for individual components.

**Functionality**:

- Component testing
- Mock data generation
- Assertion validation
- Coverage reporting
- Performance testing

**Usage Examples**:

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="validation"
```

### Integration Tests (`tests/integration/`)

**Purpose**: Integration tests for component interactions.

**Functionality**:

- Integration testing
- End-to-end validation
- Performance testing
- Error scenario testing
- Network testing

**Usage Examples**:

```bash
# Run integration tests
npm run test:integration

# Run with network
npm run test:integration -- --network mainnet

# Run specific integration test
npm run test:integration -- --testNamePattern="metadata"
```

### QA Standards Tests (`test/qa-standards-simple.test.js`)

**Purpose**: Simple QA standards testing.

**Functionality**:

- Basic QA validation
- Test case execution
- Result reporting
- Error handling
- Compliance checking

**Usage Examples**:

```bash
# Run QA tests
npm run test:qa

# Run with verbose output
npm run test:qa -- --verbose

# Run specific QA test
npm run test:qa -- --testNamePattern="compliance"
```

## Build Tools

### Build Scripts (`scripts/build/`)

**Purpose**: Build and deployment scripts.

**Functionality**:

- Project building
- Dependency management
- Asset optimization
- Deployment automation
- Version management

**Usage Examples**:

```bash
# Build project
npm run build

# Build with optimization
npm run build -- --optimize

# Build for production
npm run build -- --production
```

### Deployment Scripts (`scripts/deployment/deploy.js`)

**Purpose**: Deployment automation.

**Functionality**:

- Environment deployment
- Configuration management
- Health checks
- Rollback capabilities
- Monitoring

**Usage Examples**:

```bash
# Deploy to staging
node scripts/deployment/deploy.js --env staging

# Deploy to production
node scripts/deployment/deploy.js --env production

# Deploy with rollback
node scripts/deployment/deploy.js --env production --rollback
```

## Utility Tools

### Error Checker (`scripts/error-checker.sh`)

**Purpose**: Check for errors in the codebase.

**Functionality**:

- Error detection
- Linting
- Type checking
- Security scanning
- Quality assurance

**Usage Examples**:

```bash
# Check for errors
./scripts/error-checker.sh

# Check with fix
./scripts/error-checker.sh --fix

# Check specific files
./scripts/error-checker.sh --files src/
```

### CLI Options Tester (`scripts/test-cli-options.sh`)

**Purpose**: Test CLI options and configurations.

**Functionality**:

- Option testing
- Configuration validation
- Error handling
- Performance testing
- Compatibility testing

**Usage Examples**:

```bash
# Test CLI options
./scripts/test-cli-options.sh

# Test specific command
./scripts/test-cli-options.sh --command "ens-validator"

# Test with verbose output
./scripts/test-cli-options.sh --verbose
```

## Integration Patterns

### Tool Chaining

```bash
# Metadata generation → Validation → Planning → Registration
metadata-generator --category defi --type amm | \
ens-validator --category defi --strict | \
subdomain-planner --interactive | \
ens-contract execute-plan
```

### Batch Processing

```bash
# Batch validation → Batch analysis → Batch reporting
ens-validator --batch domains.txt | \
security-analyzer --batch | \
qa-report-generator --all
```

### Parallel Processing

```bash
# Parallel validation and analysis
ens-validator uniswap.eth defi & \
security-analyzer uniswap.eth & \
wait
```

## Next Steps

- [Results and Workflows](Results-and-Workflows.md) - How to use tool results
- [Interconnectivity](Interconnectivity.md) - How tools work together
- [Architecture](Architecture.md) - System architecture
- [API Documentation](API/) - Programmatic usage
