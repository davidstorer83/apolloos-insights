import KPICard from "./KPICard";
import { useVoiceData } from "@/hooks/useVoiceData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface VoiceTabProps {
  source?: string;
}

const VoiceTab = ({ source: _source }: VoiceTabProps) => {
  const voice = useVoiceData();

  if (voice.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-apollo-cyan" />
        <span className="ml-2 text-muted-foreground text-sm">Loading voice data...</span>
      </div>
    );
  }

  if (voice.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Failed to load voice data: {voice.error}
      </div>
    );
  }

  const totalOutcomes = voice.callOutcomes.reduce((s, o) => s + o.value, 0);

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Calls Made"
          value={voice.callsMade}
          change={voice.changeCalls}
          sparkData={voice.sparkCalls}
        />
        <KPICard
          label="Calls Answered"
          value={voice.callsAnswered}
          change={voice.changeAnswered}
          sparkData={voice.sparkAnswered}
          subLabel={`${voice.answerRate}% answer rate`}
        />
        <KPICard
          label="Bookings via Voice"
          value={voice.bookingsVoice}
          change={voice.changeBookings}
          sparkData={voice.sparkBookings}
        />
        <KPICard
          label="Avg Call Duration"
          value={voice.avgCallDuration}
          change={voice.changeDuration}
          sparkData={voice.sparkDuration}
        />
      </div>

      {/* Outcomes + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Outcome */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Outcome Breakdown</h3>
          {voice.callOutcomes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No call data yet</p>
          ) : (
            <div className="space-y-3">
              {voice.callOutcomes.map((o) => (
                <div key={o.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-36 shrink-0">{o.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalOutcomes > 0 ? (o.value / totalOutcomes) * 100 : 0}%`, backgroundColor: o.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-10 text-right">{o.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentiment */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Sentiment Distribution</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <span className="text-2xl font-bold text-apollo-green">{voice.sentiment.positive}%</span>
              <p className="text-xs text-muted-foreground mt-1">Positive</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">{voice.sentiment.neutral}%</span>
              <p className="text-xs text-muted-foreground mt-1">Neutral</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-danger">{voice.sentiment.negative}%</span>
              <p className="text-xs text-muted-foreground mt-1">Negative</p>
            </div>
          </div>
          {voice.sentimentTrend.length > 0 && (
            <>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Sentiment Score Trend</h4>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={voice.sentimentTrend}>
                  <Line type="monotone" dataKey="score" stroke="#14e6eb" strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Flagged Calls */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Calls Flagged for Review ({voice.flaggedCalls.length})
          </h3>
        </div>
        {voice.flaggedCalls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flagged calls</p>
        ) : (
          <div className="space-y-2">
            {voice.flaggedCalls.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-apollo-card-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-apollo-cyan">{c.id}</span>
                  <span className="text-sm text-foreground">{c.reason}</span>
                </div>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Performance Chart */}
      {voice.performanceData.length > 0 && (
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Performance (30 days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={voice.performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
              <Bar dataKey="calls" fill="#14e6eb" opacity={0.4} radius={[2, 2, 0, 0]} name="Calls" />
              <Bar dataKey="bookings" fill="#34d399" radius={[2, 2, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Call Trigger Breakdown */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Call Trigger Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {voice.callTriggerBreakdown.map(t => (
            <div key={t.trigger} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t.trigger}</span>
              <span className="text-2xl font-semibold text-foreground">{t.count}</span>
              <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${voice.callsMade > 0 ? Math.round((t.count / voice.callsMade) * 100) : 0}%`,
                    backgroundColor: t.color,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {voice.callsMade > 0 ? Math.round((t.count / voice.callsMade) * 100) : 0}% of calls
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Sequence */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-apollo-cyan" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Follow-up Sequence
          </h3>
        </div>
        {voice.sequenceAttempts === 0 ? (
          <p className="text-sm text-muted-foreground">No sequence calls yet</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sequence Attempts</span>
                <p className="text-3xl font-semibold text-foreground mt-1">{voice.sequenceAttempts}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Answered</span>
                <p className="text-3xl font-semibold text-apollo-cyan mt-1">{voice.sequenceAnswered}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Booked</span>
                <p className="text-3xl font-semibold text-apollo-green mt-1">{voice.sequenceBooked}</p>
              </div>
            </div>
            {voice.sequenceOutcomes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Sequence Outcomes</span>
                <div className="space-y-2">
                  {voice.sequenceOutcomes.map(o => {
                    const total = voice.sequenceOutcomes.reduce((s, x) => s + x.value, 0) || 1;
                    return (
                      <div key={o.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-36 shrink-0">{o.label}</span>
                        <div className="flex-1 bg-muted/30 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${Math.round((o.value / total) * 100)}%`, backgroundColor: o.color }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8 text-right">{o.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceTab;
