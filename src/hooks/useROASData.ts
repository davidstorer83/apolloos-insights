import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface CampaignRow {
  campaign: string;
  spend: number;
  leads: number;
  cpl: number;
  booked: number;
  revenue: number;
  roas: number;
}

export interface UnitEconomics {
  avgContractValue: number;
  avgUpfrontRevenue: number;
  avgRemainingBalance: number;
  avgRecurringRevenue: number;
}

export interface ROASData {
  totalAdSpend: number;
  totalLeads: number;
  totalBooked: number;
  totalRevenue: number;
  overallROAS: number;
  costPerLead: number;
  costPerBooking: number;
  campaigns: CampaignRow[];
  unitEconomics: UnitEconomics;
  loading: boolean;
  error: string | null;
}

const defaultState: ROASData = {
  totalAdSpend: 0, totalLeads: 0, totalBooked: 0, totalRevenue: 0,
  overallROAS: 0, costPerLead: 0, costPerBooking: 0,
  campaigns: [],
  unitEconomics: { avgContractValue: 0, avgUpfrontRevenue: 0, avgRemainingBalance: 0, avgRecurringRevenue: 0 },
  loading: true, error: null,
};

function safeDiv(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 100) / 100;
}

export function useROASData(startDate?: string | null): ROASData {
  const [data, setData] = useState<ROASData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        // ── Campaign ROAS view (separate try/catch — view may not exist yet) ──
        let campaigns: CampaignRow[] = [];
        try {
          const { data: campaignRaw, error: campaignErr } = await supabase
            .from('v_campaign_roas')
            .select('*');
          if (!campaignErr && campaignRaw) {
            campaigns = campaignRaw.map((r: any) => ({
              campaign: r.campaign || r.campaign_name || 'Unknown',
              spend:    Number(r.spend) || 0,
              leads:    Number(r.leads) || 0,
              cpl:      Number(r.cpl)   || 0,
              booked:   Number(r.booked) || 0,
              revenue:  Number(r.revenue) || 0,
              roas:     Number(r.roas)   || 0,
            }));
          }
        } catch {
          // v_campaign_roas view not available yet — leave campaigns: []
        }

        // ── Revenue from closed appointments ──
        let revenueQuery = supabase
          .from('appointments')
          .select('contract_value, upfront_revenue, remaining_balance, recurring_revenue')
          .eq('sale', true);
        if (startDate) revenueQuery = revenueQuery.gte('created_at', startDate);
        const { data: revenueRaw } = await revenueQuery;
        const sales = revenueRaw || [];

        // ── Ad metrics ──
        let adQuery = supabase.from('ad_metrics').select('spend, leads');
        if (startDate) adQuery = adQuery.gte('date', startDate);
        const { data: adRaw } = await adQuery;
        const adMetrics = adRaw || [];

        // ── Derived totals ──
        const totalAdSpend  = adMetrics.reduce((s: number, a: any) => s + (Number(a.spend) || 0), 0);
        const totalLeads    = adMetrics.reduce((s: number, a: any) => s + (Number(a.leads) || 0), 0);
        const totalBooked   = sales.length;
        const totalRevenue  = sales.reduce((s: number, a: any) => s + (Number(a.contract_value) || 0), 0);
        const overallROAS   = safeDiv(totalRevenue, totalAdSpend);
        const costPerLead   = safeDiv(totalAdSpend, totalLeads);
        const costPerBooking = totalBooked > 0 ? Math.round(totalAdSpend / totalBooked) : 0;

        // ── Unit economics ──
        const n = sales.length || 1;
        const unitEconomics: UnitEconomics = {
          avgContractValue:    Math.round(sales.reduce((s: number, a: any) => s + (Number(a.contract_value) || 0), 0) / n),
          avgUpfrontRevenue:   Math.round(sales.reduce((s: number, a: any) => s + (Number(a.upfront_revenue) || 0), 0) / n),
          avgRemainingBalance: Math.round(sales.reduce((s: number, a: any) => s + (Number(a.remaining_balance) || 0), 0) / n),
          avgRecurringRevenue: Math.round(sales.reduce((s: number, a: any) => s + (Number(a.recurring_revenue) || 0), 0) / n),
        };

        setData({
          totalAdSpend, totalLeads, totalBooked, totalRevenue,
          overallROAS, costPerLead, costPerBooking,
          campaigns, unitEconomics,
          loading: false, error: null,
        });
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
    fetchData();
  }, [startDate]);

  return data;
}
