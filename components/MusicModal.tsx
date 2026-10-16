import React, { useEffect, useRef, useState } from 'react';
import type { Track } from '../types';
import MusicService from '../services/MusicService';
import { musicLibrary } from '../services/MusicLibrary';
import { usePersonalScope } from '../contexts/PersonalData';

export default function MusicModal({ isOpen, onClose, service }: {
  isOpen: boolean; onClose: () => void; service: React.MutableRefObject<MusicService | null>;
}) {
  const owner = usePersonalScope();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [shuffle, setShuffle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState<'local' | 'spotify'>('local');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [embed, setEmbed] = useState('');
  const generation = useRef(0);
  const nextRef = useRef<() => void>(() => {});
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const player = new MusicService(() => nextRef.current());
    service.current = player;
    let active = true;
    musicLibrary(owner, 'list').then(value => { if (active) setTracks(value); })
      .catch(() => { if (active) setError('Không mở được thư viện nhạc. Kiểm tra quyền lưu trữ của trình duyệt.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; generation.current++; player.dispose(); service.current = null; };
  }, [owner]);
  async function play(track: Track) {
    const request = ++generation.current;
    setError(''); setPlaying(false); setCurrent(track);
    try {
      await service.current?.play(track.file);
      if (generation.current === request) setPlaying(true);
    } catch { if (generation.current === request) { setPlaying(false); setError('Không phát được file này. Hãy thử MP3, WAV hoặc định dạng trình duyệt hỗ trợ.'); } }
  }
  function move(direction: number) {
    if (!tracks.length) return;
    let index = tracks.findIndex(track => track.id === current?.id);
    if (shuffle && tracks.length > 1) {
      const candidates = tracks.filter(t => t.id !== current?.id);
      void play(candidates[Math.floor(Math.random() * candidates.length)]);
    } else void play(tracks[(index + direction + tracks.length) % tracks.length]);
  }
  nextRef.current = () => move(1);
  async function toggle() {
    if (!current) { if (tracks[0]) await play(tracks[0]); return; }
    if (playing) { generation.current++; service.current?.pause(); setPlaying(false); }
    else {
      try { await service.current?.play(); setPlaying(true); setError(''); }
      catch { setError('Không tiếp tục phát được. Hãy chọn lại bài.'); }
    }
  }
  async function add(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const accepted = files.filter(file => file.size > 0 && file.size <= 100 * 1024 * 1024 && (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|aac|flac|webm)$/i.test(file.name)));
    const added = accepted.map(file => ({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), file }));
    if (!added.length) { setError('Chọn file âm thanh hợp lệ, tối đa 100 MB mỗi bài.'); return; }
    setBusy(true); setError('');
    try {
      await musicLibrary(owner, 'put', added);
      setTracks(previous => [...previous, ...added]);
      if (accepted.length !== files.length) setError('Một số file bị bỏ qua vì định dạng hoặc dung lượng.');
    } catch { setError('Không lưu được nhạc. Thiết bị có thể đã hết dung lượng.'); }
    finally { setBusy(false); }
  }
  async function remove(track: Track) {
    setBusy(true);
    try {
      await musicLibrary(owner, 'delete', [track]);
      if (track.id === current?.id) { generation.current++; service.current?.stop(); setCurrent(null); setPlaying(false); }
      setTracks(previous => previous.filter(item => item.id !== track.id));
    } catch { setError('Không xóa được bài nhạc. Hãy thử lại.'); }
    finally { setBusy(false); }
  }
  function openSpotify(event: React.FormEvent) {
    event.preventDefault();
    try {
      const url = new URL(spotifyLink);
      const match = url.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]{22})\/?$/);
      if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || !match) throw new Error();
      service.current?.pause(); setPlaying(false);
      setEmbed('https://open.spotify.com/embed/' + match[1] + '/' + match[2]); setError('');
    } catch { setError('Dán link bài hát, album hoặc playlist từ open.spotify.com.'); }
  }
  return <div className={isOpen ? 'fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4' : 'hidden'} role={isOpen ? 'dialog' : undefined} aria-modal={isOpen || undefined} aria-label="Âm nhạc">
    <section className="bg-slate-800 rounded-lg p-5 w-full max-w-md text-white overflow-y-auto" style={{maxHeight:'90dvh'}}>
      <header className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Âm nhạc</h2><button aria-label="Đóng âm nhạc" className="text-3xl" onClick={onClose}>×</button></header>
      <div className="flex gap-2 mb-4">
        <button className="rounded p-2 bg-slate-700" aria-pressed={source === 'local'} onClick={() => { setSource('local'); setEmbed(''); setError(''); }}>Nhạc trên máy</button>
        <button className="rounded p-2 bg-slate-700" aria-pressed={source === 'spotify'} onClick={() => { setSource('spotify'); service.current?.pause(); setPlaying(false); setError(''); }}>Spotify</button>
      </div>
      {source === 'local' ? <>
        <p className="text-xs text-slate-300 mb-3">Nhạc lưu trên trình duyệt của thiết bị này, tách theo tài khoản; không tải lên database và không đồng bộ file sang máy khác. Xóa dữ liệu trình duyệt sẽ xóa thư viện nhạc.</p>
        <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac" multiple className="hidden" onChange={add} />
        <button disabled={loading || busy} onClick={() => input.current?.click()} className="bg-green-700 rounded w-full p-3 disabled:opacity-50">{busy ? 'Đang lưu…' : '+ Thêm nhạc từ thiết bị'}</button>
        <div className="my-3 max-h-48 overflow-y-auto space-y-2">
          {loading ? <p>Đang tải thư viện…</p> : !tracks.length ? <p className="text-slate-400 py-4">Chưa có nhạc. Chọn file để bắt đầu.</p> : tracks.map(track =>
            <div key={track.id} className="flex gap-2 bg-slate-700 rounded p-2">
              <button className={'flex-1 text-left truncate ' + (current?.id === track.id ? 'text-green-300' : '')} onClick={() => void play(track)}>{track.name}</button>
              <button disabled={busy} aria-label={'Xóa ' + track.name} onClick={() => void remove(track)}>×</button>
            </div>)}
        </div>
        <p className="truncate text-center">{current?.name || 'Chưa chọn bài'}</p>
        <div className="flex justify-center gap-4 my-4">
          <button aria-label="Bài trước" disabled={!tracks.length} onClick={() => move(-1)}>⏮</button>
          <button aria-label={playing ? 'Tạm dừng' : 'Phát nhạc'} disabled={!tracks.length} onClick={() => void toggle()} className="bg-green-700 rounded px-6 py-3">{playing ? 'Tạm dừng' : 'Phát'}</button>
          <button aria-label="Bài tiếp" disabled={!tracks.length} onClick={() => move(1)}>⏭</button>
        </div>
        <label className="flex gap-3">Âm lượng<input aria-label="Âm lượng nhạc" type="range" min="0" max="1" step="0.05" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); service.current?.setVolume(value); }} /></label>
        <label className="block mt-3"><input type="checkbox" checked={shuffle} onChange={event => setShuffle(event.target.checked)} /> Phát ngẫu nhiên</label>
      </> : <>
        <p className="text-sm text-slate-300 mb-3">Dán link Spotify để mở trình phát nhúng. Đây chưa phải kết nối tài khoản Spotify vào app; khả năng phát do Spotify quyết định.</p>
        <form onSubmit={openSpotify} className="space-y-2">
          <label className="block">Link Spotify<input type="url" required value={spotifyLink} onChange={event => setSpotifyLink(event.target.value)} placeholder="https://open.spotify.com/playlist/…" className="bg-slate-700 p-2 rounded w-full" /></label>
          <button className="bg-green-700 p-2 rounded">Mở trình phát</button>
        </form>
        {embed && <iframe className="w-full rounded mt-3" height="352" src={embed} title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />}
        <a className="block underline mt-3" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Mở Spotify để đăng nhập và chọn nhạc</a>
        <p className="text-xs text-slate-400 mt-3">Âm lượng Spotify điều chỉnh trong Spotify. Khi đóng cửa sổ, trình phát nhúng vẫn được giữ; chuyển về Nhạc trên máy sẽ dừng Spotify.</p>
      </>}
      {error && <p role="alert" className="text-amber-300 mt-3">{error}</p>}
    </section>
  </div>;
}
