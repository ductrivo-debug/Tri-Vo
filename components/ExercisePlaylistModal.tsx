import React, { useState } from 'react';
import { Exercise } from '../types';
import CustomExerciseFormModal from './CustomExerciseFormModal';
import { useLanguage } from '../contexts/LanguageContext';

interface ManageExercisesModalProps {
    currentUserPlaylist: Exercise[];
    onSave: (newPlaylist: Exercise[]) => void;
    onClose: () => void;
}

const ExercisePlaylistModal: React.FC<ManageExercisesModalProps> = ({ currentUserPlaylist, onSave, onClose }) => {
    const [exercises, setExercises] = useState<Exercise[]>(currentUserPlaylist);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
    const { t } = useLanguage();

    const openFormForNew = () => {
        setExerciseToEdit(null);
        setIsFormOpen(true);
    };

    const openFormForEdit = (exercise: Exercise) => {
        setExerciseToEdit(exercise);
        setIsFormOpen(true);
    };

    const handleSaveExercise = (exerciseData: Omit<Exercise, 'id'> | Exercise) => {
        if ('id' in exerciseData) { // Editing existing
            setExercises(prev => prev.map(ex => ex.id === exerciseData.id ? exerciseData : ex));
        } else { // Adding new
            const newExercise: Exercise = {
                ...exerciseData,
                id: new Date().toISOString() + Math.random(), // simple unique id
            };
            setExercises(prev => [...prev, newExercise]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('confirmDeleteExercise'))) {
            setExercises(prev => prev.filter(ex => ex.id !== id));
        }
    };

    const move = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= exercises.length) return;
        const newExercises = [...exercises];
        const [item] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, item);
        setExercises(newExercises);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg text-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                    <h2 className="text-2xl font-bold mb-4 text-center">{t('manageExercises')}</h2>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-2 mb-4 border-t border-b border-slate-700 py-4">
                        {exercises.map((ex, index) => (
                            <div key={ex.id} className="flex items-center justify-between bg-slate-700 p-3 rounded hover:bg-slate-600 transition-colors">
                                <span className="flex-1 truncate font-semibold">{index + 1}. {ex.name}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => move(index, index - 1)} disabled={index === 0} className="disabled:opacity-25 text-lg p-1">▲</button>
                                    <button onClick={() => move(index, index + 1)} disabled={index === exercises.length - 1} className="disabled:opacity-25 text-lg p-1">▼</button>
                                    <button onClick={() => openFormForEdit(ex)} className="text-blue-400 hover:text-blue-300 font-semibold">{t('edit')}</button>
                                    <button onClick={() => handleDelete(ex.id)} className="text-red-500 hover:text-red-400 font-bold text-xl">×</button>
                                </div>
                            </div>
                        ))}
                        {exercises.length === 0 && (
                            <p className="text-slate-500 text-center py-8">{t('noExercises')}</p>
                        )}
                    </div>
                    <button onClick={openFormForNew} className="w-full py-3 px-4 mb-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors text-lg">
                        + {t('createNewExercise')}
                    </button>
                    <div className="flex space-x-4">
                        <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('cancel')}</button>
                        <button onClick={() => onSave(exercises)} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">{t('saveAndClose')}</button>
                    </div>
                </div>
            </div>
            {isFormOpen && (
                <CustomExerciseFormModal
                    exerciseToEdit={exerciseToEdit}
                    onSave={handleSaveExercise}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </>
    );
};

export default ExercisePlaylistModal;
