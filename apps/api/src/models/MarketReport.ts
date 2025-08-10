import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../config/database';

export interface MarketReportAttributes {
  id: number;
  area: string;
  report_date: Date;
  metrics: {
    median_home_price: number;
    average_days_on_market: number;
    total_sales: number;
    price_per_sqft: number;
    inventory_levels: number;
    year_over_year_change: number;
  };
  insights: string;
  charts_data?: any;
  seo: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  published: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MarketReportCreationAttributes extends Optional<MarketReportAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class MarketReport extends Model<MarketReportAttributes, MarketReportCreationAttributes> implements MarketReportAttributes {
  public id!: number;
  public area!: string;
  public report_date!: Date;
  public metrics!: {
    median_home_price: number;
    average_days_on_market: number;
    total_sales: number;
    price_per_sqft: number;
    inventory_levels: number;
    year_over_year_change: number;
  };
  public insights!: string;
  public charts_data?: any;
  public seo!: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  public published!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual getter for formatted date
  public get formattedDate(): string {
    return this.report_date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Virtual getter for URL
  public get url(): string {
    return `/market-reports/${this.seo.slug}`;
  }

  // Generate slug from area and date
  public generateSlug(): string {
    const dateStr = this.report_date.toISOString().slice(0, 7); // YYYY-MM format
    return `${this.area.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}-market-report-${dateStr}`;
  }

  // Static method to get latest report for area
  public static async getLatestForArea(area: string): Promise<MarketReport | null> {
    return this.findOne({
      where: { area, published: true },
      order: [['report_date', 'DESC']]
    });
  }

  // Static method to get trend data for area
  public static async getTrendDataForArea(area: string, months: number = 12): Promise<MarketReport[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return this.findAll({
      where: {
        area,
        published: true,
        report_date: {
          [Op.gte]: cutoffDate
        }
      },
      order: [['report_date', 'ASC']]
    });
  }
}

MarketReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    report_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    metrics: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidMetrics(value: any) {
          const required = ['median_home_price', 'average_days_on_market', 'total_sales', 'price_per_sqft', 'inventory_levels', 'year_over_year_change'];
          for (const field of required) {
            if (value[field] === undefined || value[field] === null) {
              throw new Error(`Metrics must include ${field}`);
            }
          }
        },
      },
    },
    insights: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    charts_data: {
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
          if (value.meta_title.length > 60) {
            throw new Error('Meta title must be 60 characters or less');
          }
          if (value.meta_description.length > 160) {
            throw new Error('Meta description must be 160 characters or less');
          }
        },
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
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
    modelName: 'MarketReport',
    tableName: 'market_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['area'],
      },
      {
        fields: ['report_date'],
      },
      {
        fields: ['published'],
      },
      {
        fields: ['area', 'report_date'],
      },
      {
        fields: ['published', 'report_date'],
      },
    ],
    hooks: {
      beforeCreate: (marketReport: MarketReport) => {
        if (!marketReport.seo.slug) {
          marketReport.seo.slug = marketReport.generateSlug();
        }
      },
      beforeUpdate: (marketReport: MarketReport) => {
        if (marketReport.changed('area') || marketReport.changed('report_date')) {
          marketReport.seo.slug = marketReport.generateSlug();
        }
      },
    },
  }
);