import type { DispositionEntry, CallSentiment, CallTriggerEntry } from '@/hooks/useDashboardData';

interface VoicePerformanceProps {
  callDispositions: DispositionEntry[];
  callSentiment: CallSentiment;
  callTriggers: CallTriggerEntry[];
  totalCalls: number;
}

const VoicePerformance = ({ callDispositions, callSentiment, callTriggers, totalCalls }: VoicePerformanceProps) => {
  const dispTotal = callDispositions.reduce((s, d) => s + d.value, 0) || 1;
  const trigTotal = callTriggers.reduce((s, t) => s + t.count, 0) || 1;

  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Voice Performance
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Call Disposition */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Call Disposition
          </h4>
          {callDispositions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No call data yet</p>
          ) : (
            <div className="space-y-3">
              {callDispositions.map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{d.label}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((d.value / dispTotal) * 100)}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right shrink-0">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sentiment + Triggers */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 space-y-5">
          {/* Sentiment */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Call Sentiment
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-apollo-green">{callSentiment.positive}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Positive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{callSentiment.neutral}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Neutral</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{callSentiment.negative}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Negative</p>
              </div>
            </div>
          </div>

          {/* Call Triggers */}
          <div className="border-t border-apollo-card-border/50 pt-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Call Trigger
            </h4>
            <div className="space-y-2">
              {callTriggers.map(t => (
                <div key={t.trigger} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{t.trigger}</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((t.count / trigTotal) * 100)}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right shrink-0">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePerformance;
