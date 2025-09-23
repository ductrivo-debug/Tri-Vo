import React, { useState, useEffect } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkoutPlanFormModalProps {
    planToEdit: WorkoutPlan | null;
    allExercises: Exercise[];
    onSave: (plan: Omit<WorkoutPlan, 'id'> | WorkoutPlan) => void;
    onClose: () => void;
}

const WorkoutPlanFormModal: React.FC<WorkoutPlanFormModalProps> = ({ planToEdit, allExercises, onSave, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (planToEdit) {
            setName(planToEdit.name);
            setSelectedExerciseIds(new Set(planToEdit.exerciseIds));
        }
    }, [planToEdit]);

    const handleToggleExercise = (exerciseId: string) => {
        const newSelection = new Set(selectedExerciseIds);
        if (newSelection.has(exerciseId)) {
            newSelection.delete(exerciseId);
        } else {
            newSelection.add(exerciseId);
        }
        setSelectedExerciseIds(newSelection);
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert(t('enterPlanName'));
            return;
        }
        const planData = {
            name,
            exerciseIds: Array.from(selectedExerciseIds),
        };

        if (planToEdit) {
            onSave({ ...planToEdit, ...planData });
        } else {
            onSave(planData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-white shadow-2xl animate-fade-in flex flex-col" style={{ maxHeight: '95vh' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">{planToEdit ? t('edit') : t('createNewPlan')}</h2>
                
                <div className="mb-4">
                    <label htmlFor="planName" className="block text-sm font-medium text-slate-300 mb-1">{t('planName')}</label>
                    <input
                        type="text"
                        id="planName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <label className="block text-sm font-medium text-slate-300 mb-2">{t('selectExercises')}</label>
                <div className="flex-grow overflow-y-auto pr-2 border-t border-b border-slate-700 py-2 space-y-2">
                    {allExercises.map(exercise => (
                        <div key={exercise.id} className="flex items-center bg-slate-700 p-3 rounded-md">
                            <input
                                type="checkbox"
                                id={`exercise-${exercise.id}`}
                                checked={selectedExerciseIds.has(exercise.id)}
                                onChange={() => handleToggleExercise(exercise.id)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-slate-600"
                            />
                            <label htmlFor={`exercise-${exercise.id}`} className="ml-3 text-white flex-1 truncate">
                                {exercise.name}
                            </label>
                        </div>
                    ))}
                     {allExercises.length === 0 && <p className="text-slate-500 text-center py-4">{t('noExercises')}</p>}
                </div>
                
                <div className="mt-8 flex space-x-4 pt-4 border-t border-slate-700">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('cancel')}</button>
                    <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlanFormModal;