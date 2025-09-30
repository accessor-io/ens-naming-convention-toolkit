#!/bin/bash

# ENS Metadata Tools AWS Deployment Script
set -e

echo "Deploying ENS Metadata Tools to AWS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
STACK_NAME="ens-metadata-tools-${ACCOUNT_ID}"

echo "Deploying to account: $ACCOUNT_ID in region: $REGION"

# Install CDK dependencies
echo "Installing CDK dependencies..."
cd aws/cdk
npm install

# Bootstrap CDK (if not already done)
echo "Bootstrapping CDK..."
npx cdk bootstrap --qualifier ens-tools 2>/dev/null || echo "CDK already bootstrapped"

# Deploy the stack
echo "Deploying CDK stack..."
npx cdk deploy --require-approval never

# Get the API Gateway URL
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)

echo ""
echo "Deployment completed successfully!"
echo ""
echo "Resources created:"
echo "   • API Gateway URL: $API_URL"
echo "   • Stack Name: $STACK_NAME"
echo ""
echo "Test the deployment:"
echo "   # Get API Key value:"
echo "   API_KEY_ID=\$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==\`ApiKey\`].OutputValue' --output text)"
echo "   API_KEY_VALUE=\$(aws apigateway get-api-key --api-key \$API_KEY_ID --include-value --query 'value' --output text)"
echo ""
echo "   # Test with authentication:"
echo "   curl -X POST $API_URL/metadata \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Authorization: Bearer your-token' \\"
echo "     -H 'x-api-key: \$API_KEY_VALUE' \\"
echo "     -d '{\"category\": \"defi\", \"type\": \"amm\", \"name\": \"Uniswap\"}'"
echo ""
echo "API Endpoints:"
echo "   • POST $API_URL/metadata - Generate metadata"
echo "   • POST $API_URL/probe - Probe ENS resolvers"
echo "   • POST $API_URL/lookup - Lookup resolver names"
echo "   • POST $API_URL/security - Analyze domain security"
