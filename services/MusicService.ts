export default class MusicService {
  private audio = new Audio();
  private url: string | null = null;
  private volume = 0.5;
  private ducked = false;
  constructor(onEnd: () => void) { this.audio.onended = onEnd; this.applyVolume(); }
  init() {}
  async play(file?: File) {
    if (file) {
      this.audio.pause();
      if (this.url) URL.revokeObjectURL(this.url);
      this.url = URL.createObjectURL(file);
      this.audio.src = this.url;
    }
    if (!this.url) throw new Error('Hãy chọn một bài nhạc.');
    await this.audio.play();
  }
  pause() { this.audio.pause(); }
  stop() { this.pause(); this.audio.removeAttribute('src'); this.audio.load(); if (this.url) URL.revokeObjectURL(this.url); this.url = null; }
  setVolume(value: number) { this.volume = Math.max(0, Math.min(1, value)); this.applyVolume(); }
  private applyVolume() { this.audio.volume = this.volume * (this.ducked ? 0.2 : 1); }
  duckVolume() { this.ducked = true; this.applyVolume(); }
  restoreVolume() { this.ducked = false; this.applyVolume(); }
  dispose() { this.audio.onended = null; this.stop(); }
}
