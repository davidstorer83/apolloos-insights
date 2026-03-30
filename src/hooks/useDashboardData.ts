import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface FunnelStep {
  label: string;
  count: number;
  pct: number;
}

export interface DropOffCounts {
  notInterested: number;
  notQualified: number;
  maxAttempts: number;
  dnd: number;
}

export interface DispositionEntry {
  label: string;
  value: number;
  color: string;
}

export interface CallSentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface CallTriggerEntry {
  trigger: string;
  count: number;
  color: string;
}

export interface ConvoAIOutcome {
  label: string;
  value: number;
  color: string;
}

export interface DashboardData {
  // Primary KPIs
  totalLeads: number;
  sparkLeads: { day: number; value: number }[];
  changeLeads: number;
  responseRate: number;
  avgTouches: number;
  ctaToBookedPct: number;
  leadToBookedPct: number;
  totalBooked: number;
  // Secondary KPIs
  callAnswerRate: number;
  avgCallDuration: string;
  activeSequenceCount: number;
  costPerBooking: number;
  // Funnel
  funnel: FunnelStep[];
  dropOffs: DropOffCounts;
  // Engagement sub-metrics
  responseRateSubMetrics: { totalResponded: number; totalContacted: number };
  ctaToBookedSubMetrics: { ctaDelivered: number; bookedFromCta: number };
  leadToBookedSubMetrics: { totalLeads: number; totalBooked: number };
  // Voice
  callDispositions: DispositionEntry[];
  callSentiment: CallSentiment;
  callTriggers: CallTriggerEntry[];
  // SMS
  totalSmsSent: number;
  totalSmsReceived: number;
  smsReplyRate: number;
  avgSmsPerLead: number;
  convoAIOutcomes: ConvoAIOutcome[];
  sequenceEffectiveness: { sequenceCalls: number; sequenceAnswered: number; sequenceBooked: number };
  loading: boolean;
  error: string | null;
}

const defaultState: DashboardData = {
  totalLeads: 0, sparkLeads: [], changeLeads: 0,
  responseRate: 0, avgTouches: 0,
  ctaToBookedPct: 0, leadToBookedPct: 0, totalBooked: 0,
  callAnswerRate: 0, avgCallDuration: '0:00',
  activeSequenceCount: 0, costPerBooking: 0,
  funnel: [], dropOffs: { notInterested: 0, notQualified: 0, maxAttempts: 0, dnd: 0 },
  responseRateSubMetrics: { totalResponded: 0, totalContacted: 0 },
  ctaToBookedSubMetrics: { ctaDelivered: 0, bookedFromCta: 0 },
  leadToBookedSubMetrics: { totalLeads: 0, totalBooked: 0 },
  callDispositions: [], callSentiment: { positive: 0, neutral: 0, negative: 0 }, callTriggers: [],
  totalSmsSent: 0, totalSmsReceived: 0, smsReplyRate: 0, avgSmsPerLead: 0,
  convoAIOutcomes: [],
  sequenceEffectiveness: { sequenceCalls: 0, sequenceAnswered: 0, sequenceBooked: 0 },
  loading: true, error: null,
};

function safeRate(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

function parseDisposition(raw: string): string {
  if (!raw) return 'other';
  const match = raw.match(/call_outcome:\s*([^,\n]+)/i);
  if (match) return match[1].trim().toLowerCase();
  const clean = raw.trim().toLowerCase();
  if (['booked', 'callback', 'not_interested', 'not_qualified', 'voicemail', 'no_answer', 'dnd'].includes(clean)) return clean;
  return 'other';
}

const dispositionColors: Record<string, string> = {
  voicemail:       '#64748b',
  no_answer:       '#64748b',
  booked:          '#34d399',
  callback:        '#14e6eb',
  not_interested:  '#f97316',
  not_qualified:   '#ef4444',
  dnd:             '#dc2626',
  neutral:         '#888888',
  other:           '#888888',
};

const triggerColors: Record<string, string> = {
  immediate:          '#14e6eb',
  convo_ai_request:   '#34d399',
  scheduled_callback: '#6366f1',
  sequence_attempt:   '#f59e0b',
};

export function useDashboardData(startDate?: string | null): DashboardData {
  const [data, setData] = useState<DashboardData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        // ── 3 parallel fetches ──
        const leadsQuery = supabase
          .from('leads')
          .select('id, created_at, current_stage, first_replied_at, total_sms_sent, total_sms_received, total_calls_made, cta_delivered_at, cta_response, booked_at');
        const callsQuery = supabase
          .from('calls')
          .select('id, lead_id, answered, duration_seconds, disposition, sentiment, call_trigger, created_at');
        const adQuery = supabase
          .from('ad_metrics')
          .select('spend');

        const [leadsRes, callsRes, adRes] = await Promise.all([
          startDate ? leadsQuery.gte('created_at', startDate) : leadsQuery,
          startDate ? callsQuery.gte('created_at', startDate) : callsQuery,
          startDate ? adQuery.gte('date', startDate) : adQuery,
        ]);

        if (leadsRes.error) throw leadsRes.error;
        if (callsRes.error) throw callsRes.error;

        const leads = leadsRes.data || [];
        const calls = callsRes.data || [];
        const adMetrics = adRes.data || [];

        // ── Primary KPIs ──
        const totalLeads = leads.length;
        const responded = leads.filter((l: any) => l.first_replied_at != null);
        const totalResponded = responded.length;
        const responseRate = safeRate(totalResponded, totalLeads);

        const avgTouches = totalResponded > 0
          ? Math.round(
              (responded.reduce((s: number, l: any) =>
                s + (Number(l.total_sms_sent) || 0) + (Number(l.total_calls_made) || 0), 0
              ) / totalResponded) * 10
            ) / 10
          : 0;

        const ctaDelivered = leads.filter((l: any) => l.cta_delivered_at != null).length;
        const bookedFromCta = leads.filter((l: any) => l.cta_delivered_at != null && l.booked_at != null).length;
        const ctaToBookedPct = safeRate(bookedFromCta, ctaDelivered);

        const totalBooked = leads.filter((l: any) => l.booked_at != null).length;
        const leadToBookedPct = safeRate(totalBooked, totalLeads);

        // ── Secondary KPIs ──
        const answeredCalls = calls.filter((c: any) =>
          c.answered === true || c.answered === 'true' || c.answered === 'TRUE'
        );
        const callAnswerRate = safeRate(answeredCalls.length, calls.length);

        const durations = answeredCalls.map((c: any) => Number(c.duration_seconds) || 0).filter((d: number) => d > 0);
        const avgDurationSec = durations.length > 0
          ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length
          : 0;

        const activeSequenceCount = leads.filter((l: any) => l.current_stage === 'sequence_active').length;

        const totalAdSpend = adMetrics.reduce((s: number, a: any) => s + (Number(a.spend) || 0), 0);
        const costPerBooking = totalBooked > 0 ? Math.round(totalAdSpend / totalBooked) : 0;

        // ── Funnel ──
        const calledLeadIds = new Set(calls.map((c: any) => c.lead_id));
        const answeredLeadIds = new Set(answeredCalls.map((c: any) => c.lead_id));
        const called = calledLeadIds.size;
        const answered = answeredLeadIds.size;
        const funnelBase = totalLeads || 1;

        const funnel: FunnelStep[] = [
          { label: 'Lead',      count: totalLeads,     pct: 100 },
          { label: 'Called',    count: called,         pct: safeRate(called, funnelBase) },
          { label: 'Answered',  count: answered,       pct: safeRate(answered, funnelBase) },
          { label: 'Responded', count: totalResponded, pct: safeRate(totalResponded, funnelBase) },
          { label: 'CTA Sent',  count: ctaDelivered,   pct: safeRate(ctaDelivered, funnelBase) },
          { label: 'Booked',    count: totalBooked,    pct: safeRate(totalBooked, funnelBase) },
        ];

        // ── Drop-offs (client-side from leads) ──
        const dropOffs: DropOffCounts = {
          notInterested: leads.filter((l: any) => l.current_stage === 'not_interested').length,
          notQualified:  leads.filter((l: any) => l.current_stage === 'not_qualified').length,
          maxAttempts:   leads.filter((l: any) => l.current_stage === 'max_attempts').length,
          dnd:           leads.filter((l: any) => l.current_stage === 'dnd').length,
        };

        // ── Voice dispositions ──
        const dispositionMap: Record<string, number> = {};
        calls.forEach((c: any) => {
          const d = parseDisposition(c.disposition || '');
          dispositionMap[d] = (dispositionMap[d] || 0) + 1;
        });
        const callDispositions: DispositionEntry[] = Object.entries(dispositionMap)
          .map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' '),
            value,
            color: dispositionColors[label] || '#888888',
          }))
          .sort((a, b) => b.value - a.value);

        // ── Call sentiment ──
        const sentiments = calls.map((c: any) => (c.sentiment || 'neutral').toLowerCase());
        const sentTotal = sentiments.length || 1;
        const callSentiment: CallSentiment = {
          positive: Math.round((sentiments.filter((s: string) => s === 'positive').length / sentTotal) * 1000) / 10,
          neutral:  Math.round((sentiments.filter((s: string) => s === 'neutral').length  / sentTotal) * 1000) / 10,
          negative: Math.round((sentiments.filter((s: string) => s === 'negative').length / sentTotal) * 1000) / 10,
        };

        // ── Call triggers ──
        const triggerMap: Record<string, number> = {
          immediate: 0, convo_ai_request: 0, scheduled_callback: 0, sequence_attempt: 0,
        };
        calls.forEach((c: any) => {
          const t = (c.call_trigger || 'immediate').toLowerCase();
          if (t in triggerMap) triggerMap[t]++;
          else triggerMap['immediate']++;
        });
        const callTriggers: CallTriggerEntry[] = Object.entries(triggerMap)
          .map(([trigger, count]) => ({
            trigger: trigger.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            count,
            color: triggerColors[trigger] || '#888888',
          }));

        // ── SMS ──
        const totalSmsSent = leads.reduce((s: number, l: any) => s + (Number(l.total_sms_sent) || 0), 0);
        const totalSmsReceived = leads.reduce((s: number, l: any) => s + (Number(l.total_sms_received) || 0), 0);
        const smsReplyRate = safeRate(totalSmsReceived, totalSmsSent);
        const avgSmsPerLead = totalLeads > 0 ? Math.round((totalSmsSent / totalLeads) * 10) / 10 : 0;

        // ── ConvoAI outcomes (from leads.current_stage) ──
        const convoAIOutcomes: ConvoAIOutcome[] = [
          { label: 'Not Interested', value: dropOffs.notInterested, color: '#f97316' },
          { label: 'Not Qualified',  value: dropOffs.notQualified,  color: '#ef4444' },
          { label: 'Callback',       value: leads.filter((l: any) => l.current_stage === 'callback').length, color: '#14e6eb' },
          { label: 'DND',            value: dropOffs.dnd,           color: '#dc2626' },
        ];

        // ── Sequence effectiveness ──
        const sequenceCalls = calls.filter((c: any) =>
          (c.call_trigger || '').toLowerCase() === 'sequence_attempt'
        );
        const sequenceEffectiveness = {
          sequenceCalls: sequenceCalls.length,
          sequenceAnswered: sequenceCalls.filter((c: any) =>
            c.answered === true || c.answered === 'true' || c.answered === 'TRUE'
          ).length,
          sequenceBooked: sequenceCalls.filter((c: any) =>
            parseDisposition(c.disposition || '') === 'booked'
          ).length,
        };

        // ── Sparklines (last 7 days relative to now) ──
        const now = new Date();
        const sparkDays = Array.from({ length: 7 }, (_, i) =>
          new Date(now.getTime() - (6 - i) * 86400000).toISOString().split('T')[0]
        );
        const sparkLeads = sparkDays.map((d, i) => ({
          day: i,
          value: leads.filter((l: any) => (l.created_at || '').startsWith(d)).length,
        }));

        // ── Week-over-week change for leads ──
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
        const thisWeekLeads = leads.filter((l: any) => new Date(l.created_at) >= sevenDaysAgo).length;
        const lastWeekLeads = leads.filter((l: any) => {
          const d = new Date(l.created_at);
          return d >= fourteenDaysAgo && d < sevenDaysAgo;
        }).length;
        const changeLeads = pctChange(thisWeekLeads, lastWeekLeads);

        setData({
          totalLeads, sparkLeads, changeLeads,
          responseRate, avgTouches,
          ctaToBookedPct, leadToBookedPct, totalBooked,
          callAnswerRate,
          avgCallDuration: formatDuration(avgDurationSec),
          activeSequenceCount, costPerBooking,
          funnel, dropOffs,
          responseRateSubMetrics: { totalResponded, totalContacted: totalLeads },
          ctaToBookedSubMetrics: { ctaDelivered, bookedFromCta },
          leadToBookedSubMetrics: { totalLeads, totalBooked },
          callDispositions, callSentiment, callTriggers,
          totalSmsSent, totalSmsReceived, smsReplyRate, avgSmsPerLead,
          convoAIOutcomes, sequenceEffectiveness,
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
