import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// AI Model Configuration
export type AIModel = 'gpt-5' | 'gpt-4o' | 'gpt-4o-mini' | 'gemini-2.5-flash';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  description: string;
  costLevel: 'low' | 'medium' | 'high';
  provider: 'openai' | 'google';
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast and cost-effective Google AI model',
    costLevel: 'low',
    provider: 'google'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Lightweight OpenAI model for basic tasks',
    costLevel: 'low',
    provider: 'openai'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Balanced performance and cost OpenAI model',
    costLevel: 'medium',
    provider: 'openai'
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'Most advanced OpenAI model with superior quality',
    costLevel: 'high',
    provider: 'openai'
  }
];

// Initialize AI clients
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key" 
});

const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "default_key" 
});

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateWithAI(
  prompt: string,
  model: AIModel,
  systemPrompt?: string,
  responseFormat?: 'text' | 'json'
): Promise<AIResponse> {
  const modelConfig = AI_MODELS.find(m => m.id === model);
  
  if (!modelConfig) {
    throw new Error(`Unsupported AI model: ${model}`);
  }

  if (modelConfig.provider === 'google') {
    return generateWithGemini(prompt, model, systemPrompt, responseFormat);
  } else {
    return generateWithOpenAI(prompt, model, systemPrompt, responseFormat);
  }
}

async function generateWithOpenAI(
  prompt: string,
  model: AIModel,
  systemPrompt?: string,
  responseFormat?: 'text' | 'json'
): Promise<AIResponse> {
  const messages: any[] = [];
  
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt
    });
  }
  
  messages.push({
    role: "user",
    content: prompt
  });

  const requestConfig: any = {
    model: model,
    messages: messages,
  };

  if (responseFormat === 'json') {
    requestConfig.response_format = { type: "json_object" };
  }

  const response = await openai.chat.completions.create(requestConfig);

  return {
    content: response.choices[0].message.content || '',
    usage: response.usage ? {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    } : undefined
  };
}

async function generateWithGemini(
  prompt: string,
  model: AIModel,
  systemPrompt?: string,
  responseFormat?: 'text' | 'json'
): Promise<AIResponse> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  const requestConfig: any = {
    model: "gemini-2.5-flash",
    contents: fullPrompt,
  };

  if (responseFormat === 'json') {
    requestConfig.config = {
      responseMimeType: "application/json"
    };
  }

  const response = await gemini.models.generateContent(requestConfig);

  return {
    content: response.text || '',
    // Gemini doesn't provide detailed usage info in the same format
    usage: undefined
  };
}

export async function analyzeSERPWithAI(
  keyword: string,
  serpData: any,
  model: AIModel = 'gemini-2.5-flash'
): Promise<any> {
  const prompt = `
    Analyze these Google search results for the keyword "${keyword}" and provide a comprehensive SEO analysis.
    
    Search Results:
    ${JSON.stringify(serpData.organic?.slice(0, 10) || [], null, 2)}
    
    Please analyze and return a JSON object with the following structure:
    {
      "contentType": "Most common content type (e.g., 'Listicle (78%)', 'Guide', 'Comparison')",
      "avgWordCount": "Average word count as a number",
      "tone": "Dominant tone (e.g., 'Professional', 'Casual', 'Technical')",
      "topRankingPages": [
        {
          "position": 1,
          "title": "Page title",
          "url": "URL",
          "wordCount": 2847,
          "lastUpdated": "Jan 2025",
          "keyElements": ["Comprehensive Lists", "Expert Reviews", "Screenshots"],
          "description": "Key elements and unique aspects of this page"
        }
      ],
      "competitiveAdvantages": ["Include 2025-specific features", "Add pricing comparison table"],
      "recommendedStructure": ["Introduction (150-200 words)", "Main content sections"]
    }
  `;

  const systemPrompt = "You are an expert SEO analyst. Analyze search results and provide detailed insights for content optimization.";

  const response = await generateWithAI(prompt, model, systemPrompt, 'json');
  return JSON.parse(response.content);
}

export async function generateSEOPlan(
  keyword: string,
  secondaryKeywords: string[],
  serpAnalysis: any,
  targetAudience: string,
  contentLength: string,
  model: AIModel = 'gemini-2.5-flash'
): Promise<any> {
  const prompt = `
    Create a comprehensive SEO optimization plan for the keyword "${keyword}".
    
    Context:
    - Primary Keyword: ${keyword}
    - Secondary Keywords: ${secondaryKeywords?.join(', ') || 'None'}
    - Target Audience: ${targetAudience || 'General'}
    - Content Length: ${contentLength || 'Medium'}
    - SERP Analysis: ${JSON.stringify(serpAnalysis, null, 2)}
    
    Generate a detailed SEO plan in this JSON format:
    {
      "suggestedTitle": "SEO-optimized title with primary keyword",
      "titleLength": 58,
      "structure": {
        "intro": "Introduction section description",
        "methodology": "How we tested/research methodology section",
        "mainContent": "Main content sections breakdown",
        "comparison": "Comparison/table section",
        "conclusion": "Conclusion section"
      },
      "keywordDistribution": {
        "primary": {
          "target": 10,
          "placement": ["Title", "H1", "2x H2s", "naturally in content"]
        },
        "secondary": {
          "target": 5,
          "placement": ["H2s", "H3s", "body content"]
        },
        "lsi": {
          "target": 18,
          "placement": ["throughout content", "subheadings"]
        }
      },
      "competitiveAdvantages": ["2025-specific updates", "pricing comparison", "expert testing"]
    }
  `;

  const systemPrompt = "You are an expert SEO strategist. Create detailed optimization plans based on SERP analysis and keyword research.";

  const response = await generateWithAI(prompt, model, systemPrompt, 'json');
  return JSON.parse(response.content);
}

export async function generateBlogContent(
  keyword: string,
  secondaryKeywords: string[],
  seoplan: any,
  notes: string,
  targetAudience: string,
  contentLength: string,
  model: AIModel = 'gemini-2.5-flash'
): Promise<any> {
  const lengthGuide = {
    'Short (800-1,500 words)': '1200 words',
    'Medium (1,500-2,500 words)': '2000 words',
    'Long (2,500-4,000 words)': '3200 words',
    'Extra Long (4,000+ words)': '4500 words'
  };

  const targetWords = lengthGuide[contentLength as keyof typeof lengthGuide] || '2000 words';

  const prompt = `
    Write a comprehensive, SEO-optimized blog post about "${keyword}".
    
    Requirements:
    - Target length: ${targetWords}
    - Primary keyword: ${keyword}
    - Secondary keywords: ${secondaryKeywords?.join(', ') || 'None'}
    - Target audience: ${targetAudience || 'General'}
    - Additional context: ${notes || 'None'}
    
    SEO Plan to follow:
    ${JSON.stringify(seoplan, null, 2)}
    
    Create engaging, high-quality content that:
    1. Uses the suggested title from the SEO plan
    2. Naturally incorporates keywords as specified in the distribution plan
    3. Follows the recommended structure
    4. Includes the competitive advantages
    5. Provides genuine value to readers
    6. Maintains professional, authoritative tone
    7. Uses current information and 2025 context where relevant
    
    Return in this JSON format:
    {
      "title": "The exact title from SEO plan",
      "metaDescription": "SEO-optimized meta description (150-160 chars)",
      "intro": "Engaging introduction paragraph",
      "sections": [
        {
          "heading": "H2 section heading",
          "content": "Detailed section content",
          "subheadings": [
            {
              "title": "H3 subheading",
              "content": "Subheading content"
            }
          ]
        }
      ],
      "conclusion": "Strong conclusion paragraph",
      "wordCount": 2456,
      "seoScore": 87,
      "readingTime": 10
    }
  `;

  const systemPrompt = "You are an expert content writer specializing in SEO-optimized blog posts. Create engaging, informative content that ranks well and provides genuine value to readers.";

  const response = await generateWithAI(prompt, model, systemPrompt, 'json');
  return JSON.parse(response.content);
}