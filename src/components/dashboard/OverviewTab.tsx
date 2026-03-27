import KPICard from "./KPICard";
import { useOverviewData } from "@/hooks/useOverviewData";
import { Loader2 } from "lucide-react";

interface OverviewTabProps {
  source?: string;
}

const OverviewTab = ({ source }: OverviewTabProps) => {
  const overview = useOverviewData(source);

  if (overview.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-apollo-cyan" />
        <span className="ml-2 text-muted-foreground text-sm">Loading overview data...</span>
      </div>
    );
  }

  if (overview.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Failed to load overview data: {overview.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Leads"
          value={overview.totalLeads}
          change={overview.changeLeads}
          sparkData={overview.sparkLeads}
        />
        <KPICard
          label="Total Bookings"
          value={overview.totalBookings}
          change={overview.changeBookings}
          sparkData={overview.sparkBookings}
        />
        <KPICard
          label="Lead to Booking %"
          value={overview.leadToBookingPct}
          suffix="%"
          change={overview.changeLeadToBooking}
        />
        <KPICard
          label="Cost Per Booking"
          value={overview.costPerBooking}
          prefix="$"
          change={overview.changeCostPerBooking}
        />
      </div>

      {/* System Comparison */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">System Comparison</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Text-First */}
          <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-apollo-cyan" />
              <span className="text-sm font-semibold text-foreground">Text-First System</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Leads</span>
                <p className="text-2xl font-semibold text-foreground mt-1">{overview.textFirst.leads.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Bookings</span>
                <p className="text-2xl font-semibold text-foreground mt-1">{overview.textFirst.bookings.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Booking Rate</span>
                <p className="text-2xl font-semibold text-apollo-cyan mt-1">{overview.textFirst.bookingRate}%</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Msgs to Book</span>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {overview.textFirst.avgToBook > 0 ? overview.textFirst.avgToBook : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Voice-First */}
          <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-apollo-green" />
              <span className="text-sm font-semibold text-foreground">Voice-First System</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Leads</span>
                <p className="text-2xl font-semibold text-foreground mt-1">{overview.voiceFirst.leads.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Bookings</span>
                <p className="text-2xl font-semibold text-foreground mt-1">{overview.voiceFirst.bookings.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Booking Rate</span>
                <p className="text-2xl font-semibold text-apollo-green mt-1">{overview.voiceFirst.bookingRate}%</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Calls to Book</span>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {overview.voiceFirst.avgToBook > 0 ? overview.voiceFirst.avgToBook : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Funnel */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">Combined Funnel</h3>
        <div className="space-y-3">
          {overview.funnel.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{step.label}</span>
              <div className="flex-1 bg-muted/30 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-apollo-cyan to-apollo-green transition-all duration-500"
                  style={{ width: `${Math.max(step.pct, step.count > 0 ? 1 : 0)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-14 text-right shrink-0">
                {step.count.toLocaleString()}
              </span>
              <span className="text-xs text-apollo-cyan w-10 text-right shrink-0">
                {step.pct}%
              </span>
              {i < overview.funnel.length - 1 && step.count > 0 && overview.funnel[i + 1].count > 0 && (
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                  → {Math.round((overview.funnel[i + 1].count / step.count) * 100)}% conv
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
