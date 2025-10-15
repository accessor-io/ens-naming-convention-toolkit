const fetch = require('node-fetch');

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

// Query to get all unique resolver addresses that are actually contracts
const RESOLVER_QUERY = `
query GetAllResolvers($first: Int!, $skip: Int!) {
  resolvers(first: $first, skip: $skip, where: {addr_not: null}) {
    id
    addr {
      id
    }
  }
}
`;

// Alternative query to get resolvers through domains
const DOMAIN_RESOLVER_QUERY = `
query GetResolversViaDomains($first: Int!, $skip: Int!) {
  domains(first: $first, skip: $skip, where: {resolver_not: null}) {
    resolver {
      addr {
        id
      }
    }
  }
}
`;

async function fetchWithRetry(query, variables, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function getAllResolverAddresses() {
  const resolverAddresses = new Set();
  let skip = 0;
  const batchSize = 1000;
  let totalFetched = 0;

  console.log('Querying ENS subgraph for resolver addresses...\n');

  try {
    // Try direct resolver query first
    console.log('Trying direct resolver query...');

    while (true) {
      const data = await fetchWithRetry(RESOLVER_QUERY, {
        first: batchSize,
        skip,
      });

      if (!data.data || !data.data.resolvers || data.data.resolvers.length === 0) {
        break;
      }

      for (const resolver of data.data.resolvers) {
        if (resolver.addr && resolver.addr.id) {
          resolverAddresses.add(resolver.addr.id);
        }
      }

      totalFetched += data.data.resolvers.length;
      console.log(
        `Fetched ${totalFetched} resolvers, found ${resolverAddresses.size} unique addresses`
      );

      if (data.data.resolvers.length < batchSize) break;
      skip += batchSize;

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (resolverAddresses.size === 0) {
      throw new Error('Direct query returned no results');
    }
  } catch (error) {
    console.log(`Direct query failed: ${error.message}`);
    console.log('Trying domain-based query...\n');

    // Fallback to domain-based query
    resolverAddresses.clear();
    skip = 0;
    totalFetched = 0;

    while (true) {
      const data = await fetchWithRetry(DOMAIN_RESOLVER_QUERY, {
        first: batchSize,
        skip,
      });

      if (!data.data || !data.data.domains || data.data.domains.length === 0) {
        break;
      }

      for (const domain of data.data.domains) {
        if (domain.resolver && domain.resolver.addr && domain.resolver.addr.id) {
          resolverAddresses.add(domain.resolver.addr.id);
        }
      }

      totalFetched += data.data.domains.length;
      console.log(
        `Fetched ${totalFetched} domains, found ${resolverAddresses.size} unique resolver addresses`
      );

      if (data.data.domains.length < batchSize) break;
      skip += batchSize;

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return Array.from(resolverAddresses).sort();
}

async function main() {
  try {
    const addresses = await getAllResolverAddresses();

    console.log(`\nFound ${addresses.length} unique resolver addresses!`);

    // Save to file
    const fs = require('fs');
    let output = `# ENS Resolver Addresses from Subgraph\n`;
    output += `# Total: ${addresses.length}\n`;
    output += `# Generated: ${new Date().toISOString()}\n\n`;

    addresses.forEach((addr, index) => {
      output += `${index + 1}. ${addr}\n`;
    });

    fs.writeFileSync('ens-resolver-addresses.txt', output);
    console.log(`\nSaved to ens-resolver-addresses.txt`);

    // Show first 20 addresses
    console.log(`\nFirst 20 addresses:`);
    addresses.slice(0, 20).forEach((addr, index) => {
      console.log(`${index + 1}. ${addr}`);
    });

    if (addresses.length > 20) {
      console.log(`... and ${addresses.length - 20} more`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
