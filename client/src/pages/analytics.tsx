import Header from "@/components/header";

export default function Analytics() {
  return (
    <>
      <Header 
        title="Analytics" 
        subtitle="View detailed bot performance analytics"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <i className="fas fa-chart-line text-4xl text-muted-foreground mb-4"></i>
            <p className="text-lg font-medium text-card-foreground mb-2">Analytics Coming Soon</p>
            <p className="text-muted-foreground">
              Detailed analytics and reporting features will be available in a future update
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
