import { Property, BlogPost, User, MarketReport } from '../models';
import { Op, Sequelize } from 'sequelize';
import { cacheService } from './SimpleCacheService';
import { analyticsService } from './AnalyticsService';

interface SearchResult {
  type: 'property' | 'blog' | 'market' | 'user';
  id: number;
  title: string;
  description: string;
  url: string;
  score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

interface SearchOptions {
  query: string;
  type?: 'property' | 'blog' | 'market' | 'user' | 'all';
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
  includeHighlights?: boolean;
  fuzzy?: boolean;
  userId?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  query: string;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

class SimpleSearchService {
  /**
   * Advanced search across all content types (database only)
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // Track search analytics
      await this.trackSearch(options);

      const response = await this.databaseSearch(options);
      response.took = Date.now() - startTime;
      
      // Cache popular searches
      if (options.query.length > 2) {
        await this.cacheSearchResult(options, response);
      }

      return response;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Database search
   */
  private async databaseSearch(options: SearchOptions): Promise<SearchResponse> {
    const { query, type = 'all', limit = 20, offset = 0, filters = {} } = options;
    const results: SearchResult[] = [];
    let total = 0;

    // Search properties
    if (type === 'all' || type === 'property') {
      const propertyResults = await this.searchProperties(query, filters, limit, offset);
      results.push(...propertyResults.results);
      total += propertyResults.total;
    }

    // Search blog posts
    if (type === 'all' || type === 'blog') {
      const blogResults = await this.searchBlogPosts(query, filters, limit, offset);
      results.push(...blogResults.results);
      total += blogResults.total;
    }

    // Search market reports
    if (type === 'all' || type === 'market') {
      const marketResults = await this.searchMarketReports(query, filters, limit, offset);
      results.push(...marketResults.results);
      total += marketResults.total;
    }

    // Sort by relevance (simple scoring based on title matches)
    results.sort((a, b) => b.score - a.score);

    return {
      results: results.slice(0, limit),
      total,
      took: 0,
      query,
      suggestions: await this.getDatabaseSuggestions(query)
    };
  }

  /**
   * Search properties in database
   */
  private async searchProperties(query: string, filters: Record<string, any>, limit: number, offset: number) {
    const whereCondition: any = {
      [Op.or]: [
        { '$address.street$': { [Op.iLike]: `%${query}%` } },
        { '$address.city$': { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ]
    };

    // Apply filters
    if (filters.priceMin) whereCondition['$property_details.price$'] = { [Op.gte]: filters.priceMin };
    if (filters.priceMax) {
      whereCondition['$property_details.price$'] = {
        ...whereCondition['$property_details.price$'],
        [Op.lte]: filters.priceMax
      };
    }
    if (filters.bedrooms) whereCondition['$property_details.bedrooms$'] = { [Op.gte]: filters.bedrooms };
    if (filters.bathrooms) whereCondition['$property_details.bathrooms$'] = { [Op.gte]: filters.bathrooms };
    if (filters.propertyType) whereCondition['$property_details.type$'] = filters.propertyType;
    if (filters.city) whereCondition['$address.city$'] = filters.city;

    const properties = await Property.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const results: SearchResult[] = properties.rows.map(property => ({
      type: 'property' as const,
      id: property.id,
      title: `${property.address?.street}, ${property.address?.city}`,
      description: property.description || 'Property listing',
      url: `/properties/${property.id}`,
      score: this.calculateRelevanceScore(query, [
        property.address?.street || '',
        property.address?.city || '',
        property.description || ''
      ]),
      metadata: {
        price: property.property_details?.price,
        bedrooms: property.property_details?.bedrooms,
        bathrooms: property.property_details?.bathrooms,
        type: property.property_details?.type
      }
    }));

    return { results, total: properties.count };
  }

  /**
   * Search blog posts in database
   */
  private async searchBlogPosts(query: string, filters: Record<string, any>, limit: number, offset: number) {
    const whereCondition: any = {
      [Op.and]: [
        { status: 'published' },
        {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } },
            { excerpt: { [Op.iLike]: `%${query}%` } }
          ]
        }
      ]
    };

    if (filters.category) whereCondition[Op.and].push({ category: filters.category });
    if (filters.author) whereCondition[Op.and].push({ author_id: filters.author });

    const posts = await BlogPost.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'author', attributes: ['email'] }]
    });

    const results: SearchResult[] = posts.rows.map(post => ({
      type: 'blog' as const,
      id: post.id,
      title: post.title,
      description: post.excerpt || post.content.substring(0, 200) + '...',
      url: `/blog/${post.slug}`,
      score: this.calculateRelevanceScore(query, [post.title, post.content, post.excerpt || '']),
      metadata: {
        category: post.category,
        author: (post as any).author?.email,
        createdAt: post.created_at
      }
    }));

    return { results, total: posts.count };
  }

  /**
   * Search market reports in database
   */
  private async searchMarketReports(query: string, filters: Record<string, any>, limit: number, offset: number) {
    const whereCondition: any = {
      [Op.or]: [
        { area: { [Op.iLike]: `%${query}%` } },
        { insights: { [Op.iLike]: `%${query}%` } }
      ]
    };

    if (filters.area) whereCondition[Op.and] = [{ area: filters.area }];

    const reports = await MarketReport.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['report_date', 'DESC']]
    });

    const results: SearchResult[] = reports.rows.map(report => ({
      type: 'market' as const,
      id: report.id,
      title: `${report.area} Market Report`,
      description: report.insights.substring(0, 200) + '...',
      url: `/market/${report.seo.slug}`,
      score: this.calculateRelevanceScore(query, [report.area, report.insights]),
      metadata: {
        area: report.area,
        reportDate: report.report_date
      }
    }));

    return { results, total: reports.count };
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    return this.getDatabaseSuggestions(query);
  }

  private async getDatabaseSuggestions(query: string): Promise<string[]> {
    const cached = await cacheService.get<string[]>(`search:suggestions:${query.toLowerCase()}`);
    if (cached) return cached;

    const suggestions: string[] = [];

    // Get suggestions from properties
    const properties = await Property.findAll({
      where: {
        [Op.or]: [
          { '$address.city$': { [Op.iLike]: `%${query}%` } },
          { '$address.street$': { [Op.iLike]: `${query}%` } }
        ]
      },
      limit: 5,
      attributes: ['address']
    });

    properties.forEach(property => {
      if (property.address?.city && !suggestions.includes(property.address.city)) {
        suggestions.push(property.address.city);
      }
    });

    // Cache suggestions
    await cacheService.set(`search:suggestions:${query.toLowerCase()}`, suggestions, { ttl: 300 });

    return suggestions;
  }

  private calculateRelevanceScore(query: string, fields: string[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    fields.forEach((field, index) => {
      const fieldLower = field.toLowerCase();
      const weight = index === 0 ? 3 : index === 1 ? 2 : 1; // Title gets higher weight

      if (fieldLower.includes(queryLower)) {
        const position = fieldLower.indexOf(queryLower);
        const exactMatch = fieldLower === queryLower ? 10 : 0;
        const startsWithMatch = position === 0 ? 5 : 0;
        const containsMatch = 1;

        score += (exactMatch + startsWithMatch + containsMatch) * weight;
      }
    });

    return score;
  }

  private async trackSearch(options: SearchOptions): Promise<void> {
    try {
      await analyticsService.trackSearch(
        options.query,
        options.filters || {},
        0, // Will be updated with actual results count
        options.userId
      );
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  private async cacheSearchResult(options: SearchOptions, response: SearchResponse): Promise<void> {
    try {
      const cacheKey = `search:${options.query}:${JSON.stringify(options.filters)}`;
      await cacheService.set(cacheKey, response, { ttl: 300 }); // Cache for 5 minutes
    } catch (error) {
      console.error('Failed to cache search result:', error);
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics() {
    try {
      const cached = await cacheService.get('search:analytics');
      if (cached) return cached;

      // This would typically come from a dedicated analytics store
      // For now, we'll return mock data
      const analytics = {
        popularQueries: [
          { query: 'homes for sale', count: 150, avgResults: 45 },
          { query: 'Beverly Hills', count: 89, avgResults: 12 },
          { query: 'condos', count: 67, avgResults: 23 },
          { query: 'luxury homes', count: 54, avgResults: 8 },
          { query: 'investment property', count: 41, avgResults: 19 }
        ],
        noResultQueries: [
          { query: 'castle', count: 5 },
          { query: 'beachfront mansion under 100k', count: 3 },
          { query: 'time machine', count: 2 }
        ],
        avgResponseTime: 45,
        totalSearches: 1250,
        successRate: 94.5
      };

      await cacheService.set('search:analytics', analytics, { ttl: 600 });
      return analytics;
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      return null;
    }
  }
}

// Singleton instance
export const searchService = new SimpleSearchService();
export default searchService;