---
description: 'Standardized metadata format for Ethereum smart contracts registered through ENS with canonical ID grammar, hierarchical schema system, and validation framework'
contributors: ['acc']
ensip:
  created: '2025-10-13'
  status: 'draft'
  version: '1.0.0'
---

# ENS Contract Metadata Standard (ENSIP-X)

## Abstract

This ENSIP establishes a standardized metadata format for Ethereum smart contracts registered through the Ethereum Name Service (ENS). The standard defines a canonical ID grammar, hierarchical schema system, and validation framework to ensure consistency, discoverability, and interoperability across the Ethereum ecosystem.

**Key Features:**

- **Canonical ID Grammar**: Structured naming system for unique contract identification
- **Hierarchical Schema**: 5-level organizational hierarchy for scalable metadata management
- **Security Framework**: Cryptographic attestation system for metadata integrity
- **Proxy Support**: Comprehensive support for modern proxy contract patterns
- **Validation Framework**: Automated validation and verification tools

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Quick Start](#quick-start)
- [Core Specification](#core-specification)
  - [Canonical ID Grammar](#canonical-id-grammar)
  - [Metadata Schema](#metadata-schema)
  - [Hierarchical Schema System](#hierarchical-schema-system)
- [Implementation Guide](#implementation-guide)
- [Security Considerations](#security-considerations)
- [Validation Framework](#validation-framework)
- [Examples](#examples)
- [Reference Implementation](#reference-implementation)

## Motivation

The Ethereum ecosystem lacks standardized metadata formats for smart contracts, leading to:

- **Fragmentation**: Metadata and naming conventions are not unified, resulting in disparate systems and formats across projects
- **Limited Discoverability**: The absence of standard categories and schema makes it challenging to locate, identify, or organize contracts effectively
- **Unreliable Data Quality**: Metadata is often incomplete, outdated, or inconsistently formatted, impeding analytics and automation
- **Interoperability Barriers**: Without a common metadata grammar, integration across different protocols and ecosystems is hindered
- **Security Information Gaps**: Security-related details and audit results are inconsistently reported, making risk assessment difficult

This standard addresses these issues by providing a unified metadata framework that promotes consistency, enables automated validation, and supports hierarchical organization of contract information.

## Quick Start

### Creating Basic Contract Metadata

Here's a minimal example for a Uniswap V3 Router contract:

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "router",
  "version": "v3-1-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    }
  ],
  "metadataHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "ercs": ["erc20"],
    "interfaces": [
      {
        "name": "IUniswapV3Router",
        "id": "0xe343e6d8",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "inherited": [
          {
            "name": "IERC20",
            "id": "0x36372b07",
            "required": true
          }
        ],
        "implemented": [
          "exactInputSingle(ExactInputSingleParams)",
          "exactInput(ExactInputParams)",
          "exactOutputSingle(ExactOutputSingleParams)",
          "exactOutput(ExactOutputParams)"
        ],
        "events": ["Swap(address,address,int256,int256,uint160,uint128,int24)"],
        "documentation": "https://docs.uniswap.org/protocol/reference/core/interfaces/IUniswapV3Router"
      }
    ]
  }
}
```

### ID Grammar Quick Reference

`{org}.{protocol}.{category}.{role}.{variant}.v{version}.{chainId}`

- **org**: Project organization (e.g., `uniswap`, `ens`)
- **protocol**: Protocol name (e.g., `uniswap`, `ens`)
- **category**: Contract category (see [Category Classifications](#category-classifications))
- **role**: Contract function (e.g., `router`, `governor`, `token`)
- **variant**: Optional variant (e.g., `v3`, `alpha`)
- **version**: Semantic version (e.g., `v1-0-0`)
- **chainId**: Network ID (e.g., `1` for Ethereum mainnet)

### Validation Checklist

Before publishing metadata, ensure:

- [ ] ID follows canonical grammar
- [ ] All required fields are present
- [ ] Addresses are valid and deployed
- [ ] Metadata hash is correctly calculated
- [ ] Attestation is included and valid
- [ ] Schema validation passes

## Core Specification

### Metadata Schema

All ENS contract metadata MUST conform to the JSON Schema defined below. The schema is designed to be **extensible** and **modular**, allowing for future enhancements while maintaining backward compatibility.

#### Schema Overview

The schema consists of several logical groups:

- **Identity Fields**: Core identification (`id`, `org`, `protocol`, etc.)
- **Network Fields**: Blockchain-specific information (`chainId`, `addresses`)
- **Organization Fields**: Hierarchical organization (`ensRoot`, `subdomains`)
- **Technical Fields**: Standards compliance and artifacts (`standards`, `artifacts`)
- **Security Fields**: Attestation and security information (`security`)
- **Operational Fields**: Lifecycle and proxy information (`lifecycle`, `proxy`)

#### Required vs Optional Fields

**Required** (must be present):

- `id`, `org`, `protocol`, `category`, `role`, `version`, `chainId`, `addresses`, `metadataHash`

**Strongly Recommended** (should be present for production contracts):

- `ensRoot`, `standards`, `security.attestation`

**Optional** (nice to have, but not required):

- `subcategory`, `variant`, `artifacts`, `lifecycle`, `proxy`, `tags`, `subdomains`

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
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Interface name (e.g., IERC20, IUniswapV3Router)"
              },
              "id": {
                "type": "string",
                "pattern": "^0x[a-fA-F0-9]{8}$",
                "description": "ERC-165 interface identifier"
              },
              "standard": {
                "type": "string",
                "description": "Associated standard (ERC-20, ERC-721, etc.)"
              },
              "version": {
                "type": "string",
                "description": "Interface version or specification version"
              },
              "inherited": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": { "type": "string" },
                    "id": { "type": "string", "pattern": "^0x[a-fA-F0-9]{8}$" },
                    "required": { "type": "boolean" }
                  }
                },
                "description": "Interfaces this interface inherits from"
              },
              "implemented": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Contract functions implementing this interface"
              },
              "optional": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Optional functions in this interface"
              },
              "events": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Events defined by this interface"
              },
              "errors": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Custom errors defined by this interface"
              },
              "documentation": {
                "type": "string",
                "format": "uri",
                "description": "Link to interface documentation"
              },
              "specification": {
                "type": "string",
                "format": "uri",
                "description": "Link to formal specification"
              }
            },
            "required": ["name"]
          },
          "description": "Detailed interface implementation information"
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
        "owners": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string",
                "pattern": "^0x[a-fA-F0-9]{40}$",
                "description": "Owner address (can be EOA or multisig)"
              },
              "type": {
                "type": "string",
                "enum": ["eoa", "multisig", "dao", "contract", "gnosis-safe", "multisig-wallet"],
                "description": "Type of owner entity"
              },
              "ownershipReleased": {
                "type": "boolean",
                "description": "Whether ownership has been renounced or transferred to null address"
              },
              "multisig": {
                "type": "object",
                "description": "Multisig configuration details",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": ["gnosis-safe", "multisig-wallet", "dao", "custom"],
                    "description": "Multisig implementation type"
                  },
                  "version": {
                    "type": "string",
                    "description": "Multisig contract version"
                  },
                  "threshold": {
                    "type": "integer",
                    "minimum": 1,
                    "description": "Required signatures for execution"
                  },
                  "signers": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "address": {
                          "type": "string",
                          "pattern": "^0x[a-fA-F0-9]{40}$"
                        },
                        "weight": {
                          "type": "integer",
                          "minimum": 1,
                          "description": "Voting weight (for weighted multisigs)"
                        },
                        "role": {
                          "type": "string",
                          "enum": ["signer", "owner", "admin"],
                          "description": "Role in the multisig"
                        }
                      },
                      "required": ["address"]
                    },
                    "description": "List of multisig signers"
                  },
                  "modules": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "address": {
                          "type": "string",
                          "pattern": "^0x[a-fA-F0-9]{40}$"
                        },
                        "type": {
                          "type": "string",
                          "enum": ["recovery", "social", "whitelist", "spending-limit", "custom"]
                        },
                        "enabled": { "type": "boolean" }
                      }
                    },
                    "description": "Enabled multisig modules"
                  },
                  "fallbackHandler": {
                    "type": "string",
                    "pattern": "^0x[a-fA-F0-9]{40}$",
                    "description": "Fallback handler contract address"
                  },
                  "guard": {
                    "type": "string",
                    "pattern": "^0x[a-fA-F0-9]{40}$",
                    "description": "Guard contract for transaction validation"
                  }
                }
              },
              "dao": {
                "type": "object",
                "description": "DAO governance configuration",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": ["governor", "compound", "aragon", "dao-stack", "custom"],
                    "description": "DAO framework type"
                  },
                  "token": {
                    "type": "string",
                    "pattern": "^0x[a-fA-F0-9]{40}$",
                    "description": "Governance token address"
                  },
                  "quorum": {
                    "type": "string",
                    "description": "Quorum requirement for proposals"
                  },
                  "timelock": {
                    "type": "integer",
                    "description": "Timelock delay in seconds"
                  },
                  "votingPeriod": {
                    "type": "integer",
                    "description": "Voting period in blocks/seconds"
                  }
                }
              },
              "name": {
                "type": "string",
                "description": "Human-readable name for the owner entity"
              },
              "ens": {
                "type": "string",
                "description": "ENS name associated with this owner"
              },
              "metadata": {
                "type": "object",
                "description": "Additional owner metadata",
                "additionalProperties": true
              }
            },
            "required": ["address", "type"]
          },
          "description": "List of contract owners with multisig and governance support"
        },
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
        },
        "metaDataMaintainer": {
          "type": "string",
          "pattern": "^0x[a-fA-F0-9]{40}$",
          "description": "Address authorized to update metadata when ownership is released"
        },
        "authorizedAttesters": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          },
          "description": "List of addresses authorized to attest to metadata validity"
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
        "required": ["label"],
        "properties": {
          "label": {
            "type": "string",
            "description": "Subdomain label (e.g., 'app', 'api', 'docs')"
          },
          "node": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{64}$",
            "description": "ENS node hash for the subdomain"
          },
          "owner": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "Owner of the subdomain"
          },
          "controller": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "Controller authorized to manage the subdomain"
          },
          "resolver": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "Resolver contract for the subdomain"
          },
          "ttl": {
            "type": "integer",
            "minimum": 0,
            "description": "Time-to-live value for DNS caching"
          },
          "expiry": {
            "type": "string",
            "format": "date-time",
            "description": "Registration expiry timestamp"
          },
          "fuses": {
            "type": "object",
            "description": "ENS name wrapper fuses and permissions",
            "properties": {
              "operator": {
                "type": "string",
                "pattern": "^0x[a-fA-F0-9]{40}$",
                "description": "Approved operator for the name"
              },
              "approved": {
                "type": "array",
                "items": {
                  "type": "string",
                  "pattern": "^0x[a-fA-F0-9]{40}$"
                },
                "description": "List of approved addresses"
              },
              "burned": {
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "CANNOT_UNWRAP",
                    "CANNOT_BURN_FUSES",
                    "CANNOT_TRANSFER",
                    "CANNOT_SET_RESOLVER",
                    "CANNOT_SET_TTL",
                    "CANNOT_CREATE_SUBDOMAIN",
                    "CANNOT_APPROVE",
                    "PARENT_CANNOT_CONTROL",
                    "IS_DOT_ETH",
                    "CAN_EXTEND_EXPIRY"
                  ]
                },
                "description": "List of burned fuses"
              },
              "value": {
                "type": "integer",
                "description": "Raw fuse value as uint32"
              }
            }
          },
          "records": {
            "type": "object",
            "description": "Complete ENS record set for the subdomain",
            "properties": {
              "text": {
                "type": "object",
                "description": "Text records (key-value pairs)",
                "additionalProperties": {
                  "type": "string"
                }
              },
              "address": {
                "type": "object",
                "description": "Address records by coin type",
                "properties": {
                  "60": {
                    "type": "string",
                    "pattern": "^0x[a-fA-F0-9]{40}$",
                    "description": "Ethereum address (coin type 60)"
                  },
                  "0": {
                    "type": "string",
                    "pattern": "^0x[a-fA-F0-9]{40}$",
                    "description": "Bitcoin address (coin type 0)"
                  }
                },
                "additionalProperties": {
                  "type": "string",
                  "pattern": "^0x[a-fA-F0-9]{40}$"
                }
              },
              "contenthash": {
                "type": "string",
                "description": "IPFS/Swarm content hash",
                "pattern": "^0xe3[0-9a-fA-F]*$|^0xe4[0-9a-fA-F]*$|^0xe5[0-9a-fA-F]*$"
              },
              "multihash": {
                "type": "string",
                "description": "Multihash content identifier",
                "pattern": "^0x[0-9a-fA-F]*$"
              },
              "dns": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "rrname": { "type": "string" },
                    "rrtype": { "type": "string" },
                    "rrdata": { "type": "string" },
                    "rrclass": { "type": "string" }
                  }
                },
                "description": "DNS record set"
              },
              "interface": {
                "type": "object",
                "description": "Interface detection records",
                "additionalProperties": {
                  "type": "string",
                  "pattern": "^0x[a-fA-F0-9]{8}$"
                }
              },
              "typed": {
                "type": "object",
                "description": "Typed records with type information",
                "additionalProperties": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string" },
                    "value": { "type": "string" }
                  }
                }
              }
            }
          },
          "permissions": {
            "type": "object",
            "description": "Detailed permission and access control settings",
            "properties": {
              "canExtendExpiry": { "type": "boolean" },
              "canApprove": { "type": "boolean" },
              "canCreateSubdomain": { "type": "boolean" },
              "canSetResolver": { "type": "boolean" },
              "canSetTTL": { "type": "boolean" },
              "canTransfer": { "type": "boolean" },
              "canUnwrap": { "type": "boolean" },
              "canBurnFuses": { "type": "boolean" },
              "parentControl": { "type": "boolean" },
              "isDotEth": { "type": "boolean" }
            }
          },
          "wildcard": {
            "type": "object",
            "description": "Wildcard resolution settings",
            "properties": {
              "enabled": { "type": "boolean" },
              "resolver": {
                "type": "string",
                "pattern": "^0x[a-fA-F0-9]{40}$"
              },
              "fuses": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          },
          "metadata": {
            "type": "object",
            "description": "Subdomain-specific metadata",
            "properties": {
              "description": { "type": "string" },
              "purpose": { "type": "string" },
              "tags": {
                "type": "array",
                "items": { "type": "string" }
              },
              "version": { "type": "string" },
              "created": {
                "type": "string",
                "format": "date-time"
              },
              "updated": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        }
      }
    },
    "ensRecords": {
      "type": "object",
      "description": "Complete ENS record set for the main domain",
      "properties": {
        "text": {
          "type": "object",
          "description": "Text records (key-value pairs)",
          "additionalProperties": {
            "type": "string"
          }
        },
        "address": {
          "type": "object",
          "description": "Address records by coin type",
          "properties": {
            "60": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{40}$",
              "description": "Ethereum address (coin type 60)"
            },
            "0": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{40}$",
              "description": "Bitcoin address (coin type 0)"
            }
          },
          "additionalProperties": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          }
        },
        "contenthash": {
          "type": "string",
          "description": "IPFS/Swarm content hash",
          "pattern": "^0xe3[0-9a-fA-F]*$|^0xe4[0-9a-fA-F]*$|^0xe5[0-9a-fA-F]*$"
        },
        "multihash": {
          "type": "string",
          "description": "Multihash content identifier",
          "pattern": "^0x[0-9a-fA-F]*$"
        },
        "dns": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "rrname": { "type": "string" },
              "rrtype": { "type": "string" },
              "rrdata": { "type": "string" },
              "rrclass": { "type": "string" }
            }
          },
          "description": "DNS record set"
        },
        "interface": {
          "type": "object",
          "description": "Interface detection records",
          "additionalProperties": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{8}$"
          }
        },
        "typed": {
          "type": "object",
          "description": "Typed records with type information",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "value": { "type": "string" }
            }
          }
        }
      }
    },
    "ensPermissions": {
      "type": "object",
      "description": "ENS permissions and fuses for the main domain",
      "properties": {
        "fuses": {
          "type": "object",
          "description": "ENS name wrapper fuses and permissions",
          "properties": {
            "operator": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{40}$",
              "description": "Approved operator for the name"
            },
            "approved": {
              "type": "array",
              "items": {
                "type": "string",
                "pattern": "^0x[a-fA-F0-9]{40}$"
              },
              "description": "List of approved addresses"
            },
            "burned": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "CANNOT_UNWRAP",
                  "CANNOT_BURN_FUSES",
                  "CANNOT_TRANSFER",
                  "CANNOT_SET_RESOLVER",
                  "CANNOT_SET_TTL",
                  "CANNOT_CREATE_SUBDOMAIN",
                  "CANNOT_APPROVE",
                  "PARENT_CANNOT_CONTROL",
                  "IS_DOT_ETH",
                  "CAN_EXTEND_EXPIRY"
                ]
              },
              "description": "List of burned fuses"
            },
            "value": {
              "type": "integer",
              "description": "Raw fuse value as uint32"
            }
          }
        },
        "permissions": {
          "type": "object",
          "description": "Detailed permission settings",
          "properties": {
            "canExtendExpiry": { "type": "boolean" },
            "canApprove": { "type": "boolean" },
            "canCreateSubdomain": { "type": "boolean" },
            "canSetResolver": { "type": "boolean" },
            "canSetTTL": { "type": "boolean" },
            "canTransfer": { "type": "boolean" },
            "canUnwrap": { "type": "boolean" },
            "canBurnFuses": { "type": "boolean" },
            "parentControl": { "type": "boolean" },
            "isDotEth": { "type": "boolean" }
          }
        },
        "wildcard": {
          "type": "object",
          "description": "Wildcard resolution settings",
          "properties": {
            "enabled": { "type": "boolean" },
            "resolver": {
              "type": "string",
              "pattern": "^0x[a-fA-F0-9]{40}$"
            },
            "fuses": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        }
      }
    },
    "ensMetadata": {
      "type": "object",
      "description": "Domain-specific metadata and configuration",
      "properties": {
        "description": { "type": "string" },
        "purpose": {
          "type": "string",
          "enum": [
            "personal",
            "project",
            "organization",
            "protocol",
            "service",
            "dapp",
            "defi",
            "nft",
            "dao",
            "social",
            "developer",
            "infrastructure"
          ]
        },
        "category": {
          "type": "string",
          "enum": [
            "defi",
            "dao",
            "nft",
            "social",
            "gaming",
            "identity",
            "developer",
            "infrastructure",
            "wallet",
            "exchange",
            "lending",
            "dex",
            "bridge",
            "oracle",
            "analytics",
            "privacy",
            "security"
          ]
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "version": { "type": "string" },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "updated": {
          "type": "string",
          "format": "date-time"
        },
        "maintainers": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$"
          }
        },
        "documentation": {
          "type": "string",
          "format": "uri"
        },
        "repository": {
          "type": "string",
          "format": "uri"
        },
        "audit": {
          "type": "string",
          "format": "uri"
        }
      }
    }
  }
}
```

### Canonical ID Grammar

The `id` field MUST follow this grammar:

```
{org}.{protocol}.{category}.{role}[.{variant}].v{version}.{chainId}
```

#### Grammar Components

| Component  | Description                                           | Example                       | Required |
| ---------- | ----------------------------------------------------- | ----------------------------- | -------- |
| `org`      | Organization identifier (lowercase, hyphen-separated) | `uniswap`, `ens`              | Yes      |
| `protocol` | Protocol name (lowercase, hyphen-separated)           | `uniswap`, `ens`              | Yes      |
| `category` | Root category (must match registered categories)      | `defi`, `dao`, `nft`          | Yes      |
| `role`     | Contract role/function (lowercase, descriptive)       | `router`, `governor`, `token` | Yes      |
| `variant`  | Optional protocol variant identifier                  | `v3`, `alpha`, `beta`         | No       |
| `version`  | Semantic version format                               | `v1-0-0`, `v2-1-3`            | Yes      |
| `chainId`  | Target blockchain network ID                          | `1`, `137`, `42161`           | Yes      |

#### Version Format Rules

- **Major.Minor.Patch**: `v1-0-0`, `v2-1-3`
- **Pre-release**: `v1-0-0-alpha-1`, `v2-0-0-beta-2`
- **Build metadata**: `v1-0-0+build-123` (not part of canonical ID)

#### Real-World Examples

| Contract          | Canonical ID                                | Description                          |
| ----------------- | ------------------------------------------- | ------------------------------------ |
| Uniswap V3 Router | `uniswap.uniswap.defi.router.v3-1-0.1`      | AMM router on Ethereum mainnet       |
| ENS Governor      | `ens.ens.dao.governor.v1-0-0.1`             | ENS governance contract              |
| Maker CDP Manager | `maker.maker.defi.cdp.v2-1-0.1`             | Collateralized debt position manager |
| Polygon Bridge    | `polygon.polygon.l2.bridge.v1-0-0.137`      | Polygon PoS bridge on Polygon        |
| Arbitrum Gateway  | `arbitrum.arbitrum.l2.gateway.v1-0-0.42161` | Arbitrum cross-chain gateway         |

#### Validation Rules

1. **Uniqueness**: Each ID must be globally unique
2. **Immutability**: IDs cannot be changed after registration
3. **Semantic Consistency**: Components must accurately describe the contract
4. **Version Progression**: Version numbers must follow semantic versioning

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

**CCIP Assignment Process**

1. **Metadata Publication**: Metadata is published to decentralized storage (IPFS, Arweave, etc.)
2. **Hash Generation**: SHA-256 hash of canonical metadata is calculated
3. **CCIP Assignment**: Hash is assigned to ENS name via CCIP read capability
4. **Verification**: Consumers verify hash matches published metadata

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
        uint256 chainId;            // Source chain ID for cross-chain records
    }

    mapping(bytes32 => MetadataRecord) public records;
    mapping(address => bool) public authorizedAttesters;
    mapping(uint256 => bool) public supportedChains; // CCIP-supported chains

    event MetadataUpdated(
        bytes32 indexed metadataHash,
        string gateway,
        string path,
        uint256 chainId
    );
    event MetadataRevoked(bytes32 indexed metadataHash);
    event ChainSupportUpdated(uint256 indexed chainId, bool supported);
}
```

### CCIP Integration Details

#### CCIP Gateway Configuration

```typescript
interface CCIPGateway {
  // CCIP read capability for metadata retrieval
  function readMetadata(
    bytes32 metadataHash
  ) external view returns (string memory metadata);

  // Cross-chain metadata verification
  function verifyCrossChainMetadata(
    bytes32 metadataHash,
    uint256 sourceChainId,
    address attester
  ) external view returns (bool valid, string memory metadata);
}
```

#### Metadata Assignment via CCIP

```typescript
class CCIPMetadataManager {
  private ccipGateway: string;
  private metadataRegistry: string;

  /**
   * Assign metadata hash to ENS name via CCIP
   */
  async assignMetadata(
    ensName: string,
    metadata: ContractMetadata,
    chainId: number = 1
  ): Promise<string> {
    // 1. Calculate metadata hash
    const metadataHash = await calculateMetadataHash(metadata);

    // 2. Publish metadata to decentralized storage
    const gatewayUrl = await this.publishToIPFS(metadata);

    // 3. Create CCIP assignment transaction
    const tx = await this.metadataRegistry.assignMetadata(
      namehash(ensName),
      metadataHash,
      gatewayUrl,
      chainId,
      {
        gasLimit: 200000,
      }
    );

    await tx.wait();
    return metadataHash;
  }

  /**
   * Retrieve metadata via CCIP read
   */
  async retrieveMetadata(
    metadataHash: string,
    expectedChainId?: number
  ): Promise<ContractMetadata> {
    // 1. Query on-chain registry for gateway and path
    const record = await this.metadataRegistry.records(metadataHash);

    if (!record.active) {
      throw new Error('Metadata record is not active');
    }

    // 2. Use CCIP to read from gateway
    const metadata = await this.ccipGateway.readMetadata(record.gateway, record.path);

    // 3. Verify metadata hash matches
    const calculatedHash = await calculateMetadataHash(JSON.parse(metadata));
    if (calculatedHash !== metadataHash) {
      throw new Error('Metadata hash verification failed');
    }

    return JSON.parse(metadata);
  }

  /**
   * Cross-chain metadata assignment
   */
  async assignCrossChainMetadata(
    ensName: string,
    metadata: ContractMetadata,
    targetChainId: number,
    sourceChainId: number = 1
  ): Promise<string> {
    const metadataHash = await calculateMetadataHash(metadata);

    // Use CCIP to assign metadata on target chain
    const ccipMessage = {
      targetChainId,
      metadataHash,
      ensName: namehash(ensName),
      attester: await signer.getAddress(),
    };

    const tx = await this.ccipRouter.sendMessage(ccipMessage);
    await tx.wait();

    return metadataHash;
  }
}
```

#### CCIP Message Structure for Metadata

```solidity
// CCIP message for metadata assignment
struct MetadataAssignmentMessage {
    bytes32 metadataHash;       // Hash of metadata content
    bytes32 ensNode;           // ENS namehash of target domain
    string gateway;            // Gateway URL for metadata retrieval
    string path;               // Path to metadata file
    uint256 sourceChainId;     // Chain where metadata was created
    uint256 targetChainId;     // Chain where metadata should be stored
    address attester;          // Authorized attester address
    uint256 timestamp;         // Assignment timestamp
    bytes signature;           // Attester signature
}
```

### Cross-Chain Metadata Assignment

#### Multi-Chain Deployment

```typescript
interface CrossChainMetadataConfig {
  sourceChain: {
    registry: string; // Metadata registry contract
    ccipRouter: string; // CCIP router contract
    chainId: number;
  };
  targetChains: Array<{
    chainId: number;
    registry: string;
    ccipRouter: string;
    enabled: boolean;
  }>;
}
```

#### CCIP Assignment Workflow

The cross-chain assignment workflow begins with the source chain, where the system computes a canonical hash for the contract metadata. This metadata is then published to decentralized storage such as IPFS or Arweave. Once published, the corresponding hash is registered on the source chain's metadata registry smart contract. Following successful registration, a CCIP message is constructed to coordinate metadata assignment on the desired target chains.

Once the message is prepared, the CCIP router transmits this assignment across chains. Target chain registries receive and verify the metadata reference—checking its integrity and, upon successful verification, persisting the hash and reference data. This mechanism ensures that metadata is accessible and retrievable for consumers from any chain configured to support the standard.

Verification is an ongoing part of the process. The system must ensure that the attester possesses valid authorization to assign metadata. Additionally, the availability of the metadata at the referenced gateway must be confirmed, guaranteeing that published content is accessible. Throughout these processes, consistency checks are performed to validate that the metadata hash remains identical on all participating chains, preventing divergence or tampering.

#### Example: Cross-Chain Assignment

```typescript
// Assign metadata on Ethereum mainnet and Polygon
async function assignCrossChainMetadata(
  ensName: string,
  metadata: ContractMetadata
): Promise<void> {
  const mainnetHash = await ccipManager.assignMetadata(
    ensName,
    metadata,
    1 // Ethereum mainnet
  );

  const polygonHash = await ccipManager.assignCrossChainMetadata(
    ensName,
    metadata,
    137, // Polygon
    1 // Source: Ethereum
  );

  // Verify both assignments
  assert(mainnetHash === polygonHash);
  console.log(`Metadata assigned cross-chain: ${mainnetHash}`);
}
```

### CCIP Security Considerations

#### Authorization and Verification

- **Attester Verification**: Only authorized attesters can assign metadata via CCIP
- **Signature Validation**: CCIP messages must include valid attester signatures
- **Chain Verification**: Source and target chain IDs must be validated
- **Replay Protection**: Prevent duplicate assignments across chains

#### Gateway Security

- **Decentralized Storage**: Use IPFS, Arweave, or other decentralized gateways
- **Content Verification**: Verify metadata content matches stored hash
- **Availability Monitoring**: Ensure gateway accessibility across chains
- **Fallback Mechanisms**: Multiple gateway options for redundancy

### CCIP Implementation Examples

#### Solidity CCIP Receiver

```solidity
// CCIP receiver for metadata assignments
contract MetadataCCIPReceiver is CCIPReceiver {
    IMetadataRegistry public metadataRegistry;

    constructor(address router, address registry) CCIPReceiver(router) {
        metadataRegistry = IMetadataRegistry(registry);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        // Decode metadata assignment message
        MetadataAssignmentMessage memory assignment =
            abi.decode(message.data, (MetadataAssignmentMessage));

        // Verify attester authorization
        require(
            metadataRegistry.authorizedAttesters(assignment.attester),
            "Unauthorized attester"
        );

        // Verify signature
        require(
            verifyAssignmentSignature(assignment),
            "Invalid signature"
        );

        // Store metadata reference
        metadataRegistry.storeMetadataReference(
            assignment.metadataHash,
            assignment.gateway,
            assignment.path,
            assignment.sourceChainId,
            assignment.attester
        );

        emit MetadataAssignedCrossChain(
            assignment.metadataHash,
            assignment.ensNode,
            assignment.sourceChainId,
            assignment.targetChainId
        );
    }
}
```

#### TypeScript CCIP Integration

```typescript
import { ethers } from 'ethers';
import { CCIP } from '@chainlink/ccip-sdk';

class ENSMetadataCCIPManager {
  private ccip: CCIP;
  private metadataRegistry: ethers.Contract;

  constructor(ccipConfig: CCIPConfig, registryAddress: string) {
    this.ccip = new CCIP(ccipConfig);
    this.metadataRegistry = new ethers.Contract(registryAddress, METADATA_REGISTRY_ABI, signer);
  }

  /**
   * Assign metadata with CCIP cross-chain support
   */
  async assignMetadataWithCCIP(
    ensName: string,
    metadata: ContractMetadata,
    targetChains: number[] = []
  ): Promise<string> {
    const metadataHash = await calculateMetadataHash(metadata);

    // Publish to decentralized storage
    const { gateway, path } = await publishMetadata(metadata);

    // Create base assignment
    await this.metadataRegistry.assignMetadata(
      namehash(ensName),
      metadataHash,
      gateway,
      path,
      1 // Source chain
    );

    // Propagate to target chains via CCIP
    for (const chainId of targetChains) {
      await this.sendCrossChainAssignment(ensName, metadataHash, gateway, path, chainId);
    }

    return metadataHash;
  }

  private async sendCrossChainAssignment(
    ensName: string,
    metadataHash: string,
    gateway: string,
    path: string,
    targetChainId: number
  ): Promise<void> {
    const message = {
      targetChainId,
      metadataHash,
      ensNode: namehash(ensName),
      gateway,
      path,
      sourceChainId: 1,
      attester: await signer.getAddress(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Sign the message
    const signature = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'string', 'string', 'uint256', 'uint256', 'address', 'uint256'],
            Object.values(message)
          )
        )
      )
    );

    const ccipMessage = {
      ...message,
      signature,
    };

    await this.ccip.sendMessage(ccipMessage);
  }
}
```

### CCIP Assignment Best Practices

#### Metadata Preparation

- **Canonical Format**: Ensure metadata follows canonical JSON format
- **Hash Consistency**: Use deterministic hashing for cross-chain verification
- **Storage Redundancy**: Publish to multiple decentralized storage providers

#### Cross-Chain Considerations

- **Chain Selection**: Choose appropriate chains for metadata availability
- **Gas Optimization**: Minimize CCIP message size for cost efficiency
- **Verification Delays**: Account for CCIP finality times

#### Security Measures

- **Authorization Checks**: Implement strict attester authorization
- **Signature Verification**: Validate all CCIP message signatures
- **Replay Protection**: Prevent duplicate assignments across chains
- **Emergency Revocation**: Enable cross-chain metadata revocation

### Hierarchical Schema System

The standard supports a **5-level hierarchical schema system** that enables scalable organization and discovery of contract metadata through ENS domains.

#### Hierarchy Overview

```
Level 0: CNS Root (cns.eth)
  └── Level 1: Project (uniswap.cns.eth)
      └── Level 2: Category (uniswap.defi.cns.eth)
          └── Level 3: Subcategory (uniswap.defi.amm.cns.eth)
              └── Level 4: Contract (uniswap.defi.amm.router.cns.eth)
```

#### Level 0: CNS Root (`cns.eth`)

- **Domain**: `cns.eth`
- **Purpose**: Root domain for all ENS metadata
- **Function**: Registry of all projects and global metadata standards
- **Metadata**: Contains category definitions and global schema information

#### Level 1: Project (`{project}.cns.eth`)

- **Domain**: `{project}.cns.eth` (e.g., `uniswap.cns.eth`)
- **Purpose**: Project-specific root domain
- **Function**: Central hub for all contracts within a project
- **Metadata**: Project-wide information, maintainer contacts, documentation links

**Example Project Structure:**

```
uniswap.cns.eth/
├── _project-info.json    # Project metadata
├── _categories.json      # Available categories
├── defi.cns.eth/         # DeFi category subdomain
└── dao.cns.eth/          # DAO category subdomain
```

#### Level 2: Category (`{project}.{category}.cns.eth`)

- **Domain**: `{project}.{category}.cns.eth` (e.g., `uniswap.defi.cns.eth`)
- **Purpose**: Category-specific domain within a project
- **Function**: Groups contracts by functional category (DeFi, DAO, NFT, etc.)
- **Metadata**: Category-specific standards, common interfaces, validation rules

**Example Category Structure:**

```
uniswap.defi.cns.eth/
├── _category-info.json    # Category metadata
├── amm.cns.eth/          # AMM subcategory
├── lending.cns.eth/      # Lending subcategory
└── stablecoin.cns.eth/   # Stablecoin subcategory
```

#### Level 3: Subcategory (`{project}.{category}.{subcategory}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.cns.eth` (e.g., `uniswap.defi.amm.cns.eth`)
- **Purpose**: Subcategory-specific domain within a category
- **Function**: Further specialization within categories (AMM, Lending, etc.)
- **Metadata**: Subcategory-specific interfaces, common patterns, examples

#### Level 4: Contract (`{project}.{category}.{subcategory}.{contract}.cns.eth`)

- **Domain**: `{project}.{category}.{subcategory}.{contract}.cns.eth` (e.g., `uniswap.defi.amm.router.cns.eth`)
- **Purpose**: Individual contract domain
- **Function**: Direct link to specific contract metadata and interfaces
- **Metadata**: Complete contract metadata, ABI, deployment information

#### Hierarchy Benefits

- **Scalability**: Supports projects of any size and complexity
- **Discoverability**: Easy navigation from general to specific
- **Inheritance**: Child levels inherit parent configurations
- **Standards**: Consistent organization across the ecosystem

### ENS Records and Permissions

The standard supports comprehensive ENS record management and permission systems through dedicated fields:

#### ENS Records (`ensRecords`)

Complete record set for the main domain including all ENS record types:

- **Text Records**: Key-value pairs for arbitrary data storage
- **Address Records**: Cryptocurrency addresses by coin type (Ethereum, Bitcoin, etc.)
- **Content Hash**: IPFS/Swarm content identifiers for decentralized storage
- **Multihash**: Modern content addressing with hash algorithm identifiers
- **DNS Records**: Traditional DNS records for interoperability
- **Interface Detection**: ERC-165 interface support indicators
- **Interface Inheritance**: Detailed interface hierarchy and inheritance relationships
- **Contract Compatibility**: Verification of interface implementation and compatibility
- **Typed Records**: Structured records with type information

#### ENS Permissions (`ensPermissions`)

Detailed permission and fuse management for ENS name wrapper:

- **Fuses**: Granular permissions that can be burned to restrict operations
- **Permissions**: Boolean flags for various name operations
- **Wildcard Resolution**: Settings for wildcard subdomain resolution

#### Subdomain Records (`subdomains[].records`)

Each subdomain can have its own complete record set, enabling rich subdomain functionality.

### Common ENS Record Types

| Record Type   | Description               | Example                                                               |
| ------------- | ------------------------- | --------------------------------------------------------------------- |
| `text`        | Key-value text records    | `{"avatar": "ipfs://...", "email": "user@example.com"}`               |
| `address`     | Cryptocurrency addresses  | `{"60": "0x1234...", "0": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}`      |
| `contenthash` | IPFS/Swarm content        | `"0xe30101701220..."`                                                 |
| `multihash`   | Modern content addressing | `"0x..."`                                                             |
| `dns`         | DNS records               | `[{"rrname": "example.com", "rrtype": "A", "rrdata": "192.168.1.1"}]` |

### Interface Inheritance and Standards

#### Interface Definition Structure

Each interface in the metadata includes comprehensive inheritance information:

```typescript
interface ContractInterface {
  name: string; // Interface name (IERC20, IUniswapV3Router)
  id: string; // ERC-165 interface identifier (0x...)
  standard?: string; // Associated standard (ERC-20, etc.)
  version?: string; // Interface version
  inherited?: Array<{
    // Parent interfaces
    name: string;
    id: string;
    required: boolean;
  }>;
  implemented?: string[]; // Functions implemented
  optional?: string[]; // Optional functions
  events?: string[]; // Events defined
  errors?: string[]; // Custom errors
  documentation?: string; // Documentation URL
  specification?: string; // Formal specification URL
}
```

#### Interface Inheritance Hierarchy

**Example: ERC-20 Token Interface**

```json
{
  "standards": {
    "interfaces": [
      {
        "name": "IERC20",
        "id": "0x36372b07",
        "standard": "ERC-20",
        "version": "1.0.0",
        "inherited": [],
        "implemented": [
          "totalSupply()",
          "balanceOf(address)",
          "transfer(address,uint256)",
          "allowance(address,address)",
          "approve(address,uint256)",
          "transferFrom(address,address,uint256)"
        ],
        "events": ["Transfer(address,address,uint256)", "Approval(address,address,uint256)"],
        "documentation": "https://eips.ethereum.org/EIPS/eip-20",
        "specification": "https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md"
      }
    ]
  }
}
```

#### Complex Interface Inheritance

**Example: Uniswap V3 Router (Multiple Inheritance)**

```json
{
  "standards": {
    "interfaces": [
      {
        "name": "IUniswapV3Router",
        "id": "0xe343e6d8",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "inherited": [
          {
            "name": "IERC20",
            "id": "0x36372b07",
            "required": true
          },
          {
            "name": "IUniswapV3SwapCallback",
            "id": "0x...",
            "required": false
          }
        ],
        "implemented": [
          "exactInputSingle(ExactInputSingleParams)",
          "exactInput(ExactInputParams)",
          "exactOutputSingle(ExactOutputSingleParams)",
          "exactOutput(ExactOutputParams)",
          "uniswapV3SwapCallback(int256,int256,bytes)"
        ],
        "events": ["Swap(address,address,int256,int256,uint160,uint128,int24)"],
        "errors": ["InvalidSwap()", "InsufficientLiquidity()", "PriceSlippageCheckFailed()"],
        "documentation": "https://docs.uniswap.org/protocol/reference/core/interfaces/IUniswapV3Router",
        "specification": "https://uniswap.org/whitepaper-v3.pdf"
      }
    ]
  }
}
```

#### Interface Compatibility Verification

The standard enables automated interface compatibility checking:

```typescript
class InterfaceCompatibilityChecker {
  async verifyInterfaceImplementation(
    contractAddress: string,
    interfaces: ContractInterface[]
  ): Promise<CompatibilityResult> {
    const results: CompatibilityResult[] = [];

    for (const iface of interfaces) {
      // 1. Check ERC-165 support
      const supportsInterface = await this.checkERC165Support(contractAddress, iface.id);

      // 2. Verify function signatures
      const functionCompatibility = await this.verifyFunctionSignatures(
        contractAddress,
        iface.implemented || []
      );

      // 3. Check inheritance requirements
      const inheritanceValid = await this.verifyInheritance(contractAddress, iface.inherited || []);

      results.push({
        interface: iface.name,
        supported: supportsInterface && functionCompatibility && inheritanceValid,
        issues: this.collectIssues(supportsInterface, functionCompatibility, inheritanceValid),
      });
    }

    return this.aggregateResults(results);
  }
}
```

#### ERC Standards Compliance

**Standard Interface Definitions**:

| Standard | Interface | ID         | Version | Description                  |
| -------- | --------- | ---------- | ------- | ---------------------------- |
| ERC-20   | IERC20    | 0x36372b07 | 1.0.0   | Fungible token standard      |
| ERC-721  | IERC721   | 0x80ac58cd | 1.0.0   | Non-fungible token standard  |
| ERC-1155 | IERC1155  | 0xd9b67a26 | 1.0.0   | Multi-token standard         |
| ERC-165  | IERC165   | 0x01ffc9a7 | 1.0.0   | Interface detection standard |
| ERC-1967 | IERC1967  | 0x...      | 1.0.0   | Proxy storage slots          |
| ERC-2981 | IERC2981  | 0x...      | 1.0.0   | NFT royalty standard         |

**Interface Inheritance Examples**:

- **IERC721** inherits from **IERC165**
- **IUniswapV3Router** inherits from **IERC20** and **IUniswapV3SwapCallback**
- **IGovernor** inherits from **IERC165** and governance-specific interfaces

#### Interface Evolution and Versioning

**Version Management**:

```json
{
  "interfaces": [
    {
      "name": "IUniswapV3Router",
      "id": "0xe343e6d8",
      "version": "3.0.0",
      "supersededBy": "IUniswapV3RouterV2",
      "deprecated": false
    },
    {
      "name": "IUniswapV3RouterV2",
      "id": "0x...",
      "version": "3.1.0",
      "supersedes": "IUniswapV3Router",
      "deprecated": false
    }
  ]
}
```

### ENS Fuses and Permissions

| Fuse                      | Description                        | Effect                 |
| ------------------------- | ---------------------------------- | ---------------------- |
| `CANNOT_UNWRAP`           | Prevents unwrapping the name       | Permanent wrapper lock |
| `CANNOT_BURN_FUSES`       | Prevents burning additional fuses  | Freeze permission set  |
| `CANNOT_TRANSFER`         | Prevents name transfers            | Permanent ownership    |
| `CANNOT_SET_RESOLVER`     | Prevents resolver changes          | Fixed resolver         |
| `CANNOT_SET_TTL`          | Prevents TTL changes               | Fixed caching time     |
| `CANNOT_CREATE_SUBDOMAIN` | Prevents subdomain creation        | No subdomains allowed  |
| `CANNOT_APPROVE`          | Prevents address approvals         | No operator approvals  |
| `PARENT_CANNOT_CONTROL`   | Removes parent control             | Independent name       |
| `IS_DOT_ETH`              | Indicates .eth second-level domain | Special permissions    |
| `CAN_EXTEND_EXPIRY`       | Allows expiry extension            | Renewable registration |

## Ecosystem Integration

This section explains how the ENS Contract Metadata Standard integrates with the broader ENS ecosystem and related Ethereum infrastructure.

### Canonical ID System Integration

#### ENS Name Resolution Integration

The canonical ID system works seamlessly with ENS name resolution:

```
1. User queries: "uniswap.defi.cns.eth"
2. ENS resolver returns contract metadata
3. Canonical ID: "uniswap.uniswap.defi.router.v3-1-0.1"
4. Metadata retrieval via CCIP gateway
5. Contract verification and interaction
```

**ENS Text Record Storage**:

```typescript
// Store canonical ID in ENS text record
await ens.setText(
  namehash('uniswap.defi.cns.eth'),
  'contract.id',
  'uniswap.uniswap.defi.router.v3-1-0.1'
);

// Retrieve canonical ID from ENS
const canonicalId = await ens.text(namehash('uniswap.defi.cns.eth'), 'contract.id');
```

#### Cross-Chain ID Consistency

Canonical IDs maintain consistency across chains:

- **Ethereum**: `uniswap.uniswap.defi.router.v3-1-0.1`
- **Polygon**: `uniswap.uniswap.defi.router.v3-1-0.137`
- **Arbitrum**: `uniswap.uniswap.defi.router.v3-1-0.42161`

### Hierarchical Schema Integration

#### ENS Domain Structure Alignment

The 5-level hierarchy maps directly to ENS domain structure:

```
ENS Domain Structure          →  Metadata Hierarchy
cns.eth                       →  Level 0: CNS Root
├── uniswap.cns.eth           →  Level 1: Project
│   ├── defi.cns.eth          →  Level 2: Category
│   │   ├── amm.cns.eth       →  Level 3: Subcategory
│   │   │   └── router.cns.eth →  Level 4: Contract
```

#### ENS Subdomain Management

Each level corresponds to ENS subdomain ownership:

```solidity
// Level 1: Project domain
uniswap.cns.eth → owned by Uniswap governance

// Level 2: Category subdomain
uniswap.defi.cns.eth → controlled by project maintainers

// Level 3: Subcategory subdomain
uniswap.defi.amm.cns.eth → managed by protocol team

// Level 4: Contract subdomain
uniswap.defi.amm.router.cns.eth → points to specific contract
```

### Metadata Storage and Retrieval

#### ENS Resolver Integration

Metadata storage leverages ENS resolver capabilities:

```typescript
interface ENSMetadataResolver {
  // Standard ENS resolver functions
  addr(node: bytes32): Promise<string>;
  text(node: bytes32, key: string): Promise<string>;

  // Extended metadata functions
  contractMetadata(node: bytes32): Promise<string>;
  contractInterfaces(node: bytes32): Promise<string[]>;
  contractSecurity(node: bytes32): Promise<SecurityInfo>;
}
```

#### Decentralized Storage Integration

**IPFS Integration**:

```typescript
// Publish metadata to IPFS
const { cid } = await ipfs.add(JSON.stringify(metadata));

// Store CID in ENS text record
await ens.setText(namehash('uniswap.defi.cns.eth'), 'contract.metadata', `ipfs://${cid}`);
```

**Arweave Integration**:

```typescript
// Publish to Arweave for permanent storage
const transaction = await arweave.createTransaction({
  data: JSON.stringify(metadata),
});

// Store Arweave transaction ID in ENS
await ens.setText(namehash('uniswap.defi.cns.eth'), 'contract.metadata', `ar://${transaction.id}`);
```

### Security Framework Integration

#### ENS Name Wrapper Integration

The security attestation system integrates with ENS Name Wrapper fuses:

```solidity
// Set fuses for metadata immutability
nameWrapper.setFuses(
  node,
  CANNOT_SET_RESOLVER | CANNOT_SET_TTL | CANNOT_CREATE_SUBDOMAIN
);

// Verify fuses in metadata
function verifyFuses(bytes32 node, ContractMetadata memory metadata) {
  uint32 fuses = nameWrapper.getFuses(node);

  // Ensure required fuses are burned for security
  require(
    fuses & CANNOT_SET_RESOLVER != 0,
    "Resolver changes must be disabled for security"
  );
}
```

#### Attestation Verification Flow

```typescript
async function verifyENSAttestation(ensName: string, metadata: ContractMetadata): Promise<boolean> {
  // 1. Verify ENS name ownership
  const owner = await ens.owner(namehash(ensName));
  if (owner !== metadata.security.attestation.attester) {
    throw new Error('Attester does not own ENS name');
  }

  // 2. Verify name wrapper fuses
  const fuses = await nameWrapper.getFuses(namehash(ensName));
  const requiredFuses = metadata.security.permissions;

  // 3. Verify attestation signature
  const validSignature = await verifySignature(metadata, metadata.security.attestation);

  return validSignature && this.verifyFuses(fuses, requiredFuses);
}
```

### CCIP Cross-Chain Integration

#### Cross-Chain ENS Resolution

CCIP enables consistent metadata across chains:

```solidity
// CCIP receiver for cross-chain metadata
contract CrossChainMetadataReceiver is CCIPReceiver {
  IENS public ens;

  function _ccipReceive(Client.Any2EVMMessage memory message)
      internal override
  {
    CrossChainMetadata memory metadata = abi.decode(message.data);

    // Verify source chain authorization
    require(
      authorizedChains[metadata.sourceChainId],
      "Unauthorized source chain"
    );

    // Update ENS record with cross-chain metadata
    bytes32 node = namehash(metadata.ensName);
    ens.setText(node, "contract.metadata", metadata.content);

    emit CrossChainMetadataUpdated(
      metadata.ensName,
      metadata.sourceChainId,
      metadata.targetChainId
    );
  }
}
```

#### Multi-Chain Metadata Consistency

**Ethereum Mainnet**:

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "addresses": [{ "chainId": 1, "address": "0x..." }],
  "ensRoot": "uniswap.defi.cns.eth"
}
```

**Polygon Deployment**:

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.137",
  "addresses": [{ "chainId": 137, "address": "0x..." }],
  "ensRoot": "uniswap.defi.cns.eth"
}
```

### Validation Framework Integration

#### ENS Tooling Integration

The validation framework integrates with existing ENS tooling:

```typescript
interface ENSValidator {
  // Standard ENS validation
  validateName(name: string): Promise<boolean>;
  validateResolver(node: bytes32): Promise<boolean>;

  // Extended metadata validation
  validateContractMetadata(metadata: ContractMetadata): Promise<ValidationResult>;
  validateCrossChainConsistency(metadata: ContractMetadata[]): Promise<boolean>;
  validateENSIntegration(ensName: string, metadata: ContractMetadata): Promise<boolean>;
}
```

#### Automated Validation Pipeline

```typescript
class ENSMetadataValidator {
  async validateCompleteIntegration(
    ensName: string,
    metadata: ContractMetadata,
    chainId: number
  ): Promise<ValidationResult> {
    const results: ValidationResult[] = [];

    // 1. ENS name validation
    results.push(await this.validateENSName(ensName));

    // 2. Metadata schema validation
    results.push(await this.validateMetadataSchema(metadata));

    // 3. ENS record consistency
    results.push(await this.validateENSRecords(ensName, metadata));

    // 4. Cross-chain consistency (if applicable)
    if (metadata.addresses.length > 1) {
      results.push(await this.validateCrossChainConsistency(metadata));
    }

    // 5. Security validation
    results.push(await this.validateSecurity(metadata));

    return this.aggregateResults(results);
  }

  private async validateENSRecords(
    ensName: string,
    metadata: ContractMetadata
  ): Promise<ValidationResult> {
    // Verify ENS text records match metadata
    const storedMetadata = await ens.text(namehash(ensName), 'contract.metadata');

    if (storedMetadata) {
      const stored = JSON.parse(storedMetadata);
      const hashMatch =
        (await calculateMetadataHash(stored)) === (await calculateMetadataHash(metadata));

      if (!hashMatch) {
        return { valid: false, errors: ['ENS record hash mismatch'] };
      }
    }

    return { valid: true, errors: [] };
  }
}
```

### Reference Implementation Ecosystem

#### Integration with ENS Libraries

The reference implementation works with popular ENS libraries:

```typescript
// ethers.js integration
import { ethers } from 'ethers';
import { ENSMetadataManager } from './ens-metadata';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const ensManager = new ENSMetadataManager(provider);

// Ethers ENS integration
const resolver = await provider.getResolver('uniswap.defi.cns.eth');
const metadata = await ensManager.resolveContractMetadata('uniswap.defi.cns.eth');
```

#### ENS Registry Integration

**Registry Contract Integration**:

```solidity
interface IENSRegistry {
  function setText(bytes32 node, string calldata key, string calldata value) external;
  function text(bytes32 node, string calldata key) external view returns (string memory);
}

// Store metadata reference in ENS registry
ensRegistry.setText(
  namehash("uniswap.defi.cns.eth"),
  "contract.metadata.hash",
  metadataHash
);
```

#### ENS Resolver Integration

**Custom Resolver Implementation**:

```solidity
contract ENSMetadataResolver is ENSResolver {
  function contractMetadata(bytes32 node)
      external view returns (string memory)
  {
    // Retrieve metadata hash from text record
    string memory hash = ensRegistry.text(node, "contract.metadata.hash");

    // Fetch metadata from CCIP gateway
    return ccipGateway.readMetadata(bytes32(hash));
  }

  function supportsInterface(bytes4 interfaceID)
      public pure override returns (bool)
  {
    return interfaceID == type(IContractMetadataResolver).interfaceId ||
           super.supportsInterface(interfaceID);
  }
}
```

### Ecosystem Benefits

#### Developer Experience

**Unified Discovery**:

- Single source of truth for contract metadata
- Consistent interface across all ENS-integrated protocols
- Reduced integration complexity for dApps

**Cross-Chain Compatibility**:

- Seamless multi-chain contract interaction
- Consistent metadata across Layer 1 and Layer 2 networks
- Unified governance across chains

**Security Assurance**:

- Cryptographically verified metadata integrity
- Decentralized attestation system
- Immutable security commitments via ENS fuses

#### Protocol Integration

**DeFi Protocols**:

- Standardized liquidity pool metadata
- Cross-chain bridge configuration
- Governance proposal transparency

**NFT Platforms**:

- Royalty and creator information
- Collection metadata standardization
- Cross-platform compatibility

**DAO Tools**:

- Governance contract transparency
- Proposal metadata standardization
- Cross-DAO interoperability

### Future Ecosystem Evolution

#### ENS V2 Integration

The standard is designed to evolve with ENS improvements:

**Name Wrapper V2**:

- Enhanced fuse granularity
- Advanced permission systems
- Improved wildcard resolution

**ENS L2 Scaling**:

- Optimistic rollup metadata
- Zero-knowledge proof verification
- Cross-domain metadata consistency

**Advanced Record Types**:

- Structured data records
- Executable content references
- Dynamic metadata updates

This ecosystem integration ensures the ENS Contract Metadata Standard provides immediate value while remaining adaptable to future ENS ecosystem developments.

## Implementation Guide

This section provides practical guidance for implementing the ENS Contract Metadata Standard in your project.

### Step 1: Project Setup

1. **Choose your project identifier**: Select a clear, lowercase identifier for your organization (e.g., `uniswap`, `aave`, `compound`)

2. **Set up ENS domains**: Register your project domain under `cns.eth` (e.g., `yourproject.cns.eth`)

3. **Create project structure**:
   ```bash
   yourproject.cns.eth/
   ├── defi.cns.eth/           # Category subdomain
   │   └── contracts/          # Contract subdomains
   └── _project-info.json      # Project metadata
   ```

### Step 2: Contract Metadata Creation

#### Basic Contract Metadata

```typescript
import { createHash } from 'crypto';

interface ContractMetadata {
  id: string;
  org: string;
  protocol: string;
  category: string;
  role: string;
  version: string;
  chainId: number;
  addresses: Array<{
    chainId: number;
    address: string;
    deployedBlock?: number;
    bytecodeHash?: string;
  }>;
  metadataHash: string;
  ensRoot: string;
  standards?: {
    ercs?: string[];
    interfaces?: string[];
  };
  security?: {
    attestation: {
      reference: string;
      schema: string;
      attester: string;
      timestamp: string;
    };
  };
}

// Example: Uniswap V3 Router
const routerMetadata: ContractMetadata = {
  id: 'uniswap.uniswap.defi.router.v3-1-0.1',
  org: 'uniswap',
  protocol: 'uniswap',
  category: 'defi',
  role: 'router',
  version: 'v3-1-0',
  chainId: 1,
  addresses: [
    {
      chainId: 1,
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      deployedBlock: 12345678,
      bytecodeHash: '0x...',
    },
  ],
  metadataHash: await calculateMetadataHash(routerMetadata),
  ensRoot: 'uniswap.defi.cns.eth',
  standards: {
    ercs: ['erc20'],
    interfaces: [
      {
        name: 'IUniswapV3Router',
        id: '0xe343e6d8',
        standard: 'Uniswap-V3',
        version: '3.0.0',
        inherited: [
          {
            name: 'IERC20',
            id: '0x36372b07',
            required: true,
          },
        ],
        implemented: [
          'exactInputSingle(ExactInputSingleParams)',
          'exactInput(ExactInputParams)',
          'exactOutputSingle(ExactOutputSingleParams)',
          'exactOutput(ExactOutputParams)',
        ],
        events: ['Swap(address,address,int256,int256,uint160,uint128,int24)'],
        documentation:
          'https://docs.uniswap.org/protocol/reference/core/interfaces/IUniswapV3Router',
      },
    ],
  },
  security: {
    attestation: {
      reference: '0x...',
      schema: 'https://schemas.ens.domains/contract-metadata-attestation/v1.0.0',
      attester: '0x...',
      timestamp: new Date().toISOString(),
    },
  },
};
```

#### Metadata Hash Calculation

```typescript
async function calculateMetadataHash(metadata: ContractMetadata): Promise<string> {
  // Remove metadataHash field for calculation
  const { metadataHash, ...content } = metadata;

  // Sort keys alphabetically for deterministic hashing
  const sortedContent = sortObjectKeys(content);

  // Create canonical JSON
  const canonicalJson = JSON.stringify(sortedContent, null, 0);

  // Calculate SHA-256 hash
  const hash = createHash('sha256');
  hash.update(canonicalJson);
  const digest = hash.digest();

  return `0x${digest.toString('hex')}`;
}

function sortObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key]);
    });

  return sorted;
}
```

### Step 3: ENS Domain Setup

#### Register Project Domain

```typescript
import { ethers } from 'ethers';

// ENS Registrar contract ABI (simplified)
const registrarABI = ['function register(bytes32 label, address owner, uint duration) external'];

async function registerProjectDomain(projectName: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const registrar = new ethers.Contract(
    '0x1234...', // ENS Registrar address
    registrarABI,
    signer
  );

  const label = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(projectName));
  const duration = 31536000; // 1 year in seconds

  await registrar.register(label, await signer.getAddress(), duration);
}
```

#### Set Up Subdomains

```typescript
// Set up category subdomain
await ens.setSubnodeRecord(
  'defi',
  routerMetadata.addresses[0].address,
  '0x...', // Resolver address
  3600 // TTL
);
```

### Step 4: Validation and Publishing

#### Pre-Publication Checklist

- [ ] All required fields are present
- [ ] ID follows canonical grammar
- [ ] Addresses are valid and deployed on specified networks
- [ ] Metadata hash is correctly calculated
- [ ] ENS domains are properly configured
- [ ] Security attestation is included and valid
- [ ] Schema validation passes

#### Automated Validation

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(metadataSchema);

function validateMetadata(metadata: ContractMetadata): boolean {
  const valid = validate(metadata);
  if (!valid) {
    console.error('Validation errors:', validate.errors);
    return false;
  }

  // Additional custom validations
  return (
    validateIdFormat(metadata.id) &&
    validateAddresses(metadata.addresses) &&
    (await validateAttestation(metadata.security?.attestation))
  );
}

export { validateMetadata };
```

### Step 5: Integration with Build Systems

#### Hardhat Integration

```typescript
// hardhat.config.ts
import { task } from 'hardhat/config';
import { generateMetadata } from './scripts/generateMetadata';

task('deploy', 'Deploy contract and generate metadata')
  .addParam('contract', 'Contract name')
  .setAction(async (args, hre) => {
    // Deploy contract
    const contract = await hre.ethers.getContractFactory(args.contract);
    const deployed = await contract.deploy();

    // Generate metadata
    const metadata = await generateMetadata({
      contractName: args.contract,
      deployedAddress: deployed.address,
      networkId: hre.network.config.chainId,
    });

    // Save metadata file
    await saveMetadataFile(metadata);

    console.log(`Metadata generated: ${metadata.id}`);
  });
```

## Examples

This section provides concrete examples of contract metadata for different types of contracts and scenarios.

### Example 1: DeFi Protocol - Uniswap V3

**Contract**: Uniswap V3 Router on Ethereum Mainnet

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "router",
  "version": "v3-1-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "deployedBlock": 12345678,
      "bytecodeHash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
    },
    {
      "chainId": 137,
      "address": "0x...",
      "deployedBlock": 25000000
    }
  ],
  "metadataHash": "0xf4e3d2c1b0a987654321fedcba987654321fedcba987654321fedcba9876543210",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "ercs": ["erc20", "erc721"],
    "interfaces": [
      {
        "name": "IUniswapV3Router",
        "id": "0xe343e6d8",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "inherited": [
          {
            "name": "IERC20",
            "id": "0x36372b07",
            "required": true
          }
        ],
        "implemented": [
          "exactInputSingle(ExactInputSingleParams)",
          "exactInput(ExactInputParams)",
          "exactOutputSingle(ExactOutputSingleParams)",
          "exactOutput(ExactOutputParams)"
        ],
        "events": ["Swap(address,address,int256,int256,uint160,uint128,int24)"],
        "documentation": "https://docs.uniswap.org/protocol/reference/core/interfaces/IUniswapV3Router"
      },
      {
        "name": "IUniswapV3Factory",
        "id": "0x...",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "implemented": ["createPool(address,address,uint24)", "getPool(address,address,uint24)"],
        "events": ["PoolCreated(address,address,uint24,uint160,address)"]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "artifacts": {
    "abiHash": "0x...",
    "sourceUri": "https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Factory.sol",
    "license": "GPL-2.0"
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "report": "https://github.com/Uniswap/v3-core/blob/main/audits/TrailOfBits.pdf",
        "date": "2021-05-03",
        "scope": "Full protocol audit"
      }
    ],
    "owners": ["0x1a9C8182C09F50C8318d769245beA52c32BE35BC"],
    "upgradeability": "immutable",
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "timestamp": "2023-06-15T10:30:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "immutable"
  },
  "tags": ["dex", "amm", "v3", "concentrated-liquidity"]
}
```

### Example 2: DAO Governance - ENS DAO

**Contract**: ENS Governance Contract on Ethereum Mainnet

```json
{
  "id": "ens.ens.dao.governor.v1-0-0.1",
  "org": "ens",
  "protocol": "ens",
  "category": "dao",
  "role": "governor",
  "version": "v1-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
      "deployedBlock": 12345678,
      "implementation": null,
      "implementationSlot": null
    }
  ],
  "metadataHash": "0xe5f67890123456789012345678901234567890123456789012345678901234567890",
  "ensRoot": "ens.dao.cns.eth",
  "standards": {
    "ercs": ["erc20"],
    "interfaces": [
      {
        "name": "IGovernorBravo",
        "id": "0x...",
        "standard": "Compound-Governance",
        "version": "1.0.0",
        "inherited": [
          {
            "name": "IERC165",
            "id": "0x01ffc9a7",
            "required": true
          }
        ],
        "implemented": [
          "propose(address[],uint256[],string[],bytes[],string)",
          "queue(uint256)",
          "execute(uint256)",
          "cancel(uint256)"
        ],
        "events": [
          "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)",
          "ProposalQueued(uint256,uint256)",
          "ProposalExecuted(uint256)"
        ]
      },
      {
        "name": "ITimelock",
        "id": "0x...",
        "standard": "Compound-Governance",
        "version": "1.0.0",
        "implemented": [
          "delay()",
          "GRACE_PERIOD()",
          "acceptAdmin()",
          "setDelay(uint256)",
          "setPendingAdmin(address)"
        ]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "lifecycle": {
    "status": "active",
    "since": "2021-05-04T00:00:00Z"
  },
  "security": {
    "audits": [
      {
        "firm": "Certik",
        "report": "https://github.com/ensdomains/governance/blob/main/audits/certik-2021.pdf",
        "date": "2021-04-15",
        "scope": "Governance system audit"
      }
    ],
    "owners": ["0x323A76393544d5ecca80cd6ef2A560C6a395b7E3"],
    "upgradeability": "upgradable",
    "permissions": ["propose", "vote", "execute", "cancel"],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
      "timestamp": "2023-06-15T11:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x...",
    "proxyAdmin": "0x...",
    "proxyVersion": "v1.0.0"
  },
  "subdomains": [
    {
      "label": "proposals",
      "owner": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
      "records": {
        "text": {
          "avatar": "https://ens.domains/favicon.ico"
        }
      }
    }
  ]
}
```

### Example 3: NFT Marketplace - OpenSea

**Contract**: OpenSea Seaport on Ethereum Mainnet

```json
{
  "id": "opensea.opensea.nft.marketplace.v1-5-0.1",
  "org": "opensea",
  "protocol": "opensea",
  "category": "nft",
  "role": "marketplace",
  "version": "v1-5-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x00000000006c3852cbEf3e08E8dF289169EdE581",
      "deployedBlock": 14695946,
      "bytecodeHash": "0x..."
    }
  ],
  "metadataHash": "0xd4c3b2a1f0e987654321fedcba987654321fedcba987654321fedcba9876543210",
  "ensRoot": "opensea.nft.cns.eth",
  "standards": {
    "ercs": ["erc20", "erc721", "erc1155"],
    "interfaces": [
      {
        "name": "ISeaport",
        "id": "0x...",
        "standard": "Seaport",
        "version": "1.5.0",
        "implemented": [
          "fulfillOrder(Fulfillment,uint256,uint256)",
          "fulfillAdvancedOrder(AdvancedOrder,uint256[],Fulfillment[],address)",
          "fulfillBasicOrder(BasicOrderParameters)",
          "cancel(Cancel[])",
          "validate(Cancel[])"
        ],
        "events": [
          "OrderFulfilled(bytes32,uint256,address,address)",
          "OrderCancelled(bytes32,address)"
        ],
        "errors": ["InvalidOrder()", "OrderAlreadyFilled()", "InsufficientNativeTokensSupplied()"]
      },
      {
        "name": "IZone",
        "id": "0x...",
        "standard": "Seaport",
        "version": "1.5.0",
        "implemented": ["validateOrder(ZoneParameters)", "getSeaportMetadata()"]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "security": {
    "audits": [
      {
        "firm": "OpenZeppelin",
        "report": "https://blog.opensea.io/seaport-audit/",
        "date": "2022-05-20",
        "scope": "Seaport protocol audit"
      },
      {
        "firm": "Trail of Bits",
        "report": "https://github.com/ProjectOpenSea/seaport/blob/main/audits/trail-of-bits-2022.pdf",
        "date": "2022-06-01",
        "scope": "Security review"
      }
    ],
    "owners": ["0x0000000000000000000000000000000000000000"],
    "upgradeability": "upgradable",
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x0000000000000000000000000000000000000000",
      "timestamp": "2023-06-15T12:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "uups",
    "implementationAddress": "0x...",
    "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    "proxyVersion": "v1.5.0"
  },
  "tags": ["nft", "marketplace", "seaport", "orders"]
}
```

### Example 4: Layer 2 Bridge - Polygon

**Contract**: Polygon PoS Bridge on Polygon Mainnet

```json
{
  "id": "polygon.polygon.l2.bridge.v1-0-0.137",
  "org": "polygon",
  "protocol": "polygon",
  "category": "l2",
  "role": "bridge",
  "version": "v1-0-0",
  "chainId": 137,
  "addresses": [
    {
      "chainId": 137,
      "address": "0x...",
      "deployedBlock": 10000000,
      "bytecodeHash": "0x..."
    }
  ],
  "metadataHash": "0xc3b2a1f0e987654321fedcba987654321fedcba987654321fedcba9876543210",
  "ensRoot": "polygon.l2.cns.eth",
  "standards": {
    "interfaces": [
      {
        "name": "IPolygonBridge",
        "id": "0x...",
        "standard": "Polygon-PoS",
        "version": "1.0.0",
        "implemented": [
          "depositEtherFor(address)",
          "depositFor(address,address,uint256,bytes)",
          "withdraw(uint256)",
          "exit(bytes)"
        ],
        "events": ["Deposit(address,address,uint256)", "Withdraw(address,address,uint256)"]
      },
      {
        "name": "ICheckpointManager",
        "id": "0x...",
        "standard": "Polygon-PoS",
        "version": "1.0.0",
        "implemented": ["checkpoint(uint256,uint256,uint256,bytes32)", "getLastChildBlock()"]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "security": {
    "audits": [
      {
        "firm": "Certik",
        "report": "https://polygon.technology/audits/",
        "date": "2021-08-15",
        "scope": "Bridge security audit"
      }
    ],
    "owners": ["0xFa7D2a996aC6350f4b56C043112Da0366CD4f65d"],
    "upgradeability": "upgradable",
    "permissions": ["deposit", "withdraw", "emergency_pause"],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0xFa7D2a996aC6350f4b56C043112Da0366CD4f65d",
      "timestamp": "2023-06-15T13:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x...",
    "proxyAdmin": "0x...",
    "proxyVersion": "v1.0.0"
  },
  "tags": ["bridge", "pos", "cross-chain", "l2"]
}
```

### Example 4: Multisig-Owned DeFi Protocol - Uniswap

**Contract**: Uniswap V3 Factory (Multisig-Owned)

```json
{
  "id": "uniswap.uniswap.defi.factory.v3-0-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "factory",
  "version": "v3-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      "deployedBlock": 12345678
    }
  ],
  "metadataHash": "0x...",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "interfaces": [
      {
        "name": "IUniswapV3Factory",
        "id": "0x...",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "implemented": ["createPool(address,address,uint24)", "getPool(address,address,uint24)"],
        "events": ["PoolCreated(address,address,uint24,uint160,address)"]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "report": "https://github.com/Uniswap/v3-core/blob/main/audits/TrailOfBits.pdf",
        "date": "2021-05-03",
        "scope": "Factory contract audit"
      }
    ],
    "owners": [
      {
        "address": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
        "type": "multisig",
        "name": "Uniswap Governance Multisig",
        "ens": "uniswap.eth",
        "multisig": {
          "type": "gnosis-safe",
          "version": "1.3.0",
          "threshold": 3,
          "signers": [
            {
              "address": "0x1234567890123456789012345678901234567890",
              "role": "owner"
            },
            {
              "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
              "role": "owner"
            },
            {
              "address": "0x1111111111111111111111111111111111111111",
              "role": "owner"
            },
            {
              "address": "0x2222222222222222222222222222222222222222",
              "role": "owner"
            },
            {
              "address": "0x3333333333333333333333333333333333333333",
              "role": "owner"
            }
          ],
          "modules": [
            {
              "address": "0x...",
              "type": "spending-limit",
              "enabled": true
            }
          ],
          "fallbackHandler": "0x...",
          "guard": "0x..."
        }
      }
    ],
    "upgradeability": "immutable",
    "permissions": ["create-pool"],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "immutable"
  },
  "tags": ["dex", "factory", "v3", "automated-market-maker"]
}
```

### Example 5: DAO-Owned Protocol - ENS DAO

**Contract**: ENS Token (DAO-Owned)

```json
{
  "id": "ens.ens.token.token.v1-0-0.1",
  "org": "ens",
  "protocol": "ens",
  "category": "dao",
  "role": "token",
  "version": "v1-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
      "deployedBlock": 12345678
    }
  ],
  "metadataHash": "0x...",
  "ensRoot": "ens.dao.cns.eth",
  "standards": {
    "ercs": ["erc20"],
    "interfaces": [
      {
        "name": "IERC20",
        "id": "0x36372b07",
        "standard": "ERC-20",
        "version": "1.0.0",
        "implemented": [
          "totalSupply()",
          "balanceOf(address)",
          "transfer(address,uint256)",
          "allowance(address,address)",
          "approve(address,uint256)",
          "transferFrom(address,address,uint256)"
        ],
        "events": ["Transfer(address,address,uint256)", "Approval(address,address,uint256)"],
        "documentation": "https://eips.ethereum.org/EIPS/eip-20"
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "security": {
    "audits": [
      {
        "firm": "Quantstamp",
        "report": "https://github.com/ensdomains/ens-contracts/blob/main/audits/quantstamp-2019.pdf",
        "date": "2019-05-15",
        "scope": "ENS token audit"
      }
    ],
    "owners": [
      {
        "address": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
        "type": "dao",
        "name": "ENS DAO Governor",
        "ens": "dao.ens.eth",
        "dao": {
          "type": "governor",
          "token": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
          "quorum": "4%", // 4% of total token supply
          "timelock": 172800, // 2 days in seconds
          "votingPeriod": 50400 // 1 week in seconds
        }
      }
    ],
    "upgradeability": "upgradable",
    "permissions": ["mint", "burn", "pause"],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x...",
    "proxyAdmin": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
    "proxyVersion": "v1.0.0"
  },
  "tags": ["dao", "governance", "token", "ens"]
}
```

## Multisig and Governance Support

The ENS Contract Metadata Standard provides comprehensive support for multisig wallets and governance systems, which are commonly used for contract ownership and administration in DeFi protocols and DAOs.

### Owner Entity Types

The standard supports several owner entity types:

| Type              | Description                           | Use Case                                       |
| ----------------- | ------------------------------------- | ---------------------------------------------- |
| `eoa`             | Externally Owned Account              | Simple wallet ownership                        |
| `multisig`        | Multi-signature wallet                | Shared ownership requiring multiple signatures |
| `dao`             | Decentralized Autonomous Organization | Community governance                           |
| `contract`        | Smart contract owner                  | Automated ownership                            |
| `gnosis-safe`     | Gnosis Safe multisig                  | Industry standard multisig                     |
| `multisig-wallet` | Generic multisig wallet               | Custom multisig implementations                |

### Multisig Configuration

#### Basic Multisig Structure

```json
{
  "security": {
    "owners": [
      {
        "address": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
        "type": "multisig",
        "name": "Project Multisig",
        "multisig": {
          "type": "gnosis-safe",
          "version": "1.3.0",
          "threshold": 3,
          "signers": [
            {
              "address": "0x123...",
              "role": "owner"
            }
          ]
        }
      }
    ]
  }
}
```

#### Gnosis Safe Configuration

```typescript
interface GnosisSafeConfig {
  type: 'gnosis-safe';
  version: string;
  threshold: number;
  signers: Array<{
    address: string;
    weight?: number; // For weighted multisigs
    role: 'signer' | 'owner' | 'admin';
  }>;
  modules: Array<{
    address: string;
    type: 'recovery' | 'social' | 'whitelist' | 'spending-limit' | 'custom';
    enabled: boolean;
  }>;
  fallbackHandler?: string;
  guard?: string;
}
```

#### DAO Governance Configuration

```typescript
interface DAOConfig {
  type: 'governor' | 'compound' | 'aragon' | 'dao-stack' | 'custom';
  token?: string; // Governance token address
  quorum?: string; // Quorum requirement
  timelock?: number; // Delay in seconds
  votingPeriod?: number; // Voting period in blocks/seconds
}
```

### Common Multisig Patterns

#### 1. Simple Multisig Ownership

```json
{
  "security": {
    "owners": [
      {
        "address": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
        "type": "multisig",
        "name": "3-of-5 Multisig",
        "multisig": {
          "type": "gnosis-safe",
          "threshold": 3,
          "signers": [
            { "address": "0x111...", "role": "owner" },
            { "address": "0x222...", "role": "owner" },
            { "address": "0x333...", "role": "owner" },
            { "address": "0x444...", "role": "owner" },
            { "address": "0x555...", "role": "owner" }
          ]
        }
      }
    ]
  }
}
```

#### 2. DAO with Timelock

```json
{
  "security": {
    "owners": [
      {
        "address": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
        "type": "dao",
        "name": "ENS DAO",
        "dao": {
          "type": "governor",
          "token": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
          "quorum": "4%",
          "timelock": 172800,
          "votingPeriod": 50400
        }
      }
    ]
  }
}
```

#### 3. Nested Ownership (Contract → Multisig → DAO)

```json
{
  "security": {
    "owners": [
      {
        "address": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
        "type": "multisig",
        "name": "Emergency Multisig",
        "multisig": {
          "type": "gnosis-safe",
          "threshold": 2,
          "signers": [
            { "address": "0x111...", "role": "owner" },
            { "address": "0x222...", "role": "owner" },
            { "address": "0x333...", "role": "owner" }
          ]
        }
      },
      {
        "address": "0x323A76393544d5ecca80cd6ef2A560C6a395b7E3",
        "type": "dao",
        "name": "Governance DAO",
        "dao": {
          "type": "governor",
          "token": "0x...",
          "quorum": "1%",
          "timelock": 86400,
          "votingPeriod": 100800
        }
      }
    ]
  }
}
```

### Multisig Security Considerations

#### Verification Requirements

When documenting multisig ownership:

1. **Verify Signers**: Confirm all signer addresses are correct and active
2. **Threshold Validation**: Ensure threshold matches actual multisig configuration
3. **Module Verification**: Document and verify enabled modules
4. **ENS Resolution**: If multisig has ENS name, verify resolution

#### Security Best Practices

- **Signer Key Security**: Ensure signer keys are properly secured
- **Regular Audits**: Conduct regular security audits of multisig configurations
- **Emergency Procedures**: Document emergency signer replacement procedures
- **Transparency**: Make multisig configurations publicly verifiable

### Implementation Examples

#### Generating Multisig Metadata

```typescript
function generateMultisigMetadata(
  multisigAddress: string,
  config: GnosisSafeConfig
): ContractMetadata {
  return {
    id: `project.${config.type}.governance.${config.version}.${chainId}`,
    org: 'project',
    protocol: 'project',
    category: 'dao',
    role: 'governance',
    version: config.version,
    chainId: 1,
    addresses: [
      {
        chainId: 1,
        address: multisigAddress,
      },
    ],
    metadataHash: await calculateMetadataHash(metadata),
    ensRoot: 'project.dao.cns.eth',
    security: {
      owners: [
        {
          address: multisigAddress,
          type: 'multisig',
          name: `${config.threshold}-of-${config.signers.length} Multisig`,
          multisig: config,
        },
      ],
      upgradeability: 'immutable',
      attestation: {
        reference: '0x...',
        schema: 'https://schemas.ens.domains/contract-metadata-attestation/v1.0.0',
        attester: multisigAddress,
        timestamp: new Date().toISOString(),
        revocable: true,
        revocationStatus: 'active',
      },
    },
  };
}
```

#### Verifying Multisig Configuration

```typescript
async function verifyMultisigConfiguration(metadata: ContractMetadata): Promise<boolean> {
  const multisigOwner = metadata.security?.owners?.find((owner) => owner.type === 'multisig');

  if (!multisigOwner?.multisig) {
    return false;
  }

  const config = multisigOwner.multisig;

  // Verify threshold is reasonable
  if (config.threshold < 1 || config.threshold > config.signers.length) {
    throw new Error('Invalid multisig threshold');
  }

  // Verify all signers are unique
  const signerAddresses = config.signers.map((s) => s.address);
  const uniqueSigners = new Set(signerAddresses);
  if (uniqueSigners.size !== signerAddresses.length) {
    throw new Error('Duplicate signers in multisig configuration');
  }

  // Additional verification logic...
  return true;
}
```

### Example 5: Ownership Released Contract - Uniswap V2 Router

**Contract**: Uniswap V2 Router (Ownership Released to Community)

```json
{
  "id": "uniswap.uniswap.defi.router.v2-0-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "router",
  "version": "v2-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      "deployedBlock": 10008355,
      "ownershipReleased": true
    }
  ],
  "metadataHash": "0x...",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "interfaces": [
      {
        "name": "IUniswapV2Router02",
        "id": "0x...",
        "standard": "Uniswap-V2",
        "version": "2.0.0",
        "implemented": [
          "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
          "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)",
          "swapExactETHForTokens(uint256,address[],address,uint256)",
          "swapExactTokensForETH(uint256,uint256,address[],address,uint256)"
        ],
        "events": ["Swap(address,uint256,uint256,uint256,uint256,address)"]
      },
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "report": "https://github.com/Uniswap/v2-core/blob/main/audits/TrailOfBits.pdf",
        "date": "2020-04-15",
        "scope": "V2 Router audit"
      },
      {
        "firm": "OpenZeppelin",
        "report": "https://github.com/Uniswap/v2-core/blob/main/audits/OpenZeppelin.pdf",
        "date": "2020-05-01",
        "scope": "Security review"
      }
    ],
    "owners": [
      {
        "address": "0x0000000000000000000000000000000000000000",
        "type": "contract",
        "ownershipReleased": true
      }
    ],
    "metaDataMaintainer": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
    "authorizedAttesters": [
      "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "0x1234567890123456789012345678901234567890",
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    ],
    "upgradeability": "immutable",
    "permissions": ["read-only"],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  },
  "lifecycle": {
    "status": "deprecated",
    "since": "2021-05-05T00:00:00Z",
    "reason": "Superseded by Uniswap V3",
    "replacement": "uniswap.uniswap.defi.router.v3-1-0.1"
  },
  "tags": ["dex", "router", "v2", "deprecated", "immutable"]
}
```

### Example 7: ENS Domain with Rich Records - vitalik.eth

**Domain**: vitalik.eth (Personal ENS domain with comprehensive records)

```json
{
  "id": "vitalik.personal.identity.profile.v1-0-0.1",
  "org": "vitalik",
  "protocol": "personal",
  "category": "identity",
  "role": "profile",
  "version": "v1-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "deployedBlock": 4367321
    }
  ],
  "metadataHash": "0xb3a2c1f0e987654321fedcba987654321fedcba987654321fedcba9876543210",
  "ensRoot": "vitalik.eth",
  "standards": {
    "interfaces": [
      {
        "name": "IERC165",
        "id": "0x01ffc9a7",
        "standard": "ERC-165",
        "version": "1.0.0",
        "implemented": ["supportsInterface(bytes4)"]
      }
    ]
  },
  "ensRecords": {
    "text": {
      "avatar": "https://vitalik.ca/images/photo.jpg",
      "description": "Ethereum co-founder and researcher",
      "url": "https://vitalik.ca/",
      "email": "vitalik@vitalik.ca",
      "github": "vbuterin",
      "twitter": "VitalikButerin",
      "discord": "vitalik#0001",
      "telegram": "@vitalikbuterin",
      "reddit": "vbuterin",
      "linkedin": "vitalik-buterin-26620251",
      "location": "Toronto, Canada",
      "pronouns": "he/him",
      "birthdate": "1994-01-31"
    },
    "address": {
      "60": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "0": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    },
    "contenthash": "0xe3010170122087cfeb4c6e5b7f0e8a0b7c3b8f7e2c1f9a8b3e7d5c2f1a9b8e3d7c5f2a1b9c8e"
  },
  "ensPermissions": {
    "fuses": {
      "operator": "0x0000000000000000000000000000000000000000",
      "approved": [],
      "burned": [
        "CANNOT_UNWRAP",
        "CANNOT_TRANSFER",
        "CANNOT_SET_RESOLVER",
        "CANNOT_SET_TTL",
        "CANNOT_APPROVE",
        "IS_DOT_ETH"
      ],
      "value": 65539
    },
    "permissions": {
      "canExtendExpiry": true,
      "canApprove": false,
      "canCreateSubdomain": false,
      "canSetResolver": false,
      "canSetTTL": false,
      "canTransfer": false,
      "canUnwrap": false,
      "canBurnFuses": false,
      "parentControl": false,
      "isDotEth": true
    }
  },
  "ensMetadata": {
    "description": "Personal ENS domain of Vitalik Buterin, Ethereum co-founder",
    "purpose": "personal",
    "category": "identity",
    "tags": ["ethereum", "founder", "researcher", "public-figure"],
    "version": "v1.0.0",
    "created": "2017-05-01T00:00:00Z",
    "updated": "2023-06-15T10:00:00Z",
    "maintainers": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
    "documentation": "https://vitalik.ca/",
    "repository": "https://github.com/vbuterin"
  },
  "subdomains": [
    {
      "label": "blog",
      "node": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "resolver": "0x1234567890123456789012345678901234567890",
      "ttl": 3600,
      "records": {
        "text": {
          "url": "https://vitalik.ca/blog/"
        },
        "contenthash": "0xe30101701220..."
      },
      "permissions": {
        "canExtendExpiry": true,
        "canApprove": false,
        "canCreateSubdomain": false,
        "canSetResolver": false,
        "canSetTTL": false,
        "canTransfer": false,
        "canUnwrap": false,
        "canBurnFuses": false,
        "parentControl": true,
        "isDotEth": false
      },
      "metadata": {
        "description": "Blog subdomain for vitalik.eth",
        "purpose": "website",
        "created": "2018-03-15T00:00:00Z",
        "updated": "2023-06-15T10:00:00Z"
      }
    },
    {
      "label": "research",
      "node": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "resolver": "0x1234567890123456789012345678901234567890",
      "ttl": 3600,
      "records": {
        "text": {
          "url": "https://notes.ethereum.org/@vbuterin"
        },
        "contenthash": "0xe40101701220..."
      },
      "permissions": {
        "canExtendExpiry": true,
        "canApprove": false,
        "canCreateSubdomain": false,
        "canSetResolver": false,
        "canSetTTL": false,
        "canTransfer": false,
        "canUnwrap": false,
        "canBurnFuses": false,
        "parentControl": true,
        "isDotEth": false
      },
      "metadata": {
        "description": "Research notes and papers subdomain",
        "purpose": "academic",
        "created": "2020-01-10T00:00:00Z",
        "updated": "2023-06-15T10:00:00Z"
      }
    }
  ],
  "security": {
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": false,
      "revocationStatus": "active"
    }
  }
}
```

### Example 6: Project with Subdomains - Uniswap Interface

**Domain**: app.uniswap.eth (Uniswap web interface subdomain)

```json
{
  "id": "uniswap.uniswap.defi.interface.v3-0-0.1",
  "org": "uniswap",
  "protocol": "uniswap",
  "category": "defi",
  "role": "interface",
  "version": "v3-0-0",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x...", // IPFS hash or deployed contract
      "deployedBlock": 12345678
    }
  ],
  "metadataHash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "ensRoot": "uniswap.defi.cns.eth",
  "standards": {
    "interfaces": [
      {
        "name": "IUniswapV3Router",
        "id": "0xe343e6d8",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "inherited": [
          {
            "name": "IERC20",
            "id": "0x36372b07",
            "required": true
          }
        ],
        "implemented": [
          "exactInputSingle(ExactInputSingleParams)",
          "exactInput(ExactInputParams)",
          "exactOutputSingle(ExactOutputSingleParams)",
          "exactOutput(ExactOutputParams)"
        ],
        "events": ["Swap(address,address,int256,int256,uint160,uint128,int24)"],
        "documentation": "https://docs.uniswap.org/protocol/reference/core/interfaces/IUniswapV3Router"
      },
      {
        "name": "IUniswapV3Factory",
        "id": "0x...",
        "standard": "Uniswap-V3",
        "version": "3.0.0",
        "implemented": ["createPool(address,address,uint24)", "getPool(address,address,uint24)"],
        "events": ["PoolCreated(address,address,uint24,uint160,address)"]
      }
    ]
  },
  "ensRecords": {
    "text": {
      "url": "https://app.uniswap.org",
      "version": "v3.0.0",
      "build": "2023-06-15",
      "commit": "abc123def456"
    },
    "contenthash": "0xe3010170122087cfeb4c6e5b7f0e8a0b7c3b8f7e2c1f9a8b3e7d5c2f1a9b8e3d7c5f2a1b9c8e"
  },
  "subdomains": [
    {
      "label": "v2",
      "node": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "owner": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "resolver": "0x1234567890123456789012345678901234567890",
      "ttl": 300,
      "records": {
        "text": {
          "url": "https://v2.app.uniswap.org",
          "deprecated": "true",
          "replacement": "https://app.uniswap.org"
        },
        "contenthash": "0xe40101701220..."
      },
      "permissions": {
        "canExtendExpiry": true,
        "canApprove": false,
        "canCreateSubdomain": false,
        "canSetResolver": false,
        "canSetTTL": false,
        "canTransfer": false,
        "canUnwrap": false,
        "canBurnFuses": false,
        "parentControl": true,
        "isDotEth": false
      },
      "metadata": {
        "description": "Legacy Uniswap V2 interface",
        "purpose": "deprecated-interface",
        "version": "v2.0.0",
        "created": "2020-05-01T00:00:00Z",
        "updated": "2023-06-15T10:00:00Z"
      }
    },
    {
      "label": "docs",
      "node": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "owner": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "resolver": "0x1234567890123456789012345678901234567890",
      "ttl": 3600,
      "records": {
        "text": {
          "url": "https://docs.uniswap.org"
        },
        "contenthash": "0xe50101701220..."
      },
      "permissions": {
        "canExtendExpiry": true,
        "canApprove": false,
        "canCreateSubdomain": false,
        "canSetResolver": false,
        "canSetTTL": false,
        "canTransfer": false,
        "canUnwrap": false,
        "canBurnFuses": false,
        "parentControl": true,
        "isDotEth": false
      },
      "metadata": {
        "description": "Uniswap documentation portal",
        "purpose": "documentation",
        "version": "v3.0.0",
        "created": "2021-01-01T00:00:00Z",
        "updated": "2023-06-15T10:00:00Z"
      }
    },
    {
      "label": "api",
      "node": "0x1111111111111111111111111111111111111111111111111111111111111111",
      "owner": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "resolver": "0x1234567890123456789012345678901234567890",
      "ttl": 300,
      "records": {
        "text": {
          "url": "https://api.uniswap.org/v3",
          "version": "v3.0.0"
        }
      },
      "permissions": {
        "canExtendExpiry": true,
        "canApprove": false,
        "canCreateSubdomain": false,
        "canSetResolver": false,
        "canSetTTL": false,
        "canTransfer": false,
        "canUnwrap": false,
        "canBurnFuses": false,
        "parentControl": true,
        "isDotEth": false
      },
      "metadata": {
        "description": "Uniswap API endpoint",
        "purpose": "api",
        "version": "v3.0.0",
        "created": "2021-03-01T00:00:00Z",
        "updated": "2023-06-15T10:00:00Z"
      }
    }
  ],
  "security": {
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  }
}
```

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

## Migration Guide

This section provides guidance for migrating existing contract metadata to the ENSIP-X standard.

### Migration Overview

The standard is designed to be **backward compatible** with existing metadata while encouraging migration to the new format. The migration process involves:

1. **Assessment**: Evaluate current metadata against new requirements
2. **Mapping**: Map existing fields to new schema structure
3. **Enhancement**: Add missing required and recommended fields
4. **Validation**: Verify compliance with new validation rules
5. **Publication**: Update metadata and ENS records

### Migration Checklist

- [ ] **Schema Assessment**: Compare current metadata structure with new schema
- [ ] **Field Mapping**: Map existing fields to new field names and structures
- [ ] **ID Generation**: Create canonical ID following new grammar rules
- [ ] **Attestation**: Add cryptographic attestation for metadata integrity
- [ ] **ENS Integration**: Set up proper ENS domain structure
- [ ] **Validation**: Run comprehensive validation against new schema
- [ ] **Testing**: Test integration with ENS resolution systems

### Common Migration Patterns

#### 1. Legacy Field Mapping

| Legacy Field | New Field              | Migration Action                               |
| ------------ | ---------------------- | ---------------------------------------------- |
| `name`       | `id`                   | Convert to canonical ID format                 |
| `address`    | `addresses[0].address` | Move to addresses array structure              |
| `network`    | `addresses[0].chainId` | Move to addresses array structure              |
| `domain`     | `ensRoot`              | Update to new domain format                    |
| `version`    | `version`              | Ensure follows v{major}-{minor}-{patch} format |
| `audits`     | `security.audits`      | Move to security section                       |

#### 2. ID Format Migration

**Before:**

```json
{
  "name": "uniswap-router",
  "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
}
```

**After:**

```json
{
  "id": "uniswap.uniswap.defi.router.v3-1-0.1",
  "addresses": [
    {
      "chainId": 1,
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    }
  ]
}
```

#### 3. Domain Structure Migration

**Legacy Structure:**

```
contract.eth/
└── resolver with text records
```

**New Structure:**

```
uniswap.defi.cns.eth/
├── _project-info.json
└── amm.cns.eth/
    └── router.cns.eth/
        └── resolver with contract metadata
```

### Migration Tools and Scripts

#### Automated Migration Script

```typescript
import * as fs from 'fs';
import { migrateMetadata } from './migration/migrateMetadata';

async function migrateProject(projectDir: string) {
  const files = fs.readdirSync(projectDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const metadata = JSON.parse(fs.readFileSync(`${projectDir}/${file}`, 'utf8'));

      try {
        const migrated = await migrateMetadata(metadata);

        // Validate migrated metadata
        const validation = await validateMetadata(migrated);
        if (validation.valid) {
          fs.writeFileSync(`${projectDir}/${file}`, JSON.stringify(migrated, null, 2));
          console.log(`Migrated: ${file}`);
        } else {
          console.error(`Validation failed for ${file}:`, validation.errors);
        }
      } catch (error) {
        console.error(`Migration failed for ${file}:`, error);
      }
    }
  }
}
```

#### Migration Validation

```typescript
interface MigrationResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  migratedFields: string[];
}

async function migrateMetadata(legacyMetadata: any): Promise<ContractMetadata> {
  const result: MigrationResult = {
    success: true,
    warnings: [],
    errors: [],
    migratedFields: [],
  };

  // Map legacy fields to new structure
  const migrated: ContractMetadata = {
    id: generateCanonicalId(legacyMetadata),
    org: extractOrg(legacyMetadata),
    protocol: extractProtocol(legacyMetadata),
    category: mapCategory(legacyMetadata.category),
    role: mapRole(legacyMetadata.role),
    version: normalizeVersion(legacyMetadata.version),
    chainId: legacyMetadata.networkId || 1,
    addresses: migrateAddresses(legacyMetadata),
    metadataHash: await calculateMetadataHash(migrated),
    ensRoot: generateEnsRoot(migrated),
    // ... other fields
  };

  return migrated;
}
```

### Backwards Compatibility

The standard maintains backward compatibility with existing metadata:

- **Automatic Migration**: Files with deprecated `domain` field are automatically migrated
- **Field Preservation**: Deprecated fields are preserved under `_deprecated` namespace
- **Validation Warnings**: Migration warnings are shown but don't block validation
- **Legacy Aliases**: Legacy aliases are supported for existing implementations
- **Gradual Adoption**: Projects can migrate incrementally

### Compatibility Modes

#### Strict Mode

- Enforces all new validation rules
- Requires complete migration
- Provides maximum security and consistency

#### Compatibility Mode

- Allows legacy field formats
- Shows deprecation warnings
- Enables gradual migration

#### Legacy Mode

- Accepts existing metadata formats
- Minimal validation requirements
- Supports existing implementations

### Migration Best Practices

#### 1. Planning Phase

- **Inventory Assessment**: Catalog all existing metadata files
- **Impact Analysis**: Identify systems affected by migration
- **Timeline Planning**: Create realistic migration timeline
- **Rollback Planning**: Prepare rollback procedures

#### 2. Execution Phase

- **Pilot Migration**: Test migration on non-production metadata
- **Batch Processing**: Migrate in small batches to manage risk
- **Validation Testing**: Thoroughly test each migrated file
- **Monitoring**: Monitor for issues during migration

#### 3. Post-Migration Phase

- **Verification**: Verify all metadata is accessible and correct
- **System Updates**: Update consuming systems to use new format
- **Documentation**: Update project documentation
- **Training**: Train team members on new standards

### Troubleshooting Common Issues

#### Issue: Invalid Canonical ID Format

**Solution**: Ensure ID follows the grammar `{org}.{protocol}.{category}.{role}.{variant}.v{version}.{chainId}`

#### Issue: Missing Attestation

**Solution**: Generate cryptographic attestation using authorized attester keys

#### Issue: ENS Domain Setup

**Solution**: Register project domain under `cns.eth` and configure subdomains properly

#### Issue: Schema Validation Failures

**Solution**: Use the JSON Schema validator with the provided schema definition

## Security Considerations

This section provides comprehensive security guidance for implementing and maintaining ENS contract metadata. Security is paramount in blockchain applications, and this standard includes multiple layers of protection to ensure metadata integrity and authenticity.

### 1. Cryptographic Attestation System

All contract metadata MUST include a cryptographic attestation that provides verifiable proof of authenticity and integrity.

#### Attestation Requirements

All contract metadata MUST include an attestation reference that provides cryptographic verification of the metadata's authenticity and integrity.

**Mandatory Components:**

- `reference`: Cryptographic hash or signature of the metadata
- `schema`: URI to the attestation schema definition
- `attester`: Address authorized to issue attestations
- `timestamp`: ISO 8601 timestamp of attestation creation
- `revocable`: Boolean indicating if attestation can be revoked
- `revocationStatus`: Current status (`active`, `revoked`, `expired`)

**Example Implementation:**

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

#### Metadata Maintainer and Authorized Attesters

For contracts where ownership has been released or transferred to a null address (0x000...000), the standard introduces two key roles:

- **`metaDataMaintainer`**: A designated address authorized to update and maintain metadata when the original contract owner no longer has control
- **`authorizedAttesters`**: A list of trusted addresses that can attest to the validity and accuracy of metadata updates

These roles ensure that even immutable contracts can have their metadata properly maintained and verified by trusted community members or governance bodies.

**Reason for Attestation with Released Ownership:**

When a contract owner renounces ownership or transfers it to a null address, several critical issues arise for metadata management:

1. **Immutability Verification**: The contract becomes immutable, but metadata may still need updates for security patches, interface changes, or improved documentation
2. **Trust Establishment**: Without an active owner, consumers need a way to verify that metadata updates are legitimate and accurate
3. **Community Governance**: Trusted community members or governance bodies can maintain metadata quality and accuracy
4. **Decentralized Authority**: Multiple authorized attesters provide decentralized verification rather than single points of failure

**Example: Ownership Released Contract**

```json
{
  "security": {
    "owners": [
      {
        "address": "0x0000000000000000000000000000000000000000",
        "type": "contract",
        "ownershipReleased": true
      }
    ],
    "metaDataMaintainer": "0x1234567890123456789012345678901234567890",
    "authorizedAttesters": [
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222"
    ],
    "attestation": {
      "reference": "0x...",
      "schema": "https://schemas.ens.domains/contract-metadata-attestation/v1.0.0",
      "attester": "0x1234567890123456789012345678901234567890",
      "timestamp": "2023-06-15T10:00:00Z",
      "revocable": true,
      "revocationStatus": "active"
    }
  }
}
```

#### Attestation Verification Process

```typescript
async function verifyAttestation(metadata: ContractMetadata): Promise<boolean> {
  const attestation = metadata.security?.attestation;

  if (!attestation) {
    throw new Error('Missing attestation');
  }

  // 1. Verify attester is authorized
  if (!(await isAuthorizedAttester(attestation.attester))) {
    throw new Error('Unauthorized attester');
  }

  // 2. Check revocation status
  if (attestation.revocationStatus !== 'active') {
    throw new Error('Attestation is not active');
  }

  // 3. Verify timestamp is not expired
  if (attestation.expiry && new Date(attestation.expiry) < new Date()) {
    throw new Error('Attestation expired');
  }

  // 4. Verify cryptographic signature/proof
  return await verifyAttestationSignature(metadata, attestation);
}
```

### 2. Address Verification and Validation

Contract addresses MUST be verified against on-chain deployments to prevent malicious substitution.

#### Verification Checklist

- [ ] **Deployment Verification**: Confirm contract exists at specified address
- [ ] **Bytecode Verification**: Match bytecode hash against expected deployment
- [ ] **Source Verification**: Verify source code matches deployed bytecode (if provided)
- [ ] **Constructor Arguments**: Verify deployment arguments if applicable
- [ ] **Proxy Verification**: Verify implementation contracts for proxy patterns

#### Implementation Example

```typescript
async function verifyContractAddress(
  chainId: number,
  address: string,
  expectedBytecode?: string
): Promise<boolean> {
  const provider = getProviderForChain(chainId);

  // 1. Check if contract exists
  const code = await provider.getCode(address);
  if (code === '0x') {
    throw new Error('Contract not deployed at address');
  }

  // 2. Verify bytecode if provided
  if (expectedBytecode) {
    const actualBytecode = await provider.getCode(address);
    if (actualBytecode !== expectedBytecode) {
      throw new Error('Bytecode mismatch');
    }
  }

  // 3. Additional proxy verification
  return await verifyProxyImplementation(chainId, address);
}
```

### 3. Security Audit Requirements

Security audits are critical for establishing trust in contract metadata.

#### Audit Standards

- **Audit Firm Requirements**: Must be reputable, independent security firm
- **Audit Scope**: Must cover all contract functionality and integration points
- **Audit Frequency**: Audits must be conducted within 12 months of metadata publication
- **Audit Documentation**: Complete audit report must be publicly available

#### Audit Information Structure

```json
{
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "report": "https://github.com/project/audits/trail-of-bits-2023.pdf",
        "date": "2023-06-15",
        "scope": "Complete protocol audit including integration points",
        "findings": {
          "critical": 0,
          "high": 1,
          "medium": 3,
          "low": 7,
          "informational": 12
        },
        "remediationStatus": "completed"
      }
    ]
  }
}
```

### 4. Proxy Contract Security

Proxy contracts introduce additional security considerations that must be addressed in metadata.

#### Proxy Security Checklist

- [ ] **Implementation Verification**: Verify implementation contract addresses
- [ ] **Admin Access Control**: Document admin privileges and access controls
- [ ] **Upgrade Mechanisms**: Document upgrade procedures and authorization
- [ ] **Storage Layout**: Verify storage layout compatibility across upgrades
- [ ] **Emergency Procedures**: Document pause/emergency stop mechanisms

#### Proxy Metadata Example

```json
{
  "proxy": {
    "proxyType": "transparent",
    "implementationAddress": "0x1234567890123456789012345678901234567890",
    "implementationSlot": "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    "proxyAdmin": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "proxyVersion": "v1.0.0",
    "upgradeability": "upgradable",
    "adminFunctions": [
      "upgradeTo(address)",
      "upgradeToAndCall(address,bytes)",
      "pause()",
      "unpause()"
    ]
  }
}
```

### 5. Access Control and Authorization

Proper access control mechanisms must be implemented for metadata management.

#### Authorization Requirements

- **Metadata Updates**: Require multi-signature or DAO governance approval
- **Attestation Issuance**: Limited to verified, reputable entities
- **Emergency Actions**: Require time-locked or multi-signature authorization
- **Key Management**: Secure storage and rotation of signing keys

#### Authorization Implementation

```solidity
// Example authorization contract
contract MetadataAuthorization {
    mapping(address => bool) public authorizedAttesters;
    mapping(bytes32 => bool) public usedAttestations;

    modifier onlyAuthorizedAttester() {
        require(authorizedAttesters[msg.sender], "Unauthorized attester");
        _;
    }

    function attestMetadata(
        bytes32 metadataHash,
        bytes32 attestationHash
    ) external onlyAuthorizedAttester {
        require(!usedAttestations[attestationHash], "Attestation already used");
        usedAttestations[attestationHash] = true;
        emit MetadataAttested(metadataHash, attestationHash, msg.sender);
    }
}
```

### 6. Metadata Validation Framework

Automated validation ensures ongoing security and compliance.

#### Validation Categories

1. **Schema Validation**: JSON Schema compliance
2. **Cryptographic Validation**: Hash and signature verification
3. **Address Validation**: On-chain deployment verification
4. **Attestation Validation**: Authorization and status checks
5. **Consistency Validation**: Cross-reference integrity

#### Continuous Validation

```typescript
class MetadataValidator {
  async validateAll(metadata: ContractMetadata): Promise<ValidationResult> {
    const results: ValidationResult[] = [];

    // Schema validation
    results.push(await this.validateSchema(metadata));

    // Cryptographic validation
    results.push(await this.validateCryptography(metadata));

    // Address validation
    results.push(await this.validateAddresses(metadata));

    // Attestation validation
    results.push(await this.validateAttestation(metadata));

    // Consistency validation
    results.push(await this.validateConsistency(metadata));

    return this.aggregateResults(results);
  }
}
```

### 7. Security Best Practices

#### Development Phase

- **Code Review**: Conduct thorough security code reviews
- **Testing**: Implement comprehensive test coverage including security tests
- **Dependency Audit**: Regularly audit third-party dependencies
- **Static Analysis**: Use security-focused static analysis tools

#### Deployment Phase

- **Multi-signature Deployment**: Use multi-signature wallets for deployment
- **Gradual Rollout**: Implement gradual rollout mechanisms
- **Monitoring**: Set up comprehensive monitoring and alerting
- **Incident Response**: Establish clear incident response procedures

#### Maintenance Phase

- **Regular Updates**: Keep dependencies and metadata current
- **Security Monitoring**: Monitor for security incidents and vulnerabilities
- **Audit Rotation**: Conduct regular security audits
- **Key Rotation**: Regularly rotate signing keys and credentials

### 8. Emergency Procedures

#### Emergency Actions

1. **Metadata Revocation**: Immediate revocation of compromised metadata
2. **Contract Pause**: Emergency pause mechanisms for critical issues
3. **Communication**: Clear communication protocols for security incidents
4. **Recovery**: Documented recovery procedures

#### Emergency Metadata Update

```json
{
  "lifecycle": {
    "status": "deprecated",
    "since": "2023-06-15T14:30:00Z",
    "reason": "Security vulnerability discovered",
    "replacement": "new-project.defi.router.v3-1-1.1"
  },
  "security": {
    "incident": {
      "id": "SEC-2023-001",
      "severity": "critical",
      "description": "Reentrancy vulnerability in swap function",
      "reported": "2023-06-15T12:00:00Z",
      "status": "patched",
      "patch": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    }
  }
}
```

### 9. Compliance and Standards

#### Regulatory Compliance

- **Data Protection**: Ensure compliance with relevant data protection regulations
- **Financial Regulations**: Comply with financial services regulations where applicable
- **Export Controls**: Be aware of export control requirements for cryptographic software

#### Industry Standards

- **ISO 27001**: Information security management standards
- **NIST Cybersecurity Framework**: Cybersecurity best practices
- **OWASP Guidelines**: Web application security standards
- **Blockchain-specific Standards**: Industry-specific security guidelines

## Reference Implementation

This section provides a complete reference implementation for the ENS Contract Metadata Standard, including TypeScript interfaces, validation functions, and utility libraries.

### Core TypeScript Definitions

```typescript
// Core metadata interface
export interface ContractMetadata {
  // Identity fields
  id: string;
  org: string;
  protocol: string;
  category: ContractCategory;
  subcategory?: string;
  role: string;
  variant?: string;
  version: string;

  // Network fields
  chainId: number;
  addresses: ContractAddress[];

  // Core fields
  metadataHash: string;
  ensRoot: string;

  // Optional fields
  standards?: ContractStandards;
  artifacts?: ContractArtifacts;
  lifecycle?: ContractLifecycle;
  security?: ContractSecurity;
  proxy?: ProxyConfiguration;
  tags?: string[];
  subdomains?: SubdomainConfiguration[];
}

// Supporting interfaces
export interface ContractAddress {
  chainId: number;
  address: string;
  deployedBlock?: number;
  bytecodeHash?: string;
  implementation?: string | null;
  implementationSlot?: string;
}

export interface ContractInterface {
  name: string;
  id?: string;
  standard?: string;
  version?: string;
  inherited?: Array<{
    name: string;
    id?: string;
    required: boolean;
  }>;
  implemented?: string[];
  optional?: string[];
  events?: string[];
  errors?: string[];
  documentation?: string;
  specification?: string;
}

export interface ContractStandards {
  ercs?: string[];
  interfaces?: ContractInterface[];
}

export interface ContractArtifacts {
  abiHash?: string;
  sourceUri?: string;
  license?: string;
}

export interface ContractLifecycle {
  status: 'active' | 'deprecated' | 'superseded';
  since?: string;
  replacedBy?: string;
  reason?: string;
}

export interface ContractSecurity {
  audits?: SecurityAudit[];
  owners?: string[];
  upgradeability: 'immutable' | 'upgradable' | 'pausable';
  permissions?: string[];
  attestation: SecurityAttestation;
  incident?: SecurityIncident;
}

export interface SecurityAudit {
  firm: string;
  report: string;
  date: string;
  scope: string;
  findings?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    informational?: number;
  };
  remediationStatus: 'pending' | 'in_progress' | 'completed';
}

export interface SecurityAttestation {
  reference: string;
  schema: string;
  attester: string;
  timestamp: string;
  expiry?: string;
  revocable: boolean;
  revocationStatus: 'active' | 'revoked' | 'expired';
}

export interface SecurityIncident {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reported: string;
  status: 'open' | 'investigating' | 'patched' | 'closed';
  patch?: string;
}

export interface ProxyConfiguration {
  proxyType: 'transparent' | 'uups' | 'beacon' | 'diamond' | 'minimal' | 'immutable';
  implementationAddress?: string;
  implementationSlot?: string;
  proxyAdmin?: string;
  proxyVersion?: string;
  adminFunctions?: string[];
}

export interface SubdomainConfiguration {
  label: string;
  owner: string;
  controller?: string;
  resolver?: string;
  records?: ENSRecords;
}

export interface ENSRecords {
  [recordType: string]: any;
}

// Enums and constants
export type ContractCategory =
  | 'defi'
  | 'dao'
  | 'l2'
  | 'infra'
  | 'token'
  | 'nft'
  | 'gaming'
  | 'social'
  | 'identity'
  | 'privacy'
  | 'security'
  | 'wallet'
  | 'analytics'
  | 'rwa'
  | 'supply'
  | 'health'
  | 'finance'
  | 'dev'
  | 'art';

export const SUPPORTED_CATEGORIES: ContractCategory[] = [
  'defi',
  'dao',
  'l2',
  'infra',
  'token',
  'nft',
  'gaming',
  'social',
  'identity',
  'privacy',
  'security',
  'wallet',
  'analytics',
  'rwa',
  'supply',
  'health',
  'finance',
  'dev',
  'art',
];
```

### Metadata Generation Library

```typescript
import { createHash } from 'crypto';
import { ContractMetadata, ContractCategory, SUPPORTED_CATEGORIES } from './types';

export class MetadataGenerator {
  /**
   * Generate canonical ID from metadata components
   */
  static generateCanonicalId(metadata: Partial<ContractMetadata>): string {
    const {
      org = 'unknown',
      protocol = 'unknown',
      category = 'defi',
      role = 'contract',
      variant,
      version = 'v1-0-0',
      chainId = 1,
    } = metadata;

    this.validateIdComponents(org, protocol, category, role, version, chainId);

    const parts = [org, protocol, category, role];
    if (variant) parts.push(variant);
    parts.push(version, chainId.toString());

    return parts.join('.');
  }

  /**
   * Calculate metadata hash for integrity verification
   */
  static async calculateMetadataHash(metadata: ContractMetadata): Promise<string> {
    // Remove metadataHash field for calculation
    const { metadataHash, ...content } = metadata;

    // Sort keys alphabetically for deterministic hashing
    const sortedContent = this.sortObjectKeys(content);

    // Create canonical JSON
    const canonicalJson = JSON.stringify(sortedContent, null, 0);

    // Calculate SHA-256 hash
    const hash = createHash('sha256');
    hash.update(canonicalJson);
    const digest = hash.digest();

    return `0x${digest.toString('hex')}`;
  }

  /**
   * Validate metadata against schema and business rules
   */
  static async validateMetadata(metadata: ContractMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Schema validation
    const schemaErrors = await this.validateAgainstSchema(metadata);
    errors.push(...schemaErrors);

    // Business rule validation
    if (!SUPPORTED_CATEGORIES.includes(metadata.category)) {
      errors.push(`Unsupported category: ${metadata.category}`);
    }

    if (!this.isValidVersionFormat(metadata.version)) {
      errors.push(`Invalid version format: ${metadata.version}`);
    }

    if (!this.isValidAddress(metadata.addresses[0]?.address)) {
      errors.push('Invalid contract address format');
    }

    // Security validation
    if (!metadata.security?.attestation) {
      warnings.push('Missing security attestation - strongly recommended for production contracts');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static validateIdComponents(
    org: string,
    protocol: string,
    category: ContractCategory,
    role: string,
    version: string,
    chainId: number
  ): void {
    if (!/^[a-z0-9-]+$/.test(org)) {
      throw new Error('Invalid org format: must be lowercase alphanumeric with hyphens');
    }
    if (!/^[a-z0-9-]+$/.test(protocol)) {
      throw new Error('Invalid protocol format: must be lowercase alphanumeric with hyphens');
    }
    if (!SUPPORTED_CATEGORIES.includes(category)) {
      throw new Error(`Unsupported category: ${category}`);
    }
    if (!/^[a-z0-9-]+$/.test(role)) {
      throw new Error('Invalid role format: must be lowercase alphanumeric with hyphens');
    }
    if (!this.isValidVersionFormat(version)) {
      throw new Error(`Invalid version format: ${version}`);
    }
    if (chainId < 1) {
      throw new Error('Invalid chainId: must be positive integer');
    }
  }

  private static isValidVersionFormat(version: string): boolean {
    return /^v\d+(-v?\d+)*(-v?\d+)*$/.test(version);
  }

  private static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private static sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(this.sortObjectKeys);
    }

    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  private static async validateAgainstSchema(metadata: ContractMetadata): Promise<string[]> {
    // JSON Schema validation would go here
    // This is a simplified example
    const errors: string[] = [];

    if (!metadata.id) errors.push('Missing required field: id');
    if (!metadata.addresses || metadata.addresses.length === 0) {
      errors.push('Missing required field: addresses');
    }
    if (!metadata.metadataHash) {
      errors.push('Missing required field: metadataHash');
    }

    return errors;
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### ENS Integration Library

```typescript
import { ethers } from 'ethers';
import { ContractMetadata } from './types';

export class ENSMetadataManager {
  private provider: ethers.providers.Web3Provider;
  private ensAddress: string;

  constructor(
    provider: ethers.providers.Web3Provider,
    ensAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  ) {
    this.provider = provider;
    this.ensAddress = ensAddress;
  }

  /**
   * Register project domain under cns.eth
   */
  async registerProjectDomain(projectName: string, owner: string): Promise<string> {
    const ens = new ethers.Contract(
      this.ensAddress,
      [
        'function owner(bytes32) view returns (address)',
        'function setSubnodeOwner(bytes32, bytes32, address)',
      ],
      this.provider.getSigner()
    );

    const projectLabel = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(projectName));
    const cnsLabel = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('cns'));

    // Set project as subdomain of cns.eth
    await ens.setSubnodeOwner(cnsLabel, projectLabel, owner);

    return `${projectName}.cns.eth`;
  }

  /**
   * Set up category subdomain structure
   */
  async setupCategoryStructure(
    projectDomain: string,
    category: string,
    metadata: ContractMetadata
  ): Promise<void> {
    const domainParts = projectDomain.split('.');
    const ens = new ethers.Contract(
      this.ensAddress,
      [
        'function setSubnodeOwner(bytes32, bytes32, address)',
        'function setResolver(bytes32, address)',
        'function setText(bytes32, string, string)',
      ],
      this.provider.getSigner()
    );

    // Set up category subdomain
    const categoryLabel = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(category));
    const projectLabel = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(domainParts[0]));

    await ens.setSubnodeOwner(
      projectLabel,
      categoryLabel,
      await this.provider.getSigner().getAddress()
    );

    // Set metadata for category
    const categoryNode = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32'], [projectLabel, categoryLabel])
    );

    await ens.setText(
      categoryNode,
      'metadata',
      JSON.stringify({
        type: 'category',
        description: `${category} contracts for ${domainParts[0]}`,
        standard: 'ensip-x',
      })
    );
  }

  /**
   * Publish contract metadata to ENS
   */
  async publishContractMetadata(contractDomain: string, metadata: ContractMetadata): Promise<void> {
    const ens = new ethers.Contract(
      this.ensAddress,
      ['function setText(bytes32, string, string)'],
      this.provider.getSigner()
    );

    const domainHash = ethers.utils.namehash(contractDomain);

    // Store complete metadata
    await ens.setText(domainHash, 'contract.metadata', JSON.stringify(metadata));

    // Store individual fields for easier access
    await ens.setText(domainHash, 'contract.address', metadata.addresses[0].address);
    await ens.setText(domainHash, 'contract.category', metadata.category);
    await ens.setText(domainHash, 'contract.version', metadata.version);

    // Store security information
    if (metadata.security?.attestation) {
      await ens.setText(
        domainHash,
        'contract.attestation',
        metadata.security.attestation.reference
      );
    }
  }

  /**
   * Resolve contract metadata from ENS
   */
  async resolveContractMetadata(domain: string): Promise<ContractMetadata | null> {
    const ens = new ethers.Contract(
      this.ensAddress,
      ['function text(bytes32, string) view returns (string)'],
      this.provider
    );

    const domainHash = ethers.utils.namehash(domain);

    try {
      const metadataText = await ens.text(domainHash, 'contract.metadata');

      if (!metadataText) {
        return null;
      }

      const metadata = JSON.parse(metadataText);

      // Verify metadata integrity
      const calculatedHash = await MetadataGenerator.calculateMetadataHash(metadata);
      if (calculatedHash !== metadata.metadataHash) {
        throw new Error('Metadata hash verification failed');
      }

      return metadata;
    } catch (error) {
      console.error('Failed to resolve contract metadata:', error);
      return null;
    }
  }
}
```

### Command-Line Tool

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import { MetadataGenerator, ENSMetadataManager } from './lib';

const program = new Command();

program.name('ens-metadata-cli').description('ENS Contract Metadata CLI Tool').version('1.0.0');

program
  .command('generate')
  .description('Generate metadata for a contract')
  .option('-o, --org <org>', 'Organization identifier')
  .option('-p, --protocol <protocol>', 'Protocol identifier')
  .option('-c, --category <category>', 'Contract category')
  .option('-r, --role <role>', 'Contract role')
  .option('-v, --version <version>', 'Contract version')
  .option('--chain-id <chainId>', 'Chain ID', '1')
  .option('-a, --address <address>', 'Contract address')
  .option('-n, --name <name>', 'Contract name')
  .option('-f, --file <file>', 'Output file')
  .action(async (options) => {
    try {
      const metadata = await MetadataGenerator.generateFromOptions(options);
      const validation = await MetadataGenerator.validateMetadata(metadata);

      if (!validation.valid) {
        console.error('Validation failed:', validation.errors);
        process.exit(1);
      }

      const output = options.file || `${metadata.id}.json`;
      fs.writeFileSync(output, JSON.stringify(metadata, null, 2));

      console.log(`Metadata generated: ${output}`);
      if (validation.warnings.length > 0) {
        console.warn('Warnings:', validation.warnings);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate metadata file')
  .argument('<file>', 'Metadata file to validate')
  .action(async (file) => {
    try {
      const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
      const validation = await MetadataGenerator.validateMetadata(metadata);

      console.log(`Validation result: ${validation.valid ? 'PASS' : 'FAIL'}`);

      if (validation.errors.length > 0) {
        console.error('Errors:', validation.errors);
      }

      if (validation.warnings.length > 0) {
        console.warn('Warnings:', validation.warnings);
      }

      process.exit(validation.valid ? 0 : 1);
    } catch (error) {
      console.error('Validation failed:', error);
      process.exit(1);
    }
  });

program
  .command('publish')
  .description('Publish metadata to ENS')
  .argument('<file>', 'Metadata file to publish')
  .option('-d, --domain <domain>', 'ENS domain to publish to')
  .action(async (file, options) => {
    try {
      const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));

      if (!options.domain) {
        options.domain = `${metadata.id}.cns.eth`;
      }

      // Initialize ENS manager (requires provider setup)
      const ensManager = new ENSMetadataManager(/* provider */);

      await ensManager.publishContractMetadata(options.domain, metadata);

      console.log(`Metadata published to: ${options.domain}`);
    } catch (error) {
      console.error('Publication failed:', error);
      process.exit(1);
    }
  });

// Error handling and execution
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  console.error('CLI Error:', error);
  process.exit(1);
}
```

### Usage Examples

#### Generate Metadata for Uniswap V3 Router

```bash
# Generate metadata
ens-metadata-cli generate \
  --org uniswap \
  --protocol uniswap \
  --category defi \
  --role router \
  --version v3-1-0 \
  --chain-id 1 \
  --address 0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --name "Uniswap V3 Router" \
  --file uniswap-router.json

# Validate metadata
ens-metadata-cli validate uniswap-router.json

# Publish to ENS (requires ENS setup)
ens-metadata-cli publish uniswap-router.json --domain uniswap.defi.cns.eth
```

#### Integration with Build Scripts

```json
{
  "scripts": {
    "build": "hardhat compile",
    "deploy": "hardhat run scripts/deploy.ts",
    "metadata": "ens-metadata-cli generate --file metadata.json",
    "validate": "ens-metadata-cli validate metadata.json",
    "publish": "ens-metadata-cli publish metadata.json"
  }
}
```

This reference implementation provides a complete toolkit for working with ENS contract metadata, from generation and validation to publication and ENS integration.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
