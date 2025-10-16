# ENS Metadata Tools

[![npm version](https://badge.fury.io/js/ens-metadata-tools.svg)](https://badge.fury.io/js/ens-metadata-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![ENSIP-X](https://img.shields.io/badge/ENSIP--19-Compliant-green.svg)](docs/ENSIP-X.md)

> **ENSIP-X Compliant Toolkit** for Ethereum smart contract metadata management, security analysis, and ENS subdomain planning

## Overview

The ENS Metadata Tools provide a comprehensive suite for managing Ethereum smart contract metadata according to the [ENSIP-X specification](docs/ENSIP-X.md). This toolkit enables developers, protocol teams, and organizations to create, validate, and manage standardized contract metadata with cryptographic integrity verification.

### Key Features

- **ENSIP-X Compliance**: Full implementation of the ENSIP-X metadata standard
- **Metadata Generation**: Create standardized metadata with canonical ID grammar and SHA-256 hashing
- **Validation Suite**: Comprehensive validation against ENSIP-X schema requirements
- **Security Analysis**: Analyze ENS domain security posture and identify vulnerabilities
- **Subdomain Planning**: Plan optimal hierarchical subdomain structures
- **ENS Operations**: Direct ENS contract interactions and management
- **Proxy Support**: Handle transparent, UUPS, beacon, diamond, and other proxy patterns
- **Cross-Chain**: Support for multiple blockchain networks
- **CCIP Integration**: Off-chain metadata retrieval via Cross-Chain Interoperability Protocol

## Installation

### Global Installation

```bash
npm install -g ens-metadata-tools
```

### Local Development

```bash
git clone https://github.com/ens-contracts/metadata-tools.git
cd metadata-tools
npm install
```

## Quick Start

### Generate ENSIP-X Compliant Metadata

```bash
# Generate metadata for a DeFi AMM protocol
ens-metadata-tools metadata --category defi --type amm --name Uniswap --protocol-version v4-0-0 --output uniswap-metadata.json

# Validate the generated metadata
ens-metadata-tools validate uniswap-metadata.json --strict

# Check ENSIP-X compliance
ens-metadata-tools validate uniswap-metadata.json --schema data/metadata/schema.json
```

### Example Generated Metadata

```json
{
  "id": "uniswap.uniswap.defi.amm.v4-0-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "amm",
  "version": "v4-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x0000000000000000000000000000000000000000"
    }
  ],
  "metadataHash": "0xcd788df219a200c224a9f06a1f2738b04512be65a0219162f9ac4aa926da097f"
}
```

## CLI Commands

### Core Metadata Operations

```bash
# Generate metadata for any protocol category
ens-metadata-tools metadata --category <category> --type <type> --name <name> [options]

# Validate metadata against ENSIP-X schema
ens-metadata-tools validate <metadata-file> [options]

# Plan subdomain structure
ens-metadata-tools plan <domain> [options]

# Security analysis
ens-metadata-tools security <domain> [options]

# Probe ENS resolvers
ens-metadata-tools probe [options]

# Lookup ENS names
ens-metadata-tools lookup [options]
```

### Available Categories and Types

| Category | Types | Description |
|----------|-------|-------------|
| **defi** | amm, lending, stablecoin | DeFi protocols |
| **dao** | governor, treasury | DAO governance |
| **infrastructure** | oracle, bridge | Infrastructure services |
| **tokens** | erc20, erc721, governance | Token contracts |
| **gaming** | nft, gambling | Gaming applications |
| **social** | platform, messaging | Social platforms |
| **rwa** | realestate, commodities | Real-world assets |
| **privacy** | mixer, security | Privacy tools |
| **developer** | framework, oracle | Dev tools |
| **analytics** | indexer, dashboard | Analytics services |
| **wallet** | infrastructure, payments | Wallet services |
| **insurance** | protocol | Insurance protocols |
| **art** | platform | Art platforms |
| **supplychain** | tracking | Supply chain |
| **healthcare** | medical | Healthcare systems |
| **finance** | banking | Financial services |

### Additional CLI Tools

The toolkit also provides standalone CLI tools:

```bash
# Individual tool usage
ens-validator <domain> <category> [options]     # Domain validation
ens-contract <command> [options]                # ENS contract operations
ens-cache-browser [options]                     # Metadata cache management
evmd [options]                                  # Ethereum metadata viewer
```

## ENSIP-X Compliance

This toolkit implements the complete ENSIP-X specification:

### Canonical ID Grammar

```
org.protocol.category.role[.variant].v{version}.{chainId}
```

**Example**: `uniswap.uniswap.defi.amm.v4-0-0.1`

### Metadata Hash Generation

- **Algorithm**: SHA-256
- **Format**: Canonical JSON (sorted keys, no whitespace)
- **Prefix**: `0x` for Ethereum compatibility
- **Length**: 64 characters (32 bytes)

### Required Fields

- `id` - Canonical identifier
- `org` - Organization identifier
- `protocol` - Protocol identifier  
- `category` - Primary category classification
- `role` - Contract role/function
- `version` - Version format (v{num}-{num}-{num})
- `chainId` - Target blockchain network ID
- `addresses` - Contract addresses array
- `metadataHash` - SHA-256 hash of metadata

### Hierarchical Schema System

Supports 5-level domain hierarchy:
- **Level 0**: CNS Root (`cns.eth`)
- **Level 1**: Project (`{project}.cns.eth`)
- **Level 2**: Category (`{category}.{project}.cns.eth`)
- **Level 3**: Protocol (`{protocol}.{category}.{project}.cns.eth`)
- **Level 4**: Variant (`{variant}.{protocol}.{category}.{project}.cns.eth`)

## Development

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm or yarn
- Git

### Setup

```bash
git clone https://github.com/ens-contracts/metadata-tools.git
cd metadata-tools
npm install
npm run prepare  # Setup git hooks
```

### Development Workflow

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Check formatting
npm run format:check

# Type checking
npm run typecheck

# Run tests
npm test

# Build project
npm run build

# Generate documentation
npm run docs:cli
npm run docs:api
```

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Type safety and better IDE support
- **Husky**: Git hooks for pre-commit checks
- **CI/CD**: Automated testing and security checks

## Architecture

The toolkit consists of specialized modules:

### Core Modules

- **Metadata Generator** (`bin/metadata-generator.mjs`) - Creates ENSIP-X compliant metadata
- **Schema Validator** (`bin/schema-validator.mjs`) - Validates against ENSIP-X schema
- **Subdomain Planner** (`bin/subdomain-planner.mjs`) - Generates optimal subdomain hierarchies
- **Security Analyzer** (`bin/security-analyzer.mjs`) - Analyzes ENS domain security posture
- **ENS Operations** (`bin/ens-contract.mjs`) - Direct ENS contract interactions

### Validation Suite

- **Naming Validator** (`bin/naming-validator.mjs`) - ENS naming convention validation
- **Cross-Reference Validator** (`bin/cross-reference-validator.mjs`) - Cross-reference validation
- **QA Report Generator** (`bin/qa-report-generator.mjs`) - Quality assurance reporting
- **Edge Case Validator** (`bin/edge-case-validator.mjs`) - Edge case handling

### Utility Tools

- **Cache Browser** (`bin/cache-browser.mjs`) - Metadata cache management
- **Metadata Filler** (`bin/metadata-filler.mjs`) - Template filling utilities
- **Schema Generator** (`bin/schema-generator.mjs`) - Schema generation tools

## Configuration

### Schema Configuration

The toolkit uses JSON Schema for validation located at `data/metadata/schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ENS Contract Metadata",
  "type": "object",
  "required": [
    "id", "org", "protocol", "category", "role", 
    "version", "chainId", "addresses", "metadataHash"
  ]
}
```

### QA Validation Rules

Quality assurance rules are defined in `config/qa-validation-rules.json`:

```json
{
  "standards": {
    "1": {
      "name": "Metadata Schema Validation",
      "priority": "critical",
      "validationLevel": "required"
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [Complete Documentation](docs/) - Comprehensive guides and references
- [Getting Started](docs/Getting-Started.md) - Installation and setup guide
- [CLI Commands](docs/CLI-COMMANDS.md) - Command reference
- [API Documentation](docs/api/) - Programmatic usage
- [ENSIP-X Specification](docs/ENSIP-X.md) - Complete specification
- [Architecture](docs/Architecture.md) - System architecture overview
- [Security](docs/SECURITY.md) - Security considerations

## Support

- [Issues](https://github.com/ens-contracts/metadata-tools/issues)
- [Discussions](https://github.com/ens-contracts/metadata-tools/discussions)
- [Documentation](docs/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ENS (Ethereum Name Service)](https://ens.domains/) for the naming system
- [ENSIP-X](docs/ENSIP-X.md) specification contributors
- [Ethereum Foundation](https://ethereum.org/) for blockchain infrastructure
- [OpenZeppelin](https://openzeppelin.com/) for smart contract standards

---

**Built for the Ethereum ecosystem**
