import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

function safeRate(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

export interface SystemStats {
  leads: number;
  bookings: number;
  bookingRate: number;
  avgToBook: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  pct: number;
}

export interface OverviewData {
  totalLeads: number;
  totalBookings: number;
  leadToBookingPct: number;
  costPerBooking: number;
  changeLeads: number;
  changeBookings: number;
  changeLeadToBooking: number;
  changeCostPerBooking: number;
  textFirst: SystemStats;
  voiceFirst: SystemStats;
  funnel: FunnelStep[];
  sparkLeads: { day: number; value: number }[];
  sparkBookings: { day: number; value: number }[];
  loading: boolean;
  error: string | null;
}

const emptyStats: SystemStats = { leads: 0, bookings: 0, bookingRate: 0, avgToBook: 0 };

const defaultState: OverviewData = {
  totalLeads: 0, totalBookings: 0, leadToBookingPct: 0, costPerBooking: 0,
  changeLeads: 0, changeBookings: 0, changeLeadToBooking: 0, changeCostPerBooking: 0,
  textFirst: { ...emptyStats }, voiceFirst: { ...emptyStats },
  funnel: [], sparkLeads: [], sparkBookings: [],
  loading: true, error: null,
};

export function useOverviewData(source?: string): OverviewData {
  const [data, setData] = useState<OverviewData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        // ── Leads ──
        let leadsQuery = supabase.from('leads').select('*');
        if (source && source !== 'All Sources') leadsQuery = leadsQuery.eq('source', source);
        const { data: leadsRaw } = await leadsQuery;
        const allLeads = leadsRaw || [];

        // ── Appointments ──
        const { data: apptsRaw } = await supabase.from('appointments').select('*');
        const allAppts = apptsRaw || [];

        // ── Ad Metrics (spend for cost per booking) ──
        const { data: adRaw } = await supabase.from('ad_metrics').select('spend');
        const totalSpend = (adRaw || []).reduce((s: number, r: any) => s + (Number(r.spend) || 0), 0);

        // ── Calls (fallback for bookings if appointments table empty) ──
        const { data: callsRaw } = await supabase.from('calls').select('id, disposition, created_at, engagement_method');
        const allCalls = callsRaw || [];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

        // ── Total KPIs ──
        const totalLeads = allLeads.length > 0 ? allLeads.length : allCalls.length;

        const bookedFromCalls = allCalls.filter((c: any) => {
          const d = (c.disposition || '').toLowerCase();
          return d.includes('booked') || d.includes('appointment');
        }).length;
        const totalBookings = allAppts.length > 0 ? allAppts.length : bookedFromCalls;

        const leadToBookingPct = safeRate(totalBookings, totalLeads);
        const costPerBooking = totalBookings > 0 && totalSpend > 0 ? Math.round(totalSpend / totalBookings) : 0;

        // ── System comparison ──
        const textLeads = allLeads.filter((l: any) => l.engagement_method === 'text_first');
        const voiceLeads = allLeads.filter((l: any) => l.engagement_method === 'voice_first');
        const textBookings = allAppts.filter((a: any) =>
          ['convo_ai_text', 'retell_from_text'].includes(a.booking_source)
        ).length;
        const voiceBookings = allAppts.filter((a: any) =>
          ['retell_direct', 'retell_sequence', 'retell_from_text'].includes(a.booking_source)
        ).length || bookedFromCalls;

        const voiceLeadBase = Math.max(voiceLeads.length, allCalls.length);

        const textFirst: SystemStats = {
          leads: textLeads.length,
          bookings: textBookings,
          bookingRate: safeRate(textBookings, textLeads.length),
          avgToBook: 0,
        };
        const voiceFirst: SystemStats = {
          leads: voiceLeads.length,
          bookings: voiceBookings,
          bookingRate: safeRate(voiceBookings, voiceLeadBase),
          avgToBook: 0,
        };

        // ── Combined funnel ──
        const funnelBase = totalLeads || 1;
        const contacted = allLeads.filter((l: any) => l.status && l.status !== 'new').length || allCalls.length;
        const replied = allLeads.filter((l: any) =>
          ['replied', 'engaged', 'cta_sent', 'booked'].includes(l.status)
        ).length;
        const engaged = allLeads.filter((l: any) =>
          ['engaged', 'cta_sent', 'booked'].includes(l.status)
        ).length;
        const ctaSent = allLeads.filter((l: any) =>
          ['cta_sent', 'booked'].includes(l.status)
        ).length;

        const funnel: FunnelStep[] = [
          { label: 'Lead',      count: totalLeads,   pct: 100 },
          { label: 'Contacted', count: contacted,    pct: safeRate(contacted, funnelBase) },
          { label: 'Replied',   count: replied,      pct: safeRate(replied, funnelBase) },
          { label: 'Engaged',   count: engaged,      pct: safeRate(engaged, funnelBase) },
          { label: 'CTA',       count: ctaSent,      pct: safeRate(ctaSent, funnelBase) },
          { label: 'Booked',    count: totalBookings, pct: leadToBookingPct },
        ];

        // ── Sparklines (last 7 days) ──
        const sparkDays = Array.from({ length: 7 }, (_, i) =>
          new Date(now.getTime() - (6 - i) * 86400000).toISOString().split('T')[0]
        );
        const sparkLeads = sparkDays.map((d, i) => ({
          day: i,
          value: allLeads.filter((l: any) => (l.created_at || '').startsWith(d)).length,
        }));
        const sparkBookings = sparkDays.map((d, i) => ({
          day: i,
          value: allAppts.filter((a: any) => (a.created_at || '').startsWith(d)).length,
        }));

        // ── Week-over-week changes ──
        const twLeads = allLeads.filter((l: any) => new Date(l.created_at) >= sevenDaysAgo).length;
        const lwLeads = allLeads.filter((l: any) =>
          new Date(l.created_at) >= fourteenDaysAgo && new Date(l.created_at) < sevenDaysAgo
        ).length;
        const twBookings = allAppts.filter((a: any) => new Date(a.created_at) >= sevenDaysAgo).length;
        const lwBookings = allAppts.filter((a: any) =>
          new Date(a.created_at) >= fourteenDaysAgo && new Date(a.created_at) < sevenDaysAgo
        ).length;

        setData({
          totalLeads, totalBookings, leadToBookingPct, costPerBooking,
          changeLeads: pctChange(twLeads, lwLeads),
          changeBookings: pctChange(twBookings, lwBookings),
          changeLeadToBooking: 0,
          changeCostPerBooking: 0,
          textFirst, voiceFirst, funnel, sparkLeads, sparkBookings,
          loading: false, error: null,
        });
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
    fetchData();
  }, [source]);

  return data;
}
