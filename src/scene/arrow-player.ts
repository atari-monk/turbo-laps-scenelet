import type { FrameContext } from "zippy-shared-lib";
import type { Scene, InputSystem } from "zippy-game-engine";
import type { ITrackBoundary } from "./track-boundary";
import type { IStartingGrid } from "./starting-grid";
import type { AudioService } from "../type/audio-service";
import type { SoundConfig } from "../type/sound-config";

export interface IPlayer extends Scene {
    get velocity(): number;
    set velocity(value: number);
    get position(): { x: number; y: number };
    setInputEnabled(enabled: boolean): void;
    setStartingPosition(position: {
        x: number;
        y: number;
        angle: number;
    }): void;
    setTrackBoundary(trackBoundary: ITrackBoundary): void;
    setStartingGrid(startingGrid: IStartingGrid): void;
}

interface CarConfig {
    carWidth: number;
    carHeight: number;
    carColor: string;
    moveSpeed: number;
    turnSpeed: number;
    useSprite: boolean;
    spriteUrl?: string;
    allowStationaryTurning: boolean;
}

interface CarSoundConfig {
    engineSoundKey: string;
    engineSoundPath: string;
    crashSoundKey: string;
    crashSoundPath: string;
    hornSoundKey: string;
    hornSoundPath: string;
    skidSoundKey: string;
    skidSoundPath: string;
}

export class ArrowPlayer implements IPlayer {
    name?: string = "Arrow-Player";
    displayName?: string = "Arrow Player";
    private trackBoundary?: ITrackBoundary;
    private startingGrid?: IStartingGrid;
    private inputEnabled: boolean = false;
    private carImage?: HTMLImageElement;
    private spriteLoaded: boolean = false;

    private config: CarConfig = {
        carWidth: 50,
        carHeight: 110,
        carColor: "red",
        moveSpeed: 300,
        turnSpeed: 180,
        useSprite: true,
        spriteUrl: "assets/sprite/race_car.png",
        allowStationaryTurning: false,
    };

    private soundConfig: CarSoundConfig = {
        engineSoundKey: "car-engine",
        engineSoundPath: "/assets/audio/car-engine.wav",
        crashSoundKey: "car-crash",
        crashSoundPath: "/assets/audio/car-crash.wav",
        hornSoundKey: "car-horn",
        hornSoundPath: "/assets/audio/car-horn.wav",
        skidSoundKey: "car-skid",
        skidSoundPath: "/assets/audio/car-skid.wav",
    };

    private state = {
        position: { x: 0, y: 0 },
        rotation: 0,
        velocity: 0,
        isEnginePlaying: false,
        isSkidding: false,
        lastVelocity: 0,
        wasOnTrack: true,
        lastRotation: 0,
        inputEnabled: true,
    };

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
        this.loadSprite();
        this.preloadCarSounds();
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
        this.inputEnabled = enabled;
        this.state.inputEnabled = enabled;
        if (!enabled) {
            this.state.velocity = 0;
            this.stopEngineSound();
            this.stopSkidSound();
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
        this.stopSkidSound();
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
        this.handleMovement(context.deltaTime);
        this.handleSoundEffects(context.deltaTime);

        if (this.trackBoundary) {
            const isOnTrack = this.trackBoundary.checkCarOnTrack(
                this,
                this.startingGrid!,
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
        } else if (this.state.wasOnTrack && !isOnTrack) {
            this.state.wasOnTrack = false;
            this.playCrashSound();
            this.stopSkidSound();
        }
    }

    private handleMovement(deltaTime: number): void {
        if (!this.inputEnabled) return;

        const previousVelocity = this.state.velocity;
        const previousRotation = this.state.rotation;

        if (this.input.keyboard.isKeyDown("ArrowUp")) {
            this.state.velocity = this.config.moveSpeed;
        } else if (this.input.keyboard.isKeyDown("ArrowDown")) {
            this.state.velocity = -this.config.moveSpeed * 0.5;
        } else if (this.input.keyboard.isKeyDown(" ")) {
            this.state.velocity = 0;
        }

        const canTurn =
            this.config.allowStationaryTurning || this.state.velocity !== 0;

        if (canTurn) {
            if (this.input.keyboard.isKeyDown("ArrowLeft")) {
                this.state.rotation -= this.config.turnSpeed * deltaTime;
            }
            if (this.input.keyboard.isKeyDown("ArrowRight")) {
                this.state.rotation += this.config.turnSpeed * deltaTime;
            }
        }

        this.state.rotation = ((this.state.rotation % 360) + 360) % 360;

        if (this.state.velocity !== 0) {
            const radians = (this.state.rotation * Math.PI) / 180;
            this.state.position.x +=
                Math.sin(radians) * this.state.velocity * deltaTime;
            this.state.position.y +=
                -Math.cos(radians) * this.state.velocity * deltaTime;
        }

        this.state.lastVelocity = previousVelocity;
        this.state.lastRotation = previousRotation;
    }

    private handleSoundEffects(deltaTime: number): void {
        this.handleEngineSound();
        this.handleHornSound();
        this.handleSkidSound(deltaTime);
    }

    private handleEngineSound(): void {
        const isMoving = this.state.velocity !== 0;
        const shouldPlayEngine = isMoving && this.inputEnabled;

        if (shouldPlayEngine && !this.state.isEnginePlaying) {
            this.playEngineSound();
        } else if (!shouldPlayEngine && this.state.isEnginePlaying) {
            this.stopEngineSound();
        }

        if (this.state.isEnginePlaying) {
            const pitch =
                0.5 + Math.abs(this.state.velocity) / this.config.moveSpeed;
            this.audioService.setSoundPitch(
                this.soundConfig.engineSoundKey,
                pitch
            );
        }
    }

    private handleHornSound(): void {
        if (this.input.keyboard.isKeyDown("h")) {
            this.audioService.playSound(this.soundConfig.hornSoundKey, {
                volume: 1.0,
                interrupt: true,
            });
        }
    }

    private handleSkidSound(deltaTime: number): void {
        if (!this.state.inputEnabled) {
            this.stopSkidSound();
            return;
        }

        const speedThreshold = this.config.moveSpeed * 0.6;
        const rotationDelta = Math.abs(
            this.state.rotation - this.state.lastRotation
        );
        const rotationThreshold = 30 * deltaTime;

        const isHighSpeed = Math.abs(this.state.velocity) > speedThreshold;
        const isTurning = rotationDelta > rotationThreshold;
        const isSkidding =
            isHighSpeed && isTurning && this.state.velocity !== 0;

        if (isSkidding && !this.state.isSkidding) {
            this.audioService.playSound(this.soundConfig.skidSoundKey, {
                volume: 0.6,
                loop: true,
            });
            this.state.isSkidding = true;
        } else if (!isSkidding && this.state.isSkidding) {
            this.stopSkidSound();
        }
    }

    private playEngineSound(): void {
        this.audioService.playSound(this.soundConfig.engineSoundKey, {
            volume: 0.5,
            loop: true,
        });
        this.state.isEnginePlaying = true;
    }

    private stopEngineSound(): void {
        this.audioService.stopSound(this.soundConfig.engineSoundKey);
        this.state.isEnginePlaying = false;
    }

    private stopSkidSound(): void {
        this.audioService.stopSound(this.soundConfig.skidSoundKey);
        this.state.isSkidding = false;
    }

    public playCrashSound(): void {
        this.audioService.playSound(this.soundConfig.crashSoundKey, {
            volume: 0.8,
            interrupt: true,
        });
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
        this.stopSkidSound();
    }

    onExit(): void {
        this.cleanup();
        this.stopAllSounds();
    }

    private stopAllSounds(): void {
        this.stopEngineSound();
        this.stopSkidSound();
        this.audioService.stopSound(this.soundConfig.hornSoundKey);
    }

    resize(): void {
        this.keepInBounds();
    }

    private cleanup(): void {}

    get rotation(): number {
        return this.state.rotation;
    }
}
