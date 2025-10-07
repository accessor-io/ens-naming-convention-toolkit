const fs = require('fs');
const { ethers } = require('ethers');

// Read the resolver addresses
const addresses = fs.readFileSync('resolver-addresses-list.txt', 'utf8')
  .split('\n')
  .filter(line => line.match(/^\d+\. 0x[a-fA-F0-9]{40}$/))
  .map(line => line.split('. ')[1]);

console.log(`Found ${addresses.length} resolver addresses to analyze`);

const RPC_URL = process.env.RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function fetchResolverInfo(address) {
  try {
    const code = await provider.getCode(address);
    const isContract = code !== '0x';
    
    return {
      address,
      isContract,
      codeLength: code.length,
      hasCode: code !== '0x'
    };
  } catch (error) {
    return {
      address,
      error: error.message,
      isContract: false
    };
  }
}

async function analyzeResolvers() {
  const results = [];
  
  console.log('Analyzing resolvers...');
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    console.log(`Processing ${i + 1}/${addresses.length}: ${address}`);
    
    const result = await fetchResolverInfo(address);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save results
  const contractAddresses = results.filter(r => r.isContract);
  const eoaAddresses = results.filter(r => !r.isContract);
  
  console.log(`\nResults:`);
  console.log(`Contracts: ${contractAddresses.length}`);
  console.log(`EOAs: ${eoaAddresses.length}`);
  
  fs.writeFileSync('resolver-analysis.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('contract-resolvers.txt', contractAddresses.map(r => r.address).join('\n'));
  fs.writeFileSync('eoa-resolvers.txt', eoaAddresses.map(r => r.address).join('\n'));
  
  console.log('Results saved to resolver-analysis.json');
  console.log('Contract addresses saved to contract-resolvers.txt');
  console.log('EOA addresses saved to eoa-resolvers.txt');
}

analyzeResolvers().catch(console.error);
