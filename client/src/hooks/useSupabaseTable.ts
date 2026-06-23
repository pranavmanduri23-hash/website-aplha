import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Options {
  orderBy?: string;
  ascending?: boolean;
}

export function useSupabaseTable<T extends { id: string | number }>(
  table: string,
  { orderBy = 'id', ascending = true }: Options = {},
) {
  const [rows, setRows]       = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending });
    if (err) { setError(err.message); return; }
    setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table, orderBy, ascending]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    channelRef.current = supabase
      .channel(`${table}_realtime`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => fetchAll(),
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [table, fetchAll]);

  const insert = useCallback(async (row: Omit<T, 'id'>) => {
    const { error: err } = await supabase.from(table).insert([row]);
    if (err) throw err;
  }, [table]);

  const update = useCallback(async (id: string | number, patch: Partial<T>) => {
    const { error: err } = await supabase.from(table).update(patch).eq('id', id);
    if (err) throw err;
  }, [table]);

  const remove = useCallback(async (id: string | number) => {
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (err) throw err;
  }, [table]);

  return { rows, loading, error, insert, update, remove, refetch: fetchAll };
}
