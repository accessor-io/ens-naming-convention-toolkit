# ENS Metadata Tools Tutorials

Welcome to our comprehensive tutorial series! These step-by-step guides will help you master ENS Metadata Tools through real-world scenarios.

## Tutorial Index

1. [**Protocol Onboarding Tutorial**](#protocol-onboarding-tutorial) - Complete guide to onboarding a new DeFi protocol
2. [**Security Assessment Tutorial**](#security-assessment-tutorial) - Comprehensive security analysis workflow
3. [**Subdomain Planning Tutorial**](#subdomain-planning-tutorial) - Designing optimal domain hierarchies
4. [**Contract Discovery Tutorial**](#contract-discovery-tutorial) - Analyzing existing smart contracts
5. [**Integration Tutorial**](#integration-tutorial) - Integrating with CI/CD pipelines

---

## Protocol Onboarding Tutorial

### Scenario: Onboarding Uniswap V3 to ENS Metadata Standard

In this tutorial, we'll walk through the complete process of onboarding Uniswap V3 to the ENS Metadata Standard, from initial analysis to final deployment.

### Step 1: Contract Analysis and Discovery

First, let's analyze the existing Uniswap V3 contracts:

```bash
# Create a project directory
mkdir uniswap-v3-ens-onboarding
cd uniswap-v3-ens-onboarding

# Analyze the main router contract
node tools/prober/probe-multicall.js \
  0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --type amm-router \
  --methods all \
  --output router-analysis.json

# Analyze the factory contract
node tools/prober/probe-multicall.js \
  0x1F98431c8aD98523631AE4a59f267346ea31F984 \
  --type factory \
  --methods all \
  --output factory-analysis.json

# Analyze the UNI token contract
node tools/prober/probe-multicall.js \
  0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 \
  --type erc20 \
  --methods all \
  --output token-analysis.json
```

**Analysis Results:**

```json
{
  "router": {
    "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    "type": "AMM Router",
    "interfaces": ["IUniswapV3Router", "IERC165"],
    "methods": {
      "exactInputSingle": "0x414bf389",
      "exactInput": "0xc04b8d59",
      "exactOutputSingle": "0xdb3e2198",
      "exactOutput": "0xf28c0498"
    }
  },
  "factory": {
    "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    "type": "Factory Contract",
    "interfaces": ["IUniswapV3Factory", "IERC165"]
  },
  "token": {
    "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "type": "ERC-20 Token",
    "symbol": "UNI",
    "name": "Uniswap",
    "decimals": 18,
    "totalSupply": "1000000000000000000000000000"
  }
}
```

### Step 2: Generate Standardized Metadata

Now let's generate comprehensive metadata for each component:

```bash
# Generate router metadata
metadata-generator \
  --category defi \
  --type amm \
  --name "Uniswap V3 Router" \
  --version "3.1.0" \
  --address "0xE592427A0AEce92De3Edee1F18E0157C05861564" \
  --interfaces "IUniswapV3Router,IERC165" \
  --output uniswap-v3-router-metadata.json

# Generate factory metadata
metadata-generator \
  --category defi \
  --type amm \
  --name "Uniswap V3 Factory" \
  --version "3.1.0" \
  --address "0x1F98431c8aD98523631AE4a59f267346ea31F984" \
  --interfaces "IUniswapV3Factory,IERC165" \
  --output uniswap-v3-factory-metadata.json

# Generate token metadata
metadata-generator \
  --category token \
  --type erc20 \
  --name "Uniswap Token" \
  --symbol "UNI" \
  --version "1.0.0" \
  --address "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" \
  --interfaces "IERC20,IERC20Metadata" \
  --output uniswap-token-metadata.json
```

### Step 3: Validate Generated Metadata

Validate all generated metadata for compliance:

```bash
# Validate router metadata
ens-validator uniswap-v3-router-metadata.json defi --strict --qa

# Validate factory metadata
ens-validator uniswap-v3-factory-metadata.json defi --strict --qa

# Validate token metadata
ens-validator uniswap-token-metadata.json token --strict --qa
```

**Validation Results:**

```
[PASS] Router metadata validation passed
[PASS] Factory metadata validation passed
[PASS] Token metadata validation passed
[INFO] Overall QA Score: 98/100
```

### Step 4: Plan Subdomain Structure

Design the optimal subdomain hierarchy:

```bash
# Generate subdomain plan
subdomain-planner \
  --domain uniswap.eth \
  --category defi \
  --type amm \
  --components router,factory,token,governance \
  --interactive \
  --output uniswap-subdomain-plan.json
```

**Generated Subdomain Plan:**

```json
{
  "domain": "uniswap.eth",
  "structure": {
    "defi": {
      "amm": {
        "router": "uniswap.defi.amm.router.cns.eth",
        "factory": "uniswap.defi.amm.factory.cns.eth",
        "quoter": "uniswap.defi.amm.quoter.cns.eth"
      },
      "governance": {
        "governor": "uniswap.defi.governance.governor.cns.eth",
        "timelock": "uniswap.defi.governance.timelock.cns.eth"
      }
    },
    "token": {
      "uniswap": "uniswap.token.uniswap.cns.eth"
    },
    "tools": {
      "analytics": "uniswap.tools.analytics.cns.eth",
      "api": "uniswap.tools.api.cns.eth"
    }
  }
}
```

### Step 5: Security Analysis

Perform comprehensive security analysis:

```bash
# Analyze router security
security-analyzer \
  --contract "0xE592427A0AEce92De3Edee1F18E0157C05861564" \
  --type amm-router \
  --check-proxy \
  --check-ownership \
  --check-upgradeability \
  --output router-security-analysis.json

# Analyze factory security
security-analyzer \
  --contract "0x1F98431c8aD98523631AE4a59f267346ea31F984" \
  --type factory \
  --check-proxy \
  --check-ownership \
  --output factory-security-analysis.json
```

**Security Analysis Results:**

```json
{
  "router": {
    "securityGrade": "A+",
    "score": 96,
    "checks": {
      "proxy": { "status": "passed", "details": "No proxy detected" },
      "ownership": { "status": "passed", "details": "Ownership properly configured" },
      "upgradeability": { "status": "passed", "details": "Contract is immutable" }
    }
  },
  "factory": {
    "securityGrade": "A+",
    "score": 94,
    "checks": {
      "proxy": { "status": "passed", "details": "No proxy detected" },
      "ownership": { "status": "passed", "details": "Ownership properly configured" }
    }
  }
}
```

### Step 6: Final Integration

Create the final integrated metadata package:

```bash
# Create integrated metadata package
ens-metadata integrate \
  --router uniswap-v3-router-metadata.json \
  --factory uniswap-v3-factory-metadata.json \
  --token uniswap-token-metadata.json \
  --plan uniswap-subdomain-plan.json \
  --output uniswap-v3-complete-metadata.json

# Validate integrated package
ens-validator uniswap-v3-complete-metadata.json defi --strict --qa
```

**Final Result:**

```json
{
  "protocol": "uniswap",
  "version": "3.1.0",
  "category": "defi",
  "components": {
    "router": {
      "id": "uniswap.uniswap.defi.router.v3-1-0.1",
      "address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      "ensDomain": "uniswap.defi.amm.router.cns.eth"
    },
    "factory": {
      "id": "uniswap.uniswap.defi.factory.v3-1-0.1",
      "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      "ensDomain": "uniswap.defi.amm.factory.cns.eth"
    },
    "token": {
      "id": "uniswap.uniswap.token.token.v1-0-0.1",
      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "ensDomain": "uniswap.token.uniswap.cns.eth"
    }
  },
  "security": {
    "overallGrade": "A+",
    "score": 95
  },
  "subdomains": {
    "planned": 8,
    "validated": 8
  }
}
```

---

## Security Assessment Tutorial

### Scenario: Comprehensive Security Analysis of ENS Domain

This tutorial demonstrates how to perform a thorough security assessment of an ENS domain and its associated contracts.

### Step 1: Domain Security Analysis

```bash
# Analyze domain security posture
security-analyzer \
  --domain vitalik.eth \
  --check-fuses \
  --check-proxy \
  --check-ownership \
  --check-resolver \
  --verbose \
  --output domain-security-analysis.json
```

### Step 2: Contract Security Analysis

```bash
# Analyze associated contracts
security-analyzer \
  --domain vitalik.eth \
  --analyze-contracts \
  --check-upgradeability \
  --check-admin-functions \
  --output contract-security-analysis.json
```

### Step 3: Generate Security Report

```bash
# Generate comprehensive security report
security-analyzer \
  --domain vitalik.eth \
  --generate-report \
  --format html \
  --output security-report.html
```

---

## Subdomain Planning Tutorial

### Scenario: Designing a Complex Protocol Hierarchy

This tutorial shows how to design optimal subdomain structures for complex protocols.

### Step 1: Analyze Protocol Requirements

```bash
# Analyze protocol structure
subdomain-planner \
  --domain compound.eth \
  --category defi \
  --type lending \
  --analyze-existing \
  --output protocol-analysis.json
```

### Step 2: Generate Subdomain Plan

```bash
# Generate comprehensive subdomain plan
subdomain-planner \
  --domain compound.eth \
  --template defi-lending \
  --components lending,governance,token,oracle \
  --interactive \
  --output subdomain-plan.json
```

### Step 3: Validate and Optimize

```bash
# Validate subdomain plan
ens-validator subdomain-plan.json defi --strict

# Optimize subdomain structure
subdomain-planner \
  --domain compound.eth \
  --optimize \
  --input subdomain-plan.json \
  --output optimized-plan.json
```

---

## Contract Discovery Tutorial

### Scenario: Analyzing Unknown Smart Contracts

This tutorial demonstrates how to discover and analyze unknown smart contracts.

### Step 1: Contract Discovery

```bash
# Discover contract functionality
node tools/prober/probe-multicall.js \
  0x1234567890123456789012345678901234567890 \
  --discover \
  --output contract-discovery.json
```

### Step 2: Interface Detection

```bash
# Detect implemented interfaces
node tools/prober/probe-multicall.js \
  0x1234567890123456789012345678901234567890 \
  --detect-interfaces \
  --output interface-detection.json
```

### Step 3: Generate Metadata

```bash
# Generate metadata based on discovery
metadata-generator \
  --discovered contract-discovery.json \
  --interfaces interface-detection.json \
  --output generated-metadata.json
```

---

## Integration Tutorial

### Scenario: CI/CD Pipeline Integration

This tutorial shows how to integrate ENS Metadata Tools into CI/CD pipelines.

### GitHub Actions Example

```yaml
name: ENS Metadata Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-metadata:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install ENS Metadata Tools
        run: npm install -g ens-metadata-tools

      - name: Validate Metadata
        run: |
          ens-validator contracts/*.json defi --strict --qa
          security-analyzer contracts/*.json --check-all

      - name: Generate Report
        run: |
          ens-metadata report \
            --input contracts/ \
            --output reports/validation-report.html

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: reports/
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g ens-metadata-tools'
            }
        }

        stage('Validate') {
            steps {
                sh 'ens-validator contracts/*.json defi --strict --qa'
            }
        }

        stage('Security Analysis') {
            steps {
                sh 'security-analyzer contracts/*.json --check-all'
            }
        }

        stage('Generate Report') {
            steps {
                sh 'ens-metadata report --input contracts/ --output reports/'
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'validation-report.html',
                    reportName: 'ENS Validation Report'
                ])
            }
        }
    }
}
```

---

## Next Steps

After completing these tutorials, you should be comfortable with:

- [PASS] Protocol onboarding workflows
- [PASS] Security assessment procedures
- [PASS] Subdomain planning strategies
- [PASS] Contract discovery techniques
- [PASS] CI/CD integration patterns

**Recommended next steps:**

- [CLI Commands Reference](commands/) - Detailed command documentation
- [API Documentation](api/) - Programmatic usage
- [Architecture Guide](Architecture.md) - System understanding
- [Best Practices](Best-Practices.md) - Production recommendations

---

_Need help? Check our [Troubleshooting Guide](Troubleshooting.md) or [FAQ](FAQ.md)._
