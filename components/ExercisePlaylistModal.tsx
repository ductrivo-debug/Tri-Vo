import React, { useState } from 'react';
import { Exercise } from '../types';
import CustomExerciseFormModal from './CustomExerciseFormModal';
import { useLanguage } from '../contexts/LanguageContext';

interface ExercisePlaylistModalProps {
    playlist: Exercise[];
    allExercises: Exercise[];
    onClose: () => void;
    onUpdatePlaylist: (newPlaylist: Exercise[]) => void;
    onAddOrUpdateExercise: (exercise: Omit<Exercise, 'id'> | Exercise) => void;
    onDeleteExercise: (exerciseId: string) => void;
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const ExercisePlaylistModal: React.FC<ExercisePlaylistModalProps> = ({ playlist, allExercises, onClose, onUpdatePlaylist, onAddOrUpdateExercise, onDeleteExercise }) => {
    const { t } = useLanguage();
    const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
    
    const availableExercises = allExercises.filter(ex => !playlist.some(pEx => pEx.id === ex.id));

    const handleAddToPlaylist = (exercise: Exercise) => {
        onUpdatePlaylist([...playlist, exercise]);
    };

    const handleRemoveFromPlaylist = (exerciseId: string) => {
        onUpdatePlaylist(playlist.filter(ex => ex.id !== exerciseId));
    };

    const openEditForm = (exercise: Exercise) => {
        setExerciseToEdit(exercise);
        setIsCustomFormOpen(true);
    };

    const openNewForm = () => {
        setExerciseToEdit(null);
        setIsCustomFormOpen(true);
    }
    
    const handleDeleteExercise = (exerciseId: string) => {
        if (window.confirm(t('confirmDeleteExercise'))) {
            handleRemoveFromPlaylist(exerciseId); // Also remove from current playlist if it exists
            onDeleteExercise(exerciseId);
        }
    };


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-3xl text-white shadow-2xl flex flex-col" style={{maxHeight: '90vh'}}>
                    <h2 className="text-2xl font-bold mb-4 text-center">{t('exercisePlaylist')}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
                        {/* Current Playlist */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-2 border-b border-slate-700 pb-2">{t('playlist')} ({playlist.length})</h3>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                                {playlist.length === 0 && <p className="text-slate-500 text-center py-8">{t('noExercisesInPlaylist')}</p>}
                                {playlist.map(exercise => (
                                    <div key={exercise.id} className="bg-slate-700 p-2 rounded-md flex items-center justify-between">
                                        <span className="truncate flex-1">{exercise.name} <span className="text-slate-400 text-xs">({formatTime(exercise.duration)})</span></span>
                                        <button onClick={() => handleRemoveFromPlaylist(exercise.id)} className="ml-2 px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-bold">X</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available Exercises */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-2 border-b border-slate-700 pb-2">{t('availableExercises')} ({allExercises.length})</h3>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                                {allExercises.map(exercise => (
                                     <div key={exercise.id} className="bg-slate-700 p-2 rounded-md flex items-center justify-between">
                                        <div className="truncate flex-1">
                                            {exercise.name} <span className="text-slate-400 text-xs">({formatTime(exercise.duration)})</span>
                                        </div>
                                        <div className="flex space-x-1 ml-2">
                                            {!playlist.some(pEx => pEx.id === exercise.id) && 
                                                <button onClick={() => handleAddToPlaylist(exercise)} className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-bold">+</button>
                                            }
                                            <button onClick={() => openEditForm(exercise)} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-bold">{t('edit')}</button>
                                            <button onClick={() => handleDeleteExercise(exercise.id)} className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-bold">X</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={openNewForm} className="w-full text-left mt-2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded">
                                    + {t('addCustomExercise')}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                         <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('close')}</button>
                    </div>
                </div>
            </div>
            {isCustomFormOpen && (
                <CustomExerciseFormModal 
                    exerciseToEdit={exerciseToEdit}
                    onSave={onAddOrUpdateExercise}
                    onClose={() => setIsCustomFormOpen(false)}
                />
            )}
        </>
    );
};

export default ExercisePlaylistModal;