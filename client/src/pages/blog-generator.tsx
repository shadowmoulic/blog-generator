import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WorkflowSidebar from "@/components/workflow-sidebar";
import KeywordInputSection from "@/components/keyword-input-section";
import SerpAnalysisSection from "@/components/serp-analysis-section";
import SeoplanSection from "@/components/seo-plan-section";
import ContentGenerationSection from "@/components/content-generation-section";
import { Loader2 } from "lucide-react";
import type { SerpAnalysis, SeoOptimizationPlan, GeneratedContent, BlogProject, AIModelConfig, AIModel, GeneratedImage } from "@shared/schema";

export default function BlogGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    primaryKeyword: "",
    secondaryKeywords: [] as string[],
    targetAudience: "",
    contentLength: "",
    notes: "",
    aiModel: "gemini-2.5-flash" as AIModel,
  });
  const [serpAnalysis, setSerpAnalysis] = useState<SerpAnalysis | null>(null);
  const [seoplan, setSeoplan] = useState<SeoOptimizationPlan | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // SERP Analysis Mutation
  const serpAnalysisMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await apiRequest("POST", "/api/serp/analyze", { 
        keyword, 
        model: projectData.aiModel 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSerpAnalysis(data.analysis);
      setCurrentStep(2);
      toast({
        title: "SERP Analysis Complete",
        description: "Successfully analyzed top-ranking pages and content patterns.",
      });
    },
    onError: (error) => {
      toast({
        title: "SERP Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // SEO Plan Generation Mutation
  const seoplanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo/plan", {
        keyword: projectData.primaryKeyword,
        secondaryKeywords: projectData.secondaryKeywords,
        serpAnalysis,
        targetAudience: projectData.targetAudience,
        contentLength: projectData.contentLength,
        model: projectData.aiModel,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSeoplan(data);
      setCurrentStep(3);
      toast({
        title: "SEO Plan Generated",
        description: "Created optimization strategy based on SERP analysis.",
      });
    },
    onError: (error) => {
      toast({
        title: "SEO Plan Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Content Generation Mutation
  const contentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/content/generate", {
        keyword: projectData.primaryKeyword,
        secondaryKeywords: projectData.secondaryKeywords,
        seoplan,
        notes: projectData.notes,
        targetAudience: projectData.targetAudience,
        contentLength: projectData.contentLength,
        model: projectData.aiModel,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setCurrentStep(4);
      toast({
        title: "Content Generated",
        description: "Successfully created SEO-optimized blog content.",
      });
    },
    onError: (error) => {
      toast({
        title: "Content Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export Content Mutation
  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await apiRequest("POST", "/api/content/export", {
        content: generatedContent,
        format,
      });
      return response.blob();
    },
    onSuccess: (blob, format) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blog-post.${format === 'wordpress' ? 'html' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Complete",
        description: `Blog post exported as ${format.toUpperCase()} file.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-generate Mutation
  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auto-generate", {
        keyword: projectData.primaryKeyword,
        secondaryKeywords: projectData.secondaryKeywords,
        targetAudience: projectData.targetAudience,
        contentLength: projectData.contentLength,
        notes: projectData.notes,
        model: projectData.aiModel,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSerpAnalysis(data.serpAnalysis);
      setSeoplan(data.seoplan);
      setGeneratedContent(data.content);
      setGeneratedImages(data.images || []);
      setCurrentStep(5); // Go to final step with images
      setIsAutoGenerating(false);
      toast({
        title: "Blog Generated Successfully!",
        description: "Complete SEO-optimized blog with images ready.",
      });
    },
    onError: (error) => {
      setIsAutoGenerating(false);
      toast({
        title: "Auto-Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Image Generation Mutation
  const imageGenerationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/images/generate", {
        keyword: projectData.primaryKeyword,
        title: generatedContent?.title || projectData.primaryKeyword,
        sections: generatedContent?.sections || [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImages(data.images || []);
      setCurrentStep(5);
      toast({
        title: "Images Generated",
        description: "Blog images created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Image Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI Models Query
  const { data: aiModels = [] } = useQuery<AIModelConfig[]>({
    queryKey: ["/api/ai/models"],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Recent Projects Query
  const { data: recentProjects = [] } = useQuery<BlogProject[]>({
    queryKey: ["/api/projects"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleStartSerpAnalysis = () => {
    if (!projectData.primaryKeyword.trim()) {
      toast({
        title: "Primary Keyword Required",
        description: "Please enter a primary keyword to start SERP analysis.",
        variant: "destructive",
      });
      return;
    }
    serpAnalysisMutation.mutate(projectData.primaryKeyword);
  };

  const handleGenerateSeoplan = () => {
    if (!serpAnalysis) {
      toast({
        title: "SERP Analysis Required",
        description: "Please complete SERP analysis before generating SEO plan.",
        variant: "destructive",
      });
      return;
    }
    seoplanMutation.mutate();
  };

  const handleGenerateContent = () => {
    if (!seoplan) {
      toast({
        title: "SEO Plan Required",
        description: "Please generate SEO plan before creating content.",
        variant: "destructive",
      });
      return;
    }
    contentMutation.mutate();
  };

  const handleAutoGenerate = () => {
    if (!projectData.primaryKeyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a primary keyword to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsAutoGenerating(true);
    autoGenerateMutation.mutate();
  };

  const handleGenerateImages = () => {
    if (!generatedContent) {
      toast({
        title: "Content Required",
        description: "Generate content first before creating images.",
        variant: "destructive",
      });
      return;
    }
    
    imageGenerationMutation.mutate();
  };

  const handleExport = (format: string) => {
    if (!generatedContent) {
      toast({
        title: "No Content to Export",
        description: "Please generate content before exporting.",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate(format);
  };

  const isLoading = serpAnalysisMutation.isPending || seoplanMutation.isPending || contentMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-search text-primary-foreground text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground">SEO Blog Generator Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">APIs Connected</span>
              </div>
              
              <button className="inline-flex items-center px-3 py-2 border border-border rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <i className="fas fa-cog mr-2"></i>
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <WorkflowSidebar currentStep={currentStep} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Step 1: Keyword Input */}
            <KeywordInputSection
              projectData={projectData}
              setProjectData={setProjectData}
              aiModels={aiModels}
              onStartAnalysis={handleStartSerpAnalysis}
              onAutoGenerate={handleAutoGenerate}
              isLoading={serpAnalysisMutation.isPending}
              isAutoGenerating={isAutoGenerating || autoGenerateMutation.isPending}
            />

            {/* Step 2: SERP Analysis */}
            {serpAnalysis && (
              <SerpAnalysisSection
                analysis={serpAnalysis}
                keyword={projectData.primaryKeyword}
                onGeneratePlan={handleGenerateSeoplan}
                isLoading={seoplanMutation.isPending}
              />
            )}

            {/* Step 3: SEO Plan */}
            {seoplan && (
              <SeoplanSection
                plan={seoplan}
                onGenerateContent={handleGenerateContent}
                isLoading={contentMutation.isPending}
              />
            )}

            {/* Step 4: Generated Content */}
            {generatedContent && (
              <ContentGenerationSection
                content={generatedContent}
                setContent={setGeneratedContent}
                onExport={handleExport}
                onGenerateImages={handleGenerateImages}
                isExporting={exportMutation.isPending}
                isGeneratingImages={imageGenerationMutation.isPending}
                enableEdit={true}
              />
            )}

            {/* Step 5: Generated Images */}
            {generatedImages.length > 0 && (
              <div className="mb-8">
                <div className="bg-card text-card-foreground rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                        5
                      </div>
                      <h2 className="text-xl font-semibold">Generated Images</h2>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {generatedImages.length} images created
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="bg-muted rounded-lg p-4">
                        <img 
                          src={image.url} 
                          alt={image.prompt}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                          data-testid={`img-generated-${index}`}
                        />
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Prompt:</strong> {image.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {image.width} x {image.height}px
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Recent Projects</h3>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border border-border rounded-lg p-4 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-file-alt text-blue-600"></i>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="font-medium text-foreground mb-2">{project.primaryKeyword}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.wordCount ? `${project.wordCount} words` : 'Draft'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          project.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-muted-foreground hover:text-foreground">
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-foreground">
                            <i className="fas fa-download text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {serpAnalysisMutation.isPending && "Analyzing SERP Results"}
                {seoplanMutation.isPending && "Generating SEO Plan"}
                {contentMutation.isPending && "Creating Content"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {serpAnalysisMutation.isPending && "Fetching top-ranking pages and analyzing content patterns..."}
                {seoplanMutation.isPending && "Creating optimization strategy based on analysis..."}
                {contentMutation.isPending && "Generating SEO-optimized blog content using AI..."}
              </p>
              <p className="text-xs text-muted-foreground">This usually takes 30-60 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
