#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { JakeSelbyStack } from '../lib/jakeselby-stack.js';

const app = new cdk.App();

new JakeSelbyStack(app, 'JakeSelby', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '401527674489',
    region: 'us-east-1',
  },
  description: 'jakeselby.com personal landing site — S3 + CloudFront + ACM + Route53',
  tags: {
    Project: 'jakeselby-com',
    ManagedBy: 'cdk',
  },
});
