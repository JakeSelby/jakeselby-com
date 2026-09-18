import assert from 'node:assert/strict';
import test from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { readInfraConfig } from './config.js';
import { JakeSelbyStack } from './jakeselby-stack.js';

const env = {
  SITE_AWS_ACCOUNT_ID: '123456789012',
  SITE_HOSTED_ZONE_ID: 'Z123EXAMPLE',
  SITE_BUCKET_NAME: 'example-personal-site',
  SITE_ROUTING_FUNCTION_NAME: 'example-site-routing',
};

test('requires each deployment identifier without disclosing invalid values', () => {
  for (const key of Object.keys(env)) {
    assert.throws(() => readInfraConfig({ ...env, [key]: '' }), new RegExp(key));
    assert.throws(
      () => readInfraConfig({ ...env, [key]: 'invalid value!' }),
      (error: Error) => error.message.includes(key) && !error.message.includes('invalid value!'),
    );
  }
});

test('accepts configured values and rejects a different credential account', () => {
  const config = readInfraConfig({ ...env, SITE_BUCKET_NAME: ` ${env.SITE_BUCKET_NAME} ` });
  assert.equal(config.bucketName, env.SITE_BUCKET_NAME);
  assert.equal(readInfraConfig({ ...env, CDK_DEFAULT_ACCOUNT: env.SITE_AWS_ACCOUNT_ID }).accountId, env.SITE_AWS_ACCOUNT_ID);
  assert.throws(() => readInfraConfig({ ...env, CDK_DEFAULT_ACCOUNT: '999999999999' }), /credentials do not match/);
});

test('synthesis uses the supplied resource IDs and preserves private origin access', () => {
  const app = new cdk.App();
  const config = readInfraConfig(env);
  const stack = new JakeSelbyStack(app, 'JakeSelby', {
    config,
    env: { account: config.accountId, region: 'us-east-1' },
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: env.SITE_BUCKET_NAME,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
  template.hasResourceProperties('AWS::CloudFront::Function', { Name: env.SITE_ROUTING_FUNCTION_NAME });
  template.hasResourceProperties('AWS::Route53::RecordSet', { HostedZoneId: env.SITE_HOSTED_ZONE_ID });
  template.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainValidationOptions: [
      { DomainName: 'jakeselby.com', HostedZoneId: env.SITE_HOSTED_ZONE_ID },
      { DomainName: 'www.jakeselby.com', HostedZoneId: env.SITE_HOSTED_ZONE_ID },
    ],
  });
  const controls = Object.values(template.findResources('AWS::CloudFront::OriginAccessControl'));
  assert.ok(controls.length > 0);
  for (const control of controls) {
    assert.equal(control.Properties.OriginAccessControlConfig.SigningBehavior, 'always');
    assert.equal(control.Properties.OriginAccessControlConfig.SigningProtocol, 'sigv4');
  }
});
