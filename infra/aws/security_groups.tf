# Security groups.
# NOTE: the ElastiCache Redis rule (port 6379) is intentionally OMITTED — Redis
# now runs as a Docker container on the app host, not as a managed service.

# ── Backend SG (was sg-0be44b1b5e7670616): app + RDS ────────────────────────
resource "aws_security_group" "backend" {
  name        = "${var.project}-backend"
  description = "Medusa backend + RDS access"
  vpc_id      = data.aws_vpc.default.id
  tags        = merge(var.common_tags, { Name = "${var.project}-backend" })
}

# Public ingress: SSH, HTTP, HTTPS, Medusa API
locals {
  backend_public_ports = [22, 80, 443, 9000]
}

resource "aws_vpc_security_group_ingress_rule" "backend_public" {
  for_each          = toset([for p in local.backend_public_ports : tostring(p)])
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = tonumber(each.value)
  to_port           = tonumber(each.value)
  ip_protocol       = "tcp"
  description       = "public tcp/${each.value}"
}

# Internal: Postgres 5432 only from within this SG (RDS <- app)
resource "aws_vpc_security_group_ingress_rule" "backend_pg_self" {
  security_group_id            = aws_security_group.backend.id
  referenced_security_group_id = aws_security_group.backend.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "PostgreSQL from app SG"
}

resource "aws_vpc_security_group_egress_rule" "backend_all_out" {
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ── Storefront SG (was sg-0978d21f06c7ddfa3): ports 22 + 8000 ───────────────
resource "aws_security_group" "storefront" {
  name        = "${var.project}-storefront"
  description = "Next.js storefront"
  vpc_id      = data.aws_vpc.default.id
  tags        = merge(var.common_tags, { Name = "${var.project}-storefront" })
}

resource "aws_vpc_security_group_ingress_rule" "storefront_public" {
  for_each          = toset(["22", "8000"])
  security_group_id = aws_security_group.storefront.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = tonumber(each.value)
  to_port           = tonumber(each.value)
  ip_protocol       = "tcp"
  description       = "public tcp/${each.value}"
}

resource "aws_vpc_security_group_egress_rule" "storefront_all_out" {
  security_group_id = aws_security_group.storefront.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
