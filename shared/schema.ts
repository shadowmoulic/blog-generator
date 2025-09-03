import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const blogProjects = pgTable("blog_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  primaryKeyword: text("primary_keyword").notNull(),
  secondaryKeywords: text("secondary_keywords").array(),
  targetAudience: text("target_audience"),
  contentLength: text("content_length"),
  notes: text("notes"),
  serpAnalysis: jsonb("serp_analysis"),
  seoplan: jsonb("seo_plan"),
  generatedContent: jsonb("generated_content"),
  status: text("status").notNull().default("draft"), // draft, published, archived
  wordCount: integer("word_count"),
  seoScore: integer("seo_score"),
  readingTime: integer("reading_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serpResults = pgTable("serp_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  results: jsonb("results").notNull(),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBlogProjectSchema = createInsertSchema(blogProjects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSerpResultSchema = createInsertSchema(serpResults).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BlogProject = typeof blogProjects.$inferSelect;
export type InsertBlogProject = z.infer<typeof insertBlogProjectSchema>;
export type SerpResult = typeof serpResults.$inferSelect;
export type InsertSerpResult = z.infer<typeof insertSerpResultSchema>;

// AI Model types
export type AIModel = 'gpt-5' | 'gpt-4o' | 'gpt-4o-mini' | 'gemini-2.5-flash';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  description: string;
  costLevel: 'low' | 'medium' | 'high';
  provider: 'openai' | 'google';
}

// Image types
export interface GeneratedImage {
  url: string;
  prompt: string;
  width: number;
  height: number;
}

// Additional types for API responses
export type SerpAnalysis = {
  contentType: string;
  avgWordCount: number;
  tone: string;
  topRankingPages: Array<{
    position: number;
    title: string;
    url: string;
    wordCount: number;
    lastUpdated: string;
    keyElements: string[];
    description: string;
  }>;
  competitiveAdvantages: string[];
  recommendedStructure: string[];
};

export type SeoOptimizationPlan = {
  suggestedTitle: string;
  titleLength: number;
  structure: {
    intro: string;
    methodology: string;
    mainContent: string;
    comparison: string;
    conclusion: string;
  };
  keywordDistribution: {
    primary: { target: number; placement: string[] };
    secondary: { target: number; placement: string[] };
    lsi: { target: number; placement: string[] };
  };
  competitiveAdvantages: string[];
};

export type GeneratedContent = {
  title: string;
  metaDescription: string;
  intro: string;
  sections: Array<{
    heading: string;
    content: string;
    subheadings?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  conclusion: string;
  wordCount: number;
  seoScore: number;
  readingTime: number;
};
