#!/usr/bin/env node

/**
 * ENS Wallet Connector
 *
 * Handles wallet connection for ENS operations via browser extensions
 * Supports MetaMask, WalletConnect, and other EIP-1193 compatible wallets
 */

import { ethers } from 'ethers';
import chalk from 'chalk';

export class ENSWalletConnector {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.connected = false;
    this.network = null;
  }

  /**
   * Connect to browser wallet
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection result
   */
  async connect(options = {}) {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        throw new Error(
          'Wallet connection requires browser environment. Use --rpc-url for Node.js.'
        );
      }

      // Check for wallet provider
      if (!window.ethereum) {
        throw new Error(
          'No wallet provider found. Please install MetaMask or another Web3 wallet.'
        );
      }

      // Request account access
      console.log(chalk.blue('Connecting to wallet...'));
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.connected = true;

      // Get network info
      this.network = await this.provider.getNetwork();

      // Get account info
      const address = await this.signer.getAddress();
      const balance = await this.signer.getBalance();

      console.log(chalk.green('Wallet connected successfully.'));
      console.log(chalk.gray(`   Address: ${address}`));
      console.log(chalk.gray(`   Network: ${this.network.name} (${this.network.chainId})`));
      console.log(chalk.gray(`   Balance: ${ethers.utils.formatEther(balance)} ETH`));

      return {
        address,
        network: this.network,
        balance: ethers.utils.formatEther(balance),
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error) {
      console.error(chalk.red(`Wallet connection failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Connect with custom RPC URL (for Node.js)
   * @param {string} rpcUrl - RPC endpoint URL
   * @param {string} privateKey - Private key for signing
   * @returns {Promise<Object>} Connection result
   */
  async connectWithRPC(rpcUrl, privateKey) {
    try {
      console.log(chalk.blue('Connecting to RPC provider...'));

      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.connected = true;

      // Get network info
      this.network = await this.provider.getNetwork();

      // Get account info
      const address = await this.signer.getAddress();
      const balance = await this.signer.getBalance();

      console.log(chalk.green('RPC connection successful.'));
      console.log(chalk.gray(`   Address: ${address}`));
      console.log(chalk.gray(`   Network: ${this.network.name} (${this.network.chainId})`));
      console.log(chalk.gray(`   Balance: ${ethers.utils.formatEther(balance)} ETH`));

      return {
        address,
        network: this.network,
        balance: ethers.utils.formatEther(balance),
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error) {
      console.error(chalk.red(`RPC connection failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Switch to a different network
   * @param {number} chainId - Target chain ID
   * @returns {Promise<boolean>} Success status
   */
  async switchNetwork(chainId) {
    if (!this.connected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      // Update network info
      this.network = await this.provider.getNetwork();
      console.log(chalk.green(`Switched to network: ${this.network.name}`));
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added to wallet
        throw new Error(`Network ${chainId} not found in wallet. Please add it manually.`);
      }
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise<Object>} Gas estimate
   */
  async estimateGas(transaction) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      const gasPrice = await this.provider.getGasPrice();

      return {
        gasLimit: gasEstimate,
        gasPrice,
        estimatedCost: gasEstimate.mul(gasPrice),
      };
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }

  /**
   * Send a transaction with confirmation
   * @param {Object} transaction - Transaction object
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction result
   */
  async sendTransaction(transaction, options = {}) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Estimate gas if not provided
      if (!transaction.gasLimit) {
        const gasEstimate = await this.estimateGas(transaction);
        transaction.gasLimit = gasEstimate.gasLimit;
      }

      // Show transaction preview
      if (options.preview !== false) {
        await this.previewTransaction(transaction);
      }

      // Send transaction
      console.log(chalk.blue('Sending transaction...'));
      const tx = await this.signer.sendTransaction(transaction);

      console.log(chalk.yellow(`Transaction sent: ${tx.hash}`));
      console.log(chalk.gray(`   Waiting for confirmation...`));

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log(chalk.green('Transaction confirmed.'));
      console.log(chalk.gray(`   Block: ${receipt.blockNumber}`));
      console.log(chalk.gray(`   Gas used: ${receipt.gasUsed.toString()}`));

      return {
        hash: tx.hash,
        receipt,
        success: receipt.status === 1,
      };
    } catch (error) {
      console.error(chalk.red(`Transaction failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Preview transaction before sending
   * @param {Object} transaction - Transaction object
   */
  async previewTransaction(transaction) {
    const gasEstimate = await this.estimateGas(transaction);
    const gasPrice = await this.provider.getGasPrice();
    const cost = gasEstimate.gasLimit.mul(gasPrice);

    console.log(chalk.blue('\nTransaction Preview:'));
    console.log(chalk.gray(`   To: ${transaction.to}`));
    console.log(
      chalk.gray(
        `   Value: ${transaction.value ? ethers.utils.formatEther(transaction.value) : '0'} ETH`
      )
    );
    console.log(chalk.gray(`   Gas Limit: ${gasEstimate.gasLimit.toString()}`));
    console.log(chalk.gray(`   Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`));
    console.log(chalk.gray(`   Estimated Cost: ${ethers.utils.formatEther(cost)} ETH`));

    if (transaction.data) {
      console.log(chalk.gray(`   Data: ${transaction.data.substring(0, 42)}...`));
    }
  }

  /**
   * Get current connection status
   * @returns {Object} Connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      network: this.network,
      provider: this.provider,
      signer: this.signer,
    };
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.connected = false;
    this.network = null;
    console.log(chalk.gray('Wallet disconnected'));
  }
}

/**
 * Utility function to detect if running in browser
 * @returns {boolean} True if in browser environment
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Utility function to get network name from chain ID
 * @param {number} chainId - Chain ID
 * @returns {string} Network name
 */
export function getNetworkName(chainId) {
  const networks = {
    1: 'mainnet',
    5: 'goerli',
    11155111: 'sepolia',
    137: 'polygon',
    42161: 'arbitrum',
    10: 'optimism',
  };
  return networks[chainId] || `chain-${chainId}`;
}

export default ENSWalletConnector;
