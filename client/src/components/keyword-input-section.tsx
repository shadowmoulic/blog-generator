import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, Clock } from "lucide-react";
import { useState } from "react";

interface KeywordInputSectionProps {
  projectData: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    targetAudience: string;
    contentLength: string;
    notes: string;
  };
  setProjectData: (data: any) => void;
  onStartAnalysis: () => void;
  isLoading: boolean;
}

export default function KeywordInputSection({
  projectData,
  setProjectData,
  onStartAnalysis,
  isLoading,
}: KeywordInputSectionProps) {
  const [newSecondaryKeyword, setNewSecondaryKeyword] = useState("");

  const addSecondaryKeyword = () => {
    if (newSecondaryKeyword.trim() && !projectData.secondaryKeywords.includes(newSecondaryKeyword.trim())) {
      setProjectData({
        ...projectData,
        secondaryKeywords: [...projectData.secondaryKeywords, newSecondaryKeyword.trim()],
      });
      setNewSecondaryKeyword("");
    }
  };

  const removeSecondaryKeyword = (keywordToRemove: string) => {
    setProjectData({
      ...projectData,
      secondaryKeywords: projectData.secondaryKeywords.filter(k => k !== keywordToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSecondaryKeyword();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New SEO Blog</h2>
          <p className="text-muted-foreground mt-1">Enter your primary keyword and supporting information to get started</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated time: 5-8 minutes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="primary-keyword" className="text-sm font-medium text-foreground">
              Primary Keyword <span className="text-destructive">*</span>
            </Label>
            <Input
              id="primary-keyword"
              type="text"
              placeholder="e.g., best productivity apps 2025"
              value={projectData.primaryKeyword}
              onChange={(e) => setProjectData({ ...projectData, primaryKeyword: e.target.value })}
              className="mt-2"
              data-testid="input-primary-keyword"
            />
            <p className="text-xs text-muted-foreground mt-1">The main keyword you want to rank for</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">
              Secondary Keywords
            </Label>
            <div className="flex items-center space-x-2 mt-2 mb-2">
              <Input
                type="text"
                placeholder="Add secondary keyword..."
                value={newSecondaryKeyword}
                onChange={(e) => setNewSecondaryKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
                data-testid="input-secondary-keyword"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSecondaryKeyword}
                data-testid="button-add-secondary-keyword"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {projectData.secondaryKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {projectData.secondaryKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-sm">
                    {keyword}
                    <button
                      onClick={() => removeSecondaryKeyword(keyword)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      data-testid={`button-remove-keyword-${keyword}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">Related keywords to naturally include in content</p>
          </div>

          <div>
            <Label htmlFor="target-audience" className="text-sm font-medium text-foreground">
              Target Audience
            </Label>
            <Select value={projectData.targetAudience} onValueChange={(value) => setProjectData({ ...projectData, targetAudience: value })}>
              <SelectTrigger className="mt-2" data-testid="select-target-audience">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Business Professionals">Business Professionals</SelectItem>
                <SelectItem value="Small Business Owners">Small Business Owners</SelectItem>
                <SelectItem value="Students">Students</SelectItem>
                <SelectItem value="Entrepreneurs">Entrepreneurs</SelectItem>
                <SelectItem value="General Consumers">General Consumers</SelectItem>
                <SelectItem value="Technical Users">Technical Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content-length" className="text-sm font-medium text-foreground">
              Content Length
            </Label>
            <Select value={projectData.contentLength} onValueChange={(value) => setProjectData({ ...projectData, contentLength: value })}>
              <SelectTrigger className="mt-2" data-testid="select-content-length">
                <SelectValue placeholder="Select content length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Short (800-1,500 words)">Short (800-1,500 words)</SelectItem>
                <SelectItem value="Medium (1,500-2,500 words)">Medium (1,500-2,500 words)</SelectItem>
                <SelectItem value="Long (2,500-4,000 words)">Long (2,500-4,000 words)</SelectItem>
                <SelectItem value="Extra Long (4,000+ words)">Extra Long (4,000+ words)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            Additional Notes & Context
          </Label>
          <Textarea
            id="notes"
            rows={12}
            placeholder="Provide any additional context, specific points to cover, brand voice guidelines, or unique angles you want to emphasize in the blog post..."
            value={projectData.notes}
            onChange={(e) => setProjectData({ ...projectData, notes: e.target.value })}
            className="mt-2 resize-none"
            data-testid="textarea-notes"
          />
          <p className="text-xs text-muted-foreground mt-1">The more context you provide, the better the AI can tailor the content</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <i className="fas fa-info-circle"></i>
          <span>Using Serper.dev for SERP analysis & GPT-5 for content generation</span>
        </div>
        
        <Button
          onClick={onStartAnalysis}
          disabled={!projectData.primaryKeyword.trim() || isLoading}
          className="font-medium"
          data-testid="button-start-serp-analysis"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Analyzing..." : "Start SERP Analysis"}
        </Button>
      </div>
    </div>
  );
}
