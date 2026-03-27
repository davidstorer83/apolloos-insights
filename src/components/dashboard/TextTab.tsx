import KPICard from "./KPICard";
import { useTextData } from "@/hooks/useTextData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Loader2, MessageSquare, Phone } from "lucide-react";

interface TextTabProps {
  source?: string;
}

const TextTab = ({ source }: TextTabProps) => {
  const text = useTextData(source);

  if (text.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-apollo-cyan" />
        <span className="ml-2 text-muted-foreground text-sm">Loading text data...</span>
      </div>
    );
  }

  if (text.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Failed to load text data: {text.error}
      </div>
    );
  }

  const ctaTotal = text.ctaResponses.reduce((s, r) => s + r.value, 0) || 1;
  const outcomeTotal = text.callOutcomes.reduce((s, o) => s + o.value, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Leads (Text System)"
          value={text.textLeads}
          change={text.changeLeads}
          sparkData={text.sparkLeads}
        />
        <KPICard
          label="Initial SMS Sent"
          value={text.smsSent}
          change={text.changeSms}
          sparkData={text.sparkSms}
        />
        <KPICard
          label="Replies Received"
          value={text.repliesReceived}
          change={text.changeReplies}
          sparkData={text.sparkReplies}
          subLabel={`${text.replyRate}% reply rate`}
        />
        <KPICard
          label="Bookings via Text"
          value={text.bookingsText}
          change={text.changeBookings}
          sparkData={text.sparkBookings}
        />
      </div>

      {/* SMS Engagement Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-apollo-cyan" />
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SMS Engagement</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Sent</span>
              <p className="text-2xl font-semibold text-foreground mt-1">{text.totalMessagesSent.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg to First Reply</span>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {text.avgMsgsToFirstReply > 0 ? text.avgMsgsToFirstReply : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg to Booking</span>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {text.avgMsgsToBooking > 0 ? text.avgMsgsToBooking : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Reply Sentiment */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Reply Sentiment</h3>
          <div className="space-y-3">
            {[
              { label: 'Positive', value: text.sentimentBreakdown.positive, color: '#34d399' },
              { label: 'Neutral',  value: text.sentimentBreakdown.neutral,  color: '#14e6eb' },
              { label: 'Negative', value: text.sentimentBreakdown.negative, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{s.label}</span>
                <div className="flex-1 bg-muted/30 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${s.value}%`, backgroundColor: s.color }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-10 text-right shrink-0">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ConvoAI Section */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">ConvoAI Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Activations</span>
              <p className="text-3xl font-semibold text-foreground mt-1">{text.convoAIActivations.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">CTA Delivered</span>
              <p className="text-3xl font-semibold text-foreground mt-1">{text.ctaDelivered.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">CTA Response Breakdown</span>
            <div className="space-y-2">
              {text.ctaResponses.map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{r.label}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round((r.value / ctaTotal) * 100)}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-6 text-right shrink-0">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calls from Text */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-apollo-green" />
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Retell Calls from Text System</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Calls Triggered</span>
              <p className="text-3xl font-semibold text-foreground mt-1">{text.callsFromText.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Answer Rate</span>
              <p className="text-3xl font-semibold text-apollo-green mt-1">{text.callAnswerRate}%</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">Call Outcomes</span>
            <div className="space-y-2">
              {text.callOutcomes.length > 0 ? (
                text.callOutcomes.map(o => (
                  <div key={o.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{o.label}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.round((o.value / outcomeTotal) * 100)}%`,
                          backgroundColor: o.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-6 text-right shrink-0">{o.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No call data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text-First Funnel */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">Text-First Funnel</h3>
        {(() => {
          const positive = text.funnel.filter(s => !s.negative);
          const negative = text.funnel.filter(s => s.negative);
          return (
            <div className="space-y-3">
              {positive.map((step, i) => (
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
                  <span className="text-xs text-apollo-cyan w-10 text-right shrink-0">{step.pct}%</span>
                  {i < positive.length - 1 && step.count > 0 && positive[i + 1].count > 0 ? (
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                      → {Math.round((positive[i + 1].count / step.count) * 100)}% conv
                    </span>
                  ) : (
                    <span className="w-16 shrink-0" />
                  )}
                </div>
              ))}
              {negative.length > 0 && (
                <>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="w-20 shrink-0" />
                    <div className="flex-1 border-t border-dashed border-red-500/25" />
                    <span className="text-[10px] text-red-400/60 uppercase tracking-wider shrink-0 pr-1">Drop-outs</span>
                    <span className="w-16 shrink-0" />
                  </div>
                  {negative.map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <span className="text-xs text-red-400/70 w-20 text-right shrink-0">{step.label}</span>
                      <div className="flex-1 bg-muted/30 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(step.pct, step.count > 0 ? 1 : 0)}%`, backgroundColor: '#f87171' }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-14 text-right shrink-0">
                        {step.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-red-400 w-10 text-right shrink-0">{step.pct}%</span>
                      <span className="w-16 shrink-0" />
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* Message Volume Chart */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Message Volume (30 days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={text.messageVolume}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8 }} />
            <Bar dataKey="sent"    stackId="a" fill="#14e6eb" opacity={0.5} />
            <Bar dataKey="replies" stackId="a" fill="#34d399" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#14e6eb] opacity-50" /><span className="text-xs text-muted-foreground">Sent</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#34d399]" /><span className="text-xs text-muted-foreground">Replies</span></div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Platform Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-apollo-card-border">
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Platform</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Conversations</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Replies</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Reply Rate</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Bookings</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Booking Rate</th>
              </tr>
            </thead>
            <tbody>
              {text.platformBreakdown.map(p => (
                <tr key={p.platform} className="border-b border-apollo-card-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 text-foreground font-medium">{p.platform}</td>
                  <td className="py-3 text-right text-foreground">{p.conversations.toLocaleString()}</td>
                  <td className="py-3 text-right text-foreground">{p.replies.toLocaleString()}</td>
                  <td className="py-3 text-right text-apollo-cyan">{p.replyRate}%</td>
                  <td className="py-3 text-right text-foreground">{p.bookings}</td>
                  <td className="py-3 text-right text-apollo-green">{p.bookingRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TextTab;
