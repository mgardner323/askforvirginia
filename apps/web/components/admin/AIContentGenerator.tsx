import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AIContentOptions {
  categories: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  tones: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  lengths: Array<{
    value: string;
    label: string;
    description: string;
  }>;
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
  researchSources?: Array<{
    title: string;
    url: string;
    source: string;
  }>;
  researchSummary?: string;
  marketData?: any;
  competitorInsights?: any;
}

interface AIContentGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void;
  onClose: () => void;
  initialCategory?: string;
}

export default function AIContentGenerator({ onContentGenerated, onClose, initialCategory }: AIContentGeneratorProps) {
  const [step, setStep] = useState<'prompt' | 'ideas' | 'generate' | 'result'>('prompt');
  const [options, setOptions] = useState<AIContentOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [prompt, setPrompt] = useState({
    topic: '',
    category: initialCategory || 'market-news',
    tone: 'professional',
    length: 'medium',
    keywords: [] as string[],
    targetAudience: '',
    includeCallToAction: true,
    enableResearch: true
  });
  
  const [keywordInput, setKeywordInput] = useState('');
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await fetch('/api/ai-content/options', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOptions(result.data);
      }
    } catch (error) {
      console.error('Error loading AI options:', error);
    }
  };

  const generateContentIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-content/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: prompt.category,
          count: 10
        })
      });

      if (response.ok) {
        const result = await response.json();
        setContentIdeas(result.data.ideas);
        setStep('ideas');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to generate content ideas');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError('Failed to generate content ideas');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (useIdea = false) => {
    setLoading(true);
    setError(null);
    setStep('generate');

    try {
      const topicToUse = useIdea && selectedIdea ? selectedIdea : prompt.topic;
      
      const response = await fetch('/api/ai-content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...prompt,
          topic: topicToUse
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedContent(result.data);
        setStep('result');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to generate content');
        setStep('prompt');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content');
      setStep('prompt');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !prompt.keywords.includes(keywordInput.trim())) {
      setPrompt(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setPrompt(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const useGeneratedContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      onClose();
    }
  };

  // Step 1: Prompt Configuration
  if (step === 'prompt') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">AI Content Generator</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic or Idea <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prompt.topic}
                onChange={(e) => setPrompt(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 'First-time home buyer tips for Los Angeles market'"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={prompt.category}
                  onChange={(e) => setPrompt(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {options?.categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={prompt.tone}
                  onChange={(e) => setPrompt(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {options?.tones.map(tone => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
              <select
                value={prompt.length}
                onChange={(e) => setPrompt(prev => ({ ...prev, length: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {options?.lengths.map(length => (
                  <option key={length.value} value={length.value}>{length.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (Optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {prompt.keywords.map(keyword => (
                  <span key={keyword} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add keyword..."
                />
                <button
                  onClick={addKeyword}
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience (Optional)</label>
              <input
                type="text"
                value={prompt.targetAudience}
                onChange={(e) => setPrompt(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 'First-time buyers in their 30s'"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeCallToAction"
                  checked={prompt.includeCallToAction}
                  onChange={(e) => setPrompt(prev => ({ ...prev, includeCallToAction: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="includeCallToAction" className="text-sm text-gray-700">
                  Include call-to-action for Virginia Hodges Real Estate
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableResearch"
                  checked={prompt.enableResearch}
                  onChange={(e) => setPrompt(prev => ({ ...prev, enableResearch: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="enableResearch" className="text-sm text-gray-700">
                  <span className="font-medium text-purple-700">🔍 Enable web research</span> - Get current market data, trends, and competitor insights
                </label>
              </div>
              
              {!prompt.enableResearch && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Content will be generated using AI knowledge only, without current market data or research
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={generateContentIdeas}
              disabled={loading || !prompt.category}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Get Ideas First
            </button>
            
            <button
              onClick={() => generateContent(false)}
              disabled={loading || !prompt.topic.trim()}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SparklesIcon className="h-4 w-4 mr-2" />
              )}
              Generate Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Content Ideas
  if (step === 'ideas') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Content Ideas</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Select an idea below or go back to enter your own topic:
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
            {contentIdeas.map((idea, index) => (
              <button
                key={index}
                onClick={() => setSelectedIdea(idea)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedIdea === idea
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{idea}</span>
                  {selectedIdea === idea && (
                    <CheckIcon className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('prompt')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Prompt
            </button>
            
            <button
              onClick={() => generateContent(true)}
              disabled={!selectedIdea}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate from Idea
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Generating
  if (step === 'generate') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-1/2 mx-auto p-6 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white transform -translate-y-1/2">
          <div className="text-center">
            <Cog6ToothIcon className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {prompt.enableResearch ? 'Researching & Generating Content...' : 'Generating Content...'}
            </h3>
            <p className="text-sm text-gray-600">
              {prompt.enableResearch 
                ? 'AI is researching current market data and trends, then creating your blog post. This may take a bit longer.'
                : 'AI is creating your blog post. This may take a few moments.'
              }
            </p>
            
            {prompt.enableResearch && (
              <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-3 rounded-lg">
                🔍 Current steps: Web research → Market data collection → Competitor analysis → Content generation
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Result
  if (step === 'result' && generatedContent) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CheckIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Generated Content</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Research Summary */}
            {generatedContent.researchSummary && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  🔍 Research Summary
                </h4>
                <p className="text-purple-800 text-sm">{generatedContent.researchSummary}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Title:</h4>
              <p className="text-gray-800">{generatedContent.title}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Excerpt:</h4>
              <p className="text-gray-800">{generatedContent.excerpt}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Suggested Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedContent.suggestedTags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Content Preview:</h4>
              <div 
                className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: generatedContent.content }}
              />
            </div>

            {/* Market Data */}
            {generatedContent.marketData && Object.keys(generatedContent.marketData).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📊 Market Data Used:</h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  {generatedContent.marketData.interestRates && (
                    <div>
                      <strong>Interest Rates:</strong>
                      {generatedContent.marketData.interestRates.thirtyYear && 
                        ` 30-year: ${generatedContent.marketData.interestRates.thirtyYear}%`}
                      {generatedContent.marketData.interestRates.fifteenYear && 
                        ` | 15-year: ${generatedContent.marketData.interestRates.fifteenYear}%`}
                    </div>
                  )}
                  {generatedContent.marketData.marketTrends?.medianHomePrice && (
                    <div>
                      <strong>Median Home Price:</strong> ${generatedContent.marketData.marketTrends.medianHomePrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Research Sources */}
            {generatedContent.researchSources && generatedContent.researchSources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📚 Research Sources:</h4>
                <div className="space-y-2">
                  {generatedContent.researchSources.map((source, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="font-medium text-sm">{source.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Source: {source.source} | <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Article</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">SEO Information:</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div><strong>SEO Title:</strong> {generatedContent.seo.title}</div>
                <div><strong>Meta Description:</strong> {generatedContent.seo.description}</div>
                <div>
                  <strong>Keywords:</strong> {generatedContent.seo.keywords.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setStep('prompt')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Generate Another
            </button>
            
            <button
              onClick={useGeneratedContent}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Use This Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}