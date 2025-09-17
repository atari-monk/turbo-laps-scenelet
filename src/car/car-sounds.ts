import type { CrashSound } from "./sound/crash-sound";
import type { EngineSound } from "./sound/engine-sound";

export class CarSounds {
    constructor(
        public readonly engineSound: EngineSound,
        public readonly crashSound: CrashSound
    ) {}

    update() {
        this.engineSound.update();
        this.crashSound.update();
    }
}
