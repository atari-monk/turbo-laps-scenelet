import { MultiSceneType } from "../type/multi-scene-type";
import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { TrackConfigService } from "../service/track-config.service";
import { JoystickAxisMode } from "../scene/virtual-joystick";

export class MultiSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly factory: SceneInstanceFactory
    ) {}

    public async createMultiSceneTest(
        sceneType: MultiSceneType
    ): Promise<Scene[]> {
        switch (sceneType) {
            case MultiSceneType.TRACK_CURSOR:
                return this.createTrackCursorTest();
            case MultiSceneType.START_RACE:
                return await this.createStartRaceTest();
            case MultiSceneType.CAR_OUT_OF_TRACK:
                return await this.createCarOutOfTrackTest();
            case MultiSceneType.LAP_MEASUREMENT:
                return await this.createLapMeasurementTest();
            case MultiSceneType.RACE_RESTART:
                return await this.createRaceRestartTest();
            case MultiSceneType.JOYSTICK_TEST:
                return this.createJoystickTest();
            case MultiSceneType.XY_JOYSTICK_TEST:
                return this.createXYJoystickTest();
            case MultiSceneType.JOYSTICK_FOR_CAR:
                return this.createJoystickForCar();
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

    private async createStartRaceTest(): Promise<Scene[]> {
        const track = this.factory.createRectangleTrack();
        const startingGrid = this.factory.createStartingGrid();
        const player = await this.factory.createCar();
        const countdown = this.factory.createCountdown(
            () => player.setInputEnabled(true),
            () => console.log("Countdown done")
        );

        player.setStartingPosition(startingGrid.getStartingPosition());

        return [track, startingGrid, player, countdown];
    }

    private async createCarOutOfTrackTest(): Promise<Scene[]> {
        TrackConfigService.getInstance().calculateTrackState(this.canvas);
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        const player = await this.factory.createCar(true);

        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());

        return [trackBoundary, startingGrid, player];
    }

    private async createLapMeasurementTest(): Promise<Scene[]> {
        const track = this.factory.createRectangleTrack();
        const startingGrid = this.factory.createStartingGrid();
        const player = await this.factory.createCar();
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

    private async createRaceRestartTest(): Promise<Scene[]> {
        const track = this.factory.createRectangleTrack();
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        const player = await this.factory.createCar();
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

    private createJoystickTest(): Scene[] {
        const accelerationJoystick = this.factory.createVirtualJoystick({
            relativePosition: { x: 0.2, y: 0.8 },
            axisMode: JoystickAxisMode.YOnly,
            identifier: "acceleration",
        });

        const steeringJoystick = this.factory.createVirtualJoystick({
            relativePosition: { x: 0.8, y: 0.8 },
            axisMode: JoystickAxisMode.XOnly,
            identifier: "steering",
        });

        const testCar = this.factory.createTestCar();

        accelerationJoystick.setAccelerationControl(testCar);
        steeringJoystick.setSteeringControl(testCar);

        return [accelerationJoystick, steeringJoystick, testCar];
    }

    private createXYJoystickTest(): Scene[] {
        const joystick = this.factory.createVirtualJoystick({
            relativePosition: { x: 0.5, y: 0.8 },
        });
        const steerableRect = this.factory.createSteerableRect();
        joystick.setSteeringControl(steerableRect);
        return [joystick, steerableRect];
    }

    async createJoystickForCar(): Promise<Scene[] | PromiseLike<Scene[]>> {
        const accelerationJoystick = this.factory.createVirtualJoystick({
            relativePosition: { x: 0.2, y: 0.8 },
            axisMode: JoystickAxisMode.YOnly,
            identifier: "acceleration",
        });

        const steeringJoystick = this.factory.createVirtualJoystick({
            relativePosition: { x: 0.8, y: 0.8 },
            axisMode: JoystickAxisMode.XOnly,
            identifier: "steering",
        });

        const car = await this.factory.createCar(true);

        accelerationJoystick.setAccelerationControl(car);
        steeringJoystick.setSteeringControl(car);

        return [accelerationJoystick, steeringJoystick, car];
    }
}
