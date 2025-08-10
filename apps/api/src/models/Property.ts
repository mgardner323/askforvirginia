import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PropertyAttributes {
  id: number;
  mls_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    county: string;
    coordinates: {
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
    property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial';
    hoa_fees?: number;
  };
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
  }>;
  description: string;
  features: string[];
  schools: Array<{
    name: string;
    type: 'elementary' | 'middle' | 'high' | 'private';
    rating?: number;
    distance?: number;
  }>;
  neighborhood?: {
    name?: string;
    walkScore?: number;
    transit_score?: number;
    crime_rating?: number;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  is_featured: boolean;
  agent_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PropertyCreationAttributes extends Optional<PropertyAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Property extends Model<PropertyAttributes, PropertyCreationAttributes> implements PropertyAttributes {
  public id!: number;
  public mls_id!: string;
  public address!: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    county: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  public property_details!: {
    type: 'residential' | 'commercial' | 'land';
    status: 'active' | 'pending' | 'sold' | 'off-market';
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
    property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial';
    hoa_fees?: number;
  };
  public images!: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
  }>;
  public description!: string;
  public features!: string[];
  public schools!: Array<{
    name: string;
    type: 'elementary' | 'middle' | 'high' | 'private';
    rating?: number;
    distance?: number;
  }>;
  public neighborhood?: {
    name?: string;
    walkScore?: number;
    transit_score?: number;
    crime_rating?: number;
  };
  public seo!: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  public is_featured!: boolean;
  public agent_id!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual getter for full address
  public get fullAddress(): string {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zip_code}`;
  }

  // Generate slug from address
  public generateSlug(): string {
    const addressSlug = `${this.address.street}-${this.address.city}-${this.address.state}-${this.address.zip_code}`
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `${addressSlug}-${this.mls_id}`;
  }
}

Property.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mls_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidAddress(value: any) {
          if (!value.street || !value.city || !value.state || !value.zip_code || !value.county) {
            throw new Error('Address must include street, city, state, zip_code, and county');
          }
          if (!value.coordinates || !value.coordinates.lat || !value.coordinates.lng) {
            throw new Error('Address must include coordinates (lat, lng)');
          }
        },
      },
    },
    property_details: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidDetails(value: any) {
          if (!value.type || !value.status || !value.price || !value.property_type) {
            throw new Error('Property details must include type, status, price, and property_type');
          }
        },
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    schools: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    neighborhood: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    seo: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidSeo(value: any) {
          if (!value.meta_title || !value.meta_description || !value.slug) {
            throw new Error('SEO must include meta_title, meta_description, and slug');
          }
        },
      },
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    modelName: 'Property',
    tableName: 'properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['mls_id'],
      },
      {
        fields: ['agent_id'],
      },
      {
        fields: ['is_featured'],
      },
    ],
    hooks: {
      beforeCreate: (property: Property) => {
        if (!property.seo.slug) {
          property.seo.slug = property.generateSlug();
        }
      },
      beforeUpdate: (property: Property) => {
        if (property.changed('address') || property.changed('mls_id')) {
          property.seo.slug = property.generateSlug();
        }
      },
    },
  }
);