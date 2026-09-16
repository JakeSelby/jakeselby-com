#!/usr/bin/env bash
# Deploy jakeselby.com to AWS
# Usage: ./scripts/deploy.sh
# Prerequisites: AWS_PROFILE=your-profile set in env (or set here)
#
# Guards, in order: the tree must be committed (production never depends on uncommitted
# edits again), the branch must be main, the build must succeed, and the artifact must be a
# complete site before anything touches the bucket. `s3 sync --delete` runs only after all
# four hold. Override with ALLOW_DIRTY=1 or ALLOW_BRANCH=1 when you mean it.
set -euo pipefail

export AWS_PROFILE="${AWS_PROFILE:-default}"
export AWS_REGION="us-east-1"

cd "$(dirname "$0")/.."

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
aws sts get-caller-identity --query 'Account' --output text

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

# Capture outputs; fall back to the known bucket name and an alias lookup for the distribution.
BUCKET=$(cd infra && npx cdk output --stack JakeSelby BucketName --no-staging 2>/dev/null | tr -d '[:space:]' || true)
BUCKET="${BUCKET:-example-site-web}"
DIST_ID=$(cd infra && npx cdk output --stack JakeSelby DistributionId --no-staging 2>/dev/null | tr -d '[:space:]' || true)
if [ -z "${DIST_ID}" ]; then
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, 'jakeselby.com')].Id | [0]" \
    --output text 2>/dev/null || true)
  [ "$DIST_ID" = "None" ] && DIST_ID=""
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
