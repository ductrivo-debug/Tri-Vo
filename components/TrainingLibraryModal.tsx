import React, { useState } from 'react';
import type { Exercise, WorkoutPlan, TrainingLevel } from '../types';
import { LEVELS, SPORTS, SOURCES, LIBRARY_EXERCISES, TEMPLATE_PLANS, planSeconds, resolvePlan } from '../services/WorkoutLibrary';

export default function TrainingLibraryModal({onClose,onLoad,onSave,onAdd,savedPlans}: {
 onClose:()=>void; onLoad:(p:WorkoutPlan)=>void; onSave:(p:WorkoutPlan)=>void; onAdd:(e:Exercise)=>boolean; savedPlans:WorkoutPlan[];
}) {
 const [sport,setSport]=useState<string>('BOXING');
 const [level,setLevel]=useState<TrainingLevel>('beginner');
 const [tab,setTab]=useState<'plans'|'exercises'>('plans');
 const [query,setQuery]=useState('');
 const [notice,setNotice]=useState('');
 const selected=SPORTS.find(s=>s.id===sport)!;
 const exercises=LIBRARY_EXERCISES.filter(e=>e.category===sport && e.level===level && (e.name+' '+e.description).toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
 const plan=TEMPLATE_PLANS.find(p=>p.category===sport && p.level===level)!;
 const sequence=resolvePlan(plan,LIBRARY_EXERCISES);
 const saved=savedPlans.some(p=>p.id===plan.id);
 const btn='rounded-lg px-3 py-2 text-sm font-semibold';
 return <div className="mobile-dialog fixed inset-0 z-50 bg-black bg-opacity-80 p-2 sm:p-5 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Thư viện tập luyện">
  <section className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl flex flex-col text-white overflow-hidden" style={{maxHeight:'94dvh'}}>
   <header className="p-4 border-b border-slate-700 flex items-start justify-between gap-3">
    <div><p className="text-xs uppercase tracking-widest text-teal-300">Thư viện tập luyện · Beta</p><h2 className="text-2xl font-bold mt-1">Chọn môn. Chọn trình độ.</h2><p className="text-sm text-slate-400 mt-1">6 bộ môn · 3 trình độ · 18 giáo án mẫu</p></div>
    <button onClick={onClose} className={btn+' bg-slate-700'} aria-label="Đóng thư viện">Đóng</button>
   </header>
   <div className="overflow-y-auto p-4 space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{SPORTS.map(s=><button key={s.id} aria-pressed={sport===s.id} onClick={()=>{setSport(s.id);setQuery('');setNotice('');}} className={btn+' text-left border '+(sport===s.id?'bg-teal-900 border-teal-400':'bg-slate-800 border-slate-700')}><span className="mr-2">{s.icon}</span>{s.name}</button>)}</div>
    <div className="flex flex-wrap gap-2">{(Object.keys(LEVELS) as TrainingLevel[]).map(l=><button key={l} aria-pressed={level===l} onClick={()=>{setLevel(l);setNotice('');}} className={btn+(level===l?' bg-teal-500 text-slate-950':' bg-slate-800')}>{LEVELS[l]}</button>)}</div>
    <div className="rounded-xl bg-slate-800 p-4 text-sm space-y-2"><p className="font-semibold text-teal-200">Phù hợp khi: {selected.entry[(['beginner','intermediate','advanced'] as TrainingLevel[]).indexOf(level)]}</p><p><span className="text-slate-400">Dụng cụ: </span>{selected.equipment}</p><p className="text-slate-300">{selected.note}</p></div>
    <div className="flex gap-2"><button onClick={()=>setTab('plans')} aria-pressed={tab==='plans'} className={btn+(tab==='plans'?' bg-blue-600':' bg-slate-800')}>Giáo án mẫu</button><button onClick={()=>setTab('exercises')} aria-pressed={tab==='exercises'} className={btn+(tab==='exercises'?' bg-blue-600':' bg-slate-800')}>Bài tập</button></div>
    <p aria-live="polite" className="text-sm text-teal-300">{notice}</p>
    {tab==='plans'?<article className="rounded-xl border border-slate-700 p-4 space-y-4">
     <div><h3 className="text-xl font-bold">{plan.name}</h3><p className="text-teal-300 text-sm mt-1">Khoảng {Math.ceil(planSeconds(plan,LIBRARY_EXERCISES)/60)} phút · {sequence.filter(e=>e.stage==='main').length} lượt chính · có khởi động và thả lỏng</p><p className="text-sm text-slate-300 mt-2">{plan.description}</p></div>
     <ol className="space-y-2">{sequence.map((e,i)=><li key={i} className="rounded-lg bg-slate-800 p-3"><div className="flex gap-2 justify-between"><span className="font-medium">{i+1}. {e.name}</span><span className="text-sm text-teal-200 whitespace-nowrap">{Math.floor(e.duration/60)}:{String(e.duration%60).padStart(2,'0')}</span></div><p className="text-xs text-slate-300 mt-1">{e.target}{i<sequence.length-1 && e.restAfter? ' · Nghỉ '+e.restAfter+' giây':''}</p><details className="mt-1 text-sm text-slate-400"><summary className="cursor-pointer">Cách thực hiện</summary><p className="mt-2">{e.description}</p>{e.tip&&<p className="mt-1">Lưu ý: {e.tip}</p>}</details></li>)}</ol>
     <p className="text-sm text-slate-300">{plan.guidance}</p>
     <div className="flex flex-wrap gap-2"><button onClick={()=>onLoad(plan)} className={btn+' bg-teal-500 text-slate-950'}>Nạp vào bộ đếm</button><button disabled={saved} onClick={()=>{onSave(plan);setNotice('Đã thêm vào Giáo án của tôi.');}} className={btn+' bg-blue-600 disabled:opacity-50'}>{saved?'Đã lưu vào giáo án':'Lưu vào giáo án của tôi'}</button></div>
     <p className="text-xs text-slate-400">Nạp giáo án sẽ đặt lại buổi hiện tại. Bộ đếm chỉ chạy khi bấm Bắt đầu.</p>
    </article>:<div className="space-y-3"><input aria-label="Tìm bài tập" placeholder="Tìm bài tập trong môn và trình độ này…" className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3" value={query} onChange={e=>setQuery(e.target.value)} />
     {exercises.map(e=><article key={e.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4 space-y-2"><h3 className="font-bold text-lg">{e.name}</h3><p className="text-sm text-teal-200">{e.target} · Ô tập {e.duration} giây{e.restAfter?' · Nghỉ '+e.restAfter+' giây':''}</p><p className="text-sm text-slate-200">{e.description}</p><p className="text-sm text-slate-400">Lưu ý: {e.tip}</p><button className={btn+' bg-blue-600'} onClick={()=>{if(onAdd(e)) setNotice('Đã thêm '+e.name+' vào danh sách tập.');}}>+ Thêm vào danh sách tập</button></article>)}
     {!exercises.length&&<p className="text-slate-400">Không tìm thấy bài phù hợp. Thử tên khác.</p>}
    </div>}
    <details className="text-sm text-slate-400 border-t border-slate-700 pt-3"><summary className="cursor-pointer">Cách dùng và tài liệu tham khảo</summary><p className="my-3">Nội dung tiếng Việt. Giáo án mẫu do ứng dụng biên soạn, không phải chương trình chính thức của các tổ chức tham khảo. Mức gắng sức tính từ 1 đến 10. Chọn mức phù hợp khả năng hiện tại, dừng nếu đau hoặc chóng mặt. Đây là buổi tập mẫu, chưa phải lộ trình nhiều tuần.</p><ul className="space-y-2">{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-teal-300 underline">{s.name}</a></li>)}</ul></details>
   </div>
  </section>
 </div>;
}
