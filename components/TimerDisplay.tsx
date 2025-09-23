import React from 'react';
import { TimerPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TimerDisplayProps {
    phase: TimerPhase;
    timeLeft: number;
    totalTime: number;
    currentRound: number;
    totalRounds: number;
}

const CircularProgress: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    return (
        <svg className="absolute w-full h-full" viewBox="0 0 256 256">
            <circle
                className="circular-progress-bg"
                cx="128"
                cy="128"
                r={radius}
            />
            <circle
                className="circular-progress-fg"
                cx="128"
                cy="128"
                r={radius}
                stroke={color}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
        </svg>
    );
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ phase, timeLeft, totalTime, currentRound, totalRounds }) => {
    const { t } = useLanguage();
    
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const getPhaseColor = () => {
        switch(phase) {
            case TimerPhase.WORK: return '#ef4444'; // red-500
            case TimerPhase.REST: return '#3b82f6'; // blue-500
            case TimerPhase.LONG_REST: return '#8b5cf6'; // violet-500
            case TimerPhase.PREPARE: return '#f59e0b'; // amber-500
            case TimerPhase.FINISHED: return '#6b7280'; // gray-500
            default: return '#6b7280';
        }
    };
    
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const phaseColor = getPhaseColor();

    return (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center">
            <CircularProgress progress={progress} color={phaseColor} />
            <div className="z-10 text-center">
                 <p 
                    className="text-lg font-semibold uppercase tracking-widest"
                    style={{ color: phaseColor }}
                 >
                    {t(phase)}
                </p>
                <h2 className="text-6xl sm:text-7xl font-mono font-bold my-2">
                    {formatTime(timeLeft)}
                </h2>
                {phase !== TimerPhase.FINISHED && phase !== TimerPhase.PREPARE &&
                    <p className="text-xl text-slate-400">
                        {t('round')} {currentRound} / {totalRounds}
                    </p>
                }
                 {phase === TimerPhase.FINISHED &&
                    <p className="text-xl text-slate-400">
                        {t('greatJob')}
                    </p>
                }
            </div>
        </div>
    );
};

export default TimerDisplay;
