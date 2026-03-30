import type { ConvoAIOutcome } from '@/hooks/useDashboardData';

interface SMSPerformanceProps {
  totalSmsSent: number;
  totalSmsReceived: number;
  smsReplyRate: number;
  avgSmsPerLead: number;
  convoAIOutcomes: ConvoAIOutcome[];
  sequenceEffectiveness: { sequenceCalls: number; sequenceAnswered: number; sequenceBooked: number };
}

const SMSPerformance = ({
  totalSmsSent,
  totalSmsReceived,
  smsReplyRate,
  avgSmsPerLead,
  convoAIOutcomes,
  sequenceEffectiveness,
}: SMSPerformanceProps) => {
  const outcomeTotal = convoAIOutcomes.reduce((s, o) => s + o.value, 0) || 1;

  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        SMS Performance
      </h3>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Sent',       value: totalSmsSent.toLocaleString() },
          { label: 'Total Received',   value: totalSmsReceived.toLocaleString() },
          { label: 'Reply Rate',       value: `${smsReplyRate}%` },
          { label: 'Avg SMS Per Lead', value: avgSmsPerLead > 0 ? avgSmsPerLead : '—' },
        ].map(k => (
          <div key={k.label} className="bg-apollo-card border border-apollo-card-border rounded-lg p-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</span>
            <p className="text-2xl font-semibold text-foreground mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* 2 panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ConvoAI Outcomes */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            ConvoAI Outcomes
          </h4>
          {convoAIOutcomes.every(o => o.value === 0) ? (
            <p className="text-sm text-muted-foreground">No ConvoAI data yet</p>
          ) : (
            <div className="space-y-3">
              {convoAIOutcomes.map(o => (
                <div key={o.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{o.label}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((o.value / outcomeTotal) * 100)}%`, backgroundColor: o.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right shrink-0">{o.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sequence Effectiveness */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Sequence Effectiveness
          </h4>
          {sequenceEffectiveness.sequenceCalls === 0 ? (
            <p className="text-sm text-muted-foreground">No sequence data yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Active</span>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {sequenceEffectiveness.sequenceCalls.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Answered</span>
                <p className="text-3xl font-semibold text-apollo-cyan mt-1">
                  {sequenceEffectiveness.sequenceAnswered.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Converted</span>
                <p className="text-3xl font-semibold text-apollo-green mt-1">
                  {sequenceEffectiveness.sequenceBooked.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMSPerformance;
