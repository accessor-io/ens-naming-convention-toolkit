#!/usr/bin/env node

/**
 * Documentation Generation Script
 *
 * This script generates all documentation for the ENS Metadata Tools project:
 * - TypeDoc API documentation
 * - CLI command documentation
 * - Ensures proper formatting and organization
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const DOCS_DIR = join(PROJECT_ROOT, 'docs');
const API_DOCS_DIR = join(DOCS_DIR, 'api');

console.log('Generating ENS Metadata Tools Documentation...\n');

// Ensure docs directory exists
if (!existsSync(DOCS_DIR)) {
  console.log('Creating docs directory...');
  mkdirSync(DOCS_DIR, { recursive: true });
}

if (!existsSync(API_DOCS_DIR)) {
  console.log('Creating API docs directory...');
  mkdirSync(API_DOCS_DIR, { recursive: true });
}

try {
  // Generate TypeDoc API documentation
  console.log('Generating TypeDoc API documentation...');
  execSync('npm run docs:api', {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
  });
  console.log('TypeDoc API documentation generated successfully\n');

  // Generate CLI documentation
  console.log('Generating CLI command documentation...');
  execSync('npm run docs:cli', {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
  });
  console.log('CLI documentation generated successfully\n');

  // Verify documentation structure
  console.log('Verifying documentation structure...');

  const requiredFiles = [
    'docs/api/index.html',
    'docs/api/modules.html',
    'docs/api/hierarchy.html',
    'docs/api/classes',
    'docs/api/functions',
    'docs/api/interfaces',
    'docs/api/modules',
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = join(PROJECT_ROOT, file);
    if (!existsSync(filePath)) {
      console.log(`Missing: ${file}`);
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    console.log('All documentation files verified successfully\n');
  } else {
    console.log('Some documentation files are missing\n');
  }

  // Count generated files
  console.log('Documentation Statistics:');

  try {
    const htmlFiles = execSync('find docs/api -name "*.html" | wc -l', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
    }).trim();
    console.log(`   - HTML files: ${htmlFiles}`);

    const totalSize = execSync('du -sh docs/api', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
    }).trim();
    console.log(`   - Total size: ${totalSize}`);
  } catch (error) {
    console.log('   - Unable to calculate statistics');
  }

  console.log('\nDocumentation generation completed successfully!');
  console.log('\nNext steps:');
  console.log('   1. Review generated documentation at docs/api/index.html');
  console.log('   2. Test documentation links and navigation');
  console.log('   3. Deploy to your hosting platform');
} catch (error) {
  console.error('Documentation generation failed:', error.message);
  process.exit(1);
}
