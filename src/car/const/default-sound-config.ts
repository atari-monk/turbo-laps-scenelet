import type { CarSoundConfig } from "../type/car-sound-config";

export const DEFAULT_SOUND_CONFIG: CarSoundConfig = {
    engineSoundKey: "car-engine",
    engineSoundPath: "/assets/audio/car-engine.wav",
    crashSoundKey: "car-crash",
    crashSoundPath: "/assets/audio/car-crash.wav",
    hornSoundKey: "car-horn",
    hornSoundPath: "/assets/audio/car-horn.wav",
    skidSoundKey: "car-skid",
    skidSoundPath: "/assets/audio/car-skid.wav",
};
