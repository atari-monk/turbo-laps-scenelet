import type { GameEngine } from "zippy-game-engine";
import { ElipseTrack } from "../scene/elipse-track";
import { RectangleTrack } from "../scene/rectangle-track";
import { Car } from "../scene/car";
import { TrackBoundary } from "../scene/track-boundary";
import { StartingGrid } from "../scene/starting-grid";
import { RoadMarkings } from "../scene/road-markings";
import { TrackGrass } from "../scene/track-grass";
import { LapTracker } from "../scene/lap-tracker";
import { MouseCursor } from "../scene/mouse-cursor";
import { Countdown } from "../scene/countdown";
import { Continue } from "../scene/continue";
import { Menu } from "../scene/menu";
import type { PositionProvider } from "../type/position-provider";
import { GameScore } from "../scene/game-score";
import { WebAudioService } from "../service/web-audio-service";
import { loadCarConfigurations } from "../car/load-car-config";
import { MovementSystem } from "../car/movement-system";
import { CarSoundManager } from "../car/car-sound-manager";
import { preloadCarSounds } from "../car/preload-car-sounds";
import { CarStateContext } from "../car/car-state-context";
import { CarRenderer } from "../car/car-renderer";
import { CarInputHandler } from "../car/car-input-handler";
import {
    VirtualJoystick,
    type VirtualJoystickConfig,
} from "../scene/virtual-joystick";
import { TestCar } from "../scene/test-car";
import { SteerableRect } from "../scene/steerable-rect";

export class SceneInstanceFactory {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly canvas: HTMLCanvasElement
    ) {}

    public createElipseTrack(): ElipseTrack {
        return new ElipseTrack(this.canvas);
    }

    public createRectangleTrack(): RectangleTrack {
        return new RectangleTrack(this.canvas);
    }

    public async createCar(inputEnabled: boolean = false): Promise<Car> {
        const { carConfig, soundConfig } = await loadCarConfigurations();
        carConfig.inputEnabled = inputEnabled;
        const audioService = new WebAudioService();
        const carStateContext = new CarStateContext();
        const renderer = new CarRenderer(carConfig, carStateContext);
        const inputHandler = new CarInputHandler(
            this.gameEngine.input,
            carStateContext,
            carConfig
        );
        const movementSystem = new MovementSystem(carStateContext);
        const carSoundManager = new CarSoundManager(
            audioService,
            carStateContext,
            soundConfig
        );
        const car = new Car(
            this.canvas,
            carConfig,
            carStateContext,
            renderer,
            inputHandler,
            movementSystem,
            carSoundManager
        );
        await preloadCarSounds(soundConfig, audioService);
        return car;
    }

    public createTrackBoundary(): TrackBoundary {
        return new TrackBoundary(this.canvas);
    }

    public createStartingGrid(): StartingGrid {
        return new StartingGrid();
    }

    public createRoadMarkings(): RoadMarkings {
        return new RoadMarkings();
    }

    public createTrackGrass(): TrackGrass {
        return new TrackGrass();
    }

    public createLapTracker(
        positionProvider: PositionProvider,
        turnOn = false
    ): LapTracker {
        return new LapTracker(positionProvider, turnOn);
    }

    public createCountdown(
        onCountdownGO: () => void,
        onCountdownComplete: () => void
    ): Countdown {
        return new Countdown(onCountdownGO, onCountdownComplete);
    }

    public createContinue(): Continue {
        return new Continue(this.gameEngine.input);
    }

    public createMouseCursor(): MouseCursor {
        return new MouseCursor(this.gameEngine.input);
    }

    public createMenu(): Menu {
        return new Menu(this.gameEngine.input);
    }

    public createGameScore(): GameScore {
        return new GameScore();
    }

    public createVirtualJoystick(
        config: VirtualJoystickConfig = {}
    ): VirtualJoystick {
        return new VirtualJoystick(this.canvas, config);
    }

    public createTestCar(): TestCar {
        return new TestCar(this.canvas);
    }

    public createSteerableRect(): SteerableRect {
        return new SteerableRect(this.canvas);
    }
}
