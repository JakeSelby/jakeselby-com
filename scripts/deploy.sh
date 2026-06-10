#!/usr/bin/env bash
# Deploy jakeselby.com to AWS
# Usage: ./scripts/deploy.sh
# Prerequisites: AWS_PROFILE=your-profile set in env (or set here)
set -euo pipefail

export AWS_PROFILE="${AWS_PROFILE:-default}"
export AWS_REGION="us-east-1"

echo "▶ AWS identity check..."
aws sts get-caller-identity --query 'Account' --output text

echo "▶ Building Astro site..."
npm run build

echo "▶ Deploying CDK stack..."
cd infra && npx cdk deploy --require-approval never && cd ..

# Capture outputs
BUCKET=$(cd infra && npx cdk output --stack JakeSelby BucketName --no-staging 2>/dev/null | tr -d '[:space:]' || echo "example-site-web")
DIST_ID=$(cd infra && npx cdk output --stack JakeSelby DistributionId --no-staging 2>/dev/null | tr -d '[:space:]' || echo "")

echo "▶ Syncing static assets to s3://${BUCKET}..."
aws s3 sync dist/ "s3://${BUCKET}" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "_astro/*"

# Long-cache for hashed assets
aws s3 sync dist/_astro/ "s3://${BUCKET}/_astro/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

if [ -n "${DIST_ID}" ]; then
  echo "▶ Invalidating CloudFront cache (${DIST_ID})..."
  aws cloudfront create-invalidation \
    --distribution-id "${DIST_ID}" \
    --paths "/*"
fi

echo "✓ Deploy complete → https://jakeselby.com"
