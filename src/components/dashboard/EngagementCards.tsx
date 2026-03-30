interface EngagementCardsProps {
  responseRate: number;
  ctaToBookedPct: number;
  leadToBookedPct: number;
  avgTouches: number;
  responseRateSubMetrics: { totalResponded: number; totalContacted: number };
  ctaToBookedSubMetrics: { ctaDelivered: number; bookedFromCta: number };
  leadToBookedSubMetrics: { totalLeads: number; totalBooked: number };
}

const EngagementCards = ({
  responseRate,
  ctaToBookedPct,
  leadToBookedPct,
  avgTouches,
  responseRateSubMetrics,
  ctaToBookedSubMetrics,
  leadToBookedSubMetrics,
}: EngagementCardsProps) => {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Engagement Deep Dive
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Response Rate */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Response Rate</span>
          <p className="text-4xl font-bold text-apollo-cyan mt-2">{responseRate}%</p>
          <div className="mt-4 space-y-2 border-t border-apollo-card-border/50 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg touches to reply</span>
              <span className="text-foreground font-medium">{avgTouches > 0 ? avgTouches : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total responded</span>
              <span className="text-foreground font-medium">{responseRateSubMetrics.totalResponded.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total contacted</span>
              <span className="text-foreground font-medium">{responseRateSubMetrics.totalContacted.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CTA → Booked */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">CTA → Booked</span>
          <p className="text-4xl font-bold text-apollo-green mt-2">{ctaToBookedPct}%</p>
          <div className="mt-4 space-y-2 border-t border-apollo-card-border/50 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CTAs delivered</span>
              <span className="text-foreground font-medium">{ctaToBookedSubMetrics.ctaDelivered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Bookings from CTA</span>
              <span className="text-foreground font-medium">{ctaToBookedSubMetrics.bookedFromCta.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Lead → Booked */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Lead → Booked</span>
          <p className="text-4xl font-bold text-foreground mt-2">{leadToBookedPct}%</p>
          <div className="mt-4 space-y-2 border-t border-apollo-card-border/50 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total leads</span>
              <span className="text-foreground font-medium">{leadToBookedSubMetrics.totalLeads.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total bookings</span>
              <span className="text-foreground font-medium">{leadToBookedSubMetrics.totalBooked.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementCards;
