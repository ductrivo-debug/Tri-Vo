import React from 'react';
import { libraryUI } from '../services/LibraryLocalization';
import { useLanguage } from '../contexts/LanguageContext';
interface ControlsProps {
 isActive:boolean; onStart:()=>void; onPause:()=>void; onReset:()=>void;
 onOpenSettings:()=>void; onOpenHistory:()=>void; onOpenPlaylist:()=>void;
 onOpenPlans:()=>void; onOpenMusic:()=>void; onOpenLibrary:()=>void;
}
const Icon=({kind}:{kind:string})=><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{
 kind==='library'?<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>:
 kind==='plans'?<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>:
 kind==='music'?<><path d="M9 18V5l11-2v13M9 8l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></>:
 kind==='settings'?<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="#0f172a"/><circle cx="15" cy="17" r="3" fill="#0f172a"/></>:
 <path d="M4 9a8 8 0 1 1 0 7M4 3v6h6"/>}</svg>;
export default function Controls(p:ControlsProps) {
 const {t,locale}=useLanguage();
 return <>
  <div className="session-tools"><button onClick={p.onOpenPlaylist}>{t('playlist')} <span aria-hidden="true">↗</span></button><button onClick={p.onOpenHistory}>{t('history')} <span aria-hidden="true">↗</span></button></div>
  <div className="mobile-dock">
   <div className="mobile-primary"><button className="reset-control" aria-label={t('reset')} onClick={()=>{if(!p.isActive || window.confirm(locale==='vi'?'Đặt lại buổi đang tập?':'Reset the current workout?'))p.onReset();}}><Icon kind="reset"/></button><button className={'start-control'+(p.isActive?' running':'')} onClick={p.isActive?p.onPause:p.onStart}><span aria-hidden="true">{p.isActive?'Ⅱ':'▶'}</span>{p.isActive?t('pause'):t('start')}</button></div>
   <nav aria-label={locale==='vi'?'Chức năng tập luyện':'Workout tools'} className="mobile-nav">
    <button onClick={p.onOpenLibrary}><Icon kind="library"/><span>{libraryUI(locale).title}</span></button>
    <button onClick={p.onOpenPlans}><Icon kind="plans"/><span>{t('plans')}</span></button>
    <button onClick={p.onOpenMusic}><Icon kind="music"/><span>{t('music')}</span></button>
    <button onClick={p.onOpenSettings}><Icon kind="settings"/><span>{t('settings')}</span></button>
   </nav>
  </div>
 </>;
}
