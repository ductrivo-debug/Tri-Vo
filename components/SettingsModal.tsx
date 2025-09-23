import React, { useState } from 'react';
import { WorkoutSettings } from '../types';

interface SettingsModalProps {
    currentSettings: WorkoutSettings;
    onSave: (newSettings: WorkoutSettings) => void;
    onClose: () => void;
}

// A reusable component for minute and second dropdowns
const TimeInput: React.FC<{
    label: string;
    totalSeconds: number;
    onChange: (newTotalSeconds: number) => void;
}> = ({ label, totalSeconds, onChange }) => {
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
                        <option key={min} value={min}>{min.toString().padStart(2, '0')} phút</option>
                    ))}
                </select>
                <select
                    value={currentSeconds}
                    onChange={handleSecondChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {secondOptions.map(sec => (
                        <option key={sec} value={sec}>{sec.toString().padStart(2, '0')} giây</option>
                    ))}
                </select>
            </div>
        </div>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
    const [settings, setSettings] = useState<WorkoutSettings>(currentSettings);

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Cài đặt tập luyện</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="rounds" className="block text-sm font-medium text-slate-300 mb-1">Số hiệp</label>
                        <input
                            type="number"
                            id="rounds"
                            value={settings.rounds}
                            onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                     <TimeInput 
                        label="Thời gian tập"
                        totalSeconds={settings.workTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, workTime: newTotal}))}
                     />
                    <TimeInput 
                        label="Thời gian nghỉ"
                        totalSeconds={settings.restTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, restTime: newTotal}))}
                     />
                     <TimeInput 
                        label="Thời gian nghỉ dài"
                        totalSeconds={settings.longRestTime}
                        onChange={(newTotal) => setSettings(prev => ({...prev, longRestTime: newTotal}))}
                     />
                     <div>
                        <label htmlFor="longRestFrequency" className="block text-sm font-medium text-slate-300 mb-1">Nghỉ dài sau mỗi (hiệp)</label>
                        <input
                            type="number"
                            id="longRestFrequency"
                            value={settings.longRestFrequency}
                            onChange={(e) => setSettings({ ...settings, longRestFrequency: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-8 flex space-x-4">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">
                        Hủy
                    </button>
                    <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;