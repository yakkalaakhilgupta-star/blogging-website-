#!/bin/bash
# Daily PostgreSQL backup script
# Run via: bash artifacts/api-server/src/lib/backup.sh

set -e
BACKUP_DIR="${BACKUP_DIR:-/tmp/verdant-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="verdant_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/verdant_backup_*.sql.gz | tail -n +8 | xargs -r rm --

echo "Backup complete: $BACKUP_DIR/$FILENAME"
echo "Size: $(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)"
