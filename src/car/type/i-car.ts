import type { Scene } from "zippy-game-engine";
import type { PositionProvider } from "./position-provider";
import type { ITrackBoundary } from "../../scene/track-boundary";
import type { IStartingGrid } from "../../scene/starting-grid";
import type { AccelerationControl } from "../../virtual-joystick/acceleration-control";
import type { SteeringControl } from "../../virtual-joystick/steering-control";

export interface ICar
    extends Scene,
        PositionProvider,
        AccelerationControl,
        SteeringControl {
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
