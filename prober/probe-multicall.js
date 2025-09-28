#!/usr/bin/env node
import { ethers } from "ethers";

const TENDERLY_RPC = process.env.RPC_URL || "https://virtual.mainnet.us-west.rpc.tenderly.co/5f3fecd6-23c2-4754-b89c-f80d1d63a03a";

// Minimal ABIs
const MULTICALL_IFACE = new ethers.utils.Interface([
  "function multicall(bytes[] data) returns (bytes[] memory)"
]);
const RESOLVER_IFACE = new ethers.utils.Interface([
  "function addr(bytes32 node) view returns (address)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
  "function setAddr(bytes32 node, uint256 coinType, bytes a)",
  "function setAddr(bytes32 node, address a)",
  "function setText(bytes32 node, string key, string value)",
  "function setContenthash(bytes32 node, bytes hash)",
  "function setAuthorisation(bytes32 node, address owner, address target, bool isAuthorised)",
  "function supportsInterface(bytes4 interfaceID) view returns (bool)",
  "function resolve(bytes name, bytes data) view returns (bytes)"
]);
const ENS_REGISTRY_ADDR = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const ENS_IFACE = new ethers.utils.Interface([
  "function owner(bytes32 node) view returns (address)",
  "function resolver(bytes32 node) view returns (address)",
  "function setResolver(bytes32 node, address resolver)"
]);

function namehash(name) {
  let node = "0x" + "00".repeat(32);
  if (!name) return node;
  const labels = name.split(".");
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(labels[i]));
    node = ethers.utils.keccak256(ethers.utils.concat([node, labelHash]));
  }
  return node;
}

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
  { label: "recover-me.eth", addr: "0xaf94049d18357bebc539efa51bd106637131a13c" },
  { label: "resolve.0x1x2x3x4x5x6.eth", addr: "0x27b10f0ae2a701d76e1194585c744495c246d658" },
  { label: "d2r-revolver-game-share.eth", addr: "0x583069d2076b0a0bb2f56c8d9912224208a4c0b3" },
  { label: "contact-me-on-telegram...", addr: "0x9ed16db6baab91f378ef900702ea436c9f0cec4c" },
  { label: "to-recover-stolen-funds-2021...", addr: "0x9bd7a9eeb9c067d9174cfb9f8da0e63e0e3443c0" },
  { label: "resolver.on.namestone.eth", addr: "0xa87361c4e58b619c390f469b9e6f27d759715125" },
  { label: "wildcardresolver.eth", addr: "0x53e42d7b919c72678996c3f3486f93e75946a47c" },
  { label: "offchainresolver.eth", addr: "0xafd91ef047189f7e894d0fac71dcce8687e9b893" },
  { label: "iamtheresolver.eth", addr: "0x969953575da5142799c68372bdcfab437b1e68c0" },
];

const provider = new ethers.providers.JsonRpcProvider(TENDERLY_RPC);

function encodeCalls(node) {
  const d1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [node]);
  const d2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 60]);
  // malformed 32-byte ETH payload
  const malformed = "0x" + "00".repeat(12) + "11".repeat(20);
  const d0 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [node, 60, malformed]);
  // additional variants
  const d2_ct0 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 0]);
  const d2_ctLarge = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 2147483647]);
  return [d0, d1, d2, d2_ct0, d2_ctLarge];
}

async function tryMulticall(address, calls) {
  const contract = new ethers.Contract(address, MULTICALL_IFACE, provider);
  try {
    const res = await contract.callStatic.multicall(calls);
    return { ok: true, res };
  } catch (e) {
    return { ok: false, err: e };
  }
}

async function getOwnerAndResolver(name) {
  const node = namehash(name);
  const ens = new ethers.Contract(ENS_REGISTRY_ADDR, ENS_IFACE, provider);
  const [owner, resolver] = await Promise.all([
    ens.owner(node).catch(() => ethers.constants.AddressZero),
    ens.resolver(node).catch(() => ethers.constants.AddressZero),
  ]);
  return { node, owner, resolver };
}

async function impersonateAndFund(address) {
  // Try multiple RPCs for compatibility
  const oneEthHex = ethers.utils.hexStripZeros(ethers.utils.parseEther("10").toHexString()) || "0x0";
  try { await provider.send("tenderly_setBalance", [[address], oneEthHex]); } catch (_) {}
  try { await provider.send("hardhat_setBalance", [address, ethers.utils.hexlify(ethers.utils.parseEther("10"))]); } catch (_) {}
  try { await provider.send("anvil_setBalance", [address, ethers.utils.hexlify(ethers.utils.parseEther("10"))]); } catch (_) {}

  let impersonated = false;
  try { await provider.send("tenderly_impersonateAccount", [address]); impersonated = true; } catch (_) {}
  if (!impersonated) { try { await provider.send("hardhat_impersonateAccount", [address]); impersonated = true; } catch (_) {} }
  if (!impersonated) { try { await provider.send("anvil_impersonateAccount", [address]); impersonated = true; } catch (_) {} }
  return impersonated;
}

async function sendWriteReadMulticall(resolverAddr, node) {
  // malformed write then reads
  const malformed = "0x" + "00".repeat(12) + "11".repeat(20);
  const d0 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [node, 60, malformed]);
  const d1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [node]);
  const d2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 60]);

  const contract = new ethers.Contract(resolverAddr, MULTICALL_IFACE, provider);
  // Use any signer; provider.getSigner(address) should work after impersonation
  return { data: [d0, d1, d2], call: (signer) => contract.connect(signer).multicall([d0, d1, d2]) };
}

function encodeMulticallData(darray) {
  // Encode function multicall(bytes[])
  const multicallIface = new ethers.utils.Interface([
    "function multicall(bytes[] data) returns (bytes[] memory)"
  ]);
  return multicallIface.encodeFunctionData("multicall", [darray]);
}

async function probe(target) {
  const node = namehash("resolver.eth");
  const calls = encodeCalls(node);

  // detect multicall presence
  let hasMulticall = false;
  try {
    const empty = await new ethers.Contract(target.addr, MULTICALL_IFACE, provider).callStatic.multicall([]);
    hasMulticall = Array.isArray(empty);
  } catch (_) {}

  const out = { label: target.label, addr: target.addr, multicall: hasMulticall, vulnerableSignals: [] };
  if (!hasMulticall) return out;

  const { ok, res, err } = await tryMulticall(target.addr, [calls[1], calls[2]]);
  if (!ok) {
    const data = (err && (err.data || (err.error && err.error.data))) || "0x";
    if (typeof data === "string" && data.startsWith("0x556f1830")) {
      out.vulnerableSignals.push("offchainlookup-revert");
    } else {
      out.vulnerableSignals.push(`multicall-read-revert:${String(err && err.message || err)}`);
    }
    return out;
  }

  try {
    const addrEncoded = res[0];
    const bytesEncoded = res[1];
    let ethAddr;
    try {
      [ethAddr] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32)", addrEncoded);
    } catch (e) {
      out.vulnerableSignals.push("addr(bytes32)-decode-failure");
    }
    let ethBytes;
    try {
      [ethBytes] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32,uint256)", bytesEncoded);
    } catch (e) {
      out.vulnerableSignals.push("addr(bytes32,uint256)-decode-failure");
    }
    if (ethAddr && ethBytes && typeof ethBytes === "string" && ethBytes.length >= 42) {
      const last20 = "0x" + ethBytes.slice(-40);
      try {
        const norm = ethers.utils.getAddress(last20);
        if (ethAddr.toLowerCase() !== norm.toLowerCase()) {
          out.vulnerableSignals.push("divergence-addr-vs-addr60");
        }
      } catch (_) {
        out.vulnerableSignals.push("addr60-invalid-bytes");
      }
    }
  } catch (e) {
    out.vulnerableSignals.push(`decode-error:${String(e.message || e)}`);
  }

  // Try extended batches: additional coinTypes
  try {
    const { ok: ok2, res: res2 } = await tryMulticall(target.addr, [calls[3], calls[4]]);
    if (ok2) {
      // Just record if any non-empty bytes returned for odd coinTypes
      const ct0Bytes = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32,uint256)", res2[0])[0];
      const largeBytes = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32,uint256)", res2[1])[0];
      if (ct0Bytes && typeof ct0Bytes === "string" && ct0Bytes.length > 42) {
        out.vulnerableSignals.push("addr(ct0)-unexpected-length");
      }
      if (largeBytes && typeof largeBytes === "string" && largeBytes.length > 42) {
        out.vulnerableSignals.push("addr(largeCoinType)-unexpected-length");
      }
    }
  } catch (_) {}

  // Try resolve(bytes,bytes) path for addr(node)
  try {
    const dnsName = (() => {
      const labels = ["resolver", "eth"];
      const parts = [];
      for (const l of labels) {
        parts.push(ethers.utils.hexlify(l.length));
        parts.push(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(l)));
      }
      parts.push("0x00");
      return ethers.utils.hexConcat(parts);
    })();
    const data = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [node]);
    const resolveCall = RESOLVER_IFACE.encodeFunctionData("resolve(bytes,bytes)", [dnsName, data]);
    const { ok: ok3, res: res3 } = await tryMulticall(target.addr, [resolveCall]);
    if (ok3) {
      // If it returns, attempt decode like addr(node)
      try {
        const decoded = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32)", res3[0])[0];
        if (!decoded) out.vulnerableSignals.push("resolve-empty");
      } catch (_) {
        out.vulnerableSignals.push("resolve-decode-failure");
      }
    }
  } catch (_) {}

  // Try direct-callback attempts (will revert if not present)
  try {
    const values = ["0x", ethers.utils.hexConcat(["0x" + "00".repeat(12), "0x" + "22".repeat(20)])];
    const extraTrue = ethers.utils.defaultAbiCoder.encode(["bool"], [true]);
    const extraFalse = ethers.utils.defaultAbiCoder.encode(["bool"], [false]);
    const candidates = [
      { name: "addressCallback(bytes[],uint8,bytes)", args: [values, 0, extraTrue] },
      { name: "textCallback(bytes[],uint8,bytes)", args: [values, 0, extraFalse] },
      { name: "contenthashCallback(bytes[],uint8,bytes)", args: [values, 0, extraFalse] },
      { name: "resolveCallback(bytes[],uint8,bytes)", args: [values, 0, extraFalse] },
      { name: "ccipVerify(bytes)", args: [ethers.utils.hexlify(ethers.utils.randomBytes(8))] },
      { name: "callback(bytes)", args: [ethers.utils.hexlify(ethers.utils.randomBytes(8))] },
    ];
    for (const c of candidates) {
      let types, encArgs;
      if (c.name === "ccipVerify(bytes)" || c.name === "callback(bytes)") {
        types = ["bytes"];
        encArgs = ethers.utils.defaultAbiCoder.encode(types, c.args);
      } else {
        types = ["bytes[]","uint8","bytes"];
        encArgs = ethers.utils.defaultAbiCoder.encode(types, c.args);
      }
      const sig = ethers.utils.id(c.name).slice(0,10);
      const payload = ethers.utils.hexConcat([sig, encArgs]);
      const { ok: okX } = await tryMulticall(target.addr, [payload]);
      if (okX) {
        out.vulnerableSignals.push(`callback-reachable:${c.name}`);
      }
    }
  } catch (_) {}

  return out;
}

async function main() {
  const names = (process.env.NAMES || "resolver.eth,ens.eth,opensea.eth").split(",").map(s => s.trim()).filter(Boolean);
  const results = [];
  const unauthorized = [];
  // Unauthorized write test per resolver (random node, random from)
  for (const t of targets) {
    const randNode = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const p32 = "0x" + "00".repeat(12) + "11".repeat(20);
    const w = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [randNode, 60, p32]);
    const r1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [randNode]);
    const r2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [randNode, 60]);
    const wLegacy = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,address)", [randNode, ethers.constants.AddressZero]);
    const wText = RESOLVER_IFACE.encodeFunctionData("setText(bytes32,string,string)", [randNode, "com.twitter", "x"]);
    const wCH = RESOLVER_IFACE.encodeFunctionData("setContenthash(bytes32,bytes)", [randNode, "0x12" + "34".repeat(32)]);
    const wAuth = RESOLVER_IFACE.encodeFunctionData("setAuthorisation(bytes32,address,address,bool)", [randNode, ethers.constants.AddressZero, ethers.constants.AddressZero, true]);
    const batches = [
      { kind: "setAddr(bytes,60,bytes)", data: encodeMulticallData([w, r1, r2]) },
      { kind: "setAddr(bytes,address)", data: encodeMulticallData([wLegacy, r1]) },
      { kind: "setText", data: encodeMulticallData([wText]) },
      { kind: "setContenthash", data: encodeMulticallData([wCH]) },
      { kind: "setAuthorisation", data: encodeMulticallData([wAuth]) },
    ];
    for (const b of batches) {
      try {
        const from = ethers.utils.getAddress("0x" + "33".repeat(20));
        const txHash = await provider.send("eth_sendTransaction", [{ from, to: t.addr, data: b.data, gas: "0x2DC6C0", value: "0x0" }]);
        unauthorized.push({ label: t.label, addr: t.addr, kind: b.kind, txHash, result: "accepted-unauthorized-write" });
      } catch (e) {
        unauthorized.push({ label: t.label, addr: t.addr, kind: b.kind, error: "unauthorized-write-reverted" });
      }
    }
  }
  for (const t of targets) {
    const r = await probe(t);
    r.nameResults = [];
    for (const nm of names) {
      const node = namehash(nm);
      const d1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [node]);
      const d2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 60]);
      if (r.multicall) {
        try {
          const { ok, res } = await tryMulticall(t.addr, [d1, d2]);
          if (ok) {
            let addrv = null, bytesv = null;
            try { [addrv] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32)", res[0]); } catch {}
            try { [bytesv] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32,uint256)", res[1]); } catch {}
            r.nameResults.push({ name: nm, addr: addrv, addr60: bytesv });
          } else {
            r.nameResults.push({ name: nm, error: "multicall-revert" });
          }
        } catch (e) {
          r.nameResults.push({ name: nm, error: String(e.message || e) });
        }
        // attempt write+read hijack variants if resolver matches
        try {
          const { node: nodeHash, owner, resolver } = await getOwnerAndResolver(nm);
          if (owner && owner !== ethers.constants.AddressZero) {
            // If resolver doesn't match target and target supports multicall, try to repoint resolver first
            if (r.multicall && (!resolver || resolver.toLowerCase() !== t.addr.toLowerCase())) {
              const setResData = ENS_IFACE.encodeFunctionData("setResolver", [nodeHash, t.addr]);
              try {
                await provider.send("eth_sendTransaction", [{ from: owner, to: ENS_REGISTRY_ADDR, data: setResData, gas: "0x186A00", value: "0x0" }]);
              } catch (_) {}
            }
          }
          if (owner && owner !== ethers.constants.AddressZero && t.addr && r.multicall) {
            // re-read resolver
            let curResolver = resolver;
            try { curResolver = await new ethers.Contract(ENS_REGISTRY_ADDR, ENS_IFACE, provider).resolver(nodeHash); } catch {}
            if (!curResolver || curResolver.toLowerCase() !== t.addr.toLowerCase()) {
              r.nameResults.push({ name: nm, note: "resolver-not-updated", target: t.addr });
              continue;
            }
            // Payload variants
            const p21 = "0x" + "aa".repeat(21);
            const p32 = "0x" + "00".repeat(12) + "11".repeat(20);
            const p20 = "0x" + "22".repeat(20);
            const set21 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [nodeHash, 60, p21]);
            const set32 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [nodeHash, 60, p32]);
            const set20 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [nodeHash, 60, p20]);
            const r1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [nodeHash]);
            const r2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [nodeHash, 60]);
            // resolve path
            const namewire = (() => {
              const labels = nm.split(".");
              const parts = [];
              for (const l of labels) { parts.push(ethers.utils.hexlify(l.length)); parts.push(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(l))); }
              parts.push("0x00");
              return ethers.utils.hexConcat(parts);
            })();
            const rResolve = RESOLVER_IFACE.encodeFunctionData("resolve(bytes,bytes)", [namewire, r1]);

            const variants = [
              { kind: "set32+reads", data: encodeMulticallData([set32, r1, r2]) },
              { kind: "set21+reads", data: encodeMulticallData([set21, r1, r2]) },
              { kind: "set20+reads", data: encodeMulticallData([set20, r1, r2]) },
              { kind: "set32+resolve", data: encodeMulticallData([set32, rResolve, r2]) },
            ];

            for (const v of variants) {
              try {
                const txHash = await provider.send("eth_sendTransaction", [{ from: owner, to: t.addr, data: v.data, gas: "0x2DC6C0", value: "0x0" }]);
                const { ok: okAfter, res: resAfter } = await tryMulticall(t.addr, [d1, d2]);
                let postAddr=null, postBytes=null;
                if (okAfter) {
                  try { [postAddr] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32)", resAfter[0]); } catch {}
                  try { [postBytes] = RESOLVER_IFACE.decodeFunctionResult("addr(bytes32,uint256)", resAfter[1]); } catch {}
                }
                r.nameResults.push({ name: nm, writeRead: true, variant: v.kind, txHash, postAddr, postAddr60: postBytes });
              } catch (e) {
                r.nameResults.push({ name: nm, writeRead: true, variant: v.kind, error: `eth_sendTransaction-failed:${String(e.message || e)}` });
              }
            }
          }
        } catch (_) {}
      } else {
        try {
          const c = new ethers.Contract(t.addr, RESOLVER_IFACE, provider);
          let addrv = null, bytesv = null;
          try { addrv = await c.addr(node); } catch {}
          try { bytesv = await c["addr(bytes32,uint256)"](node, 60); } catch {}
          r.nameResults.push({ name: nm, addr: addrv, addr60: bytesv });
        } catch (e) {
          r.nameResults.push({ name: nm, error: String(e.message || e) });
        }
      }
    }
    results.push(r);
  }
  console.log(JSON.stringify({ unauthorized, results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


