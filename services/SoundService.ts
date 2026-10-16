import type { SoundSetting } from '../types';
import type { CueKind } from './TimerAudio';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
class SoundService {
  private static context: AudioContext | null = null;
  private static generation = 0;
  private static busy = false;
  private static sources = new Set<AudioScheduledSourceNode>();
  private static waits = new Map<ReturnType<typeof setTimeout>, () => void>();
  public static isBusy() { return this.busy; }
  public static async unlock() {
    try {
      if (!this.context) this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Voice cues can still work without Web Audio. */ }
  }
  public static cancel() {
    this.generation++; this.busy = false;
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    for (const source of this.sources) { try { source.stop(); } catch {} }
    this.sources.clear();
    for (const [timer, done] of this.waits) { clearTimeout(timer); done(); }
    this.waits.clear();
  }
  private static wait(ms: number) {
    return new Promise<void>(resolve => {
      const timer = setTimeout(() => { this.waits.delete(timer); resolve(); }, ms);
      this.waits.set(timer, resolve);
    });
  }
  private static tone(frequency: number, at: number, duration: number, volume: number, bell: boolean) {
    const context = this.context;
    if (!context || context.state !== 'running' || volume <= 0) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = bell ? 'triangle' : 'sine';
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(clamp(volume) * 0.8, at + 0.012);
    gain.gain.setValueAtTime(clamp(volume) * 0.8, at + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    this.sources.add(oscillator);
    oscillator.onended = () => { this.sources.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at); oscillator.stop(at + duration);
  }
  private static async sound(kind: CueKind, setting: SoundSetting, token: number) {
    if (setting.type === 'NONE' || setting.volume <= 0) return;
    await this.unlock();
    if (token !== this.generation) return;
    if (setting.type === 'CUSTOM' && setting.customSound && this.context) {
      try {
        const response = await fetch(setting.customSound);
        const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        if (token !== this.generation) return;
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        const duration = Math.min(buffer.duration, kind === 'countdown' ? 0.12 : 0.8);
        source.buffer = buffer; gain.gain.value = clamp(setting.volume);
        source.connect(gain); gain.connect(this.context.destination);
        this.sources.add(source);
        source.onended = () => { this.sources.delete(source); source.disconnect(); gain.disconnect(); };
        source.start(); source.stop(this.context.currentTime + duration);
        await this.wait(duration * 1000 + 70);
        return;
      } catch { /* Fall back to the phase signal if a custom file fails. */ }
    }
    if (token !== this.generation) return;
    // [frequency, offset, length]: distinct rhythms make each boundary identifiable.
    const patterns: Record<CueKind, number[][]> = {
      prepare: [[520, 0, 0.18]],
      work: [[880, 0, 0.15], [1175, 0.20, 0.32]],
      rest: [[660, 0, 0.17], [440, 0.24, 0.22]],
      longRest: [[660, 0, 0.17], [440, 0.24, 0.22]],
      finish: [[1047, 0, 0.17], [784, 0.23, 0.17], [523, 0.46, 0.35]],
      countdown: [[740, 0, 0.09]]
    };
    const notes = patterns[kind];
    const now = this.context?.currentTime ?? 0;
    for (const [frequency, offset, duration] of notes) this.tone(frequency, now + offset, duration, setting.volume, setting.type === 'BELL');
    const last = notes[notes.length - 1];
    await this.wait((last[1] + last[2]) * 1000 + 60);
  }
  private static async voice(text: string, lang: string, volume: number, token: number, limit: number) {
    if (!text || volume <= 0 || token !== this.generation || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; utterance.volume = clamp(volume); utterance.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.split('-')[0] === lang.split('-')[0]) || null;
    await new Promise<void>(resolve => {
      const done = () => { clearTimeout(timer); this.waits.delete(timer); resolve(); };
      const timer = setTimeout(() => {
        if (token === this.generation) window.speechSynthesis.cancel();
        done();
      }, limit);
      this.waits.set(timer, done);
      utterance.onend = done; utterance.onerror = done;
      window.speechSynthesis.speak(utterance);
    });
  }
  public static async cue(kind: CueKind, setting: SoundSetting, text: string, lang: string, voiceVolume = 1) {
    this.cancel();
    const token = this.generation;
    this.busy = true;
    try {
      await this.sound(kind, setting, token);
      if (token !== this.generation) return;
      await this.voice(text, lang, voiceVolume, token, kind === 'countdown' ? 700 : 3500);
    } finally { if (token === this.generation) this.busy = false; }
  }
  public static playSound(setting: SoundSetting) { return this.cue('work', setting, '', 'en-US', 0); }
  public static speak(text: string, lang = 'en-US', volume = 1) {
    return this.cue('prepare', { type: 'NONE' as SoundSetting['type'], volume: 0 }, text, lang, volume);
  }
}
export default SoundService;
