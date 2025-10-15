#!/usr/bin/env node

/**
 * ENS Resolver Cache Browser
 *
 * Interactive browser for exploring the resolver-cache.json file
 * Provides search, filter, and detailed view capabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CacheBrowser {
  constructor(cachePath) {
    this.cachePath = cachePath;
    this.cacheData = null;
    this.rl = null;
  }

  async loadCache() {
    try {
      console.log('Loading resolver cache...');
      const rawData = fs.readFileSync(this.cachePath, 'utf8');
      this.cacheData = JSON.parse(rawData);
      console.log(`Loaded ${Object.keys(this.cacheData).length} cache entries`);
      return true;
    } catch (error) {
      console.error('Error loading cache:', error.message);
      return false;
    }
  }

  async start() {
    if (!(await this.loadCache())) {
      return;
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n=== ENS Resolver Cache Browser ===');
    console.log('Type "help" for available commands\n');

    this.showMainMenu();
  }

  showMainMenu() {
    console.log('\nMain Menu:');
    console.log('1. search <term>     - Search domains by name');
    console.log('2. list [page]       - List all entries (paginated)');
    console.log('3. stats             - Show cache statistics');
    console.log('4. view <hash>       - View detailed entry by hash');
    console.log('5. filter <type>     - Filter by domain type');
    console.log('6. export <format>   - Export data (json/csv)');
    console.log('7. help              - Show this help');
    console.log('8. quit              - Exit browser');

    this.prompt();
  }

  prompt() {
    if (this.rl) {
      this.rl.question('\n> ', (input) => {
        this.handleCommand(input.trim());
      });
    }
  }

  handleCommand(input) {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'search':
        this.searchDomains(args.join(' '));
        break;
      case 'list':
        this.listEntries(args[0] ? parseInt(args[0]) : 1);
        break;
      case 'stats':
        this.showStats();
        break;
      case 'view':
        this.viewEntry(args[0]);
        break;
      case 'filter':
        this.filterByType(args[0]);
        break;
      case 'export':
        this.exportData(args[0] || 'json');
        break;
      case 'help':
        this.showMainMenu();
        break;
      case 'quit':
      case 'exit':
        console.log('Goodbye!');
        this.rl.close();
        break;
      default:
        console.log('Unknown command. Type "help" for available commands.');
        this.prompt();
    }
  }

  searchDomains(term) {
    if (!term) {
      console.log('Please provide a search term');
      this.prompt();
      return;
    }

    console.log(`\nSearching for "${term}"...`);
    const results = [];
    const searchTerm = term.toLowerCase();

    for (const [hash, entry] of Object.entries(this.cacheData)) {
      if (entry.data && entry.data.domains) {
        for (const domain of entry.data.domains) {
          if (domain.name && domain.name.toLowerCase().includes(searchTerm)) {
            results.push({
              hash,
              name: domain.name,
              owner: domain.owner?.id,
              resolver: domain.resolver?.addr?.id,
              createdAt: domain.createdAt,
            });
          }
        }
      }
    }

    if (results.length === 0) {
      console.log('No domains found matching your search term.');
    } else {
      console.log(`\nFound ${results.length} matching domains:`);
      results.slice(0, 20).forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Hash: ${result.hash}`);
        console.log(`   Owner: ${result.owner || 'N/A'}`);
        console.log(`   Resolver: ${result.resolver || 'N/A'}`);
        console.log(`   Created: ${new Date(parseInt(result.createdAt) * 1000).toISOString()}`);
        console.log('');
      });

      if (results.length > 20) {
        console.log(`... and ${results.length - 20} more results.`);
      }
    }

    this.prompt();
  }

  listEntries(page = 1) {
    const entriesPerPage = 10;
    const totalEntries = Object.keys(this.cacheData).length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (page - 1) * entriesPerPage;

    console.log(`\nCache Entries (Page ${page}/${totalPages}):`);
    console.log('='.repeat(60));

    const entries = Object.entries(this.cacheData).slice(startIndex, startIndex + entriesPerPage);

    entries.forEach(([hash, entry], index) => {
      const domainCount = entry.data?.domains?.length || 0;
      console.log(`${startIndex + index + 1}. Hash: ${hash}`);
      console.log(`   Domains: ${domainCount}`);

      if (entry.data?.domains && entry.data.domains.length > 0) {
        const sampleDomains = entry.data.domains.slice(0, 3);
        sampleDomains.forEach((domain) => {
          console.log(`   - ${domain.name || 'Unknown'}`);
        });
        if (entry.data.domains.length > 3) {
          console.log(`   ... and ${entry.data.domains.length - 3} more`);
        }
      }
      console.log('');
    });

    console.log(`Use "list ${page + 1}" for next page, "list ${page - 1}" for previous page`);
    this.prompt();
  }

  showStats() {
    console.log('\n=== Cache Statistics ===');

    const totalEntries = Object.keys(this.cacheData).length;
    let totalDomains = 0;
    let domainTypes = {};
    let resolverTypes = {};
    let ownerCounts = {};

    for (const entry of Object.values(this.cacheData)) {
      if (entry.data && entry.data.domains) {
        totalDomains += entry.data.domains.length;

        for (const domain of entry.data.domains) {
          // Count domain types
          const domainType = domain.name ? domain.name.split('.').pop() : 'unknown';
          domainTypes[domainType] = (domainTypes[domainType] || 0) + 1;

          // Count resolver types
          const resolver = domain.resolver?.addr?.id || 'none';
          resolverTypes[resolver] = (resolverTypes[resolver] || 0) + 1;

          // Count owners
          const owner = domain.owner?.id || 'none';
          ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
        }
      }
    }

    console.log(`Total cache entries: ${totalEntries}`);
    console.log(`Total domains: ${totalDomains}`);
    console.log(`Average domains per entry: ${(totalDomains / totalEntries).toFixed(2)}`);

    console.log('\nTop Domain Types:');
    Object.entries(domainTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`  .${type}: ${count} domains`);
      });

    console.log('\nTop Resolvers:');
    Object.entries(resolverTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([resolver, count]) => {
        const display = resolver === 'none' ? 'No Resolver' : resolver;
        console.log(`  ${display}: ${count} domains`);
      });

    console.log('\nTop Owners:');
    Object.entries(ownerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([owner, count]) => {
        const display = owner === 'none' ? 'No Owner' : owner;
        console.log(`  ${display}: ${count} domains`);
      });

    if (this.rl) {
      this.prompt();
    }
  }

  viewEntry(hash) {
    if (!hash) {
      console.log('Please provide a hash to view');
      this.prompt();
      return;
    }

    const entry = this.cacheData[hash];
    if (!entry) {
      console.log(`No entry found for hash: ${hash}`);
      this.prompt();
      return;
    }

    console.log(`\n=== Entry Details: ${hash} ===`);
    console.log(JSON.stringify(entry, null, 2));
    this.prompt();
  }

  filterByType(type) {
    if (!type) {
      console.log('Please provide a domain type (e.g., eth, reverse, etc.)');
      this.prompt();
      return;
    }

    console.log(`\nFiltering domains by type: .${type}`);
    const results = [];

    for (const [hash, entry] of Object.entries(this.cacheData)) {
      if (entry.data && entry.data.domains) {
        for (const domain of entry.data.domains) {
          if (domain.name && domain.name.endsWith(`.${type}`)) {
            results.push({
              hash,
              name: domain.name,
              owner: domain.owner?.id,
              resolver: domain.resolver?.addr?.id,
              createdAt: domain.createdAt,
            });
          }
        }
      }
    }

    if (results.length === 0) {
      console.log(`No domains found with type .${type}`);
    } else {
      console.log(`\nFound ${results.length} domains with type .${type}:`);
      results.slice(0, 20).forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Owner: ${result.owner || 'N/A'}`);
        console.log(`   Resolver: ${result.resolver || 'N/A'}`);
        console.log(`   Created: ${new Date(parseInt(result.createdAt) * 1000).toISOString()}`);
        console.log('');
      });

      if (results.length > 20) {
        console.log(`... and ${results.length - 20} more results.`);
      }
    }

    this.prompt();
  }

  exportData(format = 'json') {
    console.log(`\nExporting data in ${format.toUpperCase()} format...`);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `resolver-cache-export-${timestamp}.${format}`;

      if (format.toLowerCase() === 'csv') {
        this.exportCSV(filename);
      } else {
        this.exportJSON(filename);
      }

      console.log(`Data exported to: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error.message);
    }

    this.prompt();
  }

  exportJSON(filename) {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: Object.keys(this.cacheData).length,
      data: this.cacheData,
    };

    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  }

  exportCSV(filename) {
    const csvRows = ['Hash,Domain Name,Owner,Resolver,Created At'];

    for (const [hash, entry] of Object.entries(this.cacheData)) {
      if (entry.data && entry.data.domains) {
        for (const domain of entry.data.domains) {
          const row = [
            hash,
            domain.name || '',
            domain.owner?.id || '',
            domain.resolver?.addr?.id || '',
            new Date(parseInt(domain.createdAt) * 1000).toISOString(),
          ];
          csvRows.push(row.map((field) => `"${field}"`).join(','));
        }
      }
    }

    fs.writeFileSync(filename, csvRows.join('\n'));
  }
}

// CLI interface
async function main() {
  const cachePath = path.join(__dirname, '../prober/resolver-cache.json');

  if (!fs.existsSync(cachePath)) {
    console.error(`Cache file not found: ${cachePath}`);
    process.exit(1);
  }

  const browser = new CacheBrowser(cachePath);
  await browser.start();
}

// Handle command line arguments
if (process.argv.length > 2) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  // Quick commands without interactive mode
  const browser = new CacheBrowser(path.join(__dirname, '../prober/resolver-cache.json'));

  if (browser.loadCache()) {
    switch (command) {
      case 'search':
        browser.searchDomains(args.join(' '));
        break;
      case 'stats':
        browser.showStats();
        break;
      case 'list':
        browser.listEntries(args[0] ? parseInt(args[0]) : 1);
        break;
      case 'filter':
        browser.filterByType(args[0]);
        break;
      case 'view':
        browser.viewEntry(args[0]);
        break;
      default:
        console.log('Available quick commands: search, stats, list, filter, view');
        console.log('For interactive mode, run without arguments');
    }
  }
} else {
  main().catch(console.error);
}
