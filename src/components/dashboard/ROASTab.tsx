import { Loader2 } from 'lucide-react';
import KPICard from './KPICard';
import CampaignTable from './CampaignTable';
import UnitEconomics from './UnitEconomics';
import { useROASData } from '@/hooks/useROASData';

interface ROASTabProps {
  startDate?: string | null;
}

const ROASTab = ({ startDate }: ROASTabProps) => {
  const r = useROASData(startDate);

  if (r.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-apollo-cyan" />
        <span className="ml-2 text-muted-foreground text-sm">Loading ROAS data...</span>
      </div>
    );
  }

  if (r.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Failed to load ROAS data: {r.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Ad Spend"
          value={r.totalAdSpend}
          prefix="$"
        />
        <KPICard
          label="Cost Per Lead"
          value={r.costPerLead > 0 ? `$${r.costPerLead.toLocaleString()}` : '—'}
        />
        <KPICard
          label="Cost Per Booking"
          value={r.costPerBooking > 0 ? `$${r.costPerBooking.toLocaleString()}` : '—'}
        />
        {/* ROAS — green value */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 flex flex-col gap-2 hover:border-primary/30 transition-colors">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ROAS</span>
          <span className="text-2xl md:text-3xl font-semibold text-apollo-green">
            {r.overallROAS > 0 ? `${r.overallROAS}x` : '—'}
          </span>
        </div>
      </div>

      {/* 2. Campaign Breakdown */}
      <CampaignTable campaigns={r.campaigns} />

      {/* 3. Unit Economics */}
      <UnitEconomics
        totalAdSpend={r.totalAdSpend}
        totalLeads={r.totalLeads}
        totalBooked={r.totalBooked}
        totalRevenue={r.totalRevenue}
        costPerBooking={r.costPerBooking}
        unitEconomics={r.unitEconomics}
        hasSales={r.totalBooked > 0}
      />

      {/* 4. N8N Note Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm">
        ROAS tab requires ad_metrics data. Build N8N #5 (Meta Ads Daily Pull) to populate.
      </div>
    </div>
  );
};

export default ROASTab;
