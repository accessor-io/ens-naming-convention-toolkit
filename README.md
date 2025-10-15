# ENS Metadata Tools

[![npm version](https://badge.fury.io/js/ens-metadata-tools.svg)](https://badge.fury.io/js/ens-metadata-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/ens-contracts/metadata-tools/workflows/CI/badge.svg)](https://github.com/ens-contracts/metadata-tools/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)

> Toolkit for ENS contract metadata management, security analysis, and subdomain planning

## Features

- **Metadata Generation**: Create standardized metadata templates for different contract categories
- **Validation Suite**: Validate ENS naming conventions and metadata compliance
- **Security Analysis**: Analyze ENS domain security posture and identify vulnerabilities
- **Subdomain Planning**: Plan optimal subdomain hierarchies for protocols
- **ENS Operations**: Direct ENS contract interactions and management
- **TypeScript Support**: Full TypeScript implementation with type safety
- **CI/CD Integration**: Automated testing, linting, and security checks

## Installation

```bash
# Global installation
npm install -g ens-metadata-tools

# Local development
git clone https://github.com/ens-contracts/metadata-tools.git
cd ens-metadata-tools
npm install
```

## Quick Start

```bash
# Show help
ens-metadata --help

# Validate domain naming
ens-validator uniswap.amm.eth defi --strict

# Generate metadata template
metadata-generator --category defi --type amm --name Uniswap --version 3

# Plan subdomain structure
subdomain-planner --domain uniswap.eth --interactive

# Analyze security
security-analyzer --metadata contract.json --report security-report.json
```

## CLI Commands

### Core Commands

- `ens-metadata` - Main CLI entry point
- `ens-validator` - Domain and metadata validation
- `ens-contract` - ENS contract operations
- `metadata-generator` - Generate metadata templates
- `subdomain-planner` - Plan subdomain structures
- `security-analyzer` - Security analysis and reporting

### Validation & QA

- `validate` - Validate ENS naming conventions
- `validate:qa` - Generate QA reports
- `validate:schema` - Schema validation
- `validate:cross-ref` - Cross-reference validation

### Development

- `test` - Run test suite
- `lint` - Code linting
- `format` - Code formatting
- `typecheck` - TypeScript type checking
- `build` - Build project

See [CLI Commands Reference](docs/CLI-COMMANDS.md) for detailed documentation.

## Development

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm or yarn
- Git

### Setup

```bash
git clone https://github.com/ens-contracts/metadata-tools.git
cd ens-metadata-tools
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

The toolkit consists of several specialized modules:

- **Metadata Generator** - Creates standardized protocol metadata
- **Subdomain Planner** - Generates optimal subdomain hierarchies
- **Security Analyzer** - Analyzes ENS domain security posture
- **Validation Suite** - Comprehensive QA and compliance checking
- **ENS Operations** - Direct ENS contract interactions

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

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Documentation

- [Documentation](docs/) - Complete documentation and guides
- [Getting Started](docs/Getting-Started.md) - Installation and setup
- [CLI Commands](docs/commands/) - Command reference
- [API Documentation](docs/API/) - Programmatic usage

## Support

- [Issues](https://github.com/ensdomains/ens-metadata-tools/issues)
- [Discussions](https://github.com/ensdomains/ens-metadata-tools/discussions)

```
npm install
npm test
```
