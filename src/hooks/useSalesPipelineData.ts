import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PipelineData {
  booked: number;
  showed: number;
  offered: number;
  closed: number;
  noShows: number;
  noShowRate: number;
  offerRate: number;
  closeRate: number;
  totalContractValue: number;
  cashCollected: number;
  loading: boolean;
  error: string | null;
}

const defaultState: PipelineData = {
  booked: 0, showed: 0, offered: 0, closed: 0,
  noShows: 0, noShowRate: 0, offerRate: 0, closeRate: 0,
  totalContractValue: 0, cashCollected: 0,
  loading: true, error: null,
};

function safeRate(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

export function useSalesPipelineData(): PipelineData {
  const [data, setData] = useState<PipelineData>(defaultState);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: appts, error } = await supabase.from('appointments').select('*');
        if (error) throw error;
        const all = appts || [];

        const booked  = all.length;
        const noShows = all.filter((a: any) => a.status === 'no_show').length;
        const showed  = all.filter((a: any) => ['showed', 'offered', 'closed'].includes(a.status)).length;
        const offered = all.filter((a: any) => ['offered', 'closed'].includes(a.status)).length;
        const closed  = all.filter((a: any) => a.status === 'closed').length;

        const totalContractValue = all.reduce((s: number, a: any) => s + (Number(a.contract_value) || 0), 0);
        const cashCollected      = all.reduce((s: number, a: any) => s + (Number(a.cash_collected) || 0), 0);

        setData({
          booked, showed, offered, closed, noShows,
          noShowRate:   safeRate(noShows, booked),
          offerRate:    safeRate(offered, showed),
          closeRate:    safeRate(closed, offered),
          totalContractValue, cashCollected,
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
