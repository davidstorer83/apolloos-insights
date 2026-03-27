import { useSalesPipelineData } from "@/hooks/useSalesPipelineData";
import { ArrowRight, Loader2 } from "lucide-react";

const SalesPipeline = () => {
  const pipeline = useSalesPipelineData();

  if (pipeline.loading) {
    return (
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-6 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-apollo-cyan" />
        <span className="text-sm text-muted-foreground">Loading pipeline...</span>
      </div>
    );
  }

  const steps = [
    { label: 'Booked',  value: pipeline.booked },
    { label: 'Showed',  value: pipeline.showed },
    { label: 'Offered', value: pipeline.offered },
    { label: 'Closed',  value: pipeline.closed },
  ];

  return (
    <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Sales Pipeline</h3>

      {/* Funnel visualization */}
      <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-[80px]">
              <span className="text-2xl md:text-3xl font-bold gradient-text">{step.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {step.value > 0 ? ((steps[i + 1].value / step.value) * 100).toFixed(0) : 0}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">No Shows</span>
          <span className="text-lg font-semibold text-foreground">
            {pipeline.noShows}{' '}
            <span className="text-xs text-danger">({pipeline.noShowRate}%)</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Offer Rate</span>
          <span className="text-lg font-semibold text-foreground">{pipeline.offerRate}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Contract Value</span>
          <span className="text-lg font-semibold text-foreground">
            {pipeline.totalContractValue > 0
              ? `$${(pipeline.totalContractValue / 1000).toFixed(0)}k`
              : '$0'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Cash Collected</span>
          <span className="text-lg font-semibold gradient-text">
            {pipeline.cashCollected > 0
              ? `$${(pipeline.cashCollected / 1000).toFixed(0)}k`
              : '$0'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalesPipeline;
