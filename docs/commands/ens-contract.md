# ens-contract

ENS contract operations and management for domain registration, resolver configuration, and record management.

## Purpose

The `ens-contract` command provides direct ENS contract interactions for domain registration, resolver management, record setting, and Name Wrapper operations.

## Usage

```bash
ens-contract [command] [options]
```

## Commands

### register

Register a new subdomain.

**Usage**: `ens-contract register <name> [options]`

**Options**:

- `--owner <address>` - Owner address (required)
- `--resolver <address>` - Resolver address
- `--ttl <seconds>` - TTL in seconds
- `--fuses <fuses>` - Name Wrapper fuses
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract register router.uniswap.defi.eth --owner 0x1234... --resolver 0x231b...
```

**Expected Output**:

```
Registration completed successfully.
   Transaction: 0xabc123...
   Block: 12345678
   Gas used: 150000
   Domain: router.uniswap.defi.eth
   Owner: 0x1234...
   Resolver: 0x231b...
```

**Desired Outcome**: Register new subdomain with specified ownership and resolver.

**How to Use Results**: Verify transaction success, use transaction hash for tracking, monitor gas usage.

### set-resolver

Set resolver address for a domain.

**Usage**: `ens-contract set-resolver <name> --resolver <address> [options]`

**Options**:

- `--resolver <address>` - Resolver address (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract set-resolver domain.eth --resolver 0x231b87e9f02df89ec136656ea28f2e0f443f9f15
```

**Expected Output**:

```
Resolver set successfully.
   Transaction: 0xdef456...
   Block: 12345679
   Gas used: 45000
   Domain: domain.eth
   Resolver: 0x231b87e9f02df89ec136656ea28f2e0f443f9f15
```

**Desired Outcome**: Set resolver address for the specified domain.

**How to Use Results**: Verify resolver configuration, use for domain management.

### set-fuses

Set Name Wrapper fuses for a domain.

**Usage**: `ens-contract set-fuses <name> --fuses <fuses> [options]`

**Options**:

- `--fuses <fuses>` - Fuses to set (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract set-fuses domain.eth --fuses CANNOT_UNWRAP,CANNOT_BURN_FUSES
```

**Expected Output**:

```
Fuses set successfully.
   Transaction: 0xghi789...
   Block: 12345680
   Gas used: 75000
   Domain: domain.eth
   Fuses: CANNOT_UNWRAP,CANNOT_BURN_FUSES
```

**Desired Outcome**: Set Name Wrapper fuses for enhanced security.

**How to Use Results**: Verify fuse configuration, use for security management.

### set-record

Set ENS record for a domain.

**Usage**: `ens-contract set-record <name> --type <type> --value <value> [options]`

**Options**:

- `--type <type>` - Record type (address, text, contenthash) (required)
- `--value <value>` - Record value (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract set-record domain.eth --type address --value 0x1234...
```

**Expected Output**:

```
Record set successfully.
   Transaction: 0xjkl012...
   Block: 12345681
   Gas used: 60000
   Domain: domain.eth
   Type: address
   Value: 0x1234...
```

**Desired Outcome**: Set ENS record for the specified domain.

**How to Use Results**: Verify record configuration, use for domain management.

### get-info

Get domain information.

**Usage**: `ens-contract get-info <name> [options]`

**Options**:

- `--verbose` - Verbose output with detailed information
- `--format <format>` - Output format (text, json)

**Example**:

```bash
ens-contract get-info domain.eth --verbose
```

**Expected Output**:

```
Domain Information: domain.eth
════════════════════════════════════════════════════════════════════
Owner: 0x1234...
Controller: 0x5678...
Resolver: 0x231b87e9f02df89ec136656ea28f2e0f443f9f15
TTL: 300
Expiry: 2025-01-15T00:00:00.000Z
Fuses: CANNOT_UNWRAP,CANNOT_BURN_FUSES
Records:
  Address: 0x1234...
  Text: description="Example domain"
  ContentHash: ipfs://QmHash...
```

**Desired Outcome**: Retrieve domain information and configuration.

**How to Use Results**: Use for domain analysis and management.

### renew

Renew domain registration.

**Usage**: `ens-contract renew <name> --years <years> [options]`

**Options**:

- `--years <years>` - Years to renew (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract renew domain.eth --years 1
```

**Expected Output**:

```
Renewal completed successfully.
   Transaction: 0xmno345...
   Block: 12345682
   Gas used: 120000
   Domain: domain.eth
   Years: 1
   New Expiry: 2026-01-15T00:00:00.000Z
```

**Desired Outcome**: Renew domain registration for specified years.

**How to Use Results**: Verify renewal success, update domain records.

### transfer

Transfer domain ownership.

**Usage**: `ens-contract transfer <name> --to <address> [options]`

**Options**:

- `--to <address>` - New owner address (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract transfer domain.eth --to 0x5678...
```

**Expected Output**:

```
Transfer completed successfully.
   Transaction: 0xpqr678...
   Block: 12345683
   Gas used: 90000
   Domain: domain.eth
   From: 0x1234...
   To: 0x5678...
```

**Desired Outcome**: Transfer domain ownership to new address.

**How to Use Results**: Verify transfer success, update ownership records.

## Name Wrapper Operations

### Wrap Domain

Wrap a domain with Name Wrapper.

**Usage**: `ens-contract wrap <name> --fuses <fuses> [options]`

**Options**:

- `--fuses <fuses>` - Fuses to set (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract wrap domain.eth --fuses CANNOT_UNWRAP,CANNOT_BURN_FUSES
```

**Expected Output**:

```
Domain wrapped successfully.
   Transaction: 0xstu901...
   Block: 12345684
   Gas used: 180000
   Domain: domain.eth
   Fuses: CANNOT_UNWRAP,CANNOT_BURN_FUSES
```

**Desired Outcome**: Wrap domain with Name Wrapper and set fuses.

**How to Use Results**: Verify wrapping success, use for enhanced security.

### Unwrap Domain

Unwrap a domain from Name Wrapper.

**Usage**: `ens-contract unwrap <name> [options]`

**Options**:

- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract unwrap domain.eth
```

**Expected Output**:

```
Domain unwrapped successfully.
   Transaction: 0xvwx234...
   Block: 12345685
   Gas used: 100000
   Domain: domain.eth
```

**Desired Outcome**: Unwrap domain from Name Wrapper.

**How to Use Results**: Verify unwrapping success, use for domain management.

## Batch Operations

### Batch Registration

Register multiple subdomains.

**Usage**: `ens-contract batch-register <file> [options]`

**Options**:

- `--file <file>` - File containing subdomain list (required)
- `--gas-price <price>` - Gas price in gwei
- `--gas-limit <limit>` - Gas limit

**Example**:

```bash
ens-contract batch-register subdomains.json
```

**Expected Output**:

```
Batch registration completed successfully.
   Total: 5
   Successful: 5
   Failed: 0
   Total Gas: 750000
   Transactions: 0xabc123..., 0xdef456..., 0xghi789...
```

**Desired Outcome**: Register multiple subdomains efficiently.

**How to Use Results**: Verify batch success, use for large-scale operations.

## Gas Management

### Gas Estimation

Estimate gas for operations.

**Usage**: `ens-contract estimate-gas <command> [options]`

**Example**:

```bash
ens-contract estimate-gas register router.uniswap.defi.eth --owner 0x1234...
```

**Expected Output**:

```
Gas Estimation:
   Operation: register
   Estimated Gas: 150000
   Gas Price: 20 gwei
   Estimated Cost: 0.003 ETH
```

**Desired Outcome**: Estimate gas costs for operations.

**How to Use Results**: Use for cost planning and optimization.

### Gas Optimization

Optimize gas usage for operations.

**Usage**: `ens-contract optimize-gas <command> [options]`

**Example**:

```bash
ens-contract optimize-gas register router.uniswap.defi.eth --owner 0x1234...
```

**Expected Output**:

```
Gas Optimization:
   Original Gas: 150000
   Optimized Gas: 120000
   Savings: 20%
   Recommended Gas Price: 18 gwei
```

**Desired Outcome**: Optimize gas usage for cost efficiency.

**How to Use Results**: Use for cost optimization and efficiency.

## Error Handling

### Common Errors

1. **Insufficient Funds**
   - Error: Not enough ETH for gas
   - Solution: Add ETH to wallet

2. **Domain Already Exists**
   - Error: Domain is already registered
   - Solution: Choose different domain name

3. **Permission Denied**
   - Error: Not authorized to perform operation
   - Solution: Check domain ownership and permissions

4. **Network Issues**
   - Error: Cannot connect to Ethereum network
   - Solution: Check network connectivity and RPC endpoint

## Integration with Other Tools

### Subdomain Planning Integration

```bash
ens-contract execute-plan uniswap-plan.json
```

**Expected Output**: Execute subdomain registration plan.

**Desired Outcome**: Automate subdomain registration from planning results.

**How to Use Results**: Use for automated domain management.

### Security Analysis Integration

```bash
ens-contract apply-security-recommendations security-report.json
```

**Expected Output**: Apply security recommendations from analysis.

**Desired Outcome**: Automate security improvements.

**How to Use Results**: Use for automated security management.

## Next Steps

- [subdomain-planner](subdomain-planner.md) - Plan subdomain structure
- [security-analyzer](security-analyzer.md) - Analyze security posture
- [Results and Workflows](../Results-and-Workflows.md) - How to use operation results
- [Interconnectivity](../Interconnectivity.md) - How operations fit into workflows
