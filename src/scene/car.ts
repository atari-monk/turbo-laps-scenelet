import type { FrameContext } from "zippy-shared-lib";
import type { InputSystem } from "zippy-game-engine";
import type { ITrackBoundary } from "./track-boundary";
import type { IStartingGrid } from "./starting-grid";
import type { AudioService } from "../type/audio-service";
import type { SoundConfig } from "../type/sound-config";
import type { ICar } from "../car/type/i-car";
import type { CarConfig } from "../car/type/car-config";
import type { CarSoundConfig } from "../car/type/car-sound-config";
import { DEFAULT_CAR_CONFIG } from "../car/default-car-config";
import { ConfigService } from "../service/config-service";
import type { CarState } from "../car/type/car-state";
import { DEFAULT_SOUND_CONFIG } from "../car/default-sound-config";
import { MovementSystem } from "../car/movement-system";
import { CarSoundManager } from "../car/car-sound-manager";
import { INPUT_MAPPING } from "../car/type/input-mapping";

export class Car implements ICar {
    name?: string = "Car";
    displayName?: string = "Car";
    private movementSystem: MovementSystem;
    private soundManager: CarSoundManager;
    private trackBoundary?: ITrackBoundary;
    private startingGrid?: IStartingGrid;
    private carImage?: HTMLImageElement;
    private spriteLoaded: boolean = false;

    private config: CarConfig = { ...DEFAULT_CAR_CONFIG };
    private soundConfig: CarSoundConfig = { ...DEFAULT_SOUND_CONFIG };

    private state: CarState = this.createInitialState();

    get velocity(): number {
        return this.state.velocity;
    }

    set velocity(value: number) {
        this.state.velocity = value;
    }

    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly input: InputSystem,
        private readonly audioService: AudioService,
        enableInput = false
    ) {
        if (enableInput) this.setInputEnabled(true);
        this.loadConfigurations().then(() => {
            this.loadSprite();
            this.preloadCarSounds();
        });

        this.movementSystem = new MovementSystem(
            this.config,
            this.input,
            this.state
        );
        this.soundManager = new CarSoundManager(
            this.audioService,
            this.soundConfig,
            this.state
        );
    }

    private createInitialState(): CarState {
        return {
            position: { x: 0, y: 0 },
            rotation: 0,
            velocity: 0,
            isEnginePlaying: false,
            isSkidding: false,
            lastVelocity: 0,
            wasOnTrack: true,
            lastRotation: 0,
            inputEnabled: true,
            keysEnabled: true,
        };
    }

    private async loadConfigurations(): Promise<void> {
        try {
            this.config = await ConfigService.loadConfig(
                "/config/car-config.json",
                DEFAULT_CAR_CONFIG
            );

            this.soundConfig = await ConfigService.loadConfig(
                "/config/car-sound-config.json",
                DEFAULT_SOUND_CONFIG
            );
        } catch (error) {
            console.warn(
                "Failed to load car configurations, using defaults. Error:",
                error
            );
            this.config = { ...DEFAULT_CAR_CONFIG };
            this.soundConfig = { ...DEFAULT_SOUND_CONFIG };
        }
    }

    private preloadCarSounds(): void {
        const soundConfigs: SoundConfig[] = [
            {
                key: this.soundConfig.engineSoundKey,
                path: this.soundConfig.engineSoundPath,
            },
            {
                key: this.soundConfig.crashSoundKey,
                path: this.soundConfig.crashSoundPath,
            },
            {
                key: this.soundConfig.hornSoundKey,
                path: this.soundConfig.hornSoundPath,
            },
            {
                key: this.soundConfig.skidSoundKey,
                path: this.soundConfig.skidSoundPath,
            },
        ];

        this.audioService.preloadSounds(soundConfigs).catch(() => {
            console.warn("Failed to preload some car sounds");
        });
    }

    setInputEnabled(enabled: boolean): void {
        this.state.inputEnabled = enabled;
        if (!enabled) {
            this.state.velocity = 0;
            this.soundManager.stopEngine();
            this.soundManager.stopSkid();
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
        this.state.position = { x: position.x, y: position.y };
        this.state.rotation = position.angle * (180 / Math.PI);
        this.state.lastRotation = this.state.rotation;
        this.state.velocity = 0;
        this.state.wasOnTrack = true;
        this.soundManager.stopSkid();
    }

    private loadSprite(): void {
        if (!this.config.spriteUrl) return;

        this.carImage = new Image();
        this.carImage.onload = () => {
            this.spriteLoaded = true;
        };
        this.carImage.onerror = () => {
            this.config.useSprite = false;
        };
        this.carImage.src = this.config.spriteUrl;
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
        if (!this.state.wasOnTrack && isOnTrack) {
            this.state.wasOnTrack = true;
            this.state.keysEnabled = true;
        } else if (this.state.wasOnTrack && !isOnTrack) {
            this.state.wasOnTrack = false;
            this.state.keysEnabled = false;
            this.soundManager.playCrash();
            this.soundManager.stopSkid();
        }
    }

    private handleSoundEffects(deltaTime: number): void {
        this.soundManager.handleEngine(
            this.state.velocity,
            this.config.moveSpeed
        );
        this.soundManager.handleHorn(this.isKeyPressed(INPUT_MAPPING.HORN));
        this.soundManager.handleSkid(
            deltaTime,
            { moveSpeed: this.config.moveSpeed },
            this.state.rotation,
            this.state.lastRotation
        );
    }

    private isKeyPressed(key: string): boolean {
        return this.input.keyboard.isKeyDown(key) && this.state.keysEnabled;
    }

    private keepInBounds(): void {
        const halfWidth = this.config.carWidth / 2;
        const halfHeight = this.config.carHeight / 2;

        this.state.position.x = Math.max(
            halfWidth,
            Math.min(this.canvas.width - halfWidth, this.state.position.x)
        );
        this.state.position.y = Math.max(
            halfHeight,
            Math.min(this.canvas.height - halfHeight, this.state.position.y)
        );
    }

    render(context: FrameContext): void {
        const ctx = context.ctx;
        ctx.save();
        ctx.translate(this.state.position.x, this.state.position.y);
        ctx.rotate((this.state.rotation * Math.PI) / 180);

        if (this.config.useSprite && this.spriteLoaded && this.carImage) {
            this.renderSprite(ctx);
        } else {
            this.renderGeometricCar(ctx);
        }

        ctx.restore();
    }

    private renderGeometricCar(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.config.carColor;
        ctx.fillRect(
            -this.config.carWidth / 2,
            -this.config.carHeight / 2,
            this.config.carWidth,
            this.config.carHeight
        );

        ctx.fillStyle = "#333";
        ctx.fillRect(
            -this.config.carWidth / 2 + 5,
            -this.config.carHeight / 2 + 5,
            this.config.carWidth - 10,
            this.config.carHeight / 3
        );
    }

    private renderSprite(ctx: CanvasRenderingContext2D): void {
        if (!this.carImage) return;

        ctx.drawImage(
            this.carImage,
            -this.config.carWidth / 2,
            -this.config.carHeight / 2,
            this.config.carWidth,
            this.config.carHeight
        );
    }

    onEnter(): void {
        this.state.position = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        };
        this.state.rotation = 0;
        this.state.lastRotation = 0;
        this.state.velocity = 0;
        this.state.wasOnTrack = true;
        this.state.inputEnabled = true;
        this.soundManager.stopSkid();
    }

    onExit(): void {
        this.cleanup();
        this.soundManager.stopAll();
    }

    resize(): void {
        this.keepInBounds();
    }

    private cleanup(): void {}

    get rotation(): number {
        return this.state.rotation;
    }
}
