interface FunnelCardProps {
  label: string;
  value: number;
  suffix?: string;
}

const FunnelCard = ({ label, value, suffix = "%" }: FunnelCardProps) => (
  <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5 flex flex-col gap-3">
    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-semibold gradient-text">{value}</span>
      <span className="text-sm text-muted-foreground mb-0.5">{suffix}</span>
    </div>
    <div className="w-full bg-muted rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-apollo-cyan to-apollo-green"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

export default FunnelCard;
