output "bucket_name" {
  description = "S3 bucket to upload the built site to."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "CloudFront distribution to invalidate after each upload."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "CloudFront hostname. Point the domain here if DNS is not managed by this configuration."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "certificate_validation_records" {
  description = "DNS records that prove domain ownership to ACM. Create these yourself when route53_zone_name is null."
  value       = local.certificate_validation_records
}

output "site_url" {
  value = "https://${var.domain_name}"
}
