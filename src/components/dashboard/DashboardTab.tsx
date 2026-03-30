import { Loader2 } from 'lucide-react';
import KPICard from './KPICard';
import FunnelSection from './FunnelSection';
import EngagementCards from './EngagementCards';
import VoicePerformance from './VoicePerformance';
import SMSPerformance from './SMSPerformance';
import SalesPipeline from './SalesPipeline';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardTabProps {
  startDate?: string | null;
}

const DashboardTab = ({ startDate }: DashboardTabProps) => {
  const d = useDashboardData(startDate);

  if (d.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-apollo-cyan" />
        <span className="ml-2 text-muted-foreground text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (d.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Failed to load dashboard data: {d.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Leads"
          value={d.totalLeads}
          change={d.changeLeads}
          sparkData={d.sparkLeads}
        />
        <KPICard
          label="Response Rate"
          value={d.responseRate}
          suffix="%"
          subLabel={d.avgTouches > 0 ? `Avg ${d.avgTouches} touches` : undefined}
        />
        <KPICard
          label="CTA → Booked %"
          value={d.ctaToBookedPct}
          suffix="%"
        />
        <KPICard
          label="Lead → Booked %"
          value={d.leadToBookedPct}
          suffix="%"
          subLabel={`${d.totalBooked} bookings`}
        />
      </div>

      {/* 2. Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Call Answer Rate"
          value={d.callAnswerRate}
          suffix="%"
        />
        <KPICard
          label="Avg Call Duration"
          value={d.avgCallDuration}
        />
        {/* Active Sequence — amber value */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 flex flex-col gap-2 hover:border-primary/30 transition-colors">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">In Active Sequence</span>
          <span className="text-2xl md:text-3xl font-semibold text-amber-400">
            {d.activeSequenceCount.toLocaleString()}
          </span>
        </div>
        {/* Cost Per Booking — shows $0 until ad_metrics populated */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 flex flex-col gap-2 hover:border-primary/30 transition-colors">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Cost Per Booking</span>
          <span className="text-2xl md:text-3xl font-semibold text-foreground">
            ${d.costPerBooking.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Apollo v3 Funnel */}
      <FunnelSection funnel={d.funnel} dropOffs={d.dropOffs} />

      {/* 4. Engagement Deep Dive */}
      <EngagementCards
        responseRate={d.responseRate}
        ctaToBookedPct={d.ctaToBookedPct}
        leadToBookedPct={d.leadToBookedPct}
        avgTouches={d.avgTouches}
        responseRateSubMetrics={d.responseRateSubMetrics}
        ctaToBookedSubMetrics={d.ctaToBookedSubMetrics}
        leadToBookedSubMetrics={d.leadToBookedSubMetrics}
      />

      {/* 5. Voice Performance */}
      <VoicePerformance
        callDispositions={d.callDispositions}
        callSentiment={d.callSentiment}
        callTriggers={d.callTriggers}
        totalCalls={d.callDispositions.reduce((s, x) => s + x.value, 0)}
      />

      {/* 6. SMS Performance */}
      <SMSPerformance
        totalSmsSent={d.totalSmsSent}
        totalSmsReceived={d.totalSmsReceived}
        smsReplyRate={d.smsReplyRate}
        avgSmsPerLead={d.avgSmsPerLead}
        convoAIOutcomes={d.convoAIOutcomes}
        sequenceEffectiveness={d.sequenceEffectiveness}
      />

      {/* 7. Sales Pipeline */}
      <SalesPipeline startDate={startDate} />
    </div>
  );
};

export default DashboardTab;
