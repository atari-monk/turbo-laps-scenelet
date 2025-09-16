import type { CarGraphics } from "./car-graphics";
import type { CarMovement } from "./car-movement";
import type { CarSounds } from "./car-sounds";

export class CarSystems {
    constructor(
        public readonly carGraphics: CarGraphics,
        public readonly carMovement: CarMovement,
        public readonly carSounds: CarSounds
    ) {}
}
