variable "aws_region" {
  description = "Region for the S3 bucket. CloudFront and its certificate are global and live in us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Apex domain the site is served from."
  type        = string
  default     = "pokeranked.com"
}

variable "redirect_www" {
  description = "Also serve www.<domain_name> and redirect it to the apex domain."
  type        = bool
  default     = true
}

variable "route53_zone_name" {
  description = "Name of an existing Route 53 hosted zone for the domain. Leave null to manage DNS elsewhere; the certificate validation records are then printed as an output."
  type        = string
  default     = null
}

variable "bucket_name" {
  description = "S3 bucket for the built site. Defaults to <domain_name>-site."
  type        = string
  default     = null
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "github_repository" {
  description = "GitHub repository (owner/name) allowed to deploy through the OIDC role."
  type        = string
  default     = "brenodega28/pokerank"
}

variable "github_oidc_subject_prefix" {
  description = "Repository part of the GitHub OIDC subject claim. This repo uses immutable subjects (owner and repo IDs), shown by GET /repos/{owner}/{repo}/actions/oidc/customization/sub."
  type        = string
  default     = "repo:brenodega28@26328476/pokerank@1410768130"
}

variable "github_deploy_branch" {
  description = "Branch whose workflows may assume the deploy role."
  type        = string
  default     = "main"
}
