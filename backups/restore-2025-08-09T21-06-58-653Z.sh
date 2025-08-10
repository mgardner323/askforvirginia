#!/bin/bash
# Restore script for backup: virginia-db-backup-2025-08-09T21-06-58-653Z.sql
# Created: 2025-08-09T21:06:59.004Z

mysql -h localhost -P 3306 -u virginia -p'Pinkhamster99!1' virginia < "/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com/backups/virginia-db-backup-2025-08-09T21-06-58-653Z.sql"
echo "Database restored from virginia-db-backup-2025-08-09T21-06-58-653Z.sql"
