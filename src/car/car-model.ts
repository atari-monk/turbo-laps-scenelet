import type { CarStateContext } from "./car-state-context";
import type { CarConfig } from "./type/car-config";
import type { CarSoundConfig } from "./type/car-sound-config";

export class CarModel {
    constructor(
        public readonly carConfig: CarConfig,
        public readonly carSoundConfig: CarSoundConfig,
        public readonly stateContext: CarStateContext
    ) {
        this.stateContext.updateInputEnabled(this.carConfig.inputEnabled);
    }
}
