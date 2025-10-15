# ENS Metadata Tools - Complete Documentation

## Table of Contents

1. [Software Description](#software-description)
2. [Why It's Needed](#why-its-needed)
3. [Installation](#installation)
4. [General Commands](#general-commands)
5. [Command Descriptions and Outcomes](#command-descriptions-and-outcomes)
6. [Application Logic](#application-logic)
7. [File Functions Analysis](#file-functions-analysis)
8. [API Usage Documentation](#api-usage-documentation)
9. [Interconnectivity](#interconnectivity)
10. [Local Tools](#local-tools)

---

## Software Description

The ENS Metadata Tools is a toolkit for Ethereum Name Service (ENS) contract metadata management, security analysis, and subdomain planning. It provides standardized metadata templates, validation systems, and operational tools for managing ENS domains and their associated smart contracts.

### Core Components

- **Metadata Generation**: Creates standardized metadata templates for different contract categories
- **Validation Suite**: Validates ENS naming conventions and metadata compliance
- **Security Analysis**: Analyzes ENS domain security posture and identifies vulnerabilities
- **Subdomain Planning**: Plans optimal subdomain hierarchies for protocols
- **ENS Operations**: Direct ENS contract interactions and management
- **TypeScript Support**: Full TypeScript implementation with type safety
- **CI/CD Integration**: Automated testing, linting, and security checks

### Architecture Overview

The toolkit consists of several specialized modules working together:

```
ENS Metadata Tools
├── Metadata Generator (bin/metadata-generator.mjs)
├── Naming Validator (bin/naming-validator.mjs)
├── Subdomain Planner (bin/subdomain-planner.mjs)
├── Security Analyzer (bin/security-analyzer.mjs)
├── ENS Operations (bin/ens-contract.mjs)
├── Cache Browser (bin/cache-browser.mjs)
├── Multicall Prober (tools/prober/probe-multicall.js)
└── Supporting Libraries (src/)
```

---

## Why It's Needed

### 1. Standardization Challenges

- **Fragmented Metadata**: Different protocols use inconsistent metadata formats
- **Naming Conflicts**: Lack of standardized naming conventions leads to confusion
- **Discovery Issues**: Poor metadata makes contract discovery difficult

### 2. Security Concerns

- **ENS Vulnerabilities**: Name Wrapper fuses and security configurations need analysis
- **Proxy Patterns**: Complex proxy implementations require specialized handling
- **Audit Requirements**: Production contracts need security validation

### 3. Operational Complexity

- **Subdomain Management**: Planning and organizing subdomain hierarchies is complex
- **Cross-Reference Validation**: Ensuring metadata consistency across related contracts
- **Compliance Requirements**: Meeting QA standards and validation requirements

### 4. Developer Experience

- **Tool Fragmentation**: Multiple tools needed for different aspects of ENS management
- **Learning Curve**: Complex ENS operations require specialized knowledge
- **Automation Needs**: Manual processes need automation and standardization

---

## Installation

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm or yarn
- Git

### Global Installation

```bash
npm install -g ens-metadata-tools
```

### Local Development Installation

```bash
# Clone the repository
git clone https://github.com/ens-contracts/metadata-tools.git
cd ens-metadata-tools

# Install dependencies
npm install

# Setup git hooks
npm run prepare
```

### Verification

```bash
# Check installation
ens-metadata --help

# Verify CLI tools
ens-validator --help
ens-contract --help
```

---

## General Commands

### Primary CLI Commands

| Command              | Description                     | Usage                                               |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| `ens-metadata`       | Main CLI entry point            | `ens-metadata [command] [options]`                  |
| `ens-validator`      | Domain and metadata validation  | `ens-validator <domain> <category> [options]`       |
| `ens-contract`       | ENS contract operations         | `ens-contract [command] [options]`                  |
| `metadata-generator` | Generate metadata templates     | `metadata-generator --category <cat> --type <type>` |
| `subdomain-planner`  | Plan subdomain structures       | `subdomain-planner [options]`                       |
| `security-analyzer`  | Security analysis and reporting | `security-analyzer <domain> [options]`              |
| `ens-cache-browser`  | ENS cache browser               | `ens-cache-browser [options]`                       |

### Validation & QA Commands

| Command              | Description                     | Usage                        |
| -------------------- | ------------------------------- | ---------------------------- |
| `validate`           | Validate ENS naming conventions | `npm run validate`           |
| `validate:qa`        | Generate QA reports             | `npm run validate:qa`        |
| `validate:schema`    | Schema validation               | `npm run validate:schema`    |
| `validate:cross-ref` | Cross-reference validation      | `npm run validate:cross-ref` |
| `validate:all`       | Run all validations             | `npm run validate:all`       |

### Development Commands

| Command     | Description              | Usage               |
| ----------- | ------------------------ | ------------------- |
| `test`      | Run test suite           | `npm test`          |
| `lint`      | Code linting             | `npm run lint`      |
| `format`    | Code formatting          | `npm run format`    |
| `typecheck` | TypeScript type checking | `npm run typecheck` |
| `build`     | Build project            | `npm run build`     |

---

## Command Descriptions and Outcomes

### 1. Metadata Generation (`metadata-generator`)

**Purpose**: Generate standardized metadata templates for different contract categories and types.

**Command**:

```bash
metadata-generator --category defi --type amm --name Uniswap --version 3
```

**Outcome**:

- Creates JSON metadata file with standardized structure
- Includes protocol information, contract details, and security metadata
- Generates usage examples and cross-references

**Intended Results**:

```json
{
  "protocol": {
    "name": "Uniswap V3",
    "version": "3",
    "category": "automated-market-maker",
    "description": "Uniswap automated market maker protocol"
  },
  "contract": {
    "type": "amm",
    "interfaces": [],
    "deploymentBlock": "0"
  },
  "liquidity": {
    "totalValueLocked": "{{tvl}}",
    "activePairs": "{{activePairs}}"
  }
}
```

**How to Use Results**:

- Use generated metadata for ENS domain registration
- Reference in subdomain planning
- Validate against QA standards
- Include in contract documentation

### 2. Domain Validation (`ens-validator`)

**Purpose**: Validate ENS naming conventions and metadata compliance.

**Command**:

```bash
ens-validator uniswap.amm.eth defi --strict --qa
```

**Outcome**:

- Validates domain format and naming conventions
- Checks category-specific rules
- Performs QA standards validation
- Generates compliance report

**Intended Results**:

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

**How to Use Results**:

- Fix identified issues before deployment
- Use suggestions to improve naming
- Reference compliance score for quality assurance
- Include in project documentation

### 3. Subdomain Planning (`subdomain-planner`)

**Purpose**: Plan and organize subdomain structures for protocols.

**Command**:

```bash
subdomain-planner --interactive
```

**Outcome**:

- Interactive guidance for category selection
- Generates complete subdomain hierarchy
- Creates registration scripts
- Produces metadata files for each subdomain

**Intended Results**:

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

REGISTRATION SCRIPT:
#!/bin/bash
# Subdomain Registration Script for uniswap
# Generated on 2024-01-15T10:30:00.000Z
# Category: defi, Type: amm
```

**How to Use Results**:

- Execute registration script to create subdomains
- Use generated metadata for each subdomain
- Reference hierarchy for documentation
- Validate generated structure

### 4. Security Analysis (`security-analyzer`)

**Purpose**: Analyze ENS domain security posture and identify vulnerabilities.

**Command**:

```bash
security-analyzer vitalik.eth --check-fuses --output security-report.json
```

**Outcome**:

- Analyzes Name Wrapper fuses
- Checks registration expiry
- Validates resolver security
- Assesses identity verification

**Intended Results**:

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
```

**How to Use Results**:

- Address high-priority security issues
- Follow recommendations for improvements
- Use security grade for risk assessment
- Include in security documentation

### 5. ENS Operations (`ens-contract`)

**Purpose**: Perform ENS contract operations including registration, resolver management, and record setting.

**Command**:

```bash
ens-contract register router.uniswap.defi.eth --owner 0x1234... --resolver 0x231b...
```

**Outcome**:

- Registers new subdomains
- Sets resolver addresses
- Configures ENS records
- Manages Name Wrapper fuses

**Intended Results**:

```
Registration completed successfully.
   Transaction: 0xabc123...
   Block: 12345678
   Gas used: 150000
```

**How to Use Results**:

- Verify transaction success
- Use transaction hash for tracking
- Reference block number for confirmation
- Monitor gas usage for optimization

### 6. Contract Probing (`probe-multicall`)

**Purpose**: Probe multiple contracts using multicall for efficient batch operations.

**Command**:

```bash
node tools/prober/probe-multicall.js 0x1234... 0x5678... --type erc20 --output results.json
```

**Outcome**:

- Probes contract functions using multicall
- Returns contract metadata and function results
- Supports batch operations for efficiency

**Intended Results**:

```
=== Contract Probe Results ===

Address: 0x1234...
Type: erc20
Functions:
  name: "Uniswap Token"
  symbol: "UNI"
  decimals: 18
  totalSupply: "1000000000000000000000000000"
```

**How to Use Results**:

- Extract contract information
- Use for metadata generation
- Validate contract functionality
- Include in contract documentation

---

## Application Logic

### Core Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│                    Core Business Logic                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Metadata  │ │  Validation │ │  Planning   │          │
│  │  Generator  │ │   Engine    │ │   Engine    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   ENS       │ │   Schema    │ │   Cache     │          │
│  │ Operations  │ │  Validation │ │  Management │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Ethereum   │ │   ENS       │ │  Multicall  │          │
│  │  Provider   │ │  Contracts  │ │  Contracts  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input Processing**: CLI commands parse arguments and options
2. **Validation**: Input validation against schemas and rules
3. **Business Logic**: Core functionality execution
4. **Data Access**: Interaction with external services and storage
5. **Output Generation**: Results formatting and display

### Error Handling

- **Graceful Degradation**: Fallback mechanisms for service failures
- **Detailed Error Messages**: Clear, actionable error descriptions
- **Validation Failures**: Specific field-level error reporting
- **Network Issues**: Retry mechanisms and timeout handling

### Configuration Management

- **Environment Variables**: System-level configuration
- **Configuration Files**: JSON/YAML config files
- **Command Line Options**: Direct specification
- **Default Values**: Sensible defaults for all options

---

## File Functions Analysis

### Core CLI Tools

#### `bin/metadata-generator.mjs`

**Purpose**: Generate standardized metadata templates for different contract categories.

**Key Functions**:

- `generateMetadata(category, type, variables)`: Main metadata generation function
- `generateAllTemplates(category, variables)`: Generate all templates for a category
- `interpolateTemplate(template, variables)`: Variable interpolation in templates
- `saveMetadataToFile(metadata, filename)`: Save metadata to file system

**Template Categories**:

- DeFi: AMM, lending, stablecoin protocols
- DAO: Governance, treasury management
- Infrastructure: Oracles, bridges, RPC providers
- Tokens: ERC-20, ERC-721, governance tokens
- Gaming: NFT games, marketplaces, virtual worlds
- Social: Platforms, messaging, content systems
- RWA: Real estate, commodities, securities
- Privacy: Mixers, security tools, encryption
- Developer: Frameworks, libraries, testing tools
- Analytics: Indexers, dashboards, data platforms

#### `bin/naming-validator.mjs`

**Purpose**: Validate ENS naming conventions and metadata compliance.

**Key Functions**:

- `validateDomain(domain, category, options)`: Main validation function
- `validateFormat(domain)`: Basic domain format validation
- `validateCategory(domain, category, strict)`: Category-specific validation
- `validateMetadata(metadata, category)`: Metadata compliance validation
- `validateQAStandards(metadata, options)`: QA standards validation

**Validation Rules**:

- Format validation: Domain structure, character restrictions
- Category compliance: Pattern matching, naming conventions
- Metadata validation: Required fields, data types
- Cross-reference validation: Consistency checks
- Security validation: Proxy patterns, naming conflicts

#### `bin/subdomain-planner.mjs`

**Purpose**: Plan and organize subdomain structures for protocols.

**Key Functions**:

- `generatePlan(protocol, category, type, variables)`: Main planning function
- `generateSubdomainMetadata(subdomain, baseMetadata, variables)`: Metadata generation
- `generateRegistrationScript(plan)`: Shell script generation
- `generateCrossReferences(plan)`: Cross-reference mapping
- `savePlan(plan, outputPath)`: Plan persistence

**Planning Features**:

- Interactive category selection
- Hierarchical subdomain structures
- Metadata generation for each subdomain
- Registration script creation
- Cross-reference management

#### `bin/security-analyzer.mjs`

**Purpose**: Analyze ENS domain security posture and identify vulnerabilities.

**Key Functions**:

- `analyzeSecurity(domain, options)`: Main security analysis function
- `analyzeFuses(domain)`: Name Wrapper fuse analysis
- `analyzeExpiry(domain)`: Registration expiry validation
- `analyzeResolver(domain)`: Resolver security assessment
- `analyzeVerification(domain)`: Identity verification check

**Security Checks**:

- Fuse analysis: Critical and recommended fuses
- Expiry validation: Registration status and timing
- Resolver security: Vulnerability assessment
- Identity verification: Trust and authenticity
- Overall scoring: Weighted security grade

#### `bin/ens-contract.mjs`

**Purpose**: Perform ENS contract operations including registration and management.

**Key Functions**:

- `register(name, options)`: Subdomain registration
- `setResolver(name, address)`: Resolver configuration
- `setFuses(name, fuses)`: Name Wrapper fuse management
- `setRecord(name, options)`: Record setting operations
- `getInfo(name)`: Domain information retrieval

**Operations Supported**:

- Subdomain registration with ownership
- Resolver address configuration
- Name Wrapper fuse management
- Address, text, and content hash records
- Reverse record management
- Domain information queries

#### `bin/cache-browser.mjs`

**Purpose**: Interactive browser for exploring resolver cache data.

**Key Functions**:

- `loadCache()`: Cache data loading and parsing
- `searchDomains(term)`: Domain search functionality
- `listEntries(page)`: Paginated entry listing
- `showStats()`: Cache statistics and analytics
- `exportData(format)`: Data export capabilities

**Browser Features**:

- Interactive command interface
- Search and filtering capabilities
- Statistical analysis
- Data export (JSON/CSV)
- Detailed entry viewing

### Supporting Tools

#### `tools/prober/probe-multicall.js`

**Purpose**: Probe multiple contracts using multicall for efficient batch operations.

**Key Functions**:

- `probeContract(address, contractType)`: Single contract probing
- `probeContracts(addresses, contractType)`: Batch contract probing
- `displayResults(results)`: Results formatting and display

**Contract Types Supported**:

- ERC-20: Token contracts with standard functions
- ERC-721: NFT contracts with metadata functions
- ENS: ENS resolver and registry contracts

### Core Libraries

#### `src/core/ens-operations.js`

**Purpose**: Core ENS operations and contract interactions.

**Key Functions**:

- ENS contract abstraction
- Transaction management
- Error handling and retry logic
- Network configuration
- Wallet integration

#### `src/core/ens-wallet-connector.js`

**Purpose**: Wallet connection and management for different environments.

**Key Functions**:

- Browser wallet detection
- RPC provider configuration
- Private key management
- Connection state management
- Network switching

#### `src/utils/validation.ts`

**Purpose**: Validation utilities and schema management.

**Key Functions**:

- Schema validation
- Data type checking
- Format validation
- Error message generation
- Validation result formatting

---

## API Usage Documentation

### Programmatic API

#### Metadata Generation API

```javascript
import { generateMetadata, generateAllTemplates } from './bin/metadata-generator.mjs';

// Generate single metadata template
const metadata = generateMetadata('defi', 'amm', {
  protocol: 'Uniswap',
  version: '3',
  tvl: '5000000000',
});

// Generate all templates for a category
const allTemplates = generateAllTemplates('defi', {
  protocol: 'Uniswap',
  version: '3',
});
```

#### Validation API

```javascript
import NamingValidator from './bin/naming-validator.mjs';

const validator = new NamingValidator();

// Validate domain
const result = await validator.validateDomain('uniswap.amm.eth', 'defi', {
  strict: true,
  includeQA: true,
});

// Generate compliance report
const report = validator.generateReport(result);
```

#### Subdomain Planning API

```javascript
import SubdomainPlanner from './bin/subdomain-planner.mjs';

const planner = new SubdomainPlanner();

// Generate subdomain plan
const plan = planner.generatePlan('uniswap', 'defi', 'amm', {
  version: '3',
  tvl: '5000000000',
});

// Save plan to files
planner.savePlan(plan, './output/uniswap-plan');
```

#### Security Analysis API

```javascript
import { ENSecurityAnalyzer } from './bin/security-analyzer.mjs';

const analyzer = new ENSecurityAnalyzer();

// Analyze domain security
const results = await analyzer.analyzeSecurity('vitalik.eth', {
  checkFuses: true,
  checkVerification: true,
});

// Display security report
analyzer.displayReport(results);
```

#### ENS Operations API

```javascript
import { ENSOperations } from './src/core/ens-operations.js';

const ens = new ENSOperations(provider, signer, 'mainnet');

// Register subdomain
const result = await ens.register('router.uniswap.defi.eth', {
  owner: '0x1234...',
  resolver: '0x231b...',
});

// Set resolver
await ens.setResolver('domain.eth', '0x231b...');

// Get domain info
const info = await ens.getInfo('domain.eth');
```

### REST API Endpoints

The toolkit provides HTTP endpoints for web integration:

#### Metadata Generation Endpoint

```
POST /api/metadata/generate
Content-Type: application/json

{
  "category": "defi",
  "type": "amm",
  "variables": {
    "protocol": "Uniswap",
    "version": "3"
  }
}
```

#### Validation Endpoint

```
POST /api/validate/domain
Content-Type: application/json

{
  "domain": "uniswap.amm.eth",
  "category": "defi",
  "options": {
    "strict": true,
    "includeQA": true
  }
}
```

#### Security Analysis Endpoint

```
POST /api/security/analyze
Content-Type: application/json

{
  "domain": "vitalik.eth",
  "options": {
    "checkFuses": true,
    "checkVerification": true
  }
}
```

### Webhook Integration

The toolkit supports webhook notifications for:

- Validation completion
- Security analysis results
- Registration status updates
- Error notifications

```javascript
// Webhook configuration
const webhookConfig = {
  url: 'https://your-app.com/webhooks/ens',
  events: ['validation.complete', 'security.analysis', 'registration.success'],
  secret: 'your-webhook-secret',
};
```

---

## Interconnectivity

### Data Flow Between Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Metadata      │───▶│   Validation    │───▶│   Security      │
│   Generator     │    │   Engine        │    │   Analyzer      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Subdomain     │    │   Cross-Ref      │    │   ENS           │
│   Planner       │    │   Validator      │    │   Operations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Registration  │    │   QA Report     │    │   Cache         │
│   Scripts       │    │   Generator     │    │   Browser       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Shared Data Structures

#### Metadata Schema

```json
{
  "id": "canonical.identifier",
  "org": "organization",
  "protocol": "protocol-name",
  "category": "root-category",
  "role": "contract-role",
  "version": "semantic-version",
  "chainId": 1,
  "addresses": [
    {
      "chainId": 1,
      "address": "0x...",
      "deployedBlock": 12345678
    }
  ],
  "subcategory": "subcategory",
  "ensRoot": "subdomain.cns.eth",
  "variant": "protocol-variant",
  "standards": ["ERC20", "ERC165"],
  "artifacts": {
    "abiHash": "0x...",
    "sourceUri": "https://...",
    "license": "MIT"
  },
  "lifecycle": {
    "status": "deployed",
    "since": "2023-01-15T00:00:00Z",
    "replacedBy": null
  },
  "security": {
    "audits": [
      {
        "firm": "Trail of Bits",
        "date": "2023-01-15",
        "report": "https://...",
        "findings": "2 medium, 1 low"
      }
    ],
    "owners": ["0x..."],
    "upgradeability": "immutable",
    "permissions": ["admin", "pauser"]
  },
  "tags": ["defi", "amm", "uniswap"],
  "subdomains": [
    {
      "label": "router",
      "owner": "0x...",
      "controller": "0x...",
      "resolver": "0x...",
      "records": {}
    }
  ]
}
```

#### Validation Results

```json
{
  "domain": "uniswap.amm.eth",
  "category": "defi",
  "isValid": true,
  "score": 85,
  "maxScore": 100,
  "issues": [],
  "warnings": ["Domain does not follow recommended defi naming pattern"],
  "suggestions": ["Consider using: ^[a-z0-9]+\\.(amm|lending|derivatives)\\.eth$"],
  "metadata": {
    "compliance": {
      "format": true,
      "category": true,
      "metadata": true
    },
    "coverage": {
      "total": 20,
      "compliant": 18,
      "percentage": 90
    }
  },
  "qaValidation": {
    "schema": {
      "isValid": true,
      "score": 95,
      "errors": [],
      "warnings": []
    },
    "crossReference": {
      "isValid": true,
      "score": 80,
      "errors": [],
      "warnings": []
    },
    "overall": {
      "isValid": true,
      "score": 87,
      "errors": [],
      "warnings": []
    }
  }
}
```

#### Security Analysis Results

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
    }
  },
  "recommendations": [
    {
      "priority": "MEDIUM",
      "action": "Consider updating resolver configuration",
      "details": "Wildcard resolver may be overly permissive",
      "command": "ens-contract resolver vitalik.eth --set 0x1234..."
    }
  ]
}
```

### Cross-Component Dependencies

#### Metadata Generator → Validation Engine

- Generated metadata is validated against schemas
- Validation results inform metadata improvements
- Compliance scores affect metadata quality

#### Validation Engine → Security Analyzer

- Validation results inform security analysis
- Security findings affect validation scores
- Combined analysis provides security assessment

#### Subdomain Planner → ENS Operations

- Generated plans create registration scripts
- Registration results update plan status
- Plan execution requires ENS operations

#### Security Analyzer → ENS Operations

- Security recommendations require ENS operations
- Fuse management uses ENS operations
- Security status affects operational decisions

### Data Persistence

#### File-Based Storage

- Metadata files: JSON format with standardized schema
- Configuration files: JSON/YAML format
- Cache files: JSON format for performance
- Log files: Text format for debugging

#### Database Integration

- MongoDB: Document storage for metadata
- PostgreSQL: Relational data for validation results
- Redis: Caching for performance optimization
- Elasticsearch: Search and analytics

#### Cloud Storage

- AWS S3: File storage and backup
- Google Cloud Storage: Distributed file storage
- Azure Blob Storage: Enterprise file storage
- IPFS: Decentralized file storage

---

## Local Tools

### Development Tools

#### `tools/prober/probe-multicall.js`

**Purpose**: Probe multiple contracts using multicall for efficient batch operations.

**Functionality**:

- Batch contract function calls
- Support for ERC-20, ERC-721, and ENS contracts
- Efficient multicall implementation
- Results formatting and export

**Usage**:

```bash
node tools/prober/probe-multicall.js 0x1234... 0x5678... --type erc20 --output results.json
```

#### `tools/prober/lookup-resolver-names.js`

**Purpose**: Lookup ENS names by resolver address.

**Functionality**:

- Resolver-based name discovery
- Batch name resolution
- Results filtering and sorting
- Export capabilities

**Usage**:

```bash
node tools/prober/lookup-resolver-names.js --resolver 0x231b... --output names.json
```

### Analysis Tools

#### `scripts/analyze-resolvers.cjs`

**Purpose**: Analyze resolver addresses and their usage patterns.

**Functionality**:

- Resolver address analysis
- Usage pattern identification
- Performance metrics
- Security assessment

#### `scripts/get-real-resolvers.cjs`

**Purpose**: Extract real resolver addresses from ENS data.

**Functionality**:

- Real resolver discovery
- Address validation
- Usage statistics
- Export capabilities

#### `scripts/query-ens-resolvers.cjs`

**Purpose**: Query ENS resolvers for domain information.

**Functionality**:

- Domain information retrieval
- Resolver status checking
- Performance monitoring
- Error handling

### Migration Tools

#### `bin/migrate-schema.mjs`

**Purpose**: Migrate existing metadata to new schema versions.

**Functionality**:

- Schema version migration
- Data transformation
- Validation during migration
- Rollback capabilities

**Usage**:

```bash
node bin/migrate-schema.mjs metadata.json --schema hierarchical
```

#### `bin/schema-inheritance.mjs`

**Purpose**: Manage schema inheritance and deduplication.

**Functionality**:

- Inheritance chain management
- Field deduplication
- Consistency validation
- Report generation

**Usage**:

```bash
node bin/schema-inheritance.mjs report uniswap.defi.amm.cns.eth
```

### Quality Assurance Tools

#### `bin/qa-report-generator.mjs`

**Purpose**: Generate QA reports for metadata compliance.

**Functionality**:

- Compliance scoring
- Issue identification
- Recommendation generation
- Report formatting

**Usage**:

```bash
node bin/qa-report-generator.mjs --all
```

#### `bin/cross-reference-validator.mjs`

**Purpose**: Validate cross-references between metadata files.

**Functionality**:

- Cross-reference validation
- Consistency checking
- Error reporting
- Fix suggestions

**Usage**:

```bash
node bin/cross-reference-validator.mjs --batch metadata/
```

#### `bin/schema-validator.mjs`

**Purpose**: Validate metadata against JSON schemas.

**Functionality**:

- Schema validation
- Error reporting
- Fix suggestions
- Batch processing

**Usage**:

```bash
node bin/schema-validator.mjs --batch metadata/
```

### Utility Tools

#### `bin/metadata-filler.mjs`

**Purpose**: Fill metadata templates with real contract data.

**Functionality**:

- Template filling
- Data validation
- Error handling
- Progress tracking

**Usage**:

```bash
node bin/metadata-filler.mjs --plan ./plans/uniswap
```

#### `bin/edge-case-validator.mjs`

**Purpose**: Validate edge cases and special scenarios.

**Functionality**:

- Edge case testing
- Special scenario validation
- Error condition testing
- Performance testing

**Usage**:

```bash
node bin/edge-case-validator.mjs --scenarios edge-cases.json
```

### Integration Tools

#### `scripts/generate-cli-docs.mjs`

**Purpose**: Generate CLI documentation from code.

**Functionality**:

- Documentation generation
- Command reference creation
- Example generation
- Format conversion

**Usage**:

```bash
node scripts/generate-cli-docs.mjs
```

#### `scripts/update-domains.js`

**Purpose**: Update domain information and configurations.

**Functionality**:

- Domain information updates
- Configuration management
- Change tracking
- Validation

**Usage**:

```bash
node scripts/update-domains.js --domains domains.json
```

### Testing Tools

#### `test/qa-standards-simple.test.js`

**Purpose**: Simple QA standards testing.

**Functionality**:

- Basic QA validation
- Test case execution
- Result reporting
- Error handling

#### `tests/unit/`

**Purpose**: Unit tests for individual components.

**Functionality**:

- Component testing
- Mock data generation
- Assertion validation
- Coverage reporting

#### `tests/integration/`

**Purpose**: Integration tests for component interactions.

**Functionality**:

- Integration testing
- End-to-end validation
- Performance testing
- Error scenario testing

### Build Tools

#### `scripts/build/`

**Purpose**: Build and deployment scripts.

**Functionality**:

- Project building
- Dependency management
- Asset optimization
- Deployment automation

#### `scripts/deployment/deploy.js`

**Purpose**: Deployment automation.

**Functionality**:

- Environment deployment
- Configuration management
- Health checks
- Rollback capabilities

---

## Conclusion

The ENS Metadata Tools provides a toolkit for managing ENS contract metadata, ensuring standardization, security, and operational efficiency. The modular architecture allows for flexible usage while maintaining consistency across different components.

Key benefits include:

- **Standardization**: Consistent metadata formats and naming conventions
- **Security**: Security analysis and vulnerability identification
- **Automation**: Automated validation, planning, and operations
- **Integration**: Seamless integration between different components
- **Extensibility**: Modular design allows for easy extension and customization

The toolkit is designed for both individual developers and enterprise teams, providing the tools necessary for effective ENS domain and contract management.
