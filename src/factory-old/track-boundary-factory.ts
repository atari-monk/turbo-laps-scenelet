import type { SceneArrayFactory } from "../types/scene-array-factory";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ArrowPlayer } from "../scenes/arrow-player";
import { RectangleTrack } from "../scenes/rectangle-track";
import { StartingGrid } from "../scenes/starting-grid";
import { TrackBoundary } from "../scenes/track-boundary";

export class TrackBoundaryFactory implements SceneArrayFactory {
    constructor(
        private gameEngine: GameEngine,
        private canvas: HTMLCanvasElement
    ) {}

    generateSceneArray(): Scene[] {
        const track = new RectangleTrack(this.canvas);
        const trackBoundary = new TrackBoundary(track);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());
        player.setInputEnabled(true);

        return [trackBoundary, startingGrid, player];
    }
}
