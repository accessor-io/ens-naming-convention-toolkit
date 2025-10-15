# Prober Tools Reference

## Overview

This document provides a technical analysis of the functions and functionality in the `tools/prober/` directory tools.

## Multicall Prober

### `tools/prober/probe-multicall.js`

**Purpose**: Probe multiple contracts using multicall for efficient batch operations.

**Key Functions**:

#### `probeContract(address, contractType)`

- **Purpose**: Single contract probing
- **Parameters**:
  - `address` (string): Contract address to probe
  - `contractType` (string): Contract type (erc20, erc721, ens)
- **Returns**: Contract probe result
- **Logic**: Probes contract functions using multicall, returns metadata and function results

#### `probeContracts(addresses, contractType)`

- **Purpose**: Batch contract probing
- **Parameters**:
  - `addresses` (array): Array of contract addresses
  - `contractType` (string): Contract type
- **Returns**: Array of contract probe results
- **Logic**: Probes multiple contracts efficiently using multicall batching

#### `displayResults(results)`

- **Purpose**: Results formatting and display
- **Parameters**:
  - `results` (array): Probe results to display
- **Returns**: Formatted output string
- **Logic**: Formats and displays probe results in human-readable format

#### `exportResults(results, format)`

- **Purpose**: Results export
- **Parameters**:
  - `results` (array): Results to export
  - `format` (string): Export format (json, csv, html)
- **Returns**: Exported data
- **Logic**: Exports results in specified format

**Contract Types Supported**:

- **ERC-20**: Token contracts with standard functions
  - `name()` - Token name
  - `symbol()` - Token symbol
  - `decimals()` - Token decimals
  - `totalSupply()` - Total supply
  - `balanceOf(address)` - Balance of address
  - `transfer(address,uint256)` - Transfer tokens
  - `approve(address,uint256)` - Approve spending
  - `allowance(address,address)` - Check allowance

- **ERC-721**: NFT contracts with metadata functions
  - `name()` - Collection name
  - `symbol()` - Collection symbol
  - `totalSupply()` - Total supply
  - `tokenURI(uint256)` - Token metadata URI
  - `ownerOf(uint256)` - Owner of token
  - `transferFrom(address,address,uint256)` - Transfer token
  - `approve(address,uint256)` - Approve token
  - `setApprovalForAll(address,bool)` - Set approval for all

- **ENS**: ENS resolver and registry contracts
  - `owner(bytes32)` - Domain owner
  - `resolver(bytes32)` - Domain resolver
  - `ttl(bytes32)` - Domain TTL
  - `setOwner(bytes32,address)` - Set owner
  - `setResolver(bytes32,address)` - Set resolver
  - `setTTL(bytes32,uint256)` - Set TTL

**Usage Examples**:

```bash
# Single contract probe
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20

# Multiple contract probe
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 0x1234... --type erc20

# Batch probe with output
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 --output results.json
```

**Expected Output**:

```
=== Contract Probe Results ===

Address: 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984
Type: ERC-20 Token
Network: Mainnet

Function Results:
  name(): "Uniswap Token"
  symbol(): "UNI"
  decimals(): 18
  totalSupply(): "1000000000000000000000000000"

State Variables:
  _name: "Uniswap Token"
  _symbol: "UNI"
  _decimals: 18
  _totalSupply: "1000000000000000000000000000"

Gas Usage:
  name(): 2,300 gas
  symbol(): 2,300 gas
  decimals(): 2,100 gas
  totalSupply(): 2,100 gas
```

## Resolver Name Lookup

### `tools/prober/lookup-resolver-names.js`

**Purpose**: Lookup ENS names by resolver address.

**Key Functions**:

#### `lookupNamesByResolver(resolver, options)`

- **Purpose**: Main lookup function
- **Parameters**:
  - `resolver` (string): Resolver address to lookup
  - `options` (object): Lookup options
- **Returns**: Lookup result object
- **Logic**: Discovers ENS names using the specified resolver address

#### `batchLookup(resolvers, options)`

- **Purpose**: Batch lookup
- **Parameters**:
  - `resolvers` (array): Array of resolver addresses
  - `options` (object): Lookup options
- **Returns**: Array of lookup results
- **Logic**: Performs batch lookup for multiple resolvers

#### `filterResults(results, criteria)`

- **Purpose**: Results filtering
- **Parameters**:
  - `results` (array): Lookup results
  - `criteria` (object): Filter criteria
- **Returns**: Filtered results
- **Logic**: Filters results based on specified criteria

#### `exportResults(results, format)`

- **Purpose**: Results export
- **Parameters**:
  - `results` (array): Results to export
  - `format` (string): Export format (json, csv, html)
- **Returns**: Exported data
- **Logic**: Exports results in specified format

**Usage Examples**:

```bash
# Single resolver lookup
node tools/prober/lookup-resolver-names.js --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15

# Batch resolver lookup
node tools/prober/lookup-resolver-names.js --resolvers resolvers.txt

# Lookup with output
node tools/prober/lookup-resolver-names.js --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15 --output names.json
```

**Expected Output**:

```json
{
  "resolver": "0x231b87e9f02df89ec136656ea28f2e0f443f9f15",
  "names": ["example.eth", "test.eth"],
  "count": 2,
  "metadata": {
    "totalDomains": 2,
    "activeDomains": 2,
    "expiredDomains": 0
  }
}
```

## Contract Analysis Tools

### `tools/prober/analyze-contract.js`

**Purpose**: Analyze contract functionality and metadata.

**Key Functions**:

#### `analyzeContract(address, options)`

- **Purpose**: Main contract analysis
- **Parameters**:
  - `address` (string): Contract address
  - `options` (object): Analysis options
- **Returns**: Analysis result
- **Logic**: Analyzes contract functionality, metadata, and compliance

#### `extractMetadata(address)`

- **Purpose**: Metadata extraction
- **Parameters**:
  - `address` (string): Contract address
- **Returns**: Extracted metadata
- **Logic**: Extracts metadata from contract functions and events

#### `validateCompliance(address, standard)`

- **Purpose**: Compliance validation
- **Parameters**:
  - `address` (string): Contract address
  - `standard` (string): Standard to validate against
- **Returns**: Compliance result
- **Logic**: Validates contract compliance with specified standard

#### `generateReport(analysis)`

- **Purpose**: Report generation
- **Parameters**:
  - `analysis` (object): Analysis result
- **Returns**: Analysis report
- **Logic**: Generates analysis report with findings and recommendations

**Usage Examples**:

```bash
# Contract analysis
node tools/prober/analyze-contract.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984

# Analysis with standard validation
node tools/prober/analyze-contract.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --standard ERC20

# Analysis with output
node tools/prober/analyze-contract.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --output analysis.json
```

## Network Analysis Tools

### `tools/prober/analyze-network.js`

**Purpose**: Analyze network performance and contract distribution.

**Key Functions**:

#### `analyzeNetwork(options)`

- **Purpose**: Main network analysis
- **Parameters**:
  - `options` (object): Analysis options
- **Returns**: Network analysis result
- **Logic**: Analyzes network performance, contract distribution, and usage patterns

#### `measurePerformance(endpoints)`

- **Purpose**: Performance measurement
- **Parameters**:
  - `endpoints` (array): RPC endpoints to measure
- **Returns**: Performance metrics
- **Logic**: Measures performance of different RPC endpoints

#### `analyzeDistribution(contracts)`

- **Purpose**: Contract distribution analysis
- **Parameters**:
  - `contracts` (array): Contract addresses to analyze
- **Returns**: Distribution analysis
- **Logic**: Analyzes distribution of contracts across network

#### `generateNetworkReport(analysis)`

- **Purpose**: Network report generation
- **Parameters**:
  - `analysis` (object): Network analysis result
- **Returns**: Network report
- **Logic**: Generates network analysis report

**Usage Examples**:

```bash
# Network analysis
node tools/prober/analyze-network.js

# Performance measurement
node tools/prober/analyze-network.js --measure-performance

# Distribution analysis
node tools/prober/analyze-network.js --analyze-distribution
```

## Security Analysis Tools

### `tools/prober/analyze-security.js`

**Purpose**: Analyze contract security and identify vulnerabilities.

**Key Functions**:

#### `analyzeSecurity(address, options)`

- **Purpose**: Main security analysis
- **Parameters**:
  - `address` (string): Contract address
  - `options` (object): Security analysis options
- **Returns**: Security analysis result
- **Logic**: Analyzes contract security, identifies vulnerabilities, and provides recommendations

#### `checkVulnerabilities(address)`

- **Purpose**: Vulnerability checking
- **Parameters**:
  - `address` (string): Contract address
- **Returns**: Vulnerability report
- **Logic**: Checks for known vulnerabilities and security issues

#### `analyzeAccessControl(address)`

- **Purpose**: Access control analysis
- **Parameters**:
  - `address` (string): Contract address
- **Returns**: Access control analysis
- **Logic**: Analyzes access control mechanisms and permissions

#### `generateSecurityReport(analysis)`

- **Purpose**: Security report generation
- **Parameters**:
  - `analysis` (object): Security analysis result
- **Returns**: Security report
- **Logic**: Generates security analysis report with findings and recommendations

**Usage Examples**:

```bash
# Security analysis
node tools/prober/analyze-security.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984

# Vulnerability check
node tools/prober/analyze-security.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --check-vulnerabilities

# Access control analysis
node tools/prober/analyze-security.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --analyze-access-control
```

## Data Export Tools

### `tools/prober/export-data.js`

**Purpose**: Export probe results and analysis data.

**Key Functions**:

#### `exportResults(results, format, options)`

- **Purpose**: Main export function
- **Parameters**:
  - `results` (array): Results to export
  - `format` (string): Export format (json, csv, html, xml)
  - `options` (object): Export options
- **Returns**: Exported data
- **Logic**: Exports results in specified format with options

#### `exportToJSON(results, options)`

- **Purpose**: JSON export
- **Parameters**:
  - `results` (array): Results to export
  - `options` (object): Export options
- **Returns**: JSON data
- **Logic**: Exports results to JSON format

#### `exportToCSV(results, options)`

- **Purpose**: CSV export
- **Parameters**:
  - `results` (array): Results to export
  - `options` (object): Export options
- **Returns**: CSV data
- **Logic**: Exports results to CSV format

#### `exportToHTML(results, options)`

- **Purpose**: HTML export
- **Parameters**:
  - `results` (array): Results to export
  - `options` (object): Export options
- **Returns**: HTML data
- **Logic**: Exports results to HTML format

**Usage Examples**:

```bash
# Export to JSON
node tools/prober/export-data.js --input results.json --format json --output exported.json

# Export to CSV
node tools/prober/export-data.js --input results.json --format csv --output exported.csv

# Export to HTML
node tools/prober/export-data.js --input results.json --format html --output exported.html
```

## Configuration Files

### `tools/prober/config.json`

**Purpose**: Configuration file for prober tools.

**Configuration Options**:

```json
{
  "network": {
    "name": "mainnet",
    "chainId": 1,
    "rpcUrl": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    "timeout": 30000
  },
  "multicall": {
    "address": "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
    "gasLimit": 1000000
  },
  "contracts": {
    "ensRegistry": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    "ensResolver": "0x231b87e9f02df89ec136656ea28f2e0f443f9f15",
    "nameWrapper": "0x0635513f179D50A207757E05759CbD106d7dFcE8"
  },
  "probe": {
    "batchSize": 10,
    "retryAttempts": 3,
    "retryDelay": 1000
  },
  "export": {
    "defaultFormat": "json",
    "includeMetadata": true,
    "includeGasUsage": true
  }
}
```

### `tools/prober/contracts.json`

**Purpose**: Contract definitions and ABIs for prober tools.

**Contract Definitions**:

```json
{
  "erc20": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{ "name": "", "type": "string" }],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "type": "function"
      }
    ],
    "functions": ["name", "symbol", "decimals", "totalSupply"]
  },
  "erc721": {
    "abi": [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{ "name": "", "type": "string" }],
        "type": "function"
      }
    ],
    "functions": ["name", "symbol", "totalSupply", "tokenURI"]
  }
}
```

## Integration Patterns

### Batch Processing

```bash
# Batch contract probing
node tools/prober/probe-multicall.js --batch contracts.txt --type erc20 --output batch-results.json

# Batch resolver lookup
node tools/prober/lookup-resolver-names.js --batch resolvers.txt --output batch-names.json
```

### Pipeline Processing

```bash
# Probe → Analyze → Export pipeline
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 | \
node tools/prober/analyze-contract.js --standard ERC20 | \
node tools/prober/export-data.js --format json --output final-results.json
```

### Parallel Processing

```bash
# Parallel probing
node tools/prober/probe-multicall.js 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 --type erc20 & \
node tools/prober/probe-multicall.js 0x1234... --type erc721 & \
wait
```

## Error Handling

### Common Errors

1. **Contract Not Found**: Contract does not exist at address
2. **Network Issues**: Cannot connect to blockchain network
3. **Function Not Found**: Function does not exist on contract
4. **Multicall Failures**: Multicall contract interaction failures

### Error Recovery

- Retry mechanisms for network failures
- Fallback to individual calls if multicall fails
- Graceful degradation for missing functions
- Comprehensive error reporting

## Performance Considerations

### Optimization Strategies

- Batch processing for multiple contracts
- Multicall for efficient function calls
- Caching for repeated operations
- Parallel processing for independent operations

### Resource Management

- Connection pooling for RPC endpoints
- Memory management for large datasets
- Rate limiting for API calls
- Timeout handling for long operations

## Next Steps

- [Scripts](scripts.md) - Scripts in `scripts/` directory
- [Bin Tools](bin-tools.md) - Tools in `bin/` directory
- [API Documentation](../API/) - Programmatic usage
- [Interconnectivity](../Interconnectivity.md) - How tools work together
