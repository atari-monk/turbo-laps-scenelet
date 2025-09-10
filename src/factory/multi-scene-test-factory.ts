import { MultiSceneType } from "../type/multi-scene-type";
import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { TrackConfigService } from "../service/track-config.service";

export class MultiSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly factory: SceneInstanceFactory
    ) {}

    public createMultiSceneTest(sceneType: MultiSceneType): Scene[] {
        switch (sceneType) {
            case MultiSceneType.TRACK_CURSOR:
                return this.createTrackCursorTest();
            case MultiSceneType.START_RACE:
                return this.createStartRaceTest();
            case MultiSceneType.CAR_OUT_OF_TRACK:
                return this.createCarOutOfTrackTest();
            case MultiSceneType.LAP_MEASUREMENT:
                return this.createLapMeasurementTest();
            case MultiSceneType.RACE_RESTART:
                return this.createRaceRestartTest();
            default:
                throw new Error(`Unknown multi-scene type: ${sceneType}`);
        }
    }

    private createTrackCursorTest(): Scene[] {
        return [
            this.factory.createRectangleTrack(),
            this.factory.createMouseCursor(),
        ];
    }

    private createStartRaceTest(): Scene[] {
        const track = this.factory.createRectangleTrack();
        const startingGrid = this.factory.createStartingGrid();
        const player = this.factory.createCar();
        const countdown = this.factory.createCountdown(
            () => player.setInputEnabled(true),
            () => console.log("Countdown done")
        );

        player.setStartingPosition(startingGrid.getStartingPosition());

        return [track, startingGrid, player, countdown];
    }

    private createCarOutOfTrackTest(): Scene[] {
        TrackConfigService.getInstance().calculateTrackState(this.canvas);
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        const player = this.factory.createCar(true);

        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());

        return [trackBoundary, startingGrid, player];
    }

    private createLapMeasurementTest(): Scene[] {
        const track = this.factory.createRectangleTrack();
        const startingGrid = this.factory.createStartingGrid();
        const player = this.factory.createCar();
        const lapTracker = this.factory.createLapTracker(player);
        const countdown = this.factory.createCountdown(
            () => {
                player.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );

        player.setInputEnabled(false);
        player.setStartingPosition(startingGrid.getStartingPosition());

        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
        });

        return [track, startingGrid, player, lapTracker, countdown];
    }

    private createRaceRestartTest(): Scene[] {
        const track = this.factory.createRectangleTrack();
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        const player = this.factory.createCar();
        const lapTracker = this.factory.createLapTracker(player);
        const countdown = this.factory.createCountdown(
            () => {
                player.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );
        const continueBtn = this.factory.createContinue();
        const gameSore = this.factory.createGameScore();

        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());

        lapTracker.setRaceCompleteCallback(() => {
            gameSore.onRaceComplete(lapTracker);
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
            continueBtn.show();
        });

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
            gameSore,
        ];
    }
}
