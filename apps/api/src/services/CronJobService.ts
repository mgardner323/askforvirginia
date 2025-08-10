import * as cron from 'node-cron';
import { createMLSService } from './MLSIntegrationService';
import { MLSListing, Property } from '../models';
import { getSettingValue } from '../routes/settings';
import { Op } from 'sequelize';

export class CronJobService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Start all cron jobs
   */
  public async startAllJobs(): Promise<void> {
    console.log('🕒 Starting cron job service...');
    
    if (!this.isProduction) {
      console.log('⚠️  Cron jobs disabled in development mode');
      console.log('   To enable: Set NODE_ENV=production or call startAllJobs(true)');
      return;
    }

    try {
      await this.startMLSSync();
      await this.startMaintenanceTasks();
      
      console.log(`✅ Cron job service started with ${this.jobs.size} active jobs`);
    } catch (error) {
      console.error('❌ Failed to start cron jobs:', error);
    }
  }

  /**
   * Force start jobs (for testing/development)
   */
  public async forceStart(): Promise<void> {
    console.log('🔧 Force starting cron jobs (development mode)');
    await this.startMLSSync();
    await this.startMaintenanceTasks();
    console.log(`✅ Force started ${this.jobs.size} cron jobs`);
  }

  /**
   * Start MLS data synchronization job
   */
  private async startMLSSync(): Promise<void> {
    try {
      // Get sync interval from settings or environment
      const syncInterval = await this.getMLSSyncInterval();
      const cronExpression = this.minutesToCronExpression(syncInterval);

      console.log(`📊 Scheduling MLS sync every ${syncInterval} minutes (${cronExpression})`);

      const mlsJob = cron.schedule(cronExpression, async () => {
        await this.runMLSSync();
      }, {
        timezone: 'America/Los_Angeles' // Pacific Time for California MLS
      });

      this.jobs.set('mls-sync', mlsJob);
      console.log('✅ MLS sync job scheduled successfully');

    } catch (error) {
      console.error('❌ Failed to schedule MLS sync job:', error);
    }
  }

  /**
   * Execute MLS synchronization
   */
  private async runMLSSync(): Promise<void> {
    console.log('🔄 Starting scheduled MLS sync...');
    
    try {
      // Check if CRMLS is configured
      const crmlsConfigured = await this.isCRMLSConfigured();
      if (!crmlsConfigured) {
        console.log('⚠️  CRMLS not configured, skipping sync');
        return;
      }

      const mlsService = createMLSService('crmls');
      const result = await mlsService.syncListings();

      console.log(`✅ MLS sync completed: ${result.synced} synced, ${result.errors} errors`);
      
      // Log sync results for monitoring
      await this.logSyncResults('crmls', result);

    } catch (error) {
      console.error('❌ MLS sync failed:', error);
      await this.logSyncError('crmls', error);
    }
  }

  /**
   * Start maintenance tasks
   */
  private async startMaintenanceTasks(): Promise<void> {
    try {
      // Daily cleanup at 2 AM PT
      const cleanupJob = cron.schedule('0 2 * * *', async () => {
        await this.runMaintenanceTasks();
      }, {
        timezone: 'America/Los_Angeles'
      });

      this.jobs.set('daily-maintenance', cleanupJob);
      console.log('✅ Daily maintenance job scheduled for 2:00 AM PT');

    } catch (error) {
      console.error('❌ Failed to schedule maintenance jobs:', error);
    }
  }

  /**
   * Execute maintenance tasks
   */
  private async runMaintenanceTasks(): Promise<void> {
    console.log('🧹 Starting daily maintenance tasks...');
    
    try {
      // Clean up old error logs
      await this.cleanupOldErrors();
      
      // Update property statistics
      await this.updatePropertyStats();
      
      // Clean up orphaned MLS listings
      await this.cleanupOrphanedListings();
      
      console.log('✅ Daily maintenance completed successfully');
      
    } catch (error) {
      console.error('❌ Maintenance tasks failed:', error);
    }
  }

  /**
   * Get MLS sync interval from settings or environment
   */
  private async getMLSSyncInterval(): Promise<number> {
    try {
      // Try to get from database settings first
      const settingValue = await getSettingValue('MLS_SYNC_INTERVAL');
      if (settingValue && !isNaN(Number(settingValue))) {
        return Number(settingValue);
      }
      
      // Fall back to environment variable
      const envValue = process.env.MLS_SYNC_INTERVAL;
      if (envValue && !isNaN(Number(envValue))) {
        return Number(envValue);
      }
      
      // Default to 60 minutes
      return 60;
      
    } catch (error) {
      console.error('Error getting sync interval:', error);
      return 60; // Default fallback
    }
  }

  /**
   * Check if CRMLS is properly configured
   */
  private async isCRMLSConfigured(): Promise<boolean> {
    try {
      // Check database settings first
      const apiUrl = await getSettingValue('CRMLS_API_URL') || process.env.CRMLS_API_URL;
      const username = await getSettingValue('CRMLS_USERNAME') || process.env.CRMLS_USERNAME;
      const password = await getSettingValue('CRMLS_PASSWORD') || process.env.CRMLS_PASSWORD;
      
      return !!(apiUrl && username && password);
      
    } catch (error) {
      console.error('Error checking CRMLS configuration:', error);
      return false;
    }
  }

  /**
   * Convert minutes to cron expression
   */
  private minutesToCronExpression(minutes: number): string {
    if (minutes < 60) {
      // Less than an hour: run every X minutes
      return `*/${minutes} * * * *`;
    } else {
      // Hour or more: convert to hourly schedule
      const hours = Math.floor(minutes / 60);
      return `0 */${hours} * * *`;
    }
  }

  /**
   * Log sync results for monitoring
   */
  private async logSyncResults(source: string, result: any): Promise<void> {
    // In a production environment, you might want to:
    // - Store in a monitoring table
    // - Send to external monitoring service
    // - Update dashboard statistics
    
    console.log(`📊 Sync Results [${source}]:`, {
      timestamp: new Date().toISOString(),
      synced: result.synced,
      errors: result.errors,
      success_rate: result.synced / (result.synced + result.errors) * 100
    });
  }

  /**
   * Log sync errors
   */
  private async logSyncError(source: string, error: any): Promise<void> {
    console.error(`🚨 Sync Error [${source}]:`, {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  /**
   * Clean up old error records
   */
  private async cleanupOldErrors(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const deletedCount = await MLSListing.destroy({
        where: {
          sync_status: 'error',
          updated_at: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });
      
      console.log(`🧹 Cleaned up ${deletedCount} old error records`);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Update property statistics
   */
  private async updatePropertyStats(): Promise<void> {
    try {
      const stats = {
        total_properties: await Property.count(),
        active_properties: await Property.count({ where: { 'property_details.status': 'active' } }),
        total_mls_listings: await MLSListing.count(),
        synced_listings: await MLSListing.count({ where: { sync_status: 'synced' } })
      };
      
      console.log('📈 Property Statistics Updated:', stats);
      
    } catch (error) {
      console.error('Error updating property stats:', error);
    }
  }

  /**
   * Clean up orphaned MLS listings
   */
  private async cleanupOrphanedListings(): Promise<void> {
    try {
      // Remove listings older than 90 days that failed to sync
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      // Using raw query to avoid TypeScript issues
      const [results] = await MLSListing.sequelize!.query(
        'DELETE FROM mls_listings WHERE sync_status = ? AND created_at < ? AND property_id IS NULL',
        {
          replacements: ['error', ninetyDaysAgo]
        }
      );
      
      console.log(`🧹 Cleaned up orphaned MLS listings`);
      
    } catch (error) {
      console.error('Error cleaning up orphaned listings:', error);
    }
  }

  /**
   * Stop all cron jobs
   */
  public stopAllJobs(): void {
    console.log('🛑 Stopping all cron jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      job.destroy();
      console.log(`  ✅ Stopped ${name}`);
    });
    
    this.jobs.clear();
    console.log('✅ All cron jobs stopped');
  }

  /**
   * Get job status
   */
  public getJobStatus(): Array<{ name: string, running: boolean, nextRun?: Date }> {
    const status: Array<{ name: string, running: boolean, nextRun?: Date }> = [];
    
    this.jobs.forEach((job, name) => {
      status.push({
        name,
        running: true, // node-cron doesn't expose running status directly
        // Note: node-cron doesn't provide nextRun, this would need custom implementation
      });
    });
    
    return status;
  }

  /**
   * Trigger specific job manually
   */
  public async triggerJob(jobName: string): Promise<boolean> {
    try {
      switch (jobName) {
        case 'mls-sync':
          await this.runMLSSync();
          return true;
        case 'maintenance':
          await this.runMaintenanceTasks();
          return true;
        default:
          console.log(`Unknown job: ${jobName}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to trigger job ${jobName}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const cronJobService = new CronJobService();