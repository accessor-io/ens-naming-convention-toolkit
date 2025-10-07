# ENS Metadata Tools

Toolkit for discovering ENS resolvers, auditing contract addresses, and generating metadata reports. Includes CLI utilities for contract discovery, resolver analysis, subdomain planning, metadata generation, and security auditing.

## Features

- Contract discovery via on-chain bytecode checks.
- Resolver lookup with analytics, capability inspection, and ENS record summaries.
- Subdomain planner and naming validator for consistent ENS naming structures.
- Metadata generators and fillers for protocol templates.
- Security analyzer for ENS domains and Name Wrapper fuse checks.
- Interactive EVMD launcher to explore tooling from a single menu.

## Installation

```bash
git clone https://github.com/ens-contracts/metadata-tools.git
cd metadata-tools
npm install
```

## Quick Start

```bash
# Contract discovery: find out if addresses are contracts
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID \
  node prober/contract-discovery.js 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

# Resolver lookup: sample domains using a resolver address
node prober/lookup-resolver-names.js check-resolvers 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63

# Interactive EVMD menu
node bin/evmd.js
```

## CLI Commands

- `node prober/contract-discovery.js` – determine if Ethereum addresses are contracts.
- `node prober/lookup-resolver-names.js` – resolver toolkit with commands such as:
  - `addresses` – list unique resolver addresses.
  - `check-resolvers` – list domains that use given resolver addresses.
  - `lookup <domain|address>` – resolve ENS domains or list domains for a resolver.
  - `resolve <domain>` – test ENS resolution with on-chain calls.
- `node bin/subdomain-planner.mjs --interactive` – guided ENS subdomain planner.
- `node bin/metadata-generator.mjs` – generate metadata templates.
- `node bin/metadata-filler.mjs` – fill metadata plans with live contract data.
- `node bin/security-analyzer.js` – assess ENS domain configuration with fuse checks and verifications.
- `node bin/cli.mjs` – master CLI for protocols and metadata tasks.

## Scripts

`package.json` exposes helper scripts:

- `npm run probe` – ENS resolver prober (multicall).
- `npm run lookup` – resolver lookup toolkit.
- `npm run plan` – interactive subdomain planner.
- `npm run metadata` – metadata generator CLI.
- `npm run security` – security analyzer.
- `npm run cache` – cached resolver browser.

## AWS & Automation

- CDK stack (`aws/cdk`) for deploying metadata tooling infrastructure.
- Lambda handlers for resolver lookup, metadata generation, and security analysis.
- Bash scripts under `aws/scripts` for deployment automation.

## Development

```bash
npm install
npx hardhat compile
npm test
```

### Testing

The project includes a comprehensive test suite using Jest:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- contract-discovery.test.js
```

### Lint & checks:

```bash
node scripts/error-checker.sh
```

## Documentation

- `docs/ENS-CONTRACT-RESOLVER-API.md` – resolver prober API details.
- `docs/CACHE-BROWSER.md` – cache browser usage.
- `ORGANIZATION.md` – project directory structure overview.

## Project Structure

- `bin/` - CLI tools and executables
- `prober/` - ENS resolver probing and analysis tools
- `data/` - Generated metadata and configuration files
- `test/` - Comprehensive test suite
- `aws/` - AWS infrastructure and Lambda functions
- `docs/` - Project documentation

## Recent Improvements

- ✅ Resolved git merge conflicts
- ✅ Organized untracked files into proper directories
- ✅ Fixed package.json script inconsistencies
- ✅ Standardized ES module usage
- ✅ Updated dependencies to latest versions
- ✅ Added comprehensive test suite with Jest
- ✅ Improved error handling and logging

## Contributing

1. Fork the repository and create a feature branch.
2. Add tests for new functionality.
3. Run `npm test` to ensure all tests pass.
4. Run `node scripts/error-checker.sh` before opening a PR.

## License

MIT
