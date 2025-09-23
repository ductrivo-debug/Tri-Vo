import React from 'react';
import { TimerPhase } from '../types';

interface ControlsProps {
    isActive: boolean;
    phase: TimerPhase;
    areAlertsMuted: boolean;
    onStartPause: () => void;
    onReset: () => void;
    onSettings: () => void;
    onSoundSettings: () => void;
    onToggleMute: () => void;
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


const Controls: React.FC<ControlsProps> = ({ isActive, phase, areAlertsMuted, onStartPause, onReset, onSettings, onSoundSettings, onToggleMute, onPlaylist, onHistory, onMusic }) => {
    const getStartPauseText = () => {
        if (phase === TimerPhase.FINISHED) return "Bắt đầu lại";
        if (isActive) return "Tạm dừng";
        return "Bắt đầu";
    };
    
    const startPauseColor = isActive ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    const muteButtonColor = areAlertsMuted ? 'bg-slate-800 text-slate-500 ring-1 ring-slate-600' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500';

    return (
        <div className="w-full max-w-sm space-y-3">
            <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                     <Button onClick={onStartPause} className={`${startPauseColor} text-white`}>
                        {getStartPauseText()}
                    </Button>
                </div>
                 <Button onClick={onReset} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Đặt lại
                </Button>
            </div>
            <div className="grid grid-cols-4 gap-3">
                 <SmallButton onClick={onToggleMute} className={muteButtonColor}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mx-auto ${areAlertsMuted ? 'text-slate-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       {areAlertsMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.86 15.14l9-9L5.86 15.14zM9 17v-6a3 3 0 00-5.121-2.572M15 17v-2a3 3 0 00-3-3H9" />
                       ) : (
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                       )}
                    </svg>
                </SmallButton>
                 <SmallButton onClick={onSoundSettings} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Âm thanh
                </SmallButton>
                <SmallButton onClick={onSettings} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Cài đặt
                </SmallButton>
                 <SmallButton onClick={onPlaylist} className="bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500">
                    Bài tập
                </SmallButton>
            </div>
             <div className="grid grid-cols-2 gap-3">
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