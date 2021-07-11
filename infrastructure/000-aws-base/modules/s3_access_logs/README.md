# S3 Access Logs Module

This module provides an s3 bucket that is designed to be used for logging access to other s3 buckets.

# Resources

- An S3 bucket with a canned ACL for log-delivery-write
- A KMS key and alias for encrypting/decrypting log data to this bucket

# Outputs

- KMS Alias Name
- KMS Key ID
- Bucket ID
