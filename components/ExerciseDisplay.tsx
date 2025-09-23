import React from 'react';
import { Exercise, TimerPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExerciseDisplayProps {
    exercise: Exercise | null;
    phase: TimerPhase;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({ exercise, phase }) => {
    const { t } = useLanguage();
    if (!exercise) {
        return null;
    }

    const getTitleText = () => {
        switch (phase) {
            case TimerPhase.PREPARE:
                return t('firstExercise');
            case TimerPhase.WORK:
                return t('currentExercise');
            case TimerPhase.REST:
            case TimerPhase.LONG_REST:
                return t('nextExercise');
            default:
                return ""; // Should not happen
        }
    };
    const titleText = getTitleText();

    return (
        <div className="mt-6 w-full max-w-sm bg-slate-800 rounded-lg overflow-hidden animate-fade-in shadow-lg border border-slate-700">
            {exercise.imageUrl && (
                <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-slate-400 uppercase tracking-wider">{titleText}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        exercise.category === 'BOXING' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                        {t(exercise.category)}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                <p className="text-slate-300 mt-1 text-sm">{exercise.description}</p>
            </div>
        </div>
    );
};

export default ExerciseDisplay;
