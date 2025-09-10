import type { CarConfig } from "./type/car-config";
import type { CarSoundConfig } from "./type/car-sound-config";

export const DEFAULT_CAR_CONFIG: CarConfig = {
    carWidth: 50,
    carHeight: 110,
    carColor: "red",
    moveSpeed: 700,
    turnSpeed: 200,
    useSprite: true,
    spriteUrl: "assets/sprite/race_car.png",
    allowStationaryTurning: false,
};

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
