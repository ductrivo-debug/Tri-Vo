import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { supabase } from '../services/supabase';

type Store = Record<string, unknown>;
type Context = { values: Store; change: (key: string, action: React.SetStateAction<any>, fallback: unknown) => void };
const DataContext = createContext<Context | null>(null);

export function PersonalData({ userId, initial, children }: { userId: string | null; initial: Store; children: React.ReactNode }) {
  const [values, setValues] = useState(initial);
  const current = useRef(initial);
  const pending = useRef<Store>({});
  const queue = useRef(Promise.resolve());
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const flush = useCallback(() => {
    queue.current = queue.current.then(async () => {
      for (const key of Object.keys(pending.current)) {
        const value = pending.current[key];
        try {
          if (userId && supabase) {
            const { error } = await supabase.from('user_data').upsert({ user_id: userId, key, value }, { onConflict: 'user_id,key' });
            if (error) throw error;
          } else localStorage.setItem('silverback-beta-demo:' + key, JSON.stringify(value));
          if (pending.current[key] === value) delete pending.current[key];
        } catch {
          setStatus('Chưa lưu được thay đổi. Giữ trang mở và thử lại.');
          setFailed(true);
          return;
        }
      }
      setFailed(false);
      setStatus('Đã lưu');
    });
  }, [userId]);
  const change = useCallback((key: string, action: React.SetStateAction<any>, fallback: unknown) => {
    const previous = Object.hasOwn(current.current, key) ? current.current[key] : fallback;
    const value = typeof action === 'function' ? action(previous) : action;
    current.current = { ...current.current, [key]: value };
    pending.current[key] = value;
    setValues(current.current);
    setStatus('Đang lưu…');
    flush();
  }, [flush]);
  React.useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  return <DataContext.Provider value={{ values, change }}>
    <div className="text-center text-xs text-slate-300 p-2" role="status">{status} {failed && <button className="underline" onClick={flush}>Thử lưu lại</button>}</div>
    {children}
  </DataContext.Provider>;
}
export function usePersonalState<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const context = useContext(DataContext);
  if (!context) throw new Error('Missing PersonalData');
  const { values, change } = context;
  const setter = useCallback((action: React.SetStateAction<T>) => change(key, action, fallback), [change, key]);
  return [(Object.hasOwn(values, key) ? values[key] : fallback) as T, setter];
}

