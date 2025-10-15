# CLI Commands Reference

This document provides a reference for all CLI commands available in the ENS metadata tools.

## Overview

The ENS metadata tools provide several CLI commands for different aspects of ENS metadata management:

- **Validation**: Validate domain names and metadata against standards
- **Generation**: Generate standardized metadata templates
- **Operations**: Perform ENS contract operations
- **Analysis**: Analyze metadata for security and compliance issues
- **Planning**: Plan subdomain structures and naming conventions

## Commands

### ens-metadata

**Description**: Main CLI entry point for ENS metadata operations

**Usage**: `ens-metadata [command] [options]`

**Examples**:

```bash
ens-metadata validate example.eth
```

```bash
ens-metadata generate --category defi --type amm
```

### ens-validator

**Description**: Ethereum Contract Naming Convention Validator

**Usage**: `ens-validator <domain> <category> [options]`

**Options**:

- `--strict`: Strict validation mode
- `--metadata <file>`: Load metadata from JSON file
- `--batch <file>`: Validate multiple domains from file
- `--qa`: Enable QA standards validation
- `--no-qa`: Disable QA standards validation

**Examples**:

```bash
ens-validator governor.ensdao.eth dao
```

```bash
ens-validator uniswap.amm.eth defi --strict --qa
```

```bash
ens-validator uni.token.eth tokens --metadata token-metadata.json --qa
```

### ens-cache-browser

**Description**: ENS cache browser for metadata exploration

**Usage**: `ens-cache-browser [options]`

**Examples**:

```bash
ens-cache-browser --domain example.eth
```

```bash
ens-cache-browser --list --category defi
```

### evmd

**Description**: EVM metadata operations

**Usage**: `evmd [command] [options]`

**Examples**:

```bash
evmd analyze contract.json
```

```bash
evmd generate metadata --type erc20
```

### ens-contract

**Description**: ENS contract operations and management

**Usage**: `ens-contract [command] [options]`

**Examples**:

```bash
ens-contract register subdomain.eth --owner 0x...
```

```bash
ens-contract set-resolver domain.eth --resolver 0x...
```

### metadata-generator

**Description**: Generate standardized metadata templates

**Usage**: `metadata-generator --category <category> --type <type> [options]`

**Options**:

- `--category <cat>`: Protocol category (required)
- `--type <type>`: Protocol type (required)
- `--name <name>`: Protocol/contract name
- `--version <ver>`: Version number
- `--symbol <sym>`: Token symbol
- `--supply <num>`: Token supply
- `--output <file>`: Save to file

**Examples**:

```bash
metadata-generator --category defi --type amm --name Uniswap --version 3
```

```bash
metadata-generator --category dao --type governor --dao ENS --token ENS
```

```bash
metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000
```

### subdomain-planner

**Description**: Plan and organize subdomain structures

**Usage**: `subdomain-planner [options]`

**Examples**:

```bash
subdomain-planner --domain example.eth --interactive
```

```bash
subdomain-planner --template defi --output plan.json
```

### security-analyzer

**Description**: Analyze ENS metadata for security issues

**Usage**: `security-analyzer [options]`

**Examples**:

```bash
security-analyzer --metadata contract.json
```

```bash
security-analyzer --batch metadata/ --report security-report.json
```

## Categories

The following categories are supported across different commands:

### DeFi Categories

- `defi` - General DeFi protocols
- `amm` - Automated Market Makers
- `lending` - Lending protocols
- `stablecoin` - Stablecoin protocols
- `dex` - Decentralized exchanges

### DAO Categories

- `dao` - General DAO protocols
- `governor` - Governance contracts
- `treasury` - Treasury management

### Infrastructure Categories

- `infrastructure` - General infrastructure
- `oracle` - Price oracles
- `bridge` - Cross-chain bridges
- `proxy` - Proxy contracts

### Token Categories

- `tokens` - General token contracts
- `erc20` - ERC-20 tokens
- `erc721` - ERC-721 NFTs
- `governance` - Governance tokens

## Usage Examples

### Basic Validation

```bash
# Validate a domain name
ens-validator example.eth defi

# Validate with strict mode
ens-validator example.eth defi --strict

# Validate with metadata file
ens-validator example.eth defi --metadata metadata.json
```

### Metadata Generation

```bash
# Generate DeFi AMM metadata
metadata-generator --category defi --type amm --name Uniswap --version 3

# Generate DAO governance metadata
metadata-generator --category dao --type governor --dao ENS --token ENS

# Generate token metadata
metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000
```

### ENS Operations

```bash
# Register a subdomain
ens-contract register subdomain.example.eth --owner 0x1234...

# Set resolver
ens-contract set-resolver domain.eth --resolver 0x5678...

# Set fuses (ENSv3)
ens-contract set-fuses domain.eth --fuses CANNOT_UNWRAP
```

### Security Analysis

```bash
# Analyze single metadata file
security-analyzer --metadata contract.json

# Analyze batch of files
security-analyzer --batch metadata/ --report security-report.json
```

## Configuration

Commands can be configured using:

1. **Command line options** - Direct specification
2. **Configuration files** - JSON/YAML config files
3. **Environment variables** - System environment variables

### Configuration File Format

```json
{
  "network": "mainnet",
  "strict": false,
  "includeQA": true,
  "outputDir": "./output",
  "templates": {
    "defi": "./templates/defi.json",
    "dao": "./templates/dao.json"
  }
}
```

## Error Handling

All commands provide consistent error handling:

- **Exit codes**: 0 for success, 1 for failure
- **Error messages**: Clear, actionable error descriptions
- **Verbose mode**: Use `--verbose` for detailed output
- **Logging**: Structured logging with timestamps

## Best Practices

1. **Always validate** metadata before deployment
2. **Use strict mode** for production environments
3. **Enable QA validation** for compliance
4. **Plan subdomains** before registration
5. **Analyze security** before going live
6. **Use configuration files** for complex setups
7. **Test commands** in development first

## Troubleshooting

### Common Issues

1. **Network errors**: Check network connectivity and RPC endpoints
2. **Validation failures**: Review error messages and fix issues
3. **Permission errors**: Ensure proper file permissions
4. **Memory issues**: Use batch processing for large datasets

### Getting Help

- Use `--help` flag with any command
- Check logs with `--verbose` flag
- Review error messages for specific guidance
- Consult this documentation for examples

## Contributing

To add new CLI commands:

1. Create command file in `bin/` directory
2. Add command information to this documentation
3. Update `package.json` bin section
4. Add tests for the command
5. Update CI/CD workflows if needed
