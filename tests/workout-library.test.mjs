import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_EXERCISES, TEMPLATE_PLANS, SPORTS, mergeExercises, resolvePlan, restForRound, planSeconds } from '../services/WorkoutLibrary.ts';

test('every sport has three levels and complete playable templates',()=>{
 assert.equal(SPORTS.length,6); assert.equal(TEMPLATE_PLANS.length,18);
 assert.equal(new Set(LIBRARY_EXERCISES.map(e=>e.id)).size,LIBRARY_EXERCISES.length);
 for(const sport of SPORTS) for(const level of ['beginner','intermediate','advanced']) {
  assert.ok(LIBRARY_EXERCISES.filter(e=>e.category===sport.id&&e.level===level).length>=3);
  const p=TEMPLATE_PLANS.find(p=>p.category===sport.id&&p.level===level); assert.ok(p);
  const list=resolvePlan(p,LIBRARY_EXERCISES);
  assert.equal(list[0].stage,'warmup'); assert.equal(list.at(-1).stage,'cooldown');
  assert.equal(p.settings.rounds,list.length);
  assert.ok(list.every(e=>e.category===sport.id&&e.duration>0&&e.restAfter>=0));
  assert.ok(planSeconds(p,LIBRARY_EXERCISES)>600);
 }
});
test('loading preserves exact order and repeated steps; missing IDs fail instead of silently shortening a session',()=>{
 const a=LIBRARY_EXERCISES[0],b=LIBRARY_EXERCISES[1];
 assert.deepEqual(resolvePlan({exerciseIds:[b.id,a.id,b.id]},[a,b]).map(e=>e.id),[b.id,a.id,b.id]);
 assert.throws(()=>resolvePlan({exerciseIds:[a.id,'missing']},[a]));
});
test('existing user edits and custom exercises survive catalog merge without duplicates',()=>{
 const edited={...LIBRARY_EXERCISES[0],name:'My edit',duration:42};
 const custom={...edited,id:'my-custom'};
 const merged=mergeExercises([edited,custom]);
 assert.equal(merged.find(e=>e.id===edited.id).duration,42);
 assert.equal(merged.filter(e=>e.id===edited.id).length,1);
 assert.ok(merged.some(e=>e.id==='my-custom'));
 assert.equal(mergeExercises(merged).length,merged.length);
});
test('explicit zero rests beat global long rests and duration omits final rest',()=>{
 const settings={rounds:2,workTime:60,restTime:30,longRestTime:120,longRestFrequency:1};
 const a={...LIBRARY_EXERCISES[0],duration:60,restAfter:0};
 assert.deepEqual(restForRound(a,settings,1),{seconds:0,long:false});
 assert.deepEqual(restForRound({...a,restAfter:undefined},settings,1),{seconds:120,long:true});
 assert.equal(planSeconds({exerciseIds:[a.id,a.id],settings},[a]),130);
});
test('run-walk starter has six ordered pairs and gentle bookends',()=>{
 const p=TEMPLATE_PLANS.find(p=>p.id==='template-running-beginner');
 const list=resolvePlan(p,LIBRARY_EXERCISES);
 assert.equal(list.length,14); assert.equal(list[0].duration,300); assert.equal(list.at(-1).duration,300);
 for(let i=1;i<13;i+=2){assert.equal(list[i].duration,60);assert.equal(list[i+1].duration,90);}
});
