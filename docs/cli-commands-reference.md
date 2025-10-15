# CLI Commands Reference

This document provides a reference for all available CLI commands in the ENS metadata tools system.

## Main CLI Entry Point

### `bin/ens-naming.mjs`

The unified CLI entry point with the following subcommands:

#### Basic Commands

```bash
# Show help
node bin/ens-naming.mjs --help

# Show version
node bin/ens-naming.mjs --version
```

#### Wizard Command

```bash
# Interactive wizard
node bin/ens-naming.mjs wizard

# Wizard with dry run
node bin/ens-naming.mjs wizard --dry-run

# Wizard help
node bin/ens-naming.mjs wizard --help
```

#### Suggest Command

```bash
# Suggest subdomains for category
node bin/ens-naming.mjs suggest <org> <category>

# Suggest with subcategory
node bin/ens-naming.mjs suggest <org> <category> --subcategory <subcategory>

# Suggest with verbose output
node bin/ens-naming.mjs suggest <org> <category> --verbose

# Suggest help
node bin/ens-naming.mjs suggest --help
```

#### Validate-Name Command

```bash
# Validate domain name
node bin/ens-naming.mjs validate-name <domain> <category>

# Validate with strict mode
node bin/ens-naming.mjs validate-name <domain> <category> --strict

# Validate with metadata file
node bin/ens-naming.mjs validate-name <domain> <category> --metadata <file>

# Validate help
node bin/ens-naming.mjs validate-name --help
```

#### Generate-Metadata Command

```bash
# Generate metadata
node bin/ens-naming.mjs generate-metadata <org> <protocol> <category> <role> <version> <chainId>

# Generate with variant
node bin/ens-naming.mjs generate-metadata <org> <protocol> <category> <role> <version> <chainId> --variant <variant>

# Generate help
node bin/ens-naming.mjs generate-metadata --help
```

#### Register Command

```bash
# Generate registration script
node bin/ens-naming.mjs register <metadata-file>

# Register with dry run
node bin/ens-naming.mjs register <metadata-file> --dry-run

# Register with output file
node bin/ens-naming.mjs register <metadata-file> -o <output-file>

# Register help
node bin/ens-naming.mjs register --help
```

#### QA-Report Command

```bash
# Generate QA report for file
node bin/ens-naming.mjs qa-report <file>

# Generate QA report for directory
node bin/ens-naming.mjs qa-report <directory>

# QA report with format
node bin/ens-naming.mjs qa-report <file> --format <format>

# QA report help
node bin/ens-naming.mjs qa-report --help
```

#### Migrate Command

```bash
# Migrate file
node bin/ens-naming.mjs migrate <file>

# Migrate directory
node bin/ens-naming.mjs migrate <directory>

# Migrate with dry run
node bin/ens-naming.mjs migrate <path> --dry-run

# Migrate in place
node bin/ens-naming.mjs migrate <file> --in-place

# Migrate help
node bin/ens-naming.mjs migrate --help
```

#### Check Command

```bash
# Check file
node bin/ens-naming.mjs check <file>

# Check directory
node bin/ens-naming.mjs check <directory>

# Check with strict mode
node bin/ens-naming.mjs check <file> --strict

# Check help
node bin/ens-naming.mjs check --help
```

#### Categories Command

```bash
# List categories
node bin/ens-naming.mjs categories

# List categories with subcategories
node bin/ens-naming.mjs categories --subcategories

# Categories help
node bin/ens-naming.mjs categories --help
```

## Individual Tools

### Schema Validator

```bash
# Validate schema file
node bin/schema-validator.mjs <file>

# Validate multiple files
node bin/schema-validator.mjs <file1> <file2> ...

# Schema validator help
node bin/schema-validator.mjs --help
```

### Cross-Reference Validator

```bash
# Cross-reference validation
node bin/cross-reference-validator.mjs <file>

# Cross-reference batch
node bin/cross-reference-validator.mjs <directory>

# Cross-reference help
node bin/cross-reference-validator.mjs --help
```

### Security Analyzer

```bash
# Security analysis
node bin/security-analyzer.mjs <file>

# Security analysis with verbose output
node bin/security-analyzer.mjs <file> --verbose

# Security analyzer help
node bin/security-analyzer.mjs --help
```

### Subdomain Planner

```bash
# Subdomain planning
node bin/subdomain-planner.mjs <file>

# Subdomain planning with output
node bin/subdomain-planner.mjs <file> -o <output-file>

# Subdomain planner help
node bin/subdomain-planner.mjs --help
```

### Naming Validator

```bash
# Validate domain name
node bin/naming-validator.mjs <domain> <category>

# Naming validator help
node bin/naming-validator.mjs --help
```

### QA Report Generator

```bash
# Generate QA report
node bin/qa-report-generator.mjs <file>

# QA report generator help
node bin/qa-report-generator.mjs --help
```

### Migration Tool

```bash
# Migrate schema
node bin/migrate-schema.mjs <path>

# Migrate with dry run
node bin/migrate-schema.mjs <path> --dry-run

# Migration tool help
node bin/migrate-schema.mjs --help
```

### Contract Naming CLI (Deprecated)

```bash
# Show deprecation warning
node bin/contract-naming-cli.js

# Categories command
node bin/contract-naming-cli.js categories

# Contract naming CLI help
node bin/contract-naming-cli.js --help
```

## Utility Tools

### Metadata Generator

```bash
# Generate metadata
node bin/metadata-generator.mjs --category <category> --protocol <protocol> --role <role>

# Metadata generator help
node bin/metadata-generator.mjs --help
```

### Metadata Filler

```bash
# Fill metadata
node bin/metadata-filler.mjs <file>

# Metadata filler help
node bin/metadata-filler.mjs --help
```

### Cache Browser

```bash
# Cache browser help
node bin/cache-browser.mjs --help

# List cache
node bin/cache-browser.mjs list
```

### Contract Discovery

```bash
# Contract discovery
node bin/contract-discovery.mjs <address>

# Contract discovery help
node bin/contract-discovery.mjs --help
```

### ENS Operations

```bash
# ENS operations test
node bin/ens-operations.mjs test

# ENS operations help
node bin/ens-operations.mjs --help
```

### EVM Debugger

```bash
# EVM debugger help
node bin/evmd.js --help

# EVM debugger version
node bin/evmd.js --version
```

## Prober Tools

### Contract Discovery Prober

```bash
# Contract discovery prober
node tools/prober/contract-discovery.js --help
```

### Lookup Resolver Names

```bash
# Lookup resolver names
node tools/prober/lookup-resolver-names.js --help
```

## Scripts

### Analyze Resolvers

```bash
# Analyze resolvers
node scripts/analyze-resolvers.cjs --help
```

### Get Real Resolvers

```bash
# Get real resolvers
node scripts/get-real-resolvers.cjs --help
```

### Query ENS Resolvers

```bash
# Query ENS resolvers
node scripts/query-ens-resolvers.cjs --help
```

### Update Domains

```bash
# Update domains
node scripts/update-domains.js --help
```

### Error Checker

```bash
# Error checker
bash scripts/error-checker.sh
```

### Deployment

```bash
# Deployment script
node scripts/deployment/deploy.js --help
```

### Download Resolver Source

```bash
# Download resolver source
node scripts/download-resolver-source.cjs --help
```

## Testing Commands

### NPM Test Commands

```bash
# Run all tests
npm test

# Run specific test
npm test -- test/<test-file>

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests in debug mode
npm run test:debug
```

### Individual Test Files

```bash
# Test specific functionality
node test/proxy-handling-simple.test.js
```

## Package Management

### NPM Commands

```bash
# Install dependencies
npm install

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Run linter
npm run lint

# Type check
npm run typecheck
```

## Environment Commands

### System Information

```bash
# Node.js version
node --version

# NPM version
npm --version

# System info
uname -a

# Current directory
pwd

# Directory contents
ls -la
```

### Git Commands

```bash
# Git status
git status

# Git log (last 5 commits)
git log --oneline -5

# Git branches
git branch -a

# Git tags
git tag
```

## Usage Examples

### Basic Workflow

```bash
# 1. Start with wizard
node bin/ens-naming.mjs wizard

# 2. Validate generated domain
node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao

# 3. Generate QA report
node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json

# 4. Generate registration script
node bin/ens-naming.mjs register metadata/protocols/ens-dao-governor-plan.json -o register.sh
```

### Advanced Workflow

```bash
# 1. Suggest subdomains
node bin/ens-naming.mjs suggest ens dao --verbose

# 2. Generate metadata
node bin/ens-naming.mjs generate-metadata ens ens dao governor v1-0-0 1

# 3. Migrate old schema
node bin/ens-naming.mjs migrate old-metadata.json --dry-run

# 4. Check compliance
node bin/ens-naming.mjs check metadata/ --strict

# 5. Generate comprehensive QA report
node bin/ens-naming.mjs qa-report metadata/ --format markdown
```

### Proxy Contract Workflow

```bash
# 1. Validate proxy domain
node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao --metadata governor-metadata.json

# 2. Check proxy consistency
node bin/ens-naming.mjs check governor-metadata.json --strict

# 3. Generate registration script for proxy system
node bin/ens-naming.mjs register governor-metadata.json -o register-governor.sh
```

### Batch Operations

```bash
# 1. Migrate entire directory
node bin/ens-naming.mjs migrate metadata/protocols/ --dry-run

# 2. Check all files
node bin/ens-naming.mjs check metadata/protocols/

# 3. Generate batch QA report
node bin/ens-naming.mjs qa-report metadata/protocols/ --format json > batch-qa-report.json
```

## Error Handling

### Common Error Scenarios

```bash
# Invalid command
node bin/ens-naming.mjs invalid-command

# Missing required arguments
node bin/ens-naming.mjs validate-name

# Invalid domain format
node bin/ens-naming.mjs validate-name invalid-domain dao

# Non-existent file
node bin/ens-naming.mjs check non-existent-file.json
```

### Error Recovery

```bash
# Test invalid input handling
echo 'invalid\ninput' | node bin/ens-naming.mjs wizard --dry-run

# Test missing file handling
node bin/ens-naming.mjs check non-existent-file.json

# Test malformed JSON handling
echo 'invalid json' > /tmp/invalid.json && node bin/ens-naming.mjs check /tmp/invalid.json
```

## Performance Testing

### CLI Performance

```bash
# Test CLI performance
time node bin/ens-naming.mjs suggest ens dao

# Test validation performance
time node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao

# Test QA report performance
time node bin/ens-naming.mjs qa-report metadata/protocols/
```

### Integration Testing

```bash
# Test wizard to validation pipeline
echo 'ens\nens\ndao\ngovernor\nv1-0-0\n1\n\nens.dao.cns.eth' | node bin/ens-naming.mjs wizard --dry-run

# Test suggest to validate pipeline
node bin/ens-naming.mjs suggest ens dao && node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao
```

## Output Formats

### JSON Output

```bash
# QA report in JSON format
node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format json
```

### Markdown Output

```bash
# QA report in Markdown format
node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format markdown
```

### Text Output

```bash
# QA report in text format
node bin/ens-naming.mjs qa-report metadata/protocols/ens-dao-governor-plan.json --format text
```

## Configuration Files

### View Configuration

```bash
# View package.json
cat package.json

# View jest.config.cjs
cat jest.config.cjs

# View schema.json
cat data/metadata/schema.json

# View QA validation rules
cat data/configs/qa-validation-rules.json
```

### View Documentation

```bash
# View README
cat README.md

# View CHANGELOG
cat docs/CHANGELOG.md

# View CONTRIBUTING
cat docs/CONTRIBUTING.md

# View SECURITY
cat docs/SECURITY.md

# View SUPPORT
cat SUPPORT.md
```

## Quick Start

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Run tests to verify installation
npm test

# 3. Start with wizard
node bin/ens-naming.mjs wizard
```

### Daily Usage

```bash
# 1. Suggest subdomains
node bin/ens-naming.mjs suggest <org> <category>

# 2. Validate domain
node bin/ens-naming.mjs validate-name <domain> <category>

# 3. Generate QA report
node bin/ens-naming.mjs qa-report <file>
```

### Development Workflow

```bash
# 1. Run tests
npm test

# 2. Check code quality
npm run lint

# 3. Type check
npm run typecheck

# 4. Test specific functionality
node test/proxy-handling-simple.test.js
```

This reference covers all available CLI commands and their usage patterns. For more detailed information, refer to the individual tool documentation and the main README.md file.
