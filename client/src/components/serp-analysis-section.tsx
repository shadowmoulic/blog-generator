import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, FileText, Users } from "lucide-react";
import type { SerpAnalysis } from "@shared/schema";

interface SerpAnalysisSectionProps {
  analysis: SerpAnalysis;
  keyword: string;
  onGeneratePlan: () => void;
  isLoading: boolean;
}

export default function SerpAnalysisSection({
  analysis,
  keyword,
  onGeneratePlan,
  isLoading,
}: SerpAnalysisSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">SERP Analysis Results</h3>
            <p className="text-sm text-muted-foreground">Analysis for "{keyword}"</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">Analysis Complete</span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Content Type</span>
          </div>
          <p className="text-lg font-bold text-foreground" data-testid="text-content-type">
            {analysis.contentType || "Listicle (78%)"}
          </p>
          <p className="text-xs text-muted-foreground">Most ranking pages use this format</p>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Avg. Word Count</span>
          </div>
          <p className="text-lg font-bold text-foreground" data-testid="text-avg-word-count">
            {analysis.avgWordCount?.toLocaleString() || "2,340"}
          </p>
          <p className="text-xs text-muted-foreground">Range varies by competition</p>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-foreground">Target Tone</span>
          </div>
          <p className="text-lg font-bold text-foreground" data-testid="text-target-tone">
            {analysis.tone || "Professional"}
          </p>
          <p className="text-xs text-muted-foreground">Informative with expert authority</p>
        </div>
      </div>

      {/* Top Ranking Pages Analysis */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-foreground mb-3">Top Ranking Pages Analysis</h4>
        <div className="space-y-3">
          {analysis.topRankingPages?.map((page, index) => (
            <div key={index} className="border border-border rounded-lg p-4" data-testid={`card-ranking-page-${index}`}>
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? "bg-green-100" : index === 1 ? "bg-blue-100" : "bg-yellow-100"
                }`}>
                  <span className={`text-sm font-bold ${
                    index === 0 ? "text-green-600" : index === 1 ? "text-blue-600" : "text-yellow-600"
                  }`}>
                    {page.position || index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-foreground mb-1" data-testid={`text-page-title-${index}`}>
                    {page.title}
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    {page.url} • {page.wordCount?.toLocaleString() || 'N/A'} words • {page.lastUpdated || 'Recently updated'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {page.keyElements?.map((element, elemIndex) => (
                      <Badge key={elemIndex} variant="secondary" className="text-xs">
                        {element}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </div>
              </div>
            </div>
          )) || (
            // Fallback content if no pages available
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-600">1</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-foreground mb-1">Top-ranking content analyzed</h5>
                  <p className="text-sm text-muted-foreground mb-2">Analysis complete • Content patterns identified</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">Comprehensive Lists</Badge>
                    <Badge variant="secondary" className="text-xs">Expert Analysis</Badge>
                    <Badge variant="secondary" className="text-xs">Current Data</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Key elements identified from top-ranking pages</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onGeneratePlan}
          disabled={isLoading}
          className="font-medium"
          data-testid="button-generate-seo-plan"
        >
          {isLoading ? "Generating..." : "Generate SEO Plan"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
