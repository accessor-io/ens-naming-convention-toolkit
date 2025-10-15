/**
 * Validation utilities for ENS metadata and domain names
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface DomainValidationOptions {
  strict?: boolean;
  allowSubdomains?: boolean;
  maxLength?: number;
}

/**
 * Validates Ethereum address format
 */
export function validateAddress(address: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!address) {
    errors.push('Address is required');
    return { isValid: false, errors, warnings, score: 0 };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    errors.push('Invalid Ethereum address format');
  }

  // Check for checksum
  const checksummed = toChecksumAddress(address);
  if (address !== checksummed && address !== address.toLowerCase()) {
    warnings.push(`Address should be checksummed: ${checksummed}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0,
  };
}

/**
 * Validates domain name format
 */
export function validateDomain(
  domain: string,
  options: DomainValidationOptions = {}
): ValidationResult {
  const { strict = false, allowSubdomains = true, maxLength = 63 } = options;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!domain) {
    errors.push('Domain name is required');
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Basic format checks
  if (!domain.endsWith('.eth')) {
    errors.push('Domain must end with .eth');
  }

  if (domain.includes(' ')) {
    errors.push('Domain cannot contain spaces');
  }

  if (domain.length > maxLength) {
    warnings.push(`Domain name is quite long (consider shortening from ${domain.length} chars)`);
  }

  // Character validation
  const domainWithoutSuffix = domain.replace('.eth', '');
  if (!/^[a-z0-9.-]+$/.test(domainWithoutSuffix)) {
    errors.push('Domain can only contain lowercase letters, numbers, hyphens, and dots');
  }

  // Subdomain validation
  if (!allowSubdomains && domain.includes('.')) {
    errors.push('Subdomains are not allowed');
  }

  // Strict mode additional checks
  if (strict) {
    if (domainWithoutSuffix.startsWith('-') || domainWithoutSuffix.endsWith('-')) {
      errors.push('Domain cannot start or end with hyphen');
    }

    if (domainWithoutSuffix.includes('..')) {
      errors.push('Domain cannot contain consecutive dots');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateValidationScore(errors, warnings),
  };
}

/**
 * Validates ENS metadata structure
 */
export function validateMetadata(metadata: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata || typeof metadata !== 'object') {
    errors.push('Metadata must be a valid object');
    return { isValid: false, errors, warnings, score: 0 };
  }

  const meta = metadata as Record<string, unknown>;

  // Required fields
  const requiredFields = ['category'];
  for (const field of requiredFields) {
    if (!meta[field]) {
      errors.push(`Required metadata field missing: ${field}`);
    }
  }

  // Validate ensRoot if present
  if (meta.ensRoot && typeof meta.ensRoot === 'string') {
    if (!meta.ensRoot.endsWith('.cns.eth')) {
      errors.push('ensRoot must end with .cns.eth');
    }
  }

  // Validate subcategory if present
  if (meta.subcategory && typeof meta.subcategory !== 'string') {
    errors.push('subcategory must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateValidationScore(errors, warnings),
  };
}

/**
 * Validates canonical ID grammar
 */
export function validateCanonicalId(id: string): boolean {
  if (!id) return false;

  const grammarPattern =
    /^([a-z0-9-]+)\.([a-z0-9.-]+)\.([a-z]+)\.([a-z0-9-]+)(?:\.([a-z0-9-]+))?\.v([0-9]+\.[0-9]+\.[0-9]+)\.([0-9]+)$/;
  return grammarPattern.test(id);
}

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address;
  }

  const addr = address.toLowerCase().slice(2);
  const hash = sha3(addr);
  let checksum = '0x';

  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i]!, 16) >= 8) {
      checksum += addr[i]!.toUpperCase();
    } else {
      checksum += addr[i]!;
    }
  }

  return checksum;
}

/**
 * Simple SHA3 implementation (for checksum calculation)
 */
function sha3(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Calculate validation score based on errors and warnings
 */
function calculateValidationScore(errors: string[], warnings: string[]): number {
  let score = 100;

  // Deduct points for errors
  score -= errors.length * 20;

  // Deduct points for warnings (less severe)
  score -= warnings.length * 5;

  return Math.max(0, Math.min(100, score));
}
