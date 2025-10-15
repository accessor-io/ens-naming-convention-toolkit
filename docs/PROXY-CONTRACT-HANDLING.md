# Proxy Contract Handling and Naming Conventions

## Overview

This document outlines how the ENS naming system handles proxy contracts and prevents redundant naming across proxy implementations, admin contracts, and related components.

## Proxy Contract Types

The system supports the following proxy patterns:

### 1. Transparent Proxy (ERC-1967)

- **Pattern**: Proxy delegates calls to implementation contract
- **Admin**: Separate admin contract controls upgrades
- **Storage**: Implementation address stored in specific slot

### 2. UUPS (Universal Upgradeable Proxy Standard)

- **Pattern**: Implementation contract handles upgrades
- **Admin**: Upgrade logic in implementation
- **Storage**: Implementation address stored in specific slot

### 3. Beacon Proxy

- **Pattern**: Multiple proxies point to single beacon
- **Admin**: Beacon contract controls implementation
- **Storage**: Beacon address stored in proxy

### 4. Diamond Proxy (ERC-2535)

- **Pattern**: Multiple implementation contracts (facets)
- **Admin**: Diamond contract manages facets
- **Storage**: Facet addresses in diamond storage

### 5. Minimal Proxy (Clone)

- **Pattern**: Lightweight proxy to implementation
- **Admin**: Implementation contract controls behavior
- **Storage**: Implementation address in bytecode

### 6. Immutable

- **Pattern**: No upgrade mechanism
- **Admin**: N/A
- **Storage**: Implementation logic in contract

## Naming Conventions

### Subdomain Structure

For proxy contracts, the system uses a hierarchical naming structure:

```
{role}.{protocol}.{category}.cns.eth          # Main proxy contract
{role}-impl.{protocol}.{category}.cns.eth     # Implementation contract
{role}-admin.{protocol}.{category}.cns.eth     # Admin contract (transparent only)
```

### Examples

**DAO Governance:**

- `governor.ens.dao.cns.eth` - Main governance proxy
- `governor-impl.ens.dao.cns.eth` - Governance implementation
- `governor-admin.ens.dao.cns.eth` - Governance proxy admin

**DeFi Router:**

- `router.uniswap.defi.cns.eth` - Main router proxy
- `router-impl.uniswap.defi.cns.eth` - Router implementation
- `router-admin.uniswap.defi.cns.eth` - Router proxy admin

**Token Contract:**

- `token.maker.defi.cns.eth` - Main token proxy
- `token-impl.maker.defi.cns.eth` - Token implementation

## Schema Structure

### Proxy Configuration

```json
{
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x1234567890123456789012345678901234567890",
    "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    "proxyAdmin": "0x0987654321098765432109876543210987654321",
    "proxyVersion": "v1-0-0",
    "implementationMetadata": {
      "name": "GovernanceImplementation",
      "version": "v1-0-0",
      "sourceUri": "https://github.com/org/governance",
      "abiHash": "0xabcdef1234567890"
    }
  }
}
```

### Address Configuration

```json
{
  "addresses": [
    {
      "chainId": 1,
      "address": "0x1234567890123456789012345678901234567890",
      "deployedBlock": 12345678,
      "bytecodeHash": "0xabcdef1234567890",
      "implementation": "0x0987654321098765432109876543210987654321",
      "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    }
  ]
}
```

## Validation Rules

### 1. Proxy Type Validation

- Must be one of: `transparent`, `uups`, `beacon`, `diamond`, `minimal`, `immutable`
- Invalid types trigger validation errors

### 2. Implementation Address Validation

- Must be valid Ethereum address format
- Required for all proxy types except `immutable`

### 3. Admin Contract Validation

- Required for `transparent` proxy type
- Optional for other types
- Must be valid Ethereum address format

### 4. Implementation Slot Validation

- Required for ERC-1967 proxies (`transparent`, `uups`)
- Must be valid storage slot format
- Default: `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`

### 5. Naming Consistency Validation

- Implementation subdomains must have corresponding implementation addresses
- Admin subdomains must have corresponding admin addresses
- No redundant naming patterns (e.g., implementation names containing "Proxy")

## Migration Support

The migration tool automatically detects proxy patterns:

### Detection Logic

1. **Implementation Address**: If `addresses[].implementation` exists, detect as proxy
2. **Proxy Admin**: If `addresses[].proxyAdmin` exists, assume transparent proxy
3. **Bytecode Hash**: If contains "uups", assume UUPS proxy
4. **Storage Slot**: If `implementationSlot` exists, assume ERC-1967 proxy

### Migration Changes

- Adds `proxy` configuration object
- Infers proxy type from existing metadata
- Updates subdomain suggestions to include implementation/admin
- Preserves existing implementation relationships

## Usage Examples

### Creating Proxy Contract Metadata

```bash
# Interactive wizard for proxy contract
node bin/ens-naming.mjs wizard

# Follow prompts:
# Organization: ens
# Protocol: ens
# Category: dao
# Subcategory: governor
# Role: governor
# Version: v1-0-0
# Chain ID: 1
# ENS Root: ens.dao.cns.eth
```

### Validating Proxy Configuration

```bash
# Validate proxy metadata
node bin/ens-naming.mjs validate-name governor.ens.dao.cns.eth dao --metadata governor-metadata.json

# Check proxy consistency
node bin/ens-naming.mjs check governor-metadata.json --strict
```

### Generating Registration Script

```bash
# Generate ENS registration script for proxy system
node bin/ens-naming.mjs register governor-metadata.json -o register-governor.sh
```

## Best Practices

### 1. Naming Consistency

- Use consistent naming patterns across proxy/implementation/admin
- Avoid redundant terms (e.g., "Proxy" in implementation names)
- Use descriptive role names (e.g., "governor", "router", "factory")

### 2. Metadata Completeness

- Always specify implementation addresses for proxies
- Include proxy admin addresses for transparent proxies
- Provide implementation metadata for better discoverability

### 3. Version Management

- Use semantic versioning for proxy versions
- Track implementation versions separately
- Document upgrade paths and breaking changes

### 4. Security Considerations

- Validate proxy admin addresses
- Verify implementation slot values
- Document upgrade permissions and procedures

## Troubleshooting

### Common Issues

1. **Missing Implementation Address**
   - Error: "Implementation subdomain exists but no implementation address specified"
   - Solution: Add `proxy.implementationAddress` to metadata

2. **Invalid Proxy Type**
   - Error: "Invalid proxy type: custom"
   - Solution: Use one of the supported proxy types

3. **Missing Admin Address**
   - Warning: "Transparent proxy should have proxyAdmin address specified"
   - Solution: Add `proxy.proxyAdmin` for transparent proxies

4. **Naming Conflicts**
   - Warning: "Implementation contract name should not contain 'Proxy'"
   - Solution: Rename implementation contract to avoid confusion

### Validation Commands

```bash
# Check proxy configuration
node bin/ens-naming.mjs check metadata.json --strict

# Validate specific proxy type
node bin/ens-naming.mjs validate-name router.uniswap.defi.cns.eth defi --metadata router-metadata.json

# Generate proxy-specific subdomain suggestions
node bin/ens-naming.mjs suggest uniswap defi --verbose
```

## Integration with Existing Systems

### ENS Resolution

- Proxy contracts resolve to implementation addresses
- Implementation contracts resolve to their own addresses
- Admin contracts resolve to their own addresses

### Block Explorers

- Proxy contracts show implementation address
- Implementation contracts show their own code
- Admin contracts show upgrade functionality

### Development Tools

- IDEs can resolve proxy contracts to implementations
- Debuggers can step through proxy calls
- Testing frameworks can mock proxy behavior

This system ensures clear, consistent, and non-redundant naming for proxy contracts while maintaining full functionality and discoverability.
