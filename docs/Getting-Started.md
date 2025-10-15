# Getting Started with ENS Metadata Tools

Welcome to ENS Metadata Tools! This guide will help you get up and running quickly with our comprehensive toolkit for Ethereum Name Service (ENS) contract metadata management.

## Quick Overview

ENS Metadata Tools provides everything you need to:

- **Generate** standardized metadata for smart contracts
- **Validate** ENS naming conventions and metadata compliance
- **Plan** optimal subdomain hierarchies
- **Analyze** security posture and vulnerabilities
- **Manage** ENS contract operations

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** (recommended: 20.x) - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Git** - Version control
- **Ethereum RPC access** - Mainnet or testnet connection
- **Basic ENS knowledge** - Understanding of ENS domains and contracts

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check npm version
npm --version   # Should be 8.0.0 or higher

# Check Git installation
git --version   # Any recent version works
```

## Installation

### Option 1: Global Installation (Recommended)

Install globally to use commands from anywhere:

```bash
npm install -g ens-metadata-tools
```

**Verify installation:**

```bash
ens-metadata --version
# Should output: ens-metadata-tools v1.0.0
```

### Option 2: Local Development Installation

For contributing or advanced usage:

```bash
# Clone the repository
git clone https://github.com/ens-contracts/metadata-tools.git
cd ens-metadata-tools

# Install dependencies
npm install

# Setup development environment
npm run prepare
```

**Verify development setup:**

```bash
npm test
# Should run all tests successfully
```

## Configuration

### Environment Variables

Set the following environment variables for optimal operation:

```bash
# Ethereum RPC endpoint
export ETH_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"

# ENS Registry address (optional, defaults to mainnet)
export ENS_REGISTRY_ADDRESS="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"

# Output directory for generated files
export OUTPUT_DIR="./output"

# Enable verbose logging
export VERBOSE=true
```

### Configuration Files

Create a `config.json` file in your project root:

```json
{
  "network": "mainnet",
  "strict": false,
  "includeQA": true,
  "outputDir": "./output",
  "templates": {
    "defi": "./templates/defi.json",
    "dao": "./templates/dao.json"
  },
  "rpc": {
    "url": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    "timeout": 30000
  }
}
```

## Verification

### Check Installation

```bash
# Verify main CLI
ens-metadata --help

# Verify individual tools
ens-validator --help
ens-contract --help
metadata-generator --help
subdomain-planner --help
security-analyzer --help
```

### Test Basic Functionality

```bash
# Test metadata generation
metadata-generator --category defi --type amm --name TestProtocol --version 1.0.0

# Test domain validation
ens-validator test.eth defi --strict

# Test subdomain planning
subdomain-planner --domain test.eth --interactive
```

## Quick Start Examples

Let's walk through some real-world examples to get you comfortable with the tools:

### Example 1: Generate Metadata for a DeFi Protocol

Create standardized metadata for a new AMM protocol:

```bash
# Generate comprehensive metadata for Uniswap V3
metadata-generator \
  --category defi \
  --type amm \
  --name "Uniswap" \
  --version "3.1.0" \
  --symbol "UNI" \
  --output uniswap-v3-metadata.json

# View the generated metadata
cat uniswap-v3-metadata.json
```

**Expected Output:**

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "subcategory": "amm",
  "role": "router",
  "version": "v3-1-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "deployedBlock": 12369621
    }
  ],
  "metadataHash": "0x...",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "ercs": ["ERC-20", "ERC-165"],
    "interfaces": ["IUniswapV3Router", "IERC20"]
  }
}
```

### Example 2: Validate Domain Naming Convention

Ensure your domain follows ENS best practices:

```bash
# Validate a DeFi protocol domain
ens-validator uniswap.defi.amm.eth defi --strict --qa

# Validate with detailed output
ens-validator uniswap.defi.amm.eth defi --verbose --report validation-report.json
```

**Expected Output:**

```
[PASS] Domain validation passed
[PASS] Category 'defi' is valid
[PASS] Subcategory 'amm' is appropriate
[PASS] Naming convention follows ENSIP-19 standards
[INFO] QA Score: 95/100
```

### Example 3: Plan Optimal Subdomain Structure

Design a hierarchical subdomain structure:

```bash
# Interactive subdomain planning
subdomain-planner \
  --domain uniswap.eth \
  --category defi \
  --type amm \
  --interactive \
  --output uniswap-subdomain-plan.json

# Non-interactive planning with templates
subdomain-planner \
  --domain uniswap.eth \
  --template defi-amm \
  --output uniswap-plan.json
```

**Generated Plan Structure:**

```
uniswap.eth
├── defi/
│   ├── amm/
│   │   ├── router.cns.eth
│   │   ├── factory.cns.eth
│   │   └── quoter.cns.eth
│   ├── governance/
│   │   └── governor.cns.eth
│   └── token/
│       └── token.cns.eth
├── tools/
│   ├── analytics.cns.eth
│   └── api.cns.eth
└── docs/
    └── documentation.cns.eth
```

### Example 4: Comprehensive Security Analysis

Analyze the security posture of an ENS domain:

```bash
# Full security analysis
security-analyzer \
  --domain vitalik.eth \
  --check-fuses \
  --check-proxy \
  --check-ownership \
  --output security-analysis.json

# Quick security check
security-analyzer vitalik.eth --quick
```

**Security Report Example:**

```json
{
  "domain": "vitalik.eth",
  "securityGrade": "A",
  "score": 92,
  "checks": {
    "fuses": {
      "status": "passed",
      "details": "All fuses properly configured"
    },
    "proxy": {
      "status": "passed",
      "details": "No proxy vulnerabilities detected"
    },
    "ownership": {
      "status": "passed",
      "details": "Ownership properly configured"
    }
  },
  "recommendations": [
    "Consider enabling additional security fuses",
    "Regular security audits recommended"
  ]
}
```

### Example 5: Contract Discovery and Analysis

Probe and analyze smart contract functionality:

```bash
# Analyze ERC-20 token contract
node tools/prober/probe-multicall.js \
  0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 \
  --type erc20 \
  --output uniswap-token-analysis.json

# Analyze AMM router contract
node tools/prober/probe-multicall.js \
  0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --type amm-router \
  --methods all \
  --output router-analysis.json
```

**Analysis Output:**

```json
{
  "contract": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "type": "ERC-20",
  "methods": {
    "totalSupply": "1000000000000000000000000000",
    "name": "Uniswap",
    "symbol": "UNI",
    "decimals": 18
  },
  "interfaces": ["IERC20", "IERC20Metadata"],
  "security": {
    "pausable": false,
    "upgradeable": false,
    "admin": "0x0000000000000000000000000000000000000000"
  }
}
```

## Development Setup

### Clone and Install

```bash
git clone https://github.com/ens-contracts/metadata-tools.git
cd ens-metadata-tools
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="validation"
```

### Development Workflow

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Build project
npm run build
```

## Troubleshooting

### Common Issues

1. **Network Connection Errors**
   - Verify RPC endpoint is accessible
   - Check network connectivity
   - Ensure API key is valid

2. **Validation Failures**
   - Review error messages for specific issues
   - Check domain format and naming conventions
   - Verify metadata schema compliance

3. **Permission Errors**
   - Ensure proper file permissions for output directory
   - Check write access to project directory

4. **Memory Issues**
   - Use batch processing for large datasets
   - Increase Node.js memory limit: `node --max-old-space-size=4096`

### Getting Help

- Use `--help` flag with any command
- Check logs with `--verbose` flag
- Review error messages for specific guidance
- Consult [CLI Commands](commands/) documentation
- Check [Architecture](Architecture.md) for system understanding

## Next Steps

- [CLI Commands](commands/) - Learn about available commands
- [Architecture](Architecture.md) - Understand system design
- [API Documentation](API/) - Programmatic usage
- [Tools](Tools.md) - Local tools and utilities
- [Interconnectivity](Interconnectivity.md) - How components work together
