# AWS Configuration for ENS Metadata Tools

This directory contains the complete AWS infrastructure configuration for deploying the ENS Metadata Tools application to AWS using Infrastructure as Code (IaC) with AWS CDK and CloudFormation.

## Architecture Overview

The application is deployed as a serverless architecture using:

- **AWS Lambda**: Serverless functions for each CLI tool
- **Amazon API Gateway**: REST API endpoints
- **Amazon S3**: Storage for metadata files and artifacts
- **Amazon DynamoDB**: NoSQL database for caching and metadata storage
- **AWS Systems Manager Parameter Store**: Configuration management
- **AWS CloudWatch**: Monitoring and logging
- **AWS CodePipeline**: CI/CD pipeline

## Directory Structure

```
aws/
├── cdk/                          # AWS CDK infrastructure
│   ├── bin/ens-metadata-tools.ts # CDK app entry point
│   ├── lib/ens-metadata-tools-stack.ts # Main stack definition
│   ├── package.json             # CDK dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   └── cdk.json               # CDK configuration
├── cloudformation/             # CloudFormation templates
│   └── cicd-pipeline.yaml     # CI/CD pipeline template
├── lambda/                     # Lambda function code
│   ├── metadata-generator/     # Metadata generation Lambda
│   ├── probe-multicall/        # Resolver probing Lambda
│   ├── lookup-resolver-names/  # Name lookup Lambda
│   └── security-analyzer/      # Security analysis Lambda
├── layers/                     # Lambda layers
│   └── ethers/                # Shared ethers.js dependencies
└── scripts/                    # Deployment scripts
    └── deploy.sh              # Main deployment script
```

## Quick Start Deployment

### Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js 18+** installed
3. **AWS CDK CLI** installed (`npm install -g aws-cdk`)
4. **GitHub OAuth token** (for CI/CD pipeline)

### Deploy to AWS

```bash
# Make sure you're in the project root
cd /path/to/ens-metadata-tools

# Run the deployment script
./aws/scripts/deploy.sh
```

The script will:
1. Install CDK dependencies
2. Bootstrap CDK (if needed)
3. Deploy the infrastructure
4. Display API endpoints

## Manual Deployment

### 1. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and default region
```

### 2. Install Dependencies

```bash
cd aws/cdk
npm install
```

### 3. Bootstrap CDK (first time only)

```bash
npx cdk bootstrap
```

### 4. Deploy the Stack

```bash
npx cdk deploy
```

## API Endpoints

After deployment, the following REST API endpoints will be available:

### Generate Metadata
```bash
POST /metadata
Content-Type: application/json

{
  "category": "defi",
  "type": "amm",
  "name": "Uniswap",
  "version": "3.0.0"
}
```

### Probe ENS Resolvers
```bash
POST /probe
Content-Type: application/json

{
  "domain": "uniswap.eth",
  "address": "0x123..."  // optional: probe specific resolver
}
```

### Lookup Resolver Names
```bash
POST /lookup
Content-Type: application/json

{
  "resolver": "0x123...",  // optional: filter by resolver
  "first": 100,
  "skip": 0
}
```

### Security Analysis
```bash
POST /security
Content-Type: application/json

{
  "domain": "example.eth"
}
```

## Configuration

### Environment Variables

The application uses AWS Systems Manager Parameter Store for configuration:

- `/ens-metadata-tools/rpc-url`: Ethereum RPC endpoint URL
- `/ens-metadata-tools/subgraph-url`: ENS subgraph URL

### Updating Configuration

```bash
# Update RPC URL
aws ssm put-parameter \
  --name "/ens-metadata-tools/rpc-url" \
  --value "https://your-rpc-endpoint.com" \
  --type "String"

# Update subgraph URL
aws ssm put-parameter \
  --name "/ens-metadata-tools/subgraph-url" \
  --value "https://your-subgraph-endpoint.com" \
  --type "String"
```

## Monitoring

### CloudWatch Logs

All Lambda functions log to CloudWatch. View logs:

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/ens-metadata-tools"

# View recent logs
aws logs tail "/aws/lambda/ens-metadata-tools" --follow
```

### CloudWatch Metrics

Monitor Lambda function metrics:
- Invocation count
- Duration
- Error count
- Throttles

## CI/CD Pipeline

Deploy the CI/CD pipeline using CloudFormation:

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/cicd-pipeline.yaml \
  --stack-name ens-metadata-tools-cicd \
  --parameter-overrides \
    GitHubOwner=your-github-username \
    GitHubRepo=metadata-tools \
    GitHubBranch=main \
    GitHubToken=your-github-token \
  --capabilities CAPABILITY_IAM
```

## Cost Optimization

### DynamoDB
- Uses on-demand pricing (pay per request)
- TTL is configured for cache entries (24 hours)

### Lambda
- Functions have appropriate memory allocation and timeouts
- Use provisioned concurrency for high-traffic functions if needed

### S3
- Versioning enabled for artifacts
- Lifecycle policies can be added for cost optimization

## Security Considerations

### IAM Permissions
- Lambda functions have least-privilege IAM roles
- API Gateway has CORS configured appropriately

### Data Protection
- S3 buckets have encryption enabled
- DynamoDB has encryption at rest
- Sensitive configuration stored in Parameter Store

### Network Security
- API Gateway can be configured with API keys
- VPC deployment option available in CDK stack

## Testing

### Local Testing

Test Lambda functions locally using SAM CLI:

```bash
# Install SAM CLI
pip install aws-sam-cli

# Test a function
sam local invoke MetadataGeneratorFunction -e event.json
```

### Integration Testing

Use the deployed API endpoints:

```bash
# Test metadata generation
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/prod/metadata \
  -H 'Content-Type: application/json' \
  -d '{"category": "defi", "type": "amm", "name": "Test"}'
```

## Development

### Adding New Lambda Functions

1. Create function directory in `aws/lambda/`
2. Add function code and `package.json`
3. Update CDK stack in `lib/ens-metadata-tools-stack.ts`
4. Add API Gateway route

### Modifying Infrastructure

1. Edit `lib/ens-metadata-tools-stack.ts`
2. Run `cdk synth` to generate CloudFormation template
3. Run `cdk deploy` to apply changes

## Troubleshooting

### Common Issues

1. **CDK bootstrap error**: Run `cdk bootstrap` first
2. **Permission denied**: Ensure AWS CLI is configured with appropriate permissions
3. **Lambda timeout**: Increase timeout in CDK stack for long-running operations
4. **API Gateway CORS errors**: Check CORS configuration in stack

### Logs and Debugging

```bash
# Check CloudFormation stack status
aws cloudformation describe-stack-events --stack-name ens-metadata-tools

# View Lambda function logs
aws logs filter-log-events --log-group-name "/aws/lambda/ens-metadata-tools"
```

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [ENS Documentation](https://docs.ens.domains/)

## Contributing

When making changes to the AWS infrastructure:

1. Update the CDK stack code
2. Test locally with `cdk synth`
3. Run `cdk deploy` to test in AWS
4. Update this README if needed

## License

This AWS configuration is part of the ENS Metadata Tools project and follows the same MIT license.
