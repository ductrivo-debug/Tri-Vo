import type { Exercise, WorkoutPlan, TrainingLevel } from '../types';
import { LIBRARY_EXERCISES, TEMPLATE_PLANS, SPORTS } from './WorkoutLibrary.ts';
import en from '../locales/library-en.ts';
import es from '../locales/library-es.ts';
import ru from '../locales/library-ru.ts';
import zh from '../locales/library-zh.ts';
import vi from '../locales/library-vi.ts';
const packs = { en, es, ru, zh };
export function libraryUI(locale:string) { return locale==='vi' ? vi.ui : (packs[locale] || en).ui; }
export function levelLabel(level:TrainingLevel,locale:string) { return libraryUI(locale).levels[['beginner','intermediate','advanced'].indexOf(level)]; }
export function localizedSports(locale:string) {
 if(locale==='vi') return SPORTS;
 const pack=packs[locale] || en;
 return SPORTS.map(s=>({...s,...pack.sports[s.id]}));
}
export function sportLabel(category:string,locale:string) {return localizedSports(locale).find(s=>s.id===category)?.name;}
const legacyOriginal = [
 ['1','Jab-Cross','Basic 1-2 punch combination.'],
 ['2','Hook-Uppercut','Left hook followed by a right uppercut.'],
 ['3','Roundhouse Kick','A powerful kick using the shin.'],
 ['4','Takedown defense','Sprawl to defend against a takedown.']
];
const legacy = {
 vi:[['Jab–cross','Tổ hợp đấm thẳng tay trước rồi tay sau.'],['Móc ngang–móc lên','Móc ngang trái rồi móc lên phải.'],['Đá vòng cầu','Đá vòng cầu bằng cẳng chân.'],['Phòng thủ chống quật ngã','Duỗi chân ra sau (sprawl) để chống đòn quật ngã.']],
 en:legacyOriginal.map(e=>e.slice(1)),
 es:[['Jab–cross','Combinación básica de directo adelantado y trasero.'],['Gancho–uppercut','Gancho izquierdo seguido de uppercut derecho.'],['Patada circular','Patada circular utilizando la espinilla.'],['Defensa de derribo','Extiende las piernas hacia atrás (sprawl) para defender un derribo.']],
 ru:[['Джеб–кросс','Базовая связка переднего и заднего прямого удара.'],['Хук–апперкот','Левый боковой, затем правый удар снизу.'],['Круговой удар ногой','Круговой удар ногой с использованием голени.'],['Защита от перевода','Отбросьте ноги назад (спролл), защищаясь от перевода в партер.']],
 zh:[['刺拳—后手直拳','基础前手、后手直拳组合。'],['摆拳—上勾拳','左摆拳后接右上勾拳。'],['回旋踢','用胫骨完成回旋踢。'],['防抱摔','双腿向后伸展下压（sprawl），防守抱摔。']]
};
export function localizeExercise(exercise:Exercise,locale:string):Exercise {
 const base=LIBRARY_EXERCISES.find(e=>e.id===exercise.id);
 if(!base){
  const i=legacyOriginal.findIndex(e=>e[0]===exercise.id);
  if(i<0) return exercise;
  const translated=(legacy[locale] || legacy.en)[i];
  return {...exercise,name:exercise.name===legacyOriginal[i][1]?translated[0]:exercise.name,description:exercise.description===legacyOriginal[i][2]?translated[1]:exercise.description};
 }
 const sport=localizedSports(locale).find(s=>s.id===base.category)!;
 const ui=libraryUI(locale);
 let translated:any=base;
 if(locale!=='vi') {
  translated=base.stage==='main' ? (packs[locale] || en).exercises[base.id] : {
   name:(base.stage==='warmup'?ui.warmup:ui.cooldown)+' · '+sport.name,
   description:base.stage==='warmup'?sport.warm:sport.cool,target:ui.easy
  };
 }
 const result={...exercise};
 // Translate only catalog text, never overwrite a user's edited field or workout parameters.
 for(const key of ['name','description','tip','target','equipment'] as const) {
  if(exercise[key]===base[key]) result[key]=key==='equipment'?sport.equipment:translated[key];
 }
 return result;
}
export function localizePlan(plan:WorkoutPlan,locale:string):WorkoutPlan {
 const base=TEMPLATE_PLANS.find(p=>p.id===plan.id);
 if(!base || locale==='vi') return plan;
 const ui=libraryUI(locale), sport=localizedSports(locale).find(s=>s.id===base.category)!;
 return {...plan,
  name:plan.name===base.name?sport.name+' · '+levelLabel(base.level!,locale):plan.name,
  description:plan.description===base.description?ui.descriptions[['beginner','intermediate','advanced'].indexOf(base.level!)]:plan.description,
  guidance:plan.guidance===base.guidance?sport.note+' '+ui.progression:plan.guidance
 };
}
export function localizedCatalog(locale:string) { return LIBRARY_EXERCISES.map(e=>localizeExercise(e,locale)); }
