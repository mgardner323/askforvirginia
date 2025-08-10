import { GoogleGenerativeAI } from '@google/generative-ai';
import { credentialsService } from './CredentialsService';

interface BlogPostPrompt {
  topic: string;
  category: 'market-news' | 'buying-tips' | 'selling-tips' | 'lifestyle' | 'community';
  tone: 'professional' | 'friendly' | 'informative' | 'conversational';
  length: 'short' | 'medium' | 'long';
  keywords?: string[];
  targetAudience?: string;
  includeCallToAction?: boolean;
}

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  suggestedTags: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export class AIContentService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.initializeGemini();
  }

  private async initializeGemini(): Promise<void> {
    try {
      const geminiCredential = await credentialsService.getCredentialsByService('google_gemini');
      if (geminiCredential?.credentials?.api_key) {
        this.genAI = new GoogleGenerativeAI(geminiCredential.credentials.api_key);
        console.log('✅ Google Gemini AI initialized successfully');
      } else {
        console.log('⚠️ Google Gemini API key not found in credentials');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Gemini:', error);
    }
  }

  async generateBlogPost(prompt: BlogPostPrompt, researchData?: any): Promise<GeneratedContent> {
    if (!this.genAI) {
      await this.initializeGemini();
      if (!this.genAI) {
        throw new Error('Google Gemini API is not configured. Please add API key in credentials.');
      }
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = this.buildSystemPrompt(prompt, researchData);
    
    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeneratedContent(text, prompt);
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  async generateContentIdeas(category: string, count: number = 10): Promise<string[]> {
    if (!this.genAI) {
      await this.initializeGemini();
      if (!this.genAI) {
        throw new Error('Google Gemini API is not configured.');
      }
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate ${count} engaging blog post ideas for a Virginia real estate website in the "${category}" category. 

    Context: Virginia Hodges Real Estate serves Southern California markets including Los Angeles, Orange County, and surrounding areas. Focus on topics that would be valuable for home buyers, sellers, and real estate investors.

    Category context:
    - market-news: Real estate market trends, price updates, new developments, economic factors
    - buying-tips: First-time buyer guides, mortgage advice, inspection tips, negotiation strategies  
    - selling-tips: Home staging, pricing strategies, market timing, documentation
    - lifestyle: Community guides, local attractions, neighborhood spotlights, living in California
    - community: Local events, school districts, development projects, community resources

    Return exactly ${count} blog post ideas, one per line, without numbering or bullet points.
    Make each idea specific, actionable, and relevant to the Southern California real estate market.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, count);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      throw new Error('Failed to generate content ideas.');
    }
  }

  async improveContent(content: string, improvementType: 'seo' | 'readability' | 'engagement'): Promise<string> {
    if (!this.genAI) {
      await this.initializeGemini();
      if (!this.genAI) {
        throw new Error('Google Gemini API is not configured.');
      }
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompts = {
      seo: `Improve the SEO of this real estate blog content while maintaining its original meaning and structure. Add relevant keywords naturally, improve headers for better SEO structure, and enhance meta-friendly content. Keep the same tone and style.\n\nContent to improve:\n${content}`,
      
      readability: `Improve the readability of this real estate blog content. Break up long paragraphs, use shorter sentences where appropriate, add subheadings for better structure, and make complex concepts easier to understand. Keep all the original information.\n\nContent to improve:\n${content}`,
      
      engagement: `Make this real estate blog content more engaging and compelling. Add hooks, improve the opening, include more actionable advice, and make it more conversational while maintaining professionalism. Keep all original information.\n\nContent to improve:\n${content}`
    };

    try {
      const result = await model.generateContent(prompts[improvementType]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error improving content:', error);
      throw new Error('Failed to improve content.');
    }
  }

  private buildSystemPrompt(prompt: BlogPostPrompt, researchData?: any): string {
    const lengthGuide = {
      short: '300-500 words',
      medium: '600-1000 words', 
      long: '1200-2000 words'
    };

    const categoryContext = {
      'market-news': 'Focus on current real estate market trends, price changes, new developments, and economic factors affecting Southern California real estate.',
      'buying-tips': 'Provide actionable advice for home buyers, including mortgage tips, inspection guidance, negotiation strategies, and first-time buyer information.',
      'selling-tips': 'Share expert advice on home selling including staging tips, pricing strategies, market timing, and preparation checklists.',
      'lifestyle': 'Highlight Southern California lifestyle, community features, local attractions, and what makes living in the area special.',
      'community': 'Cover local community news, school districts, development projects, local events, and resources for residents.'
    };

    const keywordsSection = prompt.keywords && prompt.keywords.length > 0 
      ? `Focus keywords to include naturally: ${prompt.keywords.join(', ')}`
      : '';

    const targetAudienceSection = prompt.targetAudience 
      ? `Target audience: ${prompt.targetAudience}`
      : 'Target audience: Home buyers, sellers, and real estate investors in Southern California';

    const callToActionSection = prompt.includeCallToAction 
      ? 'Include a compelling call-to-action at the end encouraging readers to contact Virginia Hodges Real Estate for professional assistance.'
      : '';

    // Build research context if available
    let researchContext = '';
    if (researchData) {
      researchContext = this.buildResearchContext(researchData);
    }

    return `You are an expert real estate content writer for Virginia Hodges Real Estate, serving Southern California markets including Los Angeles, Orange County, and surrounding areas.

    Create a comprehensive blog post with the following specifications:
    
    Topic: ${prompt.topic}
    Category: ${prompt.category}
    Tone: ${prompt.tone}
    Length: ${lengthGuide[prompt.length]}
    ${keywordsSection}
    ${targetAudienceSection}
    
    Category focus: ${categoryContext[prompt.category]}
    
    ${researchContext}
    
    ${callToActionSection}

    IMPORTANT: Return your response in the following JSON format (ensure it's valid JSON):
    {
      "title": "Compelling blog post title (under 60 characters for SEO)",
      "excerpt": "Engaging excerpt summarizing the post (under 160 characters)",
      "content": "Full blog post content in HTML format with proper headings (h2, h3), paragraphs, and lists. Make it informative, well-structured, and professional.",
      "suggestedTags": ["array", "of", "relevant", "tags"],
      "seo": {
        "title": "SEO-optimized title (can be same as main title)",
        "description": "SEO meta description (under 160 characters)",
        "keywords": ["seo", "keyword", "array"]
      }
    }

    Make the content specific to Southern California real estate markets, include current market insights where relevant, and ensure all advice is practical and actionable. Use proper HTML formatting in the content field with headers, paragraphs, and lists for better readability.`;
  }

  private buildResearchContext(researchData: any): string {
    let context = '';
    
    if (researchData.researchSummary) {
      context += `\nCURRENT RESEARCH INSIGHTS:\n${researchData.researchSummary}\n`;
    }

    // Add market data context
    if (researchData.marketData) {
      const { interestRates, marketTrends, economicIndicators } = researchData.marketData;
      context += '\nCURRENT MARKET DATA:';
      
      if (interestRates?.thirtyYear) {
        context += `\n- Current 30-year mortgage rate: ${interestRates.thirtyYear}%`;
      }
      if (interestRates?.fifteenYear) {
        context += `\n- Current 15-year mortgage rate: ${interestRates.fifteenYear}%`;
      }
      if (marketTrends?.medianHomePrice) {
        context += `\n- Median home price: $${marketTrends.medianHomePrice.toLocaleString()}`;
      }
      if (marketTrends?.averageDaysOnMarket) {
        context += `\n- Average days on market: ${marketTrends.averageDaysOnMarket}`;
      }
      if (marketTrends?.priceChange) {
        const direction = marketTrends.priceChange > 0 ? 'increase' : 'decrease';
        context += `\n- Price change: ${Math.abs(marketTrends.priceChange)}% ${direction}`;
      }
    }

    // Add competitor insights
    if (researchData.competitorInsights) {
      const { topTopics, contentGaps, trendingKeywords } = researchData.competitorInsights;
      
      if (topTopics?.length > 0) {
        context += `\n\nTRENDING TOPICS IN REAL ESTATE CONTENT:\n${topTopics.join(', ')}`;
      }
      
      if (trendingKeywords?.length > 0) {
        context += `\n\nPOPULAR KEYWORDS TO CONSIDER:\n${trendingKeywords.join(', ')}`;
      }
      
      if (contentGaps?.length > 0) {
        context += `\n\nCONTENT GAPS TO POTENTIALLY ADDRESS:\n${contentGaps.join(', ')}`;
      }
    }

    // Add source articles context
    if (researchData.articles?.length > 0) {
      context += '\n\nRELEVANT RECENT ARTICLES FOR REFERENCE:';
      researchData.articles.slice(0, 3).forEach((article: any, index: number) => {
        context += `\n${index + 1}. "${article.title}" from ${article.source}`;
        if (article.content) {
          // Include first 200 characters of content for context
          const snippet = article.content.substring(0, 200).replace(/\n/g, ' ');
          context += `\n   Key insight: ${snippet}...`;
        }
      });
    }

    if (context) {
      context += '\n\nIMPORTANT: Use this research data to make your content current, accurate, and well-informed. Reference current market conditions and trends naturally within your content. Do not copy directly but use the insights to enhance your original analysis and advice.';
    }

    return context;
  }

  private parseGeneratedContent(text: string, prompt: BlogPostPrompt): GeneratedContent {
    try {
      // Clean the text - remove any markdown code blocks or extra formatting
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate required fields and provide defaults if needed
      const content: GeneratedContent = {
        title: parsed.title || `${prompt.topic}`,
        excerpt: parsed.excerpt || `Learn more about ${prompt.topic} in Southern California real estate.`,
        content: parsed.content || `<h2>${prompt.topic}</h2><p>Content about ${prompt.topic} will be generated here.</p>`,
        suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [prompt.category],
        seo: {
          title: parsed.seo?.title || parsed.title || `${prompt.topic}`,
          description: parsed.seo?.description || parsed.excerpt || `Learn more about ${prompt.topic}`,
          keywords: Array.isArray(parsed.seo?.keywords) ? parsed.seo.keywords : prompt.keywords || [prompt.topic]
        }
      };

      return content;
    } catch (error) {
      console.error('Error parsing generated content:', error);
      console.log('Raw response:', text);
      
      // Fallback content if parsing fails
      return {
        title: `${prompt.topic}`,
        excerpt: `Learn more about ${prompt.topic} in Southern California real estate.`,
        content: `<h2>${prompt.topic}</h2><p>I apologize, but there was an issue generating the content. Please try again or contact support.</p>`,
        suggestedTags: [prompt.category],
        seo: {
          title: `${prompt.topic}`,
          description: `Learn more about ${prompt.topic}`,
          keywords: prompt.keywords || [prompt.topic]
        }
      };
    }
  }

  async testConnection(): Promise<{ connected: boolean; model?: string; error?: string }> {
    try {
      if (!this.genAI) {
        await this.initializeGemini();
      }

      if (!this.genAI) {
        return { 
          connected: false, 
          error: 'API key not configured' 
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Test connection - respond with "Connected successfully"');
      const response = await result.response;
      const text = response.text();

      return {
        connected: true,
        model: 'gemini-1.5-flash'
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const aiContentService = new AIContentService();