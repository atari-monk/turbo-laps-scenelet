import type { FrameContext } from "zippy-shared-lib";
import type { ITrackBoundary } from "./track-boundary";
import type { IStartingGrid } from "./starting-grid";
import type { ICar } from "../car/type/i-car";
import type { CarConfig } from "../car/type/car-config";
import type { CarState } from "../car/type/car-state";
import { MovementSystem } from "../car/movement-system";
import { CarSoundManager } from "../car/car-sound-manager";
import { INPUT_MAPPING } from "../car/type/input-mapping";
import { CarStateContext } from "../car/car-state-context";
import type { CarRenderer } from "../car/car-renderer";
import type { CarInputHandler } from "../car/car-input-handler";
import type { JoystickInput } from "../type/joystick-input";

export class Car implements ICar {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly carConfig: CarConfig,
        private readonly stateContext: CarStateContext,
        private readonly renderer: CarRenderer,
        private readonly inputHandler: CarInputHandler,
        private readonly movementSystem: MovementSystem,
        private readonly soundManager: CarSoundManager
    ) {
        this.setInputEnabled(this.carConfig.inputEnabled);
    }

    updateSteering(input: JoystickInput): void {
        this.inputHandler.setSteeringInput(input);
    }

    updateAcceleration(input: JoystickInput): void {
        this.inputHandler.setAccelerationInput(input);
    }

    setInputEnabled(enabled: boolean): void {
        this.stateContext.updateInputEnabled(enabled);
        if (!enabled) {
            this.stateContext.updateVelocity(0);
        }
    }

    setTrackBoundary(trackBoundary: ITrackBoundary): void {
        this.trackBoundary = trackBoundary;
    }

    setStartingGrid(startingGrid: IStartingGrid): void {
        this.startingGrid = startingGrid;
        this.setStartingPosition(startingGrid.getStartingPosition());
    }

    setStartingPosition(position: {
        x: number;
        y: number;
        angle: number;
    }): void {
        this.stateContext.updatePosition({ x: position.x, y: position.y });
        this.stateContext.updateRotation(position.angle * (180 / Math.PI));
        this.stateContext.updateLastRotation(this.stateContext.rotation);
        this.stateContext.updateVelocity(0);
        this.stateContext.updateWasOnTrack(true);
        this.soundManager?.stopSkid();
    }

    init(): void {}

    update(context: FrameContext): void {
        this.inputHandler.processInput(context.deltaTime);
        this.movementSystem.update(context.deltaTime);
        this.handleSoundEffects(context.deltaTime);

        if (this.trackBoundary && this.startingGrid) {
            const isOnTrack = this.trackBoundary.checkCarOnTrack(
                this,
                this.startingGrid,
                context.deltaTime
            );
            this.handleTrackStateChange(isOnTrack);
        } else {
            this.keepInBounds();
        }
    }

    private handleTrackStateChange(isOnTrack: boolean): void {
        if (!this.stateContext.wasOnTrack && isOnTrack) {
            this.stateContext.updateWasOnTrack(true);
            this.stateContext.updateKeysEnabled(true);
        } else if (this.stateContext.wasOnTrack && !isOnTrack) {
            this.stateContext.updateWasOnTrack(false);
            this.stateContext.updateKeysEnabled(false);
            this.soundManager?.playCrash();
            this.soundManager?.stopSkid();
        }
    }

    private handleSoundEffects(deltaTime: number): void {
        this.soundManager?.handleEngine(
            this.stateContext.velocity,
            this.carConfig.moveSpeed
        );
        this.soundManager?.handleHorn(this.isKeyPressed(INPUT_MAPPING.HORN));
        this.soundManager?.handleSkid(
            deltaTime,
            { moveSpeed: this.carConfig.moveSpeed },
            this.stateContext.rotation,
            this.stateContext.lastRotation
        );
    }

    private isKeyPressed(key: string): boolean {
        return this.inputHandler.isKeyPressed(key);
    }

    private keepInBounds(): void {
        const halfWidth = this.carConfig.carWidth / 2;
        const halfHeight = this.carConfig.carHeight / 2;
        const position = this.stateContext.position;

        const newX = Math.max(
            halfWidth,
            Math.min(this.canvas.width - halfWidth, position.x)
        );
        const newY = Math.max(
            halfHeight,
            Math.min(this.canvas.height - halfHeight, position.y)
        );

        if (position.x !== newX || position.y !== newY) {
            this.stateContext.updatePosition({ x: newX, y: newY });
        }
    }

    render(context: FrameContext): void {
        this.renderer.render(context);
    }

    onEnter(): void {
        this.stateContext.updatePosition({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        });
        this.stateContext.updateRotation(0);
        this.stateContext.updateLastRotation(0);
        this.stateContext.updateVelocity(0);
        this.stateContext.updateWasOnTrack(true);
        this.stateContext.updateInputEnabled(true);
        this.soundManager?.stopSkid();
    }

    onExit(): void {
        this.cleanup();
        this.soundManager?.stopAll();
    }

    resize(): void {
        this.keepInBounds();
    }

    private cleanup(): void {}

    name?: string = "Car";
    displayName?: string = "Car";

    private trackBoundary?: ITrackBoundary;
    private startingGrid?: IStartingGrid;

    get velocity(): number {
        return this.stateContext.velocity;
    }

    set velocity(value: number) {
        this.stateContext.updateVelocity(value);
    }

    get position(): { x: number; y: number } {
        return this.stateContext.position;
    }

    get rotation(): number {
        return this.stateContext.rotation;
    }

    get carState(): CarState {
        return this.stateContext.getState();
    }
}
