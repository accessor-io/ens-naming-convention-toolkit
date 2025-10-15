#!/usr/bin/env node

import fs from 'fs';

let content = fs.readFileSync('bin/subdomain-planner.js', 'utf8');

// Replace all .eth endings with .evmd.eth
content = content.replace(/'\.eth'/g, "'.evmd.eth'");

// Transform domain structures to be rooted under evmd.eth
// Pattern: category.protocol.evmd.eth instead of protocol.category.eth
content = content.replace(/defi\.eth/g, 'defi.evmd.eth');
content = content.replace(/dao\.eth/g, 'dao.evmd.eth');
content = content.replace(/infrastructure\.eth/g, 'infrastructure.evmd.eth');
content = content.replace(/gaming\.eth/g, 'gaming.evmd.eth');
content = content.replace(/social\.eth/g, 'social.evmd.eth');
content = content.replace(/rwa\.eth/g, 'rwa.evmd.eth');
content = content.replace(/privacy\.eth/g, 'privacy.evmd.eth');
content = content.replace(/tokens\.eth/g, 'tokens.evmd.eth');
content = content.replace(/analytics\.eth/g, 'analytics.evmd.eth');
content = content.replace(/wallet\.eth/g, 'wallet.evmd.eth');
content = content.replace(/insurance\.eth/g, 'insurance.evmd.eth');
content = content.replace(/art\.eth/g, 'art.evmd.eth');
content = content.replace(/supplychain\.eth/g, 'supplychain.evmd.eth');
content = content.replace(/healthcare\.eth/g, 'healthcare.evmd.eth');
content = content.replace(/finance\.eth/g, 'finance.evmd.eth');
content = content.replace(/developer\.eth/g, 'developer.evmd.eth');

// Update metadata keys to match new structure
content = content.replace(/'v3\.<protocol>\.amm\.eth'/g, "'amm.<protocol>.defi.evmd.eth'");
content = content.replace(
  /'factory\.v3\.<protocol>\.amm\.eth'/g,
  "'factory.amm.<protocol>.defi.evmd.eth'"
);
content = content.replace(
  /'router\.v3\.<protocol>\.amm\.eth'/g,
  "'router.amm.<protocol>.defi.evmd.eth'"
);
content = content.replace(
  /'quoter\.v3\.<protocol>\.amm\.eth'/g,
  "'quoter.amm.<protocol>.defi.evmd.eth'"
);
content = content.replace(
  /'multicall\.v3\.<protocol>\.amm\.eth'/g,
  "'multicall.amm.<protocol>.defi.evmd.eth'"
);
content = content.replace(
  /'positions\.v3\.<protocol>\.amm\.eth'/g,
  "'positions.amm.<protocol>.defi.evmd.eth'"
);

content = content.replace(/'v3\.<protocol>\.lending\.eth'/g, "'lending.<protocol>.defi.evmd.eth'");
content = content.replace(
  /'pool\.v3\.<protocol>\.lending\.eth'/g,
  "'pool.lending.<protocol>.defi.evmd.eth'"
);

fs.writeFileSync('bin/subdomain-planner.js', content);
console.log('Updated all domain structures to use evmd.eth as root');
