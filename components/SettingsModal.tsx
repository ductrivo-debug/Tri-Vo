import React, { useState } from 'react';
import { WorkoutSettings } from '../types';

interface SettingsModalProps {
    currentSettings: WorkoutSettings;
    onSave: (newSettings: WorkoutSettings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
    const [settings, setSettings] = useState<WorkoutSettings>(currentSettings);

    const handleSave = () => {
        onSave(settings);
    };

    const formatTimeFromSeconds = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    
    const parseTimeToSeconds = (time: string) => {
        const [minutes, seconds] = time.split(':').map(Number);
        return (minutes || 0) * 60 + (seconds || 0);
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
                     <div>
                        <label htmlFor="workTime" className="block text-sm font-medium text-slate-300 mb-1">Thời gian tập (phút:giây)</label>
                        <input
                            type="text"
                            id="workTime"
                            value={formatTimeFromSeconds(settings.workTime)}
                            onChange={(e) => setSettings(prev => ({...prev, workTime: parseTimeToSeconds(e.target.value)}))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            pattern="[0-9]{2}:[0-9]{2}"
                        />
                    </div>
                    <div>
                        <label htmlFor="restTime" className="block text-sm font-medium text-slate-300 mb-1">Thời gian nghỉ (phút:giây)</label>
                        <input
                           type="text"
                            id="restTime"
                            value={formatTimeFromSeconds(settings.restTime)}
                            onChange={(e) => setSettings(prev => ({...prev, restTime: parseTimeToSeconds(e.target.value)}))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            pattern="[0-9]{2}:[0-9]{2}"
                        />
                    </div>
                    <div>
                        <label htmlFor="longRestTime" className="block text-sm font-medium text-slate-300 mb-1">Thời gian nghỉ dài (phút:giây)</label>
                        <input
                           type="text"
                            id="longRestTime"
                            value={formatTimeFromSeconds(settings.longRestTime)}
                            onChange={(e) => setSettings(prev => ({...prev, longRestTime: parseTimeToSeconds(e.target.value)}))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            pattern="[0-9]{2}:[0-9]{2}"
                        />
                    </div>
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