import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CustomExerciseFormModalProps {
    exerciseToEdit: Exercise | null;
    onSave: (exercise: Omit<Exercise, 'id'> | Exercise) => void;
    onClose: () => void;
}

const CustomExerciseFormModal: React.FC<CustomExerciseFormModalProps> = ({ exerciseToEdit, onSave, onClose }) => {
    const { t } = useLanguage();
    const [exercise, setExercise] = useState({
        name: '',
        description: '',
        category: ExerciseCategory.ENDURANCE,
        imageUrl: '',
    });

    useEffect(() => {
        if (exerciseToEdit) {
            setExercise({
                name: exerciseToEdit.name,
                description: exerciseToEdit.description,
                category: exerciseToEdit.category,
                imageUrl: exerciseToEdit.imageUrl || '',
            });
        }
    }, [exerciseToEdit]);

    const handleSave = () => {
        if (!exercise.name.trim()) {
            alert(t('enterExerciseName'));
            return;
        }
        if (exerciseToEdit) {
             onSave({ ...exerciseToEdit, ...exercise });
        } else {
             onSave(exercise);
        }
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setExercise(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center">{exerciseToEdit ? t('editExercise') : t('createNewExercise')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">{t('exerciseName')}</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={exercise.name}
                            onChange={handleChange}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">{t('description')}</label>
                        <textarea
                            id="description"
                            name="description"
                            value={exercise.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">{t('category')}</label>
                        <select
                            id="category"
                            name="category"
                            value={exercise.category}
                            onChange={handleChange}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={ExerciseCategory.BOXING}>{t('BOXING')}</option>
                            <option value={ExerciseCategory.ENDURANCE}>{t('ENDURANCE')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300 mb-1">{t('imageUrl')}</label>
                        <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            value={exercise.imageUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-8 flex space-x-4">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomExerciseFormModal;
