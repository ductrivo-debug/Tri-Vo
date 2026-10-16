import React, { useState } from 'react';
import type { WorkoutPlan, Exercise } from '../types';
import { localizeExercise, localizePlan, libraryUI } from '../services/LibraryLocalization';
import { useLanguage } from '../contexts/LanguageContext';

export default function WorkoutPlanFormModal({planToEdit,allExercises,onSave,onClose}: {
 planToEdit:WorkoutPlan|null; allExercises:Exercise[]; onSave:(p:Omit<WorkoutPlan,'id'>|WorkoutPlan)=>void; onClose:()=>void;
}) {
 const {t,locale}=useLanguage();
 const ui=libraryUI(locale);
 const [name,setName]=useState(planToEdit?.name || '');
 const [ids,setIds]=useState<string[]>(planToEdit?.exerciseIds || []);
 const [query,setQuery]=useState('');
 const move=(index:number,delta:number)=>setIds(prev=>{const next=[...prev]; [next[index],next[index+delta]]=[next[index+delta],next[index]]; return next;});
 const save=()=>{
  if(!name.trim()) {alert(t('enterPlanName'));return;}
  if(!ids.length) {alert(ui.chooseOne);return;}
  if(ids.some(id=>!allExercises.some(e=>e.id===id))) {alert(ui.removeMissing);return;}
  const data={...planToEdit,name:name.trim(),exerciseIds:ids,...(planToEdit?.settings?{settings:{...planToEdit.settings,rounds:ids.length}}:{})};
  onSave(data);onClose();
 };
 return <div className="mobile-dialog fixed inset-0 z-50 bg-black bg-opacity-80 p-3 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={t('workoutPlans')}><section className="bg-slate-800 rounded-xl p-4 w-full max-w-xl text-white flex flex-col" style={{maxHeight:'94dvh'}}>
  <h2 className="text-xl font-bold mb-3">{planToEdit?t('edit'):t('createNewPlan')}</h2>
  <label className="text-sm">{t('planName')}<input value={planToEdit && name===planToEdit.name ? localizePlan(planToEdit,locale).name : name} onChange={e=>setName(e.target.value)} className="block w-full rounded bg-slate-700 p-3 mt-1 mb-3" /></label>
  <div className="overflow-y-auto space-y-3"><h3 className="font-semibold">{ui.order} · {ids.length} {ui.rounds}</h3><p className="text-xs text-slate-400">{ui.repeatHelp}</p>
   {ids.map((id,i)=><div key={i} className="flex items-center gap-2 bg-slate-700 rounded p-2"><span className="flex-1 text-sm">{i+1}. {(allExercises.find(e=>e.id===id) ? localizeExercise(allExercises.find(e=>e.id===id)!,locale).name : ui.missing)}</span><button disabled={i===0} aria-label={ui.up+' '+(i+1)} onClick={()=>move(i,-1)} className="p-2 disabled:opacity-30">↑</button><button disabled={i===ids.length-1} aria-label={ui.down+' '+(i+1)} onClick={()=>move(i,1)} className="p-2 disabled:opacity-30">↓</button><button aria-label={ui.remove+' '+(i+1)} onClick={()=>setIds(ids.filter((_,j)=>j!==i))} className="p-2 text-red-300">×</button></div>)}
   <input aria-label={ui.searchAdd} placeholder={ui.searchAdd} value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-slate-900 rounded p-3" />
   {allExercises.filter(e=>localizeExercise(e,locale).name.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale))).map(e=><button key={e.id} onClick={()=>setIds([...ids,e.id])} className="block w-full text-left rounded bg-slate-700 p-3 text-sm">+ {localizeExercise(e,locale).name} <span className="text-slate-400">· {e.duration} {ui.seconds}</span></button>)}
  </div>
  <div className="flex gap-3 pt-4"><button onClick={onClose} className="flex-1 bg-slate-600 rounded p-3">{t('cancel')}</button><button onClick={save} className="flex-1 bg-blue-600 rounded p-3">{t('save')}</button></div>
 </section></div>;
}
