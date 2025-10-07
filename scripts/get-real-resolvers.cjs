const fetch = require('node-fetch');

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

// Query to get domains with their resolver addresses (the actual resolver contracts)
const DOMAINS_WITH_RESOLVERS_QUERY = `
query DomainsWithResolvers($first: Int!, $skip: Int!) {
  domains(first: $first, skip: $skip, where: {resolver_not: null}) {
    name
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
          variables
        })
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
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function getRealResolverAddresses() {
  const resolverAddresses = new Set();
  let skip = 0;
  const batchSize = 1000;
  let totalProcessed = 0;

  console.log('Querying ENS subgraph for actual resolver contract addresses...\n');

  while (true) {
    const data = await fetchWithRetry(DOMAINS_WITH_RESOLVERS_QUERY, {
      first: batchSize,
      skip
    });

    if (!data.data || !data.data.domains || data.data.domains.length === 0) {
      break;
    }

    for (const domain of data.data.domains) {
      if (domain.resolver && domain.resolver.addr && domain.resolver.addr.id) {
        resolverAddresses.add(domain.resolver.addr.id);
      }
    }

    totalProcessed += data.data.domains.length;
    console.log(`Processed ${totalProcessed} domains, found ${resolverAddresses.size} unique resolver addresses`);

    if (data.data.domains.length < batchSize) break;
    skip += batchSize;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Array.from(resolverAddresses).sort();
}

async function main() {
  try {
    const addresses = await getRealResolverAddresses();
    
    console.log(`\n🎉 Found ${addresses.length} unique resolver contract addresses!`);
    
    // Save to file
    const fs = require('fs');
    let output = `# Real ENS Resolver Contract Addresses\n`;
    output += `# Total: ${addresses.length}\n`;
    output += `# Generated: ${new Date().toISOString()}\n`;
    output += `# These are actual resolver contracts, not resolved addresses\n\n`;
    
    addresses.forEach((addr, index) => {
      output += `${index + 1}. ${addr}\n`;
    });
    
    fs.writeFileSync('real-resolver-contracts.txt', output);
    console.log(`\n💾 Saved to real-resolver-contracts.txt`);
    
    // Show first 20 addresses
    console.log(`\nFirst 20 resolver contract addresses:`);
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
