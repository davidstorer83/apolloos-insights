import KPICard from "./KPICard";
import {
  voiceKPIs, callOutcomes, callSentiment, callPerformanceData,
  sentimentTrend, flaggedCalls,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";

const VoiceTab = () => {
  const totalOutcomes = callOutcomes.reduce((s, o) => s + o.value, 0);

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Calls Made" value={voiceKPIs.callsMade.value} change={voiceKPIs.callsMade.change} sparkData={voiceKPIs.callsMade.spark} />
        <KPICard label="Calls Answered" value={voiceKPIs.callsAnswered.value} change={voiceKPIs.callsAnswered.change} sparkData={voiceKPIs.callsAnswered.spark} subLabel={`${voiceKPIs.callsAnswered.rate}% answer rate`} />
        <KPICard label="Bookings via Voice" value={voiceKPIs.bookingsVoice.value} change={voiceKPIs.bookingsVoice.change} sparkData={voiceKPIs.bookingsVoice.spark} />
        <KPICard label="Avg Call Duration" value={voiceKPIs.avgCallDuration.value} change={voiceKPIs.avgCallDuration.change} sparkData={voiceKPIs.avgCallDuration.spark} />
      </div>

      {/* Outcomes + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Outcome */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Outcome Breakdown</h3>
          <div className="space-y-3">
            {callOutcomes.map((o) => (
              <div key={o.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-36 shrink-0">{o.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${(o.value / totalOutcomes) * 100}%`, backgroundColor: o.color }} />
                </div>
                <span className="text-xs font-medium text-foreground w-10 text-right">{o.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Sentiment Distribution</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <span className="text-2xl font-bold text-apollo-green">{callSentiment.positive}%</span>
              <p className="text-xs text-muted-foreground mt-1">Positive</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{callSentiment.neutral}%</span>
              <p className="text-xs text-muted-foreground mt-1">Neutral</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-danger">{callSentiment.negative}%</span>
              <p className="text-xs text-muted-foreground mt-1">Negative</p>
            </div>
          </div>
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Sentiment Score Trend</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={sentimentTrend}>
              <Line type="monotone" dataKey="score" stroke="#14e6eb" strokeWidth={2} dot={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagged Calls */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Calls Flagged for Review ({flaggedCalls.length})</h3>
        </div>
        <div className="space-y-2">
          {flaggedCalls.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-apollo-card-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-apollo-cyan">{c.id}</span>
                <span className="text-sm text-foreground">{c.reason}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Call Performance Chart */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Performance</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={callPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
            <Bar dataKey="calls" fill="#14e6eb" opacity={0.4} radius={[2, 2, 0, 0]} />
            <Bar dataKey="bookings" fill="#34d399" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VoiceTab;
