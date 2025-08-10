import { Router, Response } from 'express';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { searchService } from '../services/SimpleSearchService';
import { cacheService } from '../services/SimpleCacheService';

const router = Router();

/**
 * GET /api/search
 * Advanced search endpoint
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      q: query,
      type = 'all',
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc',
      fuzzy = false,
      highlights = true,
      ...filters
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchOptions = {
      query: query as string,
      type: type as any,
      limit: Math.min(parseInt(limit as string) || 20, 100),
      offset: parseInt(offset as string) || 0,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      fuzzy: fuzzy === 'true',
      includeHighlights: highlights === 'true',
      filters: {
        priceMin: filters.priceMin ? parseInt(filters.priceMin as string) : undefined,
        priceMax: filters.priceMax ? parseInt(filters.priceMax as string) : undefined,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms as string) : undefined,
        bathrooms: filters.bathrooms ? parseFloat(filters.bathrooms as string) : undefined,
        propertyType: filters.propertyType as string,
        city: filters.city as string,
        category: filters.category as string,
        author: filters.author ? parseInt(filters.author as string) : undefined,
        area: filters.area as string
      },
      userId: req.user?.id
    };

    // Remove undefined values from filters
    Object.keys(searchOptions.filters).forEach(key => {
      if ((searchOptions.filters as any)[key] === undefined) {
        delete (searchOptions.filters as any)[key];
      }
    });

    const results = await searchService.search(searchOptions);

    res.json({
      success: true,
      data: results,
      pagination: {
        offset: searchOptions.offset,
        limit: searchOptions.limit,
        total: results.total,
        hasMore: searchOptions.offset + searchOptions.limit < results.total
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions/autocomplete
 */
router.get('/suggestions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    if (query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await searchService.getSuggestions(query);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
});

/**
 * GET /api/search/popular
 * Get popular search terms
 */
router.get('/popular', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const cached = await cacheService.get('search:popular_terms');
    if (cached) {
      return res.json({
        success: true,
        data: (cached as any[]).slice(0, parseInt(limit as string))
      });
    }

    // Mock popular searches (in production, this would come from analytics)
    const popularTerms = [
      { term: 'homes for sale', count: 1250 },
      { term: 'Beverly Hills luxury', count: 890 },
      { term: 'condos downtown', count: 678 },
      { term: 'investment property', count: 543 },
      { term: 'family homes', count: 432 },
      { term: 'new construction', count: 321 },
      { term: 'waterfront property', count: 298 },
      { term: 'gated community', count: 267 },
      { term: 'foreclosure', count: 234 },
      { term: 'rent to own', count: 198 }
    ];

    await cacheService.set('search:popular_terms', popularTerms, { ttl: 3600 });

    res.json({
      success: true,
      data: popularTerms.slice(0, parseInt(limit as string))
    });
  } catch (error) {
    console.error('Popular search terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular search terms'
    });
  }
});

/**
 * GET /api/search/filters
 * Get available search filters
 */
router.get('/filters', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type = 'all' } = req.query;

    const cached = await cacheService.get(`search:filters:${type}`);
    if (cached) {
      return res.json({
        success: true,
        data: cached
      });
    }

    const filters: any = {};

    // Property filters
    if (type === 'all' || type === 'property') {
      // In production, these would be dynamically generated from the database
      filters.property = {
        priceRanges: [
          { label: 'Under $500K', value: { max: 500000 } },
          { label: '$500K - $750K', value: { min: 500000, max: 750000 } },
          { label: '$750K - $1M', value: { min: 750000, max: 1000000 } },
          { label: '$1M - $1.5M', value: { min: 1000000, max: 1500000 } },
          { label: 'Over $1.5M', value: { min: 1500000 } }
        ],
        propertyTypes: [
          { label: 'Single Family', value: 'single_family' },
          { label: 'Condo', value: 'condo' },
          { label: 'Townhouse', value: 'townhouse' },
          { label: 'Multi-Family', value: 'multi_family' },
          { label: 'Land', value: 'land' },
          { label: 'Commercial', value: 'commercial' }
        ],
        bedrooms: [
          { label: 'Any', value: null },
          { label: '1+', value: 1 },
          { label: '2+', value: 2 },
          { label: '3+', value: 3 },
          { label: '4+', value: 4 },
          { label: '5+', value: 5 }
        ],
        bathrooms: [
          { label: 'Any', value: null },
          { label: '1+', value: 1 },
          { label: '1.5+', value: 1.5 },
          { label: '2+', value: 2 },
          { label: '2.5+', value: 2.5 },
          { label: '3+', value: 3 }
        ],
        cities: [
          { label: 'Beverly Hills', value: 'Beverly Hills' },
          { label: 'Santa Monica', value: 'Santa Monica' },
          { label: 'Los Angeles', value: 'Los Angeles' },
          { label: 'Malibu', value: 'Malibu' },
          { label: 'Pasadena', value: 'Pasadena' },
          { label: 'Riverside', value: 'Riverside' },
          { label: 'Corona', value: 'Corona' },
          { label: 'Moreno Valley', value: 'Moreno Valley' }
        ]
      };
    }

    // Blog filters
    if (type === 'all' || type === 'blog') {
      filters.blog = {
        categories: [
          { label: 'Market Updates', value: 'market-updates' },
          { label: 'Buying Guide', value: 'buying-guide' },
          { label: 'Selling Tips', value: 'selling-tips' },
          { label: 'Investment', value: 'investment' },
          { label: 'Community News', value: 'community' },
          { label: 'Industry News', value: 'industry' }
        ]
      };
    }

    // Market filters
    if (type === 'all' || type === 'market') {
      filters.market = {
        areas: [
          { label: 'Riverside County', value: 'riverside-county' },
          { label: 'Los Angeles County', value: 'los-angeles-county' },
          { label: 'Orange County', value: 'orange-county' },
          { label: 'San Bernardino County', value: 'san-bernardino-county' }
        ]
      };
    }

    await cacheService.set(`search:filters:${type}`, filters, { ttl: 3600 });

    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    console.error('Search filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search filters'
    });
  }
});

/**
 * POST /api/search/index/:type/:id
 * Index or reindex a specific document (admin only)
 */
router.post('/index/:type/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { type, id } = req.params;
    const { document } = req.body;

    if (!['property', 'blog', 'market'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be property, blog, or market.'
      });
    }

    // Simple search service doesn't support indexing
    res.json({
      success: true,
      message: `Document indexing not available with simple search service`
    });
  } catch (error) {
    console.error('Index document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to index document'
    });
  }
});

/**
 * DELETE /api/search/index/:type/:id
 * Remove a document from search index (admin only)
 */
router.delete('/index/:type/:id', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { type, id } = req.params;

    if (!['property', 'blog', 'market'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be property, blog, or market.'
      });
    }

    // Simple search service doesn't support document deletion from index
    res.json({
      success: true,
      message: `Document deletion from index not available with simple search service`
    });
  } catch (error) {
    console.error('Delete document from index error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove document from index'
    });
  }
});

/**
 * POST /api/search/reindex
 * Reindex all content (admin only)
 */
router.post('/reindex', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Simple search service doesn't support reindexing
    res.json({
      success: true,
      message: 'Reindexing not available with simple search service'
    });
  } catch (error) {
    console.error('Reindex error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start reindexing'
    });
  }
});

/**
 * GET /api/search/analytics
 * Get search analytics (admin only)
 */
router.get('/analytics', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or agent role required.'
      });
    }

    const analytics = await searchService.getSearchAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search analytics'
    });
  }
});

export { router as searchRoutes };
export default router;