import type { FrameContext } from "zippy-shared-lib";
import type { ITrackBoundary } from "./track-boundary";
import type { IStartingGrid } from "./starting-grid";
import type { ICar } from "../car/type/i-car";
import type { CarConfig } from "../car/type/car-config";
import type { CarState } from "../car/type/car-state";
import { MovementSystem } from "../car/movement-system";
import { CarSoundManager } from "../car/car-sound-manager";
import { INPUT_MAPPING } from "../car/type/input-mapping";
import type { InputSystem } from "zippy-game-engine";
import { CarStateContext } from "../car/car-state-context";

export class Car implements ICar {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly input: InputSystem,
        private readonly carConfig: CarConfig,
        private readonly stateContext: CarStateContext,
        private readonly movementSystem: MovementSystem,
        private readonly soundManager: CarSoundManager
    ) {
        this.setInputEnabled(this.carConfig.inputEnabled);
        this.loadSprite();
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

    private loadSprite(): void {
        if (!this.carConfig.spriteUrl) return;

        this.carImage = new Image();
        this.carImage.onload = () => {
            this.spriteLoaded = true;
        };
        this.carImage.onerror = () => {
            this.carConfig.useSprite = false;
        };
        this.carImage.src = this.carConfig.spriteUrl;
    }

    init(): void {}

    update(context: FrameContext): void {
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
        return (
            this.input.keyboard.isKeyDown(key) && this.stateContext.keysEnabled
        );
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
        const ctx = context.ctx;
        ctx.save();
        ctx.translate(
            this.stateContext.position.x,
            this.stateContext.position.y
        );
        ctx.rotate((this.stateContext.rotation * Math.PI) / 180);

        if (this.carConfig.useSprite && this.spriteLoaded && this.carImage) {
            this.renderSprite(ctx);
        } else {
            this.renderGeometricCar(ctx);
        }

        ctx.restore();
    }

    private renderGeometricCar(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.carConfig.carColor;
        ctx.fillRect(
            -this.carConfig.carWidth / 2,
            -this.carConfig.carHeight / 2,
            this.carConfig.carWidth,
            this.carConfig.carHeight
        );

        ctx.fillStyle = "#333";
        ctx.fillRect(
            -this.carConfig.carWidth / 2 + 5,
            -this.carConfig.carHeight / 2 + 5,
            this.carConfig.carWidth - 10,
            this.carConfig.carHeight / 3
        );
    }

    private renderSprite(ctx: CanvasRenderingContext2D): void {
        if (!this.carImage) return;

        ctx.drawImage(
            this.carImage,
            -this.carConfig.carWidth / 2,
            -this.carConfig.carHeight / 2,
            this.carConfig.carWidth,
            this.carConfig.carHeight
        );
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
    private carImage?: HTMLImageElement;
    private spriteLoaded: boolean = false;

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
