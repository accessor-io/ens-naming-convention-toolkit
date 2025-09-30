# ENS Contract Resolver API

## Overview

The ENS Contract Resolver API is an industry-leading toolkit for resolving ENS names to contract addresses with comprehensive metadata interoperability and advanced discovery features. Built with enterprise-grade standards, it provides:

- **High-performance contract resolution** with caching and rate limiting
- **Comprehensive metadata extraction** for ERC-20 tokens and other contracts
- **JSON Schema compliance** for metadata interoperability
- **Event-driven architecture** for real-time monitoring
- **Batch processing capabilities** for large-scale operations
- **Advanced error handling** and retry mechanisms

## Installation

```bash
npm install ens-metadata-tools
```

## Quick Start

```javascript
import { ENSContractResolver } from 'ens-metadata-tools';

const resolver = new ENSContractResolver({
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  enableCaching: true,
  enableMetrics: true
});

// Resolve a single ENS name
const result = await resolver.resolveContract('uniswap.eth');
console.log(result.contractAddress); // 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984

// Batch resolve multiple names
const batchResult = await resolver.resolveContractsBatch([
  'uniswap.eth',
  'aave.eth',
  'compound.eth'
]);
console.log(batchResult.results); // Array of resolution results
```

## API Reference

### ENSContractResolver Class

#### Constructor Options

```typescript
interface ENSResolverConfig {
  subgraphUrl?: string;        // ENS subgraph endpoint
  rpcUrl: string;             // Ethereum RPC endpoint (required)
  timeout?: number;           // Request timeout in ms (default: 30000)
  retries?: number;           // Retry attempts (default: 3)
  enableCaching?: boolean;    // Enable result caching (default: true)
  cacheExpiry?: number;       // Cache expiry in seconds (default: 3600)
  batchSize?: number;         // Batch processing size (default: 100)
  enableMetrics?: boolean;    // Enable performance metrics (default: true)
  rateLimit?: {
    requestsPerSecond?: number; // Max requests per second (default: 10)
    burstLimit?: number;       // Burst request limit (default: 50)
  };
}
```

#### Methods

##### `resolveContract(ensName: string, options?: Object): Promise<ContractResolutionResult | null>`

Resolve a single ENS name to its contract address.

**Parameters:**
- `ensName` (string): ENS name to resolve (e.g., 'uniswap.eth')
- `options` (Object, optional): Additional resolution options

**Returns:** Promise resolving to `ContractResolutionResult` or `null` if not found

**Example:**
```javascript
const result = await resolver.resolveContract('uniswap.eth');
if (result) {
  console.log(`Contract: ${result.contractAddress}`);
  console.log(`Name: ${result.metadata.name}`);
  console.log(`Symbol: ${result.metadata.symbol}`);
}
```

##### `resolveContractsBatch(ensNames: string[], options?: Object): Promise<BatchResolutionResult>`

Resolve multiple ENS names in batch for improved performance.

**Parameters:**
- `ensNames` (string[]): Array of ENS names to resolve
- `options` (Object, optional): Batch processing options

**Returns:** Promise resolving to `BatchResolutionResult`

**Example:**
```javascript
const names = ['uniswap.eth', 'aave.eth', 'compound.eth'];
const batchResult = await resolver.resolveContractsBatch(names);

console.log(`Processed ${batchResult.summary.total} names`);
console.log(`Found ${batchResult.results.length} contracts`);
console.log(`Performance: ${batchResult.performance.requestsPerSecond} req/s`);
```

##### `getMetrics(): Object`

Get performance metrics and statistics.

**Returns:** Object with request counts, cache statistics, and timing data

##### `clearCache(): void`

Clear the internal cache.

##### `getCacheStats(): Object`

Get cache statistics including size and configuration.

#### Events

The resolver emits events for monitoring and debugging:

- `resolutionComplete`: Emitted when a resolution completes successfully
- `resolutionError`: Emitted when a resolution fails
- `cacheHit`: Emitted when a cached result is returned
- `batchComplete`: Emitted when batch processing completes

**Example:**
```javascript
resolver.on('resolutionComplete', (data) => {
  console.log(`Resolved ${data.ensName} in ${data.duration}ms`);
});

resolver.on('batchComplete', (result) => {
  console.log(`Batch complete: ${result.summary.successful} successful`);
});
```

## Data Schemas

### ContractResolutionResult Schema

```json
{
  "type": "object",
  "properties": {
    "contractAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "The resolved contract address"
    },
    "ensName": {
      "type": "string",
      "pattern": ".*\\.eth$",
      "description": "The ENS name that resolves to this contract"
    },
    "resolverAddress": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "The resolver contract address"
    },
    "network": {
      "type": "string",
      "enum": ["mainnet", "polygon", "arbitrum", "optimism", "goerli"],
      "default": "mainnet"
    },
    "isVerified": {
      "type": "boolean",
      "description": "Whether the contract is verified on block explorer"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "symbol": { "type": "string" },
        "decimals": { "type": "integer", "minimum": 0, "maximum": 18 },
        "description": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "audit": {
          "type": "object",
          "properties": {
            "status": { "type": "string" },
            "firms": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "resolverInfo": {
      "type": "object",
      "properties": {
        "type": { "type": "string" },
        "version": { "type": "string" },
        "supportsWildcards": { "type": "boolean" },
        "address": { "type": "string" }
      }
    },
    "timestamps": {
      "type": "object",
      "properties": {
        "resolvedAt": { "type": "string", "format": "date-time" },
        "lastVerified": { "type": "string", "format": "date-time" }
      }
    }
  },
  "required": ["contractAddress", "ensName", "resolverAddress"]
}
```

### BatchResolutionResult Schema

```json
{
  "type": "object",
  "properties": {
    "results": {
      "type": "array",
      "items": { "$ref": "#/definitions/ContractResolutionResult" }
    },
    "summary": {
      "type": "object",
      "properties": {
        "total": { "type": "integer" },
        "successful": { "type": "integer" },
        "failed": { "type": "integer" },
        "errors": { "type": "array", "items": { "type": "string" } }
      }
    },
    "performance": {
      "type": "object",
      "properties": {
        "totalTime": { "type": "number" },
        "averageTime": { "type": "number" },
        "requestsPerSecond": { "type": "number" }
      }
    }
  },
  "definitions": {
    "ContractResolutionResult": { /* ContractResolutionResult schema */ }
  }
}
```

## Examples

### Basic Usage

```javascript
import { ENSContractResolver } from 'ens-metadata-tools';

const resolver = new ENSContractResolver({
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
});

// Resolve a single contract
const uniswap = await resolver.resolveContract('uniswap.eth');
console.log(uniswap.contractAddress); // 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
```

### Batch Processing

```javascript
const names = [
  'uniswap.eth',
  'aave.eth',
  'compound.eth',
  'makerdao.eth'
];

const batchResult = await resolver.resolveContractsBatch(names);
console.log(`Found ${batchResult.results.length} contracts`);
```

### Event Monitoring

```javascript
resolver.on('resolutionComplete', (data) => {
  console.log(`✅ ${data.ensName} -> ${data.result.contractAddress}`);
});

resolver.on('batchComplete', (result) => {
  console.log(`Batch complete: ${result.summary.successful}/${result.summary.total} successful`);
});
```

### Advanced Configuration

```javascript
const resolver = new ENSContractResolver({
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  enableCaching: true,
  cacheExpiry: 7200, // 2 hours
  batchSize: 50,
  rateLimit: {
    requestsPerSecond: 5,
    burstLimit: 20
  }
});
```

## Performance Tuning

### Caching
- Enable caching for frequently accessed names
- Adjust `cacheExpiry` based on your update frequency needs
- Monitor cache hit rates for optimization

### Rate Limiting
- Configure `requestsPerSecond` based on your RPC provider limits
- Use `burstLimit` for handling traffic spikes
- Monitor metrics to identify bottlenecks

### Batch Processing
- Use `resolveContractsBatch()` for multiple names
- Adjust `batchSize` based on your performance requirements
- Monitor `requestsPerSecond` metrics

## Error Handling

```javascript
try {
  const result = await resolver.resolveContract('invalid-name.eth');
  if (!result) {
    console.log('Name not found or not a contract');
  }
} catch (error) {
  console.error('Resolution failed:', error.message);
}
```

## Integration Examples

### With Web3 Libraries

```javascript
import { Web3 } from 'web3';
import { ENSContractResolver } from 'ens-metadata-tools';

const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_PROJECT_ID');
const resolver = new ENSContractResolver({ rpcUrl: web3.provider.url });

// Use results with Web3
const result = await resolver.resolveContract('uniswap.eth');
if (result) {
  const contract = new web3.eth.Contract(ERC20_ABI, result.contractAddress);
  const balance = await contract.methods.balanceOf(userAddress).call();
}
```

### With Ethers.js

```javascript
import { ethers } from 'ethers';
import { ENSContractResolver } from 'ens-metadata-tools';

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID');
const resolver = new ENSContractResolver({ rpcUrl: provider.connection.url });

// Use with ethers.js contracts
const result = await resolver.resolveContract('aave.eth');
if (result) {
  const contract = new ethers.Contract(result.contractAddress, ERC20_ABI, provider);
  const name = await contract.name();
}
```

## Testing

```bash
# Run contract discovery (checks if addresses are contracts)
cd prober
node contract-discovery.js --help

# Example: read addresses from stdin
printf "0x00000000219ab540356cBB839Cbe05303d7705Fa\n0x0000000000000000000000000000000000000000\n" | node contract-discovery.js --stdin --rpc https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Test individual components
node test-ens-schema.js
node test-contract-domains.js
node test-resolver-query.js
```

## Configuration Files

Create configuration files for different environments:

```json
// config/development.json
{
  "rpcUrl": "http://localhost:8545",
  "enableCaching": true,
  "cacheExpiry": 300,
  "batchSize": 10,
  "enableMetrics": true
}
```

## Monitoring and Metrics

```javascript
// Get performance metrics
const metrics = resolver.getMetrics();
console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
console.log(`Average response time: ${metrics.averageRequestTime}ms`);

// Monitor events
resolver.on('resolutionError', (data) => {
  // Log errors for monitoring
  monitoring.log('ens_resolution_error', data);
});
```

## Best Practices

1. **Use batch processing** for multiple names
2. **Enable caching** for production environments
3. **Configure rate limiting** based on your RPC provider limits
4. **Monitor metrics** to identify performance bottlenecks
5. **Handle errors gracefully** with proper fallbacks
6. **Use proper TypeScript types** for better development experience

## Troubleshooting

### Common Issues

**"Resolver not found"**
- Ensure the ENS name exists and has a resolver set
- Check if the name is registered and not expired

**"Contract verification failed"**
- Some contracts may not be verified on block explorers
- This is normal for private or newer contracts

**"Rate limit exceeded"**
- Configure appropriate rate limits in your config
- Consider upgrading your RPC provider plan

**"Cache not working"**
- Ensure `enableCaching: true` in configuration
- Check cache expiry settings

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility

## License

MIT License - see LICENSE file for details.
