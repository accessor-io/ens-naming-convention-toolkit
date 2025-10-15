# Scripts Reference

## Overview

This document provides a technical analysis of the functions and functionality in the `scripts/` directory tools.

## Analysis Scripts

### `scripts/analyze-resolvers.cjs`

**Purpose**: Analyze resolver addresses and their usage patterns.

**Key Functions**:

#### `analyzeResolvers(options)`

- **Purpose**: Main resolver analysis function
- **Parameters**:
  - `options` (object): Analysis options
- **Returns**: Resolver analysis result
- **Logic**: Analyzes resolver addresses, usage patterns, and performance metrics

#### `extractResolverData(resolvers)`

- **Purpose**: Resolver data extraction
- **Parameters**:
  - `resolvers` (array): Resolver addresses to analyze
- **Returns**: Extracted resolver data
- **Logic**: Extracts data from resolver contracts and ENS registry

#### `analyzeUsagePatterns(data)`

- **Purpose**: Usage pattern analysis
- **Parameters**:
  - `data` (object): Resolver data
- **Returns**: Usage pattern analysis
- **Logic**: Analyzes usage patterns and identifies trends

#### `generateAnalysisReport(analysis)`

- **Purpose**: Analysis report generation
- **Parameters**:
  - `analysis` (object): Analysis result
- **Returns**: Analysis report
- **Logic**: Generates analysis report with findings and recommendations

**Usage Examples**:

```bash
# Analyze resolvers
node scripts/analyze-resolvers.cjs

# Analyze with output
node scripts/analyze-resolvers.cjs --output resolver-analysis.json

# Analyze specific resolvers
node scripts/analyze-resolvers.cjs --resolvers resolvers.txt
```

**Expected Output**:

```json
{
  "summary": {
    "totalResolvers": 150,
    "activeResolvers": 120,
    "inactiveResolvers": 30,
    "averageUsage": 85.5
  },
  "topResolvers": [
    {
      "address": "0x231b87e9f02df89ec136656ea28f2e0f443f9f15",
      "usage": 95.2,
      "domains": 1250,
      "type": "standard"
    }
  ],
  "patterns": {
    "mostCommon": "standard",
    "performance": "good",
    "recommendations": ["optimize", "monitor"]
  }
}
```

### `scripts/get-real-resolvers.cjs`

**Purpose**: Extract real resolver addresses from ENS data.

**Key Functions**:

#### `extractRealResolvers(options)`

- **Purpose**: Main extraction function
- **Parameters**:
  - `options` (object): Extraction options
- **Returns**: Real resolver addresses
- **Logic**: Extracts real resolver addresses from ENS registry and resolver contracts

#### `validateResolvers(resolvers)`

- **Purpose**: Resolver validation
- **Parameters**:
  - `resolvers` (array): Resolver addresses to validate
- **Returns**: Validation result
- **Logic**: Validates resolver addresses and their functionality

#### `filterActiveResolvers(resolvers)`

- **Purpose**: Active resolver filtering
- **Parameters**:
  - `resolvers` (array): Resolver addresses
- **Returns**: Active resolver addresses
- **Logic**: Filters out inactive or invalid resolvers

#### `exportResolvers(resolvers, format)`

- **Purpose**: Resolver export
- **Parameters**:
  - `resolvers` (array): Resolver addresses to export
  - `format` (string): Export format
- **Returns**: Exported data
- **Logic**: Exports resolver addresses in specified format

**Usage Examples**:

```bash
# Extract real resolvers
node scripts/get-real-resolvers.cjs

# Extract with validation
node scripts/get-real-resolvers.cjs --validate

# Extract with output
node scripts/get-real-resolvers.cjs --output real-resolvers.json
```

### `scripts/query-ens-resolvers.cjs`

**Purpose**: Query ENS resolvers for domain information.

**Key Functions**:

#### `queryResolvers(domains, options)`

- **Purpose**: Main query function
- **Parameters**:
  - `domains` (array): Domains to query
  - `options` (object): Query options
- **Returns**: Query results
- **Logic**: Queries ENS resolvers for domain information

#### `batchQuery(domains, batchSize)`

- **Purpose**: Batch query processing
- **Parameters**:
  - `domains` (array): Domains to query
  - `batchSize` (number): Batch size
- **Returns**: Batch query results
- **Logic**: Processes domain queries in batches for efficiency

#### `validateResults(results)`

- **Purpose**: Results validation
- **Parameters**:
  - `results` (array): Query results
- **Returns**: Validation result
- **Logic**: Validates query results for accuracy and completeness

#### `exportResults(results, format)`

- **Purpose**: Results export
- **Parameters**:
  - `results` (array): Results to export
  - `format` (string): Export format
- **Returns**: Exported data
- **Logic**: Exports query results in specified format

**Usage Examples**:

```bash
# Query resolvers
node scripts/query-ens-resolvers.cjs

# Query specific domains
node scripts/query-ens-resolvers.cjs --domains domains.txt

# Query with output
node scripts/query-ens-resolvers.cjs --output query-results.json
```

## Migration Scripts

### `scripts/migrate-schema.cjs`

**Purpose**: Migrate existing metadata to new schema versions.

**Key Functions**:

#### `migrateSchema(metadata, targetSchema)`

- **Purpose**: Main migration function
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

#### `batchMigration(metadataFiles, targetSchema)`

- **Purpose**: Batch migration
- **Parameters**:
  - `metadataFiles` (array): Metadata files to migrate
  - `targetSchema` (string): Target schema version
- **Returns**: Batch migration results
- **Logic**: Migrates multiple metadata files in batch

**Usage Examples**:

```bash
# Migrate single file
node scripts/migrate-schema.cjs metadata.json --schema hierarchical

# Batch migration
node scripts/migrate-schema.cjs --batch metadata/ --schema hierarchical

# Migration with validation
node scripts/migrate-schema.cjs metadata.json --schema hierarchical --validate
```

### `scripts/schema-inheritance.cjs`

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

**Usage Examples**:

```bash
# Schema inheritance report
node scripts/schema-inheritance.cjs report uniswap.defi.amm.cns.eth

# Schema optimization
node scripts/schema-inheritance.cjs optimize --schema defi-amm-schema.json

# Schema validation
node scripts/schema-inheritance.cjs validate --schema defi-amm-schema.json
```

## Documentation Scripts

### `scripts/generate-cli-docs.mjs`

**Purpose**: Generate CLI documentation from code.

**Key Functions**:

#### `generateCLIDocs(options)`

- **Purpose**: Main documentation generation
- **Parameters**:
  - `options` (object): Generation options
- **Returns**: Generated documentation
- **Logic**: Generates CLI documentation from code analysis

#### `extractCommands(sourceFiles)`

- **Purpose**: Command extraction
- **Parameters**:
  - `sourceFiles` (array): Source files to analyze
- **Returns**: Extracted commands
- **Logic**: Extracts CLI commands from source code

#### `generateExamples(commands)`

- **Purpose**: Example generation
- **Parameters**:
  - `commands` (array): Commands to generate examples for
- **Returns**: Generated examples
- **Logic**: Generates usage examples for CLI commands

#### `formatDocumentation(docs, format)`

- **Purpose**: Documentation formatting
- **Parameters**:
  - `docs` (object): Documentation to format
  - `format` (string): Output format
- **Returns**: Formatted documentation
- **Logic**: Formats documentation in specified output format

**Usage Examples**:

```bash
# Generate CLI docs
node scripts/generate-cli-docs.mjs

# Generate with specific format
node scripts/generate-cli-docs.mjs --format markdown

# Generate with examples
node scripts/generate-cli-docs.mjs --include-examples
```

### `scripts/update-domains.js`

**Purpose**: Update domain information and configurations.

**Key Functions**:

#### `updateDomains(domains, options)`

- **Purpose**: Main update function
- **Parameters**:
  - `domains` (array): Domains to update
  - `options` (object): Update options
- **Returns**: Update results
- **Logic**: Updates domain information and configurations

#### `validateUpdates(updates)`

- **Purpose**: Update validation
- **Parameters**:
  - `updates` (array): Updates to validate
- **Returns**: Validation result
- **Logic**: Validates updates for accuracy and compliance

#### `trackChanges(updates)`

- **Purpose**: Change tracking
- **Parameters**:
  - `updates` (array): Updates to track
- **Returns**: Change tracking result
- **Logic**: Tracks changes made to domains

#### `exportUpdates(updates, format)`

- **Purpose**: Update export
- **Parameters**:
  - `updates` (array): Updates to export
  - `format` (string): Export format
- **Returns**: Exported data
- **Logic**: Exports updates in specified format

**Usage Examples**:

```bash
# Update domains
node scripts/update-domains.js --domains domains.json

# Update with validation
node scripts/update-domains.js --domains domains.json --validate

# Update with output
node scripts/update-domains.js --domains domains.json --output updated-domains.json
```

## Build Scripts

### `scripts/build/build.js`

**Purpose**: Build and deployment scripts.

**Key Functions**:

#### `buildProject(options)`

- **Purpose**: Main build function
- **Parameters**:
  - `options` (object): Build options
- **Returns**: Build result
- **Logic**: Builds project with specified options

#### `optimizeAssets(assets)`

- **Purpose**: Asset optimization
- **Parameters**:
  - `assets` (array): Assets to optimize
- **Returns**: Optimized assets
- **Logic**: Optimizes project assets for production

#### `validateBuild(build)`

- **Purpose**: Build validation
- **Parameters**:
  - `build` (object): Build to validate
- **Returns**: Validation result
- **Logic**: Validates build for correctness and completeness

#### `deployBuild(build, environment)`

- **Purpose**: Build deployment
- **Parameters**:
  - `build` (object): Build to deploy
  - `environment` (string): Target environment
- **Returns**: Deployment result
- **Logic**: Deploys build to specified environment

**Usage Examples**:

```bash
# Build project
node scripts/build/build.js

# Build with optimization
node scripts/build/build.js --optimize

# Build for production
node scripts/build/build.js --production
```

### `scripts/deployment/deploy.js`

**Purpose**: Deployment automation.

**Key Functions**:

#### `deployToEnvironment(environment, options)`

- **Purpose**: Main deployment function
- **Parameters**:
  - `environment` (string): Target environment
  - `options` (object): Deployment options
- **Returns**: Deployment result
- **Logic**: Deploys to specified environment

#### `configureEnvironment(environment)`

- **Purpose**: Environment configuration
- **Parameters**:
  - `environment` (string): Environment to configure
- **Returns**: Configuration result
- **Logic**: Configures environment for deployment

#### `performHealthChecks(environment)`

- **Purpose**: Health check performance
- **Parameters**:
  - `environment` (string): Environment to check
- **Returns**: Health check results
- **Logic**: Performs health checks on deployed environment

#### `rollbackDeployment(environment)`

- **Purpose**: Deployment rollback
- **Parameters**:
  - `environment` (string): Environment to rollback
- **Returns**: Rollback result
- **Logic**: Rolls back deployment to previous version

**Usage Examples**:

```bash
# Deploy to staging
node scripts/deployment/deploy.js --env staging

# Deploy to production
node scripts/deployment/deploy.js --env production

# Deploy with rollback
node scripts/deployment/deploy.js --env production --rollback
```

## Utility Scripts

### `scripts/error-checker.sh`

**Purpose**: Check for errors in the codebase.

**Key Functions**:

#### `checkErrors(options)`

- **Purpose**: Main error checking
- **Parameters**:
  - `options` (object): Check options
- **Returns**: Error check results
- **Logic**: Checks codebase for errors and issues

#### `checkLinting(files)`

- **Purpose**: Linting check
- **Parameters**:
  - `files` (array): Files to check
- **Returns**: Linting results
- **Logic**: Performs linting checks on specified files

#### `checkTypes(files)`

- **Purpose**: Type checking
- **Parameters**:
  - `files` (array): Files to check
- **Returns**: Type check results
- **Logic**: Performs TypeScript type checking

#### `checkSecurity(files)`

- **Purpose**: Security checking
- **Parameters**:
  - `files` (array): Files to check
- **Returns**: Security check results
- **Logic**: Performs security checks on specified files

**Usage Examples**:

```bash
# Check for errors
./scripts/error-checker.sh

# Check with fix
./scripts/error-checker.sh --fix

# Check specific files
./scripts/error-checker.sh --files src/
```

### `scripts/test-cli-options.sh`

**Purpose**: Test CLI options and configurations.

**Key Functions**:

#### `testCLIOptions(options)`

- **Purpose**: Main CLI testing
- **Parameters**:
  - `options` (object): Test options
- **Returns**: Test results
- **Logic**: Tests CLI options and configurations

#### `testCommand(command, options)`

- **Purpose**: Command testing
- **Parameters**:
  - `command` (string): Command to test
  - `options` (object): Test options
- **Returns**: Command test results
- **Logic**: Tests specific CLI command

#### `testConfiguration(config)`

- **Purpose**: Configuration testing
- **Parameters**:
  - `config` (object): Configuration to test
- **Returns**: Configuration test results
- **Logic**: Tests configuration options

#### `testErrorHandling(command)`

- **Purpose**: Error handling testing
- **Parameters**:
  - `command` (string): Command to test
- **Returns**: Error handling test results
- **Logic**: Tests error handling for CLI commands

**Usage Examples**:

```bash
# Test CLI options
./scripts/test-cli-options.sh

# Test specific command
./scripts/test-cli-options.sh --command "ens-validator"

# Test with verbose output
./scripts/test-cli-options.sh --verbose
```

## Testing Scripts

### `scripts/test/run-tests.js`

**Purpose**: Run test suites and generate reports.

**Key Functions**:

#### `runTests(options)`

- **Purpose**: Main test execution
- **Parameters**:
  - `options` (object): Test options
- **Returns**: Test results
- **Logic**: Runs test suites with specified options

#### `generateTestReport(results)`

- **Purpose**: Test report generation
- **Parameters**:
  - `results` (object): Test results
- **Returns**: Test report
- **Logic**: Generates test report from results

#### `analyzeCoverage(coverage)`

- **Purpose**: Coverage analysis
- **Parameters**:
  - `coverage` (object): Coverage data
- **Returns**: Coverage analysis
- **Logic**: Analyzes test coverage and identifies gaps

#### `exportTestResults(results, format)`

- **Purpose**: Test results export
- **Parameters**:
  - `results` (object): Test results
  - `format` (string): Export format
- **Returns**: Exported data
- **Logic**: Exports test results in specified format

**Usage Examples**:

```bash
# Run tests
node scripts/test/run-tests.js

# Run with coverage
node scripts/test/run-tests.js --coverage

# Run specific test suite
node scripts/test/run-tests.js --suite unit
```

## Performance Scripts

### `scripts/performance/benchmark.js`

**Purpose**: Performance benchmarking and optimization.

**Key Functions**:

#### `runBenchmark(options)`

- **Purpose**: Main benchmarking
- **Parameters**:
  - `options` (object): Benchmark options
- **Returns**: Benchmark results
- **Logic**: Runs performance benchmarks

#### `measurePerformance(function, iterations)`

- **Purpose**: Performance measurement
- **Parameters**:
  - `function` (function): Function to measure
  - `iterations` (number): Number of iterations
- **Returns**: Performance metrics
- **Logic**: Measures performance of specified function

#### `analyzeResults(results)`

- **Purpose**: Results analysis
- **Parameters**:
  - `results` (array): Benchmark results
- **Returns**: Analysis results
- **Logic**: Analyzes benchmark results and identifies bottlenecks

#### `generateOptimizationRecommendations(analysis)`

- **Purpose**: Optimization recommendations
- **Parameters**:
  - `analysis` (object): Analysis results
- **Returns**: Optimization recommendations
- **Logic**: Generates optimization recommendations based on analysis

**Usage Examples**:

```bash
# Run benchmark
node scripts/performance/benchmark.js

# Benchmark specific function
node scripts/performance/benchmark.js --function "validateDomain"

# Benchmark with iterations
node scripts/performance/benchmark.js --iterations 1000
```

## Integration Patterns

### Script Chaining

```bash
# Analysis → Migration → Validation → Deployment
node scripts/analyze-resolvers.cjs | \
node scripts/migrate-schema.cjs --schema hierarchical | \
node scripts/validate-schema.cjs | \
node scripts/deployment/deploy.js --env production
```

### Batch Processing

```bash
# Batch analysis → Batch migration → Batch validation
node scripts/analyze-resolvers.cjs --batch resolvers.txt | \
node scripts/migrate-schema.cjs --batch metadata/ | \
node scripts/validate-schema.cjs --batch
```

### Parallel Processing

```bash
# Parallel analysis and testing
node scripts/analyze-resolvers.cjs & \
node scripts/test/run-tests.js & \
wait
```

## Error Handling

### Common Errors

1. **Script Execution Errors**: Script fails to execute
2. **Configuration Errors**: Invalid configuration
3. **Network Errors**: Cannot connect to external services
4. **File System Errors**: File operations fail

### Error Recovery

- Retry mechanisms for network failures
- Fallback configurations for missing settings
- Graceful degradation for optional operations
- Comprehensive error reporting

## Performance Considerations

### Optimization Strategies

- Batch processing for large datasets
- Parallel processing for independent operations
- Caching for repeated operations
- Resource management for long-running scripts

### Resource Management

- Memory management for large datasets
- CPU usage optimization
- Network connection pooling
- File system optimization

## Next Steps

- [Bin Tools](bin-tools.md) - Tools in `bin/` directory
- [Prober Tools](prober-tools.md) - Tools in `tools/prober/` directory
- [API Documentation](../API/) - Programmatic usage
- [Interconnectivity](../Interconnectivity.md) - How tools work together
