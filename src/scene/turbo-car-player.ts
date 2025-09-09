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
    maxSpeed: number;
    accelerationRate: number;
    decelerationRate: number;
    driftThreshold: number;
    controlReductionFactor: number;
    heatGenerationRate: number;
    heatDissipationRate: number;
    overheatThreshold: number;
    overheatPenaltyDuration: number;
    boostPower: number;
    boostDuration: number;
    boostCooldown: number;
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
    boostSoundKey: string;
    boostSoundPath: string;
    overheatSoundKey: string;
    overheatSoundPath: string;
}

interface VisualFeedback {
    speedBar: HTMLDivElement;
    driftIndicator: HTMLDivElement;
    heatBar: HTMLDivElement;
    boostIndicator: HTMLDivElement;
}

export class TurboCarPlayer implements IPlayer {
    name?: string = "Turbo-Car-Player";
    displayName?: string = "Turbo Car Player";
    private trackBoundary?: ITrackBoundary;
    private startingGrid?: IStartingGrid;
    private inputEnabled: boolean = false;
    private carImage?: HTMLImageElement;
    private spriteLoaded: boolean = false;
    private visualFeedback: VisualFeedback;

    private config: CarConfig = {
        carWidth: 50,
        carHeight: 110,
        carColor: "red",
        moveSpeed: 700,
        turnSpeed: 200,
        useSprite: true,
        spriteUrl: "assets/sprite/race_car.png",
        allowStationaryTurning: false,
        maxSpeed: 1200,
        accelerationRate: 400,
        decelerationRate: 300,
        driftThreshold: 600,
        controlReductionFactor: 0.6,
        heatGenerationRate: 0.8,
        heatDissipationRate: 0.5,
        overheatThreshold: 100,
        overheatPenaltyDuration: 3000,
        boostPower: 1500,
        boostDuration: 1000,
        boostCooldown: 5000,
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
        boostSoundKey: "car-boost",
        boostSoundPath: "/assets/audio/car-boost.wav",
        overheatSoundKey: "car-overheat",
        overheatSoundPath: "/assets/audio/car-overheat.wav",
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
        keysEnabled: true,
        currentHeat: 0,
        isOverheated: false,
        overheatTimer: 0,
        isBoosting: false,
        boostTimer: 0,
        boostCooldownTimer: 0,
        canBoost: true,
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
        this.visualFeedback = this.createVisualFeedback();
    }

    private createVisualFeedback(): VisualFeedback {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        container.style.zIndex = "1000";

        const speedBar = this.createStatusBar("Speed", "blue");
        const driftIndicator = this.createStatusBar("Drift", "orange");
        const heatBar = this.createStatusBar("Heat", "red");
        const boostIndicator = this.createStatusBar("Boost", "purple");

        container.appendChild(speedBar);
        container.appendChild(driftIndicator);
        container.appendChild(heatBar);
        container.appendChild(boostIndicator);

        document.body.appendChild(container);

        return { speedBar, driftIndicator, heatBar, boostIndicator };
    }

    private createStatusBar(label: string, color: string): HTMLDivElement {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.gap = "10px";

        const labelElement = document.createElement("span");
        labelElement.textContent = label;
        labelElement.style.color = "white";
        labelElement.style.fontFamily = "Arial";
        labelElement.style.fontSize = "14px";
        labelElement.style.width = "50px";

        const barContainer = document.createElement("div");
        barContainer.style.width = "100px";
        barContainer.style.height = "10px";
        barContainer.style.backgroundColor = "#333";
        barContainer.style.borderRadius = "5px";
        barContainer.style.overflow = "hidden";

        const bar = document.createElement("div");
        bar.style.width = "0%";
        bar.style.height = "100%";
        bar.style.backgroundColor = color;
        bar.style.transition = "width 0.1s ease";

        barContainer.appendChild(bar);
        container.appendChild(labelElement);
        container.appendChild(barContainer);

        return bar;
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
            {
                key: this.soundConfig.boostSoundKey,
                path: this.soundConfig.boostSoundPath,
            },
            {
                key: this.soundConfig.overheatSoundKey,
                path: this.soundConfig.overheatSoundPath,
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
        this.state.currentHeat = 0;
        this.state.isOverheated = false;
        this.state.overheatTimer = 0;
        this.state.isBoosting = false;
        this.state.boostTimer = 0;
        this.state.boostCooldownTimer = 0;
        this.state.canBoost = true;
        this.stopSkidSound();
        this.updateVisualFeedback();
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
        this.handleHeatSystem(context.deltaTime);
        this.handleBoostSystem(context.deltaTime);
        this.handleSoundEffects(context.deltaTime);
        this.updateVisualFeedback();

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

    private handleHeatSystem(deltaTime: number): void {
        if (this.state.isOverheated) {
            this.state.overheatTimer += deltaTime;
            if (
                this.state.overheatTimer >= this.config.overheatPenaltyDuration
            ) {
                this.state.isOverheated = false;
                this.state.overheatTimer = 0;
                this.state.currentHeat = 0;
            }
            return;
        }

        const isAccelerating =
            this.input.keyboard.isKeyDown("ArrowUp") && this.state.keysEnabled;

        if (isAccelerating && Math.abs(this.state.velocity) > 0) {
            this.state.currentHeat +=
                this.config.heatGenerationRate * deltaTime;
        } else {
            this.state.currentHeat -=
                this.config.heatDissipationRate * deltaTime;
        }

        this.state.currentHeat = Math.max(
            0,
            Math.min(this.config.overheatThreshold, this.state.currentHeat)
        );

        if (this.state.currentHeat >= this.config.overheatThreshold) {
            this.state.isOverheated = true;
            this.audioService.playSound(this.soundConfig.overheatSoundKey, {
                volume: 0.8,
                interrupt: true,
            });
        }
    }

    private handleBoostSystem(deltaTime: number): void {
        if (this.state.isBoosting) {
            this.state.boostTimer += deltaTime;
            if (this.state.boostTimer >= this.config.boostDuration) {
                this.state.isBoosting = false;
                this.state.boostTimer = 0;
                this.state.canBoost = false;
                this.state.boostCooldownTimer = 0;
            }
        }

        if (!this.state.canBoost) {
            this.state.boostCooldownTimer += deltaTime;
            if (this.state.boostCooldownTimer >= this.config.boostCooldown) {
                this.state.canBoost = true;
                this.state.boostCooldownTimer = 0;
            }
        }

        if (
            this.state.keysEnabled &&
            this.input.keyboard.isKeyDown("Shift") &&
            this.state.canBoost &&
            !this.state.isBoosting
        ) {
            this.activateBoost();
        }
    }

    private activateBoost(): void {
        this.state.isBoosting = true;
        this.state.canBoost = false;
        this.audioService.playSound(this.soundConfig.boostSoundKey, {
            volume: 0.7,
            interrupt: true,
        });
    }

    private updateVisualFeedback(): void {
        const speedPercentage =
            (Math.abs(this.state.velocity) / this.config.maxSpeed) * 100;
        const heatPercentage =
            (this.state.currentHeat / this.config.overheatThreshold) * 100;
        const isDrifting =
            Math.abs(this.state.velocity) > this.config.driftThreshold;
        const boostPercentage = this.state.canBoost
            ? 100
            : (this.state.boostCooldownTimer / this.config.boostCooldown) * 100;

        this.visualFeedback.speedBar.style.width = `${Math.min(
            100,
            speedPercentage
        )}%`;
        this.visualFeedback.driftIndicator.style.width = isDrifting
            ? "100%"
            : "0%";
        this.visualFeedback.driftIndicator.style.backgroundColor = isDrifting
            ? "orange"
            : "#333";
        this.visualFeedback.heatBar.style.width = `${heatPercentage}%`;
        this.visualFeedback.heatBar.style.backgroundColor = this.state
            .isOverheated
            ? "darkred"
            : "red";
        this.visualFeedback.boostIndicator.style.width = `${boostPercentage}%`;
        this.visualFeedback.boostIndicator.style.backgroundColor = this.state
            .isBoosting
            ? "cyan"
            : "purple";
    }

    private handleTrackStateChange(isOnTrack: boolean): void {
        if (!this.state.wasOnTrack && isOnTrack) {
            this.state.wasOnTrack = true;
            this.state.keysEnabled = true;
        } else if (this.state.wasOnTrack && !isOnTrack) {
            this.state.wasOnTrack = false;
            this.state.keysEnabled = false;
            this.playCrashSound();
            this.stopSkidSound();
        }
    }

    private handleMovement(deltaTime: number): void {
        if (!this.inputEnabled || this.state.isOverheated) return;

        const previousVelocity = this.state.velocity;
        const previousRotation = this.state.rotation;

        if (this.state.keysEnabled) {
            this.handleAcceleration(deltaTime);
            this.handleSteering(deltaTime);
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

    private handleAcceleration(deltaTime: number): void {
        const isAccelerating = this.input.keyboard.isKeyDown("ArrowUp");
        const isBraking = this.input.keyboard.isKeyDown("ArrowDown");
        const isHandbrake = this.input.keyboard.isKeyDown(" ");

        let targetSpeed = this.state.velocity;

        if (this.state.isBoosting) {
            targetSpeed =
                Math.sign(this.state.velocity) * this.config.boostPower;
        } else if (isAccelerating) {
            targetSpeed += this.config.accelerationRate * deltaTime;
        } else if (isBraking) {
            targetSpeed -= this.config.decelerationRate * deltaTime * 2;
        } else if (isHandbrake) {
            targetSpeed *= 0.85;
        } else {
            targetSpeed *= 0.95;
        }

        const speedLimit = this.state.isBoosting
            ? this.config.boostPower
            : this.config.maxSpeed;
        this.state.velocity = Math.max(
            -speedLimit * 0.3,
            Math.min(speedLimit, targetSpeed)
        );
    }

    private handleSteering(deltaTime: number): void {
        const canTurn =
            this.config.allowStationaryTurning || this.state.velocity !== 0;

        if (canTurn) {
            let turnSpeed = this.config.turnSpeed;

            if (Math.abs(this.state.velocity) > this.config.driftThreshold) {
                const speedFactor =
                    Math.abs(this.state.velocity) / this.config.maxSpeed;
                turnSpeed *= 1 + (speedFactor - 0.5) * 0.8;

                if (
                    Math.abs(this.state.rotation - this.state.lastRotation) > 5
                ) {
                    this.state.velocity *= 0.98;
                }
            }

            if (
                Math.abs(this.state.velocity) >
                this.config.driftThreshold * 1.2
            ) {
                turnSpeed *= this.config.controlReductionFactor;
            }

            if (this.input.keyboard.isKeyDown("ArrowLeft")) {
                this.state.rotation -= turnSpeed * deltaTime;
            }
            if (this.input.keyboard.isKeyDown("ArrowRight")) {
                this.state.rotation += turnSpeed * deltaTime;
            }
        }
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
                0.5 + Math.abs(this.state.velocity) / this.config.maxSpeed;
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

        const speedThreshold = this.config.driftThreshold;
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

        if (this.state.isBoosting) {
            this.renderBoostEffect(ctx);
        }

        if (this.state.isOverheated) {
            this.renderOverheatEffect(ctx);
        }

        ctx.restore();
    }

    private renderBoostEffect(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.ellipse(
            0,
            this.config.carHeight / 2 + 10,
            30,
            15,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    private renderOverheatEffect(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(
            -this.config.carWidth / 2,
            -this.config.carHeight / 2,
            this.config.carWidth,
            this.config.carHeight
        );
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
        this.state.currentHeat = 0;
        this.state.isOverheated = false;
        this.state.overheatTimer = 0;
        this.state.isBoosting = false;
        this.state.boostTimer = 0;
        this.state.boostCooldownTimer = 0;
        this.state.canBoost = true;
        this.stopSkidSound();
        this.updateVisualFeedback();
    }

    onExit(): void {
        this.cleanup();
        this.stopAllSounds();
    }

    private stopAllSounds(): void {
        this.stopEngineSound();
        this.stopSkidSound();
        this.audioService.stopSound(this.soundConfig.hornSoundKey);
        this.audioService.stopSound(this.soundConfig.boostSoundKey);
    }

    resize(): void {
        this.keepInBounds();
    }

    private cleanup(): void {
        if (this.visualFeedback.speedBar.parentElement) {
            this.visualFeedback.speedBar.parentElement.remove();
        }
    }

    get rotation(): number {
        return this.state.rotation;
    }
}
