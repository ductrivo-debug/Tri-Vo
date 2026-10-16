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
import TrainingLibraryModal from './components/TrainingLibraryModal';
import { mergeExercises, resolvePlan, restForRound } from './services/WorkoutLibrary';
import { useLanguage } from './contexts/LanguageContext';
import { EXERCISES as defaultExercises } from './constants';
import SoundService from './services/SoundService';
import { TimerAudioController, cueLabel, clearSoundSettings } from './services/TimerAudio';
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
    
    const [storedSoundSettings, setSoundSettings] = usePersistentState<SoundSettings>('soundSettings', {
        start: { type: SoundType.BELL, volume: 0.95 },
        end: { type: SoundType.BELL, volume: 0.95 },
        warning: { type: SoundType.BEEP, volume: 0.8 },
        voiceVolume: 1,
        profileVersion: 2,
    });

    const soundSettings = clearSoundSettings(storedSoundSettings);

    const [storedExercises, setAllExercises] = usePersistentState<Exercise[]>('allExercises', defaultExercises);
    const allExercises = mergeExercises(storedExercises);
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
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    
    const modalOpen = isSettingsOpen || isSoundSettingsOpen || isHistoryOpen || isPlaylistOpen || isPlansOpen || isMusicOpen || isLibraryOpen;
    useEffect(() => {
        if (!modalOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [modalOpen]);

    const timerAudio = useRef(new TimerAudioController());
    const audioRun = useRef(0);

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
        audioRun.current++;
        SoundService.cancel();
        timerAudio.current.reset();
        musicServiceRef.current?.restoreVolume();
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
                    const rest = restForRound(playlist?.length ? playlist[(round - 1) % playlist.length] : null, settings, round);
                    const isLongRest = rest.long;
                    const restDuration = rest.seconds;
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
        if (!isActive || timeLeft > 0) return;

        switch (phase) {
            case TimerPhase.PREPARE:
                setPhase(TimerPhase.WORK);
                setTimeLeft(currentExercise?.duration ?? settings.workTime);
                break;
            case TimerPhase.WORK:
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
                } else {
                    const rest = restForRound(currentExercise, settings, currentRound);
                    if (rest.seconds === 0) {
                        setCurrentRound(currentRound + 1);
                        setPhase(TimerPhase.WORK);
                        setTimeLeft(nextExercise?.duration ?? settings.workTime);
                    } else {
                        setPhase(rest.long ? TimerPhase.LONG_REST : TimerPhase.REST);
                        setTimeLeft(rest.seconds);
                    }
                }
                break;
            case TimerPhase.REST:
            case TimerPhase.LONG_REST:
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

    // Audio runs once per phase/tick and never while paused or before Start.
    useEffect(() => {
        const cue = timerAudio.current.next(phase, currentRound, timeLeft, isActive);
        if (!cue || (cue.kind === 'countdown' && SoundService.isBusy())) return;
        const setting = cue.kind === 'work' ? soundSettings.start
            : (cue.kind === 'rest' || cue.kind === 'longRest' || cue.kind === 'finish') ? soundSettings.end
            : soundSettings.warning;
        const run = ++audioRun.current;
        musicServiceRef.current?.duckVolume();
        void SoundService.cue(cue.kind, setting, cueLabel(cue, locale), langCode, soundSettings.voiceVolume ?? 1)
            .finally(() => { if (run === audioRun.current) musicServiceRef.current?.restoreVolume(); });
    }, [phase, currentRound, timeLeft, isActive, locale, langCode, soundSettings]);

    useEffect(() => () => {
        audioRun.current++;
        SoundService.cancel();
        musicServiceRef.current?.restoreVolume();
        void releaseWakeLock();
    }, [releaseWakeLock]);

    // ======== HANDLERS ========
    const handleStart = () => {
        void SoundService.unlock();
        if (phase === TimerPhase.FINISHED) { resetTimer(); setSessionStartTime(Date.now()); }
        setIsActive(true);
        requestWakeLock();
        if (!sessionStartTime) {
            setSessionStartTime(Date.now());
        }
    };

    const handlePause = () => {
        audioRun.current++;
        SoundService.cancel();
        musicServiceRef.current?.restoreVolume();
        setIsActive(false);
        releaseWakeLock();
    };
    
    const handleAddOrUpdateExercise = (exerciseData: Omit<Exercise, 'id'> | Exercise) => {
        if ('id' in exerciseData) {
            // Editing existing exercise
            setAllExercises(prev => [...prev.filter(ex => ex.id !== exerciseData.id), exerciseData]);
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
        try {
            const planExercises = resolvePlan(plan, allExercises);
            if (!planExercises.length) { alert('Giáo án chưa có bài tập.'); return; }
            if (isActive && !window.confirm('Dừng buổi đang tập và nạp giáo án mới?')) return;
            resetTimer();
            setPlaylist(planExercises);
            setSettings({...settings, ...plan.settings, rounds: planExercises.length});
            setIsPlansOpen(false);
            setIsLibraryOpen(false);
        } catch (error) { alert((error as Error).message); }
    };

    const totalTime = (() => {
        switch(phase){
            case TimerPhase.PREPARE: return 10;
            case TimerPhase.WORK: return currentExercise?.duration ?? settings.workTime;
            case TimerPhase.REST:
            case TimerPhase.LONG_REST: return restForRound(currentExercise, settings, currentRound).seconds;
            default: return 0;
        }
    })();

    // ======== RENDER ========
    return (
        <main className="phone-app text-white font-sans">
            <header className="phone-header">
                <h1 className="phone-brand">RIO <span>Timer</span><small>TRAIN AT YOUR PACE</small></h1>
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
            
            <div className="phone-session">
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
                    onOpenLibrary={() => setIsLibraryOpen(true)}
                />
            </footer>

            {/* Modals */}
            {isLibraryOpen && <TrainingLibraryModal
                onClose={() => setIsLibraryOpen(false)} onLoad={handleLoadPlan} savedPlans={plans}
                onSave={plan => setPlans(prev => prev.some(p=>p.id===plan.id) ? prev : [...prev, plan])}
                onAdd={exercise => {
                    if (isActive) { alert('Tạm dừng buổi tập trước khi thêm bài.'); return false; }
                    resetTimer();
                    setPlaylist(prev => [...prev, exercise]);
                    setSettings(prev => ({...prev, rounds:playlist.length+1}));
                    return true;
                }} />}
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
                    onUpdatePlaylist={next => {
                        if (isActive) { alert('Tạm dừng buổi tập trước khi đổi danh sách.'); return; }
                        resetTimer(); setPlaylist(next);
                        setSettings(prev=>({...prev,rounds:Math.max(1,next.length)}));
                    }}
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

