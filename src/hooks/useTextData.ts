import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function safeRate(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function formatHours(hrs: number): string {
  if (hrs <= 0) return '';
  if (hrs < 1) return `${Math.round(hrs * 60)}m`;
  if (hrs < 48) return `${hrs.toFixed(1)}h`;
  return `${(hrs / 24).toFixed(1)}d`;
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

export interface TextData {
  // Hero KPIs
  textLeads: number;
  smsSent: number;
  repliesReceived: number;
  replyRate: number;
  bookingsText: number;
  // SMS engagement
  totalMessagesSent: number;
  avgMsgsToFirstReply: number;
  avgMsgsToBooking: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  // ConvoAI
  convoAIActivations: number;
  ctaDelivered: number;
  ctaResponses: { label: string; value: number; color: string }[];
  // Calls from text
  callsFromText: number;
  callAnswerRate: number;
  callOutcomes: { label: string; value: number; color: string }[];
  // Funnel
  funnel: { label: string; count: number; pct: number; negative?: boolean }[];
  // Avg time to reach each funnel stage (from lead created_at to stage_entered_at)
  funnelTimings: { label: string; formatted: string }[];
  // Message volume chart (30 days)
  messageVolume: { day: string; sent: number; replies: number }[];
  // Platform breakdown
  platformBreakdown: {
    platform: string;
    conversations: number;
    replies: number;
    replyRate: number;
    bookings: number;
    bookingRate: number;
  }[];
  // Sparklines
  sparkLeads: { day: number; value: number }[];
  sparkSms: { day: number; value: number }[];
  sparkReplies: { day: number; value: number }[];
  sparkBookings: { day: number; value: number }[];
  // Changes
  changeLeads: number;
  changeSms: number;
  changeReplies: number;
  changeBookings: number;
  loading: boolean;
  error: string | null;
}

const defaultState: TextData = {
  textLeads: 0, smsSent: 0, repliesReceived: 0, replyRate: 0, bookingsText: 0,
  totalMessagesSent: 0, avgMsgsToFirstReply: 0, avgMsgsToBooking: 0,
  sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
  convoAIActivations: 0, ctaDelivered: 0, ctaResponses: [],
  callsFromText: 0, callAnswerRate: 0, callOutcomes: [],
  funnel: [], funnelTimings: [], messageVolume: [], platformBreakdown: [],
  sparkLeads: [], sparkSms: [], sparkReplies: [], sparkBookings: [],
  changeLeads: 0, changeSms: 0, changeReplies: 0, changeBookings: 0,
  loading: true, error: null,
};

export function useTextData(source?: string): TextData {
  const [data, setData] = useState<TextData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        // ── Text-first leads ──
        let leadsQuery = supabase.from('leads').select('*').eq('engagement_method', 'text_first');
        if (source && source !== 'All Sources') leadsQuery = leadsQuery.eq('source', source);
        const { data: leadsRaw } = await leadsQuery;
        const allLeads = leadsRaw || [];

        // ── SMS events ──
        const { data: smsRaw } = await supabase.from('sms_events').select('*');
        const allSms = smsRaw || [];

        // ── Calls triggered from text system ──
        const { data: callsRaw } = await supabase
          .from('calls')
          .select('*')
          .in('call_trigger', ['convo_ai_request', 'scheduled_callback']);
        const allCalls = callsRaw || [];

        // ── Appointments from text system ──
        const { data: apptsRaw } = await supabase
          .from('appointments')
          .select('*')
          .in('booking_source', ['convo_ai_text', 'retell_from_text', 'manual']);
        const textAppts = apptsRaw || [];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

        const textLeads = allLeads.length;
        const outbound = allSms.filter((s: any) => s.direction === 'outbound' || s.type === 'sent');
        const inbound = allSms.filter((s: any) => s.direction === 'inbound' || s.type === 'received');
        const smsSent = outbound.length;
        const repliesReceived = inbound.length;
        const replyRate = safeRate(repliesReceived, smsSent);
        const bookingsText = textAppts.length;

        // ── Sentiment from sms_events ──
        const sentiments = allSms.map((s: any) => (s.sentiment || 'neutral').toLowerCase());
        const sentTotal = sentiments.length || 1;
        const sentimentBreakdown = {
          positive: Math.round((sentiments.filter((s: string) => s === 'positive').length / sentTotal) * 1000) / 10,
          neutral: Math.round((sentiments.filter((s: string) => s === 'neutral').length / sentTotal) * 1000) / 10,
          negative: Math.round((sentiments.filter((s: string) => s === 'negative').length / sentTotal) * 1000) / 10,
        };

        // ── ConvoAI ──
        const convoAIActivations = allLeads.filter((l: any) =>
          l.convo_ai_activated === true || l.status === 'convo_ai'
        ).length;
        const ctaDelivered = allLeads.filter((l: any) =>
          ['cta_sent', 'booked'].includes(l.status)
        ).length;

        const ctaYes   = allLeads.filter((l: any) => l.cta_response === 'yes_call').length;
        const ctaLater = allLeads.filter((l: any) => l.cta_response === 'call_later').length;
        const ctaChat  = allLeads.filter((l: any) => l.cta_response === 'stay_in_chat').length;
        const ctaNo    = allLeads.filter((l: any) => l.cta_response === 'not_interested').length;
        const ctaResponses = [
          { label: 'Yes, call now',    value: ctaYes,   color: '#34d399' },
          { label: 'Call later',       value: ctaLater, color: '#14e6eb' },
          { label: 'Stay in chat',     value: ctaChat,  color: '#6366f1' },
          { label: 'Not interested',   value: ctaNo,    color: '#ef4444' },
        ];

        // ── Calls from text ──
        const callsFromText = allCalls.length;
        const answeredCalls = allCalls.filter((c: any) =>
          c.answered === true || c.answered === 'true' || c.answered === 'TRUE'
        ).length;
        const callAnswerRate = safeRate(answeredCalls, callsFromText);

        const outcomeColors: Record<string, string> = {
          booked: '#34d399', 'appointment booked': '#34d399',
          callback: '#14e6eb', not_interested: '#6366f1',
          not_qualified: '#f59e0b', voicemail: '#64748b',
          no_answer: '#64748b', dnd: '#ef4444', other: '#888888',
        };
        const outcomeMap: Record<string, number> = {};
        allCalls.forEach((c: any) => {
          const d = (c.disposition || 'other').toLowerCase();
          outcomeMap[d] = (outcomeMap[d] || 0) + 1;
        });
        const callOutcomes = Object.entries(outcomeMap)
          .map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' '),
            value,
            color: outcomeColors[label] || '#888888',
          }))
          .sort((a, b) => b.value - a.value);

        // ── Funnel ──
        const funnelBase = textLeads || 1;
        const notInterested = allLeads.filter((l: any) => l.current_stage === 'not_interested').length;
        const notQualified  = allLeads.filter((l: any) => l.current_stage === 'not_qualified').length;
        const dnd           = allLeads.filter((l: any) => l.current_stage === 'dnd').length;
        const funnel = [
          { label: 'Lead',          count: textLeads,          pct: 100 },
          { label: 'SMS Sent',      count: smsSent,            pct: safeRate(smsSent, funnelBase) },
          { label: 'Reply',         count: repliesReceived,    pct: safeRate(repliesReceived, funnelBase) },
          { label: 'ConvoAI',       count: convoAIActivations, pct: safeRate(convoAIActivations, funnelBase) },
          { label: 'CTA',           count: ctaDelivered,       pct: safeRate(ctaDelivered, funnelBase) },
          { label: 'Booking',       count: bookingsText,       pct: safeRate(bookingsText, funnelBase) },
          { label: 'Not Interested', count: notInterested,     pct: safeRate(notInterested, funnelBase), negative: true },
          { label: 'Not Qualified',  count: notQualified,      pct: safeRate(notQualified, funnelBase),  negative: true },
          { label: 'DND',            count: dnd,               pct: safeRate(dnd, funnelBase),           negative: true },
        ];

        // ── Funnel timings (avg time from created_at to stage_entered_at) ──
        const stageTimingMap = [
          { label: 'SMS Sent', stages: ['contacted', 'sms_sent'] },
          { label: 'Reply',    stages: ['replied'] },
          { label: 'ConvoAI', stages: ['convo_ai', 'convo_ai_active', 'engaged'] },
          { label: 'CTA',     stages: ['cta_sent'] },
          { label: 'Booking', stages: ['booked'] },
        ];
        const funnelTimings = stageTimingMap.map(({ label, stages }) => {
          const staged = allLeads.filter((l: any) =>
            (stages.includes(l.status || '') || stages.includes(l.current_stage || '')) &&
            l.stage_entered_at && l.created_at
          );
          const avgMs = staged.length > 0
            ? staged.reduce((s: number, l: any) =>
                s + Math.max(0, new Date(l.stage_entered_at).getTime() - new Date(l.created_at).getTime()), 0
              ) / staged.length
            : -1;
          return { label, formatted: avgMs >= 0 ? formatHours(avgMs / 3600000) : '' };
        });

        // ── Message volume (last 30 days) ──
        const dailyVol: Record<string, { sent: number; replies: number }> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date(now.getTime() - (29 - i) * 86400000).toISOString().split('T')[0];
          dailyVol[d] = { sent: 0, replies: 0 };
        }
        allSms.forEach((s: any) => {
          const d = (s.created_at || '').split('T')[0];
          if (dailyVol[d]) {
            if (s.direction === 'outbound' || s.type === 'sent') dailyVol[d].sent++;
            else dailyVol[d].replies++;
          }
        });
        const messageVolume = Object.entries(dailyVol)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, v]) => ({
            day: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sent: v.sent,
            replies: v.replies,
          }));

        // ── Platform breakdown ──
        const platforms = ['SMS', 'Instagram DM', 'Facebook DM', 'TikTok DM'];
        const platformBreakdown = platforms.map(p => {
          const pSms = allSms.filter((s: any) => (s.channel || s.platform || 'SMS') === p);
          const pOut = pSms.filter((s: any) => s.direction === 'outbound' || s.type === 'sent').length;
          const pIn  = pSms.filter((s: any) => s.direction === 'inbound'  || s.type === 'received').length;
          const pBookings = textAppts.filter((a: any) => (a.channel || a.platform || 'SMS') === p).length;
          return {
            platform: p,
            conversations: pOut,
            replies: pIn,
            replyRate: safeRate(pIn, pOut),
            bookings: pBookings,
            bookingRate: safeRate(pBookings, pOut),
          };
        });

        // ── Sparklines ──
        const sparkDays = Array.from({ length: 7 }, (_, i) =>
          new Date(now.getTime() - (6 - i) * 86400000).toISOString().split('T')[0]
        );
        const sparkLeads   = sparkDays.map((d, i) => ({ day: i, value: allLeads.filter((l: any) => (l.created_at || '').startsWith(d)).length }));
        const sparkSms     = sparkDays.map((d, i) => ({ day: i, value: outbound.filter((s: any) => (s.created_at || '').startsWith(d)).length }));
        const sparkReplies = sparkDays.map((d, i) => ({ day: i, value: inbound.filter((s: any) => (s.created_at || '').startsWith(d)).length }));
        const sparkBookings = sparkDays.map((d, i) => ({ day: i, value: textAppts.filter((a: any) => (a.created_at || '').startsWith(d)).length }));

        // ── Week-over-week changes ──
        const tw = (arr: any[]) => arr.filter(x => new Date(x.created_at) >= sevenDaysAgo).length;
        const lw = (arr: any[]) => arr.filter(x => new Date(x.created_at) >= fourteenDaysAgo && new Date(x.created_at) < sevenDaysAgo).length;

        setData({
          textLeads, smsSent, repliesReceived, replyRate, bookingsText,
          totalMessagesSent: smsSent,
          avgMsgsToFirstReply: 0,
          avgMsgsToBooking: 0,
          sentimentBreakdown,
          convoAIActivations, ctaDelivered, ctaResponses,
          callsFromText, callAnswerRate, callOutcomes,
          funnel, funnelTimings, messageVolume, platformBreakdown,
          sparkLeads, sparkSms, sparkReplies, sparkBookings,
          changeLeads:   pctChange(tw(allLeads),    lw(allLeads)),
          changeSms:     pctChange(tw(outbound),    lw(outbound)),
          changeReplies: pctChange(tw(inbound),     lw(inbound)),
          changeBookings: pctChange(tw(textAppts),  lw(textAppts)),
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
