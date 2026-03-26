import KPICard from "./KPICard";
import FunnelCard from "./FunnelCard";
import {
  overviewKPIs, conversionFunnel, engagementStats,
  responseRatesByStage, leadsByStage, footerStats,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Clock, DollarSign, Repeat, MessageCircle } from "lucide-react";

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Leads" value={overviewKPIs.totalLeads.value} change={overviewKPIs.totalLeads.change} sparkData={overviewKPIs.totalLeads.spark} />
        <KPICard label="Total Bookings" value={overviewKPIs.totalBookings.value} change={overviewKPIs.totalBookings.change} sparkData={overviewKPIs.totalBookings.spark} />
        <KPICard label="Lead to Booking %" value={overviewKPIs.leadToBooking.value} suffix="%" change={overviewKPIs.leadToBooking.change} sparkData={overviewKPIs.leadToBooking.spark} />
        <KPICard label="Cost Per Booking" value={overviewKPIs.costPerBooking.value} prefix="$" change={overviewKPIs.costPerBooking.change} sparkData={overviewKPIs.costPerBooking.spark} />
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FunnelCard label={conversionFunnel.introResponse.label} value={conversionFunnel.introResponse.value} />
        <FunnelCard label={conversionFunnel.responseToCTA.label} value={conversionFunnel.responseToCTA.value} />
        <FunnelCard label={conversionFunnel.responseToBooking.label} value={conversionFunnel.responseToBooking.value} />
        <FunnelCard label={conversionFunnel.ctaToBooking.label} value={conversionFunnel.ctaToBooking.value} />
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label={engagementStats.avgMessages.label} value={engagementStats.avgMessages.value} />
        <KPICard label={engagementStats.avgInteractions.label} value={engagementStats.avgInteractions.value} />
        <KPICard
          label={engagementStats.dqRate.label}
          value={engagementStats.dqRate.value}
          suffix="%"
          subLabel={`${engagementStats.dqRate.count} leads disqualified`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Response Rates by Stage</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={responseRatesByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
              <XAxis dataKey="stage" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
              <Bar dataKey="rate" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14e6eb" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Leads by Stage</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leadsByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
              <XAxis dataKey="stage" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
              <Bar dataKey="count" fill="url(#barGrad2)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14e6eb" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#14e6eb" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-apollo-cyan shrink-0" />
          <div><span className="text-lg font-semibold text-foreground">{footerStats.timeSaved.value.toLocaleString()} hrs</span><p className="text-xs text-muted-foreground">Time Saved</p></div>
        </div>
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-apollo-green shrink-0" />
          <div><span className="text-lg font-semibold text-foreground">${footerStats.moneySaved.value.toLocaleString()}</span><p className="text-xs text-muted-foreground">Money Saved</p></div>
        </div>
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-4 flex items-center gap-3">
          <Repeat className="w-5 h-5 text-apollo-cyan shrink-0" />
          <div><span className="text-lg font-semibold text-foreground">{footerStats.avgAttempts.value}</span><p className="text-xs text-muted-foreground">Avg Attempts / Conversion</p></div>
        </div>
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-4 flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-apollo-green shrink-0" />
          <div><span className="text-lg font-semibold text-foreground">{footerStats.activeConversations.value}</span><p className="text-xs text-muted-foreground">Active Conversations</p></div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
