import React, { useState } from 'react';
import { Exercise } from '../types';
import CustomExerciseFormModal from './CustomExerciseFormModal';
import { useLanguage } from '../contexts/LanguageContext';

// FIX: Update props to manage all exercises (library) in addition to the playlist.
interface ManageExercisesModalProps {
    allExercises: Exercise[];
    currentUserPlaylist: Exercise[];
    onSave: (newPlaylist: Exercise[], newAllExercises: Exercise[]) => void;
    onClose: () => void;
}

const ExercisePlaylistModal: React.FC<ManageExercisesModalProps> = ({ allExercises, currentUserPlaylist, onSave, onClose }) => {
    const [playlist, setPlaylist] = useState<Exercise[]>(currentUserPlaylist);
    const [library, setLibrary] = useState<Exercise[]>(allExercises);
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
            const updatedExercise = exerciseData as Exercise;
            setPlaylist(prev => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
            setLibrary(prev => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
        } else { // Adding new
            const newExercise: Exercise = {
                id: new Date().toISOString() + Math.random(), // simple unique id
                ...exerciseData,
                rounds: (exerciseData as any).rounds || 1,
                duration: (exerciseData as any).duration || 180,
            };
            setPlaylist(prev => [...prev, newExercise]);
            setLibrary(prev => [...prev, newExercise]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('confirmDeleteExercise'))) {
            // "Permanently delete" implies removal from both playlist and library.
            setPlaylist(prev => prev.filter(ex => ex.id !== id));
            setLibrary(prev => prev.filter(ex => ex.id !== id));
        }
    };
    
     const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const move = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= playlist.length) return;
        const newExercises = [...playlist];
        const [item] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, item);
        setPlaylist(newExercises);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg text-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                    <h2 className="text-2xl font-bold mb-4 text-center">{t('manageExercises')}</h2>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-2 mb-4 border-t border-b border-slate-700 py-4">
                        {playlist.map((ex, index) => (
                            <div key={ex.id} className="flex items-center justify-between bg-slate-700 p-3 rounded hover:bg-slate-600 transition-colors">
                                <div className="flex-1 truncate">
                                    <span className="font-semibold">{index + 1}. {ex.name}</span>
                                    <span className="text-sm text-slate-400 ml-2">({ex.rounds} x {formatDuration(ex.duration)})</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => move(index, index - 1)} disabled={index === 0} className="disabled:opacity-25 text-lg p-1">▲</button>
                                    <button onClick={() => move(index, index + 1)} disabled={index === playlist.length - 1} className="disabled:opacity-25 text-lg p-1">▼</button>
                                    <button onClick={() => openFormForEdit(ex)} className="text-blue-400 hover:text-blue-300 font-semibold">{t('edit')}</button>
                                    <button onClick={() => handleDelete(ex.id)} className="text-red-500 hover:text-red-400 font-bold text-xl">×</button>
                                </div>
                            </div>
                        ))}
                        {playlist.length === 0 && (
                            <p className="text-slate-500 text-center py-8">{t('noExercises')}</p>
                        )}
                    </div>
                    <button onClick={openFormForNew} className="w-full py-3 px-4 mb-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors text-lg">
                        + {t('createNewExercise')}
                    </button>
                    <div className="flex space-x-4">
                        <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('cancel')}</button>
                        {/* FIX: Call onSave with both the updated playlist and the updated library of all exercises. */}
                        <button onClick={() => onSave(playlist, library)} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">{t('saveAndClose')}</button>
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
