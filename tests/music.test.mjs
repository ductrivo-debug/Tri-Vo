import { test } from 'node:test';
import assert from 'node:assert/strict';
class FakeAudio {
  volume = 1; currentTime = 0; paused = true; src = ''; onended = null;
  async play() { this.paused = false; }
  pause() { this.paused = true; }
  load() {}
  removeAttribute() { this.src = ''; }
}
globalThis.Audio = FakeAudio;
const { default: MusicService } = await import('../services/MusicService.ts');
test('pause/resume keeps the current position and does not advance tracks', async () => {
  let ended = 0;
  const player = new MusicService(() => ended++);
  await player.play(new File(['audio'], 'one.mp3'));
  player.audio.currentTime = 25;
  player.pause();
  assert.equal(player.audio.paused, true);
  await player.play();
  assert.equal(player.audio.currentTime, 25);
  assert.equal(ended, 0);
  player.audio.onended();
  assert.equal(ended, 1);
  player.dispose();
  assert.equal(player.audio.onended, null);
  assert.equal(player.audio.src, '');
});
test('volume is clamped and warnings restore the chosen volume', () => {
  const player = new MusicService(() => {});
  player.setVolume(0.8);
  player.duckVolume();
  assert.ok(Math.abs(player.audio.volume - 0.16) < 0.0001);
  player.setVolume(0.4);
  assert.ok(Math.abs(player.audio.volume - 0.08) < 0.0001);
  player.restoreVolume();
  assert.equal(player.audio.volume, 0.4);
  player.setVolume(2);
  assert.equal(player.audio.volume, 1);
  player.setVolume(-1);
  assert.equal(player.audio.volume, 0);
  player.dispose();
});
test('replacing and deleting tracks revokes object URLs', async () => {
  const player = new MusicService(() => {});
  await player.play(new File(['one'], 'one.mp3'));
  const first = player.url;
  await player.play(new File(['two'], 'two.mp3'));
  assert.notEqual(player.url, first);
  assert.equal(await fetch(first).then(() => false, () => true), true);
  const second = player.url;
  player.stop();
  assert.equal(await fetch(second).then(() => false, () => true), true);
});

