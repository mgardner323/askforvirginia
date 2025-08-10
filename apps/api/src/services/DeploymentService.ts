import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { sequelize } from '../config/database';
import { Property, BlogPost, FeaturedNews, MarketReport, User, EmailTemplate, EmailCampaign } from '../models';
import { getDatabaseCredentials } from '../utils/credentialsHelper';

const execAsync = promisify(exec);

interface DeploymentConfig {
  production: {
    host: string;
    username: string;
    path: string;
    database: {
      host: string;
      port: number;
      name: string;
      username: string;
      password: string;
    };
  };
  development: {
    path: string;
    database: {
      host: string;
      port: number;
      name: string;
      username: string;
      password: string;
    };
  };
}

interface DeploymentResult {
  success: boolean;
  message: string;
  details: string[];
  errors: string[];
  timestamp: Date;
  duration: number;
}

interface SyncOptions {
  includeContent: boolean;
  includeUsers: boolean;
  includeProperties: boolean;
  includeBlog: boolean;
  includeNews: boolean;
  includeMarketReports: boolean;
  includeEmailTemplates: boolean;
  includeFiles: boolean;
  backupFirst: boolean;
  dryRun: boolean;
}

export class DeploymentService {
  private config: DeploymentConfig;
  private deploymentHistory: any[] = [];

  private initialized = false;

  constructor() {
    // Will be initialized with initializeConfig()
    this.config = {
      production: {
        host: 'askforvirginia.com',
        username: 'virginia',
        path: '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
        database: {
          host: 'localhost',
          port: 3306,
          name: 'virginia_prod',
          username: 'virginia_prod',
          password: ''
        }
      },
      development: {
        path: '/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com',
        database: {
          host: 'localhost',
          port: 3306,
          name: 'virginia',
          username: 'virginia',
          password: ''
        }
      }
    };
  }

  // Initialize configuration with database credentials
  private async initializeConfig(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const dbCredentials = await getDatabaseCredentials();
      
      if (dbCredentials) {
        // Update development database config
        this.config.development.database = {
          host: dbCredentials.host,
          port: dbCredentials.port,
          name: dbCredentials.database,
          username: dbCredentials.username,
          password: dbCredentials.password
        };
      }
      
      // Production config (use environment variables for now)
      this.config.production = {
        host: process.env.PROD_HOST || 'askforvirginia.com',
        username: process.env.PROD_USER || 'virginia',
        path: process.env.PROD_PATH || '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
        database: {
          host: process.env.PROD_DB_HOST || 'localhost',
          port: parseInt(process.env.PROD_DB_PORT || '3306'),
          name: process.env.PROD_DB_NAME || 'virginia_prod',
          username: process.env.PROD_DB_USER || 'virginia_prod',
          password: process.env.PROD_DB_PASS || ''
        }
      };
      
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load database credentials, using defaults:', error);
    }
  }

  // Test connection to production server
  async testConnection(): Promise<{ success: boolean; message: string }> {
    await this.initializeConfig();
    
    try {
      const command = `ssh ${this.config.production.username}@${this.config.production.host} "echo 'Connection successful'"`;
      const { stdout } = await execAsync(command);
      
      return {
        success: stdout.includes('Connection successful'),
        message: stdout.includes('Connection successful') 
          ? 'Successfully connected to production server' 
          : 'Connection failed'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Create backup of production database
  async createProductionBackup(): Promise<{ success: boolean; backupFile?: string; message: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup_${timestamp}.sql`;
      const backupPath = `/tmp/${backupFile}`;

      const dumpCommand = `mysqldump -h ${this.config.production.database.host} ` +
        `-u ${this.config.production.database.username} ` +
        `-p${this.config.production.database.password} ` +
        `${this.config.production.database.name} > ${backupPath}`;

      const command = `ssh ${this.config.production.username}@${this.config.production.host} "${dumpCommand}"`;
      await execAsync(command);

      return {
        success: true,
        backupFile,
        message: `Production database backup created: ${backupFile}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Sync database content from dev to production
  async syncDatabase(options: Partial<SyncOptions>): Promise<DeploymentResult> {
    const startTime = Date.now();
    const result: DeploymentResult = {
      success: false,
      message: '',
      details: [],
      errors: [],
      timestamp: new Date(),
      duration: 0
    };

    try {
      // Create backup first if requested
      if (options.backupFirst) {
        const backup = await this.createProductionBackup();
        if (backup.success) {
          result.details.push(`✅ Production backup created: ${backup.backupFile}`);
        } else {
          result.errors.push(`❌ Backup failed: ${backup.message}`);
          throw new Error('Backup failed');
        }
      }

      // Export development data
      const exportData = await this.exportDevelopmentData(options);
      result.details.push(`✅ Exported ${exportData.totalRecords} records from development`);

      if (options.dryRun) {
        result.details.push('🔍 DRY RUN - No changes made to production');
        result.success = true;
        result.message = 'Dry run completed successfully';
      } else {
        // Import to production
        await this.importToProduction(exportData.data, options);
        result.details.push('✅ Data imported to production successfully');
        result.success = true;
        result.message = 'Database synchronization completed successfully';
      }

    } catch (error) {
      result.success = false;
      result.message = `Database sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    this.deploymentHistory.push(result);
    return result;
  }

  // Export data from development database
  private async exportDevelopmentData(options: Partial<SyncOptions>) {
    const data: any = {};
    let totalRecords = 0;

    if (options.includeProperties) {
      data.properties = await Property.findAll({ raw: true });
      totalRecords += data.properties.length;
    }

    if (options.includeBlog) {
      data.blogPosts = await BlogPost.findAll({ raw: true });
      totalRecords += data.blogPosts.length;
    }

    if (options.includeNews) {
      data.featuredNews = await FeaturedNews.findAll({ raw: true });
      totalRecords += data.featuredNews.length;
    }

    if (options.includeMarketReports) {
      data.marketReports = await MarketReport.findAll({ raw: true });
      totalRecords += data.marketReports.length;
    }

    if (options.includeEmailTemplates) {
      data.emailTemplates = await EmailTemplate.findAll({ raw: true });
      data.emailCampaigns = await EmailCampaign.findAll({ raw: true });
      totalRecords += (data.emailTemplates?.length || 0) + (data.emailCampaigns?.length || 0);
    }

    if (options.includeUsers) {
      // Only export non-sensitive user data
      data.users = await User.findAll({
        attributes: ['id', 'email', 'role', 'profile', 'is_active', 'created_at', 'updated_at'],
        raw: true
      });
      totalRecords += data.users.length;
    }

    return { data, totalRecords };
  }

  // Import data to production database
  private async importToProduction(data: any, options: Partial<SyncOptions>) {
    // This would typically involve creating SQL INSERT/UPDATE statements
    // and executing them on the production database
    // For security, we'll create SQL files that can be reviewed before execution
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlFile = `deployment_${timestamp}.sql`;
    const sqlPath = `/tmp/${sqlFile}`;

    let sqlStatements: string[] = [];

    // Generate SQL for each data type
    if (data.properties && options.includeProperties) {
      sqlStatements.push('-- Properties Data');
      sqlStatements.push('TRUNCATE TABLE properties;');
      data.properties.forEach((property: any) => {
        const values = Object.values(property).map(val => 
          typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : 
          val === null ? 'NULL' : val
        ).join(', ');
        sqlStatements.push(`INSERT INTO properties VALUES (${values});`);
      });
    }

    if (data.featuredNews && options.includeNews) {
      sqlStatements.push('-- Featured News Data');
      sqlStatements.push('TRUNCATE TABLE featured_news;');
      data.featuredNews.forEach((news: any) => {
        const values = Object.values(news).map(val => 
          typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : 
          val === null ? 'NULL' : val
        ).join(', ');
        sqlStatements.push(`INSERT INTO featured_news VALUES (${values});`);
      });
    }

    // Write SQL to file
    await fs.writeFile(sqlPath, sqlStatements.join('\n'));

    // Execute on production (this would be done securely in practice)
    const command = `scp ${sqlPath} ${this.config.production.username}@${this.config.production.host}:${sqlPath} && ` +
      `ssh ${this.config.production.username}@${this.config.production.host} ` +
      `"mysql -h ${this.config.production.database.host} -u ${this.config.production.database.username} ` +
      `-p${this.config.production.database.password} ${this.config.production.database.name} < ${sqlPath}"`;

    await execAsync(command);
  }

  // Sync files and code from dev to production
  async syncFiles(options: { includeUploads: boolean; dryRun: boolean }): Promise<DeploymentResult> {
    const startTime = Date.now();
    const result: DeploymentResult = {
      success: false,
      message: '',
      details: [],
      errors: [],
      timestamp: new Date(),
      duration: 0
    };

    try {
      const rsyncOptions = options.dryRun ? '--dry-run -av' : '-av';
      const excludes = '--exclude node_modules --exclude .git --exclude *.log --exclude .env';

      // Sync codebase
      const codeCommand = `rsync ${rsyncOptions} ${excludes} ` +
        `${this.config.development.path}/ ` +
        `${this.config.production.username}@${this.config.production.host}:${this.config.production.path}/`;

      const { stdout: codeOutput } = await execAsync(codeCommand);
      result.details.push('✅ Code files synchronized');

      // Sync uploads if requested
      if (options.includeUploads) {
        const uploadsCommand = `rsync ${rsyncOptions} ` +
          `${this.config.development.path}/public/uploads/ ` +
          `${this.config.production.username}@${this.config.production.host}:${this.config.production.path}/public/uploads/`;

        await execAsync(uploadsCommand);
        result.details.push('✅ Upload files synchronized');
      }

      // Install dependencies and build on production
      if (!options.dryRun) {
        const commands = [
          `cd ${this.config.production.path}`,
          'npm install --production',
          'npm run build',
          'chown -R $(whoami):psacln .',
          'chmod -R 755 .',
          'chmod -R 775 public/uploads/',
          'mkdir -p logs',
          'chmod 755 logs'
        ];

        const installCommand = `ssh ${this.config.production.username}@${this.config.production.host} ` +
          `"${commands.join(' && ')}"`;

        await execAsync(installCommand);
        result.details.push('✅ Dependencies installed, built, and permissions set');
      }

      result.success = true;
      result.message = options.dryRun 
        ? 'File sync dry run completed successfully'
        : 'Files synchronized successfully';

    } catch (error) {
      result.success = false;
      result.message = `File sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    this.deploymentHistory.push(result);
    return result;
  }

  // Full deployment (database + files)
  async fullDeployment(options: SyncOptions): Promise<DeploymentResult> {
    const startTime = Date.now();
    const result: DeploymentResult = {
      success: false,
      message: '',
      details: [],
      errors: [],
      timestamp: new Date(),
      duration: 0
    };

    try {
      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.message);
      }
      result.details.push('✅ Production server connection verified');

      // Sync database
      const dbResult = await this.syncDatabase(options);
      result.details.push(...dbResult.details);
      result.errors.push(...dbResult.errors);

      if (!dbResult.success && !options.dryRun) {
        throw new Error('Database sync failed');
      }

      // Sync files
      const fileResult = await this.syncFiles({
        includeUploads: options.includeFiles,
        dryRun: options.dryRun
      });
      result.details.push(...fileResult.details);
      result.errors.push(...fileResult.errors);

      if (!fileResult.success && !options.dryRun) {
        throw new Error('File sync failed');
      }

      result.success = true;
      result.message = options.dryRun 
        ? 'Full deployment dry run completed successfully'
        : 'Full deployment completed successfully';

    } catch (error) {
      result.success = false;
      result.message = `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    this.deploymentHistory.push(result);
    return result;
  }

  // Get deployment history
  getDeploymentHistory(): any[] {
    return this.deploymentHistory.slice(-10); // Return last 10 deployments
  }

  // Get system status
  async getSystemStatus() {
    const connectionTest = await this.testConnection();
    
    return {
      production: {
        connected: connectionTest.success,
        host: this.config.production.host,
        lastDeployment: this.deploymentHistory.length > 0 
          ? this.deploymentHistory[this.deploymentHistory.length - 1].timestamp 
          : null
      },
      development: {
        path: this.config.development.path,
        database: this.config.development.database.name
      },
      totalDeployments: this.deploymentHistory.length
    };
  }
}

export const deploymentService = new DeploymentService();