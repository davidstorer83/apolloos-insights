import type { CampaignRow } from '@/hooks/useROASData';

interface CampaignTableProps {
  campaigns: CampaignRow[];
}

const CampaignTable = ({ campaigns }: CampaignTableProps) => {
  if (campaigns.length === 0) {
    return (
      <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">No campaign data yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Build N8N #5 (Meta Ads Daily Pull) to populate.</p>
      </div>
    );
  }

  const totals = campaigns.reduce(
    (acc, r) => ({
      spend:   acc.spend   + r.spend,
      leads:   acc.leads   + r.leads,
      booked:  acc.booked  + r.booked,
      revenue: acc.revenue + r.revenue,
    }),
    { spend: 0, leads: 0, booked: 0, revenue: 0 }
  );
  const totalCpl  = totals.leads  > 0 ? Math.round(totals.spend   / totals.leads)  : 0;
  const totalRoas = totals.spend  > 0 ? Math.round((totals.revenue / totals.spend)  * 100) / 100 : 0;

  const fmt$ = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="bg-apollo-card border border-apollo-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-apollo-card-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Campaign Breakdown
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-apollo-card-border bg-muted/10">
              <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Campaign</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Spend</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Leads</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">CPL</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Booked</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Revenue</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((r, i) => (
              <tr key={i} className="border-b border-apollo-card-border last:border-0 hover:bg-muted/10 transition-colors">
                <td className="px-5 py-3 text-foreground font-medium">{r.campaign}</td>
                <td className="px-4 py-3 text-right text-foreground">{fmt$(r.spend)}</td>
                <td className="px-4 py-3 text-right text-foreground">{r.leads.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-apollo-cyan">{fmt$(r.cpl)}</td>
                <td className="px-4 py-3 text-right text-foreground">{r.booked.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-foreground">{fmt$(r.revenue)}</td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: r.roas >= 1 ? '#34d399' : '#ef4444' }}>
                  {r.roas}x
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-apollo-card-border bg-muted/10 font-semibold">
              <td className="px-5 py-3 text-foreground">Totals</td>
              <td className="px-4 py-3 text-right text-foreground">{fmt$(totals.spend)}</td>
              <td className="px-4 py-3 text-right text-foreground">{totals.leads.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-apollo-cyan">{fmt$(totalCpl)}</td>
              <td className="px-4 py-3 text-right text-foreground">{totals.booked.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-foreground">{fmt$(totals.revenue)}</td>
              <td className="px-4 py-3 text-right text-apollo-green">{totalRoas}x</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
