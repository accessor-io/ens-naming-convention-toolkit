# ENS Contract Dependency Mapping - Practical Example

## Real-World Scenario: Uniswap V3 Ecosystem

Let's demonstrate how the enhanced ENS Contract Metadata Standard maps dependencies for the Uniswap V3 ecosystem.

## Current State (Without Dependencies)

### Uniswap V3 Router

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "router",
  "version": "v3-1-0",
  "standards": {
    "ercs": ["erc20"],
    "interfaces": [
      {
        "name": "IUniswapV3Router",
        "id": "0xe343e6d8",
        "standard": "Uniswap-V3"
      }
    ]
  }
}
```

## Enhanced State (With Dependencies)

### 1. OpenZeppelin Library Registration

**Domain**: `openzeppelin.security.library.v4-9-0.1.cns.eth`

```json
{
  "id": "openzeppelin.security.library.v4-9-0.1",
  "org": "openzeppelin",
  "protocol": "security",
  "category": "security",
  "role": "library",
  "version": "v4-9-0",
  "standards": {
    "dependencies": {
      "interfaces": [
        {
          "name": "IERC20",
          "domain": "erc20.token.interface.v0-8-20.1.cns.eth",
          "implementedBy": ["uniswap.defi.amm.router.cns.eth"]
        },
        {
          "name": "IERC165",
          "domain": "erc165.introspection.interface.v0-1-0.1.cns.eth",
          "implementedBy": ["uniswap.defi.amm.router.cns.eth"]
        }
      ]
    }
  }
}
```

### 2. ERC-20 Interface Registration

**Domain**: `erc20.token.interface.v0-8-20.1.cns.eth`

```json
{
  "id": "erc20.token.interface.v0-8-20.1",
  "org": "ethereum",
  "protocol": "token",
  "category": "token",
  "role": "interface",
  "version": "v0-8-20",
  "standards": {
    "dependencies": {
      "interfaces": [
        {
          "name": "IERC20",
          "domain": "erc20.token.interface.v0-8-20.1.cns.eth",
          "extends": ["IERC165"]
        }
      ]
    }
  }
}
```

### 3. Uniswap V3 Router with Dependencies

**Domain**: `uniswap.defi.amm.router.cns.eth`

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "router",
  "version": "v3-1-0",
  "standards": {
    "dependencies": {
      "libraries": [
        {
          "name": "OpenZeppelin Contracts",
          "version": "4.9.0",
          "domain": "openzeppelin.security.library.v4-9-0.1.cns.eth",
          "license": "MIT",
          "critical": true,
          "interfaces": ["IERC20", "IERC165", "AccessControl"]
        }
      ],
      "interfaces": [
        {
          "name": "IUniswapV3Router",
          "domain": "uniswap-v3.core.interface.v3-0-0.1.cns.eth",
          "extends": ["IERC165"]
        }
      ],
      "implementations": [
        {
          "name": "UniswapV3Router",
          "domain": "uniswap.defi.amm.router.cns.eth",
          "implements": ["IUniswapV3Router"],
          "dependsOn": ["openzeppelin.security.library.v4-9-0.1.cns.eth"]
        }
      ]
    }
  }
}
```

## Dependency Tree Visualization

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
│   │   └── uniswap-v3.core.interface.v3-0-0.1.cns.eth
│   └── implementations/
│       └── router.implementation.v3-1-0.1.cns.eth
└── dependents/
    ├── forks/
    │   ├── sushiswap.defi.amm.router.cns.eth
    │   ├── pancakeswap.defi.amm.router.cns.eth
    │   └── quickswap.defi.amm.router.cns.eth
    └── tools/
        ├── arb-bot.defi.tools.arbitrage.cns.eth
        └── mev-bot.defi.tools.mev.cns.eth
```

## Usage Examples

### 1. Dependency Discovery

```javascript
// Find all dependencies for Uniswap router
const routerDomain = 'uniswap.defi.amm.router.cns.eth';
const dependencies = await resolver.getContractDependencies(namehash(routerDomain));

console.log(
  'Libraries:',
  dependencies.libraries.map((lib) => lib.name)
);
console.log(
  'Interfaces:',
  dependencies.interfaces.map((int) => int.name)
);
console.log(
  'Implementations:',
  dependencies.implementations.map((imp) => imp.name)
);
```

### 2. Version Compatibility Checking

```javascript
// Check if dependency chain is compatible
const dependencyChain = [
  namehash('uniswap.defi.amm.router.cns.eth'),
  namehash('openzeppelin.security.library.v4-9-0.1.cns.eth'),
  namehash('erc20.token.interface.v0-8-20.1.cns.eth'),
];

const { compatible, issues } = await resolver.verifyDependencyChain(dependencyChain);

if (!compatible) {
  console.log('Compatibility issues:', issues);
}
```

### 3. Dependency Graph Traversal

```javascript
// Get full dependency graph with depth 2
const graph = await resolver.getDependencyGraph(namehash(routerDomain), 2);

// Analyze the graph
graph.forEach((node) => {
  console.log(`Contract: ${node.domain} (${node.contractType})`);
  console.log(`Dependencies: ${node.dependencies.length}`);
  console.log(`Dependents: ${node.dependents.length}`);
});
```

### 4. Cross-Protocol Analysis

```javascript
// Find all contracts that implement a specific interface
const erc20Interface = await resolver.contractMetadata(
  namehash('erc20.token.interface.v0-8-20.1.cns.eth')
);
const implementers = erc20Interface.dependencies.implementations;

console.log(
  'Contracts implementing ERC-20:',
  implementers.map((imp) => imp.name)
);
```

## Benefits for Different Stakeholders

### For Developers

- **Easy Discovery**: Find compatible libraries and interfaces
- **Version Management**: Check compatibility before upgrades
- **Integration Support**: Understand how contracts work together

### For Security Auditors

- **Dependency Tracing**: Follow security implications through chains
- **Vulnerability Assessment**: Identify vulnerable dependencies
- **Compliance Checking**: Verify security standards across dependencies

### For Protocol Maintainers

- **Upgrade Coordination**: Plan upgrades that affect dependent contracts
- **Compatibility Testing**: Ensure changes don't break ecosystem
- **Documentation**: Auto-generate dependency documentation

### For Users

- **Trust Assessment**: Understand what contracts depend on
- **Risk Evaluation**: Assess security through dependency chains
- **Transparency**: See exactly what a protocol uses

## Implementation Impact

### Before (Simple Registry)

- Basic contract information
- No dependency relationships
- Limited discoverability
- No compatibility checking

### After (Dependency-Aware)

- Full dependency mapping
- Hierarchical organization
- Compatibility verification
- Ecosystem integration

## Migration Strategy

### Phase 1: Foundation (Current)

1. Basic metadata schema
2. Interface information
3. ENS integration

### Phase 2: Dependencies (Next)

1. Enhanced schema with dependencies
2. Dependency resolution functions
3. Migration tools for existing contracts

### Phase 3: Advanced Features

1. Automated dependency discovery
2. Cross-chain dependency mapping
3. Real-time compatibility monitoring

## Conclusion

The enhanced ENS Contract Metadata Standard with dependency mapping transforms it from a simple registry into a comprehensive dependency management system. By organizing dependencies under the full domain name structure, we create:

- **Discoverable dependency graphs** that enable ecosystem navigation
- **Version compatibility checking** across complex dependency chains
- **Security auditing capabilities** that trace implications through dependencies
- **Ecosystem integration** that supports cross-protocol coordination

This approach leverages the hierarchical nature of ENS domains to create a dependency resolution mechanism that's both powerful and user-friendly, addressing the user's excellent point about mapping contract dependencies under the full domain name structure.
