/**
 * Database Backup Script for Virginia Real Estate
 * Creates a full backup of the MariaDB database before blog content deletion
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilename = `virginia-db-backup-${timestamp}.sql`;
const backupPath = path.join(backupsDir, backupFilename);

// Database configuration (read from environment or use defaults)
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'virginia';
const DB_USER = process.env.DB_USER || 'virginia';
const DB_PASS = process.env.DB_PASSWORD || process.env.DB_PASS || '';

console.log('🔄 Starting database backup...');
console.log(`📁 Backup location: ${backupPath}`);

try {
    // Create mysqldump command
    const dumpCommand = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p'${DB_PASS}' --routines --triggers --single-transaction ${DB_NAME} > "${backupPath}"`;
    
    // Execute backup
    execSync(dumpCommand, { stdio: 'inherit' });
    
    // Verify backup file was created
    if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        console.log('✅ Database backup completed successfully!');
        console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📂 Backup file: ${backupFilename}`);
        
        // Create a restore script for this backup
        const restoreScript = `#!/bin/bash
# Restore script for backup: ${backupFilename}
# Created: ${new Date().toISOString()}

mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < "${backupPath}"
echo "Database restored from ${backupFilename}"
`;
        
        const restoreScriptPath = path.join(backupsDir, `restore-${timestamp}.sh`);
        fs.writeFileSync(restoreScriptPath, restoreScript);
        execSync(`chmod +x "${restoreScriptPath}"`);
        
        console.log(`🔧 Restore script created: restore-${timestamp}.sh`);
        
    } else {
        throw new Error('Backup file was not created');
    }
    
} catch (error) {
    console.error('❌ Database backup failed:', error.message);
    process.exit(1);
}

console.log('\n🎯 Backup Summary:');
console.log(`   Database: ${DB_NAME}`);
console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
console.log(`   Backup: ${backupFilename}`);
console.log(`   Location: ${backupsDir}`);
console.log('\n✅ Ready to proceed with blog content deletion');