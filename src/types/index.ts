/**
 * Type definitions for ENS metadata tools
 */

export interface ENSMetadata {
  category: string;
  subcategory?: string;
  ensRoot?: string;
  proxy?: ProxyConfiguration;
  subdomains?: SubdomainConfiguration[];
  addresses?: AddressConfiguration[];
  metadata?: Record<string, unknown>;
}

export interface ProxyConfiguration {
  proxyType: 'transparent' | 'uups' | 'beacon' | 'diamond' | 'minimal' | 'immutable';
  implementationAddress?: string;
  proxyAdmin?: string;
  implementationSlot?: string;
  implementationMetadata?: Record<string, unknown>;
}

export interface SubdomainConfiguration {
  label: string;
  type: string;
  address?: string;
  resolver?: string;
  metadata?: Record<string, unknown>;
}

export interface AddressConfiguration {
  address: string;
  chainId: number;
  network: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationOptions {
  strict?: boolean;
  includeQA?: boolean;
  metadata?: ENSMetadata;
}

export interface ValidationResult {
  domain: string;
  category: string;
  isValid: boolean;
  score: number;
  maxScore: number;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  metadata: {
    compliance: Record<string, boolean>;
    coverage: {
      total: number;
      compliant: number;
      percentage: number;
    };
  };
  qaValidation: {
    schema: unknown;
    crossReference: unknown;
    overall: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
      score: number;
    };
  };
}

export interface ENSOperation {
  type:
    | 'register'
    | 'setResolver'
    | 'setFuses'
    | 'setAddress'
    | 'setText'
    | 'setContentHash'
    | 'setReverseRecord';
  name?: string;
  address?: string;
  resolver?: string;
  fuses?: number | string;
  key?: string;
  value?: string;
  hash?: string;
  coinType?: number;
  options?: Record<string, unknown>;
}

export interface ENSOperationResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface ContractInfo {
  name: string;
  node: string;
  isWrapped: boolean;
  owner: string | null;
  resolver: string | null;
  ttl: number | null;
  fuses: number | null;
  expiry: number | null;
}

export interface FuseInfo {
  isWrapped: boolean;
  fuses: number | null;
  expiry: number | null;
  owner: string | null;
  burnedFuses: Array<{
    name: string;
    bit: number;
    description: string;
    security: string;
  }>;
}

export interface MetadataTemplate {
  protocol?: Record<string, unknown>;
  contract?: Record<string, unknown>;
  token?: Record<string, unknown>;
  governance?: Record<string, unknown>;
  dao?: Record<string, unknown>;
  oracle?: Record<string, unknown>;
  bridge?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CategoryRegistry {
  roots: string[];
  subcategories: Record<string, string[]>;
  aliases: Record<string, string>;
}

export interface CLICommand {
  name: string;
  description: string;
  options: Array<{
    name: string;
    description: string;
    type: 'string' | 'boolean' | 'number';
    required?: boolean;
    default?: unknown;
  }>;
  examples: string[];
}
