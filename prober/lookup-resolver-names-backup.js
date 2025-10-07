#!/usr/bin/env node
import fetch from "node-fetch";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { ethers } from "ethers";

const SUBGRAPH = process.env.SUBGRAPH || "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
const CACHE_FILE = process.env.CACHE_FILE || "./resolver-cache.json";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 1000;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY) || 1000;
const ENABLE_CACHE = process.env.ENABLE_CACHE !== "false";
const OUTPUT_FORMAT = process.env.OUTPUT_FORMAT || "json"; // json, csv, minimal
const MIN_DOMAIN_COUNT = parseInt(process.env.MIN_DOMAIN_COUNT) || 1;
const RPC_URL = process.env.RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/demo";
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const PUBLIC_RESOLVER = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";

// ENS Registry ABI for resolver lookups
const ENS_REGISTRY_ABI = [
  "function resolver(bytes32 node) external view returns (address)",
  "function owner(bytes32 node) external view returns (address)",
  "function recordExists(bytes32 node) external view returns (bool)"
];

// Resolver ABI for content resolution
const RESOLVER_ABI = [
  "function addr(bytes32 node) external view returns (address)",
  "function addr(bytes32 node, uint256 coinType) external view returns (bytes memory)",
  "function text(bytes32 node, string calldata key) external view returns (string memory)",
  "function contenthash(bytes32 node) external view returns (bytes memory)",
  "function interfaceImplementer(bytes32 node, bytes4 interfaceID) external view returns (address)",
  "function name(bytes32 node) external view returns (string memory)",
  "function ABI(bytes32 node, uint256 contentTypes) external view returns (uint256, bytes memory)",
  "function pubkey(bytes32 node) external view returns (bytes32 x, bytes32 y)",
  "function supportsInterface(bytes4 interfaceID) external view returns (bool)"
];

// Domains by resolver address (nested filter on resolver.addr)
const domainsByResolverAddressQuery = `
query DomainsByResolverAddress($address: String!, $first: Int!, $skip: Int!) {
  domains(where: { resolver_: { addr: $address } }, first: $first, skip: $skip) {
    name
    id
    labelName
    labelhash
    owner { id }
    registrant { id }
    resolver {
      id
      addr { id }
      texts
    }
    parent { id name }
    subdomains { id name }
  }
}`;

// Enhanced resolver query with additional metadata
const resolverQuery = `
query DomainsWithResolvers($first: Int!, $skip: Int!) {
  domains(first: $first, skip: $skip, where: { resolver_not: null }) {
    name
    id
    createdAt
    labelName
    labelhash
    resolver {
      id
      addr {
        id
      }
      texts
      events {
        id
        blockNumber
        transactionID
      }
    }
    owner {
      id
    }
    registrant {
      id
    }
    parent {
      id
      name
    }
    subdomains {
      id
      name
    }
  }
}`;

// Enhanced domains by resolver query with performance metrics
const domainsByResolverQuery = `
query DomainsByResolver($resolver: String!, $first: Int!, $skip: Int!) {
  domains(where: {resolver: $resolver, resolvedAddress_not: null}, first: $first, skip: $skip) {
    name
    id
    createdAt
    expiryDate
    labelName
    labelhash
    resolvedAddress {
      id
    }
    owner {
      id
    }
    registrant {
      id
    }
    resolver {
      texts
      addr {
        id
      }
    }
    parent {
      id
      name
    }
    subdomains {
      id
      name
    }
  }
}`;

// Advanced analytics query for resolver performance
const resolverAnalyticsQuery = `
query ResolverAnalytics($resolver: String!) {
  resolver(id: $resolver) {
    id
    addr {
      id
    }
    domains(first: 5, orderBy: createdAt, orderDirection: desc) {
      name
      createdAt
      labelName
    }
    texts
    events(first: 10, orderBy: blockNumber, orderDirection: desc) {
      id
      blockNumber
      transactionID
    }
  }
}`;

// Query for ENS specific metadata
const ensMetadataQuery = `
query EnsMetadata($domain: String!) {
  domain(id: $domain) {
    name
    labelName
    labelhash
    parent {
      name
    }
    subdomains(first: 100) {
      name
      resolver {
        id
      }
    }
    registrations {
      registrationDate
      expiryDate
      cost
      registrant {
        id
      }
    }
    wrappedDomain {
      id
      name
      fuses
    }
  }
}`;

// Query to inspect resolver entity structure
const resolverInspectionQuery = `
query InspectResolver($id: String!) {
  resolver(id: $id) {
    id
    addr {
      id
    }
    texts
    events(first: 1) {
      id
      blockNumber
      transactionID
    }
  }
}`;

// Query to get sample resolvers and their associated domains
const sampleResolversQuery = `
query SampleResolvers {
  domains(first: 5, where: {resolver_not: null}) {
    name
    labelName
    labelhash
    resolver {
      id
      addr {
        id
      }
      texts
    }
  }
}`;

// Query to get all unique resolver addresses directly
const allResolverAddressesQuery = `
query AllResolverAddresses($first: Int!, $skip: Int!) {
  resolvers(first: $first, skip: $skip) {
    id
  }
}`;

// Fallback query through domains if direct resolver query fails
const allResolverAddressesViaDomainsQuery = `
query AllResolverAddressesViaDomains($first: Int!, $skip: Int!) {
  domains(first: $first, skip: $skip, where: {resolver_not: null}) {
    resolver {
      id
    }
  }
}`;

class ENSResolverAnalyzer {
  constructor() {
    this.cache = this.loadCache();
    this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    this.ensRegistry = new ethers.Contract(ENS_REGISTRY, ENS_REGISTRY_ABI, this.provider);
    this.stats = {
      queriesExecuted: 0,
      cachehits: 0,
      errors: 0,
      totalDomains: 0,
      uniqueResolvers: 0,
      onChainCalls: 0,
      ensRecords: 0
    };
  }

  async fetchDomainsByResolverSample(resolverAddress, first = 20) {
    try {
      const variables = { address: resolverAddress, first, skip: 0 };
      const json = await this.fetchWithRetry(domainsByResolverAddressQuery, variables);
      if (!json.data || !json.data.domains) return [];
      return json.data.domains;
    } catch (e) {
      console.error(`Failed sample fetch for resolver ${resolverAddress}: ${e.message}`);
      return [];
    }
  }

  async checkResolversForNames(addresses, options = {}) {
    const first = typeof options.first === 'number' ? options.first : 20;
    const results = [];
    for (const addr of addresses) {
      const sample = await this.fetchDomainsByResolverSample(addr, first);
      results.push({
        resolver: addr,
        sampleCount: sample.length,
        sampleDomains: sample.map(d => d.name)
      });
    }
    return results;
  }

  loadCache() {
    if (!ENABLE_CACHE || !existsSync(CACHE_FILE)) return {};
    try {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      console.error(`Cache load failed: ${e.message}`);
      return {};
    }
  }

  saveCache() {
    if (!ENABLE_CACHE) return;
    try {
      writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    } catch (e) {
      console.error(`Cache save failed: ${e.message}`);
    }
  }

  getCacheKey(query, variables) {
    const data = JSON.stringify({ query, variables });
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  namehash(name) {
    if (!name || name === '.') return ethers.constants.HashZero;
    
    const labels = name.split('.');
    let hash = ethers.constants.HashZero;
    
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(labels[i]));
      hash = ethers.utils.keccak256(ethers.utils.concat([hash, labelHash]));
    }
    
    return hash;
  }

  async getOnChainResolver(name) {
    try {
      this.stats.onChainCalls++;
      const node = this.namehash(name);
      const resolverAddress = await this.ensRegistry.resolver(node);
      const owner = await this.ensRegistry.owner(node);
      const exists = await this.ensRegistry.recordExists(node);
      
      return {
        resolver: resolverAddress,
        owner,
        exists,
        node
      };
    } catch (error) {
      console.error(`On-chain lookup failed for ${name}: ${error.message}`);
      return null;
    }
  }

  async getResolverCapabilities(resolverAddress) {
    try {
      if (resolverAddress === ethers.constants.AddressZero) return null;
      
      const resolver = new ethers.Contract(resolverAddress, RESOLVER_ABI, this.provider);
      this.stats.onChainCalls++;
      
      const capabilities = {
        supportsAddr: false,
        supportsText: false,
        supportsContenthash: false,
        supportsMulticoin: false,
        supportsPubkey: false,
        supportsABI: false,
        supportsName: false
      };

      // Check interface support
      try {
        capabilities.supportsAddr = await resolver.supportsInterface("0x3b3b57de"); // addr(bytes32)
        capabilities.supportsText = await resolver.supportsInterface("0x59d1d43c"); // text(bytes32,string)
        capabilities.supportsContenthash = await resolver.supportsInterface("0xbc1c58d1"); // contenthash(bytes32)
        capabilities.supportsMulticoin = await resolver.supportsInterface("0xf1cb7e06"); // addr(bytes32,uint256)
        capabilities.supportsPubkey = await resolver.supportsInterface("0xc8690233"); // pubkey(bytes32)
        capabilities.supportsABI = await resolver.supportsInterface("0x2203ab56"); // ABI(bytes32,uint256)
        capabilities.supportsName = await resolver.supportsInterface("0x691f3431"); // name(bytes32)
      } catch (e) {
        // Fallback: some resolvers don't implement supportsInterface correctly
        console.warn(`Interface check failed for ${resolverAddress}: ${e.message}`);
      }

      return capabilities;
    } catch (error) {
      console.error(`Capability check failed for ${resolverAddress}: ${error.message}`);
      return null;
    }
  }

  async resolveENSContent(name, resolverAddress) {
    try {
      if (resolverAddress === ethers.constants.AddressZero) return null;
      
      const resolver = new ethers.Contract(resolverAddress, RESOLVER_ABI, this.provider);
      const node = this.namehash(name);
      this.stats.onChainCalls++;
      
      const content = {
        ethAddress: null,
        contenthash: null,
        textRecords: {},
        pubkey: null,
        name: null
      };

      try {
        content.ethAddress = await resolver.addr(node);
      } catch (e) {
        // addr() not supported or failed
      }

      try {
        const contentBytes = await resolver.contenthash(node);
        if (contentBytes && contentBytes !== "0x") {
          content.contenthash = contentBytes;
        }
      } catch (e) {
        // contenthash() not supported or failed
      }

      // Try common text records
      const commonTextKeys = ['email', 'url', 'avatar', 'description', 'display', 'keywords', 'twitter', 'github'];
      for (const key of commonTextKeys) {
        try {
          const value = await resolver.text(node, key);
          if (value) content.textRecords[key] = value;
        } catch (e) {
          // text() not supported or key doesn't exist
        }
      }

      try {
        const reverseName = await resolver.name(node);
        if (reverseName) content.name = reverseName;
      } catch (e) {
        // name() not supported or failed
      }

      try {
        const pubkey = await resolver.pubkey(node);
        if (pubkey.x !== ethers.constants.HashZero || pubkey.y !== ethers.constants.HashZero) {
          content.pubkey = { x: pubkey.x, y: pubkey.y };
        }
      } catch (e) {
        // pubkey() not supported or failed
      }

      this.stats.ensRecords++;
      return content;
    } catch (error) {
      console.error(`Content resolution failed for ${name}: ${error.message}`);
      return null;
    }
  }

  async fetchWithRetry(query, variables, retries = MAX_RETRIES) {
    const cacheKey = this.getCacheKey(query, variables);
    
    if (ENABLE_CACHE && this.cache[cacheKey]) {
      this.stats.cachehits++;
      return this.cache[cacheKey];
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.stats.queriesExecuted++;
        const res = await fetch(SUBGRAPH, {
          method: "POST",
          headers: { 
            "content-type": "application/json",
            "user-agent": "ENS-Resolver-Analyzer/2.0"
          },
          body: JSON.stringify({ query, variables })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        
        if (json.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
        }

        if (ENABLE_CACHE) {
          this.cache[cacheKey] = json;
        }
        
        return json;
      } catch (error) {
        this.stats.errors++;
        console.error(`Attempt ${attempt}/${retries} failed: ${error.message}`);
        
        if (attempt === retries) {
          throw error;
        }
        
        await this.delay(RETRY_DELAY * attempt);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchResolverContracts() {
    const resolverMap = new Map();
    let skip = 0;
    let totalProcessed = 0;

    console.log(`Starting ENS resolver discovery with batch size: ${BATCH_SIZE}`);

    while (true) {
      const variables = { first: BATCH_SIZE, skip };
      const json = await this.fetchWithRetry(resolverQuery, variables);
      
      if (!json.data || !json.data.domains || json.data.domains.length === 0) break;

      const domains = json.data.domains;
      totalProcessed += domains.length;

      for (const domain of domains) {
        if (domain.resolver?.id) {
          const resolverId = domain.resolver.id;

          if (!resolverMap.has(resolverId)) {
            const [resolverAddress, nameHash] = resolverId.split('-');
            console.log(`Found new resolver: ${resolverAddress} (domain namehash: ${nameHash})`);
            resolverMap.set(resolverId, {
              id: resolverId,
              domainCount: 0,
              hasTexts: domain.resolver.texts && domain.resolver.texts.length > 0,
              hasContenthash: null, // Will be determined from on-chain calls
              hasAddr: !!domain.resolver.addr?.id,
              sampleDomains: [],
              subdomainCount: 0,
              parentDomains: new Set(),
              createdRange: { earliest: null, latest: null },
              eventCount: domain.resolver.events ? domain.resolver.events.length : 0
            });
          } else {
            // Resolver already exists, just increment count
          }

          const resolver = resolverMap.get(resolverId);
          resolver.domainCount++;
          
          // Track ENS hierarchy
          if (domain.parent) {
            resolver.parentDomains.add(domain.parent.name);
          }
          
          if (domain.subdomains) {
            resolver.subdomainCount += domain.subdomains.length;
          }
          
          // Track sample domains and creation date range
          if (resolver.sampleDomains.length < 10) {
            resolver.sampleDomains.push({
              name: domain.name,
              labelName: domain.labelName,
              hasSubdomains: domain.subdomains && domain.subdomains.length > 0
            });
          }
          
          const createdAt = parseInt(domain.createdAt);
          if (!resolver.createdRange.earliest || createdAt < resolver.createdRange.earliest) {
            resolver.createdRange.earliest = createdAt;
          }
          if (!resolver.createdRange.latest || createdAt > resolver.createdRange.latest) {
            resolver.createdRange.latest = createdAt;
          }
        }
      }

      process.stdout.write(`\rProcessed ${totalProcessed} domains, found ${resolverMap.size} resolvers`);
      
      if (domains.length < BATCH_SIZE) break;
      skip += BATCH_SIZE;

      // Rate limiting
      await this.delay(100);
    }

    console.log(`\nCompleted ENS resolver discovery`);
    this.stats.totalDomains = totalProcessed;
    this.stats.uniqueResolvers = resolverMap.size;

    return Array.from(resolverMap.values()).filter(r => r.domainCount >= MIN_DOMAIN_COUNT);
  }

  async fetchDomainsByResolver(resolverAddress) {
    const domains = [];
    let skip = 0;

    while (true) {
      const variables = { address: resolverAddress, first: BATCH_SIZE, skip };
      const json = await this.fetchWithRetry(domainsByResolverAddressQuery, variables);
      
      if (!json.data || !json.data.domains || json.data.domains.length === 0) break;

      domains.push(...json.data.domains);
      if (json.data.domains.length < BATCH_SIZE) break;
      skip += BATCH_SIZE;

      // Rate limiting for heavy resolvers
      if (domains.length > 10000) {
        await this.delay(200);
      }
    }

    return domains;
  }

  async fetchENSMetadata(domainId) {
    try {
      const json = await this.fetchWithRetry(ensMetadataQuery, { domain: domainId });
      return json.data?.domain || null;
    } catch (e) {
      console.error(`ENS metadata fetch failed for ${domainId}: ${e.message}`);
      return null;
    }
  }

  async fetchResolverAnalytics(resolverId) {
    try {
      const json = await this.fetchWithRetry(resolverAnalyticsQuery, { resolver: resolverId });
      return json.data?.resolver || null;
    } catch (e) {
      console.error(`Analytics fetch failed for ${resolverId}: ${e.message}`);
      return null;
    }
  }

  async inspectResolverStructure(resolverId) {
    try {
      console.log(`\n--- Inspecting Resolver Structure for ID: ${resolverId} ---`);
      const json = await this.fetchWithRetry(resolverInspectionQuery, { id: resolverId });

      if (json.data?.resolver) {
        const resolver = json.data.resolver;
        console.log(`Resolver ID: ${resolver.id}`);

        const [resolverAddr, domainNamehash] = resolver.id.split('-');
        console.log(`Resolver Address: ${resolverAddr}`);
        console.log(`Domain Namehash: ${domainNamehash}`);

        console.log(`Resolver Texts: ${resolver.texts || 'none'}`);
        console.log(`Resolver Addr: ${resolver.addr?.id || 'none'}`);
        console.log('---\n');
      } else {
        console.log('No resolver data found');
      }

      return json.data?.resolver || null;
    } catch (e) {
      console.error(`Resolver inspection failed for ${resolverId}: ${e.message}`);
      return null;
    }
  }

  async testResolverResolution(resolverAddress, domainName) {
    try {
      console.log(`\n--- Testing Resolver ${resolverAddress} for ${domainName} ---`);

      const node = this.namehash(domainName);
      console.log(`Domain: ${domainName}`);
      console.log(`Namehash: ${node}`);

      // Test different resolver methods
      const resolver = new ethers.Contract(resolverAddress, RESOLVER_ABI, this.provider);

      try {
        const ethAddress = await resolver.addr(node);
        console.log(`✓ addr() -> ${ethAddress}`);
      } catch (e) {
        console.log(`✗ addr() failed: ${e.message}`);
      }

      try {
        const contenthash = await resolver.contenthash(node);
        console.log(`✓ contenthash() -> ${contenthash || 'none'}`);
      } catch (e) {
        console.log(`✗ contenthash() failed: ${e.message}`);
      }

      // Test common text records
      const textKeys = ['email', 'url', 'avatar', 'description'];
      for (const key of textKeys) {
        try {
          const value = await resolver.text(node, key);
          if (value) {
            console.log(`✓ text("${key}") -> ${value}`);
          }
        } catch (e) {
          // Text record not set or method not supported
        }
      }

      console.log('---\n');
    } catch (error) {
      console.error(`Resolver test failed: ${error.message}`);
    }
  }

  async inspectSampleResolvers() {
    try {
      console.log('\n--- Inspecting Sample Resolvers ---');
      const json = await this.fetchWithRetry(sampleResolversQuery, {});

      if (json.data?.domains) {
        const seenResolvers = new Set();

        for (const domain of json.data.domains) {
          if (domain.resolver && !seenResolvers.has(domain.resolver.id)) {
            seenResolvers.add(domain.resolver.id);

            console.log(`\nResolver ${seenResolvers.size}:`);
            console.log(`  ID: ${domain.resolver.id}`);

            const [resolverAddr, domainNamehash] = domain.resolver.id.split('-');
            console.log(`  Address: ${resolverAddr}`);
            console.log(`  Domain Namehash: ${domainNamehash}`);
            console.log(`  Associated Domain: ${domain.name} (label: ${domain.labelName})`);
            console.log(`  Domain Labelhash: ${domain.labelhash}`);

            // Calculate namehash to see if it matches domain namehash
            const calculatedNamehash = this.namehash(domain.name);
            console.log(`  Calculated Namehash: ${calculatedNamehash}`);
            console.log(`  Matches Domain Namehash: ${calculatedNamehash === domainNamehash}`);

            // Test resolving the domain using this resolver
            await this.testResolverResolution(resolverAddr, domain.name);

            console.log(`  Texts: ${domain.resolver.texts || 'none'}`);
          }
        }
      }

      return json.data?.domains || [];
    } catch (e) {
      console.error(`Sample resolvers inspection failed: ${e.message}`);
      return [];
    }
  }

  analyzeENSResolverType(resolver, domains) {
    const ensPatterns = {
      publicResolver: resolver.id.toLowerCase() === PUBLIC_RESOLVER.toLowerCase(),
      isOfficialENS: /^0x[a-f0-9]{40}$/i.test(resolver.id) && domains.some(d => d.name.endsWith('.eth')),
      customResolver: domains.some(d => !d.name.endsWith('.eth')),
      subdomain: domains.some(d => d.parent && d.parent.name)
    };

    const domainStats = {
      ethDomains: domains.filter(d => d.name.endsWith('.eth')).length,
      customDomains: domains.filter(d => !d.name.endsWith('.eth')).length,
      subdomains: domains.filter(d => d.parent && d.parent.name).length,
      averageNameLength: domains.reduce((sum, d) => sum + d.name.length, 0) / domains.length,
      uniqueOwners: new Set(domains.map(d => d.owner?.id).filter(Boolean)).size,
      uniqueRegistrants: new Set(domains.map(d => d.registrant?.id).filter(Boolean)).size,
      hasExpiry: domains.some(d => d.expiryDate),
      parentDomains: new Set(domains.map(d => d.parent?.name).filter(Boolean))
    };

    return {
      type: ensPatterns.publicResolver ? 'public-resolver' : 
            ensPatterns.isOfficialENS ? 'official-ens' : 
            ensPatterns.customResolver ? 'custom' : 'unknown',
      patterns: ensPatterns,
      stats: domainStats
    };
  }

  formatOutput(results, format) {
    switch (format) {
      case 'csv':
        return this.formatCSV(results);
      case 'minimal':
        return this.formatMinimal(results);
      default:
        return JSON.stringify(results, null, 2);
    }
  }

  formatCSV(results) {
    const headers = 'Resolver,DomainCount,EthDomains,CustomDomains,Type,HasTexts,HasContenthash,AvgNameLength,UniqueOwners,OnChainCapabilities\n';
    const rows = results.map(r => 
      `${r.resolver},${r.resolverDomainCount},${r.analysis.stats.ethDomains},${r.analysis.stats.customDomains},${r.analysis.type},${r.hasTexts},${r.hasContenthash},${r.analysis.stats.averageNameLength.toFixed(1)},${r.analysis.stats.uniqueOwners},${r.onChainCapabilities ? 'true' : 'false'}`
    ).join('\n');
    return headers + rows;
  }

  formatMinimal(results) {
    return results.map(r => ({
      resolver: r.resolver,
      domains: r.contractDomains.length,
      type: r.analysis.type,
      ensCompatible: r.onChainCapabilities !== null
    }));
  }

  printStats() {
    console.log('\n--- ENS Analysis Statistics ---');
    console.log(`Total domains processed: ${this.stats.totalDomains}`);
    console.log(`Unique resolvers found: ${this.stats.uniqueResolvers}`);
    console.log(`SubGraph queries executed: ${this.stats.queriesExecuted}`);
    console.log(`On-chain calls made: ${this.stats.onChainCalls}`);
    console.log(`ENS records resolved: ${this.stats.ensRecords}`);
    console.log(`Cache hits: ${this.stats.cachehits}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    console.log(`Cache hit ratio: ${(this.stats.cachehits / (this.stats.queriesExecuted + this.stats.cachehits) * 100).toFixed(1)}%`);
  }

  async lookupResolver(target) {
    try {
      console.log(`Looking up resolver for: ${target}`);

      // Check if target is an address or domain
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(target);
      const isDomain = target.includes('.');

      if (isAddress) {
        // Lookup domains that use this resolver
        console.log(`Looking up domains using resolver: ${target}`);
        const domains = await this.fetchDomainsByResolver(target);
        console.log(`Found ${domains.length} domains using this resolver:`);
        domains.slice(0, 10).forEach((domain, index) => {
          console.log(`  ${index + 1}. ${domain.name}`);
        });
        if (domains.length > 10) {
          console.log(`  ... and ${domains.length - 10} more`);
        }
      } else if (isDomain) {
        // Lookup resolver for this domain
        const onChainData = await this.getOnChainResolver(target);
        if (onChainData) {
          console.log(`Domain: ${target}`);
          console.log(`Resolver Address: ${onChainData.resolver}`);
          console.log(`Owner: ${onChainData.owner}`);
          console.log(`Exists: ${onChainData.exists}`);

          if (onChainData.resolver && onChainData.resolver !== ethers.constants.AddressZero) {
            const content = await this.resolveENSContent(target, onChainData.resolver);
            console.log(`Resolved Address: ${content?.ethAddress || 'none'}`);
            console.log(`Content Hash: ${content?.contenthash || 'none'}`);
          }
        } else {
          console.log(`No resolver found for domain: ${target}`);
        }
      } else {
        console.log(`Invalid target. Please provide a valid Ethereum address or ENS domain.`);
      }
    } catch (error) {
      console.error(`Lookup failed: ${error.message}`);
    }
  }

  async resolveDomain(domain) {
    try {
      console.log(`Resolving domain: ${domain}\n`);

      const onChainData = await this.getOnChainResolver(domain);
      if (!onChainData || !onChainData.resolver) {
        console.log(`No resolver found for ${domain}`);
        return;
      }

      console.log(`Resolver Address: ${onChainData.resolver}`);
      console.log(`Domain Owner: ${onChainData.owner}`);
      console.log(`Domain Exists: ${onChainData.exists}\n`);

      // Test resolution
      await this.testResolverResolution(onChainData.resolver, domain);

    } catch (error) {
      console.error(`Resolution failed: ${error.message}`);
    }
  }

  async showStats() {
    try {
      console.log('ENS Resolver Statistics\n');

      const resolverAddresses = await this.queryAllResolverAddresses();
      console.log(`Total Unique Resolver Addresses: ${resolverAddresses.length}\n`);

      // Get some basic stats
      const resolverContracts = await this.fetchResolverContracts();

      const stats = {
        totalDomains: 0,
        totalResolvers: resolverContracts.length,
        avgDomainsPerResolver: 0,
        resolversWithMultipleDomains: 0,
        mostPopularResolver: null,
        maxDomains: 0
      };

      for (const resolver of resolverContracts) {
        stats.totalDomains += resolver.domainCount;
        if (resolver.domainCount > stats.maxDomains) {
          stats.maxDomains = resolver.domainCount;
          stats.mostPopularResolver = resolver.id;
        }
        if (resolver.domainCount > 1) {
          stats.resolversWithMultipleDomains++;
        }
      }

      stats.avgDomainsPerResolver = stats.totalDomains / stats.totalResolvers;

      console.log(`Total Domains Processed: ${this.stats.totalDomains}`);
      console.log(`Unique Resolvers Found: ${stats.totalResolvers}`);
      console.log(`Average Domains per Resolver: ${stats.avgDomainsPerResolver.toFixed(2)}`);
      console.log(`Resolvers with Multiple Domains: ${stats.resolversWithMultipleDomains}`);
      console.log(`Most Popular Resolver: ${stats.mostPopularResolver?.split('-')[0]} (${stats.maxDomains} domains)`);
      console.log(`SubGraph Queries Executed: ${this.stats.queriesExecuted}`);
      console.log(`Cache Hit Ratio: ${(this.stats.cachehits / (this.stats.queriesExecuted + this.stats.cachehits) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error(`Stats failed: ${error.message}`);
    }
  }

  async queryAllResolverAddresses() {
    try {
      console.log('Querying all resolver addresses from subgraph...');

      const resolverAddresses = new Set();

      // First try direct resolver query
      try {
        console.log('Trying direct resolver query...');
        let skip = 0;
        const batchSize = 1000;

        while (true) {
          const json = await this.fetchWithRetry(allResolverAddressesQuery, {
            first: batchSize,
            skip
          });

          if (!json.data || !json.data.resolvers || json.data.resolvers.length === 0) break;

          for (const resolver of json.data.resolvers) {
            if (resolver.id) {
              const [resolverAddress] = resolver.id.split('-');
              resolverAddresses.add(resolverAddress);
            }
          }

          process.stdout.write(`\rFound ${resolverAddresses.size} resolver addresses via direct query`);

          if (json.data.resolvers.length < batchSize) break;
          skip += batchSize;

          // Rate limiting
          await this.delay(100);
        }

        if (resolverAddresses.size > 0) {
          console.log(`\nSuccessfully queried resolvers directly`);
        } else {
          throw new Error('Direct query returned no results');
        }

      } catch (directQueryError) {
        console.log(`\nDirect resolver query failed: ${directQueryError.message}`);
        console.log('Falling back to domain-based query...\n');

        // Fallback to domain-based query
        resolverAddresses.clear();
        let skip = 0;
        const batchSize = 1000;
        let totalProcessed = 0;

        while (true) {
          const json = await this.fetchWithRetry(allResolverAddressesViaDomainsQuery, {
            first: batchSize,
            skip
          });

          if (!json.data || !json.data.domains || json.data.domains.length === 0) break;

          for (const domain of json.data.domains) {
            if (domain.resolver?.id) {
              const [resolverAddress] = domain.resolver.id.split('-');
              resolverAddresses.add(resolverAddress);
            }
          }

          totalProcessed += json.data.domains.length;
          process.stdout.write(`\rProcessed ${totalProcessed} domains, found ${resolverAddresses.size} resolver addresses`);

          if (json.data.domains.length < batchSize) break;
          skip += batchSize;

          // Rate limiting
          await this.delay(100);
        }
      }

      console.log(`\n\nFound ${resolverAddresses.size} unique resolver addresses:`);
      Array.from(resolverAddresses).sort().forEach((address, index) => {
        console.log(`${index + 1}. ${address}`);
      });

      return Array.from(resolverAddresses).sort();
    } catch (error) {
      console.error(`Failed to query resolver addresses: ${error.message}`);
      return [];
    }
  }

  async analyze() {
    try {
      console.log('Starting advanced ENS resolver analysis...');

      // Query all resolver addresses first
      const allResolverAddresses = await this.queryAllResolverAddresses();

      // First, inspect sample resolvers to understand the ID structure
      await this.inspectSampleResolvers();

      const resolverContracts = await this.fetchResolverContracts();
      console.log(`\nAnalyzing ${resolverContracts.length} resolvers with >= ${MIN_DOMAIN_COUNT} domains`);

      const results = [];

      for (let i = 0; i < resolverContracts.length; i++) {
        const resolver = resolverContracts[i];
        const [resolverAddress, nameHash] = resolver.id.split('-');
        console.log(`\nResolver ${i + 1}/${resolverContracts.length}: ${resolverAddress} (domain namehash: ${nameHash})`);

        const [domains, analytics, capabilities] = await Promise.all([
          this.fetchDomainsByResolver(resolver.id),
          this.fetchResolverAnalytics(resolver.id),
          this.getResolverCapabilities(resolver.id)
        ]);

        if (domains.length > 0) {
          const analysis = this.analyzeENSResolverType(resolver, domains);

          // Check resolver's own resolution for a sample domain
          let resolverSelfCheck = null;
          if (resolver.sampleDomains.length > 0) {
            const sampleDomain = resolver.sampleDomains[0];
            const [resolverAddress] = resolver.id.split('-');
            console.log(`  Checking resolver ${resolverAddress} for domain: ${sampleDomain.name}`);

            const onChainData = await this.getOnChainResolver(sampleDomain.name);
            if (onChainData && onChainData.resolver === resolverAddress) {
              console.log(`  ✓ Domain ${sampleDomain.name} uses resolver ${resolverAddress}`);

              // Test direct resolution via the resolver contract
              const content = await this.resolveENSContent(sampleDomain.name, resolverAddress);
              resolverSelfCheck = {
                domain: sampleDomain.name,
                expectedResolver: resolver.id,
                actualResolver: onChainData.resolver,
                resolvedAddress: content?.ethAddress || null,
                contenthash: content?.contenthash || null
              };

              console.log(`  ✓ Direct resolution - address: ${content?.ethAddress || 'none'}`);
              console.log(`  ✓ Direct resolution - content hash: ${content?.contenthash || 'none'}`);
              console.log(`  ✓ Direct resolution - text records: ${Object.keys(content?.textRecords || {}).length} found`);
            } else {
              console.log(`  ✗ Domain ${sampleDomain.name} resolver mismatch: expected ${resolverAddress}, got ${onChainData?.resolver || 'none'}`);
            }
          }

          // Get on-chain data for sample domains
          const onChainSamples = await Promise.all(
            resolver.sampleDomains.slice(0, 3).map(async (sample) => {
              const onChainData = await this.getOnChainResolver(sample.name);
              const content = onChainData ? await this.resolveENSContent(sample.name, onChainData.resolver) : null;
              return {
                name: sample.name,
                onChain: onChainData,
                content
              };
            })
          );
          
          results.push({
            resolver: resolver.id,
            resolverDomainCount: resolver.domainCount,
            hasTexts: resolver.hasTexts,
            hasContenthash: resolver.hasContenthash,
            hasAddr: resolver.hasAddr,
            subdomainCount: resolver.subdomainCount,
            parentDomains: Array.from(resolver.parentDomains),
            eventCount: resolver.eventCount,
            sampleDomains: resolver.sampleDomains,
            resolverSelfCheck,
            onChainSamples,
            onChainCapabilities: capabilities,
            createdRange: {
              earliest: new Date(resolver.createdRange.earliest * 1000).toISOString(),
              latest: new Date(resolver.createdRange.latest * 1000).toISOString()
            },
            contractDomains: domains.map(domain => ({
              name: domain.name,
              labelName: domain.labelName,
              labelhash: domain.labelhash,
              resolvedAddress: domain.resolvedAddress.id,
              domainId: domain.id,
              createdAt: new Date(parseInt(domain.createdAt) * 1000).toISOString(),
              expiryDate: domain.expiryDate ? new Date(parseInt(domain.expiryDate) * 1000).toISOString() : null,
              owner: domain.owner?.id,
              registrant: domain.registrant?.id,
              parent: domain.parent?.name,
              subdomainCount: domain.subdomains ? domain.subdomains.length : 0
            })),
            analysis,
            analytics: analytics ? {
              hasTexts: analytics.texts && analytics.texts.length > 0,
              hasContenthash: null, // Will be determined from on-chain calls
              recentDomains: analytics.domains?.map(d => ({
                name: d.name,
                labelName: d.labelName,
                createdAt: new Date(parseInt(d.createdAt) * 1000).toISOString()
              })) || [],
              recentEvents: analytics.events?.map(e => ({
                id: e.id,
                blockNumber: e.blockNumber,
                transactionID: e.transactionID
              })) || []
            } : null
          });
        }

        // Rate limiting and progress updates
        if (i % 5 === 0 && i > 0) {
          await this.delay(1000); // Longer delay for on-chain calls
          this.saveCache();
        }
      }

      // Sort by ENS compatibility, then by contract domains count
      results.sort((a, b) => {
        const aEnsScore = (a.analysis.stats.ethDomains / a.contractDomains.length) * 100;
        const bEnsScore = (b.analysis.stats.ethDomains / b.contractDomains.length) * 100;
        const ensScoreDiff = bEnsScore - aEnsScore;
        return ensScoreDiff !== 0 ? ensScoreDiff : b.contractDomains.length - a.contractDomains.length;
      });

      console.log(`\n\nENS analysis complete! Found ${results.length} resolvers with contract domains`);
      
      this.saveCache();
      this.printStats();

      return this.formatOutput(results, OUTPUT_FORMAT);
    } catch (error) {
      console.error(`\nENS analysis failed: ${error.message}`);
      this.saveCache();
      throw error;
    }
  }
}

// ENS Resolver Toolkit CLI
const TOOLKIT_COMMANDS = {
  'addresses': 'Query all unique resolver addresses',
  'analyze': 'Run full resolver analysis with domain counts',
  'inspect': 'Inspect sample resolvers and their structure',
  'test': 'Test resolver resolution for sample domains',
  'lookup': 'Lookup specific resolver by address or domain',
  'resolve': 'Test resolution for specific domain',
  'stats': 'Show resolver statistics and counts',
  'check-resolvers': 'List domains that use specified resolver addresses (sample)',
  'help': 'Show available commands'
};

async function showHelp() {
  console.log('\n=== ENS Resolver Toolkit ===\n');
  console.log('Usage: node lookup-resolver-names.js <command> [options]\n');
  console.log('Commands:');
  Object.entries(TOOLKIT_COMMANDS).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(12)} ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  node lookup-resolver-names.js addresses           # List all resolver addresses (direct query)');
  console.log('  node lookup-resolver-names.js analyze             # Full analysis with domain counts');
  console.log('  node lookup-resolver-names.js inspect             # Inspect resolver structure');
  console.log('  node lookup-resolver-names.js test                # Test resolver functionality');
  console.log('  node lookup-resolver-names.js lookup vitalik.eth  # Lookup resolver for domain');
  console.log('  node lookup-resolver-names.js resolve uniswap.eth # Test domain resolution');
  console.log('  node lookup-resolver-names.js check-resolvers 0xResolver1 0xResolver2');
  console.log('  node lookup-resolver-names.js stats               # Show resolver statistics');
  console.log('  node lookup-resolver-names.js help                # Show this help');
  console.log('');
}

async function main() {
  const analyzer = new ENSResolverAnalyzer();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'addresses':
      case '--addresses':
        console.log('Querying all resolver addresses...\n');
        await analyzer.queryAllResolverAddresses();
        break;

      case 'analyze':
      case '--analyze':
        console.log('Running full resolver analysis...\n');
        const results = await analyzer.analyze();
        console.log('\n--- ENS Integration Results ---');
        console.log(results);
        break;

      case 'inspect':
      case '--inspect':
        console.log('Inspecting resolver structure...\n');
        await analyzer.inspectSampleResolvers();
        break;

      case 'test':
      case '--test':
        console.log('Testing resolver resolution...\n');
        const sampleResolvers = await analyzer.inspectSampleResolvers();
        if (sampleResolvers.length > 0) {
          console.log('\nResolver testing completed');
        }
        break;

      case 'lookup':
        if (args.length === 0) {
          console.error('Please provide a target (address or domain) to lookup');
          console.log('Example: node lookup-resolver-names.js lookup vitalik.eth');
          process.exit(1);
        }
        await analyzer.lookupResolver(args[0]);
        break;

      case 'resolve':
        if (args.length === 0) {
          console.error('Please provide a domain to resolve');
          console.log('Example: node lookup-resolver-names.js resolve uniswap.eth');
          process.exit(1);
        }
        await analyzer.resolveDomain(args[0]);
        break;

      case 'stats':
      case '--stats':
        await analyzer.showStats();
        break;

      case 'check-resolvers':
        if (args.length === 0) {
          console.error('Provide one or more resolver addresses to check');
          console.log('Example: node lookup-resolver-names.js check-resolvers 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63');
          process.exit(1);
        }
        {
          const addresses = args.filter(a => /^0x[a-fA-F0-9]{40}$/.test(a));
          if (addresses.length === 0) {
            console.error('No valid resolver addresses provided.');
            process.exit(1);
          }
          const results = await analyzer.checkResolversForNames(addresses, { first: 20 });
          results.forEach(r => {
            console.log(`\nResolver: ${r.resolver}`);
            console.log(`Sample domains (${r.sampleCount}):`);
            r.sampleDomains.slice(0, 20).forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
          });
        }
        break;

      case 'help':
      case '--help':
      case '-h':
        await showHelp();
        break;

      default:
        if (command) {
          console.error(`Unknown command: ${command}`);
          await showHelp();
          process.exit(1);
        } else {
          console.log('ENS Resolver Toolkit - use "help" for commands');
          await showHelp();
          process.exit(0);
        }
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
