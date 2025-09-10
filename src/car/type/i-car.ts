import type { Scene } from "zippy-game-engine";
import type { ITrackBoundary } from "../../scene/track-boundary";
import type { IStartingGrid } from "../../scene/starting-grid";

export interface ICar extends Scene {
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
