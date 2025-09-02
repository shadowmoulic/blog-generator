import { type User, type InsertUser, type BlogProject, type InsertBlogProject, type SerpResult, type InsertSerpResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog Projects
  createBlogProject(project: InsertBlogProject): Promise<BlogProject>;
  getBlogProject(id: string): Promise<BlogProject | undefined>;
  updateBlogProject(id: string, updates: Partial<BlogProject>): Promise<BlogProject | undefined>;
  getBlogProjectsByUser(userId: string): Promise<BlogProject[]>;
  deleteBlogProject(id: string): Promise<boolean>;
  
  // SERP Results
  createSerpResult(result: InsertSerpResult): Promise<SerpResult>;
  getSerpResult(keyword: string): Promise<SerpResult | undefined>;
  getSerpResultsByKeyword(keyword: string): Promise<SerpResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blogProjects: Map<string, BlogProject>;
  private serpResults: Map<string, SerpResult>;

  constructor() {
    this.users = new Map();
    this.blogProjects = new Map();
    this.serpResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBlogProject(insertProject: InsertBlogProject): Promise<BlogProject> {
    const id = randomUUID();
    const now = new Date();
    const project: BlogProject = {
      ...insertProject,
      id,
      userId: null, // For demo purposes, no user association
      status: insertProject.status || "draft",
      targetAudience: insertProject.targetAudience || null,
      contentLength: insertProject.contentLength || null,
      notes: insertProject.notes || null,
      secondaryKeywords: insertProject.secondaryKeywords || null,
      serpAnalysis: insertProject.serpAnalysis || null,
      seoplan: insertProject.seoplan || null,
      generatedContent: insertProject.generatedContent || null,
      wordCount: insertProject.wordCount || null,
      seoScore: insertProject.seoScore || null,
      readingTime: insertProject.readingTime || null,
      createdAt: now,
      updatedAt: now,
    };
    this.blogProjects.set(id, project);
    return project;
  }

  async getBlogProject(id: string): Promise<BlogProject | undefined> {
    return this.blogProjects.get(id);
  }

  async updateBlogProject(id: string, updates: Partial<BlogProject>): Promise<BlogProject | undefined> {
    const existing = this.blogProjects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.blogProjects.set(id, updated);
    return updated;
  }

  async getBlogProjectsByUser(userId: string): Promise<BlogProject[]> {
    return Array.from(this.blogProjects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async deleteBlogProject(id: string): Promise<boolean> {
    return this.blogProjects.delete(id);
  }

  async createSerpResult(insertResult: InsertSerpResult): Promise<SerpResult> {
    const id = randomUUID();
    const result: SerpResult = {
      ...insertResult,
      id,
      analysis: insertResult.analysis || null,
      createdAt: new Date(),
    };
    this.serpResults.set(id, result);
    return result;
  }

  async getSerpResult(keyword: string): Promise<SerpResult | undefined> {
    return Array.from(this.serpResults.values()).find(
      result => result.keyword.toLowerCase() === keyword.toLowerCase()
    );
  }

  async getSerpResultsByKeyword(keyword: string): Promise<SerpResult[]> {
    return Array.from(this.serpResults.values())
      .filter(result => result.keyword.toLowerCase().includes(keyword.toLowerCase()))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
