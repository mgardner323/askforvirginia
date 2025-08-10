// Property Types
export interface IProperty {
  _id?: string;
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
  schools?: Array<{
    name: string;
    type: 'elementary' | 'middle' | 'high' | 'private';
    rating: number;
    distance: number;
  }>;
  neighborhood?: {
    name: string;
    walkScore?: number;
    transit_score?: number;
    crime_rating?: number;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  created_at: Date;
  updated_at: Date;
  is_featured: boolean;
  agent_id: string;
}

// Blog Post Types
export interface IBlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category: 'market-news' | 'buying-tips' | 'selling-tips' | 'lifestyle' | 'community';
  tags: string[];
  author_id: string;
  seo: {
    meta_title: string;
    meta_description: string;
    schema_markup?: Record<string, any>;
  };
  status: 'draft' | 'published' | 'scheduled';
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  view_count: number;
}

// User Types
export interface IUser {
  _id?: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'client';
  profile: {
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    license_number?: string;
    specializations?: string[];
    areas_served?: string[];
  };
  preferences?: {
    property_types?: string[];
    price_range?: {
      min: number;
      max: number;
    };
    locations?: string[];
  };
  saved_properties: string[];
  saved_searches: Array<{
    name: string;
    criteria: Record<string, any>;
    notifications: boolean;
  }>;
  created_at: Date;
  last_login?: Date;
  is_verified: boolean;
  is_active: boolean;
}

// Market Report Types
export interface IMarketReport {
  _id?: string;
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
  charts_data?: Record<string, any>;
  seo: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  created_at: Date;
  published: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter Types
export interface PropertySearchFilters {
  type?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  city?: string;
  zip_code?: string;
  property_type?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface BlogSearchFilters {
  category?: string;
  tags?: string[];
  author_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}