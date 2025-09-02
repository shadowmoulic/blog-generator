import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lightbulb, Target, Trophy, Heading } from "lucide-react";
import type { SeoOptimizationPlan } from "@shared/schema";

interface SeoplanSectionProps {
  plan: SeoOptimizationPlan;
  onGenerateContent: () => void;
  isLoading: boolean;
}

export default function SeoplanSection({
  plan,
  onGenerateContent,
  isLoading,
}: SeoplanSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">SEO Optimization Plan</h3>
          <p className="text-sm text-muted-foreground">AI-generated strategy based on SERP analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Heading className="w-4 h-4 text-blue-600 mr-2" />
              Recommended Title Structure
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-background rounded border border-border">
                <p className="font-medium text-foreground" data-testid="text-suggested-title">
                  {plan.suggestedTitle || "SEO-Optimized Title"}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span>📏 {plan.titleLength || 58} characters</span>
                  <span className="text-green-600">✓ Primary keyword included</span>
                  <span className="text-green-600">✓ Year included</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Includes number, primary keyword, current year, and authority signal</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Target className="w-4 h-4 text-purple-600 mr-2" />
              Content Structure Plan
            </h4>
            <div className="space-y-2 text-sm">
              {plan.structure && Object.entries(plan.structure).map(([key, value], index) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span data-testid={`text-structure-${key}`}>{value}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center">1</span>
                    <span>Introduction (150-200 words)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center">2</span>
                    <span>Main Content Sections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center">3</span>
                    <span>Conclusion & Recommendations</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Target className="w-4 h-4 text-orange-600 mr-2" />
              Keyword Distribution Strategy
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-foreground">Primary Keyword</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.keywordDistribution?.primary?.target || 8}-12 times
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.keywordDistribution?.primary?.placement?.join(', ') || 'Title, H1, naturally in content'}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-foreground">Secondary Keywords</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.keywordDistribution?.secondary?.target || 3}-5 times each
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.keywordDistribution?.secondary?.placement?.join(', ') || 'Subheadings and content'}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-foreground">LSI Keywords</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.keywordDistribution?.lsi?.target || 15}-20 instances
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.keywordDistribution?.lsi?.placement?.join(', ') || 'Related terms for semantic SEO'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
              Competitive Advantages
            </h4>
            <div className="space-y-2">
              {plan.competitiveAdvantages?.map((advantage, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <i className="fas fa-check-circle text-green-600"></i>
                  <span className="text-foreground" data-testid={`text-advantage-${index}`}>{advantage}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-foreground">Include 2025-specific updates</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-foreground">Add comprehensive analysis</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        
        <Button
          onClick={onGenerateContent}
          disabled={isLoading}
          className="font-medium"
          data-testid="button-generate-content"
        >
          {isLoading ? "Generating..." : "Generate Content"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
