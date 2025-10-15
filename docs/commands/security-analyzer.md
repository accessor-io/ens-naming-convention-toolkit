# security-analyzer

Analyze ENS domain security posture and identify vulnerabilities.

## Purpose

The `security-analyzer` command performs security analysis of ENS domains, including Name Wrapper fuses, registration expiry, resolver security, and identity verification.

## Usage

```bash
security-analyzer <domain> [options]
```

## Arguments

- `<domain>` - ENS domain to analyze (required)

## Options

- `--check-fuses` - Check ENS Name Wrapper fuses
- `--check-verification` - Check identity verification
- `--check-expiry` - Check registration expiry
- `--check-resolver` - Check resolver security
- `--output <file>` - Save security report to file
- `--format <format>` - Output format (text, json, html)
- `--verbose` - Verbose output with detailed information
- `--batch <file>` - Analyze multiple domains from file

## Examples

### Basic Security Analysis

```bash
security-analyzer vitalik.eth
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

WARN Identity Verification: WARN (60/100)
  [MEDIUM] No identity verification associated with this name

Security Recommendations:

1. [MEDIUM] Consider updating resolver configuration
   Wildcard resolver may be overly permissive
   Command: ens-contract resolver vitalik.eth --set 0x1234...

2. [MEDIUM] Consider adding identity verification
   No identity verification associated with this name
   Command: ens-contract verify vitalik.eth --provider twitter
```

**Desired Outcome**: Analyze domain security and identify vulnerabilities.

**How to Use Results**: Address security issues, follow recommendations for improvements.

### Comprehensive Security Analysis

```bash
security-analyzer vitalik.eth --check-fuses --check-verification --check-expiry --check-resolver --output security-report.json
```

**Expected Output**:

```json
{
  "domain": "vitalik.eth",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "overall": {
    "score": 85,
    "grade": "B",
    "issues": []
  },
  "checks": {
    "fuses": {
      "name": "Name Wrapper Fuses",
      "status": "PASS",
      "score": 100,
      "maxScore": 100,
      "issues": [
        {
          "type": "STRONG_FUSES",
          "severity": "INFO",
          "description": "All critical and recommended fuses are properly set"
        }
      ],
      "details": {
        "fuses": 7,
        "expiry": "2025-01-15T00:00:00.000Z",
        "owner": "0x...",
        "fuseBits": {
          "CANNOT_UNWRAP": true,
          "CANNOT_BURN_FUSES": true,
          "CANNOT_TRANSFER": true
        }
      }
    },
    "expiry": {
      "name": "Registration Expiry",
      "status": "PASS",
      "score": 100,
      "maxScore": 100,
      "issues": [
        {
          "type": "VALID_REGISTRATION",
          "severity": "INFO",
          "description": "Registration is valid for 365 more days"
        }
      ],
      "details": {
        "expiry": "2025-01-15T00:00:00.000Z",
        "daysUntilExpiry": 365,
        "currentTime": "2024-01-15T10:30:00.000Z"
      }
    },
    "resolver": {
      "name": "Resolver Security",
      "status": "WARN",
      "score": 70,
      "maxScore": 100,
      "issues": [
        {
          "type": "WILDCARD_RESOLVER",
          "severity": "MEDIUM",
          "description": "Wildcard resolver may be overly permissive"
        }
      ],
      "details": {
        "resolver": "0x...",
        "type": "wildcard",
        "permissions": ["read", "write"],
        "restrictions": []
      }
    },
    "verification": {
      "name": "Identity Verification",
      "status": "WARN",
      "score": 60,
      "maxScore": 100,
      "issues": [
        {
          "type": "NO_VERIFICATION",
          "severity": "MEDIUM",
          "description": "No identity verification associated with this name"
        }
      ],
      "details": {
        "verified": false,
        "providers": [],
        "verificationDate": null
      }
    }
  },
  "recommendations": [
    {
      "priority": "MEDIUM",
      "action": "Consider updating resolver configuration",
      "details": "Wildcard resolver may be overly permissive",
      "command": "ens-contract resolver vitalik.eth --set 0x1234..."
    },
    {
      "priority": "MEDIUM",
      "action": "Consider adding identity verification",
      "details": "No identity verification associated with this name",
      "command": "ens-contract verify vitalik.eth --provider twitter"
    }
  ]
}
```

**Desired Outcome**: Perform comprehensive security analysis with detailed recommendations.

**How to Use Results**: Use detailed analysis for security improvements and compliance.

### Batch Security Analysis

```bash
security-analyzer --batch domains.txt --output batch-security-report.json
```

**Expected Output**:

```json
{
  "summary": {
    "total": 10,
    "passed": 6,
    "warned": 3,
    "failed": 1,
    "averageScore": 82.5
  },
  "results": [
    {
      "domain": "vitalik.eth",
      "overall": {
        "score": 85,
        "grade": "B",
        "issues": []
      }
    }
  ]
}
```

**Desired Outcome**: Analyze multiple domains efficiently with summary report.

**How to Use Results**: Process large domain lists and identify security patterns.

## Security Checks

### Name Wrapper Fuses

Analyzes ENS Name Wrapper fuse configuration:

- **CANNOT_UNWRAP**: Prevents unwrapping the domain
- **CANNOT_BURN_FUSES**: Prevents burning fuses
- **CANNOT_TRANSFER**: Prevents transferring the domain
- **CANNOT_SET_RESOLVER**: Prevents changing resolver
- **CANNOT_SET_TTL**: Prevents changing TTL
- **CANNOT_CREATE_SUBDOMAIN**: Prevents creating subdomains
- **CANNOT_REPLACE_SUBDOMAIN**: Prevents replacing subdomains

### Registration Expiry

Validates domain registration status:

- **Expiry Date**: When the domain expires
- **Days Until Expiry**: Time remaining
- **Renewal Status**: Whether renewal is needed
- **Grace Period**: Grace period status

### Resolver Security

Assesses resolver configuration:

- **Resolver Type**: Wildcard, standard, or custom
- **Permissions**: Read/write permissions
- **Restrictions**: Access restrictions
- **Vulnerabilities**: Known security issues

### Identity Verification

Checks identity verification status:

- **Verified Status**: Whether domain is verified
- **Verification Providers**: Twitter, GitHub, etc.
- **Verification Date**: When verification occurred
- **Verification Level**: Level of verification

## Security Scoring

### Score Calculation

Security scores are calculated based on:

- **Fuse Configuration**: 25% weight
- **Registration Status**: 25% weight
- **Resolver Security**: 25% weight
- **Identity Verification**: 25% weight

### Grade Assignment

- **A (90-100)**: Excellent security posture
- **B (80-89)**: Good security posture
- **C (70-79)**: Acceptable security posture
- **D (60-69)**: Poor security posture
- **F (0-59)**: Critical security issues

## Recommendations

### High Priority

- Critical security vulnerabilities
- Expired registrations
- Missing critical fuses
- Compromised resolvers

### Medium Priority

- Suboptimal fuse configurations
- Missing identity verification
- Permissive resolver settings
- Approaching expiry dates

### Low Priority

- Minor security improvements
- Best practice recommendations
- Optional enhancements

## Integration with Other Tools

### Validation Integration

```bash
security-analyzer vitalik.eth --validate
```

**Expected Output**: Security analysis with validation compliance check.

**Desired Outcome**: Ensure security analysis meets validation standards.

**How to Use Results**: Use for compliance validation and reporting.

### Metadata Integration

```bash
security-analyzer vitalik.eth --metadata vitalik-metadata.json
```

**Expected Output**: Security analysis with metadata compliance check.

**Desired Outcome**: Ensure security analysis aligns with metadata standards.

**How to Use Results**: Use for metadata validation and compliance.

## Error Handling

### Common Errors

1. **Domain Not Found**
   - Error: Domain does not exist
   - Solution: Verify domain name and network

2. **Network Issues**
   - Error: Cannot connect to Ethereum network
   - Solution: Check network connectivity and RPC endpoint

3. **Permission Issues**
   - Error: Cannot access domain information
   - Solution: Check domain permissions and access rights

4. **Resolver Issues**
   - Error: Cannot resolve domain
   - Solution: Check resolver configuration and status

## Next Steps

- [ens-contract](ens-contract.md) - Implement security recommendations
- [ens-validator](ens-validator.md) - Validate security compliance
- [Results and Workflows](../Results-and-Workflows.md) - How to use security analysis results
- [Interconnectivity](../Interconnectivity.md) - How security analysis fits into workflows
