# Troubleshooting Guide

This comprehensive troubleshooting guide will help you resolve common issues and get the most out of ENS Metadata Tools.

## Quick Fixes

### Installation Issues

**Problem**: `command not found: ens-metadata`

```bash
# Solution: Ensure global installation
npm install -g ens-metadata-tools

# Verify installation
which ens-metadata
ens-metadata --version
```

**Problem**: Permission denied during installation

```bash
# Solution: Use sudo for global installation
sudo npm install -g ens-metadata-tools

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**Problem**: Node.js version too old

```bash
# Check current version
node --version

# Solution: Update Node.js
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Network Connection Issues

**Problem**: RPC connection timeout

```bash
# Check RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Solution: Use alternative RPC provider
export ETH_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY"
```

**Problem**: Rate limiting

```bash
# Solution: Use multiple RPC endpoints
export ETH_RPC_URLS="https://mainnet.infura.io/v3/KEY1,https://eth-mainnet.alchemyapi.io/v2/KEY2"

# Or implement retry logic
ens-metadata --retry 3 --timeout 30000
```

## Common Issues and Solutions

### Metadata Generation Issues

**Problem**: Template not found

```
Error: Template 'defi-amm' not found
```

**Solution**:

```bash
# List available templates
metadata-generator --list-templates

# Use correct template name
metadata-generator --template defi --type amm

# Or create custom template
metadata-generator --create-template my-template.json
```

**Problem**: Invalid metadata schema

```
Error: Metadata validation failed
```

**Solution**:

```bash
# Validate with verbose output
ens-validator metadata.json --verbose

# Check specific fields
ens-validator metadata.json --check-fields id,org,protocol,category

# Fix common issues
metadata-generator --fix-schema metadata.json --output fixed-metadata.json
```

### Validation Issues

**Problem**: Domain validation fails

```
Error: Domain 'example.eth' does not follow naming conventions
```

**Solution**:

```bash
# Check domain format
ens-validator example.eth --check-format

# Use correct category
ens-validator example.defi.eth defi --strict

# Check naming conventions
ens-validator example.eth --explain-naming
```

**Problem**: Cross-reference validation fails

```
Error: Cross-reference validation failed for contract 0x123...
```

**Solution**:

```bash
# Validate with relaxed cross-reference checking
ens-validator metadata.json --relax-cross-ref

# Fix cross-references
ens-metadata fix-cross-ref metadata.json --output fixed.json

# Validate dependencies
ens-validator metadata.json --check-dependencies
```

### Security Analysis Issues

**Problem**: Security analysis timeout

```
Error: Security analysis timed out after 30 seconds
```

**Solution**:

```bash
# Increase timeout
security-analyzer domain.eth --timeout 120

# Use quick analysis mode
security-analyzer domain.eth --quick

# Analyze specific components only
security-analyzer domain.eth --check-fuses --check-ownership
```

**Problem**: Contract analysis fails

```
Error: Unable to analyze contract 0x123...
```

**Solution**:

```bash
# Check contract accessibility
node tools/prober/probe-multicall.js 0x123... --test-connection

# Use alternative analysis method
security-analyzer --contract 0x123... --method static-analysis

# Check contract type
node tools/prober/probe-multicall.js 0x123... --detect-type
```

### Subdomain Planning Issues

**Problem**: Subdomain plan generation fails

```
Error: Unable to generate subdomain plan
```

**Solution**:

```bash
# Use interactive mode
subdomain-planner --domain example.eth --interactive

# Specify components manually
subdomain-planner --domain example.eth --components router,factory,token

# Use template-based planning
subdomain-planner --domain example.eth --template defi-amm
```

**Problem**: Subdomain validation fails

```
Error: Subdomain 'example.defi.router.eth' is invalid
```

**Solution**:

```bash
# Check subdomain format
ens-validator example.defi.router.eth --check-format

# Validate against category
ens-validator example.defi.router.eth defi --strict

# Check naming conventions
ens-validator example.defi.router.eth --explain-naming
```

## Debugging Techniques

### Enable Verbose Logging

```bash
# Enable verbose output for all commands
ens-metadata --verbose
ens-validator --verbose
security-analyzer --verbose
metadata-generator --verbose
subdomain-planner --verbose
```

### Debug Mode

```bash
# Enable debug mode
export DEBUG=ens-metadata-tools:*
ens-metadata --debug

# Debug specific components
export DEBUG=ens-metadata-tools:validation
ens-validator metadata.json --debug
```

### Log Analysis

```bash
# Save logs to file
ens-metadata --verbose --log-file debug.log

# Analyze logs
grep "ERROR" debug.log
grep "WARN" debug.log
grep "INFO" debug.log
```

## Advanced Troubleshooting

### Performance Issues

**Problem**: Slow metadata generation

```bash
# Use batch processing
metadata-generator --batch contracts.json --output batch-metadata/

# Optimize template processing
metadata-generator --optimize-templates

# Use caching
metadata-generator --cache --cache-dir ./cache
```

**Problem**: Memory issues

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 metadata-generator.js

# Use streaming for large datasets
metadata-generator --stream --input large-dataset.json
```

### Integration Issues

**Problem**: CI/CD pipeline failures

```bash
# Check environment variables
env | grep ETH
env | grep ENS

# Test in CI environment
ens-metadata --test-ci

# Use CI-specific configuration
ens-metadata --config ci-config.json
```

**Problem**: API integration issues

```bash
# Test API connectivity
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"metadata": {...}}'

# Check API status
ens-metadata --api-status
```

## Error Codes Reference

### Common Error Codes

| Code   | Description                       | Solution                          |
| ------ | --------------------------------- | --------------------------------- |
| `E001` | Invalid metadata schema           | Use `--fix-schema` flag           |
| `E002` | Domain validation failed          | Check naming conventions          |
| `E003` | RPC connection timeout            | Use alternative RPC endpoint      |
| `E004` | Contract analysis failed          | Check contract accessibility      |
| `E005` | Template not found                | Use `--list-templates`            |
| `E006` | Cross-reference validation failed | Use `--relax-cross-ref`           |
| `E007` | Security analysis timeout         | Increase timeout or use `--quick` |
| `E008` | Subdomain plan generation failed  | Use `--interactive` mode          |

### HTTP Status Codes

| Code  | Description           | Solution                |
| ----- | --------------------- | ----------------------- |
| `400` | Bad Request           | Check request format    |
| `401` | Unauthorized          | Check API key           |
| `403` | Forbidden             | Check permissions       |
| `404` | Not Found             | Check resource path     |
| `429` | Too Many Requests     | Implement rate limiting |
| `500` | Internal Server Error | Check server logs       |

## Recovery Procedures

### Corrupted Metadata Recovery

```bash
# Backup corrupted metadata
cp metadata.json metadata.json.backup

# Attempt automatic repair
ens-metadata repair metadata.json --output repaired.json

# Manual repair using schema
ens-metadata repair metadata.json --schema schema.json --output repaired.json

# Validate repaired metadata
ens-validator repaired.json --strict
```

### Configuration Recovery

```bash
# Reset to default configuration
ens-metadata --reset-config

# Restore from backup
cp config.json.backup config.json

# Validate configuration
ens-metadata --validate-config
```

### Cache Recovery

```bash
# Clear cache
ens-metadata --clear-cache

# Rebuild cache
ens-metadata --rebuild-cache

# Check cache integrity
ens-metadata --check-cache
```

## Getting Help

### Self-Service Resources

1. **Check Documentation**: [README.md](README.md), [Getting Started](Getting-Started.md)
2. **Search Issues**: [GitHub Issues](https://github.com/ens-contracts/metadata-tools/issues)
3. **Community Forum**: [ENS Community](https://discord.gg/ens)
4. **FAQ**: [Frequently Asked Questions](FAQ.md)

### Reporting Issues

When reporting issues, please include:

```bash
# System information
ens-metadata --system-info

# Version information
ens-metadata --version

# Configuration
ens-metadata --config-info

# Error logs
ens-metadata --verbose --log-file error.log
```

### Issue Template

```markdown
## Bug Report

### Description

Brief description of the issue

### Steps to Reproduce

1. Step one
2. Step two
3. Step three

### Expected Behavior

What you expected to happen

### Actual Behavior

What actually happened

### Environment

- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., v20.0.0]
- ENS Metadata Tools: [e.g., v1.0.0]

### Additional Context

Any other relevant information
```

## Prevention Tips

### Best Practices

1. **Regular Updates**: Keep tools updated to latest version
2. **Backup Configuration**: Regularly backup configuration files
3. **Test Changes**: Test changes in development environment first
4. **Monitor Logs**: Regularly check logs for warnings
5. **Validate Early**: Validate metadata early in development process

### Monitoring

```bash
# Set up monitoring
ens-metadata --monitor --interval 300

# Check system health
ens-metadata --health-check

# Performance monitoring
ens-metadata --performance-monitor
```

---

_Still having issues? Check our [FAQ](FAQ.md) or [create an issue](https://github.com/ens-contracts/metadata-tools/issues)._
