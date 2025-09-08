import type { PlayOptions } from "./play-options";
import type { SoundConfig } from "./sound-config";

export interface AudioService {
    loadSound(key: string, path: string): Promise<void>;
    playSound(key: string, options?: PlayOptions): void;
    stopSound(key: string): void;
    pauseSound(key: string): void;
    resumeSound(key: string): void;
    setVolume(key: string, volume: number): void;
    preloadSounds(sounds: SoundConfig[]): Promise<void>;
    setSoundPitch(key: string, pitch: number): void;
}
