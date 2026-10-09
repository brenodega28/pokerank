#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

bucket="${SITE_BUCKET:-$(terraform -chdir=infra output -raw bucket_name)}"
distribution="${DISTRIBUTION_ID:-$(terraform -chdir=infra output -raw distribution_id)}"

npm run build

aws s3 sync out/_next/static "s3://$bucket/_next/static" \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

aws s3 sync out "s3://$bucket" \
  --delete \
  --exclude "_next/static/*" \
  --cache-control "public,max-age=0,must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "$distribution" \
  --paths "/*" \
  --query "Invalidation.Id" \
  --output text
