#!/usr/bin/env node

/**
 * Enhanced ENS Contract Resolver Prober
 *
 * Advanced contract discovery and analysis tool using the ENSContractResolver API
 */

import { ENSContractResolver } from '../lib/contract-resolver.js';
import chalk from 'chalk';

// Popular ENS names that are likely to be contracts
const POPULAR_CONTRACT_NAMES = [
  'uniswap.eth',
  'aave.eth',
  'compound.eth',
  'makerdao.eth',
  'sushiswap.eth',
  '1inch.eth',
  'balancer.eth',
  'yearn.eth',
  'curve.eth',
  'synthetix.eth',
  'chainlink.eth',
  'opensea.eth',
  'ens.eth',
  'dydx.eth',
  'arbitrum.eth',
  'polygon.eth',
  'optimism.eth',
  'metamask.eth',
  'coinbase.eth',
  'binance.eth',
  'kraken.eth',
  'gemini.eth',
  'huobi.eth',
  'okex.eth',
  'kucoin.eth',
  'bybit.eth',
  'ftx.eth',
  'pancakeswap.eth',
  'quickswap.eth',
  'sushiswap.eth',
  'traderjoe.eth',
  'spookyswap.eth',
  'spiritswap.eth',
  'fantom.eth',
  'avalanche.eth',
  'solana.eth',
  'cardano.eth',
  'polkadot.eth',
  'cosmos.eth',
  'near.eth',
  'algorand.eth',
  'flow.eth',
  'hedera.eth',
  'vechain.eth',
  'iotex.eth',
  'harmony.eth',
  'elrond.eth',
  'theta.eth',
  'tezos.eth',
  'eos.eth',
  'tron.eth',
  'stellar.eth',
  'ripple.eth',
  'bitcoin.eth',
  'ethereum.eth',
  'litecoin.eth',
  'dogecoin.eth',
  'monero.eth',
  'zcash.eth',
  'dash.eth',
  'decred.eth',
  'digibyte.eth',
  'vertcoin.eth',
  'groestlcoin.eth',
  'ravencoin.eth',
  'namecoin.eth',
  'peercoin.eth',
  'feathercoin.eth',
  'primecoin.eth',
  'novacoin.eth',
  'terracoin.eth',
  'worldcoin.eth',
  'faircoin.eth',
  'blackcoin.eth',
  'auroracoin.eth',
  'digitalcoin.eth',
  'maxcoin.eth',
  'phoenixcoin.eth',
  'infinium-8.eth',
  'quarkcoin.eth',
  'yacoin.eth',
  'zetacoin.eth',
  'fastcoin.eth',
  'ixcoin.eth',
  'devcoin.eth',
  'freicoin.eth',
  'terracoin.eth',
  'ppcoin.eth',
  'nxtcoin.eth',
  'burstcoin.eth',
  'reddcoin.eth',
  'feathercoin.eth',
  'potcoin.eth',
  'clamcoin.eth',
  'vericoin.eth',
  'viacoin.eth',
  'lbrycoin.eth',
  'stealthcoin.eth',
  'navcoin.eth',
  'pivx.eth',
  'dashpay.eth',
  'monacoin.eth',
  'auroracoin.eth',
  'digitalcoin.eth',
  'maxcoin.eth',
  'phoenixcoin.eth',
  'infinium-8.eth',
  'quarkcoin.eth',
  'yacoin.eth',
  'zetacoin.eth',
  'fastcoin.eth',
  'ixcoin.eth',
  'devcoin.eth',
  'freicoin.eth',
  'terracoin.eth',
  'ppcoin.eth',
  'nxtcoin.eth',
  'burstcoin.eth',
  'reddcoin.eth',
  'feathercoin.eth',
  'potcoin.eth',
  'clamcoin.eth',
  'vericoin.eth',
  'viacoin.eth',
  'lbrycoin.eth',
  'stealthcoin.eth',
  'navcoin.eth',
  'pivx.eth',
  'dashpay.eth'
];

// Additional contract names to check
const ADDITIONAL_CONTRACT_NAMES = [
  'usdc.eth',
  'usdt.eth',
  'dai.eth',
  'weth.eth',
  'wbtc.eth',
  'link.eth',
  'matic.eth',
  'avax.eth',
  'ftt.eth',
  'cro.eth',
  'leo.eth',
  'uni.eth',
  'aave.eth',
  'comp.eth',
  'mkr.eth',
  'snx.eth',
  'crv.eth',
  'yfi.eth',
  'sushi.eth',
  '1inch.eth',
  'bal.eth',
  'ren.eth',
  'knc.eth',
  'zrx.eth',
  'bat.eth',
  'mana.eth',
  'enj.eth',
  'sand.eth',
  'gala.eth',
  'axs.eth',
  'slp.eth',
  'ilx.eth',
  'rari.eth',
  'cream.eth',
  'alpha.eth',
  'pickle.eth',
  'dodo.eth',
  'perp.eth',
  'dexe.eth',
  'hegic.eth',
  'opium.eth',
  'cover.eth',
  'armor.eth',
  'nexus.eth',
  'sashimi.eth',
  'sake.eth',
  'value.eth'
];

async function main() {
  try {
    console.log(chalk.blue('ENS Contract Resolver Prober - Advanced Contract Discovery'));
    console.log(chalk.gray('=' .repeat(70)));

    // Initialize the resolver
    const resolver = new ENSContractResolver({
      rpcUrl: process.env.RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      enableMetrics: true,
      enableCaching: true
    });

    // Set up event listeners
    resolver.on('resolutionComplete', (data) => {
      console.log(chalk.green(`Resolved: ${data.ensName} -> ${data.result.contractAddress}`));
    });

    resolver.on('resolutionError', (data) => {
      console.log(chalk.red(`Error resolving ${data.ensName}: ${data.error}`));
    });

    // Combine all contract names to check
    const allContractNames = [...POPULAR_CONTRACT_NAMES, ...ADDITIONAL_CONTRACT_NAMES];
    console.log(chalk.blue(`Checking ${allContractNames.length} potential contract names...`));

    // Resolve contracts in batch
    const batchResult = await resolver.resolveContractsBatch(allContractNames);

    // Display results
    console.log(chalk.blue('\nResolution Summary:'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log(`Total names processed: ${batchResult.summary.total}`);
    console.log(`Successful resolutions: ${chalk.green(batchResult.summary.successful)}`);
    console.log(`Failed resolutions: ${chalk.red(batchResult.summary.failed)}`);
    console.log(`Performance: ${batchResult.performance.requestsPerSecond.toFixed(2)} req/s`);
    console.log(`Cache hit rate: ${(resolver.getMetrics().cacheHitRate * 100).toFixed(1)}%`);

    // Display found contracts
    if (batchResult.results.length > 0) {
      console.log(chalk.blue('\nFound Contract Domains:'));
      console.log(chalk.gray('-'.repeat(50)));

      batchResult.results.forEach((result, index) => {
        if (result) {
          console.log(chalk.cyan(`\n${index + 1}. ${result.ensName}`));
          console.log(`   Contract: ${chalk.yellow(result.contractAddress)}`);
          console.log(`   Resolver: ${chalk.gray(result.resolverAddress)}`);
          console.log(`   Network: ${result.network}`);
          console.log(`   Verified: ${result.isVerified ? chalk.green('Yes') : chalk.red('No')}`);

          if (result.metadata.name !== 'Unknown Contract') {
            console.log(`   Name: ${result.metadata.name}`);
            console.log(`   Symbol: ${result.metadata.symbol}`);
            console.log(`   Decimals: ${result.metadata.decimals}`);
          }

          console.log(`   Tags: ${result.metadata.tags.join(', ')}`);
        }
      });
    }

    // Show errors if any
    if (batchResult.summary.errors.length > 0) {
      console.log(chalk.blue('\nErrors:'));
      batchResult.summary.errors.forEach(error => {
        console.log(chalk.red(`   ${error}`));
      });
    }

    // Show performance metrics
    const metrics = resolver.getMetrics();
    console.log(chalk.blue('\nPerformance Metrics:'));
    console.log(chalk.gray('-'.repeat(30)));
    console.log(`Total requests: ${metrics.requests}`);
    console.log(`Cache hits: ${metrics.hits}`);
    console.log(`Cache misses: ${metrics.misses}`);
    console.log(`Cache hit rate: ${chalk.cyan((metrics.cacheHitRate * 100).toFixed(1) + '%')}`);
    console.log(`Errors: ${metrics.errors}`);
    console.log(`Average response time: ${chalk.cyan(metrics.averageRequestTime.toFixed(2) + 'ms')}`);

    // Show cache stats
    const cacheStats = resolver.getCacheStats();
    console.log(chalk.blue('\nCache Statistics:'));
    console.log(`Cache size: ${cacheStats.size} entries`);
    console.log(`Max age: ${cacheStats.maxAge} seconds`);

    console.log(chalk.blue('\nContract resolution complete!'));

  } catch (error) {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
