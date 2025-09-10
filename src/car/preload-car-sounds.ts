import type { AudioService } from "../type/audio-service";
import type { SoundConfig } from "../type/sound-config";
import type { CarSoundConfig } from "./type/car-sound-config";

export async function preloadCarSounds(
    soundConfig: CarSoundConfig,
    audioService: AudioService
): Promise<void> {
    const soundConfigs: SoundConfig[] = [
        {
            key: soundConfig.engineSoundKey,
            path: soundConfig.engineSoundPath,
        },
        {
            key: soundConfig.crashSoundKey,
            path: soundConfig.crashSoundPath,
        },
        {
            key: soundConfig.hornSoundKey,
            path: soundConfig.hornSoundPath,
        },
        {
            key: soundConfig.skidSoundKey,
            path: soundConfig.skidSoundPath,
        },
    ];

    await audioService.preloadSounds(soundConfigs).catch(() => {
        console.warn("Failed to preload some car sounds");
    });
}
