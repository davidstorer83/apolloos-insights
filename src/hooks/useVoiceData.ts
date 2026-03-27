import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VoiceData {
  // KPIs
  callsMade: number;
  callsAnswered: number;
  answerRate: number;
  bookingsVoice: number;
  avgCallDuration: string;
  // Outcomes
  callOutcomes: { label: string; value: number; color: string }[];
  // Sentiment
  sentiment: { positive: number; neutral: number; negative: number };
  // Performance over time (daily)
  performanceData: { day: string; calls: number; bookings: number }[];
  // Sentiment trend
  sentimentTrend: { day: string; score: number }[];
  // Flagged calls
  flaggedCalls: { id: string; reason: string; time: string }[];
  // Sparklines (last 7 periods)
  sparkCalls: { day: number; value: number }[];
  sparkAnswered: { day: number; value: number }[];
  sparkBookings: { day: number; value: number }[];
  sparkDuration: { day: number; value: number }[];
  // Period-over-period changes
  changeCalls: number;
  changeAnswered: number;
  changeBookings: number;
  changeDuration: number;
  // Call trigger breakdown
  callTriggerBreakdown: { trigger: string; count: number; color: string }[];
  // Follow-up sequence
  sequenceAttempts: number;
  sequenceAnswered: number;
  sequenceBooked: number;
  sequenceOutcomes: { label: string; value: number; color: string }[];
  // Loading state
  loading: boolean;
  error: string | null;
}

const defaultState: VoiceData = {
  callsMade: 0, callsAnswered: 0, answerRate: 0, bookingsVoice: 0,
  avgCallDuration: '0:00', callOutcomes: [],
  sentiment: { positive: 0, neutral: 0, negative: 0 },
  performanceData: [], sentimentTrend: [], flaggedCalls: [],
  sparkCalls: [], sparkAnswered: [], sparkBookings: [], sparkDuration: [],
  changeCalls: 0, changeAnswered: 0, changeBookings: 0, changeDuration: 0,
  callTriggerBreakdown: [],
  sequenceAttempts: 0, sequenceAnswered: 0, sequenceBooked: 0, sequenceOutcomes: [],
  loading: true, error: null,
};

function parseDisposition(raw: string): string {
  if (!raw) return 'other';
  const match = raw.match(/call_outcome:\s*([^,\n]+)/i);
  if (match) return match[1].trim().toLowerCase();
  const clean = raw.trim().toLowerCase();
  if (['booked', 'callback', 'not_interested', 'not_qualified', 'voicemail', 'no_answer', 'dnd'].includes(clean)) return clean;
  return 'other';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

export function useVoiceData(): VoiceData {
  const [data, setData] = useState<VoiceData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: calls, error } = await supabase
          .from('calls')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!calls || calls.length === 0) {
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        // ── Basic KPIs ──
        const callsMade = calls.length;
        const callsAnswered = calls.filter((c: any) =>
          c.answered === true || c.answered === 'true' || c.answered === 'TRUE'
        ).length;
        const answerRate = callsMade > 0 ? Math.round((callsAnswered / callsMade) * 1000) / 10 : 0;

        const dispositions = calls.map((c: any) => parseDisposition(c.disposition));
        const bookingsVoice = dispositions.filter(d => d === 'booked' || d === 'appointment booked').length;

        const durations = calls.map((c: any) => Number(c.duration_seconds) || 0).filter(d => d > 0);
        const avgDurationSec = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

        // ── Outcome breakdown ──
        const outcomeCounts: Record<string, number> = {};
        dispositions.forEach(d => { outcomeCounts[d] = (outcomeCounts[d] || 0) + 1; });
        const outcomeColors: Record<string, string> = {
          'booked': '#34d399', 'appointment booked': '#34d399',
          'callback': '#14e6eb', 'requested a callback': '#14e6eb',
          'not_interested': '#6366f1', 'not interested': '#6366f1',
          'not_qualified': '#f59e0b', 'do not qualify': '#f59e0b',
          'voicemail': '#64748b', 'no_answer': '#64748b', 'no answer': '#64748b',
          'dnd': '#ef4444', 'other': '#888888',
        };
        const callOutcomes = Object.entries(outcomeCounts)
          .map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' '),
            value,
            color: outcomeColors[label] || '#888888',
          }))
          .sort((a, b) => b.value - a.value);

        // ── Sentiment ──
        const sentiments = calls.map((c: any) => (c.sentiment || 'neutral').toLowerCase());
        const sentTotal = sentiments.length || 1;
        const sentiment = {
          positive: Math.round((sentiments.filter((s: string) => s === 'positive').length / sentTotal) * 1000) / 10,
          neutral:  Math.round((sentiments.filter((s: string) => s === 'neutral').length  / sentTotal) * 1000) / 10,
          negative: Math.round((sentiments.filter((s: string) => s === 'negative').length / sentTotal) * 1000) / 10,
        };

        // ── Daily performance (last 30 days) ──
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const dailyMap: Record<string, { calls: number; bookings: number; sentimentSum: number; sentimentCount: number }> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date(thirtyDaysAgo.getTime() + i * 86400000);
          dailyMap[d.toISOString().split('T')[0]] = { calls: 0, bookings: 0, sentimentSum: 0, sentimentCount: 0 };
        }
        calls.forEach((c: any, idx: number) => {
          const day = (c.created_at || '').split('T')[0];
          if (dailyMap[day]) {
            dailyMap[day].calls++;
            if (dispositions[idx] === 'booked' || dispositions[idx] === 'appointment booked') dailyMap[day].bookings++;
            const sentScore = (c.sentiment || '').toLowerCase() === 'positive' ? 100 : (c.sentiment || '').toLowerCase() === 'negative' ? 0 : 50;
            dailyMap[day].sentimentSum += sentScore;
            dailyMap[day].sentimentCount++;
          }
        });

        const sorted = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));
        const performanceData = sorted.map(([day, v]) => ({
          day: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          calls: v.calls,
          bookings: v.bookings,
        }));
        const sentimentTrend = sorted.map(([day, v]) => ({
          day: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: v.sentimentCount > 0 ? Math.round(v.sentimentSum / v.sentimentCount) : 50,
        }));

        // ── Sparklines (last 7 days) ──
        const last7 = sorted.slice(-7);
        const sparkCalls    = last7.map(([_, v], i) => ({ day: i, value: v.calls }));
        const sparkBookings = last7.map(([_, v], i) => ({ day: i, value: v.bookings }));
        const sparkAnswered = last7.map(([day, _], i) => ({
          day: i,
          value: calls.filter((c: any) =>
            (c.created_at || '').startsWith(day) &&
            (c.answered === true || c.answered === 'true' || c.answered === 'TRUE')
          ).length,
        }));
        const sparkDuration = last7.map(([day, _], i) => {
          const durs = calls
            .filter((c: any) => (c.created_at || '').startsWith(day))
            .map((c: any) => Number(c.duration_seconds) || 0)
            .filter((d: number) => d > 0);
          return { day: i, value: durs.length > 0 ? Math.round(durs.reduce((a: number, b: number) => a + b, 0) / durs.length) : 0 };
        });

        // ── Period-over-period changes ──
        const sevenDaysAgo    = new Date(now.getTime() - 7 * 86400000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
        const thisWeek = calls.filter((c: any) => new Date(c.created_at) >= sevenDaysAgo);
        const lastWeek = calls.filter((c: any) => new Date(c.created_at) >= fourteenDaysAgo && new Date(c.created_at) < sevenDaysAgo);

        const twAnswered = thisWeek.filter((c: any) => c.answered === true || c.answered === 'true').length;
        const lwAnswered = lastWeek.filter((c: any) => c.answered === true || c.answered === 'true').length;
        const twDisp = thisWeek.map((c: any) => parseDisposition(c.disposition));
        const lwDisp = lastWeek.map((c: any) => parseDisposition(c.disposition));
        const twBookings = twDisp.filter(d => d === 'booked' || d === 'appointment booked').length;
        const lwBookings = lwDisp.filter(d => d === 'booked' || d === 'appointment booked').length;
        const twDurs = thisWeek.map((c: any) => Number(c.duration_seconds) || 0).filter((d: number) => d > 0);
        const lwDurs = lastWeek.map((c: any) => Number(c.duration_seconds) || 0).filter((d: number) => d > 0);
        const twAvgDur = twDurs.length > 0 ? twDurs.reduce((a: number, b: number) => a + b, 0) / twDurs.length : 0;
        const lwAvgDur = lwDurs.length > 0 ? lwDurs.reduce((a: number, b: number) => a + b, 0) / lwDurs.length : 0;

        // ── Flagged calls ──
        const flaggedCalls = calls
          .filter((c: any) => {
            const sent    = (c.sentiment || '').toLowerCase();
            const summary = (c.call_summary || '').toLowerCase();
            return sent === 'negative' || summary.includes('error') || summary.includes('frustrat') || summary.includes('confused') || summary.includes('wrong');
          })
          .slice(0, 5)
          .map((c: any) => ({
            id:     (c.retell_call_id || c.id || '').slice(-8),
            reason: c.call_summary ? c.call_summary.slice(0, 60) + (c.call_summary.length > 60 ? '...' : '') : 'Negative sentiment detected',
            time:   timeAgo(c.created_at),
          }));

        // ── Call trigger breakdown ──
        const triggerColors: Record<string, string> = {
          immediate:          '#14e6eb',
          convo_ai_request:   '#34d399',
          scheduled_callback: '#6366f1',
          sequence_attempt:   '#f59e0b',
        };
        const triggerMap: Record<string, number> = {
          immediate: 0, convo_ai_request: 0, scheduled_callback: 0, sequence_attempt: 0,
        };
        calls.forEach((c: any) => {
          const t = (c.call_trigger || 'immediate').toLowerCase();
          if (triggerMap[t] !== undefined) triggerMap[t]++;
          else triggerMap['immediate']++;
        });
        const callTriggerBreakdown = Object.entries(triggerMap)
          .map(([trigger, count]) => ({
            trigger: trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            count,
            color: triggerColors[trigger] || '#888888',
          }));

        // ── Follow-up sequence ──
        const sequenceCalls = calls.filter((c: any) =>
          (c.call_trigger || '').toLowerCase() === 'sequence_attempt'
        );
        const sequenceAttempts = sequenceCalls.length;
        const sequenceAnswered = sequenceCalls.filter((c: any) =>
          c.answered === true || c.answered === 'true' || c.answered === 'TRUE'
        ).length;
        const seqDisps = sequenceCalls.map((c: any) => parseDisposition(c.disposition));
        const sequenceBooked = seqDisps.filter(d => d === 'booked' || d === 'appointment booked').length;

        const seqOutcomeMap: Record<string, number> = {};
        seqDisps.forEach(d => { seqOutcomeMap[d] = (seqOutcomeMap[d] || 0) + 1; });
        const sequenceOutcomes = Object.entries(seqOutcomeMap)
          .map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' '),
            value,
            color: outcomeColors[label] || '#888888',
          }))
          .sort((a, b) => b.value - a.value);

        setData({
          callsMade, callsAnswered, answerRate, bookingsVoice,
          avgCallDuration: formatDuration(avgDurationSec),
          callOutcomes, sentiment, performanceData, sentimentTrend, flaggedCalls,
          sparkCalls, sparkAnswered, sparkBookings, sparkDuration,
          changeCalls:    pctChange(thisWeek.length, lastWeek.length),
          changeAnswered: pctChange(twAnswered, lwAnswered),
          changeBookings: pctChange(twBookings, lwBookings),
          changeDuration: pctChange(twAvgDur, lwAvgDur),
          callTriggerBreakdown,
          sequenceAttempts, sequenceAnswered, sequenceBooked, sequenceOutcomes,
          loading: false, error: null,
        });
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
    fetchData();
  }, []);

  return data;
}
