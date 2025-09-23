import React, { useState } from 'react';
import { SoundSettings, SoundType, SoundSetting } from '../types';
import SoundService from '../services/SoundService';

interface SoundSettingsModalProps {
    currentSettings: SoundSettings;
    onSave: (newSettings: SoundSettings) => void;
    onClose: () => void;
}

const SoundOptionControl: React.FC<{
    label: string;
    setting: SoundSetting;
    onChange: (newSetting: SoundSetting) => void;
}> = ({ label, setting, onChange }) => {
    
    const handleTest = () => {
        SoundService.playSound(setting);
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                <select
                    value={setting.type}
                    onChange={(e) => onChange({ ...setting, type: e.target.value as SoundType })}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Object.values(SoundType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <button onClick={handleTest} className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold text-sm">Thử</button>
            </div>
            <div className="mt-2 flex items-center space-x-2">
                 <span className="text-xs text-slate-400">Âm lượng</span>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={setting.volume}
                    onChange={(e) => onChange({ ...setting, volume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};


const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
    const [settings, setSettings] = useState<SoundSettings>(currentSettings);

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Cài đặt âm thanh</h2>
                
                <div className="space-y-6">
                    <SoundOptionControl
                        label="Báo hiệu Bắt đầu / Tiếp tục hiệp"
                        setting={settings.start}
                        onChange={(newSetting) => setSettings({ ...settings, start: newSetting })}
                    />
                     <SoundOptionControl
                        label="Báo hiệu Kết thúc hiệp"
                        setting={settings.end}
                        onChange={(newSetting) => setSettings({ ...settings, end: newSetting })}
                    />
                     <SoundOptionControl
                        label="Báo hiệu sắp hết giờ"
                        setting={settings.warning}
                        onChange={(newSetting) => setSettings({ ...settings, warning: newSetting })}
                    />
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

export default SoundSettingsModal;
