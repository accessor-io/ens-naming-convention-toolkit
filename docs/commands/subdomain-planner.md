# subdomain-planner

Plan and organize subdomain structures for protocols with optimal naming hierarchies.

## Purpose

The `subdomain-planner` command generates optimal subdomain hierarchies for protocols, including metadata files, registration scripts, and cross-reference mappings.

## Usage

```bash
subdomain-planner [options]
```

## Options

- `--domain <domain>` - Root domain for planning
- `--category <category>` - Protocol category
- `--type <type>` - Protocol type
- `--interactive` - Interactive mode for guided planning
- `--template <template>` - Use specific planning template
- `--output <file>` - Save plan to file
- `--variables <file>` - Load variables from JSON file
- `--generate-scripts` - Generate registration scripts
- `--generate-metadata` - Generate metadata for each subdomain

## Examples

### Interactive Planning

```bash
subdomain-planner --interactive
```

**Expected Output**:

```
SUBDOMAIN PLANNER - INTERACTIVE MODE
════════════════════════════════════════════════════════════════════

Select protocol category:
1) DeFi (defi)
2) DAO (dao)
3) Infrastructure (infrastructure)
4) Tokens (tokens)
5) Gaming (gaming)
6) Social (social)
7) RWA (rwa)
8) Privacy (privacy)
9) Developer (developer)
10) Analytics (analytics)

Enter choice (1-10): 1

Select DeFi protocol type:
1) AMM (amm)
2) Lending (lending)
3) Stablecoin (stablecoin)
4) DEX (dex)
5) Derivatives (derivatives)

Enter choice (1-5): 1

Enter protocol name: Uniswap
Enter protocol version: 3
Enter root domain: uniswap.eth

SUBDOMAIN PLAN: UNISWAP
════════════════════════════════════════════════════════════════════
Category: DEFI
Type: AMM
Variables: {"version":"3","tvl":"5000000000"}

SUBDOMAIN HIERARCHY:
amm.uniswap.defi.evmd.eth
├── factory.amm.uniswap.defi.evmd.eth
├── router.amm.uniswap.defi.evmd.eth
├── quoter.amm.uniswap.defi.evmd.eth
└── multicall.amm.uniswap.defi.evmd.eth

REGISTRATION SCRIPT:
#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2024-01-15T10:30:00.000Z
# Category: defi, Type: amm

# Register factory subdomain
ens-contract register factory.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...

# Register router subdomain
ens-contract register router.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...

# Register quoter subdomain
ens-contract register quoter.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...

# Register multicall subdomain
ens-contract register multicall.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...
```

**Desired Outcome**: Generate complete subdomain hierarchy with registration scripts and metadata.

**How to Use Results**: Execute registration script to create subdomains, use generated metadata for each subdomain.

### Direct Planning

```bash
subdomain-planner --domain uniswap.eth --category defi --type amm --output uniswap-plan.json
```

**Expected Output**:

```json
{
  "plan": {
    "id": "uniswap-defi-amm-plan",
    "protocol": "Uniswap",
    "category": "defi",
    "type": "amm",
    "rootDomain": "uniswap.eth",
    "variables": {
      "version": "3",
      "tvl": "5000000000"
    },
    "subdomains": [
      {
        "label": "factory",
        "fullDomain": "factory.amm.uniswap.defi.evmd.eth",
        "owner": "{{ownerAddress}}",
        "controller": "{{controllerAddress}}",
        "resolver": "{{resolverAddress}}",
        "metadata": {
          "role": "factory",
          "description": "Uniswap V3 factory contract",
          "address": "{{factoryAddress}}",
          "deployedBlock": "{{deploymentBlock}}"
        }
      },
      {
        "label": "router",
        "fullDomain": "router.amm.uniswap.defi.evmd.eth",
        "owner": "{{ownerAddress}}",
        "controller": "{{controllerAddress}}",
        "resolver": "{{resolverAddress}}",
        "metadata": {
          "role": "router",
          "description": "Uniswap V3 router contract",
          "address": "{{routerAddress}}",
          "deployedBlock": "{{deploymentBlock}}"
        }
      }
    ],
    "registrationScript": "#!/bin/bash\n# Subdomain Registration Script for uniswap\n# Generated on 2024-01-15T10:30:00.000Z\n# Category: defi, Type: amm\n\n# Register factory subdomain\nens-contract register factory.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...\n\n# Register router subdomain\nens-contract register router.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...\n\n# Register quoter subdomain\nens-contract register quoter.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...\n\n# Register multicall subdomain\nens-contract register multicall.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...",
    "crossReferences": {
      "factory": ["router", "quoter"],
      "router": ["factory", "quoter", "multicall"],
      "quoter": ["factory", "router"],
      "multicall": ["router"]
    }
  }
}
```

**Desired Outcome**: Generate structured subdomain plan with metadata and cross-references.

**How to Use Results**: Use plan structure for implementation, execute registration script, validate cross-references.

### Template-Based Planning

```bash
subdomain-planner --template defi-amm.json --variables uniswap-vars.json --output uniswap-plan.json
```

**Expected Output**: Plan generated from template with custom variables.

**Desired Outcome**: Generate plan using predefined template structure.

**How to Use Results**: Use template-based approach for consistent planning across similar protocols.

## Planning Templates

### DeFi AMM Template

```json
{
  "template": {
    "category": "defi",
    "type": "amm",
    "subdomains": [
      {
        "label": "factory",
        "role": "factory",
        "description": "{{protocolName}} {{version}} factory contract"
      },
      {
        "label": "router",
        "role": "router",
        "description": "{{protocolName}} {{version}} router contract"
      },
      {
        "label": "quoter",
        "role": "quoter",
        "description": "{{protocolName}} {{version}} quoter contract"
      },
      {
        "label": "multicall",
        "role": "multicall",
        "description": "{{protocolName}} {{version}} multicall contract"
      }
    ]
  }
}
```

### DAO Governance Template

```json
{
  "template": {
    "category": "dao",
    "type": "governor",
    "subdomains": [
      {
        "label": "governor",
        "role": "governor",
        "description": "{{protocolName}} governance contract"
      },
      {
        "label": "treasury",
        "role": "treasury",
        "description": "{{protocolName}} treasury contract"
      },
      {
        "label": "token",
        "role": "token",
        "description": "{{protocolName}} governance token"
      }
    ]
  }
}
```

## Variable Substitution

### Common Variables

- `{{protocolName}}` - Protocol name
- `{{version}}` - Protocol version
- `{{category}}` - Protocol category
- `{{type}}` - Protocol type
- `{{rootDomain}}` - Root domain
- `{{ownerAddress}}` - Owner address
- `{{controllerAddress}}` - Controller address
- `{{resolverAddress}}` - Resolver address

### Contract Variables

- `{{factoryAddress}}` - Factory contract address
- `{{routerAddress}}` - Router contract address
- `{{governorAddress}}` - Governor contract address
- `{{treasuryAddress}}` - Treasury contract address
- `{{tokenAddress}}` - Token contract address

## Cross-Reference Management

### Automatic Cross-References

The planner automatically generates cross-references between related subdomains:

```json
{
  "crossReferences": {
    "factory": ["router", "quoter"],
    "router": ["factory", "quoter", "multicall"],
    "quoter": ["factory", "router"],
    "multicall": ["router"]
  }
}
```

### Manual Cross-References

Add custom cross-references in the plan:

```json
{
  "customCrossReferences": {
    "factory": ["custom-contract"],
    "router": ["external-service"]
  }
}
```

## Registration Scripts

### Generated Scripts

The planner generates executable shell scripts for subdomain registration:

```bash
#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2024-01-15T10:30:00.000Z
# Category: defi, Type: amm

# Register factory subdomain
ens-contract register factory.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...

# Register router subdomain
ens-contract register router.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b...
```

### Script Customization

Customize generated scripts with additional options:

```bash
# Add custom options
ens-contract register factory.amm.uniswap.defi.evmd.eth --owner 0x1234... --resolver 0x231b... --fuses CANNOT_UNWRAP
```

## Validation Integration

### Plan Validation

```bash
subdomain-planner --domain uniswap.eth --category defi --type amm --validate
```

**Expected Output**: Validation report for the generated plan.

**Desired Outcome**: Ensure plan compliance with naming conventions and standards.

**How to Use Results**: Fix validation issues before implementation.

### Metadata Validation

```bash
subdomain-planner --domain uniswap.eth --category defi --type amm --validate-metadata
```

**Expected Output**: Metadata validation report for each subdomain.

**Desired Outcome**: Ensure metadata compliance and completeness.

**How to Use Results**: Fix metadata issues before registration.

## Next Steps

- [ens-contract](ens-contract.md) - Execute registration scripts
- [ens-validator](ens-validator.md) - Validate generated subdomains
- [metadata-generator](metadata-generator.md) - Generate metadata for subdomains
- [Results and Workflows](../Results-and-Workflows.md) - How to use planning results
- [Interconnectivity](../Interconnectivity.md) - How planning fits into workflows
