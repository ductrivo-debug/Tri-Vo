import React, { useState } from 'react';
import { WorkoutSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
    currentSettings: WorkoutSettings;
    onSave: (newSettings: WorkoutSettings) => void;
    onClose: () => void;
    onOpenSounds: () => void;
    // FIX: Add missing props for opening music and plans modals.
    onOpenMusic: () => void;
    onOpenPlans: () => void;
}

// A reusable component for minute and second dropdowns
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


const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose, onOpenSounds, onOpenMusic, onOpenPlans }) => {
    const [settings, setSettings] = useState<WorkoutSettings>(currentSettings);
    const { t } = useLanguage();

    const handleSave = () => {
        onSave(settings);
    };

    const handleOpenSounds = () => {
        onClose();
        onOpenSounds();
    };

    // FIX: Add handlers to close the current modal and open the target modal.
    const handleOpenMusic = () => {
        onClose();
        onOpenMusic();
    };

    const handleOpenPlans = () => {
        onClose();
        onOpenPlans();
    };

    const roundOptions = Array.from({ length: 100 }, (_, i) => i + 1);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('workoutSettings')}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="rounds" className="block text-sm font-medium text-slate-300 mb-1">{t('rounds')}</label>
                        <select
                            id="rounds"
                            value={settings.rounds}
                            onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {roundOptions.map(round => (
                                <option key={round} value={round}>{round}</option>
                            ))}
                        </select>
                    </div>
                     <TimeInput 
                        label={t('workTime')}
                        totalSeconds={settings.workTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, workTime: newTotal}))}
                     />
                    <TimeInput 
                        label={t('restTime')}
                        totalSeconds={settings.restTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, restTime: newTotal}))}
                     />
                     <TimeInput 
                        label={t('longRestTime')}
                        totalSeconds={settings.longRestTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, longRestTime: newTotal}))}
                     />
                     <div>
                        <label htmlFor="longRestFrequency" className="block text-sm font-medium text-slate-300 mb-1">{t('longRestAfter')}</label>
                        <input
                            type="number"
                            id="longRestFrequency"
                            value={settings.longRestFrequency}
                            onChange={(e) => setSettings({ ...settings, longRestFrequency: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
                    <button onClick={handleOpenSounds} className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors">{t('sounds')}</button>
                    {/* FIX: Add buttons to open Music and Plans modals. */}
                    <button onClick={handleOpenMusic} className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors">{t('music')}</button>
                    <button onClick={handleOpenPlans} className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors">{t('plans')}</button>
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

export default SettingsModal;
