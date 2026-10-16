import type { SoundSettings } from '../types';
export type CueKind = 'prepare' | 'work' | 'rest' | 'longRest' | 'finish' | 'countdown';
export type TimerCue = { kind: CueKind; round: number; seconds?: number };
export class TimerAudioController {
  private phaseKey = '';
  private tickKey = '';
  private started = false;
  reset() { this.phaseKey = ''; this.tickKey = ''; this.started = false; }
  next(phase: string, round: number, seconds: number, active: boolean): TimerCue | null {
    if (!active && !(phase === 'FINISHED' && this.started)) return null;
    if (active) this.started = true;
    const key = phase + ':' + round;
    if (key !== this.phaseKey) {
      this.phaseKey = key; this.tickKey = '';
      const kind = ({ PREPARE: 'prepare', WORK: 'work', REST: 'rest', LONG_REST: 'longRest', FINISHED: 'finish' } as const)[phase];
      return kind ? { kind, round } : null;
    }
    const tick = key + ':' + seconds;
    if (active && seconds >= 1 && seconds <= 3 && tick !== this.tickKey) {
      this.tickKey = tick;
      return { kind: 'countdown', round, seconds };
    }
    return null;
  }
}
export function cueLabel(cue: TimerCue, locale: string): string {
  const phrases = {
    vi: { prepare: 'Chuẩn bị', work: 'Bắt đầu hiệp', rest: 'Nghỉ', longRest: 'Nghỉ dài', finish: 'Hoàn thành' },
    en: { prepare: 'Get ready', work: 'Start round', rest: 'Rest', longRest: 'Long rest', finish: 'Workout complete' },
    es: { prepare: 'Prepárate', work: 'Comienza ronda', rest: 'Descanso', longRest: 'Descanso largo', finish: 'Completado' },
    ru: { prepare: 'Приготовьтесь', work: 'Начать раунд', rest: 'Отдых', longRest: 'Долгий отдых', finish: 'Завершено' },
    zh: { prepare: '准备', work: '开始回合', rest: '休息', longRest: '长休息', finish: '训练完成' }
  };
  if (cue.kind === 'countdown') return String(cue.seconds);
  const labels = phrases[locale] || phrases.en;
  return labels[cue.kind] + (cue.kind === 'work' ? ' ' + cue.round : '');
}

export function clearSoundSettings(settings: SoundSettings): SoundSettings {
  if (settings.profileVersion === 2) return settings;
  const boost = (value: number, floor: number) => value > 0 ? Math.max(value, floor) : 0;
  return {
    ...settings, profileVersion: 2, voiceVolume: settings.voiceVolume ?? 1,
    start: { ...settings.start, volume: boost(settings.start.volume, 0.95) },
    end: { ...settings.end, volume: boost(settings.end.volume, 0.95) },
    warning: { ...settings.warning, volume: boost(settings.warning.volume, 0.8) }
  };
}
