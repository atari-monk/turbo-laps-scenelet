import type { GameEngine } from "zippy-game-engine";
import { Car } from "../car/car";
import { WebAudioService } from "../service/web-audio-service";
import { loadCarConfigurations } from "../car/load-car-config";
import { MovementSystem } from "../car/movement-system";
import { CarSoundManager } from "../car/car-sound-manager";
import { preloadCarSounds } from "../car/preload-car-sounds";
import { CarStateContext } from "../car/car-state-context";
import { CarRenderer } from "../car/car-renderer";
import { CarInputHandler } from "../car/car-input-handler";
import type { ICarFactory } from "./type/i-car-factory";

export class CarFactory implements ICarFactory {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly canvas: HTMLCanvasElement
    ) {}

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
}
