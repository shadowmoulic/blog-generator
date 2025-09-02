interface WorkflowSidebarProps {
  currentStep: number;
}

export default function WorkflowSidebar({ currentStep }: WorkflowSidebarProps) {
  const steps = [
    { number: 1, title: "Keyword Input", isActive: currentStep >= 1 },
    { number: 2, title: "SERP Analysis", isActive: currentStep >= 2 },
    { number: 3, title: "SEO Planning", isActive: currentStep >= 3 },
    { number: 4, title: "Content Generation", isActive: currentStep >= 4 },
    { number: 5, title: "Review & Export", isActive: currentStep >= 5 },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Workflow Steps</h2>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
              step.number === currentStep
                ? "bg-primary text-primary-foreground"
                : step.isActive
                ? "bg-muted text-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.number === currentStep
                  ? "bg-primary-foreground text-primary"
                  : step.isActive
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-border"
              }`}
            >
              <span className="text-xs font-medium">{step.number}</span>
            </div>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Blogs Generated</span>
            <span className="font-medium">247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords Analyzed</span>
            <span className="font-medium">1,832</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-medium text-green-600">94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
