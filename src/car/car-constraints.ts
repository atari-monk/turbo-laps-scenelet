import type { CarBounds } from "./car-bounds";
import type { CarTrackConstraint } from "./car-track-constraint";

export class CarConstraints {
    public carTrackConstraint?: CarTrackConstraint;

    constructor(public readonly carBounds: CarBounds) {}

    withCarTrackConstraint(carTrackConstraint: CarTrackConstraint) {
        this.carTrackConstraint = carTrackConstraint;
    }
}
