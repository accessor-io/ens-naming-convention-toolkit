# ENS Naming CLI Tool

The ENS Naming CLI is a unified tool for managing contract naming conventions, subdomain generation, and ENS metadata management across the Ethereum ecosystem.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd ens-metadata-tools-repo

# Install dependencies
npm install
```

## Usage

### Interactive Wizard

The easiest way to get started is with the interactive wizard:

```bash
node bin/ens-naming.mjs wizard
```

This will guide you through:

- Organization and protocol naming
- Category and subcategory selection
- Contract role definition
- Version and chain ID specification
- ENS root domain configuration

### Command Reference

#### `wizard`

Interactive guided setup for contract metadata.

```bash
node bin/ens-naming.mjs wizard
```

#### `validate-name`

Validate naming convention compliance.

```bash
node bin/ens-naming.mjs validate-name <domain> <category> [options]
```

Options:

- `--strict` - Enable strict validation
- `--metadata <file>` - Load metadata from JSON file

Example:

```bash
node bin/ens-naming.mjs validate-name router.uniswap.defi.eth defi --strict
```

#### `register`

Generate ENS registration script from metadata.

```bash
node bin/ens-naming.mjs register <metadata-file> [options]
```

Options:

- `-o, --output <file>` - Output file for script

Example:

```bash
node bin/ens-naming.mjs register metadata.json -o register.sh
```

#### `qa-report`

Generate QA compliance report.

```bash
node bin/ens-naming.mjs qa-report <file|directory> [options]
```

Options:

- `--strict` - Enable strict validation
- `--format <type>` - Output format (markdown, json)
- `--output <file>` - Output file path

Example:

```bash
node bin/ens-naming.mjs qa-report metadata/ --format markdown --output report.md
```

#### `migrate`

Migrate metadata from old schema to new schema.

```bash
node bin/ens-naming.mjs migrate <file|directory> [options]
```

Options:

- `--in-place` - Modify files in place
- `--dry-run` - Show what would be migrated without making changes

Example:

```bash
node bin/ens-naming.mjs migrate metadata/ --dry-run
```

#### `check`

Check metadata compliance against all standards.

```bash
node bin/ens-naming.mjs check <file> [options]
```

Options:

- `--strict` - Enable strict validation

Example:

```bash
node bin/ens-naming.mjs check metadata.json --strict
```

#### `categories`

List available categories and their conventions.

```bash
node bin/ens-naming.mjs categories
```

## Schema Changes

### Migration from Old Schema

The new schema introduces several changes:

1. **`domain` → `category`**: The `domain` field is now deprecated in favor of `category`
2. **`subcategory`**: New optional field for more specific categorization
3. **`ensRoot`**: New field specifying the subname under cns.eth hosting subdomains

### Example Migration

**Old Schema:**

```json
{
  "id": "uniswap.uniswap.domain.router.v1.0.0.1",
  "domain": "defi",
  "role": "router"
}
```

**New Schema:**

```json
{
  "id": "uniswap.uniswap.category.router.v1.0.0.1",
  "category": "defi",
  "subcategory": "amm",
  "ensRoot": "uniswap.defi.cns.eth",
  "role": "router"
}
```

### Automatic Migration

Use the migration tool to automatically convert old metadata files:

```bash
# Dry run to see what would change
node bin/ens-naming.mjs migrate metadata/ --dry-run

# Apply changes
node bin/ens-naming.mjs migrate metadata/ --in-place
```

## Categories and Subcategories

### Available Categories

- `defi` - Decentralized Finance
- `dao` - Decentralized Autonomous Organizations
- `l2` - Layer 2 Solutions
- `infra` - Infrastructure
- `tokens` - Token Contracts
- `nft` - Non-Fungible Tokens
- `gaming` - Gaming Platforms
- `social` - Social Networks
- `identity` - Identity Management
- `privacy` - Privacy Solutions
- `security` - Security Tools
- `wallet` - Wallet Services
- `analytics` - Analytics Services
- `rwa` - Real World Assets
- `supply` - Supply Chain
- `health` - Healthcare
- `finance` - Traditional Finance
- `dev` - Developer Tools
- `art` - Art Platforms

### Subcategories

Each category has specific subcategories. For example:

**DeFi (`defi`):**

- `amm` - Automated Market Makers
- `lending` - Lending Protocols
- `stablecoin` - Stablecoin Protocols
- `yield` - Yield Farming
- `perps` - Perpetual Contracts
- `options` - Options Trading
- `derivatives` - Derivatives Trading

**DAO (`dao`):**

- `governor` - Governance Contracts
- `timelock` - Timelock Contracts
- `treasury` - Treasury Management
- `voting` - Voting Mechanisms
- `multisig` - Multi-signature Wallets
- `module` - Governance Modules

## Canonical ID Format

All metadata must use the canonical ID format:

```
org.protocol.category.role[.variant].v{version}.{chainId}
```

Examples:

- `uniswap.uniswap.defi.router.v1-0-0.1`
- `ens.ens.dao.governor.v1-0-0.1`
- `maker.maker.defi.cdp.v2-1-0.1`

## Subdomain Management

The tool automatically generates subdomain suggestions based on category and subcategory:

**DeFi AMM:**

- `router.uniswap.defi.cns.eth`
- `factory.uniswap.defi.cns.eth`
- `quoter.uniswap.defi.cns.eth`
- `multicall.uniswap.defi.cns.eth`

**DAO:**

- `governor.ens.dao.cns.eth`
- `token.ens.dao.cns.eth`
- `treasury.ens.dao.cns.eth`
- `timelock.ens.dao.cns.eth`

## Backward Compatibility

The tool maintains backward compatibility with the old schema:

- Files with `domain` field are automatically migrated
- Deprecated fields are preserved under `_deprecated`
- Migration warnings are shown but don't block validation

## Examples

### Creating a New DeFi Protocol

```bash
# Start the wizard
node bin/ens-naming.mjs wizard

# Follow the prompts:
# Organization: my-protocol
# Protocol: my-protocol
# Category: defi
# Subcategory: amm
# Role: router
# Version: v1-0-0
# Chain ID: 1
# ENS Root: my-protocol.defi.cns.eth
```

### Validating Existing Metadata

```bash
# Check a single file
node bin/ens-naming.mjs check metadata.json

# Generate QA report
node bin/ens-naming.mjs qa-report metadata/ --format markdown --output report.md
```

### Migrating Old Files

```bash
# See what would change
node bin/ens-naming.mjs migrate metadata/ --dry-run

# Apply changes
node bin/ens-naming.mjs migrate metadata/ --in-place
```

## Troubleshooting

### Common Issues

1. **Schema Validation Errors**: Use `check` command to identify issues
2. **Migration Problems**: Use `--dry-run` to preview changes
3. **Category Not Found**: Use `categories` command to see available options

### Getting Help

```bash
# Show help for any command
node bin/ens-naming.mjs <command> --help

# List all commands
node bin/ens-naming.mjs --help
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this project.
