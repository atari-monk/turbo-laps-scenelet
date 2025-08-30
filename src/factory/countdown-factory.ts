import type { SceneArrayFactory } from "../types/scene-array-factory";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ArrowPlayer } from "../scenes/arrow-player";
import { Countdown } from "../scenes/countdown";
import { RectangleTrack } from "../scenes/rectangle-track";
import { StartingGrid } from "../scenes/starting-grid";

export class CountdownFactory implements SceneArrayFactory {
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
        const countdown = new Countdown(
            () => {
                player.setInputEnabled(true);
            },
            () => {}
        );

        player.setStartingPosition(startingGrid.getStartingPosition());

        return [track, startingGrid, player, countdown];
    }
}
