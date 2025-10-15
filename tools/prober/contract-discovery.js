#!/usr/bin/env node

/**
 * Contract Discovery
 *
 * Discovers whether provided Ethereum addresses are contracts by checking on-chain bytecode.
 * Supports input via CLI args or newline-delimited stdin.
 */

import { ethers } from 'ethers';
import chalk from 'chalk';

function printHelp() {
  console.log('\nContract Discovery');
  console.log('='.repeat(20));
  console.log('Usage: node contract-discovery.js [options] [addresses...]');
  console.log('\nOptions:');
  console.log('  --rpc <url>         Ethereum RPC URL (default: process.env.RPC_URL)');
  console.log('  --stdin             Read newline-delimited addresses from stdin');
  console.log('  --json              Output JSON only');
  console.log('\nExamples:');
  console.log('  node contract-discovery.js 0x00000000219ab540356cBB839Cbe05303d7705Fa');
  console.log('  node contract-discovery.js --stdin');
}

function normalizeAddress(input) {
  if (!input) return null;
  const trimmed = input.trim();
  try {
    return ethers.utils.getAddress(trimmed);
  } catch (e) {
    return null;
  }
}

async function isContractAddress(provider, address) {
  try {
    const code = await provider.getCode(address);
    // A contract has non-empty bytecode (not '0x')
    return code && code !== '0x';
  } catch (e) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // Parse options
  let rpcUrl = process.env.RPC_URL || '';
  let readFromStdin = false;
  let jsonOnly = false;
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--rpc' && args[i + 1] && !args[i + 1].startsWith('--')) {
      rpcUrl = args[i + 1];
      i++;
      continue;
    }
    if (arg === '--stdin') {
      readFromStdin = true;
      continue;
    }
    if (arg === '--json') {
      jsonOnly = true;
      continue;
    }
    positional.push(arg);
  }

  if (!rpcUrl) {
    console.error(chalk.red('RPC URL not provided. Use --rpc or set RPC_URL.'));
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Collect addresses
  let inputs = positional;
  if (readFromStdin) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk.toString());
    }
    const text = chunks.join('');
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    inputs = inputs.concat(lines);
  }

  if (inputs.length === 0) {
    printHelp();
    process.exit(1);
  }

  const uniqueNormalized = Array.from(new Set(inputs.map(normalizeAddress).filter(Boolean)));
  if (uniqueNormalized.length === 0) {
    console.error(chalk.red('No valid Ethereum addresses provided.'));
    process.exit(1);
  }

  if (!jsonOnly) {
    console.log(chalk.blue('Contract Discovery'));
    console.log(chalk.gray('-'.repeat(40)));
    console.log(`Addresses to check: ${uniqueNormalized.length}`);
  }

  const results = [];
  for (const addr of uniqueNormalized) {
    // eslint-disable-next-line no-await-in-loop
    const isContract = await isContractAddress(provider, addr);
    results.push({ address: addr, isContract });
    if (!jsonOnly) {
      const status = isContract ? chalk.green('CONTRACT') : chalk.yellow('EOA/No Code');
      console.log(`${addr} -> ${status}`);
    }
  }

  if (jsonOnly) {
    process.stdout.write(JSON.stringify({ results }, null, 2) + '\n');
  }
}

main().catch((err) => {
  console.error(chalk.red('Fatal error:'), err?.message || String(err));
  process.exit(1);
});
