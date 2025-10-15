# ENS Contract Metadata Standard - Solidity Implementation

This directory contains the complete Solidity implementation for the ENS Contract Metadata Standard (ENSIP-X).

## Architecture Overview

The implementation consists of several key contracts that work together to provide a comprehensive metadata system for Ethereum smart contracts registered through ENS:

### Core Contracts

1. **ENSMetadataTypes.sol** - Data structures and enums
2. **IMetadataRegistry.sol** - Registry interface
3. **MetadataRegistry.sol** - Main registry contract
4. **IENSMetadataResolver.sol** - ENS resolver interface
5. **ENSMetadataResolver.sol** - ENS metadata resolver
6. **IMetadataValidator.sol** - Validator interface
7. **MetadataValidator.sol** - Metadata validation contract
8. **MetadataCCIPReceiver.sol** - Cross-chain receiver
9. **InterfaceIds.sol** - ERC-165 interface IDs

## Key Features Implemented

### 1. Metadata Registry (`MetadataRegistry.sol`)

- **Storage**: Stores metadata hashes, gateway URLs, and paths
- **Attestation**: Supports authorized attesters for metadata validation
- **Cross-chain**: Integrates with CCIP for multi-chain metadata
- **Authorization**: Role-based access control for attesters
- **Replay Protection**: Prevents duplicate attestations

### 2. ENS Resolver (`ENSMetadataResolver.sol`)

- **Extended Interface**: Extends standard ENS resolver with metadata functions
- **Storage Integration**: Links ENS domains to metadata records
- **Validation**: Validates metadata against ENSIP-X standards
- **Batch Operations**: Supports setting multiple metadata components

### 3. Cross-Chain Support (`MetadataCCIPReceiver.sol`)

- **CCIP Integration**: Receives cross-chain metadata assignments
- **Verification**: Validates source chains and attester signatures
- **ENS Updates**: Updates ENS records with cross-chain metadata
- **Replay Protection**: Prevents duplicate message processing

### 4. Validation Engine (`MetadataValidator.sol`)

- **Schema Validation**: Validates metadata structure and format
- **Canonical ID**: Validates canonical contract identifier format
- **Interface Checking**: Validates ERC-165 interface definitions
- **Security Validation**: Validates security and audit information
- **Custom Rules**: Supports custom validation rules

## Data Structures

### Contract Metadata Structure

```solidity
struct ContractMetadata {
    string id;                    // Canonical contract ID
    string org;                   // Organization/project name
    string protocol;              // Protocol name
    string category;              // Contract category
    string role;                  // Contract role
    string version;               // Contract version
    uint256 chainId;              // Chain ID
    address[] addresses;          // Contract addresses
    bytes32 metadataHash;         // SHA-256 hash
    string ensRoot;               // ENS root domain
    Standards standards;          // ERC standards and interfaces
    Security security;            // Security information
    Deployment deployment;        // Deployment information
    bytes32[] subdomains;         // Related subdomains
    DNS dns;                      // DNS information
}
```

### Interface Definition

```solidity
struct ContractInterface {
    string name;                  // Interface name
    bytes4 id;                    // ERC-165 identifier
    string standard;              // Standard implemented
    string version;               // Interface version
    InheritanceInfo inheritance;  // Inheritance details
    string[] implemented;         // Functions implemented
    string[] optional;            // Optional functions
    string[] events;              // Events defined
    string[] errors;              // Custom errors
    string documentation;         // Documentation URL
    string specification;         // Specification reference
}
```

## Security Features

### Attestation System

- Cryptographic signatures for metadata authenticity
- Authorized attester management
- Timestamp validation
- Replay attack prevention

### Access Control

- Role-based permissions (owner, attester, authorized)
- Chain-specific authorization
- Emergency pause functionality

### Input Validation

- Comprehensive metadata validation
- Interface ID format checking
- Address validation
- Cross-chain consistency verification

## Deployment Considerations

### Dependencies

- OpenZeppelin Contracts (access control, cryptography)
- ENS Contracts (resolver functionality)
- Chainlink CCIP (cross-chain messaging)

### Gas Optimization

- Efficient storage patterns
- Batch operations support
- Minimal on-chain data storage

### Upgradeability

- Extensible interfaces for future enhancements
- Version management for metadata schema
- Migration support for existing deployments

## Usage Examples

### Register Metadata

```solidity
metadataRegistry.registerMetadata(
    metadataHash,
    "https://gateway.pinata.cloud/ipfs/",
    "QmYourMetadataHash",
    1 // Ethereum mainnet
);
```

### Set ENS Resolver

```solidity
ensMetadataResolver.setContractMetadata(
    namehash("uniswap.defi.cns.eth"),
    metadataJsonString
);
```

### Validate Metadata

```solidity
MetadataValidator.ValidationResult memory result =
    validator.validateContractMetadata(metadata);
```

## Integration Points

### ENS Integration

- Custom resolver functions for metadata
- Text record storage for metadata hashes
- Subdomain support for hierarchical organization

### CCIP Integration

- Cross-chain metadata synchronization
- Multi-chain deployment support
- Gateway-agnostic metadata retrieval

### External Tools

- Compatible with existing ENS tooling
- Integrates with deployment scripts
- Supports automated validation workflows

## Testing Strategy

### Unit Tests

- Interface compliance testing
- Access control validation
- Edge case handling

### Integration Tests

- ENS resolver functionality
- Cross-chain messaging
- End-to-end metadata workflows

### Security Audits

- Access control verification
- Signature validation
- Input sanitization

## Future Enhancements

### Planned Features

- Decentralized governance for registry
- Advanced query capabilities
- Metadata versioning system
- Integration with existing registries

### Extensibility

- Plugin architecture for custom validators
- Additional interface support
- Enhanced cross-chain protocols

This implementation provides a solid foundation for the ENS Contract Metadata Standard, enabling consistent, verifiable, and interoperable metadata across the Ethereum ecosystem.
