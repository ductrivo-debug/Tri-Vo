import { SoundType, SoundSetting } from '../types';

class SoundPlayer {
    private audioContext: AudioContext | null = null;
    private isInitialized: boolean = false;

    public init() {
        if (!this.isInitialized && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.isInitialized = true;
            } catch (e) {
                console.error("Web Audio API is not supported in this browser", e);
            }
        }
    }

    private playTone(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
        }
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const maxGain = 0.8; // Giới hạn để tránh rè tiếng ở mức âm lượng cao nhất
        gainNode.gain.setValueAtTime(volume * maxGain, this.audioContext.currentTime);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    public playSound(setting: SoundSetting) {
        if (!this.isInitialized) this.init();
        if (!this.audioContext) return;
        
        switch (setting.type) {
            case SoundType.BELL:
                this.playTone(880, 0.2, setting.volume, 'triangle');
                setTimeout(() => this.playTone(880, 0.2, setting.volume, 'triangle'), 150);
                break;
            case SoundType.GONG:
                this.playTone(440, 0.8, setting.volume, 'square');
                break;
            case SoundType.BEEP:
                this.playTone(1200, 0.15, setting.volume, 'sine');
                break;
            case SoundType.SYNTH:
                this.playTone(660, 0.5, setting.volume, 'sawtooth');
                break;
            case SoundType.ALARM: // Piercing, alternating sound
                this.playTone(2000, 0.15, setting.volume, 'sawtooth');
                setTimeout(() => this.playTone(2500, 0.15, setting.volume, 'sawtooth'), 150);
                break;
            case SoundType.BUZZER: // Annoying, harsh buzz
                this.playTone(80, 0.5, setting.volume, 'square');
                break;
            case SoundType.WHISTLE: // A referee whistle sound
                this.playTone(3000, 0.5, setting.volume, 'sine');
                break;
            case SoundType.AIR_HORN: // Loud, multi-tone horn
                this.playTone(300, 0.8, setting.volume, 'sawtooth');
                this.playTone(378, 0.8, setting.volume, 'sawtooth'); // Dissonant frequency
                break;
        }
    }
    
    public stop() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                this.isInitialized = false;
                this.audioContext = null;
            });
        }
    }
}

const SoundService = new SoundPlayer();
export default SoundService;