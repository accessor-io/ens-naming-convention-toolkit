# ens-validator

Ethereum Contract Naming Convention Validator for ENS domains and metadata compliance.

## Purpose

The `ens-validator` command validates ENS naming conventions, metadata compliance, and QA standards for domains and their associated contracts.

## Usage

```bash
ens-validator <domain> <category> [options]
```

## Arguments

- `<domain>` - ENS domain to validate (required)
- `<category>` - Protocol category (required)

## Options

- `--strict` - Strict validation mode with enhanced rules
- `--metadata <file>` - Load metadata from JSON file for validation
- `--batch <file>` - Validate multiple domains from file
- `--qa` - Enable QA standards validation
- `--no-qa` - Disable QA standards validation
- `--output <file>` - Save validation report to file
- `--format <format>` - Output format (text, json, html)

## Categories

### DeFi Categories

- `defi` - General DeFi protocols
- `amm` - Automated Market Makers
- `lending` - Lending protocols
- `stablecoin` - Stablecoin protocols
- `dex` - Decentralized exchanges

### DAO Categories

- `dao` - General DAO protocols
- `governor` - Governance contracts
- `treasury` - Treasury management

### Infrastructure Categories

- `infrastructure` - General infrastructure
- `oracle` - Price oracles
- `bridge` - Cross-chain bridges
- `proxy` - Proxy contracts

### Token Categories

- `tokens` - General token contracts
- `erc20` - ERC-20 tokens
- `erc721` - ERC-721 NFTs
- `governance` - Governance tokens

## Examples

### Basic Validation

```bash
ens-validator uniswap.amm.eth defi
```

**Expected Output**:

```
NAMING CONVENTION VALIDATION REPORT
══════════════════════════════════════════════════════════
Domain: uniswap.amm.eth
Category: defi
Score: 85/100
Status: COMPLIANT

ISSUES (0):

WARNINGS (1):
  1. Domain does not follow recommended defi naming pattern

SUGGESTIONS:
  1. Consider using: ^[a-z0-9]+\.(amm|lending|derivatives)\.eth$

METADATA COMPLIANCE:
  Coverage: 90%
  Compliant Fields: 18/20
```

**Desired Outcome**: Validate domain format and naming conventions against category rules.

**How to Use Results**: Fix identified issues before deployment, use suggestions to improve naming.

### Strict Validation

```bash
ens-validator uniswap.amm.eth defi --strict --qa
```

**Expected Output**:

```
STRICT VALIDATION REPORT
══════════════════════════════════════════════════════════
Domain: uniswap.amm.eth
Category: defi
Score: 92/100
Status: COMPLIANT

VALIDATION CHECKS:
✓ Domain format validation: PASS
✓ Category compliance: PASS
✓ Naming convention: PASS
✓ Metadata validation: PASS
✓ QA standards: PASS

ISSUES (0):

WARNINGS (0):

SUGGESTIONS:
  1. Consider adding version suffix: uniswap-v3.amm.eth
```

**Desired Outcome**: Perform strict validation with enhanced rules and QA standards.

**How to Use Results**: Ensure compliance with strict standards for production deployment.

### Metadata Validation

```bash
ens-validator uniswap.amm.eth defi --metadata uniswap-metadata.json --qa
```

**Expected Output**:

```
METADATA VALIDATION REPORT
══════════════════════════════════════════════════════════
Domain: uniswap.amm.eth
Category: defi
Metadata File: uniswap-metadata.json
Score: 88/100
Status: COMPLIANT

METADATA CHECKS:
✓ Required fields: PASS
✓ Data types: PASS
✓ Schema compliance: PASS
✓ Cross-references: PASS
✓ Security metadata: PASS

ISSUES (0):

WARNINGS (2):
  1. Missing audit information
  2. Incomplete security documentation

SUGGESTIONS:
  1. Add audit information to security section
  2. Complete security documentation
```

**Desired Outcome**: Validate domain against specific metadata file and QA standards.

**How to Use Results**: Ensure metadata compliance and completeness.

### Batch Validation

```bash
ens-validator --batch domains.txt --category defi --output batch-report.json
```

**Expected Output**:

```json
{
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 2,
    "averageScore": 87.5
  },
  "results": [
    {
      "domain": "uniswap.amm.eth",
      "status": "PASS",
      "score": 92,
      "issues": [],
      "warnings": []
    }
  ]
}
```

**Desired Outcome**: Validate multiple domains efficiently with summary report.

**How to Use Results**: Process large domain lists and identify patterns in validation results.

## Validation Rules

### Format Validation

- Domain structure compliance
- Character restrictions (lowercase, alphanumeric)
- Length limitations
- TLD validation (.eth)

### Category Compliance

- Pattern matching against category rules
- Naming convention adherence
- Subdomain structure validation
- Protocol type consistency

### Metadata Validation

- Required fields presence
- Data type validation
- Schema compliance
- Cross-reference consistency

### QA Standards

- Security metadata completeness
- Audit information presence
- Documentation standards
- Compliance scoring

## Error Handling

### Common Validation Errors

1. **Invalid Domain Format**
   - Error: Domain contains invalid characters
   - Solution: Use only lowercase alphanumeric characters

2. **Category Mismatch**
   - Error: Domain doesn't match expected category
   - Solution: Adjust domain name or category selection

3. **Missing Metadata**
   - Error: Required metadata fields missing
   - Solution: Complete metadata file with required fields

4. **Schema Violations**
   - Error: Metadata doesn't conform to schema
   - Solution: Fix schema compliance issues

## Next Steps

- [metadata-generator](metadata-generator.md) - Generate compliant metadata
- [subdomain-planner](subdomain-planner.md) - Plan compliant subdomain structures
- [security-analyzer](security-analyzer.md) - Analyze security compliance
- [Results and Workflows](../Results-and-Workflows.md) - How to use validation results
- [Interconnectivity](../Interconnectivity.md) - How validation fits into workflows
