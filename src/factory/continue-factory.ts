import type { SceneArrayFactory } from "../types/scene-array-factory";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ArrowPlayer } from "../scenes/arrow-player";
import { Continue } from "../scenes/continue";
import { Countdown } from "../scenes/countdown";
import { LapTracker } from "../scenes/lap-tracker";
import { RectangleTrack } from "../scenes/rectangle-track";
import { StartingGrid } from "../scenes/starting-grid";
import { TrackBoundary } from "../scenes/track-boundary";

export class ContinueFactory implements SceneArrayFactory {
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
        const lapTracker = new LapTracker(track, player);
        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
            continueBtn.show();
        });
        const countdown = new Countdown(
            () => {
                player.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );
        const continueBtn = new Continue(this.gameEngine.input);
        continueBtn.setOnRestartRace(() => {
            continueBtn.hide();
            countdown.startAgain();
        });

        return [
            track,
            trackBoundary,
            startingGrid,
            player,
            lapTracker,
            countdown,
            continueBtn,
        ];
    }
}
