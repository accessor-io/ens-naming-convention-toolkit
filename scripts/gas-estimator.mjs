#!/usr/bin/env node

/**
 * ENS Contract Metadata Gas Cost & Fee Estimator
 * Estimates gas costs and data-size based fees for storing metadata on-chain
 */

class FeeEstimator {
  constructor() {
    // Base gas costs (EIP-150, EIP-2200)
    this.BASE_STORAGE_COST = 20000; // per storage slot
    this.STRING_OVERHEAD = 256; // per 32 bytes of string data
    this.ARRAY_OVERHEAD = 22000; // dynamic array overhead

    // Fee parameters
    this.BASE_RATE_PER_KB = 0.025; // $0.025 per KB
    this.GAS_PRICE_ADJUSTMENT_HIGH = 1.1; // +10% during high gas
    this.GAS_PRICE_ADJUSTMENT_LOW = 0.9; // -10% during low gas

    // Current market conditions (configurable)
    this.gasPrice = 30; // gwei
    this.ethPrice = 2000; // USD per ETH
  }

  /**
   * Calculate storage cost for MetadataRecord
   */
  calculateMetadataRecordCost(gatewayLength = 50, pathLength = 50) {
    const gatewayCost =
      this.BASE_STORAGE_COST + Math.ceil(gatewayLength / 32) * this.STRING_OVERHEAD;
    const pathCost = this.BASE_STORAGE_COST + Math.ceil(pathLength / 32) * this.STRING_OVERHEAD;

    return {
      bytes32: this.BASE_STORAGE_COST, // metadataHash
      string_gateway: gatewayCost, // gateway URL
      string_path: pathCost, // path
      uint256_timestamp: this.BASE_STORAGE_COST,
      address_attester: this.BASE_STORAGE_COST,
      bool_active: this.BASE_STORAGE_COST,
      uint256_chainId: this.BASE_STORAGE_COST,
      total: this.BASE_STORAGE_COST * 4 + gatewayCost + pathCost,
    };
  }

  /**
   * Calculate ENS metadata storage cost
   */
  calculateENSMetadataCost(metadataJsonSize = 2048) {
    const jsonCost =
      this.BASE_STORAGE_COST + Math.ceil(metadataJsonSize / 32) * this.STRING_OVERHEAD;
    const hashCost = this.BASE_STORAGE_COST;

    return {
      metadata_hash: hashCost,
      metadata_json: jsonCost,
      total: hashCost + jsonCost,
    };
  }

  /**
   * Calculate data-size based fee
   */
  calculateDataSizeFee(gatewayLength = 50, pathLength = 50, metadataSize = 2048) {
    const totalBytes = gatewayLength + pathLength + metadataSize;
    const totalKB = totalBytes / 1024;

    // Base fee
    let feeUSD = totalKB * this.BASE_RATE_PER_KB;

    // Apply gas price adjustment
    if (this.gasPrice > 50) {
      feeUSD *= this.GAS_PRICE_ADJUSTMENT_HIGH;
    } else if (this.gasPrice < 15) {
      feeUSD *= this.GAS_PRICE_ADJUSTMENT_LOW;
    }

    // Convert to wei
    const feeETH = feeUSD / this.ethPrice;
    const feeWei = Math.floor(feeETH * 1e18);

    return {
      totalBytes,
      totalKB,
      feeUSD: Math.round(feeUSD * 100) / 100,
      feeETH: Math.round(feeETH * 10000) / 10000,
      feeWei,
      breakdown: {
        base_fee: totalKB * this.BASE_RATE_PER_KB,
        gas_adjustment: feeUSD - totalKB * this.BASE_RATE_PER_KB,
      },
    };
  }

  /**
   * Calculate cross-chain assignment cost
   */
  calculateCrossChainCost() {
    return {
      signature_verification: 3000,
      storage_write: this.calculateMetadataRecordCost().total,
      replay_protection: this.BASE_STORAGE_COST,
      event_emission: 3000,
      total: 3000 + this.calculateMetadataRecordCost().total + this.BASE_STORAGE_COST + 3000,
    };
  }

  /**
   * Calculate complete registration workflow
   */
  calculateRegistrationWorkflow(gatewayLength = 50, pathLength = 50, metadataSize = 2048) {
    const registryCost = this.calculateMetadataRecordCost(gatewayLength, pathLength);
    const ensCost = this.calculateENSMetadataCost(metadataSize);
    const feeCost = this.calculateDataSizeFee(gatewayLength, pathLength, metadataSize);

    return {
      registry: registryCost.total,
      ens_resolver: ensCost.total,
      fee: feeCost.feeWei,
      total_gas: registryCost.total + ensCost.total,
      total_cost: feeCost.feeWei,
      breakdown: {
        gas: {
          registry: registryCost.total,
          ens: ensCost.total,
          total: registryCost.total + ensCost.total,
        },
        fees: feeCost,
      },
    };
  }

  /**
   * Calculate costs for different data size scenarios
   */
  calculateDataSizeScenarios() {
    const scenarios = {
      small: {
        description: 'Small contract (500B metadata)',
        gatewayLength: 50,
        pathLength: 50,
        metadataSize: 500,
        gasCost: this.calculateMetadataRecordCost(50, 50).total,
        feeCost: this.calculateDataSizeFee(50, 50, 500),
      },
      medium: {
        description: 'Medium contract (2KB metadata)',
        gatewayLength: 100,
        pathLength: 100,
        metadataSize: 2048,
        gasCost: this.calculateMetadataRecordCost(100, 100).total,
        feeCost: this.calculateDataSizeFee(100, 100, 2048),
      },
      large: {
        description: 'Large contract (10KB metadata)',
        gatewayLength: 200,
        pathLength: 200,
        metadataSize: 10240,
        gasCost: this.calculateMetadataRecordCost(200, 200).total,
        feeCost: this.calculateDataSizeFee(200, 200, 10240),
      },
      enterprise: {
        description: 'Enterprise contract (50KB metadata)',
        gatewayLength: 500,
        pathLength: 500,
        metadataSize: 51200,
        gasCost: this.calculateMetadataRecordCost(500, 500).total,
        feeCost: this.calculateDataSizeFee(500, 500, 51200),
      },
    };

    return scenarios;
  }

  /**
   * Convert gas to ETH and USD
   */
  convertToFiat(gasAmount) {
    const ethAmount = (gasAmount * this.gasPrice) / 1e9; // Convert gwei to ETH
    const usdAmount = ethAmount * this.ethPrice;

    return {
      gas: gasAmount,
      eth: ethAmount,
      usd: usdAmount,
    };
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('='.repeat(80));
    console.log('ENS CONTRACT METADATA - DATA-SIZE BASED FEE SYSTEM');
    console.log('='.repeat(80));
    console.log();

    console.log('FEE MODEL: Pay per KB of calldata processed');
    console.log(`Base Rate: $${this.BASE_RATE_PER_KB}/KB`);
    console.log(`Gas Price: ${this.gasPrice} gwei`);
    console.log(`ETH Price: $${this.ethPrice}`);
    console.log();

    console.log('DATA SIZE SCENARIOS:');
    console.log();

    const scenarios = this.calculateDataSizeScenarios();
    Object.entries(scenarios).forEach(([key, scenario]) => {
      const gasFiat = this.convertToFiat(scenario.gasCost);

      console.log(`${key.toUpperCase()}: ${scenario.description}`);
      console.log(
        `- Data Size: ${scenario.feeCost.totalKB.toFixed(1)}KB (${scenario.feeCost.totalBytes} bytes)`
      );
      console.log(
        `- Gas Cost: ${scenario.gasCost.toLocaleString()} gas ($${gasFiat.usd.toFixed(2)})`
      );
      console.log(
        `- Fee Cost: $${scenario.feeCost.feeUSD} (${scenario.feeCost.feeETH.toFixed(4)} ETH)`
      );
      console.log(`- Total Cost: $${(gasFiat.usd + scenario.feeCost.feeUSD).toFixed(2)}`);
      console.log();
    });

    console.log('ANNUAL PROJECTIONS (1,000 contracts, 3KB average):');
    console.log();

    const avgScenario = scenarios.medium;
    const avgGasCost = avgScenario.gasCost;
    const avgFeeCost = avgScenario.feeCost.feeUSD;

    const annualGas = avgGasCost * 1000 * 3;
    const annualFees = avgFeeCost * 1000 * 3;
    const totalAnnual = annualGas + annualFees;

    const gasFiat = this.convertToFiat(annualGas);

    console.log(
      `- Total Gas Cost: ${annualGas.toLocaleString()} gas ($${gasFiat.usd.toLocaleString()})`
    );
    console.log(`- Total Fee Revenue: $${annualFees.toLocaleString()}`);
    console.log(`- Combined Annual Cost: $${totalAnnual.toLocaleString()}`);
    console.log();

    console.log('='.repeat(80));
    console.log('ADVANTAGES OF DATA-SIZE BASED PRICING:');
    console.log('• Transparent: Pay exactly for resources used');
    console.log('• Fair: No volume gaming or artificial discounts');
    console.log('• Simple: No complex monthly tracking');
    console.log('• Scalable: Automatically scales with ecosystem');
    console.log('='.repeat(80));
  }
}

// CLI Interface
function main() {
  const estimator = new FeeEstimator();

  if (process.argv.length > 2) {
    const command = process.argv[2];

    switch (command) {
      case 'small':
        const small = estimator.calculateDataSizeFee(50, 50, 500);
        console.log(`Small contract fee: $${small.feeUSD} (${small.totalKB.toFixed(1)}KB)`);
        break;

      case 'medium':
        const medium = estimator.calculateDataSizeFee(100, 100, 2048);
        console.log(`Medium contract fee: $${medium.feeUSD} (${medium.totalKB.toFixed(1)}KB)`);
        break;

      case 'large':
        const large = estimator.calculateDataSizeFee(200, 200, 10240);
        console.log(`Large contract fee: $${large.feeUSD} (${large.totalKB.toFixed(1)}KB)`);
        break;

      case 'enterprise':
        const enterprise = estimator.calculateDataSizeFee(500, 500, 51200);
        console.log(
          `Enterprise contract fee: $${enterprise.feeUSD} (${enterprise.totalKB.toFixed(1)}KB)`
        );
        break;

      case 'gas':
        const gasCost = estimator.calculateMetadataRecordCost();
        const gasFiat = estimator.convertToFiat(gasCost.total);
        console.log(`Gas cost: ${gasCost.total.toLocaleString()} gas ($${gasFiat.usd.toFixed(2)})`);
        break;

      case 'scenario':
        const scenarioName = process.argv[3];
        if (scenarioName && estimator.calculateDataSizeScenarios()[scenarioName]) {
          const scenario = estimator.calculateDataSizeScenarios()[scenarioName];
          const gasFiat = estimator.convertToFiat(scenario.gasCost);
          console.log(`${scenarioName}: ${scenario.description}`);
          console.log(`Data: ${scenario.feeCost.totalKB.toFixed(1)}KB`);
          console.log(`Gas: ${scenario.gasCost.toLocaleString()} ($${gasFiat.usd.toFixed(2)})`);
          console.log(`Fee: $${scenario.feeCost.feeUSD}`);
        } else {
          console.log('Available scenarios: small, medium, large, enterprise');
        }
        break;

      default:
        console.log(
          'Usage: node gas-estimator.mjs [small|medium|large|enterprise|gas|scenario <name>]'
        );
    }
  } else {
    estimator.generateReport();
  }
}

// Export for use as module
module.exports = FeeEstimator;

// Run CLI if called directly
if (require.main === module) {
  main();
}
