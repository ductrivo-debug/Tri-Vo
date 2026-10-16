import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseCategory } from '../types';
import { SPORTS } from '../services/WorkoutLibrary';
import { useLanguage } from '../contexts/LanguageContext';

interface CustomExerciseFormModalProps {
    exerciseToEdit: Exercise | null;
    onSave: (exercise: Omit<Exercise, 'id'> | Exercise) => void;
    onClose: () => void;
}

const TimeInput: React.FC<{
    label: string;
    totalSeconds: number;
    onChange: (newTotalSeconds: number) => void;
}> = ({ label, totalSeconds, onChange }) => {
    const { t } = useLanguage();
    const currentMinutes = Math.floor(totalSeconds / 60);
    const currentSeconds = totalSeconds % 60;

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinutes = parseInt(e.target.value, 10);
        onChange(newMinutes * 60 + currentSeconds);
    };

    const handleSecondChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSeconds = parseInt(e.target.value, 10);
        onChange(currentMinutes * 60 + newSeconds);
    };

    const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
    const secondOptions = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <div className="flex space-x-2">
                <select
                    value={currentMinutes}
                    onChange={handleMinuteChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {minuteOptions.map(min => (
                        <option key={min} value={min}>{min.toString().padStart(2, '0')} {t('minutes')}</option>
                    ))}
                </select>
                <select
                    value={currentSeconds}
                    onChange={handleSecondChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {secondOptions.map(sec => (
                        <option key={sec} value={sec}>{sec.toString().padStart(2, '0')} {t('seconds')}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};


const CustomExerciseFormModal: React.FC<CustomExerciseFormModalProps> = ({ exerciseToEdit, onSave, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ExerciseCategory>(ExerciseCategory.CUSTOM);
    const [duration, setDuration] = useState(180); // Default 3 minutes

    useEffect(() => {
        if (exerciseToEdit) {
            setName(exerciseToEdit.name);
            setDescription(exerciseToEdit.description);
            setCategory(exerciseToEdit.category);
            setDuration(exerciseToEdit.duration);
        }
    }, [exerciseToEdit]);

    const handleSave = () => {
        if (duration <= 0) { alert('Thời gian bài tập phải lớn hơn 0 giây.'); return; }
        if (!name.trim()) {
            alert(t('enterExerciseName'));
            return;
        }

        const exerciseData = {
            name,
            description,
            category,
            duration,
        };

        if (exerciseToEdit) {
            onSave({ ...exerciseToEdit, ...exerciseData });
        } else {
            onSave(exerciseData);
        }
        onClose();
    };
    
    return (
        <div className="mobile-dialog fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">{exerciseToEdit ? t('editExercise') : t('createNewExercise')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="exerciseName" className="block text-sm font-medium text-slate-300 mb-1">{t('exerciseName')}</label>
                        <input
                            type="text"
                            id="exerciseName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                     <TimeInput 
                        label={t('exerciseDuration')}
                        totalSeconds={duration}
                        onChange={setDuration}
                     />
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">{t('descriptionLabel')}</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                             className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">{t('category')}</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(ExerciseCategory).map(cat => (
                                <option key={cat} value={cat}>{SPORTS.find(s=>s.id===cat)?.name || t(cat)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="mt-8 flex space-x-4">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('cancel')}</button>
                    <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

export default CustomExerciseFormModal;
