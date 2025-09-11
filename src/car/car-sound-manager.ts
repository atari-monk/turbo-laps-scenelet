import type { AudioService } from "../type/audio-service";
import type { CarSoundConfig } from "../car/type/car-sound-config";
import type { CarStateContext } from "./car-state-context";

export class CarSoundManager {
    constructor(
        private readonly audioService: AudioService,
        private readonly stateContext: CarStateContext,
        private soundConfig: CarSoundConfig
    ) {}

    handleEngine(velocity: number, moveSpeed: number): void {
        const isMoving = velocity !== 0;
        const shouldPlayEngine = isMoving && this.stateContext.inputEnabled;

        if (shouldPlayEngine && !this.stateContext.isEnginePlaying) {
            this.playEngine();
        } else if (!shouldPlayEngine && this.stateContext.isEnginePlaying) {
            this.stopEngine();
        }

        if (this.stateContext.isEnginePlaying) {
            const pitch = 0.5 + Math.abs(velocity) / moveSpeed;
            this.audioService.setSoundPitch(
                this.soundConfig.engineSoundKey,
                pitch
            );
        }
    }

    handleHorn(isHornKeyPressed: boolean): void {
        if (isHornKeyPressed) {
            this.audioService.playSound(this.soundConfig.hornSoundKey, {
                volume: 1.0,
                interrupt: true,
            });
        }
    }

    handleSkid(
        deltaTime: number,
        config: { moveSpeed: number },
        rotation: number,
        lastRotation: number
    ): void {
        if (!this.stateContext.inputEnabled) {
            this.stopSkid();
            return;
        }

        const speedThreshold = config.moveSpeed * 0.6;
        const rotationDelta = Math.abs(rotation - lastRotation);
        const rotationThreshold = 30 * deltaTime;

        const isHighSpeed =
            Math.abs(this.stateContext.velocity) > speedThreshold;
        const isTurning = rotationDelta > rotationThreshold;
        const isSkidding =
            isHighSpeed && isTurning && this.stateContext.velocity !== 0;

        if (isSkidding && !this.stateContext.isSkidding) {
            this.audioService.playSound(this.soundConfig.skidSoundKey, {
                volume: 0.6,
                loop: true,
            });
            this.stateContext.updateIsSkidding(true);
        } else if (!isSkidding && this.stateContext.isSkidding) {
            this.stopSkid();
        }
    }

    playEngine(): void {
        this.audioService.playSound(this.soundConfig.engineSoundKey, {
            volume: 0.5,
            loop: true,
        });
        this.stateContext.updateIsEnginePlaying(true);
    }

    stopEngine(): void {
        this.audioService.stopSound(this.soundConfig.engineSoundKey);
        this.stateContext.updateIsEnginePlaying(false);
    }

    stopSkid(): void {
        this.audioService.stopSound(this.soundConfig.skidSoundKey);
        this.stateContext.updateIsSkidding(false);
    }

    playCrash(): void {
        this.audioService.playSound(this.soundConfig.crashSoundKey, {
            volume: 0.8,
            interrupt: true,
        });
    }

    stopAll(): void {
        this.stopEngine();
        this.stopSkid();
        this.audioService.stopSound(this.soundConfig.hornSoundKey);
    }
}
