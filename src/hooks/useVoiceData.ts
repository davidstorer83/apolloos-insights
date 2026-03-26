import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CallRecord {
  id: string;
  ghl_contact_id: string;
  retell_call_id: string;
  call_summary: string;
  duration_seconds: number;
  status: string;
  sentiment: string;
  answered: boolean;
  transcript: string;
  recording_url: string;
  disposition: string;
  created_at: string;
}

interface VoiceData {
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
  // Loading state
  loading: boolean;
  error: string | null;
}

function parseDisposition(raw: string): string {
  // The disposition field from Sympana comes as "call_outcome: voicemail,\ncallback_time: ,"
  // Extract just the call_outcome value
  if (!raw) return 'other';
  const match = raw.match(/call_outcome:\s*([^,\n]+)/i);
  if (match) return match[1].trim().toLowerCase();
  // If it's already a clean value
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
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Math.floor(d.getTime() / (7 * 86400000));
}

export function useVoiceData(): VoiceData {
  const [data, setData] = useState<VoiceData>({
    callsMade: 0, callsAnswered: 0, answerRate: 0, bookingsVoice: 0,
    avgCallDuration: '0:00', callOutcomes: [], sentiment: { positive: 0, neutral: 0, negative: 0 },
    performanceData: [], sentimentTrend: [], flaggedCalls: [],
    sparkCalls: [], sparkAnswered: [], sparkBookings: [], sparkDuration: [],
    changeCalls: 0, changeAnswered: 0, changeBookings: 0, changeDuration: 0,
    loading: true, error: null,
  });

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
        const callsAnswered = calls.filter(c => c.answered === true || c.answered === 'true' || c.answered === 'TRUE').length;
        const answerRate = callsMade > 0 ? Math.round((callsAnswered / callsMade) * 1000) / 10 : 0;

        // Parse dispositions
        const dispositions = calls.map(c => parseDisposition(c.disposition));
        const bookingsVoice = dispositions.filter(d => d === 'booked' || d === 'appointment booked').length;

        // Avg call duration
        const durations = calls.map(c => Number(c.duration_seconds) || 0).filter(d => d > 0);
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
          'dnd': '#ef4444',
          'other': '#888888',
        };

        const callOutcomes = Object.entries(outcomeCounts)
          .map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' '),
            value,
            color: outcomeColors[label] || '#888888',
          }))
          .sort((a, b) => b.value - a.value);

        // ── Sentiment ──
        const sentiments = calls.map(c => (c.sentiment || 'neutral').toLowerCase());
        const sentTotal = sentiments.length || 1;
        const sentiment = {
          positive: Math.round((sentiments.filter(s => s === 'positive').length / sentTotal) * 1000) / 10,
          neutral: Math.round((sentiments.filter(s => s === 'neutral').length / sentTotal) * 1000) / 10,
          negative: Math.round((sentiments.filter(s => s === 'negative').length / sentTotal) * 1000) / 10,
        };

        // ── Daily performance data (last 30 days) ──
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const dailyMap: Record<string, { calls: number; bookings: number; sentimentSum: number; sentimentCount: number }> = {};

        for (let i = 0; i < 30; i++) {
          const d = new Date(thirtyDaysAgo.getTime() + i * 86400000);
          const key = d.toISOString().split('T')[0];
          dailyMap[key] = { calls: 0, bookings: 0, sentimentSum: 0, sentimentCount: 0 };
        }

        calls.forEach((c, idx) => {
          const day = (c.created_at || '').split('T')[0];
          if (dailyMap[day]) {
            dailyMap[day].calls++;
            const disp = dispositions[idx];
            if (disp === 'booked' || disp === 'appointment booked') dailyMap[day].bookings++;
            const sent = (c.sentiment || '').toLowerCase();
            const sentScore = sent === 'positive' ? 100 : sent === 'negative' ? 0 : 50;
            dailyMap[day].sentimentSum += sentScore;
            dailyMap[day].sentimentCount++;
          }
        });

        const performanceData = Object.entries(dailyMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, v]) => ({
            day: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calls: v.calls,
            bookings: v.bookings,
          }));

        const sentimentTrend = Object.entries(dailyMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, v]) => ({
            day: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: v.sentimentCount > 0 ? Math.round(v.sentimentSum / v.sentimentCount) : 50,
          }));

        // ── Sparklines (last 7 days) ──
        const last7 = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
        const sparkCalls = last7.map(([_, v], i) => ({ day: i, value: v.calls }));
        const sparkAnswered = last7.map(([day, _], i) => {
          const dayCalls = calls.filter(c => (c.created_at || '').startsWith(day));
          return { day: i, value: dayCalls.filter(c => c.answered === true || c.answered === 'true' || c.answered === 'TRUE').length };
        });
        const sparkBookings = last7.map(([_, v], i) => ({ day: i, value: v.bookings }));
        const sparkDuration = last7.map(([day, _], i) => {
          const dayCalls = calls.filter(c => (c.created_at || '').startsWith(day));
          const durs = dayCalls.map(c => Number(c.duration_seconds) || 0).filter(d => d > 0);
          return { day: i, value: durs.length > 0 ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : 0 };
        });

        // ── Period-over-period changes (this week vs last week) ──
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

        const thisWeekCalls = calls.filter(c => new Date(c.created_at) >= sevenDaysAgo);
        const lastWeekCalls = calls.filter(c => new Date(c.created_at) >= fourteenDaysAgo && new Date(c.created_at) < sevenDaysAgo);

        function pctChange(curr: number, prev: number): number {
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
        }

        const twAnswered = thisWeekCalls.filter(c => c.answered === true || c.answered === 'true').length;
        const lwAnswered = lastWeekCalls.filter(c => c.answered === true || c.answered === 'true').length;
        const twDisp = thisWeekCalls.map(c => parseDisposition(c.disposition));
        const lwDisp = lastWeekCalls.map(c => parseDisposition(c.disposition));
        const twBookings = twDisp.filter(d => d === 'booked' || d === 'appointment booked').length;
        const lwBookings = lwDisp.filter(d => d === 'booked' || d === 'appointment booked').length;
        const twDurs = thisWeekCalls.map(c => Number(c.duration_seconds) || 0).filter(d => d > 0);
        const lwDurs = lastWeekCalls.map(c => Number(c.duration_seconds) || 0).filter(d => d > 0);
        const twAvgDur = twDurs.length > 0 ? twDurs.reduce((a, b) => a + b, 0) / twDurs.length : 0;
        const lwAvgDur = lwDurs.length > 0 ? lwDurs.reduce((a, b) => a + b, 0) / lwDurs.length : 0;

        // ── Flagged calls (negative sentiment or errors) ──
        const flaggedCalls = calls
          .filter(c => {
            const sent = (c.sentiment || '').toLowerCase();
            const summary = (c.call_summary || '').toLowerCase();
            return sent === 'negative' || summary.includes('error') || summary.includes('frustrat') || summary.includes('confused') || summary.includes('wrong');
          })
          .slice(0, 5)
          .map(c => ({
            id: (c.retell_call_id || c.id || '').slice(-8),
            reason: c.call_summary ? c.call_summary.slice(0, 60) + (c.call_summary.length > 60 ? '...' : '') : 'Negative sentiment detected',
            time: timeAgo(c.created_at),
          }));

        setData({
          callsMade,
          callsAnswered,
          answerRate,
          bookingsVoice,
          avgCallDuration: formatDuration(avgDurationSec),
          callOutcomes,
          sentiment,
          performanceData,
          sentimentTrend,
          flaggedCalls,
          sparkCalls,
          sparkAnswered,
          sparkBookings,
          sparkDuration,
          changeCalls: pctChange(thisWeekCalls.length, lastWeekCalls.length),
          changeAnswered: pctChange(twAnswered, lwAnswered),
          changeBookings: pctChange(twBookings, lwBookings),
          changeDuration: pctChange(twAvgDur, lwAvgDur),
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }

    fetchData();
  }, []);

  return data;
}
