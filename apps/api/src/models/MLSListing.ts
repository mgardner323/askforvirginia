import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MLSListingAttributes {
  id: number;
  mls_id: string;
  mls_source: string; // 'crmls', 'sandicor', etc.
  raw_data: any; // Original MLS data
  mapped_data: {
    address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      county: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    property_details: {
      type: 'residential' | 'commercial' | 'land';
      status: 'active' | 'pending' | 'sold' | 'off-market';
      price: number;
      bedrooms?: number;
      bathrooms?: number;
      square_feet?: number;
      lot_size?: number;
      year_built?: number;
      property_type: string;
      hoa_fees?: number;
    };
    description?: string;
    features?: string[];
    images?: Array<{
      url: string;
      alt: string;
      is_primary: boolean;
      order: number;
    }>;
  };
  last_updated: Date;
  sync_status: 'pending' | 'synced' | 'error';
  sync_errors?: string[];
  property_id?: number; // Reference to our Property model
  created_at?: Date;
  updated_at?: Date;
}

export interface MLSListingCreationAttributes extends Optional<MLSListingAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class MLSListing extends Model<MLSListingAttributes, MLSListingCreationAttributes> implements MLSListingAttributes {
  public id!: number;
  public mls_id!: string;
  public mls_source!: string;
  public raw_data!: any;
  public mapped_data!: {
    address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      county: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    property_details: {
      type: 'residential' | 'commercial' | 'land';
      status: 'active' | 'pending' | 'sold' | 'off-market';
      price: number;
      bedrooms?: number;
      bathrooms?: number;
      square_feet?: number;
      lot_size?: number;
      year_built?: number;
      property_type: string;
      hoa_fees?: number;
    };
    description?: string;
    features?: string[];
    images?: Array<{
      url: string;
      alt: string;
      is_primary: boolean;
      order: number;
    }>;
  };
  public last_updated!: Date;
  public sync_status!: 'pending' | 'synced' | 'error';
  public sync_errors?: string[];
  public property_id?: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Check if listing needs sync
  public needsSync(): boolean {
    return this.sync_status === 'pending' || this.sync_status === 'error';
  }

  // Generate standardized property data for our system
  public generatePropertyData(agentId: number): any {
    const mapped = this.mapped_data;
    
    return {
      mls_id: this.mls_id,
      address: mapped.address,
      property_details: mapped.property_details,
      images: mapped.images || [],
      description: mapped.description || '',
      features: mapped.features || [],
      schools: [], // Will be populated by external service
      seo: {
        meta_title: `${mapped.address.street}, ${mapped.address.city} - ${mapped.property_details.price ? `$${mapped.property_details.price.toLocaleString()}` : 'Price Available'}`,
        meta_description: `${mapped.property_details.bedrooms || 0} bedroom, ${mapped.property_details.bathrooms || 0} bathroom ${mapped.property_details.property_type} in ${mapped.address.city}, ${mapped.address.state}. ${mapped.description?.substring(0, 100) || 'Contact us for more details.'}`
      },
      is_featured: false,
      agent_id: agentId
    };
  }
}

MLSListing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mls_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mls_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raw_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    mapped_data: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidMappedData(value: any) {
          if (!value.address || !value.property_details) {
            throw new Error('Mapped data must include address and property_details');
          }
        },
      },
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sync_status: {
      type: DataTypes.ENUM('pending', 'synced', 'error'),
      defaultValue: 'pending',
      allowNull: false,
    },
    sync_errors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'MLSListing',
    tableName: 'mls_listings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['mls_id', 'mls_source'],
      },
      {
        fields: ['sync_status'],
      },
      {
        fields: ['last_updated'],
      },
      {
        fields: ['property_id'],
      },
    ],
  }
);