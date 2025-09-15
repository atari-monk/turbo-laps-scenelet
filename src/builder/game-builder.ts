import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import type { IStartingGrid } from "../scene/starting-grid";
import type { ITrackBoundary } from "../scene/track-boundary";
import type { ILapTracker } from "../scene/lap-tracker";
import type { ICountdown } from "../scene/countdown";
import type { IContinue } from "../scene/continue";
import type { IGameScore } from "../scene/game-score";
import type { IBuilder } from "../type/i-builder";
import type { ICar } from "../car/type/i-car";
import { JoystickAxisMode } from "../virtual-joystick/JoystickAxisMode";
import type { ICarFactory } from "../car/type/i-car-factory";

export class GameBuilder implements IBuilder {
    private scenes: Scene[] = [];
    private startingGrid?: IStartingGrid;
    private trackBoundary?: ITrackBoundary;
    private car?: ICar;
    private lapTracker?: ILapTracker;
    private countdown?: ICountdown;
    private continueBtn?: IContinue;
    private gameScore?: IGameScore;

    constructor(
        private readonly factory: SceneInstanceFactory,
        private readonly carFactory: ICarFactory
    ) {}

    async withRectangleTrack(): Promise<GameBuilder> {
        const track = this.factory.createRectangleTrack();
        this.scenes.push(track);
        return this;
    }

    async withTrackGrass(): Promise<GameBuilder> {
        const grass = this.factory.createTrackGrass();
        this.scenes.push(grass);
        return this;
    }

    async withRoadMarkings(): Promise<GameBuilder> {
        const roadMarkings = this.factory.createRoadMarkings();
        this.scenes.push(roadMarkings);
        return this;
    }

    async withStartingGrid(): Promise<GameBuilder> {
        this.startingGrid = this.factory.createStartingGrid();
        this.scenes.push(this.startingGrid);
        return this;
    }

    async withCar(): Promise<GameBuilder> {
        if (!this.startingGrid) {
            throw new Error("Starting grid must be set before adding player");
        }
        if (!this.trackBoundary) {
            throw new Error("Track Boundary must be set before adding player");
        }
        this.car = await this.carFactory.createCar(false);
        this.car.setStartingGrid(this.startingGrid!);
        this.car.setStartingPosition(this.startingGrid.getStartingPosition());
        this.car.setTrackBoundary(this.trackBoundary);
        this.scenes.push(this.car);
        return this;
    }

    async withTrackBoundary(): Promise<GameBuilder> {
        this.trackBoundary = this.factory.createTrackBoundary();
        this.scenes.push(this.trackBoundary);
        return this;
    }

    async withCountdown(): Promise<GameBuilder> {
        if (!this.car) {
            throw new Error("Player must be set before adding Countdown");
        }
        if (!this.lapTracker) {
            throw new Error("LapTracker must be set before adding Countdown");
        }
        this.countdown = this.factory.createCountdown(
            () => {
                this.car!.setInputEnabled(true);
                this.lapTracker!.start();
            },
            () => {}
        );
        this.scenes.push(this.countdown);
        return this;
    }

    async withLapTracker(): Promise<GameBuilder> {
        if (!this.car) {
            throw new Error("Player must be set before adding LapTracker");
        }
        if (!this.startingGrid) {
            throw new Error(
                "StartingGrid must be set before adding LapTracker"
            );
        }
        if (!this.gameScore) {
            throw new Error("GameScore must be set before adding LapTracker");
        }
        this.lapTracker = this.factory.createLapTracker(this.car);
        this.lapTracker.setRaceCompleteCallback(() => {
            this.gameScore!.onRaceComplete(this.lapTracker!);
            this.lapTracker!.reset();
            this.car!.setInputEnabled(false);
            this.car!.setStartingPosition(
                this.startingGrid!.getStartingPosition()
            );
            this.continueBtn!.show();
        });
        this.scenes.push(this.lapTracker);
        return this;
    }

    async withContinueBtn(): Promise<GameBuilder> {
        if (!this.countdown) {
            throw new Error("Countdown must be set before adding Continue");
        }
        this.continueBtn = this.factory.createContinue();
        this.continueBtn.setOnRestartRace(() => {
            this.continueBtn!.hide();
            this.countdown!.startAgain();
        });
        this.scenes.push(this.continueBtn);
        return this;
    }

    async withGameScore(): Promise<GameBuilder> {
        this.gameScore = this.factory.createGameScore();
        this.scenes.push(this.gameScore);
        return this;
    }

    async withCarJoystick(): Promise<GameBuilder> {
        if (!this.car) {
            throw new Error("Car must be set before adding CarJoystick");
        }

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
        accelerationJoystick.setAccelerationControl(this.car!);
        steeringJoystick.setSteeringControl(this.car!);
        this.scenes.push(accelerationJoystick);
        this.scenes.push(steeringJoystick);
        return this;
    }

    build(): Scene[] {
        if (this.scenes.length === 0) {
            throw new Error("No scenes configured");
        }
        this.validateScenes();
        return this.scenes;
    }

    private validateScenes(): void {
        const isStartingGrid = (
            scene: Scene
        ): scene is IStartingGrid & Scene => {
            return "getStartingPosition" in scene;
        };
        const startingGrids = this.scenes.filter(isStartingGrid);
        if (startingGrids.length === 0) {
            console.warn("No starting grid scenes found");
        }
    }
}
