# The two app hosts: backend (Medusa) and storefront (Next.js), both ARM/Graviton
# running Docker. They pull images from ECR via the instance profile.
#
# Public IPs are dynamic here. If you need stable IPs, add aws_eip + association
# (note: every public IPv4 now carries a small hourly charge).

locals {
  # Picks the first default subnet. Set an explicit subnet id here if you care
  # which AZ the instances land in.
  subnet_id = data.aws_subnets.default.ids[0]
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.al2023_arm64.id
  instance_type          = var.ec2_instance_type
  subnet_id              = local.subnet_id
  key_name               = var.ec2_key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  vpc_security_group_ids = [aws_security_group.backend.id]

  # 2 GiB swap + Docker are set up per docs/EC2_SETUP.md after boot; keep that
  # runbook, or move it into user_data for a fully hands-off rebuild.
  tags = merge(var.common_tags, { Name = "${var.project}-backend", Role = "medusa" })

  lifecycle { ignore_changes = [ami] } # don't churn the box on new AL2023 releases
}

resource "aws_instance" "storefront" {
  ami                    = data.aws_ami.al2023_arm64.id
  instance_type          = var.ec2_instance_type
  subnet_id              = local.subnet_id
  key_name               = var.ec2_key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  vpc_security_group_ids = [aws_security_group.storefront.id]

  tags = merge(var.common_tags, { Name = "${var.project}-storefront", Role = "storefront" })

  lifecycle { ignore_changes = [ami] }
}
