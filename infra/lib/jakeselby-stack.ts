import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
 * jakeselby.com personal landing site
 *
 * Infrastructure:
 *   - ACM cert (jakeselby.com + www.jakeselby.com) — DNS-validated via Route53
 *   - Private S3 bucket (OAC) — hosts Astro static build output
 *   - CloudFront distribution — HTTPS-only, custom domain, index.html rewriting
 *   - Route53 A records — apex + www → CloudFront
 *
 * Prerequisites:
 *   - Hosted zone jakeselby.com (Z0546426Z22AIAM1PV63) already exists in Route53
 *   - AWS_PROFILE=cortex, AWS_REGION=us-east-1
 */
export class JakeSelbyStack extends cdk.Stack {
  /** S3 bucket name — used by the deploy script to sync dist/ */
  readonly bucketName: string;
  /** CloudFront distribution ID — used by the deploy script for cache invalidation */
  readonly distributionId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── Hosted Zone (import existing) ─────────────────────────────────────────
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: 'Z0546426Z22AIAM1PV63',
        zoneName: 'jakeselby.com',
      },
    );

    // ── ACM Certificate ───────────────────────────────────────────────────────
    // Must be in us-east-1 for CloudFront. Covers apex + www.
    // CDK creates the DNS CNAME validation records in Route53 automatically.
    const cert = new acm.Certificate(this, 'Cert', {
      domainName: 'jakeselby.com',
      subjectAlternativeNames: ['www.jakeselby.com'],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // ── S3 Bucket ─────────────────────────────────────────────────────────────
    // Versioned so a bad `s3 sync --delete` is recoverable; old versions expire after 30 days.
    const bucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: 'jakeselby-com-web',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [{ noncurrentVersionExpiration: cdk.Duration.days(30) }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    this.bucketName = bucket.bucketName;

    // ── CloudFront Function — SPA/directory routing ────────────────────────────
    // Astro outputs resume/index.html, projects/index.html.
    // Without this function, /resume → 403 from S3 (file key "resume" doesn't exist).
    // This rewrites clean paths to their index.html equivalents.
    const routingFunction = new cloudfront.Function(this, 'RoutingFunction', {
      functionName: 'jakeselby-com-routing',
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}
      `.trim()),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // ── CloudFront Distribution ───────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      domainNames: ['jakeselby.com', 'www.jakeselby.com'],
      certificate: cert,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        functionAssociations: [
          {
            function: routingFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // Static assets — long cache
      additionalBehaviors: {
        '_astro/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'AssetsCachePolicy', {
            defaultTtl: cdk.Duration.days(365),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.days(365),
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
          }),
          compress: true,
        },
      },
      errorResponses: [
        {
          // S3 OAC returns 403 for missing keys — treat as 404
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    this.distributionId = distribution.distributionId;

    // ── Route53 Records ───────────────────────────────────────────────────────
    // Apex A record (ALIAS → CloudFront)
    new route53.ARecord(this, 'ApexRecord', {
      zone: hostedZone,
      recordName: 'jakeselby.com',
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
      comment: 'jakeselby.com → CloudFront',
    });

    // www A record (ALIAS → same CloudFront distribution)
    new route53.ARecord(this, 'WwwRecord', {
      zone: hostedZone,
      recordName: 'www.jakeselby.com',
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
      comment: 'www.jakeselby.com → CloudFront',
    });

    // ── Outputs ───────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket — deploy: aws s3 sync dist/ s3://<bucket>',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID — used for cache invalidation',
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
      description: 'CloudFront domain for smoke-testing before DNS propagates',
    });

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: 'https://jakeselby.com',
    });
  }
}
