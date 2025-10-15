#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const program = new Command();

program
  .name('ens-metadata-tools')
  .description('Comprehensive ENS metadata management and security tools')
  .version(packageJson.version, '-v, --version', 'display version number');

program
  .command('metadata')
  .description('Generate metadata for protocols and subdomains')
  .option('-c, --category <category>', 'Protocol category')
  .option('-t, --type <type>', 'Protocol type')
  .option('-n, --name <name>', 'Protocol name')
  .option('--protocol-version <version>', 'Protocol version')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    try {
      const { generateMetadata } = await import('./bin/metadata-generator.mjs');

      // Map CLI options to template variables
      const variables = {
        protocol: options.name || 'ProtocolName',
        version: options.protocolVersion || 'v1-0-0',
        contractType: options.type,
        deploymentBlock: '0',
        launchDate: new Date().toISOString().split('T')[0],
        ...options,
      };

      const metadata = generateMetadata(options.category, options.type, {
        ...variables,
        org: options.name || 'protocol',
        protocol: options.name || 'protocol',
        version: options.protocolVersion || 'v1-0-0',
        chainId: 1,
        name: options.name,
      });

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, JSON.stringify(metadata, null, 2));
        console.log(chalk.green(`Metadata saved to ${options.output}`));
      } else {
        console.log(JSON.stringify(metadata, null, 2));
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate ENS naming conventions and security')
  .argument('<domain>', 'Domain to validate')
  .option('-c, --category <category>', 'Expected category')
  .option('--strict', 'Strict validation mode')
  .option('-m, --metadata <file>', 'Metadata file to validate against')
  .action(async (domain, options) => {
    const { default: NamingValidator } = await import('./bin/naming-validator.mjs');
    const validator = new NamingValidator();
    const result = await validator.validateDomain(domain, options.category, options);
    console.log(validator.generateReport(result));
  });

program
  .command('plan')
  .description('Plan subdomain structure for protocols')
  .argument('<domain>', 'Root domain')
  .option('-c, --category <category>', 'Protocol category')
  .option('-t, --type <type>', 'Protocol type')
  .option('--protocol-version <version>', 'Protocol version')
  .action(async (domain, options) => {
    const { default: SubdomainPlanner } = await import('./bin/subdomain-planner.mjs');
    const planner = new SubdomainPlanner();

    try {
      const plan = planner.generatePlan(domain, options.category, options.type, {
        version: options.protocolVersion,
        protocol: domain.split('.')[0],
      });
      planner.displayPlan(plan);
    } catch (error) {
      console.error(`Error generating plan: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('probe')
  .description('Probe ENS resolvers and contracts')
  .option('-a, --address <address>', 'Specific address to probe')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {

    if (!options.address) {
      console.error('Error: Address is required. Use --address <address>');
      process.exit(1);
    }

    const addresses = options.address.split(',').map((addr) => addr.trim());
    const results = await prober.probeContracts(addresses, 'erc20');

    prober.displayResults(results);

    if (options.output) {
      const fs = await import('fs');
      fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
      console.log(chalk.green(`\nResults saved to ${options.output}`));
    }
  });

program
  .command('lookup')
  .description('Lookup ENS names by resolver')
  .option('-r, --resolver <address>', 'Specific resolver address')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    const { lookupNamesByResolver } = await import('./tools/prober/lookup-resolver-names.js');

    if (!options.resolver) {
      console.error('Error: Resolver address is required. Use --resolver <address>');
      process.exit(1);
    }

    const results = await lookupNamesByResolver(options.resolver, {
      output: options.output,
      format: 'json',
    });

    if (options.output) {
      console.log(chalk.green(`\nResults saved to ${options.output}`));
    } else {
      console.log(JSON.stringify(results, null, 2));
    }
  });

program
  .command('security')
  .description('Analyze security posture of ENS domains')
  .argument('<domain>', 'Domain to analyze')
  .option('--check-fuses', 'Check ENS Name Wrapper fuses')
  .option('--check-verification', 'Check identity verification')
  .option('-o, --output <file>', 'Output file path')
  .action(async (domain, options) => {
    const { ENSecurityAnalyzer } = await import('./bin/security-analyzer.mjs');
    const analyzer = new ENSecurityAnalyzer();
    const results = await analyzer.analyzeSecurity(domain, options);

    analyzer.displayReport(results);

    // Save to file if requested
    if (options.output) {
      const fs = await import('fs');
      fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
      console.log(chalk.green(`\nReport saved to ${options.output}`));
    }
  });

// Global options
program.option('--verbose', 'Verbose output').option('--json', 'JSON output format');

// Parse arguments
program.parse();

// Show help if no command provided
if (!program.args.length) {
  program.help();
}
