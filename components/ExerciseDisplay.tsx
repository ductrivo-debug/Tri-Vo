import React from 'react';
import { Exercise, TimerPhase } from '../types';
import { localizeExercise, sportLabel, levelLabel, libraryUI } from '../services/LibraryLocalization';
import { useLanguage } from '../contexts/LanguageContext';

interface ExerciseDisplayProps {
    exercise: Exercise | null;
    phase: TimerPhase;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({ exercise, phase }) => {
    const { t, locale } = useLanguage();
    if (exercise) exercise = localizeExercise(exercise, locale);
    if (!exercise) {
        return <div className="mt-6 w-full max-w-sm h-40"></div>; // Placeholder to prevent layout shift
    }

    const getTitleText = () => {
        switch (phase) {
            case TimerPhase.PREPARE:
                 return t('firstExercise');
            case TimerPhase.FINISHED:
                return t('lastExercise');
            case TimerPhase.WORK:
                return t('currentExercise');
            case TimerPhase.REST:
            case TimerPhase.LONG_REST:
                return t('nextExercise');
            default:
                return "";
        }
    };
    const titleText = getTitleText();

    return (
        <div className="exercise-card animate-fade-in">
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-slate-400 uppercase tracking-wider">{titleText}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        exercise.category === 'BOXING' ? 'bg-red-500 text-white' : 
                        exercise.category === 'KICKBOXING' ? 'bg-blue-500 text-white' : 
                        exercise.category === 'MMA' ? 'bg-purple-500 text-white' : 
                        'bg-gray-500 text-white'
                    }`}>
                        {sportLabel(exercise.category,locale) || t(exercise.category)}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                <p className="text-teal-300 mt-1 text-sm">{exercise.level ? levelLabel(exercise.level,locale) + ' · ' : ''}{exercise.target}</p>
                <details><summary>{t('descriptionLabel')} ▾</summary><p>{exercise.description}</p>{exercise.tip && <p className="mt-2 text-slate-400">{libraryUI(locale).tip}: {exercise.tip}</p>}</details>
            </div>
        </div>
    );
};

export default ExerciseDisplay;
