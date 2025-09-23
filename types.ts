export enum TimerPhase {
    PREPARE = 'Chuẩn bị',
    WORK = 'TẬP',
    REST = 'NGHỈ',
    LONG_REST = 'NGHỈ DÀI',
    FINISHED = 'Hoàn thành'
}

export interface WorkoutSettings {
    rounds: number;
    workTime: number; // in seconds
    restTime: number; // in seconds
    longRestTime: number; // in seconds
    longRestFrequency: number; // e.g., long rest every 4 rounds
}

export interface WorkoutSession {
    date: string; // ISO string
    duration: number; // in seconds
    roundsCompleted: number;
    settings: WorkoutSettings;
}

export enum ExerciseCategory {
    BOXING = 'Boxing',
    ENDURANCE = 'Thể lực & Sức bền'
}

export interface Exercise {
    id: string;
    name: string;
    category: ExerciseCategory;
    description: string;
    imageUrl?: string;
}

export enum SoundType {
    BELL = 'Chuông',
    GONG = 'Cồng',
    BEEP = 'Bíp',
    SYNTH = 'Điện tử',
    ALARM = 'Báo động',
    BUZZER = 'Còi rè',
    WHISTLE = 'Còi a-go-go',
    AIR_HORN = 'Kèn hơi',
    CUSTOM = 'Tùy chỉnh'
}

export interface SoundSetting {
    type: SoundType;
    volume: number; // 0 to 1
    customSound?: string; // Base64 Data URL
    customSoundName?: string; // Original file name for display
}

export interface SoundSettings {
    start: SoundSetting;
    end: SoundSetting;
    warning: SoundSetting;
}

export interface Track {
  id: string;
  name: string;
  file: File;
}