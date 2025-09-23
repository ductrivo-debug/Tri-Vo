import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ControlsProps {
    isActive: boolean;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onOpenSettings: () => void;
    onOpenHistory: () => void;
    onOpenPlaylist: () => void;
    onOpenPlans: () => void;
    onOpenMusic: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full py-5 px-2 bg-slate-800 text-slate-200 rounded-lg font-semibold text-xl transition-colors hover:bg-slate-700 shadow-md"
    >
        {children}
    </button>
);


const Controls: React.FC<ControlsProps> = ({ 
    isActive, onStart, onPause, onReset, onOpenSettings, onOpenHistory, onOpenPlaylist, onOpenPlans, onOpenMusic
}) => {
    const { t } = useLanguage();
    
    return (
        <div className="flex flex-col items-center mt-8 space-y-4 w-full">
            {/* Primary Button */}
            <button
                onClick={isActive ? onPause : onStart}
                className="w-full py-6 px-10 bg-red-600 text-white rounded-lg font-bold uppercase tracking-wider text-3xl shadow-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500"
            >
                {isActive ? t('pause') : t('start')}
            </button>

            {/* Secondary Controls Grid */}
             <div className="grid grid-cols-3 gap-4 w-full">
                <ActionButton onClick={onReset}>{t('reset')}</ActionButton>
                <ActionButton onClick={onOpenPlans}>{t('plans')}</ActionButton>
                <ActionButton onClick={onOpenSettings}>{t('settings')}</ActionButton>
                <ActionButton onClick={onOpenPlaylist}>{t('playlist')}</ActionButton>
                <ActionButton onClick={onOpenHistory}>{t('history')}</ActionButton>
                <ActionButton onClick={onOpenMusic}>{t('music')}</ActionButton>
            </div>
        </div>
    );
};

export default Controls;