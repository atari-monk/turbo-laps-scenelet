import type { CrashSound } from "./sound/crash-sound";
import type { EngineSound } from "./sound/engine-sound";
import type { SkidSound } from "./sound/skid-sound";

export class CarSounds {
    constructor(
        public readonly engineSound: EngineSound,
        public readonly crashSound: CrashSound,
        public readonly skidSound: SkidSound
    ) {}

    update() {
        this.engineSound.update();
        this.crashSound.update();
        this.skidSound.update();
    }
}
