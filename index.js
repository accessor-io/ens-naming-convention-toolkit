#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const program = new Command();

program
  .name('ens-metadata-tools')
  .description('Comprehensive ENS metadata management and security tools')
  .version(packageJson.version);

program
  .command('metadata')
  .description('Generate metadata for protocols and subdomains')
  .option('-c, --category <category>', 'Protocol category (defi, dao, infrastructure, etc.)')
  .option('-t, --type <type>', 'Protocol type (amm, lending, governance, etc.)')
  .option('-n, --name <name>', 'Protocol name')
  .option('-v, --version <version>', 'Protocol version')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    const { default: generateMetadata } = await import('./bin/metadata-generator.js');
    await generateMetadata(options);
  });

program
  .command('validate')
  .description('Validate ENS naming conventions and security')
  .argument('<domain>', 'Domain to validate')
  .option('-c, --category <category>', 'Expected category')
  .option('--strict', 'Strict validation mode')
  .option('-m, --metadata <file>', 'Metadata file to validate against')
  .action(async (domain, options) => {
    const { default: validateNaming } = await import('./bin/naming-validator.js');
    await validateNaming(domain, options);
  });

program
  .command('plan')
  .description('Plan subdomain structure for protocols')
  .argument('<domain>', 'Root domain')
  .option('-c, --category <category>', 'Protocol category')
  .option('-t, --type <type>', 'Protocol type')
  .option('-v, --version <version>', 'Protocol version')
  .action(async (domain, options) => {
    const { default: planSubdomains } = await import('./bin/subdomain-planner.js');
    await planSubdomains(domain, options);
  });

program
  .command('probe')
  .description('Probe ENS resolvers and contracts')
  .option('-a, --address <address>', 'Specific address to probe')
  .option('-m, --multicall', 'Use multicall for batch probing')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    const { default: probeContracts } = await import('./prober/probe-multicall.js');
    await probeContracts(options);
  });

program
  .command('lookup')
  .description('Lookup ENS names by resolver')
  .option('-r, --resolver <address>', 'Specific resolver address')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    const { default: lookupNames } = await import('./prober/lookup-resolver-names.js');
    await lookupNames(options);
  });

program
  .command('security')
  .description('Analyze security posture of ENS domains')
  .argument('<domain>', 'Domain to analyze')
  .option('--check-fuses', 'Check ENS Name Wrapper fuses')
  .option('--check-verification', 'Check identity verification')
  .option('-o, --output <file>', 'Output file path')
  .action(async (domain, options) => {
    console.log(chalk.yellow('Security analysis not yet implemented'));
    console.log(`Analyzing security for domain: ${domain}`);
  });

// Global options
program
  .option('--verbose', 'Verbose output')
  .option('--json', 'JSON output format');

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error) {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}

// Show help if no command provided
if (!program.args.length) {
  program.help();
}
