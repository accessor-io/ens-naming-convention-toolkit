# Architecture

## Overview

This document describes the architecture of the ENS Metadata Tools system, including system design, data flow, configuration management, and error handling patterns.

## System Design

### Layered Architecture

The system follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   CLI       │ │   Web UI    │ │   API       │          │
│  │ Interface   │ │ Interface   │ │ Interface   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Metadata  │ │  Validation │ │  Planning   │          │
│  │  Generator  │ │   Engine    │ │   Engine    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Security  │ │   ENS       │ │   Cache     │          │
│  │   Analyzer  │ │ Operations  │ │ Management  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Metadata  │ │   Schema    │ │   Template  │          │
│  │   Domain    │ │   Domain    │ │   Domain    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   File      │ │   Network   │ │   Database  │          │
│  │   System    │ │   Layer     │ │   Layer     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Core Components

**Metadata Generator**

- Template engine for metadata generation
- Variable interpolation system
- Schema validation integration
- Output format management

**Validation Engine**

- Domain format validation
- Category-specific validation
- Metadata compliance checking
- QA standards validation

**Planning Engine**

- Subdomain hierarchy generation
- Registration script creation
- Cross-reference management
- Template-based planning

**Security Analyzer**

- Name Wrapper fuse analysis
- Registration expiry validation
- Resolver security assessment
- Identity verification checking

**ENS Operations**

- Contract interaction layer
- Transaction management
- Gas optimization
- Error handling

**Cache Management**

- Data caching layer
- Performance optimization
- Data persistence
- Cache invalidation

#### Supporting Components

**Schema Management**

- JSON schema validation
- Schema versioning
- Schema inheritance
- Schema migration

**Template Management**

- Template storage
- Template versioning
- Template inheritance
- Template validation

**Configuration Management**

- Environment configuration
- User preferences
- System settings
- Runtime configuration

## Data Flow Architecture

### 1. Metadata Generation Flow

```
User Input → Template Selection → Variable Interpolation → Schema Validation → Output Generation
     ↓              ↓                    ↓                    ↓                ↓
Category/Type → Template Engine → Variable Engine → Validation Engine → File System
     ↓              ↓                    ↓                    ↓                ↓
Options → Template Loader → Interpolator → Schema Checker → Output Writer
```

**Components Involved**:

- `metadata-generator.mjs` - Main generation logic
- `template-engine.js` - Template processing
- `variable-engine.js` - Variable interpolation
- `schema-validator.mjs` - Schema validation
- `file-operations.ts` - File system operations

**Data Transformations**:

1. User input → Template selection
2. Template + Variables → Interpolated template
3. Interpolated template → Validated metadata
4. Validated metadata → File output

### 2. Validation Flow

```
Domain Input → Format Validation → Category Validation → Metadata Validation → QA Validation → Report Generation
     ↓              ↓                    ↓                    ↓                ↓                ↓
Domain String → Format Checker → Category Rules → Metadata Schema → QA Standards → Report Generator
     ↓              ↓                    ↓                    ↓                ↓                ↓
Validation → Issue Detection → Compliance Check → Quality Score → Report Output
```

**Components Involved**:

- `naming-validator.mjs` - Main validation logic
- `format-validator.js` - Format validation
- `category-validator.js` - Category validation
- `metadata-validator.js` - Metadata validation
- `qa-validator.js` - QA validation
- `report-generator.js` - Report generation

**Data Transformations**:

1. Domain string → Format validation
2. Format validation → Category validation
3. Category validation → Metadata validation
4. Metadata validation → QA validation
5. QA validation → Report generation

### 3. Subdomain Planning Flow

```
Protocol Info → Category Selection → Template Loading → Hierarchy Generation → Script Generation → Metadata Generation
     ↓              ↓                    ↓                    ↓                ↓                ↓
Protocol Data → Category Rules → Planning Template → Subdomain Tree → Registration Script → Subdomain Metadata
     ↓              ↓                    ↓                    ↓                ↓                ↓
Customization → Rule Application → Structure Creation → Script Creation → Metadata Creation
```

**Components Involved**:

- `subdomain-planner.mjs` - Main planning logic
- `category-selector.js` - Category selection
- `template-loader.js` - Template loading
- `hierarchy-generator.js` - Hierarchy generation
- `script-generator.js` - Script generation
- `metadata-generator.mjs` - Metadata generation

**Data Transformations**:

1. Protocol info → Category selection
2. Category selection → Template loading
3. Template loading → Hierarchy generation
4. Hierarchy generation → Script generation
5. Script generation → Metadata generation

### 4. Security Analysis Flow

```
Domain Input → Fuse Analysis → Expiry Check → Resolver Analysis → Verification Check → Report Generation
     ↓              ↓              ↓              ↓                ↓                ↓
Domain String → Fuse Checker → Expiry Validator → Resolver Scanner → Verification → Security Report
     ↓              ↓              ↓              ↓                ↓                ↓
Security Data → Fuse Status → Expiry Status → Resolver Status → Verification Status → Recommendations
```

**Components Involved**:

- `security-analyzer.mjs` - Main security analysis
- `fuse-analyzer.js` - Fuse analysis
- `expiry-checker.js` - Expiry validation
- `resolver-analyzer.js` - Resolver analysis
- `verification-checker.js` - Verification checking
- `report-generator.js` - Report generation

**Data Transformations**:

1. Domain string → Fuse analysis
2. Fuse analysis → Expiry check
3. Expiry check → Resolver analysis
4. Resolver analysis → Verification check
5. Verification check → Report generation

## Configuration Management

### Configuration Hierarchy

The system uses a hierarchical configuration approach:

```
1. Command Line Options (Highest Priority)
2. Environment Variables
3. Configuration Files
4. Default Values (Lowest Priority)
```

### Configuration Sources

#### 1. Command Line Options

```bash
ens-validator uniswap.eth defi --strict --qa --output report.json
```

#### 2. Environment Variables

```bash
export ENS_REGISTRY_ADDRESS="0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
export ETH_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
export OUTPUT_DIR="./output"
export VERBOSE=true
```

#### 3. Configuration Files

```json
{
  "network": "mainnet",
  "strict": false,
  "includeQA": true,
  "outputDir": "./output",
  "templates": {
    "defi": "./templates/defi.json",
    "dao": "./templates/dao.json"
  },
  "rpc": {
    "url": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    "timeout": 30000
  },
  "validation": {
    "strict": false,
    "includeQA": true,
    "maxIssues": 10
  },
  "security": {
    "checkFuses": true,
    "checkVerification": true,
    "checkExpiry": true
  }
}
```

#### 4. Default Values

```javascript
const DEFAULT_CONFIG = {
  network: 'mainnet',
  strict: false,
  includeQA: false,
  outputDir: './output',
  verbose: false,
  timeout: 30000,
};
```

### Configuration Loading

The system loads configuration in the following order:

1. **Load Defaults**: Set default configuration values
2. **Load File**: Load configuration from file if present
3. **Load Environment**: Override with environment variables
4. **Load CLI**: Override with command line options
5. **Validate**: Validate final configuration
6. **Apply**: Apply configuration to system

## Error Handling Architecture

### Error Classification

#### 1. System Errors

- **Network Errors**: Connection failures, timeouts
- **File System Errors**: File not found, permission denied
- **Memory Errors**: Out of memory, allocation failures
- **Configuration Errors**: Invalid configuration, missing values

#### 2. Validation Errors

- **Format Errors**: Invalid domain format, malformed data
- **Schema Errors**: Schema validation failures
- **Compliance Errors**: Standards compliance failures
- **Cross-Reference Errors**: Inconsistent references

#### 3. Business Logic Errors

- **Domain Errors**: Domain not found, invalid domain
- **Contract Errors**: Contract interaction failures
- **Security Errors**: Security validation failures
- **Operation Errors**: Operation execution failures

### Error Handling Patterns

#### 1. Fail-Fast Pattern

```javascript
try {
  const result = await validateDomain(domain);
  if (!result.isValid) {
    throw new ValidationError('Domain validation failed');
  }
  return result;
} catch (error) {
  logger.error('Validation failed', error);
  throw error;
}
```

#### 2. Error Accumulation Pattern

```javascript
const errors = [];
const warnings = [];

try {
  const formatResult = validateFormat(domain);
  if (!formatResult.isValid) {
    errors.push(...formatResult.errors);
  }
} catch (error) {
  errors.push(error);
}

try {
  const categoryResult = validateCategory(domain, category);
  if (!categoryResult.isValid) {
    errors.push(...categoryResult.errors);
  }
} catch (error) {
  errors.push(error);
}

return { errors, warnings };
```

#### 3. Error Recovery Pattern

```javascript
let result;
let retries = 3;

while (retries > 0) {
  try {
    result = await performOperation();
    break;
  } catch (error) {
    if (error.isRetryable && retries > 1) {
      retries--;
      await sleep(1000);
      continue;
    }
    throw error;
  }
}

return result;
```

#### 4. Error Transformation Pattern

```javascript
try {
  const result = await performOperation();
  return result;
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    logger.warn('Network error, using cached data');
    return getCachedData();
  }
  throw error;
}
```

### Error Propagation

#### 1. Error Context

```javascript
class ValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'ValidationError';
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}
```

#### 2. Error Logging

```javascript
function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: error.message,
    stack: error.stack,
    context: context,
  };

  logger.error(logEntry);
}
```

#### 3. Error Reporting

```javascript
function reportError(error, context = {}) {
  const report = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context: context,
    timestamp: new Date().toISOString(),
  };

  return report;
}
```

## Performance Architecture

### Caching Strategy

#### 1. Memory Caching

```javascript
class MemoryCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

#### 2. File Caching

```javascript
class FileCache {
  constructor(cacheDir = './cache') {
    this.cacheDir = cacheDir;
  }

  async get(key) {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    if (await fs.exists(filePath)) {
      return JSON.parse(await fs.readFile(filePath, 'utf8'));
    }
    return null;
  }

  async set(key, value) {
    const filePath = path.join(this.cacheDir, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  }
}
```

#### 3. Network Caching

```javascript
class NetworkCache {
  constructor(ttl = 300000) {
    // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.value;
    }
    return null;
  }

  set(key, value) {
    this.cache.set(key, {
      value: value,
      timestamp: Date.now(),
    });
  }
}
```

### Optimization Strategies

#### 1. Lazy Loading

```javascript
class LazyLoader {
  constructor(loader) {
    this.loader = loader;
    this.cache = new Map();
  }

  async load(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const value = await this.loader(key);
    this.cache.set(key, value);
    return value;
  }
}
```

#### 2. Batch Processing

```javascript
class BatchProcessor {
  constructor(batchSize = 10) {
    this.batchSize = batchSize;
    this.queue = [];
  }

  async add(item) {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      await this.processBatch();
    }
  }

  async processBatch() {
    const batch = this.queue.splice(0, this.batchSize);
    await this.processItems(batch);
  }
}
```

#### 3. Parallel Processing

```javascript
class ParallelProcessor {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.semaphore = new Semaphore(concurrency);
  }

  async process(items, processor) {
    const promises = items.map(async (item) => {
      await this.semaphore.acquire();
      try {
        return await processor(item);
      } finally {
        this.semaphore.release();
      }
    });

    return Promise.all(promises);
  }
}
```

## Security Architecture

### Security Layers

#### 1. Input Validation

```javascript
class InputValidator {
  validateDomain(domain) {
    if (!domain || typeof domain !== 'string') {
      throw new ValidationError('Domain must be a non-empty string');
    }

    if (!/^[a-z0-9.-]+\.eth$/i.test(domain)) {
      throw new ValidationError('Invalid domain format');
    }

    return true;
  }

  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new ValidationError('Address must be a non-empty string');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new ValidationError('Invalid Ethereum address format');
    }

    return true;
  }
}
```

#### 2. Output Sanitization

```javascript
class OutputSanitizer {
  sanitizeMetadata(metadata) {
    const sanitized = { ...metadata };

    // Remove sensitive fields
    delete sanitized.privateKey;
    delete sanitized.seed;
    delete sanitized.mnemonic;

    // Sanitize strings
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeString(sanitized[key]);
      }
    });

    return sanitized;
  }

  sanitizeString(str) {
    return str.replace(/[<>\"'&]/g, (match) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[match];
    });
  }
}
```

#### 3. Access Control

```javascript
class AccessController {
  constructor(permissions) {
    this.permissions = permissions;
  }

  checkPermission(user, resource, action) {
    const userPermissions = this.permissions[user] || [];
    const requiredPermission = `${resource}:${action}`;

    return userPermissions.includes(requiredPermission);
  }

  requirePermission(user, resource, action) {
    if (!this.checkPermission(user, resource, action)) {
      throw new AccessError('Insufficient permissions');
    }
  }
}
```

### Security Monitoring

#### 1. Audit Logging

```javascript
class AuditLogger {
  logOperation(user, operation, resource, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: user,
      operation: operation,
      resource: resource,
      result: result,
      ip: this.getClientIP(),
      userAgent: this.getUserAgent(),
    };

    this.writeLog(logEntry);
  }
}
```

#### 2. Security Metrics

```javascript
class SecurityMetrics {
  constructor() {
    this.metrics = {
      failedValidations: 0,
      securityWarnings: 0,
      accessDenied: 0,
      suspiciousActivity: 0,
    };
  }

  recordSecurityEvent(event, severity) {
    this.metrics[event]++;

    if (severity === 'HIGH') {
      this.alertSecurityTeam(event);
    }
  }
}
```

## Monitoring and Observability

### Logging Architecture

#### 1. Structured Logging

```javascript
class StructuredLogger {
  constructor(level = 'INFO') {
    this.level = level;
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };
  }

  log(level, message, context = {}) {
    if (this.levels[level] <= this.levels[this.level]) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        context: context,
        pid: process.pid,
        hostname: os.hostname(),
      };

      console.log(JSON.stringify(logEntry));
    }
  }
}
```

#### 2. Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(name) {
    this.metrics.set(name, {
      start: Date.now(),
      end: null,
      duration: null,
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = Date.now();
      metric.duration = metric.end - metric.start;

      this.recordMetric(name, metric.duration);
    }
  }

  recordMetric(name, value) {
    // Send to monitoring system
    console.log(`METRIC: ${name}=${value}ms`);
  }
}
```

### Health Checks

#### 1. System Health

```javascript
class HealthChecker {
  async checkHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkNetwork(),
      this.checkFileSystem(),
      this.checkMemory(),
    ]);

    const results = checks.map((check, index) => ({
      name: ['database', 'network', 'filesystem', 'memory'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason,
    }));

    return {
      overall: results.every((r) => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      checks: results,
    };
  }
}
```

## Next Steps

- [Interconnectivity](Interconnectivity.md) - Component relationships
- [Results and Workflows](Results-and-Workflows.md) - Workflow patterns
- [Tools](Tools.md) - Local tools and utilities
- [API Documentation](API/) - Programmatic usage
