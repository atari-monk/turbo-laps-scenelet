import type { AudioService } from "../audio-service/type/audio-service";
import type { CarSoundConfig } from "../car/type/car-sound-config";
import type { CarStateContext } from "./car-state-context";
import type { CarConfig } from "./type/car-config";

export class CarSoundManager {
    constructor(
        private readonly audioService: AudioService,
        private readonly stateContext: CarStateContext,
        private readonly carConfig: CarConfig,
        private soundConfig: CarSoundConfig
    ) {}

    handleEngine(): void {
        console.log(this.stateContext.velocity);
        const isMoving = this.stateContext.velocity !== 0;
        const shouldPlayEngine = isMoving && this.stateContext.inputEnabled;

        const startEngineSound =
            shouldPlayEngine && !this.stateContext.isEnginePlaying;
        const stopEngineSound =
            !shouldPlayEngine && this.stateContext.isEnginePlaying;

        if (startEngineSound) this.playEngine();
        else if (stopEngineSound) this.stopEngine();

        if (this.stateContext.isEnginePlaying) {
            const pitch =
                0.5 +
                Math.abs(this.stateContext.velocity) / this.carConfig.maxSpeed;
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
        // if (!this.stateContext.inputEnabled) {
        //     this.stopSkid();
        //     return;
        // }

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
                volume: 0.3,
                loop: false,
            });
            this.stateContext.updateIsSkidding(false);
        }
        // else if (!isSkidding && this.stateContext.isSkidding) {
        //     this.stopSkid();
        // }
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
