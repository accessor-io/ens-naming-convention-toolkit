/**
 * ENS Operations Library
 *
 * Core library for ENS naming operations including subname registration,
 * fuse management, resolver configuration, and reverse resolution.
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENSWalletConnector } from './ens-wallet-connector.js';
import type { ENSOperation, ENSOperationResult, ContractInfo, FuseInfo } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract configuration
const CONTRACTS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'ens-contracts.json'), 'utf8')
);

export class ENSOperations {
  private provider: ethers.providers.Provider | null;
  private signer: ethers.Signer | null;
  private network: string;
  private contracts: Record<string, ethers.Contract>;
  private walletConnector: ENSWalletConnector;

  constructor(
    provider: ethers.providers.Provider | null = null,
    signer: ethers.Signer | null = null,
    network = 'mainnet'
  ) {
    this.provider = provider;
    this.signer = signer;
    this.network = network;
    this.contracts = this.loadContracts();
    this.walletConnector = new ENSWalletConnector();
  }

  /**
   * Load contract instances for the current network
   */
  private loadContracts(): Record<string, ethers.Contract> {
    const networkConfig = CONTRACTS_CONFIG.networks[this.network];
    if (!networkConfig) {
      throw new Error(`Network ${this.network} not supported`);
    }

    const contracts: Record<string, ethers.Contract> = {};
    const abis = CONTRACTS_CONFIG.abis;

    // Create contract instances
    contracts.registry = new ethers.Contract(
      networkConfig.contracts.registry,
      abis.registry,
      this.signer || this.provider || undefined
    );

    contracts.nameWrapper = new ethers.Contract(
      networkConfig.contracts.nameWrapper,
      abis.nameWrapper,
      this.signer || this.provider || undefined
    );

    contracts.publicResolver = new ethers.Contract(
      networkConfig.contracts.publicResolver,
      abis.publicResolver,
      this.signer || this.provider || undefined
    );

    contracts.reverseRegistrar = new ethers.Contract(
      networkConfig.contracts.reverseRegistrar,
      abis.reverseRegistrar,
      this.signer || this.provider || undefined
    );

    return contracts;
  }

  /**
   * Get namehash for a domain name
   */
  namehash(name: string): string {
    return ethers.utils.namehash(name);
  }

  /**
   * Get labelhash for a label
   */
  labelhash(label: string): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label));
  }

  /**
   * Check if a name is wrapped (ENSv3)
   */
  async isWrapped(name: string): Promise<boolean> {
    const node = this.namehash(name);
    try {
      return await this.contracts.nameWrapper!.isWrapped(node);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get name information
   */
  async getInfo(name: string): Promise<ContractInfo> {
    const node = this.namehash(name);
    const isWrapped = await this.isWrapped(name);

    const info: ContractInfo = {
      name,
      node,
      isWrapped,
      owner: null,
      resolver: null,
      ttl: null,
      fuses: null,
      expiry: null,
    };

    try {
      if (isWrapped) {
        // ENSv3 - NameWrapper
        const [owner, fuses, expiry] = await this.contracts.nameWrapper!.getData(node);
        info.owner = owner;
        info.fuses = fuses.toNumber();
        info.expiry = expiry.toNumber();

        // Get resolver from registry
        info.resolver = await this.contracts.registry!.resolver(node);
      } else {
        // ENSv2 - Registry
        info.owner = await this.contracts.registry!.owner(node);
        info.resolver = await this.contracts.registry!.resolver(node);
        info.ttl = await this.contracts.registry!.ttl(node);
      }

      return info;
    } catch (error) {
      throw new Error(
        `Failed to get info for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Register a subdomain
   */
  async register(name: string, options: Record<string, unknown> = {}): Promise<ENSOperationResult> {
    const { owner, resolver, ttl, fuses, expiry } = options as {
      owner?: string;
      resolver?: string;
      ttl?: number;
      fuses?: number;
      expiry?: number;
    };

    if (!owner) {
      throw new Error('Owner address is required');
    }

    const node = this.namehash(name);
    const labels = name.split('.');
    const label = labels[0];
    if (!label) {
      throw new Error('Invalid domain name format');
    }
    const parentName = labels.slice(1).join('.');
    const parentNode = this.namehash(parentName);

    // Check if parent is wrapped
    const parentIsWrapped = await this.isWrapped(parentName);

    try {
      if (parentIsWrapped) {
        // ENSv3 - Use NameWrapper
        const defaultFuses = fuses || 0;
        const defaultExpiry = expiry || 0;

        const tx = await this.contracts.nameWrapper!.setSubnodeRecord(
          parentNode,
          label,
          owner,
          resolver || ethers.constants.AddressZero,
          ttl || 0,
          defaultFuses,
          defaultExpiry
        );

        const result = await this.walletConnector.sendTransaction(tx);
        return { success: true, result };
      } else {
        // ENSv2 - Use Registry
        const tx = await this.contracts.registry!.setSubnodeOwner(
          parentNode,
          this.labelhash(label),
          owner
        );

        const result = await this.walletConnector.sendTransaction(tx);

        // Set resolver and TTL if provided
        if (resolver || ttl) {
          const subnode = ethers.utils.keccak256(
            ethers.utils.concat([parentNode, this.labelhash(label)])
          );

          if (resolver) {
            await this.setResolver(name, resolver);
          }
          if (ttl) {
            await this.setTTL(name, ttl);
          }
        }

        return { success: true, result };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to register ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set resolver for a name
   */
  async setResolver(name: string, resolver: string): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    try {
      const tx = await this.contracts.registry!.setResolver(node, resolver);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set resolver for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set TTL for a name (ENSv2 only)
   */
  async setTTL(name: string, ttl: number): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    try {
      const tx = await this.contracts.registry!.setTTL(node, ttl);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set TTL for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set fuses for a wrapped name (ENSv3 only)
   */
  async setFuses(name: string, fuses: number | string): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    // Check if name is wrapped
    const isWrapped = await this.isWrapped(name);
    if (!isWrapped) {
      return {
        success: false,
        error: `${name} is not wrapped. Fuses can only be set on wrapped names.`,
      };
    }

    // Parse fuses if template name provided
    let fuseValue = fuses;
    if (typeof fuses === 'string') {
      const template = CONTRACTS_CONFIG.fuseTemplates[fuses];
      if (!template) {
        return {
          success: false,
          error: `Unknown fuse template: ${fuses}`,
        };
      }

      fuseValue = 0;
      for (const fuseName of template.fuses) {
        const fuseDef = CONTRACTS_CONFIG.fuseDefinitions[fuseName];
        if (fuseDef) {
          fuseValue |= fuseDef.bit;
        }
      }
    }

    try {
      const tx = await this.contracts.nameWrapper!.setFuses(node, fuseValue);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set fuses for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set address record
   */
  async setAddress(name: string, address: string, coinType = 0): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    try {
      let tx;
      if (coinType === 0) {
        tx = await this.contracts.publicResolver!.setAddr(node, address);
      } else {
        const addressBytes = ethers.utils.defaultAbiCoder.encode(['address'], [address]);
        tx = await this.contracts.publicResolver!.setAddr(node, coinType, addressBytes);
      }

      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set address for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set text record
   */
  async setText(name: string, key: string, value: string): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    try {
      const tx = await this.contracts.publicResolver!.setText(node, key, value);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set text record for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set content hash
   */
  async setContentHash(name: string, hash: string): Promise<ENSOperationResult> {
    const node = this.namehash(name);

    try {
      const tx = await this.contracts.publicResolver!.setContenthash(node, hash);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set content hash for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set reverse record
   */
  async setReverseRecord(address: string, name: string): Promise<ENSOperationResult> {
    try {
      const tx = await this.contracts.reverseRegistrar!.setName(name);
      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to set reverse record for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Claim reverse record
   */
  async claimReverseRecord(
    address: string,
    resolver: string | null = null
  ): Promise<ENSOperationResult> {
    try {
      let tx;
      if (resolver) {
        tx = await this.contracts.reverseRegistrar!.claimWithResolver(address, resolver);
      } else {
        tx = await this.contracts.reverseRegistrar!.claim(address);
      }

      const result = await this.walletConnector.sendTransaction(tx);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: `Failed to claim reverse record for ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get fuse information for a name
   */
  async getFuses(name: string): Promise<FuseInfo> {
    const node = this.namehash(name);
    const isWrapped = await this.isWrapped(name);

    if (!isWrapped) {
      return { isWrapped: false, fuses: null, expiry: null, owner: null, burnedFuses: [] };
    }

    try {
      const [owner, fuses, expiry] = await this.contracts.nameWrapper!.getData(node);

      const fuseInfo: FuseInfo = {
        isWrapped: true,
        fuses: fuses.toNumber(),
        expiry: expiry.toNumber(),
        owner,
        burnedFuses: [],
      };

      // Decode individual fuses
      for (const [fuseName, fuseDef] of Object.entries(CONTRACTS_CONFIG.fuseDefinitions)) {
        if (fuses.toNumber() & (fuseDef as any).bit) {
          fuseInfo.burnedFuses.push({
            name: fuseName,
            bit: (fuseDef as any).bit,
            description: (fuseDef as any).description,
            security: (fuseDef as any).security,
          });
        }
      }

      return fuseInfo;
    } catch (error) {
      throw new Error(
        `Failed to get fuses for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available fuse templates
   */
  getFuseTemplates(): Record<string, unknown> {
    return CONTRACTS_CONFIG.fuseTemplates;
  }

  /**
   * Get fuse definitions
   */
  getFuseDefinitions(): Record<string, unknown> {
    return CONTRACTS_CONFIG.fuseDefinitions;
  }

  /**
   * Check if a name exists
   */
  async nameExists(name: string): Promise<boolean> {
    const node = this.namehash(name);

    try {
      return await this.contracts.registry!.recordExists(node);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get subdomains of a name
   */
  async getSubdomains(name: string): Promise<string[]> {
    // This would require subgraph queries in a real implementation
    // For now, return empty array
    return [];
  }

  /**
   * Batch operations
   */
  async batch(operations: ENSOperation[]): Promise<ENSOperationResult[]> {
    const results: ENSOperationResult[] = [];

    for (const operation of operations) {
      try {
        const result = await this.executeOperation(operation);
        results.push({ success: true, result });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(operation: ENSOperation): Promise<unknown> {
    const { type, ...params } = operation;

    switch (type) {
      case 'register':
        return await this.register(params.name!, params.options as Record<string, unknown>);
      case 'setResolver':
        return await this.setResolver(params.name!, params.resolver!);
      case 'setFuses':
        return await this.setFuses(params.name!, params.fuses!);
      case 'setAddress':
        return await this.setAddress(params.name!, params.address!, params.coinType || 0);
      case 'setText':
        return await this.setText(params.name!, params.key!, params.value!);
      case 'setContentHash':
        return await this.setContentHash(params.name!, params.hash!);
      case 'setReverseRecord':
        return await this.setReverseRecord(params.address!, params.name!);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }
}

export default ENSOperations;
