import type { FrameContext } from "zippy-shared-lib";
import type { IStartingGrid } from "../scene/starting-grid";
import type { ICar } from "./type/i-car";
import type { JoystickInput } from "../virtual-joystick/joystick-input";
import type { CarModel } from "./car-model";
import type { CarSystems } from "./car-systems";
import type { CarInputHandler } from "./car-input-handler";
import type { MovementSystem } from "./movement-system";
import type { CarRenderer } from "./car-renderer";
import type { CarStateContext } from "./car-state-context";
import type { CarConstraints } from "./car-constraints";
import type { CarSounds } from "./car-sounds";

export class Car implements ICar {
    private readonly stateContext: CarStateContext;
    private readonly canvas: HTMLCanvasElement;
    private readonly renderer: CarRenderer;
    private readonly inputHandler: CarInputHandler;
    private readonly movementSystem: MovementSystem;
    private readonly carConstraints: CarConstraints;
    private readonly carSounds: CarSounds;

    name?: string = "Car";
    displayName?: string = "Car";

    get velocity(): number {
        return this.stateContext.velocity;
    }

    set velocity(value: number) {
        this.stateContext.updateVelocity(value);
    }

    get position(): { x: number; y: number } {
        return this.stateContext.position;
    }

    constructor(carModel: CarModel, carSystems: CarSystems) {
        this.stateContext = carModel.stateContext;
        this.canvas = carSystems.carGraphics.canvas;
        this.renderer = carSystems.carGraphics.renderer;
        this.inputHandler = carSystems.carMovement.inputHandler;
        this.movementSystem = carSystems.carMovement.movementSystem;
        this.carConstraints = carSystems.carMovement.carConstraints;
        this.carSounds = carSystems.carSounds;
        this.setInputEnabled(carModel.carConfig.inputEnabled);
    }

    updateSteering(input: JoystickInput): void {
        this.inputHandler.setSteeringInput(input);
    }

    updateAcceleration(input: JoystickInput): void {
        this.inputHandler.setAccelerationInput(input);
    }

    setInputEnabled(enabled: boolean): void {
        this.stateContext.updateInputEnabled(enabled);
    }

    setStartingPosition(startingGrid: IStartingGrid): void {
        this.stateContext.setStartingPosition(
            startingGrid.getStartingPosition()
        );
    }

    update(context: FrameContext): void {
        this.inputHandler.processInput(context.deltaTime);
        this.movementSystem.update(context.deltaTime);
        this.carConstraints.carTrackConstraint?.update(context, this);
        this.carConstraints.carBounds.keepInBounds();
        this.carSounds.engineSound.update();
        // this.handleSoundEffects(context.deltaTime);
    }

    // private handleSoundEffects(deltaTime: number): void {
    //     this.soundManager?.handleEngine();
    //     this.soundManager?.handleHorn(this.isKeyPressed(INPUT_MAPPING.HORN));
    //     this.soundManager?.handleSkid(
    //         deltaTime,
    //         { moveSpeed: this.carConfig.maxSpeed },
    //         this.stateContext.rotation,
    //         this.stateContext.lastRotation
    //     );
    // }

    // private isKeyPressed(key: string): boolean {
    //     return this.inputHandler.isKeyPressed(key);
    // }

    render(context: FrameContext): void {
        this.renderer.render(context);
    }

    onEnter(): void {
        this.stateContext.setOnEnterState(
            this.canvas.width,
            this.canvas.height
        );
    }

    resize(): void {
        this.carConstraints.carBounds.keepInBounds();
    }
}
