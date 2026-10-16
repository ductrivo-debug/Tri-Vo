import { usePersonalState } from './contexts/PersonalData';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import ExerciseDisplay from './components/ExerciseDisplay';
import SettingsModal from './components/SettingsModal';
import SoundSettingsModal from './components/SoundSettingsModal';
import HistoryModal from './components/HistoryModal';
import ExercisePlaylistModal from './components/ExercisePlaylistModal';
import WorkoutPlansModal from './components/WorkoutPlansModal';
import MusicModal from './components/MusicModal';
import { useLanguage } from './contexts/LanguageContext';
import { EXERCISES as defaultExercises } from './constants';
import SoundService from './services/SoundService';
import MusicService from './services/MusicService';
import {
    WorkoutSettings,
    TimerPhase,
    Exercise,
    WorkoutSession,
    SoundSettings,
    SoundType,
    Track,
    WorkoutPlan,
} from './types';
import { translations } from './translations';

const usePersistentState = usePersonalState;

const App: React.FC = () => {
    const { t, locale, setLocale } = useLanguage();
    
    // ======== STATE MANAGEMENT ========
    const [settings, setSettings] = usePersistentState<WorkoutSettings>('workoutSettings', {
        rounds: 12,
        workTime: 180,
        restTime: 60,
        longRestTime: 120,
        longRestFrequency: 4,
    });
    
    const [soundSettings, setSoundSettings] = usePersistentState<SoundSettings>('soundSettings', {
        start: { type: SoundType.BELL, volume: 0.5 },
        end: { type: SoundType.BELL, volume: 0.5 },
        warning: { type: SoundType.BEEP, volume: 0.3 },
    });

    const [allExercises, setAllExercises] = usePersistentState<Exercise[]>('allExercises', defaultExercises);
    const [playlist, setPlaylist] = usePersistentState<Exercise[]>('playlist', defaultExercises.slice(0, 5));
    const [history, setHistory] = usePersistentState<WorkoutSession[]>('workoutHistory', []);
    const [plans, setPlans] = usePersistentState<WorkoutPlan[]>('workoutPlans', []);
    
    // Timer state
    const [phase, setPhase] = useState<TimerPhase>(TimerPhase.PREPARE);
    const [timeLeft, setTimeLeft] = useState(10);
    const [currentRound, setCurrentRound] = useState(1);
    const [isActive, setIsActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    
    // Modal visibility
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [isPlansOpen, setIsPlansOpen] = useState(false);
    const [isMusicOpen, setIsMusicOpen] = useState(false);
    
    const intervalRef = useRef<number | null>(null);
    const musicServiceRef = useRef<MusicService | null>(null);
    const wakeLockSentinelRef = useRef<any>(null); // For Screen Wake Lock API

    const currentExercise = playlist && playlist.length > 0 ? playlist[ (currentRound - 1) % playlist.length ] : null;
    const nextExercise = playlist && playlist.length > 0 ? playlist[ currentRound % playlist.length ] : null;


    // ======== EFFECTS & LOGIC ========
    
    // Screen Wake Lock logic
    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
                wakeLockSentinelRef.current.addEventListener('release', () => {
                    // Sentinel is automatically released when tab is not visible.
                    // No need to clear ref here, it will be re-acquired on visibility change.
                     console.log('Screen Wake Lock was released.');
                });
                console.log('Screen Wake Lock is active.');
            } catch (err: any) {
                console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockSentinelRef.current) {
            await wakeLockSentinelRef.current.release();
            wakeLockSentinelRef.current = null;
        }
    }, []);

    const resetTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsActive(false);
        setPhase(TimerPhase.PREPARE);
        setTimeLeft(10);
        setCurrentRound(1);
        setSessionStartTime(null);
        releaseWakeLock();
    }, [releaseWakeLock]);

    const langCode = locale === 'vi' ? 'vi-VN' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : locale === 'zh' ? 'zh-CN' : 'en-US';

    // Timer countdown logic
    useEffect(() => {
        if (!isActive) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        
        intervalRef.current = window.setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    // Handle visibility change for timer drift correction and wake lock re-acquisition
    useEffect(() => {
        const handleVisibilityChange = () => {
             if (document.visibilityState === 'visible' && isActive && sessionStartTime) {
                // Re-acquire wake lock if it was released by the browser
                requestWakeLock();
                
                // Correct timer drift by calculating state based on total elapsed time
                const totalElapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

                let time = 0;
                let round = 1;
                
                // Prepare phase
                time += 10;
                if (totalElapsedSeconds < time) {
                    setPhase(TimerPhase.PREPARE);
                    setCurrentRound(1);
                    setTimeLeft(time - totalElapsedSeconds);
                    return;
                }
                
                // Rounds
                while (round <= settings.rounds) {
                    // Work phase
                    const workDuration = playlist?.length > 0 ? (playlist[(round - 1) % playlist.length]?.duration ?? settings.workTime) : settings.workTime;
                    time += workDuration;
                    if (totalElapsedSeconds < time) {
                        setPhase(TimerPhase.WORK);
                        setCurrentRound(round);
                        setTimeLeft(time - totalElapsedSeconds);
                        return;
                    }
                    if (round === settings.rounds) break;

                    // Rest phase
                    const isLongRest = settings.longRestFrequency > 0 && round % settings.longRestFrequency === 0;
                    const restDuration = isLongRest ? settings.longRestTime : settings.restTime;
                    time += restDuration;
                    if (totalElapsedSeconds < time) {
                        setPhase(isLongRest ? TimerPhase.LONG_REST : TimerPhase.REST);
                        setCurrentRound(round);
                        setTimeLeft(time - totalElapsedSeconds);
                        return;
                    }
                    round++;
                }

                // If loop finishes, workout is done
                setPhase(TimerPhase.FINISHED);
                setCurrentRound(settings.rounds);
                setTimeLeft(0);
                setIsActive(false);
             }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, sessionStartTime, settings, playlist, requestWakeLock]);


    // Phase transition logic
    useEffect(() => {
        // Warning sounds and countdown
        const isWarningPhase = phase === TimerPhase.WORK || phase === TimerPhase.REST || phase === TimerPhase.LONG_REST || phase === TimerPhase.PREPARE;
        if (isWarningPhase && timeLeft <= 10 && timeLeft > 0) {
            SoundService.speak(String(timeLeft), langCode, soundSettings.warning.volume);
        }
        if (timeLeft === 10 && (phase === TimerPhase.WORK || phase === TimerPhase.PREPARE)) {
            musicServiceRef.current?.duckVolume(); // Duck music volume before a sound
        }

        if (timeLeft > 0) return;

        musicServiceRef.current?.restoreVolume();

        switch (phase) {
            case TimerPhase.PREPARE:
                SoundService.playSound(soundSettings.start);
                setPhase(TimerPhase.WORK);
                setTimeLeft(currentExercise?.duration ?? settings.workTime);
                break;
            case TimerPhase.WORK:
                SoundService.playSound(soundSettings.end);
                if (currentRound >= settings.rounds) {
                    setPhase(TimerPhase.FINISHED);
                    setIsActive(false);
                    releaseWakeLock();
                    // Save session to history
                    if (sessionStartTime) {
                        const newSession: WorkoutSession = {
                            date: new Date().toISOString(),
                            duration: Math.round((Date.now() - sessionStartTime) / 1000),
                            roundsCompleted: currentRound,
                            settings: settings,
                        };
                        setHistory(prev => [newSession, ...prev]);
                    }
                } else if (currentRound > 0 && settings.longRestFrequency > 0 && currentRound % settings.longRestFrequency === 0) {
                    setPhase(TimerPhase.LONG_REST);
                    setTimeLeft(settings.longRestTime);
                } else {
                    setPhase(TimerPhase.REST);
                    setTimeLeft(settings.restTime);
                }
                break;
            case TimerPhase.REST:
            case TimerPhase.LONG_REST:
                SoundService.playSound(soundSettings.start);
                const nextRound = currentRound + 1;
                setCurrentRound(nextRound);
                const nextExerciseForWork = playlist && playlist.length > 0 ? playlist[(nextRound - 1) % playlist.length] : null;
                setPhase(TimerPhase.WORK);
                setTimeLeft(nextExerciseForWork?.duration ?? settings.workTime);
                break;
            case TimerPhase.FINISHED:
                break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, phase, isActive, currentRound, settings, soundSettings, sessionStartTime, setHistory, playlist, releaseWakeLock]);

    // ======== HANDLERS ========
    const handleStart = () => {
        if (phase === TimerPhase.FINISHED) resetTimer();
        setIsActive(true);
        requestWakeLock();
        if (!sessionStartTime) {
            setSessionStartTime(Date.now());
        }
    };

    const handlePause = () => {
        setIsActive(false);
        releaseWakeLock();
    };
    
    const handleAddOrUpdateExercise = (exerciseData: Omit<Exercise, 'id'> | Exercise) => {
        if ('id' in exerciseData) {
            // Editing existing exercise
            setAllExercises(prev => prev.map(ex => ex.id === exerciseData.id ? exerciseData : ex));
            setPlaylist(prev => prev.map(ex => ex.id === exerciseData.id ? exerciseData : ex));
        } else {
            // Adding new exercise
            const newExercise: Exercise = {
                id: new Date().toISOString() + Math.random(),
                ...exerciseData
            };
            setAllExercises(prev => [...prev, newExercise]);
        }
    };
    
    const handleLoadPlan = (plan: WorkoutPlan) => {
        const planExercises = allExercises.filter(ex => plan.exerciseIds.includes(ex.id));
        setPlaylist(planExercises);
        setIsPlansOpen(false);
    };

    const totalTime = (() => {
        switch(phase){
            case TimerPhase.PREPARE: return 10;
            case TimerPhase.WORK: return currentExercise?.duration ?? settings.workTime;
            case TimerPhase.REST: return settings.restTime;
            case TimerPhase.LONG_REST: return settings.longRestTime;
            default: return 0;
        }
    })();

    // ======== RENDER ========
    return (
        <main className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-between p-4 font-sans">
            <header className="w-full flex flex-col items-center text-center">
                <h1 className="text-6xl font-extrabold leading-none tracking-tighter">
                    <span className="text-white block">SILVERBACK</span>
                    <span className="text-red-500 block -mt-2">MMA</span>
                </h1>
                <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as keyof typeof translations)}
                    className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 mt-2 focus:ring-1 focus:ring-blue-500"
                    aria-label="Select language"
                >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Español</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                </select>
            </header>
            
            <div className="w-full flex flex-col items-center">
                 <TimerDisplay 
                    phase={phase}
                    timeLeft={timeLeft}
                    totalTime={totalTime}
                    currentRound={currentRound}
                    totalRounds={settings.rounds}
                />
                {playlist && playlist.length > 0 && (
                    <ExerciseDisplay 
                        exercise={(phase === TimerPhase.WORK || phase === TimerPhase.PREPARE || phase === TimerPhase.FINISHED) ? currentExercise : nextExercise}
                        phase={phase}
                    />
                )}
            </div>

            <footer className="w-full">
                <Controls
                    isActive={isActive}
                    onStart={handleStart}
                    onPause={handlePause}
                    onReset={resetTimer}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenHistory={() => setIsHistoryOpen(true)}
                    onOpenPlaylist={() => setIsPlaylistOpen(true)}
                    onOpenPlans={() => setIsPlansOpen(true)}
                    onOpenMusic={() => setIsMusicOpen(true)}
                />
            </footer>

            {/* Modals */}
            {isSettingsOpen && (
                <SettingsModal
                    currentSettings={settings}
                    onSave={(newSettings) => {
                        setSettings(newSettings);
                        setIsSettingsOpen(false);
                        resetTimer();
                    }}
                    onClose={() => setIsSettingsOpen(false)}
                    onOpenSounds={() => setIsSoundSettingsOpen(true)}
                />
            )}
             {isSoundSettingsOpen && (
                <SoundSettingsModal
                    currentSettings={soundSettings}
                    onSave={(newSettings) => {
                        setSoundSettings(newSettings);
                        setIsSoundSettingsOpen(false);
                    }}
                    onClose={() => setIsSoundSettingsOpen(false)}
                />
            )}
             {isHistoryOpen && (
                <HistoryModal
                    history={history}
                    onClose={() => setIsHistoryOpen(false)}
                    onClear={() => setHistory([])}
                />
            )}
            {isPlaylistOpen && (
                <ExercisePlaylistModal
                    playlist={playlist}
                    allExercises={allExercises}
                    onClose={() => setIsPlaylistOpen(false)}
                    onUpdatePlaylist={setPlaylist}
                    onAddOrUpdateExercise={handleAddOrUpdateExercise}
                    onDeleteExercise={(id) => setAllExercises(allExercises.filter(ex => ex.id !== id))}
                />
            )}
            {isPlansOpen && (
                <WorkoutPlansModal
                    plans={plans}
                    allExercises={allExercises}
                    onClose={() => setIsPlansOpen(false)}
                    onLoadPlan={handleLoadPlan}
                    onSavePlans={setPlans}
                />
            )}
            <MusicModal isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} service={musicServiceRef} />
        </main>
    );
};

export default App;

