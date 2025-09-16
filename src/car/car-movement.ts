import type { CarConstraints } from "./car-constraints";
import type { CarInputHandler } from "./car-input-handler";
import type { MovementSystem } from "./movement-system";

export class CarMovement {
    constructor(
        public readonly inputHandler: CarInputHandler,
        public readonly movementSystem: MovementSystem,
        public readonly carConstraints: CarConstraints
    ) {}
}
