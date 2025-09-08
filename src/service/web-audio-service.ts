import type { AudioService } from "../type/audio-service";
import type { PlayOptions } from "../type/play-options";
import type { SoundConfig } from "../type/sound-config";

export class WebAudioService implements AudioService {
    private sounds: Map<string, HTMLAudioElement> = new Map();

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

        sound.currentTime = 0;
        sound.volume = options?.volume ?? 1;
        sound.loop = options?.loop ?? false;

        if (options?.onEnd) {
            sound.onended = options.onEnd;
        }

        sound.play().catch((error) => {
            console.error(`Failed to play sound ${key}:`, error);
        });
    }

    stopSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    pauseSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.pause();
        }
    }

    resumeSound(key: string): void {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play().catch((error) => {
                console.error(`Failed to resume sound ${key}:`, error);
            });
        }
    }

    setVolume(key: string, volume: number): void {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }
}
