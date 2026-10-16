import React from 'react';
import { WorkoutSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryModalProps {
    history: WorkoutSession[];
    onClose: () => void;
    onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear }) => {
    const { t, locale } = useLanguage();
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} ${t('minutes')} ${secs} ${t('seconds')}`;
    };

    const handleClear = () => {
        if (window.confirm(t('confirmClearHistory'))) {
            onClear();
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Use a locale-sensitive date format
        const langCode = locale === 'vi' ? 'vi-VN' : locale === 'es' ? 'es-ES' : 'en-US';
        return date.toLocaleDateString(langCode, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    return (
        <div className="mobile-dialog fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-white shadow-2xl flex flex-col" style={{maxHeight: '80vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('workoutHistory')}</h2>
                    <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {history.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">{t('noHistory')}</p>
                    ) : (
                        history.map((session, index) => (
                            <div key={index} className="bg-slate-700 p-4 rounded-lg">
                                <p className="font-semibold text-lg">{formatDate(session.date)}</p>
                                <p className="text-slate-300">{t('duration')}: <span className="font-medium text-white">{formatDuration(session.duration)}</span></p>
                                <p className="text-slate-300">{t('roundsCompleted')}: <span className="font-medium text-white">{session.roundsCompleted}</span></p>
                                <p className="text-slate-300 text-sm mt-1">{t('sessionSettings')}: {session.settings.workTime}s {t('work')} / {session.settings.restTime}s {t('rest')}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 flex space-x-4">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">
                        {t('close')}
                    </button>
                    {history.length > 0 &&
                        <button onClick={handleClear} className="w-full py-2 px-4 bg-red-800 hover:bg-red-700 text-white rounded-md font-semibold transition-colors">
                            {t('clearHistory')}
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;

