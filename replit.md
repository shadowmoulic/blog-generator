# AI Blog Generator

## Overview

This is a full-stack AI-powered blog content generation platform built with React, Express, and PostgreSQL. The application uses SERP (Search Engine Results Page) analysis to understand competitive landscapes and generates SEO-optimized blog content using OpenAI's GPT models. It features a multi-step workflow that guides users through keyword research, competitor analysis, SEO planning, and content generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks for local state, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **Development Server**: Vite middleware integration for hot module replacement
- **Request Logging**: Custom middleware for API request/response logging

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Abstraction**: Interface-based storage layer with in-memory implementation for development

### Data Models
- **Users**: Basic user authentication schema
- **Blog Projects**: Central entity storing keyword data, analysis results, SEO plans, and generated content
- **SERP Results**: Cached search engine results with AI analysis for performance optimization

### AI Integration
- **Primary AI Service**: OpenAI GPT-5 for content generation and analysis
- **Content Generation**: Multi-step AI workflow including title optimization, outline creation, and full article generation
- **SEO Analysis**: AI-powered competitive analysis and optimization recommendations

## External Dependencies

### Core AI Services
- **OpenAI API**: Content generation, sentiment analysis, and SERP analysis using GPT-5 model
- **Serper.dev API**: Real-time Google search results data for competitive analysis

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **@neondatabase/serverless**: Optimized PostgreSQL driver for serverless environments

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon library for UI elements

### Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error handling

### Authentication & Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Session-based Authentication**: Server-side session management with PostgreSQL storage

### Utility Libraries
- **Axios**: HTTP client for external API requests
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Dynamic className generation
- **Zod**: Runtime type validation and schema definition