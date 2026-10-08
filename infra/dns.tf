resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = var.redirect_www ? [local.www_domain] : []
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  certificate_validation_records = {
    for option in aws_acm_certificate.site.domain_validation_options : option.domain_name => {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  }
}

data "aws_route53_zone" "site" {
  count        = local.manage_dns ? 1 : 0
  name         = var.route53_zone_name
  private_zone = false
}

resource "aws_route53_record" "certificate_validation" {
  for_each        = local.manage_dns ? local.certificate_validation_records : {}
  zone_id         = data.aws_route53_zone.site[0].zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.value]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = local.manage_dns ? [for record in aws_route53_record.certificate_validation : record.fqdn] : null
}

resource "aws_route53_record" "site" {
  for_each = local.manage_dns ? {
    for pair in setproduct(local.site_domains, ["A", "AAAA"]) : "${pair[0]}-${pair[1]}" => { name = pair[0], type = pair[1] }
  } : {}

  zone_id = data.aws_route53_zone.site[0].zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
