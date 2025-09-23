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
    longRestFrequency: number; // after how many rounds
}

export enum ExerciseCategory {
    BOXING = 'BOXING',
    ENDURANCE = 'ENDURANCE'
}

export interface Exercise {
    id: string;
    name: string;
    description: string;
    category: ExerciseCategory;
    imageUrl?: string;
    rounds: number; // specific to this exercise in a playlist
    duration: number; // in seconds, specific to this exercise
}

export enum SoundType {
    BEEP = 'BEEP',
    BELL = 'BELL',
    NONE = 'NONE',
    CUSTOM = 'CUSTOM',
}

export interface SoundSetting {
    type: SoundType;
    volume: number;
    customSound?: string; // Data URL
    customSoundName?: string;
}

export interface SoundSettings {
    start: SoundSetting;
    end: SoundSetting;
    warning: SoundSetting;
}

export interface WorkoutSession {
    date: string; // ISO string
    duration: number; // total seconds
    roundsCompleted: number;
    settings: WorkoutSettings;
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