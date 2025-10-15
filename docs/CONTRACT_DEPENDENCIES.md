# ENS Contract Dependencies Mapping

## Overview

The ENS Contract Metadata Standard should explicitly map contract dependencies using the hierarchical domain structure. This creates a discoverable dependency graph where contracts can find their dependencies through the ENS domain hierarchy.

## Current Gap

The current schema includes interface information but lacks structured dependency mapping. Dependencies should be organized under the full domain name to enable:

1. **Dependency Discovery**: Easily find all contracts a given contract depends on
2. **Version Compatibility**: Check if dependency versions are compatible
3. **Upgrade Coordination**: Coordinate upgrades across dependent contracts
4. **Security Auditing**: Trace security implications through dependency chains

## Enhanced Schema for Dependencies

### Dependency Structure

```json
{
  "dependencies": {
    "libraries": [
      {
        "name": "v4-9-0",
        "domain": "openzeppelin.security.library.cns.eth",
        "license": "MIT",
        "critical": true,
        "interfaces": ["IERC20", "IERC721", "AccessControl"]
      }
    ],
    "interfaces": [
      {
        "name": "v0-8-20",
        "domain": "erc20.token.interface.cns.eth",
        "implementedBy": ["uniswap.defi.amm.router.cns.eth"],
        "extends": ["IERC165"]
      }
    ],
    "implementations": [
      {
        "name": "v3-1-0",
        "domain": "uniswap.defi.amm.router.cns.eth",
        "implements": ["IUniswapV3Router"],
        "dependsOn": ["openzeppelin.security.library.cns.eth"]
      }
    ]
  }
}
```

The dependency system treats **name as the variant option**, organizing dependencies hierarchically under domain structures where variants are discoverable.

## Domain-Based Dependency Resolution

### Hierarchical Dependency Mapping

```
uniswap.defi.amm.router.cns.eth
├── dependencies/
│   ├── libraries/
│   │   └── openzeppelin.security.library.cns.eth
│   │       ├── v4-9-0/ (variant: v4-9-0)
│   │       │   └── implementation.cns.eth
│   │       ├── v4-8-0/ (variant: v4-8-0)
│   │       │   └── implementation.cns.eth
│   │       └── v4-7-0/ (variant: v4-7-0)
│   │           └── implementation.cns.eth
│   ├── interfaces/
│   │   ├── erc20.token.interface.cns.eth
│   │   │   ├── v0-8-20/ (variant: v0-8-20)
│   │   │   │   └── implementation.cns.eth
│   │   │   └── v0-8-17/ (variant: v0-8-17)
│   │   │       └── implementation.cns.eth
│   │   └── uniswap-v3.core.interface.cns.eth
│   │       └── v3-0-0/ (variant: v3-0-0)
│   │           └── implementation.cns.eth
│   └── implementations/
│       └── v3-1-0/ (variant: v3-1-0)
│           └── router.implementation.cns.eth
└── dependents/
    ├── protocols/
    │   └── sushiswap.defi.amm.router.cns.eth
    └── tools/
        └── arb-bot.defi.tools.arbitrage.cns.eth
```

### Dependency Types

#### 1. Library Dependencies

```javascript
// OpenZeppelin Contracts library (name as variant)
const libraryDomain = 'openzeppelin.security.library.cns.eth';
const libraryMetadata = await ensResolver.contractMetadata(namehash(libraryDomain));

// Get specific variant
const variantMetadata = await ensResolver.contractMetadata(
  namehash('v4-9-0.openzeppelin.security.library.cns.eth')
);

// Contract using the library
const contractDomain = 'uniswap.defi.amm.router.cns.eth';
const contractMetadata = await ensResolver.contractMetadata(namehash(contractDomain));

// Check library compatibility
const isCompatible = await checkLibraryCompatibility(variantMetadata, contractMetadata);
```

#### 2. Interface Dependencies

```javascript
// ERC-20 Interface (name as variant)
const interfaceDomain = 'erc20.token.interface.cns.eth';
const interfaceMetadata = await ensResolver.contractMetadata(namehash(interfaceDomain));

// Get specific variant
const variantMetadata = await ensResolver.contractMetadata(
  namehash('v0-8-20.erc20.token.interface.cns.eth')
);

// Contracts implementing the interface
const implementations = variantMetadata.dependencies.implementations;
```

#### 3. Implementation Dependencies

```javascript
// Router implementation (name as variant)
const routerDomain = 'uniswap.defi.amm.router.cns.eth';
const routerMetadata = await ensResolver.contractMetadata(namehash(routerDomain));

// Get specific variant
const variantMetadata = await ensResolver.contractMetadata(
  namehash('v3-1-0.uniswap.defi.amm.router.cns.eth')
);

// Find all contracts that depend on this router variant
const dependents = variantMetadata.dependents.protocols;
```

## Implementation in Schema

### Enhanced Standards Structure

```json
"standards": {
  "ercs": ["erc20", "erc165"],
  "interfaces": [
    {
      "name": "IUniswapV3Router",
      "id": "0xe343e6d8",
      "standard": "Uniswap-V3",
      "version": "3.0.0",
      "inherited": [
        {
          "name": "IERC165",
          "id": "0x01ffc9a7",
          "domain": "erc165.introspection.interface.cns.eth",
          "required": true
        }
      ],
      "domain": "uniswap-v3.core.interface.cns.eth"
    }
  ],
  "dependencies": {
    "libraries": [
      {
        "name": "v4-9-0",
        "domain": "openzeppelin.security.library.cns.eth",
        "license": "MIT",
        "critical": true
      }
    ]
  }
}
```

### Dependency Resolution Functions

```solidity
interface IDependencyResolver {
    /// Get all dependencies for a contract
    function getContractDependencies(bytes32 node)
        external view returns (DependencyInfo[] memory dependencies);

    /// Get all contracts that depend on this contract
    function getContractDependents(bytes32 node)
        external view returns (DependentInfo[] memory dependents);

    /// Check if dependency chain is compatible
    function verifyDependencyChain(bytes32[] memory dependencyChain)
        external view returns (bool compatible, string[] memory issues);

    /// Get dependency graph for a contract
    function getDependencyGraph(bytes32 node, uint256 depth)
        external view returns (DependencyNode[] memory graph);
}
```

## Real-World Example: Uniswap V3

### Current Contract Structure

```
Uniswap V3 Router (uniswap.defi.amm.router.cns.eth)
├── Uses: OpenZeppelin Contracts v4.9.0
├── Implements: IUniswapV3Router
├── Extends: IERC165, IUniswapV3PoolActions, IUniswapV3SwapCallbacks
└── Used by: SushiSwap, PancakeSwap, QuickSwap
```

### Domain-Mapped Dependencies

```
uniswap.defi.amm.router.cns.eth
├── dependencies/
│   ├── libraries/
│   │   └── openzeppelin.security.library.v4-9-0.1.cns.eth
│   │       ├── SafeMath.sol
│   │       ├── ReentrancyGuard.sol
│   │       └── AccessControl.sol
│   ├── interfaces/
│   │   ├── erc165.introspection.interface.v0-1-0.1.cns.eth
│   │   ├── uniswap-v3.pool-actions.interface.v3-0-0.1.cns.eth
│   │   └── uniswap-v3.swap-callbacks.interface.v3-0-0.1.cns.eth
│   └── contracts/
│       └── uniswap-v3.pool.contract.v3-0-0.1.cns.eth
└── dependents/
    ├── forks/
    │   ├── sushiswap.defi.amm.router.cns.eth
    │   ├── pancakeswap.defi.amm.router.cns.eth
    │   └── quickswap.defi.amm.router.cns.eth
    └── tools/
        ├── arb-bot.defi.tools.arbitrage.cns.eth
        └── mev-bot.defi.tools.mev.cns.eth
```

## Benefits of Domain-Based Dependencies

### 1. **Discoverability**

- Navigate dependency trees through ENS domains
- Find alternative implementations of interfaces
- Discover compatible libraries and tools

### 2. **Version Management**

- Check compatibility across dependency chains
- Identify breaking changes in dependencies
- Coordinate upgrades across dependent contracts

### 3. **Security Auditing**

- Trace security implications through dependency chains
- Identify vulnerable dependencies
- Assess overall system security posture

### 4. **Ecosystem Integration**

- Enable automated dependency resolution
- Support cross-protocol compatibility checking
- Facilitate ecosystem-wide security monitoring

## Implementation Strategy

### Phase 1: Basic Dependency Mapping

1. Add dependency fields to ContractMetadata schema
2. Implement basic dependency resolution functions
3. Create dependency registration workflow

### Phase 2: Advanced Features

1. Automated dependency discovery
2. Cross-chain dependency mapping
3. Dependency version compatibility checking

### Phase 3: Ecosystem Integration

1. Integration with security audit tools
2. Cross-protocol dependency analysis
3. Automated dependency health monitoring

## Example Usage

### Registering Dependencies

```javascript
// Register OpenZeppelin library base domain
await registry.registerMetadata(
  '0x' + keccak256('openzeppelin.security.library.cns.eth').toString('hex'),
  'https://gateway.pinata.cloud/ipfs/',
  'QmOpenZeppelinMetadata',
  1
);

// Register specific variant
await registry.registerMetadata(
  '0x' + keccak256('v4-9-0.openzeppelin.security.library.cns.eth').toString('hex'),
  'https://gateway.pinata.cloud/ipfs/',
  'QmOpenZeppelinV490Metadata',
  1
);

// Register ERC-20 interface base domain
await registry.registerMetadata(
  '0x' + keccak256('erc20.token.interface.cns.eth').toString('hex'),
  'https://gateway.pinata.cloud/ipfs/',
  'QmERC20InterfaceMetadata',
  1
);

// Register specific variant
await registry.registerMetadata(
  '0x' + keccak256('v0-8-20.erc20.token.interface.cns.eth').toString('hex'),
  'https://gateway.pinata.cloud/ipfs/',
  'QmERC20V0820Metadata',
  1
);

// Register Uniswap router with dependencies
await registry.registerMetadata(
  '0x' + keccak256('uniswap.defi.amm.router.cns.eth').toString('hex'),
  'https://gateway.pinata.cloud/ipfs/',
  'QmUniswapRouterMetadata',
  1
);
```

### Querying Dependencies

```javascript
// Get all dependencies for Uniswap router base domain
const dependencies = await resolver.getContractDependencies(
  namehash('uniswap.defi.amm.router.cns.eth')
);

// Get specific variant dependencies
const variantDeps = await resolver.getContractDependencies(
  namehash('v3-1-0.uniswap.defi.amm.router.cns.eth')
);

// Check if dependency chain is secure (using variant domains)
const { compatible, issues } = await resolver.verifyDependencyChain([
  namehash('v3-1-0.uniswap.defi.amm.router.cns.eth'),
  namehash('v4-9-0.openzeppelin.security.library.cns.eth'),
  namehash('v0-8-20.erc20.token.interface.cns.eth'),
]);
```

## Conclusion

Domain-based dependency mapping transforms the ENS Contract Metadata Standard from a simple metadata registry into a comprehensive dependency management system. By organizing dependencies under the full domain name structure, we create:

- **Discoverable dependency graphs** that enable ecosystem navigation
- **Version compatibility checking** across complex dependency chains
- **Security auditing capabilities** that trace implications through dependencies
- **Ecosystem integration** that supports cross-protocol coordination

This approach leverages the hierarchical nature of the ENS domain system to create a dependency resolution mechanism that's both powerful and user-friendly.
