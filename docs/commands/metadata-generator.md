# metadata-generator

Generate standardized metadata templates for different contract categories and types.

## Purpose

The `metadata-generator` command creates standardized metadata templates for protocols, contracts, and subdomains based on category and type specifications.

## Usage

```bash
metadata-generator --category <category> --type <type> [options]
```

## Required Options

- `--category <cat>` - Protocol category (required)
- `--type <type>` - Protocol type (required)

## Optional Options

- `--name <name>` - Protocol/contract name
- `--version <ver>` - Version number
- `--symbol <sym>` - Token symbol
- `--supply <num>` - Token supply
- `--output <file>` - Save to file
- `--template <template>` - Use specific template
- `--variables <file>` - Load variables from JSON file

## Categories and Types

### DeFi Categories

- `defi` - General DeFi protocols
  - `amm` - Automated Market Makers
  - `lending` - Lending protocols
  - `stablecoin` - Stablecoin protocols
  - `dex` - Decentralized exchanges
  - `derivatives` - Derivative protocols

### DAO Categories

- `dao` - General DAO protocols
  - `governor` - Governance contracts
  - `treasury` - Treasury management
  - `voting` - Voting mechanisms

### Infrastructure Categories

- `infrastructure` - General infrastructure
  - `oracle` - Price oracles
  - `bridge` - Cross-chain bridges
  - `proxy` - Proxy contracts
  - `rpc` - RPC providers

### Token Categories

- `tokens` - General token contracts
  - `erc20` - ERC-20 tokens
  - `erc721` - ERC-721 NFTs
  - `governance` - Governance tokens
  - `utility` - Utility tokens

## Examples

### DeFi AMM Metadata

```bash
metadata-generator --category defi --type amm --name Uniswap --version 3 --output uniswap-metadata.json
```

**Expected Output**:

```json
{
  "id": "uniswap-v3-amm-defi",
  "org": "Uniswap Labs",
  "protocol": "Uniswap",
  "category": "defi",
  "role": "amm",
  "version": "3",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "{{factoryAddress}}",
      "deployedBlock": "{{deploymentBlock}}"
    }
  ],
  "subcategory": "automated-market-maker",
  "ensRoot": "uniswap.defi.eth",
  "variant": "v3",
  "standards": ["ERC20", "ERC165"],
  "artifacts": {
    "abiHash": "{{abiHash}}",
    "sourceUri": "https://github.com/Uniswap/v3-core",
    "license": "GPL-2.0"
  },
  "lifecycle": {
    "status": "deployed",
    "since": "{{launchDate}}",
    "replacedBy": null
  },
  "security": {
    "audits": [
      {
        "firm": "{{auditFirm}}",
        "date": "{{auditDate}}",
        "report": "{{auditReport}}",
        "findings": "{{auditFindings}}"
      }
    ],
    "owners": ["{{ownerAddress}}"],
    "upgradeability": "immutable",
    "permissions": ["admin", "pauser"]
  },
  "tags": ["defi", "amm", "uniswap", "v3"],
  "subdomains": [
    {
      "label": "factory",
      "owner": "{{ownerAddress}}",
      "controller": "{{controllerAddress}}",
      "resolver": "{{resolverAddress}}",
      "records": {}
    }
  ]
}
```

**Desired Outcome**: Generate standardized metadata template for Uniswap V3 AMM protocol.

**How to Use Results**: Use the generated metadata for ENS domain registration, subdomain planning, and validation.

### DAO Governance Metadata

```bash
metadata-generator --category dao --type governor --name ENS --token ENS --output ens-governance.json
```

**Expected Output**:

```json
{
  "id": "ens-dao-governor",
  "org": "ENS DAO",
  "protocol": "ENS",
  "category": "dao",
  "role": "governor",
  "version": "1",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "{{governorAddress}}",
      "deployedBlock": "{{deploymentBlock}}"
    }
  ],
  "subcategory": "governance",
  "ensRoot": "ens.dao.eth",
  "variant": "standard",
  "standards": ["ERC20", "ERC165"],
  "artifacts": {
    "abiHash": "{{abiHash}}",
    "sourceUri": "https://github.com/ensdomains/governance",
    "license": "MIT"
  },
  "lifecycle": {
    "status": "deployed",
    "since": "{{launchDate}}",
    "replacedBy": null
  },
  "security": {
    "audits": [
      {
        "firm": "{{auditFirm}}",
        "date": "{{auditDate}}",
        "report": "{{auditReport}}",
        "findings": "{{auditFindings}}"
      }
    ],
    "owners": ["{{ownerAddress}}"],
    "upgradeability": "upgradeable",
    "permissions": ["admin", "governor"]
  },
  "tags": ["dao", "governance", "ens"],
  "subdomains": [
    {
      "label": "governor",
      "owner": "{{ownerAddress}}",
      "controller": "{{controllerAddress}}",
      "resolver": "{{resolverAddress}}",
      "records": {}
    }
  ]
}
```

**Desired Outcome**: Generate standardized metadata template for ENS DAO governance contract.

**How to Use Results**: Use for governance contract documentation and ENS domain management.

### Token Metadata

```bash
metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000 --output uni-token.json
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
      "address": "{{tokenAddress}}",
      "deployedBlock": "{{deploymentBlock}}"
    }
  ],
  "subcategory": "governance-token",
  "ensRoot": "uni.tokens.eth",
  "variant": "standard",
  "standards": ["ERC20", "ERC165"],
  "artifacts": {
    "abiHash": "{{abiHash}}",
    "sourceUri": "https://github.com/Uniswap/uniswap-v2-core",
    "license": "GPL-2.0"
  },
  "lifecycle": {
    "status": "deployed",
    "since": "{{launchDate}}",
    "replacedBy": null
  },
  "security": {
    "audits": [
      {
        "firm": "{{auditFirm}}",
        "date": "{{auditDate}}",
        "report": "{{auditReport}}",
        "findings": "{{auditFindings}}"
      }
    ],
    "owners": ["{{ownerAddress}}"],
    "upgradeability": "immutable",
    "permissions": ["admin"]
  },
  "tags": ["tokens", "erc20", "uni", "governance"],
  "subdomains": [
    {
      "label": "token",
      "owner": "{{ownerAddress}}",
      "controller": "{{controllerAddress}}",
      "resolver": "{{resolverAddress}}",
      "records": {}
    }
  ]
}
```

**Desired Outcome**: Generate standardized metadata template for UNI token contract.

**How to Use Results**: Use for token contract documentation and ENS domain management.

## Template Variables

### Common Variables

- `{{protocolName}}` - Protocol name
- `{{version}}` - Protocol version
- `{{category}}` - Protocol category
- `{{type}}` - Protocol type
- `{{chainId}}` - Blockchain network ID
- `{{deploymentBlock}}` - Contract deployment block
- `{{launchDate}}` - Protocol launch date

### Address Variables

- `{{factoryAddress}}` - Factory contract address
- `{{routerAddress}}` - Router contract address
- `{{tokenAddress}}` - Token contract address
- `{{governorAddress}}` - Governor contract address
- `{{ownerAddress}}` - Owner address
- `{{controllerAddress}}` - Controller address
- `{{resolverAddress}}` - Resolver address

### Security Variables

- `{{auditFirm}}` - Audit firm name
- `{{auditDate}}` - Audit date
- `{{auditReport}}` - Audit report URL
- `{{auditFindings}}` - Audit findings summary
- `{{abiHash}}` - ABI hash

## Custom Templates

### Using Custom Template

```bash
metadata-generator --category defi --type amm --template custom-amm.json --output custom-metadata.json
```

### Template Structure

```json
{
  "template": {
    "id": "{{protocolName}}-{{type}}-{{category}}",
    "protocol": "{{protocolName}}",
    "category": "{{category}}",
    "role": "{{type}}",
    "version": "{{version}}"
  },
  "variables": {
    "protocolName": "Uniswap",
    "version": "3",
    "category": "defi",
    "type": "amm"
  }
}
```

## Batch Generation

### Generate All Templates for Category

```bash
metadata-generator --category defi --all --output defi-templates/
```

**Expected Output**: Directory containing all DeFi template types.

**Desired Outcome**: Generate complete set of templates for the specified category.

**How to Use Results**: Use templates as starting points for specific protocol implementations.

## Next Steps

- [ens-validator](ens-validator.md) - Validate generated metadata
- [subdomain-planner](subdomain-planner.md) - Plan subdomain structure
- [security-analyzer](security-analyzer.md) - Analyze security metadata
- [Results and Workflows](../Results-and-Workflows.md) - How to use generated metadata
- [Interconnectivity](../Interconnectivity.md) - How metadata generation fits into workflows
