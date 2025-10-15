// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ENS Contract Metadata Types
/// @notice Core data structures for ENS Contract Metadata Standard (ENSIP-X)
/// @dev Defines all structs, enums, and constants used across metadata contracts

library ENSMetadataTypes {
    /// @notice Contract metadata structure as defined in ENSIP-X
    struct ContractMetadata {
        string id;                    // Canonical contract ID
        string org;                   // Organization/project name
        string protocol;              // Protocol name
        string category;              // Contract category (defi, dao, nft, etc.)
        string role;                  // Contract role (router, governor, token, etc.)
        string version;               // Contract version
        uint256 chainId;              // Chain ID where contract is deployed
        address[] addresses;          // Contract addresses across chains
        bytes32 metadataHash;         // SHA-256 hash of full metadata
        string ensRoot;               // ENS root domain for this contract
        Standards standards;          // ERC standards and interfaces
        Security security;            // Security and audit information
        Deployment deployment;        // Deployment and ownership info
        bytes32[] subdomains;         // Related subdomain hashes
        DNS dns;                      // DNS record information
    }

    /// @notice Standards compliance information
    struct Standards {
        string[] ercs;                // ERC standards (erc20, erc721, etc.)
        ContractInterface[] interfaces; // Detailed interface information
        DependencyInfo dependencies;  // Contract dependency information
    }

    /// @notice Interface definition structure
    struct ContractInterface {
        string name;                  // Interface name (IERC20, IUniswapV3Router)
        bytes4 id;                    // ERC-165 interface identifier
        string standard;              // Standard this interface implements
        string version;               // Interface version
        InheritanceInfo inheritance;  // Interface inheritance details
        string[] implemented;         // Functions implemented by contract
        string[] optional;            // Optional functions
        string[] events;              // Events defined by interface
        string[] errors;              // Custom errors defined by interface
        string documentation;         // Interface documentation URL
        string specification;         // Interface specification reference
    }

    /// @notice Interface inheritance information
    struct InheritanceInfo {
        string[] inherits;            // Parent interfaces
        bool required;                // Whether inheritance is required
    }

    /// @notice Contract dependency information
    struct DependencyInfo {
        LibraryDependency[] libraries;    // External libraries used
        InterfaceDependency[] interfaces; // Interface dependencies
        ImplementationDependency[] implementations; // Implementation dependencies
    }

    /// @notice Library dependency information
    struct LibraryDependency {
        string name;                      // Variant identifier (e.g., "v4-9-0")
        string domain;                    // Base ENS domain for library metadata (without variant)
        string license;                   // Library license
        bool critical;                    // Whether this is a critical dependency
        string[] interfaces;              // Interfaces provided by this library
    }

    /// @notice Interface dependency information
    struct InterfaceDependency {
        string name;                      // Variant identifier (e.g., "v0-8-20")
        string domain;                    // Base ENS domain for interface metadata (without variant)
        string[] implementedBy;           // Contracts implementing this interface
        string[] extends;                 // Interfaces this interface extends
    }

    /// @notice Implementation dependency information
    struct ImplementationDependency {
        string name;                      // Variant identifier (e.g., "v3-1-0")
        string domain;                    // Base ENS domain for implementation metadata (without variant)
        string[] implements;              // Interfaces this implementation implements
        string[] dependsOn;               // Dependencies this implementation has
    }

    /// @notice Dependency resolution result
    struct DependencyResolution {
        bool compatible;                  // Whether dependency chain is compatible
        string[] issues;                  // Any compatibility issues found
        DependencyNode[] dependencyGraph; // Full dependency graph
    }

    /// @notice Dependency graph node
    struct DependencyNode {
        string domain;                    // ENS domain of the contract
        string contractType;              // Type: library, interface, implementation
        DependencyEdge[] dependencies;    // Outgoing dependencies
        DependencyEdge[] dependents;      // Incoming dependencies
    }

    /// @notice Dependency graph edge
    struct DependencyEdge {
        string domain;                    // ENS domain of the dependency
        string relationship;              // Type of relationship (uses, implements, extends)
    }

    /// @notice Security and audit information
    struct Security {
        Attestation attestation;      // Cryptographic attestation
        AuditInfo[] audits;           // Security audit results
        bool verified;                // Whether contract is verified
        string verificationSource;    // Source of verification
    }

    /// @notice Cryptographic attestation structure
    struct Attestation {
        bytes32 hash;                 // Hash of attestation data
        address attester;             // Address that created attestation
        uint256 timestamp;            // Attestation timestamp
        bytes signature;              // Attester signature
        string algorithm;             // Signature algorithm used
    }

    /// @notice Security audit information
    struct AuditInfo {
        string auditor;               // Audit firm/company
        string report;                // Audit report URL or hash
        uint256 date;                 // Audit completion date
        string[] findings;            // Critical findings summary
        bool passed;                  // Whether audit passed
    }

    /// @notice Deployment and ownership information
    struct Deployment {
        uint256 deploymentDate;       // Contract deployment timestamp
        address deployer;             // Address that deployed contract
        address owner;                // Current contract owner
        OwnershipInfo ownership;      // Detailed ownership information
        string upgradeability;        // Upgrade mechanism (transparent, uups, etc.)
        PermissionInfo permissions;   // Permission and access control
    }

    /// @notice Ownership information for multisig/governance
    struct OwnershipInfo {
        OwnerInfo[] owners;           // List of owners
        string governance;            // Governance mechanism
        MultisigInfo multisig;        // Multisig configuration if applicable
    }

    /// @notice Individual owner information
    struct OwnerInfo {
        address addr;                 // Owner address
        string entityType;            // Type: eoa, multisig, dao, contract, etc.
        string name;                  // Owner name/identifier
        bool ownershipReleased;       // Whether ownership was released
    }

    /// @notice Multisig configuration
    struct MultisigInfo {
        address contract;             // Multisig contract address
        string version;               // Multisig version
        uint256 threshold;            // Required signatures
        GnosisSafeInfo gnosisSafe;    // Gnosis Safe specific info if applicable
    }

    /// @notice Gnosis Safe specific information
    struct GnosisSafeInfo {
        address fallbackHandler;      // Fallback handler contract
        address guard;                // Guard contract for validation
        address[] modules;            // Enabled modules
    }

    /// @notice Permission and access control information
    struct PermissionInfo {
        string[] roles;               // Role definitions
        address[] admins;             // Admin addresses
        bool pausable;                // Whether contract can be paused
        bool upgradable;              // Whether contract can be upgraded
    }

    /// @notice Subdomain information
    struct SubdomainInfo {
        bytes32 node;                 // ENS namehash of subdomain
        string name;                  // Subdomain name
        address resolver;             // Subdomain resolver
        uint64 ttl;                   // Time to live
        RecordInfo[] records;         // DNS records
    }

    /// @notice DNS record information
    struct RecordInfo {
        string recordType;            // DNS record type (A, AAAA, CNAME, etc.)
        string value;                 // Record value
        uint64 ttl;                   // Record TTL
    }

    /// @notice Complete DNS configuration
    struct DNS {
        SubdomainInfo[] subdomains;   // Subdomain configurations
        RecordInfo[] records;         // DNS records
    }

    /// @notice Metadata registry record
    struct MetadataRecord {
        bytes32 metadataHash;         // SHA-256 hash of metadata
        string gateway;               // CCIP gateway URL
        string path;                  // Path to metadata file
        uint256 timestamp;            // Last update timestamp
        address attester;             // Attestation issuer
        bool active;                  // Record status
        uint256 chainId;              // Source chain ID for cross-chain records
    }

    /// @notice Cross-chain metadata assignment message
    struct MetadataAssignmentMessage {
        bytes32 metadataHash;         // Hash of metadata content
        bytes32 ensNode;              // ENS namehash of target domain
        string gateway;               // Gateway URL for metadata retrieval
        string path;                  // Path to metadata file
        uint256 sourceChainId;        // Chain where metadata was created
        uint256 targetChainId;        // Chain where metadata should be stored
        address attester;             // Authorized attester address
        uint256 timestamp;            // Assignment timestamp
        bytes signature;              // Attester signature
    }

    /// @notice Validation result structure
    struct ValidationResult {
        bool valid;                   // Whether metadata is valid
        string[] errors;              // Validation errors if any
        string[] warnings;            // Validation warnings if any
        uint256 validatedAt;          // Validation timestamp
        address validator;            // Address that performed validation
    }

    /// @notice Contract categories as defined in ENSIP-X
    enum ContractCategory {
        DEFI,           // DeFi protocols
        DAO,            // Decentralized Autonomous Organizations
        NFT,            // Non-Fungible Tokens
        DEX,            // Decentralized Exchanges
        LENDING,        // Lending protocols
        BRIDGE,         // Cross-chain bridges
        ORACLE,         // Price oracles
        GOVERNANCE,     // Governance contracts
        UTILITY,        // Utility contracts
        GAMEFI,         // GameFi protocols
        IDENTITY,       // Identity solutions
        INFRASTRUCTURE, // Infrastructure protocols
        STABLECOIN,     // Stablecoin contracts
        YIELD,          // Yield farming protocols
        INSURANCE,      // Insurance protocols
        OTHER           // Other categories
    }

    /// @notice Contract roles as defined in ENSIP-X
    enum ContractRole {
        TOKEN,          // Token contracts (ERC-20, ERC-721, etc.)
        ROUTER,         // Router contracts (AMM, DEX aggregators)
        FACTORY,        // Factory contracts (pair creation)
        GOVERNOR,       // Governance contracts
        TIMELOCK,       // Timelock controllers
        MULTISIG,       // Multisignature wallets
        PROXY,          // Proxy contracts
        IMPLEMENTATION, // Implementation contracts
        ORACLE,         // Price feed contracts
        BRIDGE,         // Bridge contracts
        VAULT,          // Vault/treasury contracts
        STAKING,        // Staking contracts
        REWARD,         // Reward distribution contracts
        VESTING,        // Vesting contracts
        OTHER           // Other roles
    }

    /// @notice Owner entity types
    enum OwnerType {
        EOA,            // Externally Owned Account
        MULTISIG,       // Multisignature wallet
        DAO,            // DAO/governance contract
        CONTRACT,       // Smart contract
        GNOSIS_SAFE,    // Gnosis Safe wallet
        MULTISIG_WALLET // Generic multisig wallet
    }

    /// @notice ERC-165 interface identifiers
    bytes4 constant METADATA_REGISTRY_INTERFACE_ID = 0x12345678; // TODO: Calculate actual interface ID
    bytes4 constant ENS_METADATA_RESOLVER_INTERFACE_ID = 0x87654321; // TODO: Calculate actual interface ID
    bytes4 constant METADATA_VALIDATOR_INTERFACE_ID = 0xabcd1234; // TODO: Calculate actual interface ID

    /// @notice Events emitted by metadata contracts
    event MetadataRegistered(bytes32 indexed metadataHash, address indexed attester);
    event MetadataUpdated(bytes32 indexed metadataHash, address indexed attester);
    event MetadataRevoked(bytes32 indexed metadataHash, address indexed attester);
    event AttesterAuthorized(address indexed attester, bool authorized);
    event CrossChainMetadataAssigned(bytes32 indexed metadataHash, uint256 indexed targetChainId);
    event MetadataValidated(bytes32 indexed metadataHash, bool valid, address indexed validator);
}
