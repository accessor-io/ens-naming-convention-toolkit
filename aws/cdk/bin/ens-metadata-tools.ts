#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnsMetadataToolsStack } from '../lib/ens-metadata-tools-stack';

const app = new cdk.App();
new EnsMetadataToolsStack(app, 'EnsMetadataToolsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
});


