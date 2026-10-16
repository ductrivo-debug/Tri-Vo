import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TimerAudioController, cueLabel, clearSoundSettings } from '../services/TimerAudio.ts';
import SoundService from '../services/SoundService.ts';

test('timer stays silent before start and while paused; phases and final three seconds play once', () => {
  const controller = new TimerAudioController();
  assert.equal(controller.next('PREPARE', 1, 10, false), null);
  assert.equal(controller.next('PREPARE', 1, 10, true).kind, 'prepare');
  assert.equal(controller.next('PREPARE', 1, 10, true), null);
  assert.equal(controller.next('PREPARE', 1, 4, true), null);
  assert.equal(controller.next('PREPARE', 1, 3, false), null);
  assert.equal(controller.next('PREPARE', 1, 3, true).seconds, 3);
  assert.equal(controller.next('PREPARE', 1, 3, true), null);
  assert.equal(controller.next('PREPARE', 1, 2, true).seconds, 2);
  assert.equal(controller.next('PREPARE', 1, 1, true).seconds, 1);
  assert.equal(controller.next('WORK', 1, 180, true).kind, 'work');
  assert.equal(controller.next('REST', 1, 60, true).kind, 'rest');
  assert.equal(controller.next('WORK', 2, 180, true).kind, 'work');
  assert.equal(controller.next('FINISHED', 2, 0, false).kind, 'finish');
  assert.equal(controller.next('FINISHED', 2, 0, false), null);
  controller.reset();
  assert.equal(controller.next('FINISHED', 2, 0, false), null);
  assert.equal(controller.next('PREPARE', 1, 10, true).kind, 'prepare');
});
test('clear profile upgrades quiet legacy levels but preserves mute and later choices', () => {
  const old = { start:{type:'BELL',volume:0.5},end:{type:'BELL',volume:0.5},warning:{type:'BEEP',volume:0.3} };
  const upgraded = clearSoundSettings(old);
  assert.equal(upgraded.voiceVolume, 1);
  assert.equal(upgraded.start.volume, 0.95);
  assert.equal(upgraded.warning.volume, 0.8);
  assert.equal(clearSoundSettings({...old,start:{type:'NONE',volume:0}}).start.volume, 0);
  const custom = {...upgraded,voiceVolume:0.4,start:{type:'BELL',volume:0.2}};
  assert.equal(clearSoundSettings(custom), custom);
  assert.equal(cueLabel({kind:'work',round:2},'vi'), 'Bắt đầu hiệp 2');
});

class Param { value = 0; setValueAtTime() {} linearRampToValueAtTime() {} exponentialRampToValueAtTime() {} }
class Source {
  frequency = new Param(); type = ''; onended = null;
  connect() {} disconnect() {} start() {} stop() { this.onended?.(); }
}
class Context {
  state = 'running'; currentTime = 0; destination = {};
  nodes = [];
  createOscillator() { const source = new Source(); this.nodes.push(source); return source; }
  createGain() { return {gain:new Param(),connect(){},disconnect(){}}; }
  async resume() { this.state = 'running'; }
}
const flush = async () => { for (let i=0;i<12;i++) await Promise.resolve(); };
function setup(t) {
  SoundService.cancel();
  SoundService.context = null;
  const spoken = [];
  globalThis.window = {AudioContext:Context,speechSynthesis:{cancel(){},getVoices(){return [];},speak(utterance){spoken.push(utterance);}}};
  globalThis.SpeechSynthesisUtterance = class { constructor(text){this.text=text;} };
  t.mock.timers.enable({apis:['setTimeout']});
  t.after(() => SoundService.cancel());
  return spoken;
}
test('start signal completes before voice, and countdown cannot overlap its own signal', async t => {
  const spoken = setup(t);
  const task = SoundService.cue('work',{type:'BELL',volume:0.95},'Bắt đầu hiệp 1','vi-VN',1);
  await flush();
  assert.equal(spoken.length,0);
  assert.deepEqual(SoundService.context.nodes.map(n=>n.frequency.value),[880,1175]);
  t.mock.timers.tick(580); await flush();
  assert.equal(spoken[0].text,'Bắt đầu hiệp 1');
  assert.equal(spoken[0].volume,1);
  assert.equal(SoundService.isBusy(),true);
  spoken[0].onend(); await task;
  assert.equal(SoundService.isBusy(),false);
});
test('pause/reset cancels pending voice and an old completion cannot end the new cue', async t => {
  const spoken = setup(t);
  const old = SoundService.cue('work',{type:'BELL',volume:1},'Old','en-US');
  await flush();
  SoundService.cancel();
  const current = SoundService.cue('rest',{type:'BELL',volume:1},'Rest','en-US');
  await flush(); await old;
  assert.equal(SoundService.isBusy(),true);
  t.mock.timers.tick(600); await flush();
  assert.deepEqual(spoken.map(s=>s.text),['Rest']);
  spoken[0].onend(); await current;
  assert.equal(SoundService.isBusy(),false);
});
test('cancel during audio unlock prevents stale signals', async t => {
  const spoken = setup(t);
  await SoundService.unlock();
  let resume;
  const context = SoundService.context;
  context.state = 'suspended';
  context.resume = () => new Promise(resolve => { resume = resolve; });
  const task = SoundService.cue('work',{type:'BELL',volume:1},'Stale','en-US');
  SoundService.cancel(); context.state = 'running'; resume(); await task;
  assert.equal(context.nodes.length,0);
  assert.equal(spoken.length,0);
});

