import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class EnsMetadataToolsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for metadata storage
    const metadataBucket = new s3.Bucket(this, 'MetadataBucket', {
      bucketName: `ens-metadata-tools-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // DynamoDB table for resolver cache
    const resolverCacheTable = new dynamodb.Table(this, 'ResolverCacheTable', {
      tableName: 'ens-resolver-cache',
      partitionKey: {
        name: 'resolverAddress',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'domainName',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for domain lookups
    resolverCacheTable.addGlobalSecondaryIndex({
      indexName: 'domain-index',
      partitionKey: {
        name: 'domainName',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'resolverAddress',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // DynamoDB table for metadata storage
    const metadataTable = new dynamodb.Table(this, 'MetadataTable', {
      tableName: 'ens-metadata',
      partitionKey: {
        name: 'category',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'name',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda Layer for shared dependencies
    const ethersLayer = new lambda.LayerVersion(this, 'EthersLayer', {
      code: lambda.Code.fromAsset('../layers/ethers'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.NODEJS_20_X],
      description: 'Shared ethers.js and web3 dependencies',
    });

    // CloudWatch Log Group for Lambda functions
    const logGroup = new logs.LogGroup(this, 'EnsMetadataLogGroup', {
      logGroupName: '/aws/lambda/ens-metadata-tools',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, 'EnsMetadataLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add permissions for DynamoDB and S3
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [resolverCacheTable.tableArn, metadataTable.tableArn],
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:ListBucket',
      ],
      resources: [metadataBucket.bucketArn, `${metadataBucket.bucketArn}/*`],
    }));

    // Lambda functions for each CLI tool
    const metadataGeneratorFunction = new lambda.Function(this, 'MetadataGeneratorFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda/metadata-generator'),
      handler: 'index.handler',
      role: lambdaRole,
      layers: [ethersLayer],
      environment: {
        METADATA_BUCKET: metadataBucket.bucketName,
        METADATA_TABLE: metadataTable.tableName,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      logGroup: logGroup,
    });

    const probeMulticallFunction = new lambda.Function(this, 'ProbeMulticallFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda/probe-multicall'),
      handler: 'index.handler',
      role: lambdaRole,
      layers: [ethersLayer],
      environment: {
        CACHE_TABLE: resolverCacheTable.tableName,
        METADATA_BUCKET: metadataBucket.bucketName,
      },
      timeout: cdk.Duration.minutes(10),
      memorySize: 1024,
      logGroup: logGroup,
    });

    const lookupResolverNamesFunction = new lambda.Function(this, 'LookupResolverNamesFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda/lookup-resolver-names'),
      handler: 'index.handler',
      role: lambdaRole,
      layers: [ethersLayer],
      environment: {
        CACHE_TABLE: resolverCacheTable.tableName,
        METADATA_BUCKET: metadataBucket.bucketName,
      },
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      logGroup: logGroup,
    });

    const securityAnalyzerFunction = new lambda.Function(this, 'SecurityAnalyzerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda/security-analyzer'),
      handler: 'index.handler',
      role: lambdaRole,
      layers: [ethersLayer],
      environment: {
        METADATA_TABLE: metadataTable.tableName,
        METADATA_BUCKET: metadataBucket.bucketName,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      logGroup: logGroup,
    });

    // API Gateway (transformed from SAM template)
    const api = new apigateway.RestApi(this, 'EnsMetadataApi', {
      restApiName: `ens-metadata-tools-api From Stack ${cdk.Aws.STACK_NAME}`,
      description: 'API for ENS Metadata Tools',
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
      deployOptions: {
        stageName: 'Prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
      },
    });

    // API Gateway Account for CloudWatch logging
    const apiAccount = new apigateway.CfnAccount(this, 'ApiAccount', {
      cloudWatchRoleArn: lambdaRole.roleArn, // Reuse existing Lambda role
    });

    // API Key for authentication
    const apiKey = new apigateway.CfnApiKey(this, 'ApiKey', {
      name: 'ens-metadata-api-key',
      description: 'API Key for ENS Metadata Tools',
      enabled: true,
    });

    // Lambda Authorizer Function
    const authorizerFunction = new lambda.Function(this, 'ApiAuthorizerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('Authorizer invoked:', JSON.stringify(event, null, 2));

          // Simple API key validation (in production, implement proper JWT/OAuth validation)
          const token = event.authorizationToken;
          if (!token || !token.startsWith('Bearer ')) {
            throw new Error('Unauthorized');
          }

          // For demo purposes, accept any Bearer token
          // In production, validate JWT tokens, API keys, etc.
          return {
            principalId: 'user',
            policyDocument: {
              Version: '2012-10-17',
              Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: event.methodArn
              }]
            }
          };
        };
      `),
      handler: 'index.handler',
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
    });

    // Lambda Authorizer
    const authorizer = new apigateway.CfnAuthorizer(this, 'Authorizer', {
      type: 'TOKEN',
      restApiId: api.restApiId,
      name: 'ens-metadata-authorizer',
      authorizerUri: `arn:aws:apigateway:${cdk.Aws.REGION}:lambda:path/2015-03-31/functions/${authorizerFunction.functionArn}/invocations`,
      authorizerCredentials: lambdaRole.roleArn,
      identitySource: 'method.request.header.Authorization',
      identityValidationExpression: '^Bearer [-0-9A-Za-z\\.]+$',
    });

    // Add usage plan with API key
    const usagePlan = new apigateway.CfnUsagePlan(this, 'UsagePlan', {
      name: 'ens-metadata-usage-plan',
      description: 'Usage plan for ENS Metadata Tools API',
      apiStages: [{
        apiId: api.restApiId,
        stage: 'Prod',
      }],
      throttle: {
        burstLimit: 100,
        rateLimit: 50,
      },
      quota: {
        limit: 10000,
        offset: 0,
        period: 'MONTH',
      },
    });

    // Associate API key with usage plan
    const apiKeyUsagePlan = new apigateway.CfnUsagePlanKey(this, 'ApiKeyUsagePlan', {
      keyId: apiKey.ref,
      keyType: 'API_KEY',
      usagePlanId: usagePlan.ref,
    });

    // Enable CORS
    const corsOptions = {
      allowCredentials: true,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
    };

    // API Routes with authentication and API key requirements
    const metadataResource = api.root.addResource('metadata');
    metadataResource.addMethod('POST', new apigateway.LambdaIntegration(metadataGeneratorFunction), {
      methodResponses: [{ statusCode: '200' }],
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: { authorizerId: authorizer.ref },
      apiKeyRequired: true,
    });
    metadataResource.addCorsPreflight(corsOptions);

    const probeResource = api.root.addResource('probe');
    probeResource.addMethod('POST', new apigateway.LambdaIntegration(probeMulticallFunction), {
      methodResponses: [{ statusCode: '200' }],
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: { authorizerId: authorizer.ref },
      apiKeyRequired: true,
    });
    probeResource.addCorsPreflight(corsOptions);

    const lookupResource = api.root.addResource('lookup');
    lookupResource.addMethod('POST', new apigateway.LambdaIntegration(lookupResolverNamesFunction), {
      methodResponses: [{ statusCode: '200' }],
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: { authorizerId: authorizer.ref },
      apiKeyRequired: true,
    });
    lookupResource.addCorsPreflight(corsOptions);

    const securityResource = api.root.addResource('security');
    securityResource.addMethod('POST', new apigateway.LambdaIntegration(securityAnalyzerFunction), {
      methodResponses: [{ statusCode: '200' }],
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: { authorizerId: authorizer.ref },
      apiKeyRequired: true,
    });
    securityResource.addCorsPreflight(corsOptions);

    // Parameter Store for configuration
    const rpcUrlParam = new ssm.StringParameter(this, 'RpcUrlParameter', {
      parameterName: '/ens-metadata-tools/rpc-url',
      stringValue: 'https://eth-mainnet.alchemyapi.io/v2/demo', // Default value
      description: 'Ethereum RPC URL for the application',
    });

    const subgraphUrlParam = new ssm.StringParameter(this, 'SubgraphUrlParameter', {
      parameterName: '/ens-metadata-tools/subgraph-url',
      stringValue: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      description: 'ENS subgraph URL',
    });

    // Outputs
    new cdk.CfnOutput(this, 'MetadataBucketName', {
      value: metadataBucket.bucketName,
      description: 'S3 bucket for metadata storage',
    });

    new cdk.CfnOutput(this, 'ResolverCacheTableName', {
      value: resolverCacheTable.tableName,
      description: 'DynamoDB table for resolver cache',
    });

    new cdk.CfnOutput(this, 'MetadataTableName', {
      value: metadataTable.tableName,
      description: 'DynamoDB table for metadata',
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL for the application',
    });

    new cdk.CfnOutput(this, 'MetadataGeneratorFunctionName', {
      value: metadataGeneratorFunction.functionName,
      description: 'Lambda function for metadata generation',
    });

    new cdk.CfnOutput(this, 'ApiKey', {
      value: apiKey.ref,
      description: 'API Key ID for authentication',
    });

    new cdk.CfnOutput(this, 'ApiKeyValue', {
      value: apiKey.attrApiKeyId,
      description: 'API Key value (retrieve with: aws apigateway get-api-key --api-key <key-id> --include-value)',
    });

    new cdk.CfnOutput(this, 'UsagePlanId', {
      value: usagePlan.ref,
      description: 'Usage Plan ID for rate limiting',
    });
  }
}
