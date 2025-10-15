# ens-cache-browser

Interactive browser for exploring ENS resolver cache data and metadata.

## Purpose

The `ens-cache-browser` command provides an interactive interface for browsing, searching, and analyzing ENS resolver cache data, including domain information, metadata, and cross-references.

## Usage

```bash
ens-cache-browser [options]
```

## Options

- `--domain <domain>` - Focus on specific domain
- `--list` - List all cached domains
- `--category <category>` - Filter by category
- `--search <term>` - Search for specific term
- `--output <file>` - Export data to file
- `--format <format>` - Export format (json, csv, html)
- `--interactive` - Interactive mode (default)
- `--verbose` - Verbose output with detailed information

## Examples

### Interactive Browser

```bash
ens-cache-browser --interactive
```

**Expected Output**:

```
ENS Cache Browser - Interactive Mode
════════════════════════════════════════════════════════════════════

Available Commands:
  list                    - List all cached domains
  search <term>          - Search for domains
  domain <name>          - Show domain details
  category <cat>         - Filter by category
  stats                  - Show cache statistics
  export <format>        - Export data
  help                   - Show help
  quit                   - Exit browser

> list
```

**Desired Outcome**: Provide interactive interface for cache exploration.

**How to Use Results**: Use interactive commands to explore cache data efficiently.

### Domain-Specific Browser

```bash
ens-cache-browser --domain uniswap.eth --verbose
```

**Expected Output**:

```
Domain Details: uniswap.eth
════════════════════════════════════════════════════════════════════
Owner: 0x1234...
Controller: 0x5678...
Resolver: 0x231b87e9f02df89ec136656ea28f2e0f443f9f15
TTL: 300
Expiry: 2025-01-15T00:00:00.000Z
Fuses: CANNOT_UNWRAP,CANNOT_BURN_FUSES
Records:
  Address: 0x1234...
  Text: description="Uniswap protocol"
  ContentHash: ipfs://QmHash...

Subdomains:
  factory.uniswap.eth
  router.uniswap.eth
  quoter.uniswap.eth
  multicall.uniswap.eth

Metadata:
  Category: defi
  Type: amm
  Version: 3
  Protocol: Uniswap
  Description: Uniswap automated market maker protocol
```

**Desired Outcome**: Display detailed information for specific domain.

**How to Use Results**: Use for domain analysis and management.

### Category Filtering

```bash
ens-cache-browser --category defi --list
```

**Expected Output**:

```
DeFi Domains in Cache
════════════════════════════════════════════════════════════════════
Total: 25

1. uniswap.eth
   Category: defi
   Type: amm
   Version: 3
   Owner: 0x1234...

2. compound.eth
   Category: defi
   Type: lending
   Version: 2
   Owner: 0x5678...

3. aave.eth
   Category: defi
   Type: lending
   Version: 3
   Owner: 0x9abc...

...
```

**Desired Outcome**: List domains filtered by category.

**How to Use Results**: Use for category-specific analysis and discovery.

### Search Functionality

```bash
ens-cache-browser --search "uniswap" --output search-results.json
```

**Expected Output**:

```json
{
  "searchTerm": "uniswap",
  "results": [
    {
      "domain": "uniswap.eth",
      "category": "defi",
      "type": "amm",
      "version": "3",
      "protocol": "Uniswap",
      "description": "Uniswap automated market maker protocol",
      "subdomains": [
        "factory.uniswap.eth",
        "router.uniswap.eth",
        "quoter.uniswap.eth",
        "multicall.uniswap.eth"
      ]
    }
  ],
  "total": 1
}
```

**Desired Outcome**: Search for domains matching specific criteria.

**How to Use Results**: Use for domain discovery and analysis.

## Interactive Commands

### List Command

```bash
> list
```

**Expected Output**: List all cached domains with basic information.

**Desired Outcome**: Provide overview of cached domains.

**How to Use Results**: Use for general cache exploration.

### Search Command

```bash
> search uniswap
```

**Expected Output**: Search results for the specified term.

**Desired Outcome**: Find domains matching search criteria.

**How to Use Results**: Use for targeted domain discovery.

### Domain Command

```bash
> domain uniswap.eth
```

**Expected Output**: Detailed information for the specified domain.

**Desired Outcome**: Display domain details and metadata.

**How to Use Results**: Use for domain analysis and management.

### Category Command

```bash
> category defi
```

**Expected Output**: List domains in the specified category.

**Desired Outcome**: Filter domains by category.

**How to Use Results**: Use for category-specific analysis.

### Stats Command

```bash
> stats
```

**Expected Output**:

```
Cache Statistics
════════════════════════════════════════════════════════════════════
Total Domains: 150
Categories:
  DeFi: 45
  DAO: 30
  Infrastructure: 25
  Tokens: 20
  Gaming: 15
  Social: 10
  RWA: 5

Top Protocols:
  Uniswap: 8 subdomains
  Compound: 6 subdomains
  Aave: 5 subdomains

Cache Size: 2.5 MB
Last Updated: 2024-01-15T10:30:00.000Z
```

**Desired Outcome**: Display cache statistics and analytics.

**How to Use Results**: Use for cache analysis and monitoring.

### Export Command

```bash
> export json
```

**Expected Output**: Export cache data in specified format.

**Desired Outcome**: Export cache data for external analysis.

**How to Use Results**: Use for data analysis and reporting.

## Data Export

### JSON Export

```bash
ens-cache-browser --export json --output cache-data.json
```

**Expected Output**:

```json
{
  "domains": [
    {
      "name": "uniswap.eth",
      "owner": "0x1234...",
      "resolver": "0x231b...",
      "metadata": {
        "category": "defi",
        "type": "amm",
        "version": "3"
      },
      "subdomains": ["factory.uniswap.eth", "router.uniswap.eth"]
    }
  ],
  "statistics": {
    "total": 150,
    "categories": {
      "defi": 45,
      "dao": 30
    }
  }
}
```

**Desired Outcome**: Export cache data in JSON format.

**How to Use Results**: Use for programmatic analysis and integration.

### CSV Export

```bash
ens-cache-browser --export csv --output cache-data.csv
```

**Expected Output**:

```csv
Domain,Category,Type,Version,Owner,Resolver
uniswap.eth,defi,amm,3,0x1234...,0x231b...
compound.eth,defi,lending,2,0x5678...,0x231b...
aave.eth,defi,lending,3,0x9abc...,0x231b...
```

**Desired Outcome**: Export cache data in CSV format.

**How to Use Results**: Use for spreadsheet analysis and reporting.

### HTML Export

```bash
ens-cache-browser --export html --output cache-report.html
```

**Expected Output**: HTML report with cache data and statistics.

**Desired Outcome**: Export cache data in HTML format.

**How to Use Results**: Use for web-based reporting and sharing.

## Cache Management

### Cache Refresh

```bash
ens-cache-browser --refresh
```

**Expected Output**: Refresh cache data from ENS contracts.

**Desired Outcome**: Update cache with latest domain information.

**How to Use Results**: Use for keeping cache data current.

### Cache Validation

```bash
ens-cache-browser --validate
```

**Expected Output**: Validate cache data integrity.

**Desired Outcome**: Ensure cache data accuracy and consistency.

**How to Use Results**: Use for cache quality assurance.

### Cache Cleanup

```bash
ens-cache-browser --cleanup
```

**Expected Output**: Clean up outdated cache entries.

**Desired Outcome**: Remove expired and invalid cache entries.

**How to Use Results**: Use for cache maintenance and optimization.

## Integration with Other Tools

### Metadata Generator Integration

```bash
ens-cache-browser --domain uniswap.eth --generate-metadata
```

**Expected Output**: Generate metadata for the specified domain.

**Desired Outcome**: Create metadata from cache data.

**How to Use Results**: Use for metadata generation and validation.

### Security Analysis Integration

```bash
ens-cache-browser --domain uniswap.eth --analyze-security
```

**Expected Output**: Perform security analysis on the specified domain.

**Desired Outcome**: Analyze domain security using cache data.

**How to Use Results**: Use for security assessment and monitoring.

### Validation Integration

```bash
ens-cache-browser --domain uniswap.eth --validate
```

**Expected Output**: Validate domain against standards.

**Desired Outcome**: Ensure domain compliance using cache data.

**How to Use Results**: Use for compliance validation and reporting.

## Error Handling

### Common Errors

1. **Cache Not Found**
   - Error: Cache file does not exist
   - Solution: Initialize cache or check file path

2. **Invalid Domain**
   - Error: Domain not found in cache
   - Solution: Check domain name or refresh cache

3. **Export Errors**
   - Error: Cannot export data
   - Solution: Check output path and permissions

4. **Network Issues**
   - Error: Cannot refresh cache
   - Solution: Check network connectivity and RPC endpoint

## Next Steps

- [metadata-generator](metadata-generator.md) - Generate metadata from cache data
- [security-analyzer](security-analyzer.md) - Analyze security using cache data
- [Results and Workflows](../Results-and-Workflows.md) - How to use cache browser results
- [Interconnectivity](../Interconnectivity.md) - How cache browser fits into workflows
