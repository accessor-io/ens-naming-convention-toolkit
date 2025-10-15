# QA Specification: ENS Metadata Standards

## Overview

This document defines the comprehensive Quality Assurance (QA) standards for ENS metadata tools. All metadata files must comply with these standards to ensure consistency, discoverability, and reliability across the Ethereum ecosystem.

## Standards Summary

| Standard                          | Priority | Category       | Validation Level |
| --------------------------------- | -------- | -------------- | ---------------- |
| 1. Metadata Schema Validation     | Critical | Structure      | Required         |
| 2. Canonical ID Grammar           | Critical | Naming         | Required         |
| 3. Root Domain Categorization     | High     | Classification | Required         |
| 4. Subcategory Classification     | High     | Classification | Required         |
| 5. Security Standards             | Critical | Security       | Required         |
| 6. Lifecycle Management           | Medium   | Governance     | Recommended      |
| 7. Standards Compliance           | High     | Technical      | Required         |
| 8. Subdomain Management           | Medium   | ENS            | Recommended      |
| 9. File and Format Standards      | Medium   | Structure      | Required         |
| 10. Version and Compatibility     | High     | Governance     | Required         |
| 11. Schema Validation Integration | Critical | Technical      | Required         |
| 12. Cross-Reference Validation    | High     | Consistency    | Required         |
| 13. Dependency and Compatibility  | Medium   | Technical      | Recommended      |
| 14. Security Audit Validation     | Critical | Security       | Required         |
| 15. Performance and Gas Standards | Low      | Technical      | Recommended      |

---

## 1. Metadata Schema Validation

**Standard**: All metadata must conform to the JSON Schema defined in `data/metadata/schema.json`

### Required Fields

- `id` - Canonical identifier string
- `org` - Organization name
- `protocol` - Protocol name
- `category` - Root category (replaces deprecated `domain` field)
- `role` - Contract role/function
- `version` - Semantic version string
- `chainId` - Target blockchain network ID
- `addresses` - Array of deployment addresses

### Optional but Recommended Fields

- `subcategory` - Subcategory within the main category
- `ensRoot` - Subname under cns.eth hosting subdomains (e.g., uniswap.defi.cns.eth)
- `variant` - Protocol variant identifier
- `standards` - ERC/interface compliance
- `artifacts` - ABI hash, source URI, license
- `lifecycle` - Status, deployment date, replacement info
- `security` - Audit reports, ownership, upgradeability
- `tags` - Categorization keywords
- `subdomains` - ENS subdomain configurations
- `domain` - DEPRECATED: Use `category` instead

### Validation Rules

- All string fields must be non-empty
- `chainId` must be a positive integer
- `addresses` array must contain valid Ethereum addresses
- `version` must follow semantic versioning (e.g., "1.0.0")
- All nested objects must conform to schema structure

### Test Criteria

```json
{
  "valid": {
    "id": "uniswap.v3.defi.router.v3.1.1",
    "org": "uniswap",
    "protocol": "v3",
    "domain": "defi",
    "role": "router",
    "version": "3.1.0",
    "chainId": 1,
    "addresses": [{ "chainId": 1, "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564" }]
  },
  "invalid": {
    "id": "",
    "chainId": "invalid",
    "addresses": [{ "address": "invalid-address" }]
  }
}
```

---

## 2. Canonical ID Grammar Standard

**Standard**: `org.protocol.category.role[.variant].v{semver}.{chainId}`

### Grammar Components

- `org` - Organization identifier (lowercase, hyphen-separated)
- `protocol` - Protocol name (lowercase, hyphen-separated)
- `category` - Root category (must match registered categories)
- `role` - Contract role/function (lowercase, descriptive)
- `variant` - Optional protocol variant identifier
- `version` - Version format: v{num}, v{num}-{num}, or v{num}-{num}-{num}
- `chainId` - Target blockchain network ID

### Validation Rules

- Must follow exact grammar pattern
- Organization and protocol names must be lowercase, hyphen-separated
- Domain must match registered root domains
- Role must be descriptive and lowercase
- Variant (optional) must be meaningful identifier
- Version must be semantic versioning format
- Chain ID must be valid network identifier

### Examples

```
uniswap.v3.defi.router.v3.1.1
aave.v3.defi.lending-pool.v3.1.1
compound.v2.defi.comptroller.v2.8.1
```

### Test Criteria

- Valid: `uniswap.v3.defi.router.v3.1.1`
- Invalid: `Uniswap.V3.DEFI.router.v3.1.1` (uppercase)
- Invalid: `uniswap.v3.defi.router.v3.1` (missing chainId)

---

## 3. Root Domain Categorization Standard

**Standard**: Must use registered canonical root domains

### Approved Root Domains

- `defi.eth` - DeFi protocols
- `dao.eth` - Governance protocols
- `l2.eth` - Layer 2 solutions
- `infra.eth` - Infrastructure
- `token.eth` - Token contracts
- `nft.eth` - NFT platforms
- `gaming.eth` - Gaming applications
- `social.eth` - Social networks
- `identity.eth` - Identity solutions
- `privacy.eth` - Privacy tools
- `security.eth` - Security services
- `wallet.eth` - Wallet applications
- `analytics.eth` - Analytics tools
- `rwa.eth` - Real World Assets
- `supply.eth` - Supply chain
- `health.eth` - Healthcare
- `finance.eth` - Traditional finance
- `dev.eth` - Developer tools
- `art.eth` - Art platforms

### Validation Rules

- Must use canonical domain (not aliases)
- Domain must match protocol category
- No custom or unregistered domains allowed
- Domain must be lowercase

### Test Criteria

- Valid: `defi`, `dao`, `l2`, `infra`
- Invalid: `DeFi`, `DAO`, `L2` (uppercase)
- Invalid: `custom.eth` (unregistered)

---

## 4. Subcategory Classification Standard

**Standard**: Must use registered subcategories within each root domain

### Required Subcategories by Domain

#### DeFi

- `amm` - Automated Market Maker
- `lending` - Lending protocols
- `stablecoin` - Stablecoin protocols
- `yield` - Yield farming
- `perps` - Perpetual contracts
- `options` - Options protocols
- `derivatives` - Derivative products
- `dex-aggregator` - DEX aggregators
- `asset-management` - Asset management
- `liquid-staking` - Liquid staking
- `cdps` - Collateralized Debt Positions
- `synthetics` - Synthetic assets
- `insurance` - DeFi insurance

#### DAO

- `governor` - Governance contracts
- `timelock` - Timelock contracts
- `treasury` - Treasury management
- `voting` - Voting mechanisms
- `multisig` - Multi-signature wallets
- `module` - Governance modules

#### L2

- `optimistic-rollup` - Optimistic rollups
- `zk-rollup` - Zero-knowledge rollups
- `validium` - Validium chains
- `da-layer` - Data availability layers
- `bridge` - Cross-chain bridges
- `sequencer` - Transaction sequencers
- `prover` - Proof generators

#### Infrastructure

- `oracle` - Price oracles
- `relayer` - Transaction relayers
- `rpc` - RPC providers
- `indexer` - Blockchain indexers
- `subgraph` - The Graph subgraphs
- `event-stream` - Event streaming
- `data-availability` - Data availability

#### Tokens

- `erc20` - ERC-20 tokens
- `erc721` - ERC-721 NFTs
- `erc1155` - ERC-1155 multi-tokens
- `governance-token` - Governance tokens
- `rwa` - Real world asset tokens
- `wrapped` - Wrapped tokens
- `bridged` - Cross-chain tokens

### Validation Rules

- At least one subcategory must be specified
- Subcategories must be registered for the chosen domain
- Subcategories must accurately describe protocol function
- Must be lowercase, hyphen-separated

### Test Criteria

- Valid: `["amm", "router"]` for defi domain
- Invalid: `["AMM", "Router"]` (uppercase)
- Invalid: `["custom"]` (unregistered subcategory)

---

## 5. Security Standards

**Standard**: Security section must be populated with relevant information

### Required Security Fields

- `audits` - Array of security audit information
- `owners` - Multi-signature or governance addresses
- `upgradeability` - Proxy pattern or immutability status
- `permissions` - Access control mechanisms

### Audit Requirements

- At least one audit entry required for production contracts
- Audit must be from reputable security firm
- Audit report must be publicly available
- Audit must cover critical contract functions

### Validation Rules

- At least one audit entry required for production contracts
- Owner addresses must be valid Ethereum addresses
- Upgradeability status must be clearly specified
- Permission model must be documented
- Security findings must be addressed

### Test Criteria

```json
{
  "valid": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "date": "2023-01-15",
        "report": "https://example.com/audit-report.pdf",
        "findings": "2 medium, 1 low"
      }
    ],
    "owners": ["0x1234567890123456789012345678901234567890"],
    "upgradeability": "immutable",
    "permissions": ["admin", "pauser"]
  }
}
```

---

## 6. Lifecycle Management Standard

**Standard**: Must specify current lifecycle status and version information

### Required Lifecycle Fields

- `status` - Current development status
- `since` - Initial deployment or announcement date
- `replacedBy` - Successor contract (if applicable)

### Valid Status Values

- `planning` - Under development
- `development` - In active development
- `testing` - Undergoing testing
- `deployed` - Live on mainnet
- `deprecated` - No longer recommended
- `discontinued` - No longer maintained

### Validation Rules

- Status must be valid lifecycle stage
- Date format must be ISO 8601
- Deprecated contracts must specify replacement
- Status transitions must be logical

### Test Criteria

- Valid: `{"status": "deployed", "since": "2023-01-15T00:00:00Z"}`
- Invalid: `{"status": "invalid-status"}`
- Invalid: `{"since": "2023-01-15"}` (missing timezone)

---

## 7. Standards Compliance Validation

**Standard**: Must declare supported ERC standards and interfaces

### Validation Rules

- ERC numbers must be valid (e.g., "ERC20", "ERC721")
- Interface IDs must be correct format
- Standards must match actual contract implementation
- No false claims of standard compliance

### Supported Standards

- ERC-20: Fungible tokens
- ERC-721: Non-fungible tokens
- ERC-1155: Multi-token standard
- ERC-165: Interface detection
- ERC-173: Contract ownership
- ERC-1967: Proxy storage slots
- ERC-2535: Diamond proxy pattern

### Test Criteria

- Valid: `["ERC20", "ERC165"]`
- Invalid: `["ERC20", "ERC999"]` (non-existent standard)
- Invalid: `["erc20"]` (incorrect case)

---

## 8. Subdomain Management Standard

**Standard**: ENS subdomain configurations must follow proper ownership patterns

### Required Subdomain Fields

- `label` - Left-most subdomain label
- `owner` - Ethereum address with ownership rights
- `controller` - Address with management rights (optional)
- `resolver` - ENS resolver contract address (optional)
- `records` - Additional ENS records (optional)

### Validation Rules

- Owner address must be valid Ethereum address
- Controller address must be valid (if specified)
- Resolver must be valid ENS resolver contract
- Records must follow ENS standards
- Subdomain labels must be valid ENS names

### Test Criteria

```json
{
  "valid": {
    "label": "router",
    "owner": "0x1234567890123456789012345678901234567890",
    "controller": "0x0987654321098765432109876543210987654321",
    "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
  }
}
```

---

## 9. File and Format Standards

**Standard**: All metadata files must follow consistent formatting

### Validation Rules

- Valid JSON syntax
- Proper indentation (2 spaces)
- Consistent field ordering
- No trailing commas
- Proper escaping of special characters
- File encoding must be UTF-8
- File size must be under 1MB

### Format Requirements

- Use 2-space indentation
- Sort object keys alphabetically
- Use double quotes for strings
- No trailing commas in arrays or objects
- Unix line endings (LF)

### Test Criteria

- Valid: Properly formatted JSON with 2-space indentation
- Invalid: JSON with 4-space indentation
- Invalid: JSON with trailing commas

---

## 10. Version and Compatibility Standards

**Standard**: Version management must follow semantic versioning principles

### Validation Rules

- Major version for breaking changes
- Minor version for new features
- Patch version for bug fixes
- Pre-release identifiers allowed (alpha, beta, rc)
- Build metadata allowed (+build.info)
- Version must be consistent across related contracts

### Semantic Versioning

- `MAJOR.MINOR.PATCH`
- Pre-release: `1.0.0-alpha.1`
- Build metadata: `1.0.0+build.123`

### Test Criteria

- Valid: `"1.0.0"`, `"2.1.3"`, `"1.0.0-alpha.1"`
- Invalid: `"1.0"`, `"v1.0.0"`, `"1.0.0.1"`

---

## 11. Schema Validation Integration

**Standard**: All metadata must pass JSON Schema validation against `data/metadata/schema.json`

### Validation Rules

- Use AJV or similar JSON Schema validator
- Validate against full schema including custom extensions
- Report specific field validation failures
- Support schema versioning
- Handle schema evolution gracefully

### Implementation Requirements

- Real-time validation during metadata generation
- Batch validation for existing metadata files
- Detailed error reporting with field paths
- Schema version compatibility checking

### Test Criteria

- Valid: Metadata passes all schema validation rules
- Invalid: Metadata fails schema validation with specific error messages

---

## 12. Cross-Reference Validation

**Standard**: Metadata fields must be consistent and cross-referenced

### Validation Rules

- `id` must match canonical grammar pattern
- `domain` must match registered root domains
- `standards.ercs` must match actual contract interfaces
- `addresses[].chainId` must match metadata `chainId`
- `lifecycle.status` must be valid enum value
- `security.upgradeability` must be consistent with contract analysis

### Cross-Reference Checks

- ID grammar consistency
- Domain-category alignment
- Address format validation
- Chain ID consistency
- Status transition validation

### Test Criteria

- Valid: All cross-references are consistent
- Invalid: ID domain doesn't match domain field
- Invalid: Address chainId doesn't match metadata chainId

---

## 13. Dependency and Compatibility Validation

**Standard**: Contract dependencies and compatibility must be documented and validated

### Validation Rules

- Required dependencies must be listed
- Compatible networks must be specified
- Version compatibility ranges must be defined
- Breaking changes must be flagged
- Dependency versions must be pinned

### Dependency Management

- List all external contract dependencies
- Specify minimum compatible versions
- Document breaking changes between versions
- Validate dependency availability

### Test Criteria

- Valid: All dependencies listed with version ranges
- Invalid: Missing critical dependencies
- Invalid: Incompatible version ranges

---

## 14. Security Audit Validation

**Standard**: Production contracts must have appropriate security validation

### Validation Rules

- At least one reputable audit firm required for mainnet deployment
- Audit coverage must include critical functions
- Known vulnerabilities must be documented
- Bug bounty programs must be active
- Security findings must be addressed

### Audit Requirements

- Minimum audit coverage: 80% of critical functions
- Audit must be from recognized security firm
- Audit report must be publicly available
- Security findings must be resolved or documented

### Test Criteria

- Valid: Production contract with recent audit from reputable firm
- Invalid: Production contract without audit
- Invalid: Audit from unknown or disreputable firm

---

## 15. Performance and Gas Optimization Standards

**Standard**: Contracts must meet performance benchmarks

### Validation Rules

- Gas usage must be within acceptable limits
- Function complexity must be measured
- Storage optimization must be documented
- Batch operations must be supported where applicable
- Performance metrics must be tracked

### Performance Benchmarks

- Maximum gas per transaction: 500,000
- Maximum function complexity: 15
- Storage slots optimization documented
- Batch operation support where applicable

### Test Criteria

- Valid: Gas usage under limits with documented optimization
- Invalid: Gas usage exceeds limits without justification
- Invalid: Missing performance documentation

---

## Compliance Scoring

### Scoring Methodology

- **Critical Standards (1-5, 11, 12, 14)**: 20 points each
- **High Priority Standards (3, 4, 7, 10)**: 15 points each
- **Medium Priority Standards (6, 8, 9, 13)**: 10 points each
- **Low Priority Standards (15)**: 5 points each

### Compliance Levels

- **Excellent**: 90-100% compliance
- **Good**: 80-89% compliance
- **Acceptable**: 70-79% compliance
- **Poor**: 60-69% compliance
- **Non-compliant**: <60% compliance

### Validation Tools

- `bin/schema-validator.js` - Schema validation
- `bin/naming-validator.js` - Naming and grammar validation
- `bin/cross-reference-validator.js` - Cross-reference validation
- `bin/qa-report-generator.js` - Comprehensive compliance reporting

---

## Implementation Notes

### Validation Workflow

1. Schema validation against JSON Schema
2. Canonical ID grammar validation
3. Cross-reference consistency checks
4. Security standards validation
5. Performance and compatibility checks
6. Generate compliance report

### Error Handling

- Critical errors: Block metadata generation
- High priority errors: Require resolution before deployment
- Medium priority errors: Generate warnings
- Low priority errors: Include in compliance report

### Continuous Integration

- Pre-commit hooks for basic validation
- CI/CD pipeline for comprehensive validation
- Automated compliance reporting
- Integration with development workflow

This QA specification ensures consistent, high-quality metadata across the ENS ecosystem while maintaining flexibility for different protocol types and use cases.
