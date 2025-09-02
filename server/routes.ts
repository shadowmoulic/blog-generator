import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBlogProjectSchema, insertSerpResultSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import { analyzeSERPWithAI, generateSEOPlan, generateBlogContent, AI_MODELS, type AIModel } from "./ai-services";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get available AI models
  app.get("/api/ai/models", async (req, res) => {
    try {
      res.json(AI_MODELS);
    } catch (error) {
      console.error('Get AI Models Error:', error);
      res.status(500).json({ 
        message: "Failed to get AI models",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // SERP Analysis endpoint
  app.post("/api/serp/analyze", async (req, res) => {
    try {
      const { keyword, model = 'gemini-2.5-flash' } = req.body;
      
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

      // Analyze SERP results using selected AI model
      const analysis = await analyzeSERPWithAI(keyword, serpData, model as AIModel);

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
      const { keyword, secondaryKeywords, serpAnalysis, targetAudience, contentLength, model = 'gemini-2.5-flash' } = req.body;

      const seoplan = await generateSEOPlan(
        keyword,
        secondaryKeywords,
        serpAnalysis,
        targetAudience,
        contentLength,
        model as AIModel
      );
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
      const { keyword, secondaryKeywords, seoplan, notes, targetAudience, contentLength, model = 'gemini-2.5-flash' } = req.body;

      const generatedContent = await generateBlogContent(
        keyword,
        secondaryKeywords,
        seoplan,
        notes,
        targetAudience,
        contentLength,
        model as AIModel
      );
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
