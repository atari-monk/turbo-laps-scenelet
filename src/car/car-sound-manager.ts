import type { AudioService } from "../type/audio-service";
import type { CarSoundConfig } from "../car/type/car-sound-config";
import type { CarState } from "../car/type/car-state";

export class CarSoundManager {
    constructor(private readonly audioService: AudioService) {}

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
                this._soundConfig.engineSoundKey,
                pitch
            );
        }
    }

    handleHorn(isHornKeyPressed: boolean): void {
        if (isHornKeyPressed) {
            this.audioService.playSound(this._soundConfig.hornSoundKey, {
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
            this.audioService.playSound(this._soundConfig.skidSoundKey, {
                volume: 0.6,
                loop: true,
            });
            this.state.isSkidding = true;
        } else if (!isSkidding && this.state.isSkidding) {
            this.stopSkid();
        }
    }

    playEngine(): void {
        this.audioService.playSound(this._soundConfig.engineSoundKey, {
            volume: 0.5,
            loop: true,
        });
        this.state.isEnginePlaying = true;
    }

    stopEngine(): void {
        this.audioService.stopSound(this._soundConfig.engineSoundKey);
        this.state.isEnginePlaying = false;
    }

    stopSkid(): void {
        this.audioService.stopSound(this._soundConfig.skidSoundKey);
        this.state.isSkidding = false;
    }

    playCrash(): void {
        this.audioService.playSound(this._soundConfig.crashSoundKey, {
            volume: 0.8,
            interrupt: true,
        });
    }

    stopAll(): void {
        this.stopEngine();
        this.stopSkid();
        this.audioService.stopSound(this._soundConfig.hornSoundKey);
    }

    set soundConfig(value: CarSoundConfig) {
        this._soundConfig = value;
    }

    set carState(value: CarState) {
        this.state = value;
    }

    private _soundConfig!: CarSoundConfig;
    private state!: CarState;
}
