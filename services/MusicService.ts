class MusicService {
    private audioContext: AudioContext | null = null;
    private sourceNode: AudioBufferSourceNode | null = null;
    private gainNode: GainNode | null = null;
    private isInitialized: boolean = false;
    private currentVolume: number = 0.5;
    private isPlaying: boolean = false;
    private onTrackEndCallback: () => void;

    constructor(onTrackEnd: () => void) {
        this.onTrackEndCallback = onTrackEnd;
    }

    public init() {
        if (!this.isInitialized && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                this.setVolume(this.currentVolume);
                this.isInitialized = true;
                // If context is suspended, try to resume it. This might be needed on some browsers.
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            } catch (e) {
                console.error("Web Audio API is not supported for music playback.", e);
            }
        }
    }
    
    private cleanupSourceNode() {
        if (this.sourceNode) {
            this.sourceNode.onended = null;
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
    }

    public async play(file: File) {
        if (!this.isInitialized) this.init();
        if (!this.audioContext || !this.gainNode) return;
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.cleanupSourceNode(); // Clean up previous source

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.sourceNode = this.audioContext.createBufferSource();
            this.sourceNode.buffer = audioBuffer;
            this.sourceNode.connect(this.gainNode);
            this.sourceNode.onended = () => {
                if (this.isPlaying) { // only trigger next if it was playing, not on manual stop
                    this.onTrackEndCallback();
                }
            };
            this.sourceNode.start(0);
            this.isPlaying = true;

        } catch (e) {
            console.error("Error decoding audio data", e);
            this.isPlaying = false;
        }
    }

    public pause() {
        // Set isPlaying to false *before* stopping the node.
        // This prevents the onended callback from incorrectly triggering the next track.
        this.isPlaying = false;
        if (this.sourceNode) {
            this.sourceNode.stop();
            this.cleanupSourceNode();
        }
    }

    public setVolume(volume: number) {
        this.currentVolume = volume;
        if (this.gainNode && this.audioContext) {
            this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
        }
    }
    
    public duckVolume() {
        if (this.gainNode && this.audioContext) {
            this.gainNode.gain.linearRampToValueAtTime(this.currentVolume * 0.2, this.audioContext.currentTime + 0.5);
        }
    }
    
    public restoreVolume() {
        if (this.gainNode && this.audioContext) {
            this.gainNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioContext.currentTime + 0.5);
        }
    }
}

export default MusicService;