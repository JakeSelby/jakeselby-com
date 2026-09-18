#!/usr/bin/env bash
# Deploy jakeselby.com to AWS
# Usage: ./scripts/deploy.sh
# Prerequisites: deployment configuration from .env.infra (see README).
#
# Guards, in order: the tree must be committed (production never depends on uncommitted
# edits again), the branch must be main, the build must succeed, and the artifact must be a
# complete site before anything touches the bucket. `s3 sync --delete` runs only after all
# four hold. Override with ALLOW_DIRTY=1 or ALLOW_BRANCH=1 when you mean it.
set -euo pipefail

cd "$(dirname "$0")/.."

# This is a trusted, ignored local file, separate from Astro's public build config.
if [ -f .env.infra ]; then
  set -a
  source .env.infra
  set +a
fi
export AWS_REGION="us-east-1"
: "${SITE_AWS_ACCOUNT_ID:?Set SITE_AWS_ACCOUNT_ID in .env.infra or the environment}"
: "${SITE_HOSTED_ZONE_ID:?Set SITE_HOSTED_ZONE_ID in .env.infra or the environment}"
: "${SITE_BUCKET_NAME:?Set SITE_BUCKET_NAME in .env.infra or the environment}"
: "${SITE_ROUTING_FUNCTION_NAME:?Set SITE_ROUTING_FUNCTION_NAME in .env.infra or the environment}"

echo "▶ Tree check..."
if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY:-0}" != "1" ]; then
  echo "✗ Uncommitted changes present. Commit them (CI must build main), or ALLOW_DIRTY=1." >&2
  git status --short >&2
  exit 1
fi
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "${ALLOW_BRANCH:-0}" != "1" ]; then
  echo "✗ On branch '$BRANCH', not main. Merge first, or ALLOW_BRANCH=1." >&2
  exit 1
fi

echo "▶ AWS identity check..."
ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)
if [ "$ACCOUNT" != "$SITE_AWS_ACCOUNT_ID" ]; then
  echo "✗ AWS credentials do not match SITE_AWS_ACCOUNT_ID." >&2
  exit 1
fi

echo "▶ Building Astro site..."
rm -rf dist
npm run build

echo "▶ Artifact check..."
for f in dist/index.html dist/projects/index.html dist/resume/index.html; do
  [ -f "$f" ] || { echo "✗ Missing $f — refusing to sync a broken build." >&2; exit 1; }
done
PAGES=$(find dist -name index.html | wc -l | tr -d ' ')
[ "$PAGES" -ge 3 ] || { echo "✗ Only $PAGES pages built — refusing to sync." >&2; exit 1; }
echo "  $PAGES pages, artifact complete"

echo "▶ Deploying CDK stack..."
(cd infra && npx cdk deploy --require-approval never)

# Read the deployed stack instead of relying on machine-specific identifiers or guesses.
BUCKET=$(aws cloudformation describe-stacks --stack-name JakeSelby \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue | [0]" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name JakeSelby \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue | [0]" --output text)
if [ "$BUCKET" != "$SITE_BUCKET_NAME" ] || [[ ! "$DIST_ID" =~ ^E[A-Z0-9]+$ ]]; then
  echo "✗ Missing or unexpected stack outputs; refusing to sync." >&2
  exit 1
fi

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
    --paths "/*" \
    --query 'Invalidation.Id' --output text
else
  echo "! No distribution id found; skipped invalidation. Run it by hand." >&2
fi

echo "✓ Deploy complete → https://jakeselby.com"
