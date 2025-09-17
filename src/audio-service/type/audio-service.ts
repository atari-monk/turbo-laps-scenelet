import type { PlayOptions } from "./play-options";
import type { SoundConfig } from "./sound-config";

export interface AudioService {
    load(key: string, path: string): Promise<void>;
    play(key: string, options?: PlayOptions): void;
    stop(key: string): void;
    pause(key: string): void;
    resume(key: string): void;
    setVolume(key: string, volume: number): void;
    preload(sounds: SoundConfig[]): Promise<void>;
    setSoundPitch(key: string, pitch: number): void;
}
