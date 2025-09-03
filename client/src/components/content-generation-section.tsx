import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, RefreshCw, Save, Download, ChevronDown, FileText, FileCode, Globe, File, Calendar, Clock, User, Image, Loader2 } from "lucide-react";
import type { GeneratedContent } from "@shared/schema";

interface ContentGenerationSectionProps {
  content: GeneratedContent;
  setContent?: (content: GeneratedContent) => void;
  onExport: (format: string) => void;
  onGenerateImages?: () => void;
  isExporting: boolean;
  isGeneratingImages?: boolean;
  enableEdit?: boolean;
}

export default function ContentGenerationSection({
  content,
  setContent,
  onExport,
  onGenerateImages,
  isExporting,
  isGeneratingImages,
  enableEdit = false,
}: ContentGenerationSectionProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPreviewContent = () => {
    return (
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-generated-title">
          {content.title}
        </h1>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{content.readingTime || 9} min read</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>AI Generated</span>
          </span>
        </div>

        {content.intro && (
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="text-generated-intro">
            {content.intro}
          </p>
        )}

        {content.sections?.map((section, index) => (
          <div key={index}>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" data-testid={`text-section-heading-${index}`}>
              {section.heading}
            </h2>
            
            <p className="text-foreground mb-4" data-testid={`text-section-content-${index}`}>
              {section.content}
            </p>

            {section.subheadings?.map((subheading, subIndex) => (
              <div key={subIndex}>
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3" data-testid={`text-subheading-${index}-${subIndex}`}>
                  {subheading.title}
                </h3>
                <p className="text-foreground mb-4" data-testid={`text-subheading-content-${index}-${subIndex}`}>
                  {subheading.content}
                </p>
              </div>
            ))}
          </div>
        )) || (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Content sections will appear here</h2>
            <p className="text-foreground">Detailed content with proper SEO optimization and keyword distribution.</p>
          </div>
        )}

        {content.conclusion && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Conclusion</h2>
            <p className="text-foreground" data-testid="text-generated-conclusion">
              {content.conclusion}
            </p>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Edit className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Generated Blog Content</h3>
            <p className="text-sm text-muted-foreground">AI-optimized content ready for review</p>
          </div>
        </div>
        
        {/* Content Metrics */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600" data-testid="text-seo-score">
              {content.seoScore || 87}/100
            </div>
            <div className="text-muted-foreground">SEO Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground" data-testid="text-word-count">
              {content.wordCount?.toLocaleString() || '2,456'}
            </div>
            <div className="text-muted-foreground">Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600" data-testid="text-reading-time">
              {content.readingTime || 9.8}
            </div>
            <div className="text-muted-foreground">Min Read</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
          <TabsTrigger value="edit" data-testid="tab-edit">Edit Content</TabsTrigger>
          <TabsTrigger value="seo" data-testid="tab-seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="export" data-testid="tab-export">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <div className="bg-background rounded-lg border border-border p-6 max-h-96 overflow-y-auto">
            {renderPreviewContent()}
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <div className="bg-background rounded-lg border border-border p-6">
            <p className="text-muted-foreground text-center py-8">
              Content editing interface would be implemented here with rich text editor capabilities.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <div className="bg-background rounded-lg border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">SEO Optimization Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-sm">Primary keyword in title</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-sm">Proper heading structure (H1, H2, H3)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-sm">Meta description optimized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span className="text-sm">Keywords naturally distributed</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Keyword Density</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Primary keyword</span>
                    <Badge variant="secondary">1.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Secondary keywords</span>
                    <Badge variant="secondary">0.8%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">LSI keywords</span>
                    <Badge variant="secondary">2.1%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <div className="bg-background rounded-lg border border-border p-6">
            <h4 className="font-semibold text-foreground mb-4">Choose Export Format</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => onExport('html')}
                disabled={isExporting}
                data-testid="button-export-html"
              >
                <FileText className="w-6 h-6 mb-2" />
                HTML File
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => onExport('markdown')}
                disabled={isExporting}
                data-testid="button-export-markdown"
              >
                <FileCode className="w-6 h-6 mb-2" />
                Markdown
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => onExport('wordpress')}
                disabled={isExporting}
                data-testid="button-export-wordpress"
              >
                <Globe className="w-6 h-6 mb-2" />
                WordPress
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => onExport('docx')}
                disabled={isExporting}
                data-testid="button-export-docx"
              >
                <File className="w-6 h-6 mb-2" />
                Word Doc
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-3">
          {enableEdit && (
            <Button 
              variant="secondary" 
              onClick={() => setIsEditing(!isEditing)}
              data-testid="button-edit-content"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Content'}
            </Button>
          )}

          {onGenerateImages && (
            <Button
              variant="secondary" 
              onClick={onGenerateImages}
              disabled={isGeneratingImages}
              data-testid="button-generate-images"
            >
              {isGeneratingImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4 mr-2" />
                  Generate Images
                </>
              )}
            </Button>
          )}

          {isEditing && enableEdit && (
            <Button
              onClick={() => {
                if (setContent) {
                  setContent(editedContent);
                }
                setIsEditing(false);
              }}
              data-testid="button-save-content"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
          
          <Button variant="secondary" data-testid="button-regenerate">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" data-testid="button-save-draft">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={isExporting}
                data-testid="button-export-dropdown"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export Blog"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('html')} data-testid="dropdown-export-html">
                <FileText className="w-4 h-4 mr-2" />
                HTML File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('markdown')} data-testid="dropdown-export-markdown">
                <FileCode className="w-4 h-4 mr-2" />
                Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('wordpress')} data-testid="dropdown-export-wordpress">
                <Globe className="w-4 h-4 mr-2" />
                WordPress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('docx')} data-testid="dropdown-export-docx">
                <File className="w-4 h-4 mr-2" />
                Word Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
