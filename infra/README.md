# PokéRanked infrastructure

Terraform for hosting the static site on S3 behind CloudFront at `pokeranked.com`.

## What it creates

- **S3 bucket** (private, encrypted) holding the files from `out/`. Only the CloudFront distribution can read it, through Origin Access Control.
- **CloudFront distribution** for `pokeranked.com` and `www.pokeranked.com`, with HTTPS only, HTTP/2 and HTTP/3, AWS's managed caching and security-header policies, and `404.html` for missing pages.
- **CloudFront function** (`functions/viewer-request.js`) that serves clean URLs (`/games/hgss` → `/games/hgss.html`) and redirects `www.` to the apex domain.
- **ACM certificate** in `us-east-1` for both names, validated by DNS.
- **Route 53 records** for certificate validation and the site, only when `route53_zone_name` is set.

## First deploy

Needs Terraform 1.6+, the AWS CLI and credentials for the target account.

**If the domain's DNS is in Route 53:**

```sh
cd infra
terraform init
terraform apply -var 'route53_zone_name=pokeranked.com'
```

**If DNS is managed elsewhere:** create the certificate first, add its validation records at your DNS provider, then apply the rest.

```sh
cd infra
terraform init
terraform apply -target=aws_acm_certificate.site
terraform output certificate_validation_records
terraform apply
```

The last `apply` waits until ACM sees the records. Afterwards, point `pokeranked.com` and `www.pokeranked.com` at `distribution_domain_name` (ALIAS/ANAME for the apex, CNAME for `www`).

## Publishing the site

From the repo root:

```sh
npm run deploy
```

This builds the static export, uploads `_next/static` with a one-year immutable cache and everything else with `must-revalidate`, removes files that no longer exist, and invalidates the CloudFront cache.

## State

State is stored locally in `infra/terraform.tfstate`, which is git-ignored. Keep it safe, or add an S3 backend before more than one person deploys.
