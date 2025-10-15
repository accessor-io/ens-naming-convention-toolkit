---
description: 'Standardized metadata format for Ethereum smart contracts registered through ENS with canonical ID grammar, hierarchical schema system, and validation framework'
contributors: ['ens-metadata-tools']
ensip:
  created: '2024-01-15'
  status: 'draft'
---

# ENSIP-19: ENS Contract Metadata Standard

## Abstract

This ENSIP establishes a standardized metadata format for Ethereum smart contracts registered through the Ethereum Name Service (ENS). The standard defines a canonical ID grammar, hierarchical schema system, and validation framework to ensure consistency, discoverability, and interoperability across the Ethereum ecosystem.

## Motivation

The Ethereum ecosystem lacks standardized metadata formats for smart contracts, leading to:

- **Fragmentation**: Metadata and naming conventions are not unified, resulting in disparate systems and formats across projects
- **Limited Discoverability**: The absence of standard categories and schema makes it challenging to locate, identify, or organize contracts effectively
- **Unreliable Data Quality**: Metadata is often incomplete, outdated, or inconsistently formatted, impeding analytics and automation
- **Interoperability Barriers**: Without a common metadata grammar, integration across different protocols and ecosystems is hindered
- **Security Information Gaps**: Security-related details and audit results are inconsistently reported, making risk assessment difficult

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
      "description": "Canonical identifier following ENSIP-19 grammar"
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

### Canonical ID Grammar

The `id` field MUST follow this grammar:

```
org.protocol.category.role[.variant].v{version}.{chainId}
```

**Components:**

- `org`: Organization identifier (lowercase, hyphen-separated)
- `protocol`: Protocol name (lowercase, hyphen-separated)
- `category`: Root category (must match registered categories)
- `role`: Contract role/function (lowercase, descriptive)
- `variant`: Optional protocol variant identifier
- `version`: Semantic version format (v{num}, v{num}-{num}, or v{num}-{num}-{num})
- `chainId`: Target blockchain network ID

**Examples:**

- `uniswap.uniswap.defi.router.v3-1-0.1`
- `ens.ens.dao.governor.v1-0-0.1`
- `maker.maker.defi.cdp.v2-1-0.1`

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
   - Result must be exactly 64 characters (32 bytes)

3. **Hash Validation**
   - Must be unique across all metadata artifacts
   - Must be deterministic for identical content
   - Must be verifiable by regenerating from content

#### On-Chain Storage via CCIP Off-Chain Read

The `metadataHash` MUST be stored on-chain and referenced via CCIP (Cross-Chain Interoperability Protocol) off-chain read for decentralized metadata retrieval:

**On-Chain Storage Structure**

```solidity
// ENSIP-19 Metadata Registry Contract
contract MetadataRegistry {
    struct MetadataRecord {
        bytes32 metadataHash;        // SHA-256 hash of metadata
        string gateway;             // CCIP gateway URL
        string path;                // Path to metadata file
        uint256 timestamp;          // Last update timestamp
        address attester;           // Attestation issuer
        bool active;                // Record status
    }

    mapping(bytes32 => MetadataRecord) public records;
    mapping(address => bool) public authorizedAttesters;

    event MetadataUpdated(bytes32 indexed metadataHash, string gateway, string path);
    event MetadataRevoked(bytes32 indexed metadataHash);
}
```

### Hierarchical Schema System

The standard supports a 5-level hierarchical schema system:

#### Level 0: CNS Root (`cns.eth`)

- **Domain**: `cns.eth`
- **Purpose**: Root domain for all ENS metadata
- **Required Fields**: `ensRoot`

#### Level 1: Project (`{project}.cns.eth`)

- **Domain**: `{project}.cns.eth` (e.g., `uniswap.cns.eth`)
- **Purpose**: Project-specific root domain
- **Required Fields**: `projectRoot`
- **Inherits**: `cns.eth`

#### Level 2: Category (`{project}.{category}.cns.eth`)

- **Domain**: `{project}.{category}.cns.eth` (e.g., `uniswap.defi.cns.eth`)
- **Purpose**: Category-specific domain within a project
- **Required Fields**: `categoryRoot`
- **Inherits**: `{project}.cns.eth`, `cns.eth`

#### Level 3: Subcategory (`{project}.{category}.{subcategory}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.cns.eth` (e.g., `uniswap.defi.amm.cns.eth`)
- **Purpose**: Subcategory-specific domain within a category
- **Required Fields**: `subcategoryRoot`
- **Inherits**: `{project}.{category}.cns.eth`, `{project}.cns.eth`, `cns.eth`

#### Level 4: Contract (`{project}.{category}.{subcategory}.{contract}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.{contract}.cns.eth` (e.g., `uniswap.defi.amm.router.cns.eth`)
- **Purpose**: Individual contract domain
- **Required Fields**: `contractRoot`
- **Inherits**: All parent levels

### Category Classifications

The standard defines the following primary categories:

- **`defi`**: Decentralized Finance (AMM, lending, stablecoins, yield farming)
- **`dao`**: Decentralized Autonomous Organizations (governance, treasury, voting)
- **`l2`**: Layer 2 Solutions (rollups, sidechains, state channels)
- **`infra`**: Infrastructure (RPC providers, indexers, oracles)
- **`token`**: Token Standards (ERC-20, ERC-721, ERC-1155)
- **`nft`**: Non-Fungible Tokens (marketplaces, platforms, tools)
- **`gaming`**: Gaming and Virtual Worlds
- **`social`**: Social Networks and Communication
- **`identity`**: Identity and Authentication
- **`privacy`**: Privacy and Anonymity
- **`security`**: Security Tools and Services
- **`wallet`**: Wallet Applications and Services
- **`analytics`**: Analytics and Data Services
- **`rwa`**: Real World Assets
- **`supply`**: Supply Chain Management
- **`health`**: Healthcare Applications
- **`finance`**: Traditional Finance Integration
- **`dev`**: Developer Tools and Services
- **`art`**: Art Platforms and Marketplaces

### Proxy Contract Support

The standard includes support for proxy contract patterns:

- **Transparent Proxy**: Traditional proxy with admin
- **UUPS Proxy**: Universal Upgradeable Proxy Standard
- **Beacon Proxy**: Beacon-based upgrade pattern
- **Diamond Proxy**: Diamond proxy pattern
- **Minimal Proxy**: Clone factory pattern
- **Immutable**: Non-upgradeable contracts

### Validation Framework

All metadata MUST pass validation against:

1. **Schema Validation**: JSON Schema compliance
2. **Canonical ID Validation**: Grammar pattern compliance
3. **Address Validation**: Ethereum address format validation
4. **Cross-Reference Validation**: Consistency across related metadata
5. **Security Validation**: Security information completeness
6. **Lifecycle Validation**: Status and version consistency

## Rationale

The design decisions in this standard are driven by several key principles:

### Canonical ID Grammar

The canonical ID grammar provides a structured, hierarchical naming system that enables:

- **Uniqueness**: Each contract has a globally unique identifier
- **Discoverability**: IDs encode semantic information about the contract
- **Interoperability**: Consistent naming across different tools and platforms
- **Versioning**: Clear version tracking and evolution

### Hierarchical Schema System

The 5-level hierarchy enables:

- **Organization**: Logical grouping of related contracts
- **Inheritance**: Shared properties across contract families
- **Scalability**: Support for complex protocol architectures
- **Flexibility**: Accommodates different organizational structures

### Metadata Hash System

The cryptographic hash system ensures:

- **Integrity**: Tamper detection for metadata content
- **Uniqueness**: Prevents duplicate or conflicting metadata
- **Verification**: On-chain verification of metadata authenticity
- **Decentralization**: CCIP-based off-chain storage with on-chain verification

### Security Attestation Framework

The attestation system provides:

- **Authenticity**: Cryptographic proof of metadata validity
- **Accountability**: Clear attribution of metadata sources
- **Revocation**: Ability to invalidate outdated or incorrect metadata
- **Transparency**: Public verification of attestation status

### Proxy Contract Support

Comprehensive proxy support addresses:

- **Complexity**: Modern DeFi protocols often use proxy patterns
- **Upgradeability**: Clear documentation of upgrade mechanisms
- **Security**: Proper handling of implementation contracts
- **Transparency**: Clear separation of proxy and implementation concerns

## Backwards Compatibility

The standard maintains backward compatibility with existing metadata:

- Files with deprecated `domain` field are automatically migrated
- Deprecated fields are preserved under `_deprecated`
- Migration warnings are shown but don't block validation
- Legacy aliases are supported for existing implementations

## Security Considerations

### Attestation Requirements

All contract metadata MUST include an attestation reference that provides cryptographic verification of the metadata's authenticity and integrity.

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

### Metadata Integrity

- All metadata files MUST be cryptographically signed
- Addresses MUST be validated against on-chain deployments
- Proxy implementations MUST be verified
- Security audit information MUST be current and verifiable
- **Attestation references MUST be verifiable on-chain**

### Access Control

- Metadata updates require proper authorization
- Deprecated metadata MUST be marked as such
- Security-sensitive information MUST be properly protected
- **Attestation issuance requires authorized attester credentials**

### Validation Requirements

- All metadata MUST pass automated validation
- Security audits MUST be current (within 12 months)
- Proxy implementations MUST be verified
- Address integrity MUST be maintained
- **Attestation references MUST be valid and non-revoked**

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
