import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_EXERCISES, TEMPLATE_PLANS, resolvePlan, planSeconds } from '../services/WorkoutLibrary.ts';
import { libraryUI, localizedCatalog, localizedSports, localizeExercise, localizePlan } from '../services/LibraryLocalization.ts';
const locales=['vi','en','es','ru','zh'];
const viWords=/Chuẩn bị|Khởi động|Thả lỏng|Nhẹ|Nghỉ|giây|lượt|hiệp|lần|Cùng giáo viên|Dụng cụ|Lưu ý/;
test('all five locales cover every exercise, sport and UI key',()=>{
 const snapshot=JSON.stringify(LIBRARY_EXERCISES);
 for(const locale of locales){
  const list=localizedCatalog(locale);assert.equal(list.length,69);
  assert.deepEqual(Object.keys(libraryUI(locale)).sort(),Object.keys(libraryUI('vi')).sort());
  assert.equal(localizedSports(locale).length,6);
  for(let i=0;i<list.length;i++){
   const e=list[i],base=LIBRARY_EXERCISES[i];
   assert.equal(e.id,base.id);assert.equal(e.duration,base.duration);assert.equal(e.restAfter,base.restAfter);
   for(const field of ['name','description','target','equipment'])assert.ok(e[field],locale+' '+e.id+' '+field);
   if(e.stage==='main')assert.ok(e.tip);
   if(locale!=='vi'){
    assert.notEqual(e.description,base.description,locale+' untranslated description '+e.id);
    assert.ok(!viWords.test([e.name,e.description,e.tip,e.target,e.equipment].join(' ')),locale+' Vietnamese fallback '+e.id);
    assert.deepEqual(e.target.match(/\d+/g),base.target.match(/\d+/g),locale+' changed dose '+e.id);
   }
  }
 }
 assert.equal(JSON.stringify(LIBRARY_EXERCISES),snapshot);
});
test('saved templates translate without changing order, repetition, settings or duration',()=>{
 for(const base of TEMPLATE_PLANS)for(const locale of locales){
  const plan=localizePlan(base,locale),list=localizedCatalog(locale);
  assert.deepEqual(plan.exerciseIds,base.exerciseIds);assert.deepEqual(plan.settings,base.settings);
  assert.equal(planSeconds(plan,list),planSeconds(base,LIBRARY_EXERCISES));
  assert.equal(resolvePlan(plan,list).length,base.exerciseIds.length);
  if(locale!=='vi'){assert.notEqual(plan.name,base.name);assert.notEqual(plan.guidance,base.guidance);}
 }
});
test('custom and edited text survives language changes and original saved data is not rewritten',()=>{
 const base=LIBRARY_EXERCISES[0];
 const edited={...base,name:'My own name',description:'My own instructions',duration:17,restAfter:9};
 const custom={...edited,id:'personal-123'};
 for(const locale of locales){
  assert.deepEqual(localizeExercise(custom,locale),custom);
  const e=localizeExercise(edited,locale);assert.equal(e.name,edited.name);assert.equal(e.description,edited.description);assert.equal(e.duration,17);assert.equal(e.restAfter,9);
  const p={...TEMPLATE_PLANS[0],name:'My session'};assert.equal(localizePlan(p,locale).name,p.name);
 }
 assert.equal(localizeExercise(base,'vi').name,base.name);
});
test('legacy default exercises translate, personal edits of legacy IDs remain untouched',()=>{
 const old={id:'1',name:'Jab-Cross',description:'Basic 1-2 punch combination.',category:'BOXING',duration:180};
 assert.equal(localizeExercise(old,'zh').name,'刺拳—后手直拳');
 assert.equal(localizeExercise({...old,name:'Personal',description:'My notes'},'ru').description,'My notes');
});
