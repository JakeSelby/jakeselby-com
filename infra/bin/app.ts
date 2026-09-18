#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { JakeSelbyStack } from '../lib/jakeselby-stack.js';
import { readInfraConfig } from '../lib/config.js';

const envFile = fileURLToPath(new URL('../../.env.infra', import.meta.url));
if (existsSync(envFile)) loadEnvFile(envFile);
const config = readInfraConfig(process.env);

const app = new cdk.App();

new JakeSelbyStack(app, 'JakeSelby', {
  config,
  env: {
    account: config.accountId,
    region: 'us-east-1',
  },
  description: 'jakeselby.com personal landing site — S3 + CloudFront + ACM + Route53',
  tags: {
    Project: 'jakeselby-com',
    ManagedBy: 'cdk',
  },
});
