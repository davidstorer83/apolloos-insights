import { salesPipeline } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

const steps = [
  { key: "booked", label: "Booked", value: salesPipeline.booked.value },
  { key: "showed", label: "Showed", value: salesPipeline.completed.value },
  { key: "offered", label: "Offered", value: salesPipeline.offered.value },
  { key: "closed", label: "Closed", value: salesPipeline.closed.value },
];

const SalesPipeline = () => {
  return (
    <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Sales Pipeline</h3>

      {/* Funnel visualization */}
      <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-[80px]">
              <span className="text-2xl md:text-3xl font-bold gradient-text">{step.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {((steps[i + 1].value / step.value) * 100).toFixed(0)}%
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
          <span className="text-lg font-semibold text-foreground">{salesPipeline.noShows.value} <span className="text-xs text-danger">({salesPipeline.noShows.rate}%)</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Offer Rate</span>
          <span className="text-lg font-semibold text-foreground">{salesPipeline.offered.rate}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Contract Value</span>
          <span className="text-lg font-semibold text-foreground">${(salesPipeline.totalContract.value / 1000).toFixed(0)}k</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Cash Collected</span>
          <span className="text-lg font-semibold gradient-text">${(salesPipeline.cashCollected.value / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  );
};

export default SalesPipeline;
