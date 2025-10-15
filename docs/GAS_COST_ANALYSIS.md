# ENS Contract Metadata Standard - Gas Cost Analysis

## Overview

This analysis calculates the potential gas costs for storing ENS contract metadata on-chain using the implemented Solidity contracts. The analysis considers storage patterns, data structures, and operational costs.

## Storage Architecture

### MetadataRegistry Contract Storage

- **Primary Storage**: `mapping(bytes32 => MetadataRecord)` - 1 slot per metadata hash
- **Authorization**: `mapping(address => bool)` - 1 slot per attester
- **Chain Support**: `mapping(uint256 => bool)` - 1 slot per chain ID
- **Counters**: 2 uint256 counters for record tracking
- **Index Mappings**: `mapping(address => bytes32[])` and `mapping(uint256 => bytes32[])` for lookups
- **Replay Protection**: `mapping(bytes32 => bool)` for attestation tracking

### ENSMetadataResolver Contract Storage

- **Node Mappings**: 6 mappings from `bytes32` (ENS node) to various metadata components
- **Contract References**: 3 address storage slots for external contracts

## Gas Cost Breakdown

### Base Storage Costs (per slot)

| Data Type        | Size     | Gas Cost                  |
| ---------------- | -------- | ------------------------- |
| `uint256`        | 32 bytes | 20,000 gas                |
| `address`        | 20 bytes | 20,000 gas                |
| `bytes32`        | 32 bytes | 20,000 gas                |
| `bool`           | 1 byte   | 20,000 gas                |
| `string` (short) | Variable | 20,000 + 256 per 32 bytes |
| `string` (long)  | Variable | 20,000 + 256 per 32 bytes |
| Dynamic array    | Overhead | 22,000 gas                |

### MetadataRecord Structure Storage

```solidity
struct MetadataRecord {
    bytes32 metadataHash;        // 20,000 gas
    string gateway;             // Variable (typically 20,000 + length cost)
    string path;                // Variable (typically 20,000 + length cost)
    uint256 timestamp;          // 20,000 gas
    address attester;           // 20,000 gas
    bool active;                // 20,000 gas
    uint256 chainId;            // 20,000 gas
}
```

**Typical MetadataRecord Cost**: ~140,000 gas (excluding string lengths)

### ENSMetadataResolver Component Storage

Each ENS node requires storage for:

- `bytes32 metadataHash` - 20,000 gas
- `string metadata` - Variable (potentially very high)
- `ContractInterface[] interfaces` - Variable
- `Security security` - Variable
- `Deployment deployment` - Variable
- `Standards standards` - Variable

## Operational Gas Costs

### 1. Metadata Registration (`registerMetadata`)

```solidity
function registerMetadata(
    bytes32 metadataHash,
    string calldata gateway,  // ~50 chars
    string calldata path,     // ~50 chars
    uint256 chainId
) external
```

**Estimated Gas Cost**: 180,000 - 220,000 gas

- Storage writes: ~140,000 gas (MetadataRecord)
- Array operations: ~20,000 gas (adding to index arrays)
- Event emission: ~3,000 gas
- Function overhead: ~20,000 gas

### 2. ENS Metadata Setting (`setContractMetadata`)

```solidity
function setContractMetadata(
    bytes32 node,
    string calldata metadata  // JSON string, potentially large
) external authorised(node)
```

**Estimated Gas Cost**: 250,000 - 1,000,000+ gas

- Metadata hash storage: 20,000 gas
- Full metadata string storage: Variable (high cost for large JSON)
- Component parsing and storage: Variable
- Authorization check: ~2,000 gas

### 3. Cross-Chain Assignment (`assignCrossChainMetadata`)

```solidity
function assignCrossChainMetadata(
    uint256 targetChainId,
    MetadataAssignmentMessage calldata message
) external nonReentrant
```

**Estimated Gas Cost**: 200,000 - 250,000 gas

- Signature verification: ~3,000 gas
- Storage writes: ~140,000 gas (new record)
- Replay protection: 20,000 gas
- Event emission: ~3,000 gas

## Scenario-Based Cost Analysis

### Scenario 1: Basic Contract Registration

**Use Case**: Register Uniswap V3 Router metadata

- MetadataRecord storage: 140,000 gas
- Index array additions: 20,000 gas
- **Total**: ~160,000 gas

### Scenario 2: Complete ENS Integration

**Use Case**: Set full metadata for ENS domain

- ENS node hash storage: 20,000 gas
- Full metadata JSON (2KB): ~600,000 gas
- Component parsing/storage: ~100,000 gas
- **Total**: ~720,000 gas

### Scenario 3: Cross-Chain Deployment

**Use Case**: Deploy metadata to multiple chains

- Source chain registration: 160,000 gas
- CCIP message (per target chain): 200,000 gas × chains
- Target chain processing: 160,000 gas × chains
- **Total per additional chain**: ~360,000 gas

### Scenario 4: Batch Operations

**Use Case**: Register multiple contracts

- Per additional contract: +160,000 gas
- Array operations scale linearly

## Cost Optimization Strategies

### 1. Minimal Storage Approach

**Strategy**: Store only essential data on-chain, reference off-chain metadata

**Savings**:

- Store only `metadataHash` instead of full metadata
- Use IPFS hashes for large data
- **Estimated savings**: 70-80% reduction in gas costs

**Implementation**:

```solidity
// Store only hash and reference
_nodeToMetadataHash[node] = metadataHash;
// Metadata fetched from IPFS via gateway
```

### 2. Component-Based Storage

**Strategy**: Store metadata components separately, not as monolithic JSON

**Savings**:

- Avoid string storage overhead
- Selective component updates
- **Estimated savings**: 40-50% reduction

### 3. Compressed Storage

**Strategy**: Use compressed data structures and efficient encoding

**Techniques**:

- Pack multiple values into single storage slots
- Use shorter string representations
- Implement delta encoding for updates

### 4. Batch Processing

**Strategy**: Process multiple operations in single transaction

**Benefits**:

- Shared function call overhead
- Reduced transaction costs
- Atomic batch operations

## Economic Analysis

### Current Ethereum Gas Prices (as of 2024)

- **Base Gas Price**: 20-50 gwei
- **Priority Fee**: 2-10 gwei
- **Total Gas Price**: 22-60 gwei

### Cost Estimates (at 30 gwei average)

| Operation              | Gas Cost  | ETH Cost   | USD Cost (at $2,000/ETH) |
| ---------------------- | --------- | ---------- | ------------------------ |
| Basic Registration     | 160,000   | 0.0048 ETH | $9.60                    |
| ENS Integration        | 720,000   | 0.0216 ETH | $43.20                   |
| Cross-chain (2 chains) | 520,000   | 0.0156 ETH | $31.20                   |
| Batch (10 contracts)   | 1,600,000 | 0.048 ETH  | $96.00                   |

### Annual Operating Costs

**Assumptions**: 1,000 contracts, 3 updates per contract annually

| Deployment Model | Annual Gas Cost   | Annual Cost (USD) |
| ---------------- | ----------------- | ----------------- |
| Full On-Chain    | 2,160,000,000 gas | $129,600          |
| Minimal Storage  | 480,000,000 gas   | $28,800           |
| Hybrid Approach  | 1,200,000,000 gas | $72,000           |

## Optimization Recommendations

### Immediate Optimizations

1. **Use IPFS for large metadata**: Store only hashes on-chain
2. **Component-based updates**: Update only changed components
3. **Batch operations**: Process multiple records together
4. **Efficient string handling**: Minimize string storage where possible

### Architecture Optimizations

1. **Layered storage**: Different contracts for different data types
2. **Caching strategies**: Local caching for frequently accessed data
3. **Compression**: Implement data compression for storage efficiency

### Long-term Optimizations

1. **State channels**: Off-chain state management with periodic settlement
2. **Layer 2 solutions**: Deploy on optimistic rollups or zk-rollups
3. **Alternative storage**: Consider alternative data availability solutions

## Conclusion

The gas costs for ENS contract metadata storage are substantial but manageable with proper optimization strategies. The hybrid approach (storing essential data on-chain while referencing larger metadata off-chain) provides the best balance of functionality and cost-effectiveness.

For production deployments, the recommended approach is to store only critical identifiers and hashes on-chain while maintaining full metadata in decentralized storage systems like IPFS, resulting in approximately 70% cost reduction while maintaining full functionality.
