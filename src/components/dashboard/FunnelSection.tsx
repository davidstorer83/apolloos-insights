import type { FunnelStep, DropOffCounts } from '@/hooks/useDashboardData';

interface FunnelSectionProps {
  funnel: FunnelStep[];
  dropOffs: DropOffCounts;
}

const FunnelSection = ({ funnel, dropOffs }: FunnelSectionProps) => {
  const dropOffEntries = [
    { label: 'Not Interested', value: dropOffs.notInterested, color: '#f97316' },
    { label: 'Not Qualified',  value: dropOffs.notQualified,  color: '#ef4444' },
    { label: 'Max Attempts',   value: dropOffs.maxAttempts,   color: '#f59e0b' },
    { label: 'DND',            value: dropOffs.dnd,           color: '#dc2626' },
  ];

  const hasDropOffs = dropOffEntries.some(d => d.value > 0);

  return (
    <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
        Apollo v3 Funnel
      </h3>
      <div className="space-y-3">
        {funnel.map((step, i) => (
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
            {i < funnel.length - 1 && step.count > 0 && funnel[i + 1].count > 0 ? (
              <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                → {Math.round((funnel[i + 1].count / step.count) * 100)}% conv
              </span>
            ) : (
              <span className="w-16 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {hasDropOffs && (
        <div className="mt-4 pt-4 border-t border-dashed border-red-500/25">
          <span className="text-[10px] text-red-400/60 uppercase tracking-wider">Drop-offs</span>
          <div className="flex flex-wrap gap-3 mt-2">
            {dropOffEntries.map(d => (
              <span
                key={d.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${d.color}18`, color: d.color, border: `1px solid ${d.color}40` }}
              >
                {d.label}: {d.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelSection;
