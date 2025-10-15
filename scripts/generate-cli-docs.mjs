#!/usr/bin/env node

/**
 * CLI Documentation Generator
 *
 * Generates documentation for all CLI commands in the bin/ directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BIN_DIR = path.join(PROJECT_ROOT, 'bin');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// CLI command information extracted from bin files
const CLI_COMMANDS = [
  {
    name: 'ens-metadata',
    file: 'cli.mjs',
    description: 'Main CLI entry point for ENS metadata operations',
    usage: 'ens-metadata [command] [options]',
    examples: [
      'ens-metadata validate example.eth',
      'ens-metadata generate --category defi --type amm',
    ],
  },
  {
    name: 'ens-validator',
    file: 'naming-validator.mjs',
    description: 'Ethereum Contract Naming Convention Validator',
    usage: 'ens-validator <domain> <category> [options]',
    options: [
      { name: '--strict', description: 'Strict validation mode', type: 'boolean' },
      { name: '--metadata <file>', description: 'Load metadata from JSON file', type: 'string' },
      {
        name: '--batch <file>',
        description: 'Validate multiple domains from file',
        type: 'string',
      },
      { name: '--qa', description: 'Enable QA standards validation', type: 'boolean' },
      { name: '--no-qa', description: 'Disable QA standards validation', type: 'boolean' },
    ],
    examples: [
      'ens-validator governor.ensdao.eth dao',
      'ens-validator uniswap.amm.eth defi --strict --qa',
      'ens-validator uni.token.eth tokens --metadata token-metadata.json --qa',
    ],
  },
  {
    name: 'ens-cache-browser',
    file: 'cache-browser.mjs',
    description: 'ENS cache browser for metadata exploration',
    usage: 'ens-cache-browser [options]',
    examples: [
      'ens-cache-browser --domain example.eth',
      'ens-cache-browser --list --category defi',
    ],
  },
  {
    name: 'evmd',
    file: 'evmd.js',
    description: 'EVM metadata operations',
    usage: 'evmd [command] [options]',
    examples: ['evmd analyze contract.json', 'evmd generate metadata --type erc20'],
  },
  {
    name: 'ens-contract',
    file: 'ens-contract.mjs',
    description: 'ENS contract operations and management',
    usage: 'ens-contract [command] [options]',
    examples: [
      'ens-contract register subdomain.eth --owner 0x...',
      'ens-contract set-resolver domain.eth --resolver 0x...',
    ],
  },
  {
    name: 'metadata-generator',
    file: 'metadata-generator.mjs',
    description: 'Generate standardized metadata templates',
    usage: 'metadata-generator --category <category> --type <type> [options]',
    options: [
      {
        name: '--category <cat>',
        description: 'Protocol category',
        type: 'string',
        required: true,
      },
      { name: '--type <type>', description: 'Protocol type', type: 'string', required: true },
      { name: '--name <name>', description: 'Protocol/contract name', type: 'string' },
      { name: '--version <ver>', description: 'Version number', type: 'string' },
      { name: '--symbol <sym>', description: 'Token symbol', type: 'string' },
      { name: '--supply <num>', description: 'Token supply', type: 'string' },
      { name: '--output <file>', description: 'Save to file', type: 'string' },
    ],
    examples: [
      'metadata-generator --category defi --type amm --name Uniswap --version 3',
      'metadata-generator --category dao --type governor --dao ENS --token ENS',
      'metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000',
    ],
  },
  {
    name: 'subdomain-planner',
    file: 'subdomain-planner.mjs',
    description: 'Plan and organize subdomain structures',
    usage: 'subdomain-planner [options]',
    examples: [
      'subdomain-planner --domain example.eth --interactive',
      'subdomain-planner --template defi --output plan.json',
    ],
  },
  {
    name: 'security-analyzer',
    file: 'security-analyzer.mjs',
    description: 'Analyze ENS metadata for security issues',
    usage: 'security-analyzer [options]',
    examples: [
      'security-analyzer --metadata contract.json',
      'security-analyzer --batch metadata/ --report security-report.json',
    ],
  },
];

function generateCLIDocumentation() {
  const docContent = `# CLI Commands Reference

This document provides a reference for all CLI commands available in the ENS metadata tools.

## Overview

The ENS metadata tools provide several CLI commands for different aspects of ENS metadata management:

- **Validation**: Validate domain names and metadata against standards
- **Generation**: Generate standardized metadata templates
- **Operations**: Perform ENS contract operations
- **Analysis**: Analyze metadata for security and compliance issues
- **Planning**: Plan subdomain structures and naming conventions

## Commands

${CLI_COMMANDS.map((command) => generateCommandDoc(command)).join('\n\n')}

## Categories

The following categories are supported across different commands:

### DeFi Categories
- \`defi\` - General DeFi protocols
- \`amm\` - Automated Market Makers
- \`lending\` - Lending protocols
- \`stablecoin\` - Stablecoin protocols
- \`dex\` - Decentralized exchanges

### DAO Categories
- \`dao\` - General DAO protocols
- \`governor\` - Governance contracts
- \`treasury\` - Treasury management

### Infrastructure Categories
- \`infrastructure\` - General infrastructure
- \`oracle\` - Price oracles
- \`bridge\` - Cross-chain bridges
- \`proxy\` - Proxy contracts

### Token Categories
- \`tokens\` - General token contracts
- \`erc20\` - ERC-20 tokens
- \`erc721\` - ERC-721 NFTs
- \`governance\` - Governance tokens

## Usage Examples

### Basic Validation
\`\`\`bash
# Validate a domain name
ens-validator example.eth defi

# Validate with strict mode
ens-validator example.eth defi --strict

# Validate with metadata file
ens-validator example.eth defi --metadata metadata.json
\`\`\`

### Metadata Generation
\`\`\`bash
# Generate DeFi AMM metadata
metadata-generator --category defi --type amm --name Uniswap --version 3

# Generate DAO governance metadata
metadata-generator --category dao --type governor --dao ENS --token ENS

# Generate token metadata
metadata-generator --category tokens --type erc20 --symbol UNI --supply 1000000000
\`\`\`

### ENS Operations
\`\`\`bash
# Register a subdomain
ens-contract register subdomain.example.eth --owner 0x1234...

# Set resolver
ens-contract set-resolver domain.eth --resolver 0x5678...

# Set fuses (ENSv3)
ens-contract set-fuses domain.eth --fuses CANNOT_UNWRAP
\`\`\`

### Security Analysis
\`\`\`bash
# Analyze single metadata file
security-analyzer --metadata contract.json

# Analyze batch of files
security-analyzer --batch metadata/ --report security-report.json
\`\`\`

## Configuration

Commands can be configured using:

1. **Command line options** - Direct specification
2. **Configuration files** - JSON/YAML config files
3. **Environment variables** - System environment variables

### Configuration File Format

\`\`\`json
{
  "network": "mainnet",
  "strict": false,
  "includeQA": true,
  "outputDir": "./output",
  "templates": {
    "defi": "./templates/defi.json",
    "dao": "./templates/dao.json"
  }
}
\`\`\`

## Error Handling

All commands provide consistent error handling:

- **Exit codes**: 0 for success, 1 for failure
- **Error messages**: Clear, actionable error descriptions
- **Verbose mode**: Use \`--verbose\` for detailed output
- **Logging**: Structured logging with timestamps

## Best Practices

1. **Always validate** metadata before deployment
2. **Use strict mode** for production environments
3. **Enable QA validation** for compliance
4. **Plan subdomains** before registration
5. **Analyze security** before going live
6. **Use configuration files** for complex setups
7. **Test commands** in development first

## Troubleshooting

### Common Issues

1. **Network errors**: Check network connectivity and RPC endpoints
2. **Validation failures**: Review error messages and fix issues
3. **Permission errors**: Ensure proper file permissions
4. **Memory issues**: Use batch processing for large datasets

### Getting Help

- Use \`--help\` flag with any command
- Check logs with \`--verbose\` flag
- Review error messages for specific guidance
- Consult this documentation for examples

## Contributing

To add new CLI commands:

1. Create command file in \`bin/\` directory
2. Add command information to this documentation
3. Update \`package.json\` bin section
4. Add tests for the command
5. Update CI/CD workflows if needed
`;

  return docContent;
}

function generateCommandDoc(command) {
  let doc = `### ${command.name}

**Description**: ${command.description}

**Usage**: \`${command.usage}\`

`;

  if (command.options && command.options.length > 0) {
    doc += `**Options**:\n\n`;
    command.options.forEach((option) => {
      const required = option.required ? ' (required)' : '';
      doc += `- \`${option.name}\`: ${option.description}${required}\n`;
    });
    doc += '\n';
  }

  if (command.examples && command.examples.length > 0) {
    doc += `**Examples**:\n\n`;
    command.examples.forEach((example) => {
      doc += `\`\`\`bash\n${example}\n\`\`\`\n\n`;
    });
  }

  return doc;
}

function main() {
  try {
    // Ensure docs directory exists
    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    // Generate CLI documentation
    const cliDoc = generateCLIDocumentation();
    const cliDocPath = path.join(DOCS_DIR, 'CLI-COMMANDS.md');

    fs.writeFileSync(cliDocPath, cliDoc, 'utf8');
    console.log(`CLI documentation generated: ${cliDocPath}`);

    // Generate JSON reference
    const jsonRef = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      commands: CLI_COMMANDS,
    };

    const jsonRefPath = path.join(DOCS_DIR, 'cli-commands.json');
    fs.writeFileSync(jsonRefPath, JSON.stringify(jsonRef, null, 2), 'utf8');
    console.log(`CLI JSON reference generated: ${jsonRefPath}`);
  } catch (error) {
    console.error('Failed to generate CLI documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
