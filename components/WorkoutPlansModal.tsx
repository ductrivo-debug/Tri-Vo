import React, { useState } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import WorkoutPlanFormModal from './WorkoutPlanFormModal';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkoutPlansModalProps {
    plans: WorkoutPlan[];
    allExercises: Exercise[];
    onClose: () => void;
    onLoadPlan: (plan: WorkoutPlan) => void;
    onSavePlans: (updatedPlans: WorkoutPlan[]) => void;
}

const WorkoutPlansModal: React.FC<WorkoutPlansModalProps> = ({ plans, allExercises, onClose, onLoadPlan, onSavePlans }) => {
    const { t } = useLanguage();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<WorkoutPlan | null>(null);

    const openFormForNew = () => {
        setPlanToEdit(null);
        setIsFormOpen(true);
    };

    const openFormForEdit = (plan: WorkoutPlan) => {
        setPlanToEdit(plan);
        setIsFormOpen(true);
    };

    const handleSavePlan = (planData: Omit<WorkoutPlan, 'id'> | WorkoutPlan) => {
        let updatedPlans;
        if ('id' in planData) { // Editing
            updatedPlans = plans.map(p => p.id === planData.id ? planData : p);
        } else { // Adding
            const newPlan: WorkoutPlan = {
                id: new Date().toISOString() + Math.random(),
                ...planData,
            };
            updatedPlans = [...plans, newPlan];
        }
        onSavePlans(updatedPlans);
    };

    const handleDeletePlan = (id: string) => {
        if (window.confirm(t('confirmDeletePlan'))) {
            onSavePlans(plans.filter(p => p.id !== id));
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg text-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                    <h2 className="text-2xl font-bold mb-4 text-center">{t('workoutPlans')}</h2>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-3 mb-4 border-t border-b border-slate-700 py-4">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-slate-700 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex-1 mb-3 sm:mb-0">
                                    <p className="font-semibold text-lg">{plan.name}</p>
                                    <p className="text-xs text-slate-400">{plan.exerciseIds.length} {t('playlist')}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => onLoadPlan(plan)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold">{t('loadPlan')}</button>
                                    <button onClick={() => openFormForEdit(plan)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold">{t('edit')}</button>
                                    <button onClick={() => handleDeletePlan(plan.id)} className="px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded text-sm font-semibold">×</button>
                                </div>
                            </div>
                        ))}
                        {plans.length === 0 && <p className="text-slate-500 text-center py-8">{t('noPlans')}</p>}
                    </div>
                    <button onClick={openFormForNew} className="w-full py-3 px-4 mb-4 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors text-lg">
                        + {t('createNewPlan')}
                    </button>
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('close')}</button>
                </div>
            </div>
            {isFormOpen && (
                <WorkoutPlanFormModal
                    planToEdit={planToEdit}
                    allExercises={allExercises}
                    onSave={handleSavePlan}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </>
    );
};

export default WorkoutPlansModal;