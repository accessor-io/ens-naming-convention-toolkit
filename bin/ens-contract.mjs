#!/usr/bin/env node

/**
 * ENS Contract CLI Tool
 *
 * Command-line interface for ENS naming operations including subname registration,
 * fuse management, resolver configuration, and reverse resolution.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ENSOperations } from '../src/core/ens-operations.js';
import { ENSWalletConnector, isBrowser } from '../src/core/ens-wallet-connector.js';

const program = new Command();

// Global options
program
  .name('ens-contract')
  .description('ENS naming operations tool')
  .version('1.0.0')
  .option('-n, --network <network>', 'Network (mainnet, sepolia, goerli)', 'mainnet')
  .option('-r, --rpc-url <url>', 'RPC URL for Node.js mode')
  .option('-k, --private-key <key>', 'Private key for Node.js mode')
  .option('--output <format>', 'Output format (json, table, minimal)', 'table')
  .option('--dry-run', 'Preview transaction without sending')
  .option('--yes', 'Skip confirmation prompts');

// Register command
program
  .command('register <name>')
  .description('Register a new subdomain')
  .option('-p, --parent <parent>', 'Parent domain name')
  .option('-o, --owner <address>', 'Owner address')
  .option('-s, --resolver <address>', 'Resolver address')
  .option('-t, --ttl <ttl>', 'TTL value')
  .option('-f, --fuses <fuses>', 'Fuse value or template name')
  .option('-e, --expiry <expiry>', 'Expiry timestamp (ENSv3)')
  .action(async (name, options) => {
    try {
      const ens = await initializeENS();

      const registrationOptions = {
        owner: options.owner,
        resolver: options.resolver,
        ttl: options.ttl ? parseInt(options.ttl) : undefined,
        fuses: options.fuses,
        expiry: options.expiry ? parseInt(options.expiry) : undefined,
      };

      if (program.opts().dryRun) {
        console.log(chalk.blue('Dry run mode - transaction preview:'));
        console.log(chalk.gray(`   Name: ${name}`));
        console.log(chalk.gray(`   Parent: ${options.parent || 'auto-detected'}`));
        console.log(chalk.gray(`   Options: ${JSON.stringify(registrationOptions, null, 2)}`));
        return;
      }

      const result = await ens.register(name, registrationOptions);
      displayResult('Registration', result);
    } catch (error) {
      console.error(chalk.red(`Registration failed: ${error.message}`));
      process.exit(1);
    }
  });

// Set resolver command
program
  .command('set-resolver <name>')
  .description('Set resolver for a domain')
  .option('-a, --address <address>', 'Resolver address')
  .action(async (name, options) => {
    try {
      const ens = await initializeENS();

      if (!options.address) {
        throw new Error('Resolver address is required');
      }

      if (program.opts().dryRun) {
        console.log(chalk.blue('Dry run mode - transaction preview:'));
        console.log(chalk.gray(`   Name: ${name}`));
        console.log(chalk.gray(`   Resolver: ${options.address}`));
        return;
      }

      const result = await ens.setResolver(name, options.address);
      displayResult('Set Resolver', result);
    } catch (error) {
      console.error(chalk.red(`Set resolver failed: ${error.message}`));
      process.exit(1);
    }
  });

// Set fuses command
program
  .command('set-fuses <name>')
  .description('Set fuses for a wrapped name (ENSv3)')
  .option('-f, --fuses <fuses>', 'Fuse value or template name')
  .option('-t, --template <template>', 'Fuse template (locked, immutable, subdomain-locked)')
  .action(async (name, options) => {
    try {
      const ens = await initializeENS();

      const fuses = options.fuses || options.template;
      if (!fuses) {
        throw new Error('Fuses or template is required');
      }

      if (program.opts().dryRun) {
        console.log(chalk.blue('Dry run mode - transaction preview:'));
        console.log(chalk.gray(`   Name: ${name}`));
        console.log(chalk.gray(`   Fuses: ${fuses}`));
        return;
      }

      const result = await ens.setFuses(name, fuses);
      displayResult('Set Fuses', result);
    } catch (error) {
      console.error(chalk.red(`Set fuses failed: ${error.message}`));
      process.exit(1);
    }
  });

// Set record command
program
  .command('set-record <name>')
  .description('Set resolver records')
  .option('-a, --address <address>', 'Set ETH address')
  .option('-c, --coin-type <type>', 'Coin type for multicoin address', '0')
  .option('-t, --text <key=value>', 'Set text record (format: key=value)')
  .option('-h, --content-hash <hash>', 'Set content hash')
  .action(async (name, options) => {
    try {
      const ens = await initializeENS();
      const results = [];

      if (options.address) {
        const coinType = parseInt(options.coinType);
        const result = await ens.setAddress(name, options.address, coinType);
        results.push({ type: 'address', result });
      }

      if (options.text) {
        const [key, value] = options.text.split('=');
        if (!key || !value) {
          throw new Error('Text record format must be key=value');
        }
        const result = await ens.setText(name, key, value);
        results.push({ type: 'text', key, value, result });
      }

      if (options.contentHash) {
        const result = await ens.setContentHash(name, options.contentHash);
        results.push({ type: 'contentHash', result });
      }

      if (results.length === 0) {
        throw new Error('No records specified');
      }

      displayResult('Set Records', results);
    } catch (error) {
      console.error(chalk.red(`Set record failed: ${error.message}`));
      process.exit(1);
    }
  });

// Reverse command
program
  .command('reverse')
  .description('Manage reverse records')
  .option('-a, --address <address>', 'Address to set reverse record for')
  .option('-n, --name <name>', 'Name to set as reverse record')
  .option('-c, --claim', 'Claim reverse record for address')
  .option('-s, --resolver <address>', 'Resolver address for claim')
  .action(async (options) => {
    try {
      const ens = await initializeENS();

      if (options.claim) {
        if (!options.address) {
          throw new Error('Address is required for claiming');
        }

        if (program.opts().dryRun) {
          console.log(chalk.blue('Dry run mode - transaction preview:'));
          console.log(chalk.gray(`   Address: ${options.address}`));
          console.log(chalk.gray(`   Resolver: ${options.resolver || 'default'}`));
          return;
        }

        const result = await ens.claimReverseRecord(options.address, options.resolver);
        displayResult('Claim Reverse Record', result);
      } else {
        if (!options.address || !options.name) {
          throw new Error('Both address and name are required');
        }

        if (program.opts().dryRun) {
          console.log(chalk.blue('Dry run mode - transaction preview:'));
          console.log(chalk.gray(`   Address: ${options.address}`));
          console.log(chalk.gray(`   Name: ${options.name}`));
          return;
        }

        const result = await ens.setReverseRecord(options.address, options.name);
        displayResult('Set Reverse Record', result);
      }
    } catch (error) {
      console.error(chalk.red(`Reverse operation failed: ${error.message}`));
      process.exit(1);
    }
  });

// Info command
program
  .command('info <name>')
  .description('Get information about a domain')
  .option('-f, --show-fuses', 'Show fuse information')
  .option('-s, --show-subdomains', 'Show subdomains')
  .action(async (name, options) => {
    try {
      const ens = await initializeENS();

      const info = await ens.getInfo(name);
      const exists = await ens.nameExists(name);

      if (!exists) {
        console.log(chalk.yellow(`Warning: Domain ${name} does not exist`));
        return;
      }

      displayInfo(name, info, options);
    } catch (error) {
      console.error(chalk.red(`Get info failed: ${error.message}`));
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('Show available fuse templates')
  .action(async () => {
    try {
      // Load templates directly from config without wallet connection
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const contractsConfig = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'lib', 'ens-contracts.json'), 'utf8')
      );

      const templates = contractsConfig.fuseTemplates;
      const definitions = contractsConfig.fuseDefinitions;

      console.log(chalk.blue('\nAvailable Fuse Templates:'));
      console.log('═'.repeat(50));

      for (const [name, template] of Object.entries(templates)) {
        console.log(chalk.cyan(`\n${name}:`));
        console.log(chalk.gray(`  Description: ${template.description}`));
        console.log(chalk.gray(`  Fuses: ${template.fuses.join(', ')}`));
      }

      console.log(chalk.blue('\nFuse Definitions:'));
      console.log('═'.repeat(50));

      for (const [name, def] of Object.entries(definitions)) {
        const security =
          def.security === 'CRITICAL'
            ? chalk.red(def.security)
            : def.security === 'HIGH'
              ? chalk.yellow(def.security)
              : def.security === 'MEDIUM'
                ? chalk.blue(def.security)
                : chalk.gray(def.security);

        console.log(chalk.cyan(`${name}:`));
        console.log(chalk.gray(`  Bit: ${def.bit}`));
        console.log(chalk.gray(`  Security: ${security}`));
        console.log(chalk.gray(`  Description: ${def.description}`));
        console.log('');
      }
    } catch (error) {
      console.error(chalk.red(`Get templates failed: ${error.message}`));
      process.exit(1);
    }
  });

// Initialize ENS operations
async function initializeENS() {
  const options = program.opts();
  let provider = null;
  let signer = null;

  if (options.rpcUrl) {
    // Node.js mode with RPC
    if (!options.privateKey) {
      throw new Error('Private key is required when using RPC URL');
    }

    const walletConnector = new ENSWalletConnector();
    const connection = await walletConnector.connectWithRPC(options.rpcUrl, options.privateKey);
    provider = connection.provider;
    signer = connection.signer;
  } else if (isBrowser()) {
    // Browser mode with wallet
    const walletConnector = new ENSWalletConnector();
    const connection = await walletConnector.connect();
    provider = connection.provider;
    signer = connection.signer;
  } else {
    throw new Error(
      'No wallet connection available. Use --rpc-url and --private-key for Node.js mode.'
    );
  }

  return new ENSOperations(provider, signer, options.network);
}

// Display result
function displayResult(operation, result) {
  const outputFormat = program.opts().output;

  if (outputFormat === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else if (outputFormat === 'minimal') {
    console.log(result.hash || 'Success');
  } else {
    console.log(chalk.green(`\n${operation} completed successfully.`));
    console.log(chalk.gray(`   Transaction: ${result.hash}`));
    if (result.receipt) {
      console.log(chalk.gray(`   Block: ${result.receipt.blockNumber}`));
      console.log(chalk.gray(`   Gas used: ${result.receipt.gasUsed.toString()}`));
    }
  }
}

// Display domain information
function displayInfo(name, info, options) {
  const outputFormat = program.opts().output;

  if (outputFormat === 'json') {
    console.log(JSON.stringify(info, null, 2));
    return;
  }

  console.log(chalk.blue(`\nDomain Information: ${name}`));
  console.log('═'.repeat(50));
  console.log(chalk.gray(`   Node: ${info.node}`));
  console.log(chalk.gray(`   Owner: ${info.owner}`));
  console.log(chalk.gray(`   Resolver: ${info.resolver}`));
  console.log(chalk.gray(`   Wrapped: ${info.isWrapped ? 'Yes' : 'No'}`));

  if (info.ttl) {
    console.log(chalk.gray(`   TTL: ${info.ttl}`));
  }

  if (info.expiry) {
    console.log(chalk.gray(`   Expiry: ${new Date(info.expiry * 1000).toISOString()}`));
  }

  if (options.showFuses && info.isWrapped) {
    console.log(chalk.blue('\nFuse Information:'));
    console.log('═'.repeat(30));
    console.log(chalk.gray(`   Fuses: ${info.fuses}`));

    if (info.burnedFuses && info.burnedFuses.length > 0) {
      console.log(chalk.gray('   Burned fuses:'));
      for (const fuse of info.burnedFuses) {
        const security =
          fuse.security === 'CRITICAL'
            ? chalk.red(fuse.security)
            : fuse.security === 'HIGH'
              ? chalk.yellow(fuse.security)
              : fuse.security === 'MEDIUM'
                ? chalk.blue(fuse.security)
                : chalk.gray(fuse.security);
        console.log(chalk.gray(`     - ${fuse.name} (${security}): ${fuse.description}`));
      }
    }
  }

  if (options.showSubdomains) {
    console.log(chalk.blue('\nSubdomains:'));
    console.log('═'.repeat(20));
    console.log(chalk.gray('   (Subdomain listing requires subgraph queries)'));
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red(`Uncaught error: ${error.message}`));
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red(`Unhandled rejection: ${error.message}`));
  process.exit(1);
});

// Parse command line arguments
program.parse();
