/**
 * Shared CLI utilities for ENS metadata tools
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readJsonFile, writeJsonFile, getProjectRoot } from '../utils/file-operations.js';
import { validateDomain, validateAddress, validateMetadata } from '../utils/validation.js';
import type { ENSMetadata, ValidationOptions, CLICommand } from '../types/index.js';

export interface CLIContext {
  verbose: boolean;
  output?: string;
  config?: string;
}

export interface CLIResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

/**
 * Create a new Commander.js command with common options
 */
export function createCommand(name: string, description: string): Command {
  const command = new Command(name);
  command.description(description);

  command
    .option('-v, --verbose', 'Enable verbose output')
    .option('-o, --output <file>', 'Output file path')
    .option('-c, --config <file>', 'Configuration file path');

  return command;
}

/**
 * Parse CLI arguments and return context
 */
export function parseCLIContext(command: Command): CLIContext {
  const options = command.opts();
  return {
    verbose: options.verbose || false,
    output: options.output,
    config: options.config,
  };
}

/**
 * Log message with appropriate level
 */
export function log(
  level: 'info' | 'warn' | 'error' | 'success',
  message: string,
  context?: CLIContext
): void {
  if (context?.verbose || level === 'error' || level === 'warn') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}]`;

    switch (level) {
      case 'info':
        console.log(chalk.blue(`${prefix} INFO:`), message);
        break;
      case 'warn':
        console.warn(chalk.yellow(`${prefix} WARN:`), message);
        break;
      case 'error':
        console.error(chalk.red(`${prefix} ERROR:`), message);
        break;
      case 'success':
        console.log(chalk.green(`${prefix} SUCCESS:`), message);
        break;
    }
  }
}

/**
 * Load configuration from file or use defaults
 */
export function loadConfig(configPath?: string): Record<string, unknown> {
  if (configPath) {
    const result = readJsonFile(configPath);
    if (result.success) {
      return result.data as Record<string, unknown>;
    }
    throw new Error(`Failed to load config: ${result.error}`);
  }

  // Return default config
  return {
    network: 'mainnet',
    strict: false,
    includeQA: true,
  };
}

/**
 * Save result to file if output path specified
 */
export function saveResult(data: unknown, outputPath?: string): CLIResult {
  if (!outputPath) {
    return { success: true, data };
  }

  const result = writeJsonFile(outputPath, data);
  if (result.success) {
    return { success: true, message: `Result saved to ${outputPath}`, data };
  } else {
    return { success: false, error: `Failed to save result: ${result.error}` };
  }
}

/**
 * Validate domain name with CLI-friendly output
 */
export function validateDomainCLI(domain: string, options: ValidationOptions = {}): CLIResult {
  const domainResult = validateDomain(domain);

  if (!domainResult.isValid) {
    return {
      success: false,
      error: `Domain validation failed: ${domainResult.errors.join(', ')}`,
    };
  }

  if (domainResult.warnings.length > 0) {
    log('warn', `Domain warnings: ${domainResult.warnings.join(', ')}`);
  }

  return {
    success: true,
    message: `Domain validation passed (score: ${domainResult.score}/100)`,
    data: domainResult,
  };
}

/**
 * Validate metadata with CLI-friendly output
 */
export function validateMetadataCLI(
  metadata: ENSMetadata,
  options: ValidationOptions = {}
): CLIResult {
  const metadataResult = validateMetadata(metadata);

  if (!metadataResult.isValid) {
    return {
      success: false,
      error: `Metadata validation failed: ${metadataResult.errors.join(', ')}`,
    };
  }

  if (metadataResult.warnings.length > 0) {
    log('warn', `Metadata warnings: ${metadataResult.warnings.join(', ')}`);
  }

  return {
    success: true,
    message: `Metadata validation passed (score: ${metadataResult.score}/100)`,
    data: metadataResult,
  };
}

/**
 * Display help for a command
 */
export function displayHelp(command: Command, examples?: string[]): void {
  console.log(chalk.cyan(`\n${command.name().toUpperCase()} HELP`));
  console.log('═'.repeat(50));
  console.log(command.description());
  console.log('\nUsage:');
  console.log(`  ${command.name()} [options] <arguments>`);

  if (examples && examples.length > 0) {
    console.log('\nExamples:');
    examples.forEach((example) => {
      console.log(`  ${example}`);
    });
  }

  console.log('\nOptions:');
  command.options.forEach((option) => {
    const flags = option.flags;
    const description = option.description;
    console.log(`  ${flags.padEnd(20)} ${description}`);
  });
}

/**
 * Handle CLI errors consistently
 */
export function handleCLIError(error: unknown, context?: CLIContext): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  log('error', message, context);
  process.exit(1);
}

/**
 * Display validation report
 */
export function displayValidationReport(result: unknown): void {
  console.log(chalk.cyan('\nVALIDATION REPORT'));
  console.log('═'.repeat(50));
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Get project information
 */
export function getProjectInfo(): Record<string, string> {
  const packageJsonPath = path.join(getProjectRoot(), 'package.json');
  const result = readJsonFile(packageJsonPath);

  if (result.success && result.data) {
    const pkg = result.data as Record<string, unknown>;
    return {
      name: (pkg.name as string) || 'ens-metadata-tools',
      version: (pkg.version as string) || '1.0.0',
      description: (pkg.description as string) || 'ENS metadata tools',
    };
  }

  return {
    name: 'ens-metadata-tools',
    version: '1.0.0',
    description: 'ENS metadata tools',
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create progress bar
 */
export function createProgressBar(total: number, current: number): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 20);
  const empty = 20 - filled;

  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}% (${current}/${total})`;
}

// Import path module for getProjectInfo
import path from 'path';
