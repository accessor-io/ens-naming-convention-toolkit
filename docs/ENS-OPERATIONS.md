# ENS Operations Tool

A comprehensive command-line tool for ENS naming operations including subname registration, fuse management, resolver configuration, and reverse resolution.

## Overview

The ENS Operations Tool (`ens-contract`) provides a unified interface for all ENS naming operations, supporting both ENSv2 (legacy) and ENSv3 (NameWrapper) protocols. It works across multiple networks and supports both browser wallet connections and RPC-based operations.

## Installation

```bash
# Install dependencies
npm install

# Make the tool executable
chmod +x bin/ens-contract.js
```

## Quick Start

### Browser Mode (Recommended)

```bash
# Connect to MetaMask or other browser wallet
node bin/ens-contract.js info vitalik.eth
```

### Node.js Mode

```bash
# Use with RPC provider and private key
node bin/ens-contract.js info vitalik.eth --rpc-url https://mainnet.infura.io/v3/YOUR_KEY --private-key YOUR_PRIVATE_KEY
```

## Commands

### 1. Register Subdomain

Register a new subdomain under an owned parent domain.

```bash
# Basic registration
ens-contract register router.uniswap.defi.eth --owner 0x1234567890123456789012345678901234567890

# With resolver and TTL
ens-contract register router.uniswap.defi.eth \
  --owner 0x1234567890123456789012345678901234567890 \
  --resolver 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63 \
  --ttl 3600

# ENSv3 with fuses
ens-contract register router.uniswap.defi.eth \
  --owner 0x1234567890123456789012345678901234567890 \
  --fuses locked \
  --expiry 1234567890
```

**Options:**

- `--owner <address>` - Owner address (required)
- `--resolver <address>` - Resolver address
- `--ttl <seconds>` - TTL value (ENSv2 only)
- `--fuses <value|template>` - Fuse value or template name (ENSv3 only)
- `--expiry <timestamp>` - Expiry timestamp (ENSv3 only)

### 2. Set Resolver

Configure the resolver for a domain.

```bash
# Set public resolver
ens-contract set-resolver router.uniswap.defi.eth --address 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63

# Set custom resolver
ens-contract set-resolver router.uniswap.defi.eth --address 0xYourCustomResolver
```

### 3. Set Fuses (ENSv3 Only)

Configure fuses for wrapped names to control permissions.

```bash
# Use predefined template
ens-contract set-fuses uniswap.defi.eth --template locked

# Use custom fuse value
ens-contract set-fuses uniswap.defi.eth --fuses 7

# Available templates
ens-contract templates
```

**Fuse Templates:**

- `locked` - Lock name with all critical fuses
- `immutable` - Make name completely immutable
- `subdomain-locked` - Lock subdomain creation only
- `resolver-locked` - Lock resolver changes

### 4. Set Records

Configure resolver records including addresses, text records, and content hashes.

```bash
# Set ETH address
ens-contract set-record router.uniswap.defi.eth --address 0xE592427A0AEce92De3Edee1F18E0157C05861564

# Set multicoin address (BTC)
ens-contract set-record router.uniswap.defi.eth --address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa --coin-type 0

# Set text records
ens-contract set-record router.uniswap.defi.eth --text url=https://uniswap.org
ens-contract set-record router.uniswap.defi.eth --text description="Uniswap V3 Router"

# Set content hash
ens-contract set-record router.uniswap.defi.eth --content-hash 0x1234...

# Multiple records in one command
ens-contract set-record router.uniswap.defi.eth \
  --address 0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --text url=https://uniswap.org \
  --text description="Uniswap V3 Router"
```

### 5. Reverse Resolution

Manage reverse records (address → name mapping).

```bash
# Set reverse record
ens-contract reverse --address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 --name vitalik.eth

# Claim reverse record
ens-contract reverse --address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 --claim

# Claim with custom resolver
ens-contract reverse --address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 --claim --resolver 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63
```

### 6. Get Information

Retrieve information about a domain.

```bash
# Basic info
ens-contract info vitalik.eth

# With fuse information
ens-contract info vitalik.eth --show-fuses

# With subdomains
ens-contract info vitalik.eth --show-subdomains

# JSON output
ens-contract info vitalik.eth --output json
```

### 7. Fuse Templates

View available fuse templates and definitions.

```bash
# Show all templates and definitions
ens-contract templates
```

## Global Options

- `--network <network>` - Network (mainnet, sepolia, goerli) [default: mainnet]
- `--rpc-url <url>` - RPC URL for Node.js mode
- `--private-key <key>` - Private key for Node.js mode
- `--output <format>` - Output format (json, table, minimal) [default: table]
- `--dry-run` - Preview transaction without sending
- `--yes` - Skip confirmation prompts

## Network Support

### Mainnet

```bash
ens-contract info vitalik.eth --network mainnet
```

### Sepolia Testnet

```bash
ens-contract info test.eth --network sepolia
```

### Goerli Testnet

```bash
ens-contract info test.eth --network goerli
```

### Custom RPC

```bash
ens-contract info vitalik.eth --rpc-url https://your-rpc-endpoint.com
```

## Wallet Connection

### Browser Wallets (MetaMask, WalletConnect, etc.)

The tool automatically detects and connects to browser wallets when running in a browser environment.

```bash
# Will prompt for wallet connection
ens-contract info vitalik.eth
```

### Node.js with Private Key

For server-side or automated operations:

```bash
# Using environment variables (recommended)
export PRIVATE_KEY="0x..."
export RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
ens-contract info vitalik.eth

# Or inline
ens-contract info vitalik.eth \
  --rpc-url https://mainnet.infura.io/v3/YOUR_KEY \
  --private-key 0x...
```

## Fuse System (ENSv3)

ENSv3 introduces a fuse system that allows granular control over name permissions. Fuses can be burned (set) but never unburned, providing permanent security guarantees.

### Critical Fuses

- `CANNOT_UNWRAP` - Cannot unwrap the name from NameWrapper
- `CANNOT_BURN_FUSES` - Cannot burn additional fuses
- `CANNOT_TRANSFER` - Cannot transfer ownership
- `CANNOT_CREATE_SUBDOMAIN` - Cannot create subdomains
- `CANNOT_APPROVE` - Cannot approve transfers
- `PARENT_CANNOT_CONTROL` - Parent domain cannot control this name

### Fuse Templates

```bash
# Lock name completely
ens-contract set-fuses myname.eth --template locked

# Make name immutable
ens-contract set-fuses myname.eth --template immutable

# Only lock subdomain creation
ens-contract set-fuses myname.eth --template subdomain-locked

# Only lock resolver changes
ens-contract set-fuses myname.eth --template resolver-locked
```

## Integration with Subdomain Planner

The tool integrates with the subdomain planner to generate working registration scripts:

```bash
# Generate subdomain plan
node bin/subdomain-planner.mjs uniswap defi amm --version 3

# This creates a working shell script that uses ens-contract commands
./uniswap-defi-amm-setup.sh
```

## Examples

### Complete Protocol Setup

```bash
# 1. Register protocol domain
ens-contract register uniswap.defi.eth --owner 0x1234...

# 2. Set resolver
ens-contract set-resolver uniswap.defi.eth --address 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63

# 3. Register router subdomain
ens-contract register router.uniswap.defi.eth --owner 0x1234...

# 4. Set router address
ens-contract set-record router.uniswap.defi.eth --address 0xE592427A0AEce92De3Edee1F18E0157C05861564

# 5. Set metadata
ens-contract set-record router.uniswap.defi.eth --text url=https://uniswap.org
ens-contract set-record router.uniswap.defi.eth --text description="Uniswap V3 Router"

# 6. Lock the domain (ENSv3)
ens-contract set-fuses uniswap.defi.eth --template locked
```

### Batch Operations

```bash
# Register multiple subdomains
for subdomain in router factory quoter; do
  ens-contract register $subdomain.uniswap.defi.eth --owner 0x1234...
done

# Set multiple records
ens-contract set-record router.uniswap.defi.eth \
  --address 0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --text url=https://uniswap.org \
  --text description="Uniswap V3 Router" \
  --text version="3.0.0"
```

### Security Best Practices

```bash
# 1. Always check domain info before operations
ens-contract info mydomain.eth --show-fuses

# 2. Use dry-run for testing
ens-contract register subdomain.mydomain.eth --owner 0x1234... --dry-run

# 3. Lock domains after setup
ens-contract set-fuses mydomain.eth --template locked

# 4. Verify operations
ens-contract info subdomain.mydomain.eth
```

## Error Handling

The tool provides detailed error messages for common issues:

```bash
# Domain not found
Get info failed: Domain test.eth does not exist

# Insufficient permissions
Registration failed: You do not own the parent domain

# Invalid fuse operation
Set fuses failed: test.eth is not wrapped. Fuses can only be set on wrapped names.

# Network issues
Wallet connection failed: No wallet provider found. Please install MetaMask or another Web3 wallet.
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure MetaMask or another Web3 wallet is installed
   - Check that the wallet is unlocked
   - Try refreshing the page and reconnecting

2. **Transaction Failed**
   - Check that you have sufficient ETH for gas
   - Verify you own the parent domain
   - Ensure the domain name is valid

3. **Fuse Operations Failed**
   - Verify the name is wrapped (ENSv3)
   - Check that fuses haven't already been burned
   - Ensure you have the necessary permissions

### Debug Mode

```bash
# Enable verbose logging
DEBUG=ens-contract:* ens-contract info vitalik.eth

# Check network connection
ens-contract info vitalik.eth --network mainnet --dry-run
```

## API Reference

### ENSOperations Class

```javascript
import { ENSOperations } from './lib/ens-operations.js';

const ens = new ENSOperations(provider, signer, 'mainnet');

// Register subdomain
await ens.register('sub.domain.eth', {
  owner: '0x1234...',
  resolver: '0x231b...',
  fuses: 'locked',
});

// Set fuses
await ens.setFuses('domain.eth', 'locked');

// Get info
const info = await ens.getInfo('domain.eth');
```

### Wallet Connector

```javascript
import { ENSWalletConnector } from './lib/ens-wallet-connector.js';

const wallet = new ENSWalletConnector();

// Browser connection
const connection = await wallet.connect();

// RPC connection
const connection = await wallet.connectWithRPC(rpcUrl, privateKey);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
