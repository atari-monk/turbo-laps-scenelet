import type { FrameContext } from "zippy-shared-lib";
import type { IStartingGrid } from "../scene/starting-grid";
import type { ITrackBoundary } from "../scene/track-boundary";
import type { CarStateContext } from "./car-state-context";
import type { ICar } from "./type/i-car";

export class CarTrackConstraint {
    constructor(
        private readonly trackBoundary: ITrackBoundary,
        private readonly startingGrid: IStartingGrid,
        private readonly carState: CarStateContext
    ) {}

    update(context: FrameContext, car: ICar): void {
        const isOnTrack = this.trackBoundary.checkCarOnTrack(
            car,
            this.startingGrid,
            context.deltaTime
        );
        this.carState.handleTrackStateChange(isOnTrack);
    }
}
