---
description: 'Standardized metadata format for Ethereum smart contracts registered through ENS with canonical ID grammar, hierarchical schema system, and validation framework'
contributors: ['accessor.eth']
ensip:
  created: '2024-01-15'
  status: 'draft'
---

# ENSIP-X: ENS Contract Metadata Standard

## Abstract

This ENSIP establishes a standardized metadata format for Ethereum smart contracts registered through the Ethereum Name Service (ENS). The standard defines a canonical ID grammar, hierarchical schema system, comprehensive dependency mapping, data-size based fee system, and validation framework to ensure consistency, discoverability, and interoperability across the Ethereum ecosystem.

## Motivation

The Ethereum ecosystem lacks standardized metadata formats for smart contracts, leading to several key issues. **Fragmentation** occurs as metadata and naming conventions are not unified, resulting in disparate systems and formats across projects. **Limited Discoverability** stems from the absence of standard categories and schema, making it challenging to locate, identify, or organize contracts effectively. **Unreliable Data Quality** manifests as metadata that is often incomplete, outdated, or inconsistently formatted, impeding analytics and automation. **Interoperability Barriers** arise without a common metadata grammar, hindering integration across different protocols and ecosystems. **Security Information Gaps** exist as security-related details and audit results are inconsistently reported, making risk assessment difficult. **Dependency Management** lacks standardization for tracking contract dependencies, libraries, and interfaces across the ecosystem. **Economic Sustainability** is challenged by the absence of a fair, scalable mechanism for funding metadata infrastructure and ecosystem development.

This standard addresses these issues by providing a unified metadata framework that promotes consistency, enables automated validation, and supports hierarchical organization of contract information.

## Specification

### Core Metadata Schema

All ENS contract metadata MUST conform to the following JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ENS Contract Metadata",
  "type": "object",
  "required": [
    "id",
    "org",
    "protocol",
    "category",
    "role",
    "version",
    "chainId",
    "addresses",
    "metadataHash"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9.-]+$",
      "description": "Canonical identifier following ENSIP-X grammar"
    },
    "org": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Organization identifier (lowercase, hyphen-separated)"
    },
    "protocol": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Protocol identifier (lowercase, hyphen-separated)"
    },
    "category": {
      "type": "string",
      "enum": [
        "defi",
        "dao",
        "l2",
        "infra",
        "token",
        "nft",
        "gaming",
        "social",
        "identity",
        "privacy",
        "security",
        "wallet",
        "analytics",
        "rwa",
        "supply",
        "health",
        "finance",
        "dev",
        "art"
      ],
      "description": "Primary category classification"
    },
    "subcategory": {
      "type": "string",
      "description": "Subcategory within the primary category"
    },
    "role": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Contract role/function (lowercase, descriptive)"
    },
    "variant": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Optional protocol variant identifier"
    },
    "version": {
      "type": "string",
      "pattern": "^v[0-9]+(-[0-9]+)?(-[0-9]+)?$",
      "description": "Version format: v{num}, v{num}-{num}, or v{num}-{num}-{num}"
    },
    "chainId": {
      "type": "integer",
      "minimum": 1,
      "description": "Target blockchain network ID"
    },
    "addresses": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["chainId", "address"],
        "properties": {
          "chainId": { "type": "integer" },
          "address": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          },
          "deployedBlock": { "type": "integer" },
          "bytecodeHash": { "type": "string" },
          "implementation": { "type": ["string", "null"] },
          "implementationSlot": { "type": "string" }
        }
      }
    },
    "metadataHash": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{64}$",
      "description": "SHA-256 hash of the complete metadata artifact for unique identification and ENS text record reference"
    },
    "ensRoot": {
      "type": "string",
      "pattern": "^[a-z0-9.-]+\\.cns\\.eth$",
      "description": "ENS subdomain root (e.g., uniswap.defi.cns.eth)"
    },
    "standards": {
      "type": "object",
      "properties": {
        "ercs": {
          "type": "array",
          "items": { "type": "string" }
        },
        "interfaces": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "artifacts": {
      "type": "object",
      "properties": {
        "abiHash": { "type": "string" },
        "sourceUri": { "type": "string" },
        "license": { "type": "string" }
      }
    },
    "lifecycle": {
      "type": "object",
      "properties": {
        "status": { "type": "string" },
        "since": { "type": "string" },
        "replacedBy": { "type": "string" }
      }
    },
    "security": {
      "type": "object",
      "properties": {
        "audits": { "type": "array" },
        "owners": { "type": "array" },
        "upgradeability": { "type": "string" },
        "permissions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "attestation": {
          "type": "object",
          "required": ["reference", "schema"],
          "properties": {
            "reference": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{64}$",
              "description": "Attestation reference hash or transaction hash"
            },
            "schema": {
              "type": "string",
              "description": "URI to attestation schema definition"
            },
            "attester": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{40}$",
              "description": "Address of the attestation issuer"
            },
            "timestamp": {
              "type": "string",
              "format": "date-time",
              "description": "Attestation creation timestamp"
            },
            "expiry": {
              "type": "string",
              "format": "date-time",
              "description": "Attestation expiry timestamp (optional)"
            },
            "revocable": {
              "type": "boolean",
              "description": "Whether the attestation can be revoked"
            },
            "revocationStatus": {
              "type": "string",
              "enum": ["active", "revoked", "expired"],
              "description": "Current status of the attestation"
            }
          }
        }
      }
    },
    "proxy": {
      "type": "object",
      "properties": {
        "proxyType": {
          "type": "string",
          "enum": ["transparent", "uups", "beacon", "diamond", "minimal", "immutable"]
        },
        "implementationAddress": {
          "type": "string",
          "pattern": "^0x[a-fA-F0-9]{40}$"
        },
        "implementationSlot": { "type": "string" },
        "proxyAdmin": {
          "type": "string",
          "pattern": "^0x[a-fA-F0-9]{40}$"
        },
        "proxyVersion": { "type": "string" }
      }
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "subdomains": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["label", "owner"],
        "properties": {
          "label": { "type": "string" },
          "owner": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          },
          "controller": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          },
          "resolver": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          },
          "records": { "type": "object" }
        }
      }
    }
  }
}
```

### Solidity Type Definitions

The following Solidity structs and enums define the on-chain representation of ENS contract metadata. These types MUST be used by compliant implementations for contract integration:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ENS Contract Metadata Types
/// @notice Core data structures for ENS Contract Metadata Standard (ENSIP-X)
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

    /// @notice Library dependency information
    struct LibraryDependency {
        string name;                      // Variant identifier (e.g., "v4-9-0")
        string domain;                    // Base ENS domain for library metadata
        string license;                   // Library license
        bool critical;                    // Whether this is a critical dependency
        string[] interfaces;              // Interfaces provided by this library
    }

    /// @notice Interface dependency information
    struct InterfaceDependency {
        string name;                      // Variant identifier (e.g., "v0-8-20")
        string domain;                    // Base ENS domain for interface metadata
        string[] implementedBy;           // Contracts implementing this interface
        string[] extends;                 // Interfaces this interface extends
    }

    /// @notice Implementation dependency information
    struct ImplementationDependency {
        string name;                      // Variant identifier (e.g., "v3-1-0")
        string domain;                    // Base ENS domain for implementation metadata
        string[] implements;              // Interfaces this implementation implements
        string[] dependsOn;               // Dependencies this implementation has
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
        PRIVACY,        // Privacy protocols
        ANALYTICS,      // Analytics protocols
        RWA,            // Real World Assets
        SUPPLY,         // Supply Chain Management
        HEALTH,         // Healthcare Applications
        FINANCE,        // Traditional Finance Integration
        DEV,            // Developer Tools and Services
        ART             // Art Platforms and Marketplaces
    }
}
```

### Canonical ID Grammar

The `id` field MUST follow this grammar:

```
org.protocol.category.role[.variant].v{version}.{chainId}
```

**Components:** The `org` field represents the organization identifier (lowercase, hyphen-separated). The `protocol` field contains the protocol name (lowercase, hyphen-separated). The `category` field specifies the root category (MUST match registered categories). The `role` field describes the contract role/function (lowercase, descriptive). The `variant` field is an optional protocol variant identifier. The `version` field uses semantic version format (v{num}, v{num}-{num}, or v{num}-{num}-{num}). The `chainId` field specifies the target blockchain network ID.

**Examples:** `uniswap.uniswap.defi.router.v3-1-0.1`, `ens.ens.dao.governor.v1-0-0.1`, `maker.maker.defi.cdp.v2-1-0.1`

### Metadata Hash Requirements

Each metadata artifact MUST include a unique `metadataHash` field that serves as a cryptographic fingerprint of the complete metadata content.

#### Hash Generation Process

1. **Content Preparation**
   - Remove the `metadataHash` field from the metadata object
   - Sort all object keys alphabetically
   - Serialize to canonical JSON format (no whitespace, sorted keys)
   - Ensure consistent field ordering across all metadata artifacts

2. **Hash Calculation**
   - Apply SHA-256 to the canonical JSON string
   - Prefix with `0x` for Ethereum compatibility
   - Result MUST be exactly 64 characters (32 bytes)

3. **Hash Validation**
   - MUST be unique across all metadata artifacts
   - MUST be deterministic for identical content
   - MUST be verifiable by regenerating from content

#### On-Chain Storage via CCIP Off-Chain Read

The `metadataHash` MUST be stored on-chain and referenced via CCIP (Cross-Chain Interoperability Protocol) off-chain read for decentralized metadata retrieval. The specific implementation details are left to implementers.

### Hierarchical Schema System

The standard supports a 5-level hierarchical schema system:

#### Level 0: CNS Root (`cns.eth`)

The domain `cns.eth` serves as the root domain for all ENS metadata and requires the `ensRoot` field.

#### Level 1: Project (`{project}.cns.eth`)

The domain `{project}.cns.eth` (e.g., `uniswap.cns.eth`) serves as a project-specific root domain, requires the `projectRoot` field, and inherits from `cns.eth`.

#### Level 2: Category (`{project}.{category}.cns.eth`)

The domain `{project}.{category}.cns.eth` (e.g., `uniswap.defi.cns.eth`) serves as a category-specific domain within a project, requires the `categoryRoot` field, and inherits from `{project}.cns.eth` and `cns.eth`.

#### Level 3: Subcategory (`{project}.{category}.{subcategory}.cns.eth`)

The domain `{project}.{category}.{subcategory}.cns.eth` (e.g., `uniswap.defi.amm.cns.eth`) serves as a subcategory-specific domain within a category, requires the `subcategoryRoot` field, and inherits from `{project}.{category}.cns.eth`, `{project}.cns.eth`, and `cns.eth`.

#### Level 4: Contract (`{project}.{category}.{subcategory}.{contract}.cns.eth`)

The domain `{project}.{category}.{subcategory}.{contract}.cns.eth` (e.g., `uniswap.defi.amm.router.cns.eth`) serves as an individual contract domain, requires the `contractRoot` field, and inherits from all parent levels.

### Field Inheritance and Deduplication

The hierarchical system implements four deduplication strategies: **Inherit** (fields inherited from parent levels), **Override** (fields overridden at child levels with explicit marking), **Merge** (fields merged from multiple parent levels), and **Replace** (fields that replace inherited values completely).

### Category Classifications

The standard defines the following primary categories: **`defi`** (Decentralized Finance including AMM, lending, stablecoins, yield farming), **`dao`** (Decentralized Autonomous Organizations including governance, treasury, voting), **`l2`** (Layer 2 Solutions including rollups, sidechains, state channels), **`infra`** (Infrastructure including RPC providers, indexers, oracles), **`token`** (Token Standards including ERC-20, ERC-721, ERC-1155), **`nft`** (Non-Fungible Tokens including marketplaces, platforms, tools), **`gaming`** (Gaming and Virtual Worlds), **`social`** (Social Networks and Communication), **`identity`** (Identity and Authentication), **`privacy`** (Privacy and Anonymity), **`security`** (Security Tools and Services), **`wallet`** (Wallet Applications and Services), **`analytics`** (Analytics and Data Services), **`rwa`** (Real World Assets), **`supply`** (Supply Chain Management), **`health`** (Healthcare Applications), **`finance`** (Traditional Finance Integration), **`dev`** (Developer Tools and Services), and **`art`** (Art Platforms and Marketplaces).

### Proxy Contract Support

The standard includes support for proxy contract patterns: **Transparent Proxy** (traditional proxy with admin), **UUPS Proxy** (Universal Upgradeable Proxy Standard), **Beacon Proxy** (beacon-based upgrade pattern), **Diamond Proxy** (diamond proxy pattern), **Minimal Proxy** (clone factory pattern), and **Immutable** (non-upgradeable contracts).

### Validation Framework

All metadata MUST pass validation against: **Schema Validation** (JSON Schema compliance), **Canonical ID Validation** (grammar pattern compliance), **Address Validation** (Ethereum address format validation), **Cross-Reference Validation** (consistency across related metadata), **Security Validation** (security information completeness), and **Lifecycle Validation** (status and version consistency).

### Security Attestation Schema

All contract metadata MUST include a security attestation that provides cryptographic verification of metadata authenticity and integrity.

#### Attestation Schema Definition

The attestation schema MUST be explicitly defined and referenced in the metadata:

```json
{
  "security": {
    "attestation": {
      "reference": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1234567890123456789012345678901234567890",
      "timestamp": "2023-06-15T00:00:00Z",
      "expiry": "2024-06-15T00:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  }
}
```

#### Attestation Schema Structure

The attestation schema MUST define the following fields:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Contract Metadata Attestation",
  "type": "object",
  "required": ["contractAddress", "metadataHash", "attester", "timestamp"],
  "properties": {
    "contractAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "Ethereum address of the attested contract"
    },
    "metadataHash": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{64}$",
      "description": "SHA-256 hash of the metadata content"
    },
    "attester": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "Address of the authorized attester"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of attestation creation"
    },
    "expiry": {
      "type": "string",
      "format": "date-time",
      "description": "Optional expiry timestamp"
    },
    "revocable": {
      "type": "boolean",
      "description": "Whether the attestation can be revoked"
    },
    "revocationStatus": {
      "type": "string",
      "enum": ["active", "revoked", "expired"],
      "description": "Current status of the attestation"
    }
  }
}
```

#### Attestation Validation Requirements

The attestation system MUST enforce the following validation rules:

1. **Schema Compliance**
   - Attestation MUST conform to the defined JSON Schema
   - All required fields MUST be present and valid

2. **Cryptographic Verification**
   - Attestation hash MUST match the metadata content
   - Attester signature MUST be valid and verifiable
   - Attester MUST be authorized for the contract domain

3. **Temporal Validation**
   - Attestation timestamp MUST be valid ISO 8601 format
   - Expired attestations MUST be clearly marked
   - Revoked attestations MUST include revocation transaction hash

4. **Status Validation**
   - Revocation status MUST be one of: active, revoked, expired
   - Revoked attestations MUST include revocation transaction hash
   - Expired attestations MUST be clearly marked

### Domain-Based Dependency Naming Conventions

The standard defines hierarchical domain naming conventions for dependency mapping using the ENS domain structure. Dependencies are organized under full domain names with variant-based versioning.

#### Dependency Domain Structure

Dependencies follow the hierarchical domain pattern:

```
{org}.{protocol}.{category}.{role}.cns.eth
```

Where variants are specified as subdomains:

```
{variant}.{org}.{protocol}.{category}.{role}.cns.eth
```

#### Dependency Type Conventions

**Library Dependencies:**

- Base domain: `{org}.{protocol}.library.cns.eth`
- Variant domain: `{version}.{org}.{protocol}.library.cns.eth`
- Example: `v4-9-0.openzeppelin.security.library.cns.eth`

**Interface Dependencies:**

- Base domain: `{org}.{protocol}.interface.cns.eth`
- Variant domain: `{version}.{org}.{protocol}.interface.cns.eth`
- Example: `v0-8-20.erc20.token.interface.cns.eth`

**Implementation Dependencies:**

- Base domain: `{org}.{protocol}.{category}.{role}.cns.eth`
- Variant domain: `{version}.{org}.{protocol}.{category}.{role}.cns.eth`
- Example: `v1-0-0.ens.ens.token.token.cns.eth`

#### Dependency Resolution Interface

The standard defines interfaces for dependency management that MUST be implemented by compliant systems:

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

#### Dependency Domain Examples

**ENS Token Contract Dependencies:**

```
ens.ens.token.token.cns.eth
├── dependencies/
│   ├── libraries/
│   │   └── v4-9-0.openzeppelin.security.library.cns.eth
│   ├── interfaces/
│   │   ├── v0-8-20.erc20.token.interface.cns.eth
│   │   └── v3-0-0.ens.base.interface.cns.eth
│   └── implementations/
│       └── v1-0-0.ens.ens.token.token.cns.eth
└── dependents/
    ├── resolvers/
    │   ├── publicresolver.ens.resolver.core.cns.eth
    │   └── offchainresolver.ens.resolver.core.cns.eth
    └── tools/
        └── ens-token-subgraph.indexing.tools.cns.eth
```

## Rationale

The design decisions in this standard are driven by several key principles:

### Canonical ID Grammar

The canonical ID grammar provides a structured, hierarchical naming system that enables uniqueness (each contract has a globally unique identifier), discoverability (IDs encode semantic information about the contract), interoperability (consistent naming across different tools and platforms), and versioning (clear version tracking and evolution).

### Hierarchical Schema System

The 5-level hierarchy enables organization (logical grouping of related contracts), inheritance (shared properties across contract families), scalability (support for complex protocol architectures), and flexibility (accommodates different organizational structures).

### Metadata Hash System

The cryptographic hash system ensures integrity (tamper detection for metadata content), uniqueness (prevents duplicate or conflicting metadata), verification (on-chain verification of metadata authenticity), and decentralization (CCIP-based off-chain storage with on-chain verification).

### Security Attestation Framework

The attestation system provides authenticity (cryptographic proof of metadata validity), accountability (clear attribution of metadata sources), revocation (ability to invalidate outdated or incorrect metadata), and transparency (public verification of attestation status).

### Proxy Contract Support

Comprehensive proxy support addresses complexity (modern DeFi protocols often use proxy patterns), upgradeability (clear documentation of upgrade mechanisms), security (proper handling of implementation contracts), and transparency (clear separation of proxy and implementation concerns).

### Domain-Based Dependency Naming

The hierarchical domain naming system for dependencies enables discoverability (navigate dependency trees through ENS domains), version management (check compatibility across dependency chains), security auditing (trace security implications through dependency chains), and ecosystem integration (automated dependency resolution and cross-protocol compatibility checking).

## Backwards Compatibility

The standard maintains backward compatibility with existing metadata: files with deprecated `domain` field are automatically migrated, deprecated fields are preserved under `_deprecated`, migration warnings are shown but do not block validation, and legacy aliases are supported for existing implementations.

## Prior Work

This ENSIP builds upon several existing standards and protocols:

### ENS Standards

- **ENSIP-1**: Provides the foundational ENS protocol specification
- **ENSIP-2**: Defines ENS offchain resolver capabilities used for metadata retrieval
- **ENSIP-3**: Establishes reverse resolution patterns referenced in metadata

### Ethereum Standards

- **ERC-1967**: Proxy storage slots specification used for proxy contract metadata
- **ERC-2535**: Diamond proxy pattern specification for complex upgradeable contracts
- **EIP-3668**: CCIP read protocol for offchain data retrieval

### Metadata Standards

- **JSON Schema Draft 07**: Provides the validation framework for metadata structure
- **Semantic Versioning**: Establishes version format conventions used in canonical IDs
- **IPFS**: Decentralized storage protocol for metadata artifact hosting

### Related Work

- **OpenZeppelin Contracts**: Provides proxy patterns and security standards referenced in metadata
- **EIP-712**: Structured data hashing used in attestation verification
- **Ethereum Attestation Service**: Provides attestation infrastructure patterns

## Contract Dependency Mapping

### Overview

The ENS Contract Metadata Standard supports comprehensive dependency mapping that organizes contract dependencies using the hierarchical ENS domain structure. This creates discoverable dependency graphs where contracts can find their dependencies, dependents, and related interfaces through ENS domain resolution.

### Dependency Types

The standard defines three primary dependency categories:

#### 1. Library Dependencies

External libraries and frameworks used by contracts, where **name is the variant option**:

```json
{
  "libraries": [
    {
      "name": "v4-9-0",
      "domain": "openzeppelin.security.library.cns.eth",
      "license": "MIT",
      "critical": true,
      "interfaces": ["IERC20", "IERC165", "AccessControl"]
    }
  ]
}
```

#### 2. Interface Dependencies

Interface definitions and their implementations, where **name is the variant option**:

```json
{
  "interfaces": [
    {
      "name": "v0-8-20",
      "domain": "erc20.token.interface.cns.eth",
      "implementedBy": ["uniswap.defi.amm.router.cns.eth"],
      "extends": ["IERC165"]
    }
  ]
}
```

#### 3. Implementation Dependencies

Implementation contracts and their relationships, where **name is the variant option**:

```json
{
  "implementations": [
    {
      "name": "v3-1-0",
      "domain": "uniswap.defi.amm.router.cns.eth",
      "implements": ["IUniswapV3Router"],
      "dependsOn": ["openzeppelin.security.library.cns.eth"]
    }
  ]
}
```

### Hierarchical Organization

Dependencies are organized under the full domain name structure:

```
ens.resolver.core.publicresolver.cns.eth
├── dependencies/
│   ├── libraries/
│   │   └── v4-9-0.openzeppelin.security.library.cns.eth
│   ├── interfaces/
│   │   ├── v1-0-0.ens.resolver.interface.cns.eth
│   │   └── v2-0-0.ens.recordset.interface.cns.eth
│   └── implementations/
│       └── v3-2-0.ens.resolver.core.publicresolver.cns.eth
└── dependents/
    ├── resolvers/
    │   ├── ens.resolver.core.offchainresolver.cns.eth
    │   └── ens.resolver.core.multicallresolver.cns.eth
    └── tools/
        ├── ens-subgraph.indexing.tools.cns.eth
        └── abi-inspector.indexing.tools.cns.eth
```

### Dependency Resolution Interface

The standard defines interfaces for dependency management that MUST be implemented by compliant systems.

### Benefits

#### For Developers

Developers benefit from **Easy Discovery** (finding compatible libraries and interfaces through ENS domains), **Version Management** (checking compatibility before upgrades), and **Integration Support** (understanding how contracts work together).

#### For Security Auditors

Security auditors benefit from **Dependency Tracing** (following security implications through dependency chains), **Vulnerability Assessment** (identifying vulnerable dependencies across the ecosystem), and **Compliance Checking** (verifying security standards across complex dependency graphs).

#### For Protocol Maintainers

Protocol maintainers benefit from **Upgrade Coordination** (planning upgrades that affect dependent contracts), **Compatibility Testing** (ensuring changes do not break ecosystem compatibility), and **Documentation** (auto-generating comprehensive dependency documentation).

## Fee System

The standard may include fee mechanisms to support sustainable operation. Specific fee structures and economic models are left to implementers.

## Security Considerations

### Attestation Requirements

All contract metadata MUST include an attestation reference that provides cryptographic verification of the metadata authenticity and integrity.

#### Attestation Schema Definition

The attestation schema MUST be explicitly defined and referenced in the metadata:

```json
{
  "security": {
    "attestation": {
      "reference": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1234567890123456789012345678901234567890",
      "timestamp": "2023-06-15T00:00:00Z",
      "expiry": "2024-06-15T00:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  }
}
```

#### Attestation Schema Inheritance

Metadata schemas can inherit from attestation schemas to ensure consistency:

```json
{
  "$schema": "https://schemas.ens.domains/contract-metadata/v1.0.0",
  "attestationSchema": {
    "inherits": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
    "extends": {
      "required": ["id", "org", "protocol", "category", "role", "version", "chainId", "addresses"],
      "properties": {
        "security": {
          "allOf": [
            {
              "$ref": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0#/definitions/attestation"
            },
            {
              "properties": {
                "audits": { "type": "array" },
                "owners": { "type": "array" },
                "upgradeability": { "type": "string" }
              }
            }
          ]
        }
      }
    }
  }
}
```

#### Attestation Validation Rules

1. **Reference Validation**
   - Attestation reference MUST be a valid 64-character hex string
   - Reference MUST correspond to a verifiable attestation on-chain
   - Reference MUST be unique within the metadata registry

2. **Schema Validation**
   - Schema URI MUST be accessible and return valid JSON Schema
   - Schema MUST define the structure of the attestation data
   - Schema version MUST be specified and compatible

3. **Attester Validation**
   - Attester address MUST be a valid Ethereum address
   - Attester MUST be authorized to issue attestations for the contract
   - Attester credentials MUST be verifiable

4. **Timestamp Validation**
   - Timestamp MUST be in ISO 8601 format
   - Timestamp MUST be within reasonable bounds (not future-dated)
   - Expiry timestamp MUST be after creation timestamp

5. **Status Validation**
   - Revocation status MUST be one of: active, revoked, expired
   - Revoked attestations MUST include revocation transaction hash
   - Expired attestations MUST be clearly marked

#### Attestation Schema Examples

**Basic Contract Attestation Schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Contract Metadata Attestation",
  "type": "object",
  "required": ["contractAddress", "metadataHash", "attester", "timestamp"],
  "properties": {
    "contractAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$"
    },
    "metadataHash": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{64}$"
    },
    "attester": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "expiry": {
      "type": "string",
      "format": "date-time"
    },
    "revocable": {
      "type": "boolean"
    }
  }
}
```

**Proxy Contract Attestation Schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Proxy Contract Metadata Attestation",
  "type": "object",
  "required": ["proxyAddress", "implementationAddress", "metadataHash", "attester", "timestamp"],
  "properties": {
    "proxyAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$"
    },
    "implementationAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$"
    },
    "metadataHash": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{64}$"
    },
    "attester": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "proxyType": {
      "type": "string",
      "enum": ["transparent", "uups", "beacon", "diamond", "minimal", "immutable"]
    }
  }
}
```

#### Attestation Verification

Attestation verification mechanisms must be implemented by compliant systems to ensure metadata integrity and authenticity.

### Metadata Integrity

All metadata files MUST be cryptographically signed, addresses MUST be validated against on-chain deployments, proxy implementations MUST be verified, security audit information MUST be current and verifiable, and attestation references MUST be verifiable on-chain.

### Access Control

Metadata updates require proper authorization, deprecated metadata MUST be marked as such, security-sensitive information MUST be properly protected, and attestation issuance requires authorized attester credentials.

### Validation Requirements

All metadata MUST pass automated validation, security audits MUST be current (within 12 months), proxy implementations MUST be verified, address integrity MUST be maintained, and attestation references MUST be valid and non-revoked.

## Implementation

This section provides high-level guidance for implementing the ENS Contract Metadata Standard.

### Metadata Registry Contract

Implementers MUST deploy a metadata registry contract that stores metadata hashes and associated CCIP gateway information. The registry MUST support metadata hash verification, gateway configuration, and attestation management.

### CCIP Integration

Implementers MUST integrate with CCIP (Cross-Chain Interoperability Protocol) for offchain metadata retrieval. The implementation MUST support gateway configuration, path resolution, and fallback mechanisms.

### Validation Framework

Implementers MUST provide validation tools that verify metadata against the JSON Schema, validate canonical ID grammar, check address formats, and perform cross-reference validation.

### Attestation System

Implementers MUST support cryptographic attestation of metadata authenticity. The system MUST handle attestation issuance, verification, revocation, and status tracking.

### Proxy Contract Support

Implementers MUST provide comprehensive support for proxy contract patterns including transparent proxies, UUPS proxies, beacon proxies, diamond proxies, and minimal proxies.

### Migration Tools

Implementers MUST provide migration tools for converting existing metadata to the ENSIP-X format, handling deprecated fields, and maintaining backward compatibility.

## Governance

### Metadata Stewardship

The standard includes lightweight stewardship for new categories, deprecation process for obsolete metadata, version management for schema updates, and community-driven category expansion.

### Update Process

The update process includes: proposing metadata changes through ENS governance, community review and feedback period, implementation and testing, deployment and migration support, and documentation updates.

### Dispute Resolution

Metadata disputes are resolved through ENS governance, technical issues are addressed through community consensus, and security concerns are escalated to appropriate authorities.

## Migration Guide

### From Legacy Metadata

1. Install compliant metadata tools
2. Run migration process for existing metadata
3. Validate migrated metadata
4. Update references to new canonical IDs

### Schema Updates

1. Backup existing metadata
2. Run schema update process
3. Validate updated metadata
4. Deploy updated metadata

### Quality Assurance Standards

The standard defines quality assurance requirements that must be implemented by compliant systems to ensure metadata integrity and consistency.

### Proxy Contract Specifications

The standard includes detailed proxy contract handling:

#### Supported Proxy Types

The standard supports **Transparent Proxy** (ERC-1967 with separate admin), **UUPS Proxy** (Universal Upgradeable Proxy Standard), **Beacon Proxy** (beacon-based upgrade pattern), **Diamond Proxy** (ERC-2535 Diamond pattern), **Minimal Proxy** (clone factory pattern), and **Immutable** (non-upgradeable contracts).

#### Proxy Naming Conventions

```
{role}.{protocol}.{category}.cns.eth          # Main proxy contract
{role}-impl.{protocol}.{category}.cns.eth     # Implementation contract
{role}-admin.{protocol}.{category}.cns.eth     # Admin contract (transparent only)
```

#### Proxy Validation Rules

Implementation address is required for all proxy types except immutable, admin address is required for transparent proxies, implementation slot validation is required for ERC-1967 proxies, and naming consistency validation is required across proxy/implementation/admin.

### Ownership Release Handling

Contracts that release ownership require special metadata handling to document the transition from centralized to decentralized control:

#### Ownership Release Types

The standard defines four ownership release types: **Admin Contract Renunciation** (transparent proxy admin contracts that renounce admin privileges, UUPS proxies where implementation contract renounces upgrade authority, beacon proxies where beacon contract renounces control), **Ownership Transfer to Zero Address** (contracts transferring ownership to `0x0000000000000000000000000000000000000000`, timelock contracts that expire and become immutable, governance contracts that become fully decentralized), **Multi-signature to Single Signature** (transition from multi-sig control to individual key control, DAO governance transitions from council to token holders), and **Complete Decentralization** (contracts that remove all upgrade mechanisms, immutable contracts with no admin functions, contracts governed entirely by on-chain mechanisms).

#### Metadata Requirements for Ownership Release

```json
{
  "security": {
    "upgradeability": "renounced",
    "ownershipStatus": "decentralized",
    "ownershipRelease": {
      "type": "admin-renunciation",
      "date": "2023-06-15T00:00:00Z",
      "transactionHash": "0x1234567890abcdef...",
      "blockNumber": 17500000,
      "previousOwner": "0x1234567890123456789012345678901234567890",
      "newOwner": "0x0000000000000000000000000000000000000000",
      "releaseMethod": "renounceOwnership",
      "irreversible": true,
      "verificationTx": "0xabcdef1234567890..."
    }
  },
  "lifecycle": {
    "status": "immutable",
    "since": "2023-06-15T00:00:00Z",
    "ownershipTransition": {
      "from": "centralized",
      "to": "decentralized",
      "date": "2023-06-15T00:00:00Z"
    }
  }
}
```

#### Ownership Release Validation Rules

**Verification Requirements:** Transaction hash must be provided and verifiable on-chain, block number must be specified for historical verification, previous and new owner addresses must be documented, and release method must be specified (e.g., `renounceOwnership`, `transferOwnership`).

**Irreversibility Confirmation:** The `irreversible` field must be `true` for true ownership release, verification transaction must be provided for audit purposes, and on-chain verification must confirm no remaining admin functions.

**Timeline Documentation:** Ownership release date must be specified in ISO 8601 format, lifecycle status must be updated to reflect new state, and ownership transition must be documented in lifecycle section.

**Security Implications:** Security audit must cover ownership release mechanism, risk assessment must be updated post-release, and upgradeability status must be set to `renounced` or `immutable`.

#### Examples of Ownership Release Metadata

**Uniswap V2 Factory (Admin Renunciation)**

```json
{
  "id": "uniswap.uniswap.defi.factory.v2-0-0.1",
  "security": {
    "upgradeability": "renounced",
    "ownershipStatus": "decentralized",
    "ownershipRelease": {
      "type": "admin-renunciation",
      "date": "2020-05-05T00:00:00Z",
      "transactionHash": "0x1234567890abcdef...",
      "blockNumber": 10000834,
      "previousOwner": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      "newOwner": "0x0000000000000000000000000000000000000000",
      "releaseMethod": "renounceOwnership",
      "irreversible": true
    }
  },
  "lifecycle": {
    "status": "immutable",
    "since": "2020-05-05T00:00:00Z",
    "ownershipTransition": {
      "from": "centralized",
      "to": "decentralized",
      "date": "2020-05-05T00:00:00Z"
    }
  }
}
```

**ENS Registry (Ownership Renunciation)**

```json
{
  "id": "ens.ens.registry.core.v1-14-0.1",
  "security": {
    "upgradeability": "renounced",
    "ownershipStatus": "decentralized",
    "ownershipRelease": {
      "type": "admin-renunciation",
      "date": "2022-03-17T00:00:00Z",
      "transactionHash": "0xf43c3eb6e7057c7d4c2da4a2ff61b8c06b8276cfc87aad8447ceaee85f15f6cc",
      "blockNumber": 14398710,
      "previousOwner": "0x22b00123c5f7665fbb1f3509b32f8ce78e54b191",
      "newOwner": "0x0000000000000000000000000000000000000000",
      "releaseMethod": "renounceOwnership",
      "irreversible": true
    }
  },
  "lifecycle": {
    "status": "immutable",
    "since": "2022-03-17T00:00:00Z",
    "ownershipTransition": {
      "from": "centralized",
      "to": "decentralized",
      "date": "2022-03-17T00:00:00Z"
    }
  }
}
```

#### Validation for Ownership Release

Ownership release validation must ensure irreversible transitions are properly documented and verified.

#### Metadata Authority and Subdomain Schema Management

Even after ownership release, the deploying address or previous owner retains authority over metadata and subdomain schema configuration:

**Pre-Release Metadata Authority:** The deploying address can establish comprehensive metadata schema before ownership release, the previous owner can define subdomain naming conventions and ownership patterns, and metadata authority is separate from contract ownership and upgradeability.

**Post-Release Metadata Management:** Metadata updates may still be possible through pre-configured mechanisms, subdomain schema remains under control of the original metadata authority, and ENS subdomain ownership patterns are established before contract decentralization.

**Metadata Authority Examples**

```json
{
  "metadataAuthority": {
    "authorityType": "deployer",
    "authorityAddress": "0x1234567890123456789012345678901234567890",
    "establishedDate": "2023-01-01T00:00:00Z",
    "authorityScope": ["metadata-updates", "subdomain-schema", "naming-conventions"],
    "transferable": false,
    "irreversible": true
  },
  "subdomainSchema": {
    "establishedBy": "0x1234567890123456789012345678901234567890",
    "schemaVersion": "v1-0-0",
    "namingPatterns": {
      "implementation": "{role}-impl.{protocol}.{category}.cns.eth",
      "admin": "{role}-admin.{protocol}.{category}.cns.eth",
      "governance": "{role}-gov.{protocol}.{category}.cns.eth"
    },
    "ownershipRules": {
      "implementationOwner": "implementation-contract-address",
      "adminOwner": "admin-contract-address",
      "governanceOwner": "dao-multisig-address"
    }
  }
}
```

#### Security Considerations for Ownership Release

**Pre-Release Validation:** Confirm all admin functions are properly renounced, verify no backdoors or hidden upgrade mechanisms remain, ensure all critical parameters are set to final values, and establish metadata authority and subdomain schema before release.

**Post-Release Monitoring:** Monitor for any unexpected contract behavior, verify no new admin functions can be added, confirm contract remains immutable, and monitor metadata authority for unauthorized changes.

**Documentation Requirements:** Document the decision-making process for ownership release, include community approval mechanisms if applicable, provide clear rationale for the timing of the release, and document metadata authority establishment and scope.

**Risk Assessment Updates:** Update security risk profile post-release, document any new risks introduced by decentralization, provide guidance for users on the implications of immutability, and assess risks related to metadata authority and subdomain control.

#### Metadata Authority Validation

**Authority Establishment Validation**

Metadata authority establishment must be validated to ensure proper scope and permissions are defined.

**Authority Transfer Validation**

Authority transfer mechanisms must be validated to ensure proper authorization and documentation.

#### Metadata Authority Best Practices

**Establish Authority Before Release:** Set up metadata authority structure before ownership release, define clear scope and limitations of metadata authority, and document authority establishment in metadata.

**Separate Concerns:** Distinguish between contract ownership and metadata authority, ensure metadata authority cannot affect contract functionality, and document any overlap between authorities.

**Transparency Requirements:** Publicly document metadata authority establishment, provide clear audit trail for authority changes, and include authority information in security audits.

**Community Oversight:** Consider community input on metadata authority scope, document community approval mechanisms if applicable, and provide mechanisms for community challenge of authority decisions.

### ENS Operations Integration

The standard integrates with ENS operations:

#### Subdomain Registration

The standard includes owner address validation, resolver configuration, TTL settings (ENSv2), and fuse management (ENSv3).

#### Record Management

The standard supports address records (ETH and multicoin), text records (URL, description, version), content hash records, and reverse resolution support.

#### Fuse System (ENSv3)

The standard defines critical fuses (CANNOT_UNWRAP, CANNOT_BURN_FUSES, CANNOT_TRANSFER), fuse templates (locked, immutable, subdomain-locked, resolver-locked), and permanent security guarantees through burned fuses.

### Compliance Scoring

Compliance scoring mechanisms may be implemented by compliant systems to assess metadata quality and adherence to standards.

### Migration and Backward Compatibility

#### Legacy Support

The standard provides automatic migration from deprecated `domain` field to `category`, preservation of deprecated fields under `_deprecated`, migration warnings that do not block validation, and legacy alias support for existing implementations.

#### Migration Process

Migration processes must be implemented by compliant systems to ensure backward compatibility and smooth transitions.

## Examples

### DeFi AMM Contract

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "subcategory": "amm",
  "role": "router",
  "version": "v3-1-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "deployedBlock": 12369621
    }
  ],
  "metadataHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "ercs": ["ERC-20", "ERC-721"],
    "interfaces": ["IUniswapV3SwapCallback"]
  },
  "artifacts": {
    "abiHash": "0x1234567890abcdef...",
    "sourceUri": "https://github.com/Uniswap/v3-core",
    "license": "GPL-3.0"
  },
  "lifecycle": {
    "status": "active",
    "since": "2021-05-05"
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "date": "2021-03-15",
        "report": "https://uniswap.org/audit-trail-of-bits"
      }
    ],
    "upgradeability": "immutable"
  },
  "tags": ["amm", "dex", "ethereum", "uniswap-v3"]
}
```

### DAO Governance Contract with Proxy

```json
{
  "id": "ens.ens.dao.governor.v1-0-0.1",
  "org": "ens",
  "protocol": "ens",
  "category": "dao",
  "subcategory": "governance",
  "role": "governor",
  "version": "v1-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x323A76393544d5ecca80cd6ef2A560C98a6e9b8E",
      "deployedBlock": 12067752,
      "implementation": "0x0987654321098765432109876543210987654321",
      "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    }
  ],
  "metadataHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "ensRoot": "ens.dao.cns.eth",
  "standards": {
    "ercs": ["ERC-20"],
    "interfaces": ["IGovernor"]
  },
  "artifacts": {
    "abiHash": "0xabcdef1234567890...",
    "sourceUri": "https://github.com/ensdomains/governance",
    "license": "MIT"
  },
  "lifecycle": {
    "status": "active",
    "since": "2021-08-17"
  },
  "security": {
    "audits": [
      {
        "firm": "OpenZeppelin",
        "date": "2021-07-20",
        "report": "https://ens.domains/audit-openzeppelin"
      }
    ],
    "upgradeability": "transparent"
  },
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x0987654321098765432109876543210987654321",
    "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    "proxyAdmin": "0x1234567890123456789012345678901234567890",
    "proxyVersion": "v1-0-0",
    "implementationMetadata": {
      "name": "GovernanceImplementation",
      "version": "v1-0-0",
      "sourceUri": "https://github.com/ensdomains/governance",
      "abiHash": "0xabcdef1234567890"
    }
  },
  "subdomains": [
    {
      "label": "governor",
      "owner": "0x323A76393544d5ecca80cd6ef2A560C98a6e9b8E",
      "controller": "0x1234567890123456789012345678901234567890",
      "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
      "records": {
        "url": "https://ens.domains/governance",
        "description": "ENS DAO Governance Contract"
      }
    },
    {
      "label": "governor-impl",
      "owner": "0x0987654321098765432109876543210987654321"
    },
    {
      "label": "governor-admin",
      "owner": "0x1234567890123456789012345678901234567890"
    }
  ],
  "tags": ["dao", "governance", "ens", "ethereum", "proxy"]
}
```

### Token Contract Example

```json
{
  "id": "ens.ens.token.token.v1-0-0.1",
  "org": "ens",
  "protocol": "ens",
  "category": "token",
  "subcategory": "native",
  "role": "token",
  "version": "v1-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xC5dDf9077ca0834C1FaDDED2B2B29Cf0fB5bC8Be",
      "deployedBlock": 12765000
    }
  ],
  "metadataHash": "0xc4167f60a302d0a0bfa11b36b6cd4d59dc38c88621204520fd2fa2c1ae5999a2",
  "ensRoot": "ens.token.cns.eth",
  "standards": {
    "ercs": ["ERC-20"],
    "interfaces": ["IERC20", "IERC20Metadata"]
  },
  "artifacts": {
    "abiHash": "0xf5e6200cd46e6c2482a5e00cc8bfa1d1a7cf4d7a69b0290e190df9a46fd229ad",
    "sourceUri": "https://github.com/ensdomains/governance-token",
    "license": "MIT"
  },
  "lifecycle": {
    "status": "active",
    "since": "2021-05-04"
  },
  "security": {
    "audits": [
      {
        "firm": "OpenZeppelin",
        "date": "2021-05-10",
        "report": "https://docs.ens.domains/audit-openzeppelin-ens-token"
      }
    ],
    "upgradeability": "immutable"
  },
  "tags": ["ens", "token", "erc-20", "governance", "ethereum"]
}
```

## References

[ENSIP-1: ENS](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md), [ENSIP-2: ENS Offchain Resolver](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3668.md), [ENSIP-3: ENS Reverse Resolution](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-181.md), [JSON Schema Draft 07](https://json-schema.org/draft/2019-09/schema), [Semantic Versioning](https://semver.org/), [ERC-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
