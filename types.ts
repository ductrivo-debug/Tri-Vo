export enum TimerPhase {
    PREPARE = 'PREPARE',
    WORK = 'WORK',
    REST = 'REST',
    LONG_REST = 'LONG_REST',
    FINISHED = 'FINISHED',
}

export enum ExerciseCategory {
    BOXING = 'BOXING',
    KICKBOXING = 'KICKBOXING',
    MMA = 'MMA',
    CUSTOM = 'CUSTOM',
}

export interface Exercise {
    id: string;
    name: string;
    description: string;
    category: ExerciseCategory;
    duration: number; // in seconds
}

export interface WorkoutSettings {
    rounds: number;
    workTime: number; // in seconds
    restTime: number; // in seconds
    longRestTime: number; // in seconds
    longRestFrequency: number; // after how many rounds
}

export interface WorkoutSession {
    date: string; // ISO string
    duration: number; // in seconds
    roundsCompleted: number;
    settings: WorkoutSettings;
}

export enum SoundType {
    NONE = 'NONE',
    BEEP = 'BEEP',
    BELL = 'BELL',
    CUSTOM = 'CUSTOM',
}

export interface SoundSetting {
    type: SoundType;
    volume: number;
    customSound?: string; // data URL
    customSoundName?: string;
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

export interface WorkoutPlan {
    id: string;
    name: string;
    exerciseIds: string[];
}