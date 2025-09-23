export enum TimerPhase {
    PREPARE = 'PREPARE',
    WORK = 'WORK',
    REST = 'REST',
    LONG_REST = 'LONG_REST',
    FINISHED = 'FINISHED'
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
    BOXING = 'BOXING',
    ENDURANCE = 'ENDURANCE'
}

export interface Exercise {
    id: string;
    name: string;
    category: ExerciseCategory;
    description: string;
    imageUrl?: string;
}

export enum SoundType {
    BELL = 'BELL',
    GONG = 'GONG',
    BEEP = 'BEEP',
    SYNTH = 'SYNTH',
    ALARM = 'ALARM',
    BUZZER = 'BUZZER',
    WHISTLE = 'WHISTLE',
    AIR_HORN = 'AIR_HORN',
    CUSTOM = 'CUSTOM'
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
