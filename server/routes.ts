import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBlogProjectSchema, insertSerpResultSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // SERP Analysis endpoint
  app.post("/api/serp/analyze", async (req, res) => {
    try {
      const { keyword } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }

      // Check for cached SERP result
      const cached = await storage.getSerpResult(keyword);
      if (cached && cached.createdAt && new Date().getTime() - cached.createdAt.getTime() < 24 * 60 * 60 * 1000) {
        return res.json(cached);
      }

      // Fetch SERP data from Serper.dev
      const serperApiKey = process.env.SERPER_API_KEY || process.env.SERPER_KEY || "default_key";
      
      const serpResponse = await axios.post('https://google.serper.dev/search', {
        q: keyword,
        num: 10
      }, {
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json'
        }
      });

      const serpData = serpResponse.data;

      // Analyze SERP results using OpenAI
      const analysisPrompt = `
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

      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert SEO analyst. Analyze search results and provide detailed insights for content optimization."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');

      // Save SERP result
      const serpResult = await storage.createSerpResult({
        keyword,
        results: serpData,
        analysis
      });

      res.json(serpResult);

    } catch (error) {
      console.error('SERP Analysis Error:', error);
      res.status(500).json({ 
        message: "Failed to analyze SERP results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate SEO Plan endpoint
  app.post("/api/seo/plan", async (req, res) => {
    try {
      const { keyword, secondaryKeywords, serpAnalysis, targetAudience, contentLength } = req.body;

      const planPrompt = `
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

      const planResponse = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert SEO strategist. Create detailed optimization plans based on SERP analysis and keyword research."
          },
          {
            role: "user",
            content: planPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const seoplan = JSON.parse(planResponse.choices[0].message.content || '{}');
      res.json(seoplan);

    } catch (error) {
      console.error('SEO Plan Generation Error:', error);
      res.status(500).json({ 
        message: "Failed to generate SEO plan",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Content endpoint
  app.post("/api/content/generate", async (req, res) => {
    try {
      const { keyword, secondaryKeywords, seoplan, notes, targetAudience, contentLength } = req.body;

      const lengthGuide = {
        'Short (800-1,500 words)': '1200 words',
        'Medium (1,500-2,500 words)': '2000 words',
        'Long (2,500-4,000 words)': '3200 words',
        'Extra Long (4,000+ words)': '4500 words'
      };

      const targetWords = lengthGuide[contentLength as keyof typeof lengthGuide] || '2000 words';

      const contentPrompt = `
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

      const contentResponse = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert content writer specializing in SEO-optimized blog posts. Create engaging, informative content that ranks well and provides genuine value to readers."
          },
          {
            role: "user",
            content: contentPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const generatedContent = JSON.parse(contentResponse.choices[0].message.content || '{}');
      res.json(generatedContent);

    } catch (error) {
      console.error('Content Generation Error:', error);
      res.status(500).json({ 
        message: "Failed to generate content",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Blog Projects CRUD
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertBlogProjectSchema.parse(req.body);
      const project = await storage.createBlogProject(projectData);
      res.json(project);
    } catch (error) {
      console.error('Create Project Error:', error);
      res.status(400).json({ 
        message: "Invalid project data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      // For demo purposes, get all projects (in real app, filter by user)
      const projects = await storage.getBlogProjectsByUser("demo");
      res.json(projects);
    } catch (error) {
      console.error('Get Projects Error:', error);
      res.status(500).json({ 
        message: "Failed to fetch projects",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getBlogProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Get Project Error:', error);
      res.status(500).json({ 
        message: "Failed to fetch project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateBlogProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Update Project Error:', error);
      res.status(500).json({ 
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteBlogProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error('Delete Project Error:', error);
      res.status(500).json({ 
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Export content endpoint
  app.post("/api/content/export", async (req, res) => {
    try {
      const { content, format } = req.body;
      
      let exportContent = '';
      let mimeType = 'text/plain';
      let filename = 'blog-post';

      switch (format) {
        case 'html':
          exportContent = generateHTMLExport(content);
          mimeType = 'text/html';
          filename += '.html';
          break;
        case 'markdown':
          exportContent = generateMarkdownExport(content);
          mimeType = 'text/markdown';
          filename += '.md';
          break;
        case 'wordpress':
          exportContent = generateWordPressExport(content);
          mimeType = 'text/html';
          filename += '-wordpress.html';
          break;
        default:
          exportContent = generateTextExport(content);
          filename += '.txt';
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportContent);

    } catch (error) {
      console.error('Export Error:', error);
      res.status(500).json({ 
        message: "Failed to export content",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Export helper functions
function generateHTMLExport(content: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${content.metaDescription || ''}">
    <title>${content.title || 'Blog Post'}</title>
</head>
<body>
    <article>
        <h1>${content.title || 'Blog Post'}</h1>
        <p>${content.intro || ''}</p>
        ${content.sections?.map((section: any) => `
            <h2>${section.heading}</h2>
            <p>${section.content}</p>
            ${section.subheadings?.map((sub: any) => `
                <h3>${sub.title}</h3>
                <p>${sub.content}</p>
            `).join('') || ''}
        `).join('') || ''}
        <p>${content.conclusion || ''}</p>
    </article>
</body>
</html>`;
}

function generateMarkdownExport(content: any): string {
  return `# ${content.title || 'Blog Post'}

${content.intro || ''}

${content.sections?.map((section: any) => `
## ${section.heading}

${section.content}

${section.subheadings?.map((sub: any) => `
### ${sub.title}

${sub.content}
`).join('') || ''}
`).join('') || ''}

${content.conclusion || ''}`;
}

function generateWordPressExport(content: any): string {
  return `<!-- wp:heading {"level":1} -->
<h1>${content.title || 'Blog Post'}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${content.intro || ''}</p>
<!-- /wp:paragraph -->

${content.sections?.map((section: any) => `
<!-- wp:heading -->
<h2>${section.heading}</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${section.content}</p>
<!-- /wp:paragraph -->

${section.subheadings?.map((sub: any) => `
<!-- wp:heading {"level":3} -->
<h3>${sub.title}</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${sub.content}</p>
<!-- /wp:paragraph -->
`).join('') || ''}
`).join('') || ''}

<!-- wp:paragraph -->
<p>${content.conclusion || ''}</p>
<!-- /wp:paragraph -->`;
}

function generateTextExport(content: any): string {
  return `${content.title || 'Blog Post'}

${content.intro || ''}

${content.sections?.map((section: any) => `
${section.heading}

${section.content}

${section.subheadings?.map((sub: any) => `
${sub.title}

${sub.content}
`).join('') || ''}
`).join('') || ''}

${content.conclusion || ''}`;
}
