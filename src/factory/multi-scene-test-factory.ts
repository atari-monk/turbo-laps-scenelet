import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { TrackConfigService } from "../track/track-config.service";
import { MultiSceneId } from "../tester/const";
import type { ICarFactory } from "../car/type/i-car-factory";
import { JoystickAxisMode } from "../virtual-joystick/joystick-axis-mode";

export class MultiSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly factory: SceneInstanceFactory,
        private readonly carFactory: ICarFactory
    ) {}

    public async createMultiSceneTest(
        sceneType: MultiSceneId
    ): Promise<Scene[]> {
        switch (sceneType) {
            case MultiSceneId.TRACK_CURSOR:
                return this.createTrackCursorTest();
            case MultiSceneId.START_RACE:
                return await this.createStartRaceTest();
            case MultiSceneId.CAR_OUT_OF_TRACK:
                return await this.createCarOutOfTrackTest();
            case MultiSceneId.LAP_MEASUREMENT:
                return await this.createLapMeasurementTest();
            case MultiSceneId.RACE_RESTART:
                return await this.createRaceRestartTest();
            case MultiSceneId.JOYSTICK_FOR_TEST_CAR:
                return this.createJoystickTest();
            case MultiSceneId.XY_JOYSTICK:
                return this.createXYJoystickTest();
            case MultiSceneId.JOYSTICK_FOR_GAME_CAR:
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
        const player = await this.carFactory.build(false);
        const countdown = this.factory.createCountdown(
            () => player.setInputEnabled(true),
            () => console.log("Countdown done")
        );
        player.setStartingPosition(startingGrid);
        return [track, startingGrid, player, countdown];
    }

    private async createCarOutOfTrackTest(): Promise<Scene[]> {
        TrackConfigService.getInstance().calculateTrackState(this.canvas);
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        this.carFactory.withTrackBoundary(trackBoundary);
        const car = await this.carFactory.build(true);
        car.setStartingPosition(startingGrid);
        return [trackBoundary, startingGrid, car];
    }

    private async createLapMeasurementTest(): Promise<Scene[]> {
        const track = this.factory.createRectangleTrack();
        const startingGrid = this.factory.createStartingGrid();
        const player = await this.carFactory.build(true);
        const lapTracker = this.factory.createLapTracker(player);
        const countdown = this.factory.createCountdown(
            () => {
                player.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );

        player.setInputEnabled(false);
        player.setStartingPosition(startingGrid);

        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid);
        });

        return [track, startingGrid, player, lapTracker, countdown];
    }

    private async createRaceRestartTest(): Promise<Scene[]> {
        const track = this.factory.createRectangleTrack();
        const trackBoundary = this.factory.createTrackBoundary();
        const startingGrid = this.factory.createStartingGrid();
        this.carFactory.withTrackBoundary(trackBoundary);
        const car = await this.carFactory.build(false);
        const lapTracker = this.factory.createLapTracker(car);
        const countdown = this.factory.createCountdown(
            () => {
                car.setInputEnabled(true);
                lapTracker.start();
            },
            () => {}
        );
        const continueBtn = this.factory.createContinue();
        const gameSore = this.factory.createGameScore();

        car.setStartingPosition(startingGrid);

        lapTracker.setRaceCompleteCallback(() => {
            gameSore.onRaceComplete(lapTracker);
            lapTracker.reset();
            car.setInputEnabled(false);
            car.setStartingPosition(startingGrid);
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
            car,
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

    private async createJoystickForCar(): Promise<Scene[]> {
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

        const car = await this.carFactory.build(true);

        accelerationJoystick.setAccelerationControl(car);
        steeringJoystick.setSteeringControl(car);

        return [accelerationJoystick, steeringJoystick, car];
    }
}
