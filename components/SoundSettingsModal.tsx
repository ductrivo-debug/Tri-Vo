import React, { useState, useRef } from 'react';
import { SoundSettings, SoundType, SoundSetting } from '../types';
import SoundService from '../services/SoundService';
import { useLanguage } from '../contexts/LanguageContext';
import { cueLabel } from '../services/TimerAudio';
import type { CueKind } from '../services/TimerAudio';

interface SoundSettingsModalProps {
    currentSettings: SoundSettings;
    onSave: (newSettings: SoundSettings) => void;
    onClose: () => void;
}

const SoundOptionControl: React.FC<{
    label: string;
    setting: SoundSetting;
    kind: CueKind;
    voiceVolume: number;
    onChange: (newSetting: SoundSetting) => void;
}> = ({ label, setting, kind, voiceVolume, onChange }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t, locale } = useLanguage();

    const handleTest = () => {
        const lang = ({vi:'vi-VN',en:'en-US',es:'es-ES',ru:'ru-RU',zh:'zh-CN'})[locale] || 'en-US';
        void SoundService.cue(kind, setting, cueLabel({kind, round:1, seconds:3}, locale), lang, voiceVolume);
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
                    step="0.05"
                    value={setting.volume}
                    onChange={(e) => onChange({ ...setting, volume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs w-10">{Math.round(setting.volume * 100)}%</span>
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
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-white shadow-2xl overflow-y-auto" style={{maxHeight:"90dvh"}}>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('soundSettings')}</h2>
                
                <p className="text-sm text-slate-300 mb-4">Chuẩn bị → 3, 2, 1 → Bắt đầu hiệp. Tiếng bắt đầu cao, tiếng nghỉ thấp. Giọng thông báo phát sau tiếng báo để nghe rõ từng phần.</p>
                <label className="block mb-5 text-sm">
                    Âm lượng giọng đọc: {Math.round((settings.voiceVolume ?? 1) * 100)}%
                    <input aria-label="Âm lượng giọng đọc" className="w-full mt-2" type="range" min="0" max="1" step="0.05"
                        value={settings.voiceVolume ?? 1} onChange={event => setSettings({...settings, voiceVolume: Number(event.target.value), profileVersion: 2})} />
                </label>
                <div className="space-y-6">
                    <SoundOptionControl
                        label={t('startSoundLabel')}
                        kind="work" voiceVolume={settings.voiceVolume ?? 1}
                        setting={settings.start}
                        onChange={(newSetting) => setSettings({ ...settings, start: newSetting })}
                    />
                     <SoundOptionControl
                        label={t('endSoundLabel')}
                        kind="rest" voiceVolume={settings.voiceVolume ?? 1}
                        setting={settings.end}
                        onChange={(newSetting) => setSettings({ ...settings, end: newSetting })}
                    />
                     <SoundOptionControl
                        label={t('warningSoundLabel')}
                        kind="countdown" voiceVolume={settings.voiceVolume ?? 1}
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

