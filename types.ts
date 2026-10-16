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
    JUMP_ROPE = 'JUMP_ROPE',
    WALKING = 'WALKING',
    RUNNING = 'RUNNING',
    SWIMMING = 'SWIMMING',
    GYM = 'GYM',
    CUSTOM = 'CUSTOM',
}

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
    level?: TrainingLevel;
    equipment?: string;
    target?: string;
    tip?: string;
    restAfter?: number;
    stage?: 'warmup' | 'main' | 'cooldown';
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
    voiceVolume?: number;
    profileVersion?: number;
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
    category?: ExerciseCategory;
    level?: TrainingLevel;
    description?: string;
    guidance?: string;
    settings?: WorkoutSettings;
    id: string;
    name: string;
    exerciseIds: string[];
}
