# evmd

EVM metadata operations and contract analysis.

## Purpose

The `evmd` command provides EVM-specific metadata operations, including contract analysis, metadata generation, and blockchain data extraction.

## Usage

```bash
evmd [command] [options]
```

## Commands

### analyze

Analyze contract metadata and functionality.

**Usage**: `evmd analyze <contract> [options]`

**Options**:

- `--type <type>` - Contract type (erc20, erc721, ens, custom)
- `--network <network>` - Blockchain network (mainnet, goerli, sepolia)
- `--output <file>` - Save analysis to file
- `--format <format>` - Output format (text, json, html)
- `--verbose` - Verbose output with detailed information

**Example**:

```bash
evmd analyze 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --output analysis.json
```

**Expected Output**:

```
Contract Analysis: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
════════════════════════════════════════════════════════════════════
Type: ERC-20 Token
Network: Mainnet
Block: 12345678

Basic Information:
  Name: Uniswap Token
  Symbol: UNI
  Decimals: 18
  Total Supply: 1,000,000,000 UNI

Contract Details:
  Implementation: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
  Proxy: No
  Upgradeable: No
  Pausable: No

Functions:
  transfer(address,uint256) - Transfer tokens
  approve(address,uint256) - Approve spending
  balanceOf(address) - Get balance
  totalSupply() - Get total supply

Events:
  Transfer(address,address,uint256) - Token transfer
  Approval(address,address,uint256) - Approval event

Security:
  Audited: Yes
  Audit Firm: Trail of Bits
  Audit Date: 2020-09-15
  Findings: 2 medium, 1 low
```

**Desired Outcome**: Analyze contract functionality and generate metadata.

**How to Use Results**: Use analysis for contract documentation and metadata generation.

### generate

Generate metadata for EVM contracts.

**Usage**: `evmd generate metadata --type <type> [options]`

**Options**:

- `--type <type>` - Contract type (required)
- `--address <address>` - Contract address
- `--name <name>` - Contract name
- `--symbol <symbol>` - Token symbol
- `--output <file>` - Save metadata to file
- `--template <template>` - Use specific template

**Example**:

```bash
evmd generate metadata --type erc20 --address 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --name "Uniswap Token" --symbol UNI --output uni-metadata.json
```

**Expected Output**:

```json
{
  "id": "uni-token-erc20",
  "org": "Uniswap Labs",
  "protocol": "UNI",
  "category": "tokens",
  "role": "erc20",
  "version": "1",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "deployedBlock": "12345678"
    }
  ],
  "subcategory": "governance-token",
  "ensRoot": "uni.tokens.eth",
  "variant": "standard",
  "standards": ["ERC20", "ERC165"],
  "artifacts": {
    "abiHash": "0x...",
    "sourceUri": "https://github.com/Uniswap/uniswap-v2-core",
    "license": "GPL-2.0"
  },
  "lifecycle": {
    "status": "deployed",
    "since": "2020-09-15T00:00:00Z",
    "replacedBy": null
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "date": "2020-09-15",
        "report": "https://...",
        "findings": "2 medium, 1 low"
      }
    ],
    "owners": ["0x..."],
    "upgradeability": "immutable",
    "permissions": ["admin"]
  },
  "tags": ["tokens", "erc20", "uni", "governance"],
  "subdomains": [
    {
      "label": "token",
      "owner": "0x...",
      "controller": "0x...",
      "resolver": "0x...",
      "records": {}
    }
  ]
}
```

**Desired Outcome**: Generate standardized metadata for EVM contract.

**How to Use Results**: Use generated metadata for ENS domain management and documentation.

### probe

Probe contract functions and state.

**Usage**: `evmd probe <address> [options]`

**Options**:

- `--type <type>` - Contract type
- `--functions <functions>` - Specific functions to probe
- `--network <network>` - Blockchain network
- `--output <file>` - Save probe results to file
- `--batch` - Batch probe multiple contracts

**Example**:

```bash
evmd probe 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --functions name,symbol,decimals,totalSupply --output probe-results.json
```

**Expected Output**:

```
Contract Probe Results
════════════════════════════════════════════════════════════════════
Address: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
Type: ERC-20 Token
Network: Mainnet

Function Results:
  name(): "Uniswap Token"
  symbol(): "UNI"
  decimals(): 18
  totalSupply(): "1000000000000000000000000000"

State Variables:
  _name: "Uniswap Token"
  _symbol: "UNI"
  _decimals: 18
  _totalSupply: "1000000000000000000000000000"

Gas Usage:
  name(): 2,300 gas
  symbol(): 2,300 gas
  decimals(): 2,100 gas
  totalSupply(): 2,100 gas
```

**Desired Outcome**: Probe contract functions and retrieve state information.

**How to Use Results**: Use probe results for contract analysis and metadata generation.

### validate

Validate contract against standards.

**Usage**: `evmd validate <contract> [options]`

**Options**:

- `--type <type>` - Contract type
- `--standard <standard>` - Standard to validate against
- `--network <network>` - Blockchain network
- `--output <file>` - Save validation results to file
- `--strict` - Strict validation mode

**Example**:

```bash
evmd validate 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --standard ERC20 --output validation-results.json
```

**Expected Output**:

```
Contract Validation Report
════════════════════════════════════════════════════════════════════
Address: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
Type: ERC-20 Token
Standard: ERC20
Network: Mainnet

Validation Results:
✓ Required Functions: PASS
  ✓ transfer(address,uint256): Present
  ✓ approve(address,uint256): Present
  ✓ balanceOf(address): Present
  ✓ totalSupply(): Present

✓ Required Events: PASS
  ✓ Transfer(address,address,uint256): Present
  ✓ Approval(address,address,uint256): Present

✓ Function Signatures: PASS
  ✓ All function signatures match ERC-20 standard

✓ Gas Usage: PASS
  ✓ Gas usage within acceptable limits

Overall Score: 100/100
Status: COMPLIANT
```

**Desired Outcome**: Validate contract compliance with specified standards.

**How to Use Results**: Use validation results for compliance verification and quality assurance.

## Contract Types

### ERC-20 Tokens

Standard token contracts with transfer and approval functionality.

**Supported Functions**:

- `name()` - Token name
- `symbol()` - Token symbol
- `decimals()` - Token decimals
- `totalSupply()` - Total supply
- `balanceOf(address)` - Balance of address
- `transfer(address,uint256)` - Transfer tokens
- `approve(address,uint256)` - Approve spending
- `allowance(address,address)` - Check allowance

### ERC-721 NFTs

Non-fungible token contracts with unique token IDs.

**Supported Functions**:

- `name()` - Collection name
- `symbol()` - Collection symbol
- `totalSupply()` - Total supply
- `tokenURI(uint256)` - Token metadata URI
- `ownerOf(uint256)` - Owner of token
- `transferFrom(address,address,uint256)` - Transfer token
- `approve(address,uint256)` - Approve token
- `setApprovalForAll(address,bool)` - Set approval for all

### ENS Contracts

Ethereum Name Service contracts for domain management.

**Supported Functions**:

- `owner(bytes32)` - Domain owner
- `resolver(bytes32)` - Domain resolver
- `ttl(bytes32)` - Domain TTL
- `setOwner(bytes32,address)` - Set owner
- `setResolver(bytes32,address)` - Set resolver
- `setTTL(bytes32,uint256)` - Set TTL

### Custom Contracts

Generic contract analysis for custom implementations.

**Supported Operations**:

- Function discovery
- Event analysis
- State variable extraction
- Gas usage analysis
- Security assessment

## Network Support

### Mainnet

Ethereum mainnet with full contract support.

### Testnets

- Goerli (deprecated)
- Sepolia (recommended)
- Holesky (newest)

### Layer 2 Networks

- Polygon
- Arbitrum
- Optimism
- Base

## Integration with Other Tools

### Metadata Generator Integration

```bash
evmd analyze 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 | metadata-generator --category tokens --type erc20
```

**Expected Output**: Chain analysis results to metadata generation.

**Desired Outcome**: Automate metadata generation from contract analysis.

**How to Use Results**: Use for automated metadata generation workflows.

### Security Analysis Integration

```bash
evmd analyze 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --security | security-analyzer --metadata
```

**Expected Output**: Chain analysis results to security analysis.

**Desired Outcome**: Automate security analysis from contract analysis.

**How to Use Results**: Use for automated security assessment workflows.

### Validation Integration

```bash
evmd validate 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --standard ERC20 | ens-validator --metadata
```

**Expected Output**: Chain validation results to domain validation.

**Desired Outcome**: Automate domain validation from contract validation.

**How to Use Results**: Use for automated compliance validation workflows.

## Error Handling

### Common Errors

1. **Contract Not Found**
   - Error: Contract does not exist at address
   - Solution: Verify contract address and network

2. **Network Issues**
   - Error: Cannot connect to blockchain network
   - Solution: Check network connectivity and RPC endpoint

3. **Function Not Found**
   - Error: Function does not exist on contract
   - Solution: Check contract type and function availability

4. **Validation Failures**
   - Error: Contract does not comply with standard
   - Solution: Review contract implementation and standards

## Next Steps

- [metadata-generator](metadata-generator.md) - Generate metadata from analysis
- [security-analyzer](security-analyzer.md) - Analyze security from contract data
- [Results and Workflows](../Results-and-Workflows.md) - How to use EVM analysis results
- [Interconnectivity](../Interconnectivity.md) - How EVM operations fit into workflows
