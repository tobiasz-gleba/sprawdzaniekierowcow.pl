#!/bin/bash
set -e

BACKUP_FILE="/tmp/mysql-backup-$(date +%s).sql.gz"

echo "Dumping MySQL database..."
mysqldump \
    --no-tablespaces \
    -h "$MYSQL_HOST" \
    -P "$MYSQL_PORT" \
    -u "$MYSQL_USER" \
    -p"$MYSQL_PASSWORD" \
    --single-transaction \
    --routines \
    --events \
    "$MYSQL_DATABASE" \
    | gzip > "$BACKUP_FILE"

lftp -u "$FTP_USER","$FTP_PASSWORD" "ftp://$FTP_HOST" <<EOF
mkdir -p -f "$FTP_PATH"
cd "$FTP_PATH"
put "./$BACKUP_FILE"
bye
EOF

echo "MySQL backup completed successfully."
