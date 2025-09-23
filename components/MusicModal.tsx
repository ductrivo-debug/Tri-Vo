import React, { useRef } from 'react';
import { Track } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

type PlayMode = 'SEQUENTIAL' | 'SHUFFLE';

interface MusicModalProps {
    playlist: Track[];
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    playMode: PlayMode;
    onAddTracks: (tracks: Track[]) => void;
    onRemoveTrack: (trackId: string) => void;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onVolumeChange: (volume: number) => void;
    onPlayModeChange: (mode: PlayMode) => void;
    onClose: () => void;
}

const MusicModal: React.FC<MusicModalProps> = ({
    playlist, currentTrack, isPlaying, volume, playMode, onAddTracks, onRemoveTrack, onPlayPause, onNext, onPrev, onVolumeChange, onPlayModeChange, onClose
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const newTracks: Track[] = newFiles.map(file => ({
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                file: file,
            }));
            onAddTracks([...playlist, ...newTracks]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md text-white shadow-2xl flex flex-col" style={{maxHeight: '85vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('musicPlayer')}</h2>
                    <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">&times;</button>
                </div>
                
                {/* Playlist */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-2 border-t border-b border-slate-700 py-4">
                    {playlist.length === 0 ? (
                        <p className="text-slate-400 text-center py-10">{t('noMusic')}</p>
                    ) : (
                        playlist.map((track) => (
                            <div key={track.id} className={`flex items-center justify-between p-3 rounded transition-colors ${currentTrack?.id === track.id ? 'bg-slate-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                <span className={`flex-1 truncate ${currentTrack?.id === track.id ? 'font-bold text-blue-400' : ''}`}>{track.name}</span>
                                <button onClick={() => onRemoveTrack(track.id)} className="text-red-500 hover:text-red-400 font-bold text-xl ml-4">×</button>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Add Tracks Button */}
                <input type="file" accept="audio/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 mt-4 px-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors text-lg">
                    + {t('addMusic')}
                </button>

                {/* Controls */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-center text-slate-300 truncate h-6">{currentTrack?.name || t('noTrackSelected')}</p>
                    <div className="flex items-center justify-center space-x-6 my-4">
                        <button onClick={onPrev} disabled={playlist.length === 0} className="text-3xl disabled:opacity-30">«</button>
                        <button onClick={onPlayPause} disabled={playlist.length === 0} className="text-5xl bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-30">
                            {isPlaying ? '❚❚' : '►'}
                        </button>
                        <button onClick={onNext} disabled={playlist.length === 0} className="text-3xl disabled:opacity-30">»</button>
                    </div>
                     <div className="mt-2 flex items-center space-x-2">
                         <span className="text-xs text-slate-400">{t('volume')}</span>
                         <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                     <div className="mt-4 flex justify-center space-x-4">
                        <button 
                            onClick={() => onPlayModeChange('SEQUENTIAL')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md ${playMode === 'SEQUENTIAL' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}
                        >
                            {t('sequential')}
                        </button>
                         <button 
                            onClick={() => onPlayModeChange('SHUFFLE')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md ${playMode === 'SHUFFLE' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}
                        >
                            {t('shuffle')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicModal;
