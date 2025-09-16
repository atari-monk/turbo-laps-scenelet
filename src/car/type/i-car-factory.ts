import type { IStartingGrid } from "../../scene/starting-grid";
import type { ITrackBoundary } from "../../scene/track-boundary";
import type { Car } from "../car";

export interface ICarFactory {
    withTrackBoundary(trackBoundary: ITrackBoundary): ICarFactory;
    withStartingGrid(startingGrid: IStartingGrid): ICarFactory;
    build(inputEnabled: boolean): Promise<Car>;
}
