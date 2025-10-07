const fs = require('fs');
const { ethers } = require('ethers');

// Read the real resolver addresses
const addresses = fs.readFileSync('real-resolver-addresses.txt', 'utf8')
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .map(line => line.split('  #')[0].trim());

console.log(`Found ${addresses.length} real resolver addresses`);

const RPC_URL = process.env.RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function downloadResolverSource(address, label) {
  try {
    console.log(`\nDownloading source for ${label} (${address})`);
    
    // Get bytecode
    const bytecode = await provider.getCode(address);
    
    if (bytecode === '0x') {
      console.log(`  ❌ No code found at ${address}`);
      return { address, label, hasCode: false };
    }
    
    console.log(`  ✅ Found bytecode (${bytecode.length} chars)`);
    
    // Create directory for this resolver
    const dirName = `${address}_${label.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dirPath = `resolver-sources/${dirName}`;
    
    if (!fs.existsSync('resolver-sources')) {
      fs.mkdirSync('resolver-sources');
    }
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    
    // Save bytecode
    fs.writeFileSync(`${dirPath}/bytecode.hex`, bytecode);
    
    // Save metadata
    const metadata = {
      address,
      label,
      bytecodeLength: bytecode.length,
      downloadedAt: new Date().toISOString(),
      rpcUrl: RPC_URL
    };
    
    fs.writeFileSync(`${dirPath}/metadata.json`, JSON.stringify(metadata, null, 2));
    
    console.log(`  💾 Saved to ${dirPath}/`);
    
    return { address, label, hasCode: true, bytecodeLength: bytecode.length };
    
  } catch (error) {
    console.log(`  ❌ Error downloading ${address}: ${error.message}`);
    return { address, label, error: error.message };
  }
}

async function downloadAllResolvers() {
  const results = [];
  
  console.log('Starting resolver source download...\n');
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const label = `Resolver_${i + 1}`;
    
    const result = await downloadResolverSource(address, label);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save summary
  const summary = {
    totalAddresses: addresses.length,
    successful: results.filter(r => r.hasCode).length,
    failed: results.filter(r => !r.hasCode).length,
    results: results
  };
  
  fs.writeFileSync('resolver-download-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`\n📊 Download Summary:`);
  console.log(`  Total addresses: ${summary.totalAddresses}`);
  console.log(`  Successful: ${summary.successful}`);
  console.log(`  Failed: ${summary.failed}`);
  console.log(`  Summary saved to resolver-download-summary.json`);
}

downloadAllResolvers().catch(console.error);
