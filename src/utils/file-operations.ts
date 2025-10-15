/**
 * File operations utilities for ENS metadata tools
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FileOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Safely read and parse JSON file
 */
export function readJsonFile(filePath: string): FileOperationResult {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safely write JSON file
 */
export function writeJsonFile(filePath: string, data: unknown): FileOperationResult {
  try {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(fullPath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Get config directory path
 */
export function getConfigDir(): string {
  return path.join(getProjectRoot(), 'config');
}

/**
 * Get metadata directory path
 */
export function getMetadataDir(): string {
  return path.join(getProjectRoot(), 'metadata');
}

/**
 * Get data directory path
 */
export function getDataDir(): string {
  return path.join(getProjectRoot(), 'data');
}

/**
 * Get docs directory path
 */
export function getDocsDir(): string {
  return path.join(getProjectRoot(), 'docs');
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(path.resolve(filePath));
  } catch {
    return false;
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Ensure directory exists
 */
export function ensureDirectory(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * List files in directory with optional filter
 */
export function listFiles(dirPath: string, filter?: (filename: string) => boolean): string[] {
  try {
    const files = fs.readdirSync(dirPath);
    return filter ? files.filter(filter) : files;
  } catch {
    return [];
  }
}

/**
 * Get relative path from project root
 */
export function getRelativePath(filePath: string): string {
  const projectRoot = getProjectRoot();
  return path.relative(projectRoot, path.resolve(filePath));
}
