const AWS = require('aws-sdk');
const { ethers } = require('ethers');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

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
  { label: "Synthetix: Address Resolver", addr: "0x823be81bbf96bec0e25ca13170f5aacb5b79ba83" }
];

function encodeCalls(node) {
  const d1 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32)", [node]);
  const d2 = RESOLVER_IFACE.encodeFunctionData("addr(bytes32,uint256)", [node, 60]);
  const malformed = "0x" + "00".repeat(12) + "11".repeat(20);
  const d0 = RESOLVER_IFACE.encodeFunctionData("setAddr(bytes32,uint256,bytes)", [node, 60, malformed]);
  return [d0, d1, d2];
}

async function tryMulticall(provider, address, calls) {
  const contract = new ethers.Contract(address, MULTICALL_IFACE, provider);
  try {
    const res = await contract.callStatic.multicall(calls);
    return { ok: true, res };
  } catch (e) {
    return { ok: false, err: e };
  }
}

exports.handler = async (event) => {
    console.log('Probe Multicall Lambda invoked');

    try {
        // Get RPC URL from Parameter Store
        const rpcParam = await ssm.getParameter({
            Name: '/ens-metadata-tools/rpc-url',
            WithDecryption: true
        }).promise();

        const provider = new ethers.providers.JsonRpcProvider(rpcParam.Parameter.Value);

        const body = JSON.parse(event.body || '{}');
        const {
            address,
            domain = 'test.eth',
            bucket = process.env.METADATA_BUCKET,
            table = process.env.CACHE_TABLE
        } = body;

        const results = [];
        const testNode = namehash(domain);
        const calls = encodeCalls(testNode);

        if (address) {
            // Probe specific address
            const result = await tryMulticall(provider, address, calls);
            results.push({
                address,
                domain,
                success: result.ok,
                error: result.err ? result.err.message : null,
                timestamp: new Date().toISOString()
            });
        } else {
            // Probe all known resolvers
            for (const target of targets.slice(0, 5)) { // Limit for Lambda timeout
                const result = await tryMulticall(provider, target.addr, calls);
                results.push({
                    address: target.addr,
                    label: target.label,
                    domain,
                    success: result.ok,
                    error: result.err ? result.err.message : null,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Store results in DynamoDB
        if (table) {
            for (const result of results) {
                await dynamodb.put({
                    TableName: table,
                    Item: {
                        resolverAddress: result.address,
                        domainName: domain,
                        result,
                        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                    }
                }).promise();
            }
        }

        // Store results in S3
        if (bucket) {
            const key = `probe-results/${domain}/${Date.now()}.json`;
            await s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(results, null, 2),
                ContentType: 'application/json'
            }).promise();
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                success: true,
                results,
                count: results.length
            })
        };

    } catch (error) {
        console.error('Error in probe multicall:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

