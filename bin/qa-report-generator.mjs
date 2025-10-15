#!/usr/bin/env node

/**
 * QA Report Generator for ENS Metadata
 *
 * Generates comprehensive compliance reports for all QA standards
 * Runs all validators and produces detailed compliance scoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import validation tools
import SchemaValidator from './schema-validator.mjs';
import CrossReferenceValidator from './cross-reference-validator.mjs';
import NamingValidator from './naming-validator.mjs';

class QAReportGenerator {
  constructor() {
    this.schemaValidator = new SchemaValidator();
    this.crossRefValidator = new CrossReferenceValidator();
    this.namingValidator = new NamingValidator();
    this.qaValidationRules = null;
    this.loadQAValidationRules();
  }

  /**
   * Load QA validation rules from config
   */
  loadQAValidationRules() {
    try {
      const rulesPath = path.join(__dirname, '..', 'data', 'configs', 'qa-validation-rules.json');
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      this.qaValidationRules = JSON.parse(rulesContent);
    } catch (error) {
      console.warn(`Warning: Could not load QA validation rules: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive QA report for a single metadata file
   */
  async generateReport(metadataFile, options = {}) {
    const { strict = false, verbose = false, format = 'markdown' } = options;

    try {
      const content = fs.readFileSync(metadataFile, 'utf8');
      const metadata = JSON.parse(content);

      // Run all validators
      const schemaPath = path.join(__dirname, '..', 'data', 'metadata', 'schema.json');
      this.schemaValidator.loadSchema(schemaPath);

      const schemaResult = this.schemaValidator.validate(metadata, { strict });
      const crossRefResult = this.crossRefValidator.validate(metadata, { strict });

      // Extract domain and category for naming validation
      const domain = this.extractDomainFromMetadata(metadata);
      const category = metadata.category || metadata.domain || 'unknown';
      const namingResult = await this.namingValidator.validateDomain(domain, category, {
        strict,
        metadata,
        includeQA: false, // Avoid double validation
      });

      // Calculate overall compliance
      const compliance = this.calculateCompliance({
        schema: schemaResult,
        crossReference: crossRefResult,
        naming: namingResult,
      });

      const report = {
        file: path.basename(metadataFile),
        timestamp: new Date().toISOString(),
        compliance,
        validators: {
          schema: schemaResult,
          crossReference: crossRefResult,
          naming: namingResult,
        },
        standards: this.evaluateStandards(metadata, {
          schema: schemaResult,
          crossReference: crossRefResult,
          naming: namingResult,
        }),
      };

      return report;
    } catch (error) {
      return {
        file: path.basename(metadataFile),
        timestamp: new Date().toISOString(),
        error: error.message,
        compliance: { score: 0, level: 'error' },
      };
    }
  }

  /**
   * Generate batch QA report for multiple files
   */
  async generateBatchReport(directory, options = {}) {
    const { strict = false, verbose = false, format = 'markdown' } = options;

    try {
      const files = fs
        .readdirSync(directory)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(directory, file));

      const reports = [];

      for (const file of files) {
        const report = await this.generateReport(file, { strict, verbose, format });
        reports.push(report);
      }

      return this.generateSummaryReport(reports);
    } catch (error) {
      throw new Error(`Failed to generate batch report: ${error.message}`);
    }
  }

  /**
   * Extract domain from metadata for naming validation
   */
  extractDomainFromMetadata(metadata) {
    if (metadata.id) {
      const match = metadata.id.match(/^[^.]+\.[^.]+\\.([^.]+)\./);
      if (match) {
        return `${match[1]}.eth`;
      }
    }

    // Prefer category over deprecated domain
    if (metadata.category) {
      return `${metadata.category}.eth`;
    }

    if (metadata.domain) {
      return `${metadata.domain}.eth`;
    }

    return 'unknown.eth';
  }

  /**
   * Calculate overall compliance score
   */
  calculateCompliance(results) {
    const scores = [
      results.schema?.score || 0,
      results.crossReference?.score || 0,
      results.naming?.score || 0,
    ];

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    let level;
    if (avgScore >= 90) level = 'excellent';
    else if (avgScore >= 80) level = 'good';
    else if (avgScore >= 70) level = 'acceptable';
    else if (avgScore >= 60) level = 'poor';
    else level = 'non-compliant';

    return {
      score: Math.round(avgScore),
      level,
      breakdown: {
        schema: results.schema?.score || 0,
        crossReference: results.crossReference?.score || 0,
        naming: results.naming?.score || 0,
      },
    };
  }

  /**
   * Evaluate compliance against all 15 QA standards
   */
  evaluateStandards(metadata, results) {
    const standards = {};

    if (this.qaValidationRules && this.qaValidationRules.standards) {
      Object.entries(this.qaValidationRules.standards).forEach(([id, standard]) => {
        standards[id] = this.evaluateStandard(metadata, results, standard);
      });
    }

    return standards;
  }

  /**
   * Evaluate a single standard
   */
  evaluateStandard(metadata, results, standard) {
    const evaluation = {
      name: standard.name,
      priority: standard.priority,
      category: standard.category,
      validationLevel: standard.validationLevel,
      status: 'unknown',
      score: 0,
      issues: [],
      warnings: [],
    };

    // Evaluate based on standard type
    switch (standard.name) {
      case 'Metadata Schema Validation':
        evaluation.status = results.schema?.isValid ? 'pass' : 'fail';
        evaluation.score = results.schema?.score || 0;
        evaluation.issues = results.schema?.errors || [];
        evaluation.warnings = results.schema?.warnings || [];
        break;

      case 'Cross-Reference Validation':
        evaluation.status = results.crossReference?.isValid ? 'pass' : 'fail';
        evaluation.score = results.crossReference?.score || 0;
        evaluation.issues = results.crossReference?.errors || [];
        evaluation.warnings = results.crossReference?.warnings || [];
        break;

      case 'Canonical ID Grammar':
        evaluation.status = this.validateCanonicalId(metadata.id) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        if (!evaluation.status) {
          evaluation.issues.push('ID does not match canonical grammar pattern');
        }
        break;

      case 'Root Domain Categorization':
        const validCategories = [
          'defi',
          'dao',
          'l2',
          'infra',
          'token',
          'nft',
          'gaming',
          'social',
          'identity',
          'privacy',
          'security',
          'wallet',
          'analytics',
          'rwa',
          'supply',
          'health',
          'finance',
          'dev',
          'art',
        ];
        const category = metadata.category || metadata.domain;
        evaluation.status = validCategories.includes(category) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        if (!evaluation.status) {
          evaluation.issues.push(`Category '${category}' is not registered`);
        }
        if (metadata.domain && !metadata.category) {
          evaluation.warnings.push(
            'Using deprecated "domain" field. Please migrate to "category" field.'
          );
        }
        break;

      case 'Security Standards':
        evaluation.status = this.validateSecurityStandards(metadata) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        break;

      case 'Lifecycle Management':
        evaluation.status = this.validateLifecycleManagement(metadata) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        break;

      case 'Standards Compliance':
        evaluation.status = this.validateStandardsCompliance(metadata) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        break;

      case 'File and Format Standards':
        evaluation.status = 'pass'; // Assumed if we can parse the JSON
        evaluation.score = 100;
        break;

      case 'Version and Compatibility':
        evaluation.status = this.validateVersionCompatibility(metadata) ? 'pass' : 'fail';
        evaluation.score = evaluation.status === 'pass' ? 100 : 0;
        break;

      default:
        evaluation.status = 'not-implemented';
        evaluation.score = 0;
        evaluation.warnings.push('Standard evaluation not implemented');
    }

    return evaluation;
  }

  /**
   * Validate canonical ID grammar
   */
  validateCanonicalId(id) {
    if (!id) return false;
    const grammarPattern =
      /^([a-z0-9-]+)\.([a-z0-9.-]+)\.([a-z]+)\.([a-z0-9-]+)(?:\.([a-z0-9-]+))?\.v([0-9]+\.[0-9]+\.[0-9]+)\.([0-9]+)$/;
    return grammarPattern.test(id);
  }

  /**
   * Validate security standards
   */
  validateSecurityStandards(metadata) {
    if (!metadata.security) return false;

    const hasAudits =
      metadata.security.audits &&
      Array.isArray(metadata.security.audits) &&
      metadata.security.audits.length > 0;
    const hasOwners =
      metadata.security.owners &&
      Array.isArray(metadata.security.owners) &&
      metadata.security.owners.length > 0;
    const hasUpgradeability =
      metadata.security.upgradeability && typeof metadata.security.upgradeability === 'string';

    return hasAudits && hasOwners && hasUpgradeability;
  }

  /**
   * Validate lifecycle management
   */
  validateLifecycleManagement(metadata) {
    if (!metadata.lifecycle) return false;

    const validStatuses = [
      'planning',
      'development',
      'testing',
      'deployed',
      'deprecated',
      'discontinued',
    ];
    const hasValidStatus =
      metadata.lifecycle.status && validStatuses.includes(metadata.lifecycle.status);
    const hasSince = metadata.lifecycle.since && typeof metadata.lifecycle.since === 'string';

    return hasValidStatus && hasSince;
  }

  /**
   * Validate standards compliance
   */
  validateStandardsCompliance(metadata) {
    if (!metadata.standards) return false;

    const validERCs = [
      'ERC20',
      'ERC721',
      'ERC1155',
      'ERC165',
      'ERC173',
      'ERC1967',
      'ERC2535',
      'ERC4337',
    ];
    const hasValidERCs =
      metadata.standards.ercs &&
      Array.isArray(metadata.standards.ercs) &&
      metadata.standards.ercs.every((erc) => validERCs.includes(erc));

    return hasValidERCs;
  }

  /**
   * Validate version compatibility
   */
  validateVersionCompatibility(metadata) {
    if (!metadata.version) return false;

    const versionPattern = /^v[0-9]+(-[0-9]+)?(-[0-9]+)?$/;
    return versionPattern.test(metadata.version);
  }

  /**
   * Generate summary report for batch validation
   */
  generateSummaryReport(reports) {
    const totalFiles = reports.length;
    const validFiles = reports.filter((r) => r.compliance && r.compliance.level !== 'error').length;
    const avgScore = reports.reduce((sum, r) => sum + (r.compliance?.score || 0), 0) / totalFiles;

    const complianceLevels = {
      excellent: reports.filter((r) => r.compliance?.level === 'excellent').length,
      good: reports.filter((r) => r.compliance?.level === 'good').length,
      acceptable: reports.filter((r) => r.compliance?.level === 'acceptable').length,
      poor: reports.filter((r) => r.compliance?.level === 'poor').length,
      'non-compliant': reports.filter((r) => r.compliance?.level === 'non-compliant').length,
      error: reports.filter((r) => r.compliance?.level === 'error').length,
    };

    return {
      summary: {
        totalFiles,
        validFiles,
        avgScore: Math.round(avgScore),
        complianceLevels,
      },
      reports,
    };
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    const lines = [];

    lines.push('# QA Compliance Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
    lines.push(`**File:** ${report.file}`);
    lines.push('');

    if (report.error) {
      lines.push('## Error');
      lines.push('');
      lines.push(`Error: ${report.error}`);
      return lines.join('\n');
    }

    lines.push('## Compliance Summary');
    lines.push('');
    lines.push(`**Overall Score:** ${report.compliance.score}/100`);
    lines.push(`**Compliance Level:** ${report.compliance.level.toUpperCase()}`);
    lines.push('');

    lines.push('### Validator Results');
    lines.push('');
    lines.push(`| Validator | Score | Status |`);
    lines.push(`|-----------|-------|--------|`);
    lines.push(
      `| Schema | ${report.validators.schema?.score || 0}/100 | ${report.validators.schema?.isValid ? 'OK' : 'FAIL'} |`
    );
    lines.push(
      `| Cross-Reference | ${report.validators.crossReference?.score || 0}/100 | ${report.validators.crossReference?.isValid ? 'OK' : 'FAIL'} |`
    );
    lines.push(
      `| Naming | ${report.validators.naming?.score || 0}/100 | ${report.validators.naming?.isValid ? 'OK' : 'FAIL'} |`
    );
    lines.push('');

    if (report.standards) {
      lines.push('## Standards Compliance');
      lines.push('');
      lines.push(`| Standard | Priority | Status | Score |`);
      lines.push(`|----------|----------|--------|-------|`);

      Object.entries(report.standards).forEach(([id, standard]) => {
        const status =
          standard.status === 'pass' ? 'OK' : standard.status === 'fail' ? 'FAIL' : 'WARN';
        lines.push(
          `| ${standard.name} | ${standard.priority} | ${status} | ${standard.score}/100 |`
        );
      });
      lines.push('');
    }

    // Add detailed issues
    const allIssues = [
      ...(report.validators.schema?.errors || []),
      ...(report.validators.crossReference?.errors || []),
      ...(report.validators.naming?.issues || []),
    ];

    if (allIssues.length > 0) {
      lines.push('## Issues');
      lines.push('');
      allIssues.forEach((issue, i) => {
        lines.push(`${i + 1}. ${issue}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(report) {
    return JSON.stringify(report, null, 2);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help')) {
    console.log('\nQA Report Generator for ENS Metadata');
    console.log('═'.repeat(45));
    console.log('Usage: node qa-report-generator.js <file|directory> [options]');
    console.log('\nOptions:');
    console.log('  --strict          Enable strict validation');
    console.log('  --verbose         Verbose output');
    console.log('  --format <type>   Output format (markdown, json)');
    console.log('  --output <file>   Output file path');
    console.log('  --all             Generate report for all metadata files');
    console.log('\nExamples:');
    console.log('  node qa-report-generator.js metadata.json');
    console.log('  node qa-report-generator.js metadata/ --format json --output report.json');
    console.log('  node qa-report-generator.js --all --format markdown');
    process.exit(1);
  }

  const generator = new QAReportGenerator();

  // Parse options
  const strict = args.includes('--strict');
  const verbose = args.includes('--verbose');
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'markdown';
  const output = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
  const all = args.includes('--all');

  try {
    let report;

    if (all) {
      // Generate report for all metadata files
      const metadataDir = path.join(__dirname, '..', 'metadata');
      report = await generator.generateBatchReport(metadataDir, { strict, verbose, format });

      console.log('\nBATCH QA COMPLIANCE REPORT');
      console.log('═'.repeat(50));
      console.log(`Total Files: ${report.summary.totalFiles}`);
      console.log(
        `Valid Files: ${report.summary.validFiles} (${((report.summary.validFiles / report.summary.totalFiles) * 100).toFixed(1)}%)`
      );
      console.log(`Average Score: ${report.summary.avgScore}/100`);
      console.log('');

      console.log('Compliance Levels:');
      Object.entries(report.summary.complianceLevels).forEach(([level, count]) => {
        if (count > 0) {
          console.log(`  ${level}: ${count} files`);
        }
      });
    } else {
      // Generate report for single file or directory
      const target = args[0];
      const stat = fs.statSync(target);

      if (stat.isDirectory()) {
        report = await generator.generateBatchReport(target, { strict, verbose, format });
      } else {
        report = await generator.generateReport(target, { strict, verbose, format });
      }

      // Output report
      let outputContent;
      if (format === 'json') {
        outputContent = generator.generateJSONReport(report);
      } else {
        outputContent = generator.generateMarkdownReport(report);
      }

      if (output) {
        fs.writeFileSync(output, outputContent);
        console.log(`Report written to: ${output}`);
      } else {
        console.log(outputContent);
      }
    }
  } catch (error) {
    console.error(`Failed to generate report: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
export default QAReportGenerator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
