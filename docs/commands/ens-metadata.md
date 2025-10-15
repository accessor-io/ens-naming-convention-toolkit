# ens-metadata

Main CLI entry point for ENS metadata operations.

## Purpose

The `ens-metadata` command provides a unified interface for all ENS metadata operations, including generation, validation, planning, and analysis.

## Usage

```bash
ens-metadata [command] [options]
```

## Commands

### metadata

Generate metadata for protocols and subdomains.

**Usage**: `ens-metadata metadata [options]`

**Options**:

- `-c, --category <category>` - Protocol category (defi, dao, infrastructure, tokens, gaming, social, rwa, privacy, developer, analytics)
- `-t, --type <type>` - Protocol type (amm, lending, governor, erc20, etc.)
- `-n, --name <name>` - Protocol name
- `-V, --protocol-version <version>` - Protocol version
- `-o, --output <file>` - Output file path

**Example**:

```bash
ens-metadata metadata --category defi --type amm --name Uniswap --protocol-version 3 --output uniswap.json
```

**Expected Output**:

```json
{
  "protocol": {
    "name": "Uniswap",
    "version": "3",
    "category": "automated-market-maker",
    "description": "Uniswap automated market maker protocol"
  },
  "contract": {
    "type": "amm",
    "interfaces": [],
    "deploymentBlock": "0"
  }
}
```

**Desired Outcome**: Generate standardized metadata template for the specified protocol.

**How to Use Results**: Use the generated metadata for ENS domain registration, subdomain planning, and validation.

### validate

Validate ENS naming conventions and security.

**Usage**: `ens-metadata validate <domain> [options]`

**Options**:

- `-c, --category <category>` - Expected category
- `--strict` - Strict validation mode
- `-m, --metadata <file>` - Metadata file to validate against

**Example**:

```bash
ens-metadata validate uniswap.amm.eth --category defi --strict
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
```

**Desired Outcome**: Validate domain format, naming conventions, and metadata compliance.

**How to Use Results**: Fix identified issues before deployment, use suggestions to improve naming.

### plan

Plan subdomain structure for protocols.

**Usage**: `ens-metadata plan <domain> [options]`

**Options**:

- `-c, --category <category>` - Protocol category
- `-t, --type <type>` - Protocol type
- `--protocol-version <version>` - Protocol version

**Example**:

```bash
ens-metadata plan uniswap.eth --category defi --type amm --protocol-version 3
```

**Expected Output**:

```
SUBDOMAIN PLAN: UNISWAP
════════════════════════════════════════════════════════════════════
Category: DEFI
Type: AMM
Variables: {"version":"3","tvl":"5000000000"}

SUBDOMAIN HIERARCHY:
amm.uniswap.defi.evmd.eth
├── factory.amm.uniswap.defi.evmd.eth
├── router.amm.uniswap.defi.evmd.eth
├── quoter.amm.uniswap.defi.evmd.eth
└── multicall.amm.uniswap.defi.evmd.eth
```

**Desired Outcome**: Generate complete subdomain hierarchy with metadata for each subdomain.

**How to Use Results**: Execute registration script to create subdomains, use generated metadata for each subdomain.

### probe

Probe ENS resolvers and contracts.

**Usage**: `ens-metadata probe [options]`

**Options**:

- `-a, --address <address>` - Specific address to probe
- `-m, --multicall` - Use multicall for batch probing
- `-o, --output <file>` - Output file path

**Example**:

```bash
ens-metadata probe --address 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --multicall --output probe-results.json
```

**Expected Output**:

```
=== Contract Probe Results ===

Address: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
Type: erc20
Functions:
  name: "Uniswap Token"
  symbol: "UNI"
  decimals: 18
  totalSupply: "1000000000000000000000000000"
```

**Desired Outcome**: Probe contract functions and return metadata.

**How to Use Results**: Extract contract information for metadata generation and validation.

### lookup

Lookup ENS names by resolver.

**Usage**: `ens-metadata lookup [options]`

**Options**:

- `-r, --resolver <address>` - Specific resolver address
- `-o, --output <file>` - Output file path

**Example**:

```bash
ens-metadata lookup --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15 --output names.json
```

**Expected Output**:

```json
{
  "resolver": "0x231b87e9f02df89ec136656ea28f2e0f443f9f15",
  "names": ["example.eth", "test.eth"],
  "count": 2
}
```

**Desired Outcome**: Find all ENS names using the specified resolver.

**How to Use Results**: Use for resolver analysis and domain discovery.

### security

Analyze security posture of ENS domains.

**Usage**: `ens-metadata security <domain> [options]`

**Options**:

- `--check-fuses` - Check ENS Name Wrapper fuses
- `--check-verification` - Check identity verification
- `-o, --output <file>` - Output file path

**Example**:

```bash
ens-metadata security vitalik.eth --check-fuses --check-verification --output security-report.json
```

**Expected Output**:

```
Security Report for vitalik.eth
════════════════════════════════════════════════════════════════════
Overall Grade: B (85/100)

Security Checks:

OK Name Wrapper Fuses: PASS (100/100)
  [INFO] All critical and recommended fuses are properly set

OK Registration Expiry: PASS (100/100)
  [INFO] Registration is valid for 365 more days

WARN Resolver Security: WARN (70/100)
  [MEDIUM] Wildcard resolver may be overly permissive
```

**Desired Outcome**: Analyze domain security and identify vulnerabilities.

**How to Use Results**: Address security issues, follow recommendations for improvements.

## Global Options

- `--verbose` - Verbose output
- `--json` - JSON output format

## Next Steps

- [ens-validator](ens-validator.md) - Domain validation
- [metadata-generator](metadata-generator.md) - Metadata generation
- [subdomain-planner](subdomain-planner.md) - Subdomain planning
- [security-analyzer](security-analyzer.md) - Security analysis
- [Results and Workflows](../Results-and-Workflows.md) - How to use results
