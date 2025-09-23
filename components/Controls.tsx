import React from 'react';
import { TimerPhase } from '../types';

interface ControlsProps {
    isActive: boolean;
    phase: TimerPhase;
    onStartPause: () => void;
    onReset: () => void;
    onSettings: () => void;
    onSoundSettings: () => void;
    onPlaylist: () => void;
    onHistory: () => void;
    onMusic: () => void;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; }> = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-lg font-bold py-4 px-4 rounded-lg transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const SmallButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; }> = ({ onClick, children, className }) => (
     <button
        onClick={onClick}
        className={`w-full text-base font-bold py-3 px-3 rounded-lg transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
    >
        {children}
    </button>
);


const Controls: React.FC<ControlsProps> = ({ isActive, phase, onStartPause, onReset, onSettings, onSoundSettings, onPlaylist, onHistory, onMusic }) => {
    const getStartPauseText = () => {
        if (phase === TimerPhase.FINISHED) return "Bắt đầu lại";
        if (isActive) return "Tạm dừng";
        return "Bắt đầu";
    };
    
    const startPauseColor = isActive ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

    return (
        <div className="w-full max-w-sm space-y-3">
            <Button onClick={onStartPause} className={`${startPauseColor} text-white`}>
                {getStartPauseText()}
            </Button>
            <div className="grid grid-cols-3 gap-3">
                 <SmallButton onClick={onReset} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Đặt lại
                </SmallButton>
                 <SmallButton onClick={onSoundSettings} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Âm thanh
                </SmallButton>
                <SmallButton onClick={onSettings} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Cài đặt
                </SmallButton>
            </div>
             <div className="grid grid-cols-3 gap-3">
                 <SmallButton onClick={onPlaylist} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Bài tập
                </SmallButton>
                 <SmallButton onClick={onHistory} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Lịch sử
                </SmallButton>
                 <SmallButton onClick={onMusic} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Nhạc
                </SmallButton>
            </div>
        </div>
    );
};

export default Controls;