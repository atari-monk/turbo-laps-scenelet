import type { AudioService } from "../type/audio-service";
import type { CarSoundConfig } from "../car/type/car-sound-config";
import type { CarState } from "../car/type/car-state";

export class CarSoundManager {
    constructor(
        private audioService: AudioService,
        private soundConfig: CarSoundConfig,
        private state: CarState
    ) {}

    handleEngine(velocity: number, moveSpeed: number): void {
        const isMoving = velocity !== 0;
        const shouldPlayEngine = isMoving && this.state.inputEnabled;

        if (shouldPlayEngine && !this.state.isEnginePlaying) {
            this.playEngine();
        } else if (!shouldPlayEngine && this.state.isEnginePlaying) {
            this.stopEngine();
        }

        if (this.state.isEnginePlaying) {
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
        if (!this.state.inputEnabled) {
            this.stopSkid();
            return;
        }

        const speedThreshold = config.moveSpeed * 0.6;
        const rotationDelta = Math.abs(rotation - lastRotation);
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
            this.stopSkid();
        }
    }

    playEngine(): void {
        this.audioService.playSound(this.soundConfig.engineSoundKey, {
            volume: 0.5,
            loop: true,
        });
        this.state.isEnginePlaying = true;
    }

    stopEngine(): void {
        this.audioService.stopSound(this.soundConfig.engineSoundKey);
        this.state.isEnginePlaying = false;
    }

    stopSkid(): void {
        this.audioService.stopSound(this.soundConfig.skidSoundKey);
        this.state.isSkidding = false;
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
