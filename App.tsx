import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import ExerciseDisplay from './components/ExerciseDisplay';
import SoundSettingsModal from './components/SoundSettingsModal';
import ExercisePlaylistModal from './components/ExercisePlaylistModal';
import MusicModal from './components/MusicModal';
import WorkoutPlansModal from './components/WorkoutPlansModal';
import SoundService from './services/SoundService';
import MusicService from './services/MusicService';
import { useLanguage } from './contexts/LanguageContext';
import { 
    WorkoutSettings, 
    TimerPhase, 
    WorkoutSession, 
    SoundSettings, 
    SoundType, 
    Exercise,
    Track,
    WorkoutPlan
} from './types';

// Default values
const DEFAULT_WORKOUT_SETTINGS: WorkoutSettings = {
    rounds: 10,
    workTime: 180,
    restTime: 60,
    longRestTime: 120,
    longRestFrequency: 5,
};

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
    start: { type: SoundType.BELL, volume: 0.8 },
    end: { type: SoundType.BEEP, volume: 0.8 },
    warning: { type: SoundType.BEEP, volume: 0.5 },
};

const PREPARE_TIME = 10;

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}


const App: React.FC = () => {
    const { t, locale, setLocale } = useLanguage();
    
    // State
    const [settings, setSettings] = useLocalStorage<WorkoutSettings>('workoutSettings', DEFAULT_WORKOUT_SETTINGS);
    const [soundSettings, setSoundSettings] = useLocalStorage<SoundSettings>('soundSettings', DEFAULT_SOUND_SETTINGS);
    const [history, setHistory] = useLocalStorage<WorkoutSession[]>('workoutHistory', []);
    const [allExercises, setAllExercises] = useLocalStorage<Exercise[]>('allExercises', []);
    const [exercisePlaylist, setExercisePlaylist] = useLocalStorage<Exercise[]>('exercisePlaylist', []);
    const [workoutPlans, setWorkoutPlans] = useLocalStorage<WorkoutPlan[]>('workoutPlans', []);
    const [musicPlaylist, setMusicPlaylist] = useLocalStorage<Track[]>('musicPlaylist', []);
    const [musicVolume, setMusicVolume] = useLocalStorage<number>('musicVolume', 0.5);
    const [musicPlayMode, setMusicPlayMode] = useLocalStorage<'SEQUENTIAL' | 'SHUFFLE'>('musicPlayMode', 'SEQUENTIAL');

    const [phase, setPhase] = useState<TimerPhase>(TimerPhase.PREPARE);
    const [timeLeft, setTimeLeft] = useState(PREPARE_TIME);
    const [totalTime, setTotalTime] = useState(PREPARE_TIME);
    
    // Overall workout state
    const [isWorkoutActive, setIsWorkoutActive] = useState(false); // replaces isActive
    const [currentOverallRound, setCurrentOverallRound] = useState(1);
    const [totalWorkoutRounds, setTotalWorkoutRounds] = useState(settings.rounds);

    // Playlist specific state
    const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
    const [currentExerciseRound, setCurrentExerciseRound] = useState(1);


    const [currentMusicTrack, setCurrentMusicTrack] = useState<Track | null>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    // Modals visibility
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSoundsOpen, setIsSoundsOpen] = useState(false);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [isMusicOpen, setIsMusicOpen] = useState(false);
    const [isPlansOpen, setIsPlansOpen] = useState(false);

    // Refs
    // FIX: Use `number` for timer ID in browser environments instead of `NodeJS.Timeout`.
    const timerRef = useRef<number | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);
    const musicServiceRef = useRef<MusicService | null>(null);

    const handleGoToNextTrack = useCallback(() => {
        if (!musicServiceRef.current || musicPlaylist.length === 0) return;
    
        const currentIdx = currentMusicTrack ? musicPlaylist.findIndex(t => t.id === currentMusicTrack.id) : -1;
        let nextIdx = -1;
    
        if (musicPlayMode === 'SHUFFLE') {
            if (musicPlaylist.length > 1) {
                do {
                    nextIdx = Math.floor(Math.random() * musicPlaylist.length);
                } while (nextIdx === currentIdx);
            } else {
                nextIdx = 0;
            }
        } else { // SEQUENTIAL
            nextIdx = (currentIdx + 1) % musicPlaylist.length;
        }
    
        if (nextIdx !== -1) {
            const nextTrack = musicPlaylist[nextIdx];
            setCurrentMusicTrack(nextTrack);
            musicServiceRef.current.play(nextTrack.file);
        } else {
            setIsMusicPlaying(false);
            setCurrentMusicTrack(null);
        }
    }, [musicPlaylist, currentMusicTrack, musicPlayMode]);

    useEffect(() => {
        musicServiceRef.current = new MusicService(handleGoToNextTrack);
        musicServiceRef.current.init();
    }, [handleGoToNextTrack]);

    useEffect(() => {
        if (musicServiceRef.current) {
            musicServiceRef.current.setVolume(musicVolume);
        }
    }, [musicVolume]);
    
    const isUsingPlaylist = exercisePlaylist.length > 0;
    
    // Data migration for old exercises without rounds/duration
    useEffect(() => {
        const needsMigration = allExercises.some(ex => ex.rounds === undefined || ex.duration === undefined);
        if (needsMigration) {
            const migrated = allExercises.map(ex => ({
                ...ex,
                rounds: ex.rounds || 1,
                duration: ex.duration || 180,
            }));
            setAllExercises(migrated);
        }
    // This should run only once on startup
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (isUsingPlaylist) {
            const totalRounds = exercisePlaylist.reduce((sum, ex) => sum + ex.rounds, 0);
            setTotalWorkoutRounds(totalRounds);
        } else {
            setTotalWorkoutRounds(settings.rounds);
        }
    }, [exercisePlaylist, settings.rounds, isUsingPlaylist]);


    // Timer logic
    useEffect(() => {
        if (isWorkoutActive) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isWorkoutActive]);

    const handleFinish = useCallback(() => {
        setIsWorkoutActive(false);
        setPhase(TimerPhase.FINISHED);
        
        if (sessionStartTimeRef.current) {
            const sessionDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
            const newSession: WorkoutSession = {
                date: new Date().toISOString(),
                duration: sessionDuration,
                roundsCompleted: totalWorkoutRounds,
                settings: settings,
            };
            setHistory(prev => [newSession, ...prev]);
            sessionStartTimeRef.current = null;
        }
        if (isMusicPlaying) musicServiceRef.current?.restoreVolume();
    }, [setHistory, settings, totalWorkoutRounds, isMusicPlaying]);

    // Phase transition logic
    useEffect(() => {
        if (timeLeft === 3 && (phase === TimerPhase.WORK || phase === TimerPhase.REST || phase === TimerPhase.LONG_REST)) {
            SoundService.playSound(soundSettings.warning);
            if (isMusicPlaying) musicServiceRef.current?.duckVolume();
        }
        if (timeLeft === 1 && (phase === TimerPhase.WORK || phase === TimerPhase.REST || phase === TimerPhase.LONG_REST)) {
            if (isMusicPlaying) musicServiceRef.current?.restoreVolume();
        }


        if (timeLeft > 0) return;

        // Playlist logic
        if (isUsingPlaylist) {
            const currentExercise = exercisePlaylist[currentPlaylistIndex];
            
            switch (phase) {
                case TimerPhase.PREPARE:
                    setPhase(TimerPhase.WORK);
                    setTimeLeft(currentExercise.duration);
                    setTotalTime(currentExercise.duration);
                    SoundService.playSound(soundSettings.start);
                    break;
                
                case TimerPhase.WORK:
                    SoundService.playSound(soundSettings.end);
                    if (currentExerciseRound < currentExercise.rounds) {
                        // Same exercise, next round
                        setCurrentExerciseRound(r => r + 1);
                        setCurrentOverallRound(r => r + 1);
                        setPhase(TimerPhase.REST);
                        setTimeLeft(settings.restTime);
                        setTotalTime(settings.restTime);
                    } else { // Finished all rounds for this exercise
                         if (currentPlaylistIndex < exercisePlaylist.length - 1) {
                            // Move to next exercise
                            setCurrentPlaylistIndex(i => i + 1);
                            setCurrentExerciseRound(1);
                            setCurrentOverallRound(r => r + 1);
                            setPhase(TimerPhase.REST);
                            setTimeLeft(settings.restTime);
                            setTotalTime(settings.restTime);
                         } else {
                             handleFinish();
                         }
                    }
                    break;

                case TimerPhase.REST:
                     setPhase(TimerPhase.WORK);
                     setTimeLeft(currentExercise.duration);
                     setTotalTime(currentExercise.duration);
                     SoundService.playSound(soundSettings.start);
                    break;
                
                default:
                    // LONG_REST isn't used in playlist mode, FINISHED handled by handleFinish
                    break;
            }
        } 
        // Standard Timer Logic
        else {
            switch(phase) {
                case TimerPhase.PREPARE:
                    setPhase(TimerPhase.WORK);
                    setTimeLeft(settings.workTime);
                    setTotalTime(settings.workTime);
                    SoundService.playSound(soundSettings.start);
                    break;
                case TimerPhase.WORK:
                    SoundService.playSound(soundSettings.end);
                    if (currentOverallRound % settings.longRestFrequency === 0 && currentOverallRound < settings.rounds) {
                        setPhase(TimerPhase.LONG_REST);
                        setTimeLeft(settings.longRestTime);
                        setTotalTime(settings.longRestTime);
                    } else if (currentOverallRound < settings.rounds) {
                        setPhase(TimerPhase.REST);
                        setTimeLeft(settings.restTime);
                        setTotalTime(settings.restTime);
                    } else {
                        handleFinish();
                    }
                    break;
                case TimerPhase.REST:
                case TimerPhase.LONG_REST:
                    setCurrentOverallRound(prev => prev + 1);
                    setPhase(TimerPhase.WORK);
                    setTimeLeft(settings.workTime);
                    setTotalTime(settings.workTime);
                    SoundService.playSound(soundSettings.start);
                    break;
                default:
                    break;
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // Handlers
    const handleStart = () => {
        if(phase === TimerPhase.FINISHED) {
            handleReset();
        }
        setIsWorkoutActive(true);
        if(sessionStartTimeRef.current === null) {
            sessionStartTimeRef.current = Date.now();
        }
    };
    const handlePause = () => setIsWorkoutActive(false);
    const handleReset = () => {
        setIsWorkoutActive(false);
        setPhase(TimerPhase.PREPARE);
        setCurrentOverallRound(1);
        setCurrentPlaylistIndex(0);
        setCurrentExerciseRound(1);
        setTimeLeft(PREPARE_TIME);
        setTotalTime(PREPARE_TIME);
        sessionStartTimeRef.current = null;
        if (isMusicPlaying) musicServiceRef.current?.restoreVolume();
    };


    const handleSaveSettings = (newSettings: WorkoutSettings) => {
        setSettings(newSettings);
        setIsSettingsOpen(false);
        handleReset();
    };

    const handleSaveSoundSettings = (newSettings: SoundSettings) => {
        setSoundSettings(newSettings);
        setIsSoundsOpen(false);
    }
    
    const getDisplayedExercise = () => {
        if (!isUsingPlaylist) return null;

        const currentIndex = currentPlaylistIndex;
        const nextIndex = (currentPlaylistIndex + 1) % exercisePlaylist.length;

        if (phase === TimerPhase.PREPARE || phase === TimerPhase.WORK) {
            return exercisePlaylist[currentIndex];
        }
        if (phase === TimerPhase.REST || phase === TimerPhase.LONG_REST) {
            // If it's the last round of the last exercise, don't show "next"
            const currentEx = exercisePlaylist[currentIndex];
            if (currentIndex === exercisePlaylist.length - 1 && currentExerciseRound >= currentEx.rounds) {
                return null;
            }
            return exercisePlaylist[nextIndex];
        }
        return null;
    }
    
    const handleLoadPlan = (plan: WorkoutPlan) => {
        const planExercises = allExercises.filter(ex => plan.exerciseIds.includes(ex.id));
        setExercisePlaylist(planExercises);
        setIsPlansOpen(false);
        handleReset();
    }

    const handlePlayPauseMusic = () => {
        if (isMusicPlaying) {
            musicServiceRef.current?.pause();
            setIsMusicPlaying(false);
        } else {
            if (musicPlaylist.length > 0) {
                const trackToPlay = currentMusicTrack || musicPlaylist[0];
                 if (trackToPlay) {
                    setCurrentMusicTrack(trackToPlay);
                    musicServiceRef.current?.play(trackToPlay.file);
                    setIsMusicPlaying(true);
                }
            }
        }
    };
    
    const handleNextTrack = () => {
        handleGoToNextTrack();
        if(!isMusicPlaying) setIsMusicPlaying(true);
    };

    const handlePrevTrack = () => {
        if (!musicServiceRef.current || musicPlaylist.length === 0) return;
        const currentIdx = currentMusicTrack ? musicPlaylist.findIndex(t => t.id === currentMusicTrack.id) : -1;
        const prevIdx = (currentIdx - 1 + musicPlaylist.length) % musicPlaylist.length;
        const prevTrack = musicPlaylist[prevIdx];
        setCurrentMusicTrack(prevTrack);
        musicServiceRef.current.play(prevTrack.file);
        if(!isMusicPlaying) setIsMusicPlaying(true);
    };
    
    const languages: { code: string, name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'es', name: 'Español' },
        { code: 'ru', name: 'Русский' },
        { code: 'zh', name: '中文' },
    ];


    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-between p-4 font-sans">
             <header className="w-full flex items-center justify-center">
                <div>
                    <h1 className="text-6xl font-extrabold text-white tracking-tighter text-center">SILVERBACK</h1>
                    <h2 className="text-6xl font-extrabold text-red-500 tracking-tighter text-center -mt-4">MMA</h2>
                    <p className="text-slate-400 text-sm tracking-widest mt-1 text-center">{t('workoutTimer')}</p>
                </div>
            </header>

            <main className="flex flex-col items-center flex-grow justify-center w-full">
                <TimerDisplay
                    phase={phase}
                    timeLeft={timeLeft}
                    totalTime={totalTime}
                    currentRound={currentOverallRound}
                    totalRounds={totalWorkoutRounds}
                />
                
                <ExerciseDisplay exercise={getDisplayedExercise()} phase={phase} />

                <Controls
                    isActive={isWorkoutActive}
                    onStart={handleStart}
                    onPause={handlePause}
                    onReset={handleReset}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenHistory={() => setIsHistoryOpen(true)}
                    onOpenPlaylist={() => setIsPlaylistOpen(true)}
                    onOpenPlans={() => setIsPlansOpen(true)}
                    onOpenMusic={() => setIsMusicOpen(true)}
                />
            </main>
            
            <footer className="w-full flex justify-end mt-4">
                 <select 
                    onChange={(e) => setLocale(e.target.value as 'en' | 'vi' | 'es' | 'ru' | 'zh')} 
                    value={locale}
                    className="bg-slate-800 text-white text-xs rounded p-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select language"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </footer>


            {isSettingsOpen && (
                <SettingsModal
                    currentSettings={settings}
                    onSave={handleSaveSettings}
                    onClose={() => setIsSettingsOpen(false)}
                    onOpenSounds={() => setIsSoundsOpen(true)}
                    onOpenMusic={() => setIsMusicOpen(true)}
                    onOpenPlans={() => setIsPlansOpen(true)}
                />
            )}
            {isHistoryOpen && (
                <HistoryModal
                    history={history}
                    onClose={() => setIsHistoryOpen(false)}
                    onClear={() => setHistory([])}
                />
            )}
            {isSoundsOpen && (
                 <SoundSettingsModal
                    currentSettings={soundSettings}
                    onSave={handleSaveSoundSettings}
                    onClose={() => setIsSoundsOpen(false)}
                />
            )}
            {isPlaylistOpen && (
                <ExercisePlaylistModal
                    allExercises={allExercises}
                    // FIX: Pass the full exercise objects for the current playlist.
                    currentUserPlaylist={exercisePlaylist}
                    onSave={(newPlaylist, newAllExercises) => {
                        setExercisePlaylist(newPlaylist);
                        setAllExercises(newAllExercises)
                        setIsPlaylistOpen(false);
                    }}
                    onClose={() => setIsPlaylistOpen(false)}
                />
            )}
            {isPlansOpen && (
                <WorkoutPlansModal
                    plans={workoutPlans}
                    allExercises={allExercises}
                    onClose={() => setIsPlansOpen(false)}
                    onLoadPlan={handleLoadPlan}
                    onSavePlans={setWorkoutPlans}
                />
            )}
            {isMusicOpen && (
                <MusicModal
                    playlist={musicPlaylist}
                    currentTrack={currentMusicTrack}
                    isPlaying={isMusicPlaying}
                    volume={musicVolume}
                    playMode={musicPlayMode}
                    onAddTracks={(tracks) => setMusicPlaylist(tracks)}
                    onRemoveTrack={(id) => setMusicPlaylist(prev => prev.filter(t => t.id !== id))}
                    onPlayPause={handlePlayPauseMusic}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                    onVolumeChange={setMusicVolume}
                    onPlayModeChange={setMusicPlayMode}
                    onClose={() => setIsMusicOpen(false)}
                />
            )}
        </div>
    );
};

export default App;