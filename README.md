# ENS Metadata Tools

**A comprehensive toolkit for ENS contract metadata management, security analysis, and subdomain planning.**

## Installation

```bash
cd /Users/acc/ens-contracts/tools
npm install
```

## Quick Start

### Command Line Interface
```bash
# Generate metadata for a protocol
npm run metadata -- --category defi --type amm --name uniswap --version 3

# Validate ENS domain naming
npm run validate -- uniswap.eth --category defi

# Plan subdomain structure
npm run plan -- uniswap.eth --category defi --type amm --version 3

# Probe ENS resolvers
npm run probe -- --address 0x123...

# Lookup names by resolver
npm run lookup
```

### Using the CLI directly
```bash
node index.js metadata --category defi --type amm --name uniswap
node index.js validate uniswap.eth --category defi
node index.js plan uniswap.eth --category defi --type amm --version 3
```

## Available Commands

### `metadata` - Generate Protocol Metadata
Generate comprehensive metadata files for protocols and their subdomains.

```bash
node index.js metadata [options]

Options:
  -c, --category <category>  Protocol category (defi, dao, infrastructure, etc.)
  -t, --type <type>          Protocol type (amm, lending, governance, etc.)
  -n, --name <name>          Protocol name
  -v, --version <version>    Protocol version
  -o, --output <file>        Output file path
```

**Examples:**
```bash
# Generate Uniswap V3 metadata
node index.js metadata --category defi --type amm --name uniswap --version 3

# Generate DAO governance metadata
node index.js metadata --category dao --type governance --name ensdao
```

### `validate` - Validate ENS Naming
Validate ENS domain naming conventions and security compliance.

```bash
node index.js validate <domain> [options]

Arguments:
  <domain>                   Domain to validate

Options:
  -c, --category <category>  Expected category
  --strict                   Strict validation mode
  -m, --metadata <file>      Metadata file to validate against
```

**Examples:**
```bash
# Basic validation
node index.js validate uniswap.eth

# Strict validation with category check
node index.js validate v3.uniswap.amm.eth --category defi --strict
```

### `plan` - Plan Subdomain Structure
Plan and generate subdomain hierarchies for protocols.

```bash
node index.js plan <domain> [options]

Arguments:
  <domain>                   Root domain for planning

Options:
  -c, --category <category>  Protocol category
  -t, --type <type>          Protocol type
  -v, --version <version>    Protocol version
```

**Examples:**
```bash
# Plan Uniswap subdomain structure
node index.js plan uniswap.eth --category defi --type amm --version 3

# Plan ENS DAO structure
node index.js plan ensdao.eth --category dao --type governance
```

### `probe` - Probe ENS Contracts
Probe and analyze ENS resolvers and contract addresses.

```bash
node index.js probe [options]

Options:
  -a, --address <address>    Specific address to probe
  -m, --multicall            Use multicall for batch probing
  -o, --output <file>        Output file path
```

### `lookup` - Lookup Resolver Names
Lookup all ENS names associated with specific resolvers.

```bash
node index.js lookup [options]

Options:
  -r, --resolver <address>   Specific resolver address
  -o, --output <file>        Output file path
```

### `security` - Security Analysis
Analyze security posture of ENS domains (placeholder).

```bash
node index.js security <domain> [options]

Arguments:
  <domain>                   Domain to analyze

Options:
  --check-fuses              Check ENS Name Wrapper fuses
  --check-verification       Check identity verification
  -o, --output <file>        Output file path
```

## Directory Structure

```
tools/
├── bin/                    # CLI tools and utilities
│   ├── metadata-generator.js
│   ├── naming-validator.js
│   ├── subdomain-planner.js
│   └── cli.js
├── metadata/               # Metadata files and templates
│   ├── protocols/          # Protocol-specific metadata
│   ├── templates/          # Metadata templates
│   ├── suggestions/        # Protocol suggestions
│   └── infrastructure/     # Infrastructure metadata
├── generators/             # Setup scripts and plans
│   ├── *-setup.sh         # Protocol setup scripts
│   └── *-plan.json        # Deployment plans
├── prober/                # ENS resolver probing tools
└── index.js               # Main CLI entry point
```

## Protocol Categories

### DeFi Protocols
- **AMM**: Uniswap, Balancer, SushiSwap
- **Lending**: Aave, Compound, MakerDAO
- **Derivatives**: Synthetix, Perpetual Protocol
- **Stablecoins**: Dai, USDC, FRAX
- **Yield**: Yearn, Convex, Idle

### DAO/Governance
- **Governor**: OpenZeppelin, Aragon frameworks
- **Treasury**: Multi-sig, operational wallets
- **Token**: Governance, voting tokens

### Infrastructure
- **Oracles**: Chainlink, Pyth, API3
- **Bridges**: LayerZero, Polygon Bridge
- **Sequencers**: Optimism, Arbitrum

### Token Standards
- **ERC-20**: Fungible tokens
- **ERC-721**: NFTs, gaming assets
- **ERC-1155**: Multi-tokens
- **Governance**: Voting tokens

## Metadata Templates

The toolkit includes comprehensive metadata templates for:

- **Protocol Information**: Name, version, description, links
- **Contract Addresses**: Factory, router, governance contracts
- **Security Settings**: Fuse configurations, access controls
- **Governance Parameters**: Voting periods, thresholds, quorum
- **Token Information**: Supply, distribution, delegation

## Security Features

### ENS Name Wrapper Integration
Tools integrate with ENS Name Wrappers for enhanced security:

- Fuse configuration validation
- Parent control verification
- Expiry management
- Subdomain security assessment

### Trustless Verification
Multi-layered verification system:

- Identity proof validation
- Multi-signature verification
- On-chain registry integration
- Cross-protocol verification

## Development

### Adding New Protocol Types

1. Create metadata template in `metadata/templates/`
2. Add generation logic to `bin/metadata-generator.js`
3. Update validation rules in `bin/naming-validator.js`
4. Add setup script to `generators/`

### Dependencies

- **ethers**: Ethereum interaction
- **node-fetch**: HTTP requests for subgraph queries
- **commander**: CLI framework
- **chalk**: Terminal styling
- **inquirer**: Interactive prompts

## License

MIT
