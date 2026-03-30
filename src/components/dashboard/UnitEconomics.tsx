import type { UnitEconomics as UnitEconomicsType } from '@/hooks/useROASData';

interface UnitEconomicsProps {
  totalAdSpend: number;
  totalLeads: number;
  totalBooked: number;
  totalRevenue: number;
  costPerBooking: number;
  unitEconomics: UnitEconomicsType;
  hasSales: boolean;
}

const UnitEconomics = ({
  totalAdSpend,
  totalLeads,
  totalBooked,
  totalRevenue,
  costPerBooking,
  unitEconomics,
  hasSales,
}: UnitEconomicsProps) => {
  const fmt$ = (n: number) => n > 0 ? `$${n.toLocaleString()}` : '—';

  const costPerLead = totalLeads > 0 ? Math.round(totalAdSpend / totalLeads) : 0;

  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Unit Economics
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Per Outcome */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Cost Per Outcome
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Cost Per Lead',    value: fmt$(costPerLead) },
              { label: 'Cost Per Booking', value: fmt$(costPerBooking) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-lg font-semibold text-apollo-cyan">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-apollo-card border border-apollo-card-border rounded-lg p-5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Revenue Breakdown
          </h4>
          {!hasSales ? (
            <p className="text-sm text-muted-foreground">No closed sales yet</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Total Contract Value', value: fmt$(totalRevenue), highlight: true },
                { label: 'Avg Contract Value',   value: fmt$(unitEconomics.avgContractValue) },
                { label: 'Avg Upfront Revenue',  value: fmt$(unitEconomics.avgUpfrontRevenue) },
                { label: 'Avg Remaining Balance', value: fmt$(unitEconomics.avgRemainingBalance) },
                { label: 'Avg Recurring Revenue', value: fmt$(unitEconomics.avgRecurringRevenue) },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-lg font-semibold ${item.highlight ? 'text-apollo-green' : 'text-foreground'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitEconomics;
