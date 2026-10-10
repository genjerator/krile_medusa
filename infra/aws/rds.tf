# RDS PostgreSQL. Recreated from a blueprint; the DATA comes from your dump
# (restore-dump-to-rds.sh), never from Terraform.

resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db"
  subnet_ids = data.aws_subnets.default.ids
  tags       = var.common_tags
}

resource "aws_db_instance" "main" {
  identifier     = var.rds_identifier
  engine         = "postgres"
  engine_version = var.rds_engine_version

  db_name  = var.rds_db_name
  username = var.rds_username
  password = var.rds_password # from TF_VAR_rds_password / tfvars — never commit

  instance_class    = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
  storage_type      = "gp3"
  port              = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.backend.id]
  publicly_accessible    = false

  # SSL is required by the app connection string (sslmode=require).
  storage_encrypted       = true
  backup_retention_period = 7
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.rds_identifier}-final"
  deletion_protection     = true

  tags = var.common_tags

  lifecycle {
    ignore_changes = [password] # rotate out-of-band without TF diffs
  }
}
