import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BlogPostAttributes {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category: 'market-news' | 'buying-tips' | 'selling-tips' | 'lifestyle' | 'community';
  tags: string[];
  author_id: number;
  seo: {
    meta_title: string;
    meta_description: string;
    schema_markup?: any;
  };
  status: 'draft' | 'published' | 'scheduled';
  published_at?: Date;
  view_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlogPostCreationAttributes extends Optional<BlogPostAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class BlogPost extends Model<BlogPostAttributes, BlogPostCreationAttributes> implements BlogPostAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public content!: string;
  public excerpt!: string;
  public featured_image?: string;
  public category!: 'market-news' | 'buying-tips' | 'selling-tips' | 'lifestyle' | 'community';
  public tags!: string[];
  public author_id!: number;
  public seo!: {
    meta_title: string;
    meta_description: string;
    schema_markup?: any;
  };
  public status!: 'draft' | 'published' | 'scheduled';
  public published_at?: Date;
  public view_count!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual getter for reading time (roughly 200 words per minute)
  public get readingTime(): number {
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  // Virtual getter for URL
  public get url(): string {
    return `/blog/${this.slug}`;
  }

  // Instance method to increment view count
  public async incrementViewCount(): Promise<void> {
    this.view_count += 1;
    await this.save();
  }

  // Generate slug from title
  public generateSlug(): string {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness for new posts
    if (!this.id) {
      slug += `-${Date.now()}`;
    }
    
    return slug;
  }
}

BlogPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    featured_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('market-news', 'buying-tips', 'selling-tips', 'lifestyle', 'community'),
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    seo: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidSeo(value: any) {
          if (!value.meta_title || !value.meta_description) {
            throw new Error('SEO must include meta_title and meta_description');
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
    status: {
      type: DataTypes.ENUM('draft', 'published', 'scheduled'),
      defaultValue: 'draft',
      allowNull: false,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
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
    modelName: 'BlogPost',
    tableName: 'blog_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['slug'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['author_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['published_at'],
      },
      {
        fields: ['status', 'published_at'],
      },
      {
        fields: ['category', 'status'],
      },
    ],
    hooks: {
      beforeCreate: (blogPost: BlogPost) => {
        if (!blogPost.slug) {
          blogPost.slug = blogPost.generateSlug();
        }
      },
      beforeUpdate: (blogPost: BlogPost) => {
        if (blogPost.changed('title')) {
          blogPost.slug = blogPost.generateSlug();
        }
        if (blogPost.changed('status') && blogPost.status === 'published' && !blogPost.published_at) {
          blogPost.published_at = new Date();
        }
      },
    },
  }
);