import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FeaturedNewsAttributes {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: {
    url: string;
    alt: string;
  };
  category: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  priority: number; // For ordering featured news
  publish_date: Date;
  created_by: number;
  seo: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  };
  analytics: {
    views: number;
    clicks: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface FeaturedNewsCreationAttributes extends Optional<FeaturedNewsAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class FeaturedNews extends Model<FeaturedNewsAttributes, FeaturedNewsCreationAttributes> implements FeaturedNewsAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public excerpt!: string;
  public content!: string;
  public image!: { url: string; alt: string };
  public category!: string;
  public tags!: string[];
  public is_active!: boolean;
  public is_featured!: boolean;
  public priority!: number;
  public publish_date!: Date;
  public created_by!: number;
  public seo!: { meta_title?: string; meta_description?: string; keywords?: string[] };
  public analytics!: { views: number; clicks: number };
  public created_at!: Date;
  public updated_at!: Date;

  // Generate SEO-friendly slug from title
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Check if article is published and active
  public get isPublished(): boolean {
    const now = new Date();
    return this.is_active && this.publish_date <= now;
  }

  // Get reading time estimate (words per minute)
  public get readingTime(): number {
    const wordsPerMinute = 200;
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Increment view count
  public async incrementViews(): Promise<void> {
    await this.update({
      analytics: {
        ...this.analytics,
        views: this.analytics.views + 1
      }
    });
  }

  // Increment click count
  public async incrementClicks(): Promise<void> {
    await this.update({
      analytics: {
        ...this.analytics,
        clicks: this.analytics.clicks + 1
      }
    });
  }
}

FeaturedNews.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[a-z0-9-]+$/
      }
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      }
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    image: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        url: '/images/news-placeholder.jpg',
        alt: 'News article image'
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['market-update', 'neighborhood-spotlight', 'buying-tips', 'selling-tips', 'investment', 'community-news', 'other']]
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 999
      }
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    seo: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        meta_title: '',
        meta_description: '',
        keywords: []
      }
    },
    analytics: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        views: 0,
        clicks: 0
      }
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
    modelName: 'FeaturedNews',
    tableName: 'featured_news',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['is_active', 'is_featured']
      },
      {
        fields: ['category']
      },
      {
        fields: ['publish_date']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['slug'],
        unique: true
      }
    ],
    hooks: {
      beforeCreate: (news: FeaturedNews) => {
        if (!news.slug) {
          news.slug = FeaturedNews.generateSlug(news.title);
        }
        // Set meta title and description if not provided
        if (!news.seo.meta_title) {
          news.seo = {
            ...news.seo,
            meta_title: news.title
          };
        }
        if (!news.seo.meta_description) {
          news.seo = {
            ...news.seo,
            meta_description: news.excerpt
          };
        }
      },
      beforeUpdate: (news: FeaturedNews) => {
        if (news.changed('title') && !news.changed('slug')) {
          news.slug = FeaturedNews.generateSlug(news.title);
        }
      }
    }
  }
);

export default FeaturedNews;