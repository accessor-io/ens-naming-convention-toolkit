#!/usr/bin/env node

/**
 * ENS Security Analyzer
 *
 * Comprehensive security analysis tool for ENS domains, including
 * Name Wrapper fuse analysis, identity verification, and security posture assessment.
 */

import { ethers } from 'ethers';
import fs from 'fs';
import chalk from 'chalk';

// Security analysis configuration
const SECURITY_CONFIG = {
  // ENS Name Wrapper contract address (Ethereum mainnet)
  NAME_WRAPPER_ADDRESS: '0xD4416b13d2b3a9aECA5ebA7259A58d9A4e5c528Db',

  // Known security vulnerabilities
  VULNERABILITIES: {
    // Missing fuses
    MISSING_FUSES: {
      severity: 'HIGH',
      description: 'Name Wrapper missing critical security fuses',
      impact: 'Potential unauthorized subdomain creation or name transfer',
    },

    // Weak fuses
    WEAK_FUSES: {
      severity: 'MEDIUM',
      description: 'Name Wrapper has insufficient fuse configuration',
      impact: 'Reduced protection against malicious activities',
    },

    // Expired registration
    EXPIRED_REGISTRATION: {
      severity: 'HIGH',
      description: 'ENS name registration has expired',
      impact: 'Name can be registered by anyone, potential domain hijacking',
    },

    // No identity verification
    NO_VERIFICATION: {
      severity: 'MEDIUM',
      description: 'No identity verification associated with name',
      impact: 'Reduced trust and authenticity verification',
    },

    // Weak resolver
    WEAK_RESOLVER: {
      severity: 'MEDIUM',
      description: 'Resolver may have security vulnerabilities',
      impact: 'Potential for DNS rebinding or resolver attacks',
    },
  },
};

// Fuse definitions and their security implications
const FUSE_DEFINITIONS = {
  CANNOT_UNWRAP: {
    bit: 1,
    description: 'Cannot unwrap the name',
    security: 'HIGH',
    required: true,
  },
  CANNOT_BURN_FUSES: {
    bit: 2,
    description: 'Cannot burn fuses',
    security: 'HIGH',
    required: true,
  },
  CANNOT_TRANSFER: {
    bit: 4,
    description: 'Cannot transfer the name',
    security: 'HIGH',
    required: true,
  },
  CANNOT_SET_RESOLVER: {
    bit: 8,
    description: 'Cannot set resolver',
    security: 'MEDIUM',
    required: false,
  },
  CANNOT_SET_TTL: {
    bit: 16,
    description: 'Cannot set TTL',
    security: 'LOW',
    required: false,
  },
  CANNOT_CREATE_SUBDOMAIN: {
    bit: 32,
    description: 'Cannot create subdomains',
    security: 'HIGH',
    required: true,
  },
  CANNOT_APPROVE: {
    bit: 64,
    description: 'Cannot approve name transfers',
    security: 'HIGH',
    required: true,
  },
  PARENT_CANNOT_CONTROL: {
    bit: 65536,
    description: 'Parent domain cannot control this name',
    security: 'CRITICAL',
    required: true,
  },
  IS_DOT_ETH: {
    bit: 131072,
    description: '.eth names have special rules',
    security: 'INFO',
    required: false,
  },
  CAN_EXTEND_EXPIRY: {
    bit: 262144,
    description: 'Can extend expiry',
    security: 'LOW',
    required: false,
  },
};

// Mock ENS provider for security analysis
class MockENSProvider {
  constructor() {
    this.mockData = new Map();
  }

  // Simulate getting name wrapper fuses
  async getFuses(domain) {
    // Mock implementation - in real implementation, this would query the Name Wrapper contract
    const mockFuses = this.mockData.get(domain) || {
      fuses: 0, // No fuses set
      expiry: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year from now
      owner: '0x1234567890123456789012345678901234567890',
    };

    return mockFuses;
  }

  // Simulate getting resolver information
  async getResolver(domain) {
    return {
      address: '0x0000000000000000000000000000000000000000',
      supportsWildcards: false,
      hasKnownVulnerabilities: false,
    };
  }

  // Simulate identity verification check
  async getIdentityVerification(domain) {
    return {
      verified: false,
      verificationType: null,
      verifier: null,
    };
  }

  // Set mock data for testing
  setMockData(domain, data) {
    this.mockData.set(domain, data);
  }
}

// Security analysis engine
class ENSecurityAnalyzer {
  constructor(provider = null) {
    this.provider = provider || new MockENSProvider();
  }

  // Main security analysis function
  async analyzeSecurity(domain, options = {}) {
    console.log(chalk.blue(`Analyzing security for domain: ${domain}`));
    console.log('═'.repeat(60));

    const results = {
      domain,
      timestamp: new Date().toISOString(),
      overall: { score: 0, grade: 'F', issues: [] },
      checks: {},
    };

    try {
      // Check Name Wrapper fuses
      results.checks.fuses = await this.analyzeFuses(domain);

      // Check registration expiry
      results.checks.expiry = await this.analyzeExpiry(domain);

      // Check resolver security
      results.checks.resolver = await this.analyzeResolver(domain);

      // Check identity verification
      results.checks.verification = await this.analyzeVerification(domain);

      // Calculate overall security score
      results.overall = this.calculateOverallScore(results.checks);

      // Generate recommendations
      results.recommendations = this.generateRecommendations(results.checks);

      return results;
    } catch (error) {
      console.error(chalk.red(`Error analyzing ${domain}:`), error.message);
      return { error: error.message };
    }
  }

  // Analyze Name Wrapper fuses
  async analyzeFuses(domain) {
    const check = {
      name: 'Name Wrapper Fuses',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 100,
      issues: [],
      details: {},
    };

    try {
      const fusesData = await this.provider.getFuses(domain);
      const fuses = fusesData.fuses;
      const expiry = fusesData.expiry;

      check.details = {
        fuses: fuses,
        expiry: new Date(expiry * 1000).toISOString(),
        owner: fusesData.owner,
        fuseBits: this.decodeFuses(fuses),
      };

      // Check for critical missing fuses
      const criticalFuses = [
        FUSE_DEFINITIONS.CANNOT_UNWRAP.bit,
        FUSE_DEFINITIONS.CANNOT_BURN_FUSES.bit,
        FUSE_DEFINITIONS.CANNOT_TRANSFER.bit,
        FUSE_DEFINITIONS.CANNOT_CREATE_SUBDOMAIN.bit,
        FUSE_DEFINITIONS.CANNOT_APPROVE.bit,
        FUSE_DEFINITIONS.PARENT_CANNOT_CONTROL.bit,
      ];

      const missingCriticalFuses = criticalFuses.filter((fuse) => (fuses & fuse) === 0);

      if (missingCriticalFuses.length > 0) {
        check.status = 'FAIL';
        check.score = 20;
        check.issues.push({
          type: 'MISSING_FUSES',
          severity: 'HIGH',
          fuses: missingCriticalFuses.map((fuse) => this.getFuseName(fuse)),
          description: 'Critical security fuses are missing',
        });
      } else {
        // Check for recommended fuses
        const recommendedFuses = [
          FUSE_DEFINITIONS.CANNOT_SET_RESOLVER.bit,
          FUSE_DEFINITIONS.CANNOT_SET_TTL.bit,
        ];

        const missingRecommendedFuses = recommendedFuses.filter((fuse) => (fuses & fuse) === 0);

        if (missingRecommendedFuses.length > 0) {
          check.status = 'WARN';
          check.score = 80;
          check.issues.push({
            type: 'WEAK_FUSES',
            severity: 'MEDIUM',
            fuses: missingRecommendedFuses.map((fuse) => this.getFuseName(fuse)),
            description: 'Some recommended security fuses are not set',
          });
        } else {
          check.status = 'PASS';
          check.score = 100;
          check.issues.push({
            type: 'STRONG_FUSES',
            severity: 'INFO',
            description: 'All critical and recommended fuses are properly set',
          });
        }
      }
    } catch (error) {
      check.status = 'ERROR';
      check.issues.push({
        type: 'FUSE_CHECK_ERROR',
        severity: 'MEDIUM',
        description: `Could not analyze fuses: ${error.message}`,
      });
    }

    return check;
  }

  // Analyze registration expiry
  async analyzeExpiry(domain) {
    const check = {
      name: 'Registration Expiry',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 100,
      issues: [],
      details: {},
    };

    try {
      const fusesData = await this.provider.getFuses(domain);
      const expiry = fusesData.expiry;
      const now = Math.floor(Date.now() / 1000);
      const daysUntilExpiry = Math.floor((expiry - now) / (24 * 60 * 60));

      check.details = {
        expiry: new Date(expiry * 1000).toISOString(),
        daysUntilExpiry: daysUntilExpiry,
        currentTime: new Date(now * 1000).toISOString(),
      };

      if (expiry <= now) {
        check.status = 'FAIL';
        check.score = 0;
        check.issues.push({
          type: 'EXPIRED_REGISTRATION',
          severity: 'HIGH',
          description: 'ENS name registration has expired',
          daysUntilExpiry: daysUntilExpiry,
        });
      } else if (daysUntilExpiry < 30) {
        check.status = 'WARN';
        check.score = 50;
        check.issues.push({
          type: 'EXPIRING_SOON',
          severity: 'MEDIUM',
          description: `Registration expires in ${daysUntilExpiry} days`,
          daysUntilExpiry: daysUntilExpiry,
        });
      } else if (daysUntilExpiry < 90) {
        check.status = 'WARN';
        check.score = 75;
        check.issues.push({
          type: 'EXPIRING_WARNING',
          severity: 'LOW',
          description: `Registration expires in ${daysUntilExpiry} days`,
          daysUntilExpiry: daysUntilExpiry,
        });
      } else {
        check.status = 'PASS';
        check.score = 100;
        check.issues.push({
          type: 'VALID_REGISTRATION',
          severity: 'INFO',
          description: `Registration is valid for ${daysUntilExpiry} more days`,
        });
      }
    } catch (error) {
      check.status = 'ERROR';
      check.issues.push({
        type: 'EXPIRY_CHECK_ERROR',
        severity: 'MEDIUM',
        description: `Could not check expiry: ${error.message}`,
      });
    }

    return check;
  }

  // Analyze resolver security
  async analyzeResolver(domain) {
    const check = {
      name: 'Resolver Security',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 100,
      issues: [],
      details: {},
    };

    try {
      const resolverData = await this.provider.getResolver(domain);

      check.details = {
        address: resolverData.address,
        supportsWildcards: resolverData.supportsWildcards,
        hasKnownVulnerabilities: resolverData.hasKnownVulnerabilities,
      };

      if (resolverData.address === '0x0000000000000000000000000000000000000000') {
        check.status = 'WARN';
        check.score = 60;
        check.issues.push({
          type: 'NO_RESOLVER',
          severity: 'MEDIUM',
          description: 'No resolver set - name will not resolve',
        });
      } else if (resolverData.hasKnownVulnerabilities) {
        check.status = 'FAIL';
        check.score = 20;
        check.issues.push({
          type: 'WEAK_RESOLVER',
          severity: 'HIGH',
          description: 'Resolver has known security vulnerabilities',
        });
      } else if (resolverData.supportsWildcards && !domain.endsWith('.eth')) {
        check.status = 'WARN';
        check.score = 70;
        check.issues.push({
          type: 'WILDCARD_RESOLVER',
          severity: 'MEDIUM',
          description: 'Wildcard resolver may be overly permissive',
        });
      } else {
        check.status = 'PASS';
        check.score = 100;
        check.issues.push({
          type: 'SECURE_RESOLVER',
          severity: 'INFO',
          description: 'Resolver appears to be properly configured',
        });
      }
    } catch (error) {
      check.status = 'ERROR';
      check.issues.push({
        type: 'RESOLVER_CHECK_ERROR',
        severity: 'MEDIUM',
        description: `Could not analyze resolver: ${error.message}`,
      });
    }

    return check;
  }

  // Analyze identity verification
  async analyzeVerification(domain) {
    const check = {
      name: 'Identity Verification',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 100,
      issues: [],
      details: {},
    };

    try {
      const verificationData = await this.provider.getIdentityVerification(domain);

      check.details = {
        verified: verificationData.verified,
        verificationType: verificationData.verificationType,
        verifier: verificationData.verifier,
      };

      if (!verificationData.verified) {
        check.status = 'WARN';
        check.score = 60;
        check.issues.push({
          type: 'NO_VERIFICATION',
          severity: 'MEDIUM',
          description: 'No identity verification associated with this name',
        });
      } else {
        check.status = 'PASS';
        check.score = 100;
        check.issues.push({
          type: 'VERIFIED_IDENTITY',
          severity: 'INFO',
          description: `Identity verified by ${verificationData.verifier || 'unknown verifier'}`,
          verificationType: verificationData.verificationType,
        });
      }
    } catch (error) {
      check.status = 'ERROR';
      check.issues.push({
        type: 'VERIFICATION_CHECK_ERROR',
        severity: 'MEDIUM',
        description: `Could not check verification: ${error.message}`,
      });
    }

    return check;
  }

  // Decode fuse bits to readable names
  decodeFuses(fuses) {
    const fuseBits = {};

    Object.entries(FUSE_DEFINITIONS).forEach(([name, def]) => {
      fuseBits[name] = (fuses & def.bit) !== 0;
    });

    return fuseBits;
  }

  // Get fuse name from bit
  getFuseName(bit) {
    const fuse = Object.values(FUSE_DEFINITIONS).find((f) => f.bit === bit);
    return fuse ? fuse.description : `Unknown fuse (bit ${bit})`;
  }

  // Calculate overall security score
  calculateOverallScore(checks) {
    const weights = {
      fuses: 0.4,
      expiry: 0.3,
      resolver: 0.2,
      verification: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;
    const allIssues = [];

    Object.entries(checks).forEach(([checkName, check]) => {
      if (check.score !== undefined && check.maxScore !== undefined) {
        const weight = weights[checkName] || 0.1;
        totalScore += (check.score / check.maxScore) * weight * 100;
        totalWeight += weight;
        allIssues.push(...check.issues);
      }
    });

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    let grade = 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';

    return {
      score: overallScore,
      grade: grade,
      issues: allIssues,
    };
  }

  // Generate security recommendations
  generateRecommendations(checks) {
    const recommendations = [];

    Object.entries(checks).forEach(([checkName, check]) => {
      check.issues.forEach((issue) => {
        if (issue.severity === 'HIGH' || issue.severity === 'CRITICAL') {
          switch (issue.type) {
            case 'MISSING_FUSES':
              recommendations.push({
                priority: 'HIGH',
                action: 'Set critical Name Wrapper fuses',
                details: `Configure the following fuses: ${issue.fuses.join(', ')}`,
                command: `ens-contract fuses ${check.domain} --set ${issue.fuses.join(',')}`,
              });
              break;
            case 'EXPIRED_REGISTRATION':
              recommendations.push({
                priority: 'CRITICAL',
                action: 'Renew ENS registration immediately',
                details: 'Expired names can be registered by anyone',
                command: `ens-contract register ${check.domain} --years 1`,
              });
              break;
            case 'WEAK_RESOLVER':
              recommendations.push({
                priority: 'HIGH',
                action: 'Update to a secure resolver',
                details: 'Current resolver has known vulnerabilities',
                command: `ens-contract resolver ${check.domain} --set 0x1234...`,
              });
              break;
          }
        }
      });
    });

    return recommendations;
  }

  // Display security report
  displayReport(results) {
    if (results.error) {
      console.log(chalk.red(`${results.error}`));
      return;
    }

    const { domain, overall, checks, recommendations } = results;

    // Overall security grade
    const gradeColor =
      overall.grade === 'A'
        ? chalk.green
        : overall.grade === 'B'
          ? chalk.blue
          : overall.grade === 'C'
            ? chalk.yellow
            : overall.grade === 'D'
              ? chalk.red
              : chalk.red;

    console.log(chalk.bold(`\nSecurity Report for ${domain}`));
    console.log('═'.repeat(60));
    console.log(`Overall Grade: ${gradeColor.bold(overall.grade)} (${overall.score}/100)`);

    // Individual checks
    console.log(chalk.bold('\nSecurity Checks:'));
    Object.entries(checks).forEach(([checkName, check]) => {
      const statusIcon =
        check.status === 'PASS'
          ? 'OK'
          : check.status === 'WARN'
            ? 'WARN'
            : check.status === 'FAIL'
              ? 'FAIL'
              : '?';

      const statusColor =
        check.status === 'PASS'
          ? chalk.green
          : check.status === 'WARN'
            ? chalk.yellow
            : check.status === 'FAIL'
              ? chalk.red
              : chalk.gray;

      console.log(
        `\n${statusIcon} ${check.name}: ${statusColor(check.status)} (${check.score}/${check.maxScore})`
      );

      if (check.issues && check.issues.length > 0) {
        check.issues.forEach((issue) => {
          const severityLabel =
            issue.severity === 'CRITICAL'
              ? '[CRITICAL]'
              : issue.severity === 'HIGH'
                ? '[HIGH]'
                : issue.severity === 'MEDIUM'
                  ? '[MEDIUM]'
                  : issue.severity === 'LOW'
                    ? '[LOW]'
                    : '[INFO]';

          console.log(`  ${severityLabel} ${issue.description}`);
        });
      }
    });

    // Recommendations
    if (recommendations && recommendations.length > 0) {
      console.log(chalk.bold('\nSecurity Recommendations:'));
      recommendations.forEach((rec, index) => {
        const priorityLabel =
          rec.priority === 'CRITICAL'
            ? '[CRITICAL]'
            : rec.priority === 'HIGH'
              ? '[HIGH]'
              : rec.priority === 'MEDIUM'
                ? '[MEDIUM]'
                : '[LOW]';

        console.log(`\n${index + 1}. ${priorityLabel} ${chalk.bold(rec.action)}`);
        console.log(`   ${rec.details}`);
        if (rec.command) {
          console.log(`   Command: ${chalk.cyan(rec.command)}`);
        }
      });
    }

    // Summary
    const criticalIssues = overall.issues.filter((i) => i.severity === 'CRITICAL').length;
    const highIssues = overall.issues.filter((i) => i.severity === 'HIGH').length;

    console.log(chalk.bold('\nSummary:'));
    console.log(
      `Critical Issues: ${criticalIssues > 0 ? chalk.red(criticalIssues) : chalk.green('0')}`
    );
    console.log(
      `High Priority Issues: ${highIssues > 0 ? chalk.yellow(highIssues) : chalk.green('0')}`
    );
    console.log(`Recommendations: ${recommendations.length}`);

    if (criticalIssues === 0 && highIssues === 0) {
      console.log(chalk.green('Domain appears to have good security posture'));
    } else {
      console.log(chalk.red('Domain has security issues that should be addressed'));
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\nENS Security Analyzer');
    console.log('═'.repeat(30));
    console.log('Usage: node security-analyzer.js <domain> [options]');
    console.log('\nOptions:');
    console.log('  --check-fuses       Check ENS Name Wrapper fuses');
    console.log('  --check-verification Check identity verification');
    console.log('  --output <file>     Save report to file');
    console.log('\nExamples:');
    console.log('  node security-analyzer.js vitalik.eth');
    console.log('  node security-analyzer.js uniswap.eth --check-fuses');
    console.log('  node security-analyzer.js ensdao.eth --output security-report.json');
    process.exit(1);
  }

  const domain = args[0];
  const options = {};

  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++; // Skip next argument as it's the value
      } else {
        options[key] = true;
      }
    }
  }

  try {
    const analyzer = new ENSecurityAnalyzer();
    const results = await analyzer.analyzeSecurity(domain, options);

    analyzer.displayReport(results);

    // Save to file if requested
    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
      console.log(chalk.green(`\nReport saved to ${options.output}`));
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Export for use as module
export { ENSecurityAnalyzer, SECURITY_CONFIG, FUSE_DEFINITIONS };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
