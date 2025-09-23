import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerPhase, WorkoutSettings, Exercise, SoundSettings, SoundType, WorkoutSession, Track } from './types';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SettingsModal from './components/SettingsModal';
import SoundSettingsModal from './components/SoundSettingsModal';
import ExerciseDisplay from './components/ExerciseDisplay';
import SoundService from './services/SoundService';
import MusicService from './services/MusicService';
import HistoryModal from './components/HistoryModal';
import ExercisePlaylistModal from './components/ExercisePlaylistModal';
import MusicModal from './components/MusicModal';

type PlayMode = 'SEQUENTIAL' | 'SHUFFLE';

const App: React.FC = () => {
    // --- State Initialization ---
    const [settings, setSettings] = useState<WorkoutSettings>(() => getInitialSettings('silverbackMmaSettings', {
        rounds: 12, workTime: 180, restTime: 60, longRestTime: 120, longRestFrequency: 4,
    }));
    const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => getInitialSettings('silverbackMmaSoundSettings', {
        start: { type: SoundType.BELL, volume: 0.8 }, end: { type: SoundType.GONG, volume: 1.0 }, warning: { type: SoundType.BEEP, volume: 0.7 },
    }));
    const [customExercises, setCustomExercises] = useState<Exercise[]>(() => getInitialSettings('silverbackMmaCustomExercises', []));
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => getInitialSettings('silverbackMmaHistory', []));
    const [areAlertsMuted, setAreAlertsMuted] = useState<boolean>(false);

    // Music State
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [musicVolume, setMusicVolume] = useState<number>(() => getInitialSettings('silverbackMmaMusicVolume', 0.5));
    const [playMode, setPlayMode] = useState<PlayMode>('SEQUENTIAL');

    const [isActive, setIsActive] = useState<boolean>(false);
    const [phase, setPhase] = useState<TimerPhase>(TimerPhase.PREPARE);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
    const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState<boolean>(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
    const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
    
    const musicServiceRef = useRef(new MusicService(() => {
        // onTrackEnd callback
        handleGoToNextTrack();
    }));
    
    useEffect(() => {
       musicServiceRef.current.setVolume(musicVolume);
    }, [musicVolume]);
    
     useEffect(() => {
        if (currentTrackIndex !== null && isMusicPlaying) {
            musicServiceRef.current.play(playlist[currentTrackIndex].file);
        } else {
            musicServiceRef.current.pause();
        }
    }, [currentTrackIndex, isMusicPlaying, playlist]);


    // --- LocalStorage Logic ---
    function getInitialSettings<T>(key: string, defaultConfig: T): T {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultConfig;
        } catch (error) {
            console.error(`Could not load ${key} from localStorage`, error);
            return defaultConfig;
        }
    }

    const usePersistedState = <T,>(key: string, state: T) => {
        useEffect(() => {
            try { localStorage.setItem(key, JSON.stringify(state)); }
            catch (e) { console.error(`Failed to save ${key}`, e); }
        }, [key, state]);
    };

    usePersistedState('silverbackMmaSettings', settings);
    usePersistedState('silverbackMmaSoundSettings', soundSettings);
    usePersistedState('silverbackMmaCustomExercises', customExercises);
    usePersistedState('silverbackMmaHistory', workoutHistory);
    usePersistedState('silverbackMmaMusicVolume', musicVolume);


    // --- Sound Logic ---
    const playSoundWithDucking = (soundSetting: SoundSettings[keyof SoundSettings]) => {
        if (areAlertsMuted) return;
        if (isMusicPlaying) musicServiceRef.current.duckVolume();
        SoundService.playSound(soundSetting);
        if (isMusicPlaying) setTimeout(() => musicServiceRef.current.restoreVolume(), 1200);
    };

    // --- Core Logic ---
    const selectNewExercise = useCallback(() => {
        if (customExercises.length > 0) {
            setCurrentExercise(customExercises[currentExerciseIndex]);
            setCurrentExerciseIndex(prev => (prev + 1) % customExercises.length);
        } else {
            setCurrentExercise(null); // No exercises available
        }
    }, [customExercises, currentExerciseIndex]);

    const resetTimer = useCallback(() => {
        SoundService.stop();
        setIsActive(false);
        setPhase(TimerPhase.PREPARE);
        setCurrentRound(1);
        setTimeLeft(10);
        setCurrentExerciseIndex(0);
        setWorkoutStartTime(null);
        selectNewExercise();
    }, [selectNewExercise]);
    
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
                
                if (phase === TimerPhase.PREPARE && timeLeft > 1) {
                     playSoundWithDucking(soundSettings.warning);
                }
                else if (phase !== TimerPhase.PREPARE && timeLeft <= 4 && timeLeft > 1) {
                    playSoundWithDucking(soundSettings.warning);
                }
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            if (phase === TimerPhase.PREPARE) {
                setPhase(TimerPhase.WORK);
                setTimeLeft(settings.workTime);
                playSoundWithDucking(soundSettings.start);
            } else if (phase === TimerPhase.WORK) {
                if (currentRound >= settings.rounds) {
                    setIsActive(false);
                    setPhase(TimerPhase.FINISHED);
                    playSoundWithDucking(soundSettings.end);
                    if (workoutStartTime) {
                        const newSession: WorkoutSession = {
                            date: new Date().toISOString(),
                            duration: Math.round((Date.now() - workoutStartTime) / 1000),
                            roundsCompleted: settings.rounds,
                            settings,
                        };
                        setWorkoutHistory(prev => [newSession, ...prev]);
                        setWorkoutStartTime(null);
                    }
                } else {
                    const nextPhase = (settings.longRestFrequency > 0 && currentRound % settings.longRestFrequency === 0) 
                        ? TimerPhase.LONG_REST 
                        : TimerPhase.REST;
                    const nextTime = nextPhase === TimerPhase.LONG_REST ? settings.longRestTime : settings.restTime;
                    setPhase(nextPhase);
                    setTimeLeft(nextTime);
                    playSoundWithDucking(soundSettings.end);
                    selectNewExercise();
                }
            } else if (phase === TimerPhase.REST || phase === TimerPhase.LONG_REST) {
                setCurrentRound(prev => prev + 1);
                setPhase(TimerPhase.WORK);
                setTimeLeft(settings.workTime);
                playSoundWithDucking(soundSettings.start);
            }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, phase, currentRound, settings, soundSettings, selectNewExercise, workoutStartTime, isMusicPlaying, areAlertsMuted]);

    useEffect(() => {
      selectNewExercise();
    }, []); // Run only once on mount

    // --- Event Handlers ---
    const handleStartPause = () => {
        if (phase === TimerPhase.FINISHED) {
            resetTimer();
            return;
        }
        setIsActive(!isActive);
        SoundService.init();
        if (!isActive && !workoutStartTime) {
            setWorkoutStartTime(Date.now());
        }
    };
    
    const handleGoToNextTrack = useCallback(() => {
        if (playlist.length === 0) return;
        
        setCurrentTrackIndex(prevIndex => {
            if (prevIndex === null) return 0;
            
            if (playMode === 'SHUFFLE') {
                if (playlist.length <= 1) return 0;
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * playlist.length);
                } while (nextIndex === prevIndex);
                return nextIndex;
            } else { // SEQUENTIAL
                return (prevIndex + 1) % playlist.length;
            }
        });

        if (!isMusicPlaying) setIsMusicPlaying(true);
    }, [playlist, playMode, isMusicPlaying]);

    const handleMusicPlayPause = () => {
        if (playlist.length === 0) return;
        if (currentTrackIndex === null) {
            setCurrentTrackIndex(0);
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const handleNextTrack = () => {
        handleGoToNextTrack();
    };

    const handlePrevTrack = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex(prev => (prev === null ? 0 : (prev - 1 + playlist.length) % playlist.length));
        if (!isMusicPlaying) setIsMusicPlaying(true);
    };

    const openMusicModal = () => {
        musicServiceRef.current.init(); // Ensures AudioContext is ready on user gesture
        setIsMusicModalOpen(true);
    };

    const getTotalTime = () => {
        switch (phase) {
            case TimerPhase.PREPARE: return 10;
            case TimerPhase.WORK: return settings.workTime;
            case TimerPhase.REST: return settings.restTime;
            case TimerPhase.LONG_REST: return settings.longRestTime;
            default: return 1;
        }
    };
    
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <header className="w-full text-center mb-8">
                    <h1 className="text-5xl font-black tracking-tighter uppercase">
                        <span className="bg-gradient-to-r from-slate-300 to-white text-transparent bg-clip-text">Silverback</span>
                        <span className="text-red-500"> MMA</span>
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wider mt-1">WORKOUT TIMER</p>
                </header>
                <main className="flex flex-col items-center justify-center w-full">
                    <TimerDisplay phase={phase} timeLeft={timeLeft} totalTime={getTotalTime()} currentRound={currentRound} totalRounds={settings.rounds} />
                     {(phase === TimerPhase.WORK || phase === TimerPhase.REST || phase === TimerPhase.LONG_REST || phase === TimerPhase.PREPARE) && <ExerciseDisplay exercise={currentExercise} phase={phase}/>}
                </main>
                <footer className="w-full mt-8">
                    <Controls
                        isActive={isActive}
                        phase={phase}
                        areAlertsMuted={areAlertsMuted}
                        onStartPause={handleStartPause}
                        onReset={resetTimer}
                        onSettings={() => setIsSettingsOpen(true)}
                        onSoundSettings={() => setIsSoundSettingsOpen(true)}
                        onToggleMute={() => setAreAlertsMuted(prev => !prev)}
                        onPlaylist={() => setIsWorkoutModalOpen(true)}
                        onHistory={() => setIsHistoryOpen(true)}
                        onMusic={openMusicModal}
                    />
                </footer>
            </div>
            {isSettingsOpen && <SettingsModal currentSettings={settings} onSave={(s) => {setSettings(s); resetTimer(); setIsSettingsOpen(false);}} onClose={() => setIsSettingsOpen(false)} />}
            {isSoundSettingsOpen && <SoundSettingsModal currentSettings={soundSettings} onSave={(s) => { setSoundSettings(s); setIsSoundSettingsOpen(false); }} onClose={() => setIsSoundSettingsOpen(false)} />}
            {isHistoryOpen && <HistoryModal history={workoutHistory} onClear={() => setWorkoutHistory([])} onClose={() => setIsHistoryOpen(false)} />}
            {isWorkoutModalOpen && <ExercisePlaylistModal currentUserPlaylist={customExercises} onSave={(e) => {setCustomExercises(e); resetTimer(); setIsWorkoutModalOpen(false);}} onClose={() => setIsWorkoutModalOpen(false)} />}
            {isMusicModalOpen && (
                <MusicModal
                    playlist={playlist}
                    currentTrack={currentTrackIndex !== null ? playlist[currentTrackIndex] : null}
                    isPlaying={isMusicPlaying}
                    volume={musicVolume}
                    playMode={playMode}
                    onAddTracks={setPlaylist}
                    onRemoveTrack={(trackId) => {
                        const removedIndex = playlist.findIndex(t => t.id === trackId);
                        const wasPlaying = isMusicPlaying;
                        setPlaylist(p => p.filter(t => t.id !== trackId));
                        if(playlist.length === 1) { // Last song removed
                           setIsMusicPlaying(false);
                           setCurrentTrackIndex(null);
                        } else if(currentTrackIndex === removedIndex) {
                            // If the removed track was the current one, move to the next.
                            const nextIndex = removedIndex % (playlist.length - 1);
                            setCurrentTrackIndex(nextIndex);
                             if (!wasPlaying) {
                                musicServiceRef.current.pause();
                            }
                        }
                    }}
                    onPlayPause={handleMusicPlayPause}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                    onVolumeChange={setMusicVolume}
                    onPlayModeChange={setPlayMode}
                    onClose={() => setIsMusicModalOpen(false)}
                />
            )}
        </div>
    );
};
export default App;