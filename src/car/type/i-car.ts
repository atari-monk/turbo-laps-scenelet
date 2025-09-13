import type { Scene } from "zippy-game-engine";
import type { ITrackBoundary } from "../../scene/track-boundary";
import type { IStartingGrid } from "../../scene/starting-grid";
import type { AccelerationControl } from "../../type/acceleration-control";
import type { SteeringControl } from "../../type/steering-control";

export interface ICar extends Scene, AccelerationControl, SteeringControl {
    get velocity(): number;
    set velocity(value: number);
    get position(): { x: number; y: number };
    setInputEnabled(enabled: boolean): void;
    setStartingPosition(position: {
        x: number;
        y: number;
        angle: number;
    }): void;
    setTrackBoundary(trackBoundary: ITrackBoundary): void;
    setStartingGrid(startingGrid: IStartingGrid): void;
}
