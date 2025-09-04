import type { SceneArrayFactory } from "../types/scene-array-factory";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ArrowPlayer } from "../scenes/arrow-player";
import { Countdown } from "../scenes/countdown";
import { LapTracker } from "../scenes/lap-tracker";
import { RectangleTrack } from "../scenes/rectangle-track";
import { StartingGrid } from "../scenes/starting-grid";

export class LapTrackerFactory implements SceneArrayFactory {
    constructor(
        private gameEngine: GameEngine,
        private canvas: HTMLCanvasElement
    ) {}

    generateSceneArray(): Scene[] {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        player.setInputEnabled(false);
        player.setStartingPosition(startingGrid.getStartingPosition());
        const lapTracker = new LapTracker(track, player);
        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
        });
        const countdown = new Countdown(
            () => {
                player.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );

        return [track, startingGrid, player, lapTracker, countdown];
    }
}
