import { MultiSceneType } from "../types/multi-scene-type";
import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { TrackConfigService } from "../scenes/service/track-config.service";

export class MultiSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly factory: SceneInstanceFactory
    ) {}

    public createMultiSceneTest(sceneType: MultiSceneType): Scene[] {
        if (sceneType === MultiSceneType.CAR_OUT_OF_TRACK) {
            return this.createTrackBoundary();
        }
        if (sceneType === MultiSceneType.TRACK_CURSOR) {
            return [
                this.factory.createRectangleTrack(),
                this.factory.createMouseCursor(),
            ];
        }
        throw new Error(`Unknown multi-scene type: ${sceneType}`);
    }

    private createTrackBoundary(): Scene[] {
        TrackConfigService.getInstance().calculateTrackState(this.canvas);
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        const player = this.factory.createArrowPlayer(true);
        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());
        return [trackBoundary, startingGrid, player];
    }
}
