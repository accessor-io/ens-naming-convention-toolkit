const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Import the metadata generator logic
// Note: In a real deployment, this would be bundled with the Lambda
const { generateMetadata, METADATA_TEMPLATES } = require('./metadata-generator.js');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Metadata Generator Lambda invoked with event:', JSON.stringify(event, null, 2));

    try {
        const body = JSON.parse(event.body || '{}');
        const {
            category,
            type,
            output,
            bucket = process.env.METADATA_BUCKET,
            table = process.env.METADATA_TABLE,
            ...options
        } = body;

        if (!category || !type) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                body: JSON.stringify({
                    error: 'Missing required parameters: category and type are required'
                })
            };
        }

        // Generate metadata using the existing logic
        const metadata = generateMetadata(category, type, options);

        // Store in DynamoDB
        if (table) {
            const dbItem = {
                category,
                name: `${type}-${options.name || options.protocol || 'default'}`,
                type,
                metadata,
                createdAt: new Date().toISOString(),
                version: options.version || '1.0.0'
            };

            await dynamodb.put({
                TableName: table,
                Item: dbItem
            }).promise();
        }

        // Store in S3 if bucket specified
        if (bucket && output) {
            const key = output.startsWith('/') ? output.substring(1) : output;
            await s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(metadata, null, 2),
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
                metadata,
                stored: {
                    dynamodb: !!table,
                    s3: !!(bucket && output)
                }
            })
        };

    } catch (error) {
        console.error('Error in metadata generator:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            })
        };
    }
};

