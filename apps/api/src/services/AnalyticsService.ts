import { User, Property, BlogPost } from '../models';
import { cacheService } from './SimpleCacheService';

interface AnalyticsEvent {
  event: string;
  category: 'user' | 'property' | 'blog' | 'search' | 'contact' | 'system';
  action: string;
  label?: string;
  value?: number;
  userId?: number;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PropertyAnalytics {
  totalProperties: number;
  featuredProperties: number;
  averagePrice: number;
  priceRanges: {
    range: string;
    count: number;
  }[];
  propertiesByArea: {
    area: string;
    count: number;
    averagePrice: number;
  }[];
  viewCounts: {
    propertyId: number;
    title: string;
    views: number;
  }[];
  conversionRate: number;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  usersByRole: {
    role: string;
    count: number;
  }[];
  engagementMetrics: {
    averageSessionDuration: number;
    averagePagesPerSession: number;
    bounceRate: number;
  };
}

interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  popularPosts: {
    id: number;
    title: string;
    views: number;
    shares: number;
  }[];
  categoriesPerformance: {
    category: string;
    posts: number;
    views: number;
    engagement: number;
  }[];
  averageReadTime: number;
}

interface SystemAnalytics {
  apiResponseTimes: {
    endpoint: string;
    averageTime: number;
    requestCount: number;
  }[];
  errorRates: {
    endpoint: string;
    errorRate: number;
    errorCount: number;
  }[];
  cachePerformance: {
    hitRate: number;
    totalRequests: number;
    memoryUsage: number;
  };
  serverMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
}

interface SearchAnalytics {
  popularSearchTerms: {
    term: string;
    count: number;
    resultCount: number;
    clickThroughRate: number;
  }[];
  searchFilters: {
    filter: string;
    usage: number;
  }[];
  noResultsQueries: {
    term: string;
    count: number;
  }[];
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory

  /**
   * Track an analytics event
   */
  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event: event.event || 'unknown',
      category: event.category || 'user',
      action: event.action || 'unknown',
      label: event.label,
      value: event.value,
      userId: event.userId,
      sessionId: event.sessionId,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      timestamp: new Date(),
      metadata: event.metadata
    };

    // Store in memory (in production, this would go to a proper analytics DB)
    this.events.push(analyticsEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Cache recent events for quick access
    await cacheService.set('analytics:recent_events', this.events.slice(-100), { ttl: 300 });
  }

  /**
   * Get comprehensive property analytics
   */
  async getPropertyAnalytics(): Promise<PropertyAnalytics> {
    return cacheService.cacheQuery(
      'analytics:properties',
      async () => {
        const properties = await Property.findAll({
          include: [{ model: User, as: 'agent', attributes: ['email'] }]
        });

        const totalProperties = properties.length;
        const featuredProperties = properties.filter(p => p.is_featured).length;
        
        const prices = properties
          .filter(p => p.property_details?.price)
          .map(p => parseFloat(p.property_details.price.toString()));
        
        const averagePrice = prices.length > 0 
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : 0;

        // Price ranges
        const priceRanges = [
          { range: 'Under $500K', count: 0 },
          { range: '$500K - $750K', count: 0 },
          { range: '$750K - $1M', count: 0 },
          { range: '$1M - $1.5M', count: 0 },
          { range: 'Over $1.5M', count: 0 }
        ];

        prices.forEach(price => {
          if (price < 500000) priceRanges[0].count++;
          else if (price < 750000) priceRanges[1].count++;
          else if (price < 1000000) priceRanges[2].count++;
          else if (price < 1500000) priceRanges[3].count++;
          else priceRanges[4].count++;
        });

        // Properties by area
        const areaMap = new Map<string, { count: number; totalPrice: number }>();
        properties.forEach(p => {
          const area = p.address?.city || 'Unknown';
          const price = parseFloat(p.property_details?.price?.toString() || '0');
          
          if (!areaMap.has(area)) {
            areaMap.set(area, { count: 0, totalPrice: 0 });
          }
          
          const areaData = areaMap.get(area)!;
          areaData.count++;
          areaData.totalPrice += price;
        });

        const propertiesByArea = Array.from(areaMap.entries()).map(([area, data]) => ({
          area,
          count: data.count,
          averagePrice: data.count > 0 ? Math.round(data.totalPrice / data.count) : 0
        }));

        // Mock view counts (in production, track actual views)
        const viewCounts = properties.slice(0, 10).map(p => ({
          propertyId: p.id,
          title: `${p.address?.street} ${p.address?.city}`,
          views: Math.floor(Math.random() * 500) + 50
        }));

        return {
          totalProperties,
          featuredProperties,
          averagePrice,
          priceRanges,
          propertiesByArea,
          viewCounts,
          conversionRate: 3.2 // Mock conversion rate
        };
      },
      { ttl: 600 } // Cache for 10 minutes
    );
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    return cacheService.cacheQuery(
      'analytics:users',
      async () => {
        const users = await User.findAll();
        const totalUsers = users.length;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        const newUsers = {
          today: users.filter(u => new Date(u.created_at) >= today).length,
          thisWeek: users.filter(u => new Date(u.created_at) >= weekAgo).length,
          thisMonth: users.filter(u => new Date(u.created_at) >= monthAgo).length
        };

        const activeUsers = users.filter(u => 
          u.last_login && new Date(u.last_login) >= weekAgo
        ).length;

        const usersByRole = [
          { role: 'client', count: users.filter(u => u.role === 'client').length },
          { role: 'agent', count: users.filter(u => u.role === 'agent').length },
          { role: 'admin', count: users.filter(u => u.role === 'admin').length }
        ];

        // Mock engagement metrics (in production, track actual user behavior)
        const engagementMetrics = {
          averageSessionDuration: 420, // 7 minutes
          averagePagesPerSession: 4.2,
          bounceRate: 32.5
        };

        return {
          totalUsers,
          activeUsers,
          newUsers,
          usersByRole,
          engagementMetrics
        };
      },
      { ttl: 300 } // Cache for 5 minutes
    );
  }

  /**
   * Get comprehensive blog analytics
   */
  async getBlogAnalytics(): Promise<BlogAnalytics> {
    return cacheService.cacheQuery(
      'analytics:blog',
      async () => {
        const posts = await BlogPost.findAll({
          include: [{ model: User, as: 'author', attributes: ['email'] }]
        });

        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.status === 'published').length;
        
        // Mock view counts (in production, track actual views)
        const totalViews = publishedPosts * Math.floor(Math.random() * 200 + 100);

        const popularPosts = posts
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            title: p.title,
            views: Math.floor(Math.random() * 1000) + 100,
            shares: Math.floor(Math.random() * 50) + 5
          }));

        // Categories performance
        const categoryMap = new Map<string, { posts: number; views: number }>();
        posts.forEach(p => {
          const category = p.category || 'uncategorized';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { posts: 0, views: 0 });
          }
          const data = categoryMap.get(category)!;
          data.posts++;
          data.views += Math.floor(Math.random() * 500) + 50;
        });

        const categoriesPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          posts: data.posts,
          views: data.views,
          engagement: Math.round((data.views / data.posts) * 100) / 100
        }));

        return {
          totalPosts,
          publishedPosts,
          totalViews,
          popularPosts,
          categoriesPerformance,
          averageReadTime: 180 // 3 minutes
        };
      },
      { ttl: 600 } // Cache for 10 minutes
    );
  }

  /**
   * Get system performance analytics
   */
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return cacheService.cacheQuery(
      'analytics:system',
      async () => {
        const cacheStats = await cacheService.getStats();

        // Mock API performance data (in production, track actual response times)
        const apiResponseTimes = [
          { endpoint: '/api/properties', averageTime: 120, requestCount: 1500 },
          { endpoint: '/api/blog', averageTime: 85, requestCount: 800 },
          { endpoint: '/api/users/dashboard', averageTime: 95, requestCount: 600 },
          { endpoint: '/api/market', averageTime: 150, requestCount: 400 }
        ];

        const errorRates = [
          { endpoint: '/api/properties', errorRate: 0.5, errorCount: 7 },
          { endpoint: '/api/blog', errorRate: 0.2, errorCount: 2 },
          { endpoint: '/api/users/dashboard', errorRate: 0.8, errorCount: 5 },
          { endpoint: '/api/market', errorRate: 0.1, errorCount: 1 }
        ];

        // Mock server metrics (in production, get from system monitoring)
        const serverMetrics = {
          cpuUsage: Math.random() * 30 + 20, // 20-50%
          memoryUsage: Math.random() * 40 + 40, // 40-80%
          diskUsage: Math.random() * 20 + 15, // 15-35%
          uptime: process.uptime() // Actual uptime
        };

        return {
          apiResponseTimes,
          errorRates,
          cachePerformance: {
            hitRate: cacheStats.hitRate,
            totalRequests: cacheStats.totalRequests,
            memoryUsage: cacheStats.memoryUsage
          },
          serverMetrics
        };
      },
      { ttl: 60 } // Cache for 1 minute (more frequent updates for system metrics)
    );
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<SearchAnalytics> {
    return cacheService.cacheQuery(
      'analytics:search',
      async () => {
        // Mock search data (in production, track actual searches)
        const popularSearchTerms = [
          { term: 'Los Angeles homes', count: 45, resultCount: 120, clickThroughRate: 75.5 },
          { term: 'Beverly Hills luxury', count: 32, resultCount: 25, clickThroughRate: 82.1 },
          { term: 'first time buyer', count: 28, resultCount: 15, clickThroughRate: 68.9 },
          { term: 'investment property', count: 23, resultCount: 35, clickThroughRate: 71.3 },
          { term: 'mortgage calculator', count: 19, resultCount: 8, clickThroughRate: 89.5 }
        ];

        const searchFilters = [
          { filter: 'price_range', usage: 85 },
          { filter: 'bedrooms', usage: 72 },
          { filter: 'location', usage: 68 },
          { filter: 'property_type', usage: 45 },
          { filter: 'square_footage', usage: 38 }
        ];

        const noResultsQueries = [
          { term: 'mansion under 100k', count: 12 },
          { term: 'beachfront studio', count: 8 },
          { term: 'castle in hollywood', count: 5 }
        ];

        return {
          popularSearchTerms,
          searchFilters,
          noResultsQueries
        };
      },
      { ttl: 1800 } // Cache for 30 minutes
    );
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(): Promise<{
    properties: PropertyAnalytics;
    users: UserAnalytics;
    blog: BlogAnalytics;
    system: SystemAnalytics;
    search: SearchAnalytics;
    recentEvents: AnalyticsEvent[];
  }> {
    const [properties, users, blog, system, search] = await Promise.all([
      this.getPropertyAnalytics(),
      this.getUserAnalytics(),
      this.getBlogAnalytics(),
      this.getSystemAnalytics(),
      this.getSearchAnalytics()
    ]);

    const recentEvents = await cacheService.get<AnalyticsEvent[]>('analytics:recent_events') || [];

    return {
      properties,
      users,
      blog,
      system,
      search,
      recentEvents
    };
  }

  /**
   * Track property view
   */
  async trackPropertyView(propertyId: number, userId?: number, sessionId?: string): Promise<void> {
    await this.trackEvent({
      event: 'property_view',
      category: 'property',
      action: 'view',
      label: `property_${propertyId}`,
      value: propertyId,
      userId,
      sessionId
    });
  }

  /**
   * Track search query
   */
  async trackSearch(query: string, filters: any, resultCount: number, userId?: number): Promise<void> {
    await this.trackEvent({
      event: 'search',
      category: 'search',
      action: 'query',
      label: query,
      value: resultCount,
      userId,
      metadata: { filters, resultCount }
    });
  }

  /**
   * Track blog post read
   */
  async trackBlogRead(postId: number, readTime: number, userId?: number): Promise<void> {
    await this.trackEvent({
      event: 'blog_read',
      category: 'blog',
      action: 'read',
      label: `post_${postId}`,
      value: readTime,
      userId,
      metadata: { readTime }
    });
  }

  /**
   * Track user action
   */
  async trackUserAction(action: string, label?: string, userId?: number, metadata?: any): Promise<void> {
    await this.trackEvent({
      event: 'user_action',
      category: 'user',
      action,
      label,
      userId,
      metadata
    });
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;