import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { PersonalData } from '../contexts/PersonalData';
import App from '../App';

const keys = ['workoutSettings','soundSettings','allExercises','playlist','workoutHistory','workoutPlans','musicPlaylist'];
export default function BetaApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [demo, setDemo] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage('Không khôi phục được đăng nhập. Vui lòng đăng nhập lại.');
      setSession(data.session); setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next); setReady(true);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    let active = true;
    setInitial(null);
    if (session && supabase && !demo) {
      supabase.from('user_data').select('key,value').eq('user_id', session.user.id).then(({ data, error }) => {
        if (!active) return;
        if (error) { setMessage('Không tải được dữ liệu cá nhân. Hãy thử tải lại.'); return; }
        setMessage('');
        setLoadedFor(session.user.id);
        setInitial(Object.fromEntries((data ?? []).map(row => [row.key, row.value])));
      });
    } else if (demo) {
      const values: Record<string, unknown> = {};
      for (const key of keys) {
        try { const raw = localStorage.getItem('silverback-beta-demo:' + key); if (raw) values[key] = JSON.parse(raw); } catch {}
      }
      setLoadedFor('demo');
      setInitial(values);
    }
    return () => { active = false; };
  }, [session?.user.id, demo, retry]);
  async function authenticate(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const { data, error } = signup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setPassword('');
      if (signup && !data.session) setMessage('Hãy kiểm tra email để xác nhận tài khoản, rồi đăng nhập.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể đăng nhập. Hãy thử lại.'); }
    finally { setBusy(false); }
  }
  if (!ready) return <p className="p-6" role="status">Đang khôi phục đăng nhập…</p>;
  if (session || demo) return <>
    <div className="flex justify-between gap-3 p-3 bg-slate-800 text-sm">
      <span>{demo ? 'BẢN THỬ · Dữ liệu trên thiết bị này' : session?.user.email}</span>
      <button onClick={async () => {
        if (!window.confirm('Rời phiên tập? Hãy đợi trạng thái “Đã lưu” trước khi tiếp tục.')) return;
        if (!demo && supabase) { const { error } = await supabase.auth.signOut(); if (error) { setMessage(error.message); return; } }
        setDemo(false); setInitial(null); setMessage('');
      }}>{demo ? 'Về đăng nhập' : 'Đăng xuất'}</button>
    </div>
    {initial && loadedFor === (demo ? 'demo' : session?.user.id) ? <PersonalData key={demo ? 'demo' : session!.user.id} userId={demo ? null : session!.user.id} initial={initial}><App /></PersonalData>
      : <div className="p-6" role="status">{message || 'Đang tải dữ liệu cá nhân…'} {message && <button className="underline" onClick={() => setRetry(v => v + 1)}>Tải lại</button>}</div>}
  </>;
  return <main className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
    <section className="w-full max-w-sm space-y-5">
      <header><p className="text-red-400 text-sm">BẢN THỬ NGHIỆM</p><h1 className="text-4xl font-bold">SILVERBACK <span className="text-red-500">MMA</span></h1>
      <p className="text-slate-300 mt-3">Tập theo nhịp của bạn. Lưu giáo án và lịch sử riêng.</p></header>
      {supabase ? <form onSubmit={authenticate} className="space-y-4">
        <h2 className="text-xl">{signup ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
        <label className="block">Email<input className="block w-full bg-slate-800 rounded p-3 mt-1" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block">Mật khẩu<input className="block w-full bg-slate-800 rounded p-3 mt-1" type="password" minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button disabled={busy} className="w-full bg-red-600 rounded p-3 disabled:opacity-50">{busy ? 'Đang xử lý…' : signup ? 'Đăng ký' : 'Đăng nhập'}</button>
        <button type="button" className="underline text-slate-300" onClick={() => { setSignup(!signup); setMessage(''); }}>{signup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button>
      </form> : <p className="text-amber-300">Chưa kết nối máy chủ tài khoản. Bạn có thể dùng thử bộ đếm giờ bên dưới.</p>}
      {message && <p role="status" className="text-amber-300">{message}</p>}
      <button className="w-full border border-slate-600 rounded p-3" onClick={() => { setDemo(true); setMessage(''); }}>Dùng thử trên thiết bị này</button>
      <p className="text-xs text-slate-400">Chế độ dùng thử không đồng bộ và không tạo tài khoản.</p>
    </section>
  </main>;
}

