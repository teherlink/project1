#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ] && [ -z "${NEON_DATABASE_URL:-}" ]; then
  echo "DATABASE_URL or NEON_DATABASE_URL is required"
  exit 1
fi

OUTPUT_DIR="${BACKUP_DIR:-./db_backups}"
mkdir -p "$OUTPUT_DIR"
TIMESTAMP=$(date +"%Y%m%dT%H%M%S")
FILENAME="backup-${TIMESTAMP}.sql.gz"

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "$DATABASE_URL" | gzip > "$OUTPUT_DIR/$FILENAME"
else
  pg_dump "$NEON_DATABASE_URL" | gzip > "$OUTPUT_DIR/$FILENAME"
fi

echo "Backup saved to $OUTPUT_DIR/$FILENAME"
