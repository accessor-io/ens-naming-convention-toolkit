#!/usr/bin/env node

/**
 * ENS Metadata Deployment Script
 *
 * Orchestrates metadata generation and deployment for ENS subdomains.
 * Supports batch processing, error handling, and rollback capabilities.
 */

import { generateMetadata } from '../../bin/metadata-generator.mjs';
import { ENSOperations } from '../../lib/ens-operations.js';
import { ENSWalletConnector } from '../../lib/ens-wallet-connector.js';
import fs from 'fs';
import path from 'path';

/**
 * Deployment configuration
 */
const DEPLOYMENT_CONFIG = {
  // Network configuration
  network: process.env.NETWORK || 'mainnet',
  rpcUrl: process.env.RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
  privateKey: process.env.PRIVATE_KEY,

  // Deployment settings
  dryRun: process.env.DRY_RUN === 'true',
  batchSize: parseInt(process.env.BATCH_SIZE) || 10,
  delayBetweenTxns: parseInt(process.env.DELAY_BETWEEN_TXNS) || 1000,

  // Output configuration
  outputDir: process.env.OUTPUT_DIR || './deployment-output',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Metadata settings
  metadataDir: process.env.METADATA_DIR || './data/metadata',
  templatesDir: process.env.TEMPLATES_DIR || './data/templates',
};

/**
 * Protocol deployment configurations
 */
const PROTOCOL_DEPLOYMENTS = [
  {
    category: 'defi',
    type: 'amm',
    name: 'Uniswap',
    version: '3',
    subdomains: [
      'amm.uniswap.defi.eth',
      'factory.amm.uniswap.defi.eth',
      'router.amm.uniswap.defi.eth',
      'quoter.amm.uniswap.defi.eth',
      'positions.amm.uniswap.defi.eth',
    ],
  },
  {
    category: 'dao',
    type: 'governor',
    name: 'ENS',
    version: '1',
    subdomains: [
      'dao.ens.eth',
      'governance.dao.ens.eth',
      'governor.governance.dao.ens.eth',
      'token.governance.dao.ens.eth',
      'timelock.governance.dao.ens.eth',
      'treasury.governance.dao.ens.eth',
    ],
  },
];

/**
 * Logger utility
 */
class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }

  log(level, message, data = null) {
    if (this.levels[level] <= this.levels[this.level]) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }
  warn(message, data = null) {
    this.log('warn', message, data);
  }
  error(message, data = null) {
    this.log('error', message, data);
  }
  debug(message, data = null) {
    this.log('debug', message, data);
  }
}

/**
 * Deployment orchestrator
 */
class MetadataDeployment {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.ens = null;
    this.results = {
      successful: [],
      failed: [],
      skipped: [],
    };
  }

  /**
   * Initialize ENS operations
   */
  async initialize() {
    try {
      this.logger.info('Initializing ENS operations...');

      // Initialize wallet connector
      const walletConnector = new ENSWalletConnector({
        network: this.config.network,
        rpcUrl: this.config.rpcUrl,
        privateKey: this.config.privateKey,
      });

      // Initialize ENS operations
      this.ens = new ENSOperations(walletConnector);

      this.logger.info('ENS operations initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ENS operations', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate metadata for a protocol
   */
  async generateProtocolMetadata(protocol) {
    try {
      this.logger.info(
        `Generating metadata for ${protocol.name} ${protocol.category} ${protocol.type}`
      );

      const metadata = generateMetadata(protocol.category, protocol.type, {
        name: protocol.name,
        version: protocol.version,
        category: protocol.category,
        type: protocol.type,
      });

      return metadata;
    } catch (error) {
      this.logger.error(`Failed to generate metadata for ${protocol.name}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Save metadata to file
   */
  async saveMetadata(protocol, metadata) {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.config.outputDir)) {
        fs.mkdirSync(this.config.outputDir, { recursive: true });
      }

      const filename = `${protocol.category}-${protocol.name.toLowerCase()}-metadata.json`;
      const filepath = path.join(this.config.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));

      this.logger.info(`Metadata saved to ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error('Failed to save metadata', { error: error.message });
      throw error;
    }
  }

  /**
   * Deploy subdomain with metadata
   */
  async deploySubdomain(subdomain, metadata) {
    try {
      this.logger.info(`Deploying subdomain: ${subdomain}`);

      if (this.config.dryRun) {
        this.logger.info(`DRY RUN: Would deploy ${subdomain}`);
        this.results.successful.push({ subdomain, dryRun: true });
        return { success: true, dryRun: true, subdomain };
      }

      // Check if subdomain already exists (skip in dry-run)
      if (this.ens) {
        const existingInfo = await this.ens.getInfo(subdomain);

        if (existingInfo.exists) {
          this.logger.warn(`Subdomain ${subdomain} already exists`);
          this.results.skipped.push({ subdomain, reason: 'already exists' });
          return { success: false, skipped: true, subdomain };
        }
      }

      // Deploy the subdomain
      const result = await this.ens.registerSubdomain(subdomain, {
        metadata: JSON.stringify(metadata),
        resolver: process.env.RESOLVER_ADDRESS || '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
      });

      this.logger.info(`Successfully deployed ${subdomain}`, { txHash: result.txHash });
      this.results.successful.push({ subdomain, txHash: result.txHash });

      // Wait between transactions
      if (this.config.delayBetweenTxns > 0) {
        await this.delay(this.config.delayBetweenTxns);
      }

      return { success: true, txHash: result.txHash, subdomain };
    } catch (error) {
      this.logger.error(`Failed to deploy ${subdomain}`, { error: error.message });
      this.results.failed.push({ subdomain, error: error.message });
      return { success: false, error: error.message, subdomain };
    }
  }

  /**
   * Deploy all subdomains for a protocol
   */
  async deployProtocol(protocol) {
    try {
      this.logger.info(`Starting deployment for ${protocol.name} ${protocol.category}`);

      // Generate metadata
      const metadata = await this.generateProtocolMetadata(protocol);

      // Save metadata
      const metadataPath = await this.saveMetadata(protocol, metadata);

      // Deploy each subdomain
      const deploymentResults = [];
      for (let i = 0; i < protocol.subdomains.length; i++) {
        const subdomain = protocol.subdomains[i];
        const result = await this.deploySubdomain(subdomain, metadata);
        deploymentResults.push(result);

        // Add delay between batches
        if ((i + 1) % this.config.batchSize === 0 && i < protocol.subdomains.length - 1) {
          this.logger.info(
            `Completed batch ${Math.floor(i / this.config.batchSize) + 1}, waiting before next batch...`
          );
          await this.delay(this.config.delayBetweenTxns * 2);
        }
      }

      return {
        protocol: protocol.name,
        metadataPath,
        results: deploymentResults,
        summary: this.getDeploymentSummary(deploymentResults),
      };
    } catch (error) {
      this.logger.error(`Failed to deploy protocol ${protocol.name}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Get deployment summary
   */
  getDeploymentSummary(results) {
    return {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success && !r.skipped).length,
      skipped: results.filter((r) => r.skipped).length,
    };
  }

  /**
   * Generate deployment report
   */
  generateReport(protocolResults) {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      summary: {
        totalProtocols: protocolResults.length,
        totalSubdomains: protocolResults.reduce((sum, p) => sum + p.summary.total, 0),
        totalSuccessful: protocolResults.reduce((sum, p) => sum + p.summary.successful, 0),
        totalFailed: protocolResults.reduce((sum, p) => sum + p.summary.failed, 0),
        totalSkipped: protocolResults.reduce((sum, p) => sum + p.summary.skipped, 0),
      },
      protocols: protocolResults,
      details: this.results,
    };

    return report;
  }

  /**
   * Save deployment report
   */
  async saveReport(report) {
    const reportPath = path.join(this.config.outputDir, `deployment-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.logger.info(`Deployment report saved to ${reportPath}`);
    return reportPath;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main deployment function
   */
  async deploy() {
    try {
      this.logger.info('Starting ENS metadata deployment');
      this.logger.info(`Configuration:`, this.config);

      // Initialize ENS (skip in dry-run mode)
      if (!this.config.dryRun) {
        await this.initialize();
      } else {
        this.logger.info('DRY RUN: Skipping ENS initialization');
      }

      // Deploy each protocol
      const protocolResults = [];
      for (const protocol of PROTOCOL_DEPLOYMENTS) {
        const result = await this.deployProtocol(protocol);
        protocolResults.push(result);
      }

      // Generate and save report
      const report = this.generateReport(protocolResults);
      await this.saveReport(report);

      // Display summary
      this.logger.info('Deployment completed');
      this.logger.info('Summary:', report.summary);

      return report;
    } catch (error) {
      this.logger.error('Deployment failed', { error: error.message });
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const logger = new Logger(DEPLOYMENT_CONFIG.logLevel);
  const deployment = new MetadataDeployment(DEPLOYMENT_CONFIG, logger);

  try {
    const report = await deployment.deploy();
    process.exit(0);
  } catch (error) {
    logger.error('Deployment script failed', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MetadataDeployment, DEPLOYMENT_CONFIG, PROTOCOL_DEPLOYMENTS };
