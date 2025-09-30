const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

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
    }
    owner {
      id
    }
  }
}`;

exports.handler = async (event) => {
    console.log('Lookup Resolver Names Lambda invoked');

    try {
        // Get subgraph URL from Parameter Store
        const subgraphParam = await ssm.getParameter({
            Name: '/ens-metadata-tools/subgraph-url'
        }).promise();

        const body = JSON.parse(event.body || '{}');
        const {
            resolver,
            first = 100,
            skip = 0,
            bucket = process.env.METADATA_BUCKET,
            table = process.env.CACHE_TABLE
        } = body;

        // Query the subgraph
        const query = resolver ? `
            query DomainsByResolver($resolver: String!, $first: Int!, $skip: Int!) {
              domains(where: {resolver: $resolver}, first: $first, skip: $skip) {
                name
                id
                createdAt
                resolver {
                  id
                  addr {
                    id
                  }
                  texts
                }
                owner {
                  id
                }
              }
            }` : resolverQuery;

        const variables = resolver ? { resolver, first, skip } : { first, skip };

        const response = await fetch(subgraphParam.Parameter.Value, {
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
            throw new Error(`Subgraph query failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`Subgraph errors: ${JSON.stringify(data.errors)}`);
        }

        const domains = data.data.domains;

        // Process and store results
        const results = domains.map(domain => ({
            name: domain.name,
            id: domain.id,
            createdAt: domain.createdAt,
            resolver: domain.resolver?.id,
            owner: domain.owner?.id,
            texts: domain.resolver?.texts || [],
            addr: domain.resolver?.addr?.id,
            timestamp: new Date().toISOString()
        }));

        // Store in DynamoDB cache
        if (table) {
            for (const result of results) {
                if (result.resolver && result.name) {
                    await dynamodb.put({
                        TableName: table,
                        Item: {
                            resolverAddress: result.resolver,
                            domainName: result.name,
                            result,
                            ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                        }
                    }).promise();
                }
            }
        }

        // Store results in S3
        if (bucket) {
            const key = `lookup-results/${resolver || 'all'}/${Date.now()}.json`;
            await s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify({
                    query: variables,
                    results,
                    count: results.length,
                    timestamp: new Date().toISOString()
                }, null, 2),
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
                count: results.length,
                query: variables
            })
        };

    } catch (error) {
        console.error('Error in lookup resolver names:', error);
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


