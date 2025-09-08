import type { AudioService } from "../type/audio-service";
import type { PlayOptions } from "../type/play-options";
import type { SoundConfig } from "../type/sound-config";

export class WebAudioService implements AudioService {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private activeSounds: Map<string, HTMLAudioElement> = new Map();

    async loadSound(key: string, path: string): Promise<void> {
        if (this.sounds.has(key)) {
            return;
        }

        const audio = new Audio(path);

        return new Promise((resolve, reject) => {
            audio.addEventListener("canplaythrough", () => {
                this.sounds.set(key, audio);
                resolve();
            });

            audio.addEventListener("error", () => {
                reject(new Error(`Failed to load sound: ${key}`));
            });

            audio.load();
        });
    }

    async preloadSounds(sounds: SoundConfig[]): Promise<void> {
        const loadPromises = sounds.map((sound) =>
            this.loadSound(sound.key, sound.path)
        );
        await Promise.all(loadPromises);
    }

    playSound(key: string, options?: PlayOptions): void {
        const sound = this.sounds.get(key);
        if (!sound) {
            console.warn(`Sound not found: ${key}`);
            return;
        }

        if (options?.interrupt && this.activeSounds.has(key)) {
            this.stopSound(key);
        }

        const audio = sound.cloneNode() as HTMLAudioElement;
        audio.currentTime = 0;
        audio.volume = options?.volume ?? 1;
        audio.loop = options?.loop ?? false;

        if (options?.onEnd) {
            audio.onended = options.onEnd;
        }

        audio.play().catch((error) => {
            console.error(`Failed to play sound ${key}:`, error);
        });

        this.activeSounds.set(key, audio);
    }

    stopSound(key: string): void {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            this.activeSounds.delete(key);
        }
    }

    pauseSound(key: string): void {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.pause();
        }
    }

    resumeSound(key: string): void {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.play().catch((error) => {
                console.error(`Failed to resume sound ${key}:`, error);
            });
        }
    }

    setVolume(key: string, volume: number): void {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }

    setSoundPitch(key: string, pitch: number): void {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.playbackRate = Math.max(0.1, Math.min(4, pitch));
        }
    }
}
