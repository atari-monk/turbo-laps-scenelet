import type { CarStateContext } from "./car-state-context";
import type { CarConfig } from "./type/car-config";

export class CarModel {
    get carConfig(): CarConfig {
        return this._carConfig;
    }

    get stateContext(): CarStateContext {
        return this._stateContext;
    }

    constructor(
        private readonly _carConfig: CarConfig,
        private readonly _stateContext: CarStateContext
    ) {
        this.stateContext.updateInputEnabled(this._carConfig.inputEnabled);
    }
}
