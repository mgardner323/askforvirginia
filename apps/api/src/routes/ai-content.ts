import express from 'express';
import { aiContentService } from '../services/AIContentService';
import WebResearchService from '../services/WebResearchService';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();
const webResearchService = new WebResearchService();

// Apply authentication and admin/agent role requirement to all routes
router.use(protect);
router.use(authorize('admin', 'agent'));

/**
 * POST /api/ai-content/generate
 * Generate a blog post using AI
 */
router.post('/generate', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { topic, category, tone, length, keywords, targetAudience, includeCallToAction, enableResearch = true } = req.body;

  // Validation
  if (!topic) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required'
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  const validCategories = ['market-news', 'buying-tips', 'selling-tips', 'lifestyle', 'community'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  const validTones = ['professional', 'friendly', 'informative', 'conversational'];
  if (tone && !validTones.includes(tone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tone'
    });
  }

  const validLengths = ['short', 'medium', 'long'];
  if (length && !validLengths.includes(length)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid length'
    });
  }

  try {
    const prompt = {
      topic,
      category,
      tone: tone || 'professional',
      length: length || 'medium',
      keywords: keywords || [],
      targetAudience,
      includeCallToAction: includeCallToAction !== false
    };

    let researchData = null;
    
    // Perform web research if enabled
    if (enableResearch) {
      try {
        console.log('🔍 Starting web research for AI content generation...');
        researchData = await webResearchService.researchTopic(topic, category, 'Los Angeles');
        console.log('✅ Web research completed successfully');
      } catch (error) {
        console.warn('⚠️ Web research failed, proceeding without research data:', error);
        // Continue without research data rather than failing entirely
      }
    }

    // Generate content with research data
    const generatedContent = await aiContentService.generateBlogPost(prompt, researchData);

    res.json({
      success: true,
      message: 'Blog post generated successfully',
      data: {
        ...generatedContent,
        researchSources: researchData?.articles?.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source
        })) || [],
        researchSummary: researchData?.researchSummary || 'Generated without web research',
        marketData: researchData?.marketData || {},
        competitorInsights: researchData?.competitorInsights || {}
      }
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate blog post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * POST /api/ai-content/ideas
 * Generate content ideas for a category
 */
router.post('/ideas', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { category, count = 10 } = req.body;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  const validCategories = ['market-news', 'buying-tips', 'selling-tips', 'lifestyle', 'community'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  if (count < 1 || count > 20) {
    return res.status(400).json({
      success: false,
      message: 'Count must be between 1 and 20'
    });
  }

  try {
    // Try to get research-enhanced ideas first
    let ideas = [];
    let researchData = null;
    
    try {
      console.log(`🔍 Getting research-enhanced ideas for ${category}...`);
      researchData = await webResearchService.researchTopic(`${category} content ideas`, category, 'Los Angeles');
      
      // Generate ideas based on research
      const researchTopics = researchData.competitorInsights?.topTopics || [];
      const contentGaps = researchData.competitorInsights?.contentGaps || [];
      
      // Combine trending topics and content gaps for better ideas
      const enhancedPrompt = `${category} content ideas based on current trends: ${researchTopics.join(', ')} and content gaps: ${contentGaps.join(', ')}`;
      ideas = await aiContentService.generateContentIdeas(enhancedPrompt, count);
      
      console.log(`✅ Generated ${ideas.length} research-enhanced ideas`);
    } catch (error) {
      console.warn('⚠️ Research-enhanced ideas failed, using standard generation:', error);
      ideas = await aiContentService.generateContentIdeas(category, count);
    }

    res.json({
      success: true,
      message: 'Content ideas generated successfully',
      data: { 
        ideas, 
        category, 
        count: ideas.length,
        researchEnhanced: !!researchData,
        trendingTopics: researchData?.competitorInsights?.topTopics || [],
        contentGaps: researchData?.competitorInsights?.contentGaps || []
      }
    });
  } catch (error) {
    console.error('Error generating content ideas:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate content ideas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * POST /api/ai-content/research-preview
 * Get a preview of research data for a topic without generating content
 */
router.post('/research-preview', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { topic, category } = req.body;

  if (!topic) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required'
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  const validCategories = ['market-news', 'buying-tips', 'selling-tips', 'lifestyle', 'community'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  try {
    console.log(`🔍 Generating research preview for: ${topic}`);
    const researchData = await webResearchService.researchTopic(topic, category, 'Los Angeles');
    
    res.json({
      success: true,
      message: 'Research preview generated successfully',
      data: {
        topic,
        category,
        researchSummary: researchData.researchSummary,
        articlesFound: researchData.articles.length,
        sources: researchData.articles.map(article => ({
          title: article.title,
          source: article.source,
          url: article.url,
          relevanceScore: article.relevanceScore
        })),
        marketData: researchData.marketData,
        competitorInsights: researchData.competitorInsights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating research preview:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate research preview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * POST /api/ai-content/improve
 * Improve existing content
 */
router.post('/improve', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { content, type = 'readability' } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Content is required'
    });
  }

  const validTypes = ['seo', 'readability', 'engagement'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid improvement type. Must be one of: seo, readability, engagement'
    });
  }

  if (content.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Content is too long. Maximum 10,000 characters allowed.'
    });
  }

  try {
    const improvedContent = await aiContentService.improveContent(content, type as 'seo' | 'readability' | 'engagement');

    res.json({
      success: true,
      message: `Content improved for ${type}`,
      data: { 
        originalContent: content,
        improvedContent,
        improvementType: type
      }
    });
  } catch (error) {
    console.error('Error improving content:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to improve content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * GET /api/ai-content/test
 * Test AI connection
 */
router.get('/test', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    const connectionTest = await aiContentService.testConnection();

    if (connectionTest.connected) {
      res.json({
        success: true,
        message: 'AI service is connected and working',
        data: connectionTest
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'AI service is not available',
        data: connectionTest
      });
    }
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AI connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * GET /api/ai-content/options
 * Get available options for AI generation
 */
router.get('/options', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const options = {
    categories: [
      { value: 'market-news', label: 'Market News', description: 'Real estate market trends and updates' },
      { value: 'buying-tips', label: 'Buying Tips', description: 'Advice for home buyers' },
      { value: 'selling-tips', label: 'Selling Tips', description: 'Guidance for home sellers' },
      { value: 'lifestyle', label: 'Lifestyle', description: 'Community and lifestyle content' },
      { value: 'community', label: 'Community', description: 'Local community information' }
    ],
    tones: [
      { value: 'professional', label: 'Professional', description: 'Formal and expert tone' },
      { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
      { value: 'informative', label: 'Informative', description: 'Educational and factual tone' },
      { value: 'conversational', label: 'Conversational', description: 'Casual and engaging tone' }
    ],
    lengths: [
      { value: 'short', label: 'Short (300-500 words)', description: 'Quick reads and social posts' },
      { value: 'medium', label: 'Medium (600-1000 words)', description: 'Standard blog posts' },
      { value: 'long', label: 'Long (1200-2000 words)', description: 'In-depth guides and articles' }
    ],
    improvementTypes: [
      { value: 'seo', label: 'SEO Optimization', description: 'Improve search engine optimization' },
      { value: 'readability', label: 'Readability', description: 'Make content easier to read' },
      { value: 'engagement', label: 'Engagement', description: 'Make content more compelling' }
    ]
  };

  res.json({
    success: true,
    message: 'AI content options retrieved successfully',
    data: options
  });
}));

export default router;