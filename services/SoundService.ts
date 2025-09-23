import { SoundSetting, SoundType } from '../types';

class SoundService {
    private static audioContext: AudioContext | null = null;

    private static init() {
        if (!this.audioContext && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported.", e);
            }
        }
    }

    private static async playBeep(volume: number) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = volume;
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    private static async playBell(volume: number) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 1046.50; // C6 note
        oscillator.type = 'sine';
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    private static async playCustomSound(dataUrl: string, volume: number) {
        if (!this.audioContext || !dataUrl) return;
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        try {
            const response = await fetch(dataUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);

        } catch (error) {
            console.error('Error playing custom sound:', error);
        }
    }

    public static playSound(setting: SoundSetting) {
        this.init();
        if (!this.audioContext) return;

        switch (setting.type) {
            case SoundType.BEEP:
                this.playBeep(setting.volume);
                break;
            case SoundType.BELL:
                this.playBell(setting.volume);
                break;
            case SoundType.CUSTOM:
                if (setting.customSound) {
                    this.playCustomSound(setting.customSound, setting.volume);
                }
                break;
            case SoundType.NONE:
            default:
                // Do nothing
                break;
        }
    }
}

export default SoundService;