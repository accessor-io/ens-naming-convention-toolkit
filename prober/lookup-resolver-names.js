#!/usr/bin/env node
import fetch from "node-fetch";

const SUBGRAPH = process.env.SUBGRAPH || "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

const targets = [
  { label: "ENS: Owned Resolver", addr: "0x30200e0cb040f38e474e53ef437c95a1be723b2b" },
  { label: "OpenSea: ENS Resolver", addr: "0x9c4e9cce4780062942a7fe34fa2fa7316c872956" },
  { label: "Kyber: ENS Resolver", addr: "0x1982131c7d6959ff7768ee39c023ad002d8c9759" },
  { label: "Synthetix: Address Resolver", addr: "0x823be81bbf96bec0e25ca13170f5aacb5b79ba83" },
  { label: "ENS: Offchain Resolver", addr: "0xc1735677a60884abbcf72295e88d47764beda282" },
  { label: "Unstoppable Domains: Resolver", addr: "0xb66dce2da6afaaa98f2013446dbcb0f4b0ab2842" },
  { label: "ENS: Public Resolver 1", addr: "0xdaaf96c344f63131acadd0ea35170e7892d3dfba" },
  { label: "ENS: Default Reverse Resolver", addr: "0xa2c122be93b0074270ebee7f6b7292c7deb45047" },
  { label: "ENS: Public Resolver 2", addr: "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41" },
  { label: "Synthetix: Old Address Resolver", addr: "0xfbb6526ed92da8915d4843a86166020d0b7baad0" },
  { label: ".badass ENS Public Resolver", addr: "0x0d5bbccb9df4689400c70f8206333c5ce8720f58" },
  { label: "ENS: Old Public Resolver 1", addr: "0x1da022710df5002339274aadee8d58218e9d6ab5" },
  { label: "ENS: Old Public Resolver 2", addr: "0x226159d592e2b063810a10ebf6dcbada94ed68b8" },
  { label: "resolver.1namespace.eth", addr: "0xe5a0277018879679d18ccdb66b52bd06f7fe95fd" },
  { label: "wildcardresolver.eth", addr: "0x53e42d7b919c72678996c3f3486f93e75946a47c" },
  { label: "offchainresolver.eth", addr: "0xafd91ef047189f7e894d0fac71dcce8687e9b893" },
  { label: "iamtheresolver.eth", addr: "0x969953575da5142799c68372bdcfab437b1e68c0" },
];

const query = `
query NamesByResolver($resolver: String!, $first: Int!, $skip: Int!) {
  domains(where: {resolver: $resolver}, first: $first, skip: $skip, orderBy: name, orderDirection: asc) {
    name
    id
    resolver { id }
  }
}`;

async function fetchNames(addr) {
  const variables = { resolver: addr.toLowerCase(), first: 1000, skip: 0 };
  const names = [];
  while (true) {
    const res = await fetch(SUBGRAPH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (!json.data || !json.data.domains) break;
    const batch = json.data.domains.map(d => d.name).filter(Boolean);
    names.push(...batch);
    if (batch.length < variables.first) break;
    variables.skip += variables.first;
  }
  return names;
}

async function main() {
  const out = [];
  for (const t of targets) {
    try {
      const names = await fetchNames(t.addr);
      out.push({ label: t.label, addr: t.addr, count: names.length, names: names.slice(0, 50) });
    } catch (e) {
      out.push({ label: t.label, addr: t.addr, error: String(e.message || e) });
    }
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });



