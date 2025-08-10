import { MLSListing, Property, User } from '../models';
import { Op } from 'sequelize';

interface MLSConfig {
  source: string;
  apiUrl: string;
  credentials: {
    loginUrl: string;
    username: string;
    password: string;
    userAgent?: string;
  };
  syncInterval: number; // minutes
}

interface MLSRawData {
  ListingId: string;
  StandardStatus: 'Active' | 'Pending' | 'Closed' | 'Cancelled' | 'Expired';
  ListPrice: number;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  CountyOrParish?: string;
  Latitude?: number;
  Longitude?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  LotSizeArea?: number;
  YearBuilt?: number;
  PropertyType: string;
  PropertySubType?: string;
  PublicRemarks?: string;
  ListingOfficeKey?: string;
  ListingAgentKey?: string;
  ModificationTimestamp: string;
  Media?: Array<{
    MediaURL: string;
    Order: number;
    MediaCategory: string;
  }>;
  // Add more fields as needed for specific MLS systems
}

export class MLSIntegrationService {
  private config: MLSConfig;
  private authToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: MLSConfig) {
    this.config = config;
  }

  // Authenticate with MLS system
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(this.config.credentials.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.config.credentials.userAgent || 'Virginia-RE-Platform/1.0',
        },
        body: JSON.stringify({
          username: this.config.credentials.username,
          password: this.config.credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (data.expires_in * 1000));
      
      return this.authToken || '';
    } catch (error) {
      console.error('MLS Authentication error:', error);
      throw error;
    }
  }

  // Check if token is valid
  private async ensureAuth(): Promise<string> {
    if (!this.authToken || !this.tokenExpiresAt || this.tokenExpiresAt <= new Date()) {
      return await this.authenticate();
    }
    return this.authToken;
  }

  // Fetch listings from MLS
  async fetchListings(params: {
    modificationTimestamp?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<MLSRawData[]> {
    await this.ensureAuth();

    const searchParams = new URLSearchParams({
      $select: '*',
      $orderby: 'ModificationTimestamp desc',
      $filter: this.buildFilter(params),
      $top: String(params.limit || 100),
      $skip: String(params.offset || 0),
    });

    const response = await fetch(`${this.config.apiUrl}/Property?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Accept': 'application/json',
        'User-Agent': this.config.credentials.userAgent || 'Virginia-RE-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`MLS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  // Build OData filter for MLS query
  private buildFilter(params: { modificationTimestamp?: Date }): string {
    const filters: string[] = [
      "StandardStatus in ('Active','Pending')", // Only active and pending listings
      "PropertyType eq 'Residential'", // Residential properties only
    ];

    if (params.modificationTimestamp) {
      const isoDate = params.modificationTimestamp.toISOString();
      filters.push(`ModificationTimestamp gt ${isoDate}`);
    }

    return filters.join(' and ');
  }

  // Map MLS data to our internal format
  private mapMLSData(rawData: MLSRawData): any {
    return {
      address: {
        street: rawData.UnparsedAddress,
        city: rawData.City,
        state: rawData.StateOrProvince,
        zip_code: rawData.PostalCode,
        county: rawData.CountyOrParish || 'Unknown',
        coordinates: rawData.Latitude && rawData.Longitude ? {
          lat: rawData.Latitude,
          lng: rawData.Longitude,
        } : undefined,
      },
      property_details: {
        type: 'residential' as const,
        status: this.mapStatus(rawData.StandardStatus),
        price: rawData.ListPrice,
        bedrooms: rawData.BedroomsTotal,
        bathrooms: rawData.BathroomsTotalInteger,
        square_feet: rawData.LivingArea,
        lot_size: rawData.LotSizeArea,
        year_built: rawData.YearBuilt,
        property_type: this.mapPropertyType(rawData.PropertySubType || rawData.PropertyType),
      },
      description: rawData.PublicRemarks || '',
      features: this.extractFeatures(rawData.PublicRemarks || ''),
      images: this.mapImages(rawData.Media || []),
    };
  }

  // Map MLS status to our internal status
  private mapStatus(mlsStatus: string): 'active' | 'pending' | 'sold' | 'off-market' {
    switch (mlsStatus) {
      case 'Active': return 'active';
      case 'Pending': return 'pending';
      case 'Closed': return 'sold';
      default: return 'off-market';
    }
  }

  // Map MLS property type to our internal type
  private mapPropertyType(mlsType: string): string {
    const type = mlsType.toLowerCase();
    if (type.includes('single') || type.includes('detached')) return 'single_family';
    if (type.includes('condo') || type.includes('condominium')) return 'condo';
    if (type.includes('town') || type.includes('attached')) return 'townhouse';
    if (type.includes('multi')) return 'multi_family';
    return 'single_family'; // default
  }

  // Extract features from description
  private extractFeatures(description: string): string[] {
    const features: string[] = [];
    const featureKeywords = [
      'pool', 'spa', 'fireplace', 'garage', 'balcony', 'patio', 'deck',
      'hardwood', 'granite', 'stainless', 'updated', 'remodeled',
      'view', 'gated', 'security', 'gym', 'clubhouse'
    ];

    const lowerDesc = description.toLowerCase();
    featureKeywords.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    return features;
  }

  // Map MLS images to our format
  private mapImages(media: Array<{ MediaURL: string; Order: number; MediaCategory: string }>): Array<{
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
  }> {
    return media
      .filter(item => item.MediaCategory === 'Photo')
      .sort((a, b) => a.Order - b.Order)
      .map((item, index) => ({
        url: item.MediaURL,
        alt: `Property image ${index + 1}`,
        is_primary: index === 0,
        order: item.Order,
      }));
  }

  // Sync listings from MLS
  async syncListings(): Promise<{ synced: number; errors: number; details: any[] }> {
    console.log(`Starting MLS sync for ${this.config.source}`);
    let synced = 0;
    let errors = 0;
    const details: any[] = [];

    try {
      // Get the last sync timestamp
      const lastSync = await MLSListing.findOne({
        where: { mls_source: this.config.source },
        order: [['last_updated', 'DESC']],
      });

      const modificationTimestamp = lastSync?.last_updated || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago if no last sync

      // Fetch listings from MLS
      const rawListings = await this.fetchListings({ modificationTimestamp });
      console.log(`Fetched ${rawListings.length} listings from MLS`);

      // Process each listing
      for (const rawListing of rawListings) {
        try {
          const mappedData = this.mapMLSData(rawListing);
          
          // Create or update MLS listing record
          const [mlsListing, created] = await MLSListing.upsert({
            mls_id: rawListing.ListingId,
            mls_source: this.config.source,
            raw_data: rawListing,
            mapped_data: mappedData,
            last_updated: new Date(rawListing.ModificationTimestamp),
            sync_status: 'pending',
          });

          // Attempt to sync with Property model
          await this.syncToProperty(mlsListing);
          synced++;

          details.push({
            mls_id: rawListing.ListingId,
            action: created ? 'created' : 'updated',
            status: 'success',
          });

        } catch (error) {
          errors++;
          details.push({
            mls_id: rawListing.ListingId,
            action: 'error',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          console.error(`Error processing listing ${rawListing.ListingId}:`, error);
        }
      }

    } catch (error) {
      console.error('MLS sync failed:', error);
      throw error;
    }

    console.log(`MLS sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors, details };
  }

  // Sync MLS listing to Property model
  private async syncToProperty(mlsListing: MLSListing): Promise<void> {
    try {
      // Find default agent for assignment
      const defaultAgent = await User.findOne({
        where: { role: ['admin', 'agent'] },
        order: [['created_at', 'ASC']],
      });

      if (!defaultAgent) {
        throw new Error('No agent found for property assignment');
      }

      const propertyData = mlsListing.generatePropertyData(defaultAgent.id);

      // Create or update property
      const [property, created] = await Property.upsert({
        ...propertyData,
        id: mlsListing.property_id, // Will be undefined for new properties
      });

      // Update MLS listing with property reference
      await mlsListing.update({
        property_id: property.id,
        sync_status: 'synced',
        sync_errors: undefined,
      });

      console.log(`Property ${created ? 'created' : 'updated'} for MLS listing ${mlsListing.mls_id}`);

    } catch (error) {
      // Mark as error but don't throw - allow other listings to continue
      await mlsListing.update({
        sync_status: 'error',
        sync_errors: [error instanceof Error ? error.message : 'Unknown sync error'],
      });
      console.error(`Failed to sync MLS listing ${mlsListing.mls_id} to Property:`, error);
    }
  }

  // Schedule regular sync
  startScheduledSync(): NodeJS.Timeout {
    console.log(`Scheduling MLS sync every ${this.config.syncInterval} minutes`);
    
    return setInterval(async () => {
      try {
        await this.syncListings();
      } catch (error) {
        console.error('Scheduled MLS sync failed:', error);
      }
    }, this.config.syncInterval * 60 * 1000);
  }

  // Manual sync trigger
  async triggerSync(): Promise<any> {
    return await this.syncListings();
  }
}

// Factory function to create MLS service instances
export function createMLSService(source: string): MLSIntegrationService {
  const configs: Record<string, MLSConfig> = {
    crmls: {
      source: 'crmls',
      apiUrl: process.env.CRMLS_API_URL || 'https://api.crmls.org/RETS/api/v1',
      credentials: {
        loginUrl: process.env.CRMLS_LOGIN_URL || 'https://api.crmls.org/RETS/api/v1/login',
        username: process.env.CRMLS_USERNAME || '',
        password: process.env.CRMLS_PASSWORD || '',
        userAgent: process.env.CRMLS_USER_AGENT || 'Virginia-RE/1.0',
      },
      syncInterval: parseInt(process.env.MLS_SYNC_INTERVAL || '60'), // 1 hour default
    },
    // Add more MLS sources as needed
  };

  const config = configs[source];
  if (!config) {
    throw new Error(`Unknown MLS source: ${source}`);
  }

  return new MLSIntegrationService(config);
}