import React, { useState, useRef } from 'react';
import { SoundSettings, SoundType, SoundSetting } from '../types';
import SoundService from '../services/SoundService';
import { useLanguage } from '../contexts/LanguageContext';

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
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleTest = () => {
        SoundService.playSound(setting);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                onChange({ 
                    ...setting, 
                    type: SoundType.CUSTOM, 
                    customSound: dataUrl,
                    customSoundName: file.name 
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as SoundType;
        if (newType === SoundType.CUSTOM) {
             fileInputRef.current?.click();
        } else {
             onChange({ ...setting, type: newType, customSound: undefined, customSoundName: undefined });
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                <select
                    value={setting.type}
                    onChange={handleTypeChange}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Object.values(SoundType).map(type => (
                        <option key={type} value={type}>{t(type)}</option>
                    ))}
                </select>
                <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={handleTest} className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold text-sm">{t('testSound')}</button>
            </div>
            {setting.type === SoundType.CUSTOM && setting.customSoundName && (
                <div className="mt-2 text-xs text-slate-400">
                    {t('currentSound')}: <span className="font-medium text-slate-200 truncate">{setting.customSoundName}</span>
                     <button onClick={() => fileInputRef.current?.click()} className="ml-2 text-blue-400 hover:text-blue-300 text-xs">[{t('change')}]</button>
                </div>
            )}
            <div className="mt-2 flex items-center space-x-2">
                 <span className="text-xs text-slate-400">{t('volume')}</span>
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
    const { t } = useLanguage();

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('soundSettings')}</h2>
                
                <div className="space-y-6">
                    <SoundOptionControl
                        label={t('startSoundLabel')}
                        setting={settings.start}
                        onChange={(newSetting) => setSettings({ ...settings, start: newSetting })}
                    />
                     <SoundOptionControl
                        label={t('endSoundLabel')}
                        setting={settings.end}
                        onChange={(newSetting) => setSettings({ ...settings, end: newSetting })}
                    />
                     <SoundOptionControl
                        label={t('warningSoundLabel')}
                        setting={settings.warning}
                        onChange={(newSetting) => setSettings({ ...settings, warning: newSetting })}
                    />
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

export default SoundSettingsModal;
