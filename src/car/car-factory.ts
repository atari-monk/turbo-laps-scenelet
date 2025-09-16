import type { GameEngine } from "zippy-game-engine";
import { Car } from "../car/car";
import { WebAudioService } from "../audio-service/web-audio-service";
import { loadCarConfigurations } from "../car/load-car-config";
import { MovementSystem } from "../car/movement-system";
import { CarSounds } from "./car-sounds";
import { preloadCarSounds } from "../car/preload-car-sounds";
import { CarStateContext } from "../car/car-state-context";
import { CarRenderer } from "../car/car-renderer";
import { CarInputHandler } from "../car/car-input-handler";
import type { ICarFactory } from "./type/i-car-factory";
import { CarModel } from "./car-model";
import { CarSystems } from "./car-systems";
import { CarGraphics } from "./car-graphics";
import { CarMovement } from "./car-movement";
import { CarConstraints } from "./car-constraints";
import { CarTrackConstraint } from "./car-track-constraint";
import type { ITrackBoundary } from "../scene/track-boundary";
import type { IStartingGrid } from "../scene/starting-grid";
import { CarBounds } from "./car-bounds";

export class CarFactory implements ICarFactory {
    private trackBoundary?: ITrackBoundary;
    private startingGrid?: IStartingGrid;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly gameEngine: GameEngine
    ) {}

    public withTrackBoundary(trackBoundary: ITrackBoundary): ICarFactory {
        this.trackBoundary = trackBoundary;
        return this;
    }

    public withStartingGrid(startingGrid: IStartingGrid): ICarFactory {
        this.startingGrid = startingGrid;
        return this;
    }

    public async build(inputEnabled: boolean = false): Promise<Car> {
        // if (!this.trackBoundary || !this.startingGrid) {
        //     throw new Error(
        //         "Required trackBoundary and startingGrid dependency."
        //     );
        // }
        const { carConfig, soundConfig } = await loadCarConfigurations();
        carConfig.inputEnabled = inputEnabled;

        const audioService = new WebAudioService();
        const carStateContext = new CarStateContext();
        const carModel = new CarModel(carConfig, carStateContext);
        const inputHandler = new CarInputHandler(
            this.gameEngine.input,
            carStateContext,
            carConfig
        );
        const movementSystem = new MovementSystem(carStateContext);
        const carSoundManager = new CarSounds(
            audioService,
            carStateContext,
            carConfig,
            soundConfig
        );
        const renderer = new CarRenderer(carConfig, carStateContext);
        const carGraphics = new CarGraphics(this.canvas, renderer);

        const carBounds = new CarBounds(carGraphics, carModel);
        const carConstraints = new CarConstraints(carBounds);
        if (this.trackBoundary && this.startingGrid) {
            const carTrackConstraints = new CarTrackConstraint(
                this.trackBoundary,
                this.startingGrid,
                carStateContext
            );
            carConstraints.withCarTrackConstraint(carTrackConstraints);
        }
        const carMovement = new CarMovement(
            inputHandler,
            movementSystem,
            carConstraints
        );
        const carSystems = new CarSystems(
            carGraphics,
            carMovement,
            carSoundManager
        );

        const car = new Car(carModel, carSystems);

        await preloadCarSounds(soundConfig, audioService);

        return car;
    }
}
