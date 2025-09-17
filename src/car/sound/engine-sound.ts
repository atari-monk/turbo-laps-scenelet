import type { CarModel } from "../car-model";
import type { AudioService } from "../../audio-service/type/audio-service";

export enum EngineSoundProfile {
    REALISTIC = "realistic",
    COOL = "cool",
    SPORTS = "sports",
    ELECTRIC = "electric",
}

interface SoundProfileConfig {
    MIN_PITCH: number;
    MAX_PITCH: number;
    MIN_VOLUME: number;
    MAX_VOLUME: number;
}

export class EngineSound {
    private isPlaying: boolean = false;
    private soundKey: string;
    private maxSpeed: number;

    private MIN_PITCH = 0;
    private MAX_PITCH = 0;
    private MIN_VOLUME = 0;
    private MAX_VOLUME = 0;

    private readonly SOUND_PROFILES: Record<
        EngineSoundProfile,
        SoundProfileConfig
    > = {
        [EngineSoundProfile.REALISTIC]: {
            MIN_PITCH: 0.8,
            MAX_PITCH: 1.8,
            MIN_VOLUME: 0.1,
            MAX_VOLUME: 1.0,
        },
        [EngineSoundProfile.COOL]: {
            MIN_PITCH: 4.0,
            MAX_PITCH: 0.1,
            MIN_VOLUME: 0.1,
            MAX_VOLUME: 1.0,
        },
        [EngineSoundProfile.SPORTS]: {
            MIN_PITCH: 1.0,
            MAX_PITCH: 2.2,
            MIN_VOLUME: 0.2,
            MAX_VOLUME: 1.0,
        },
        [EngineSoundProfile.ELECTRIC]: {
            MIN_PITCH: 1.5,
            MAX_PITCH: 3.0,
            MIN_VOLUME: 0.1,
            MAX_VOLUME: 0.8,
        },
    };

    constructor(
        private readonly carModel: CarModel,
        private readonly audioService: AudioService,
        profile: EngineSoundProfile = EngineSoundProfile.COOL
    ) {
        this.soundKey = carModel.carSoundConfig.engineSoundKey;
        this.maxSpeed = carModel.carConfig.maxSpeed;
        this.setProfile(profile);
    }

    setProfile(profile: EngineSoundProfile): void {
        const config = this.SOUND_PROFILES[profile];
        this.MIN_PITCH = config.MIN_PITCH;
        this.MAX_PITCH = config.MAX_PITCH;
        this.MIN_VOLUME = config.MIN_VOLUME;
        this.MAX_VOLUME = config.MAX_VOLUME;
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    update(): void {
        const { velocity, inputEnabled } = this.carModel.stateContext;

        const shouldPlay = velocity !== 0 && inputEnabled;

        if (shouldPlay && !this.isPlaying) {
            this.start();
        } else if (!shouldPlay && this.isPlaying) {
            this.stop();
        }

        if (this.isPlaying) {
            this.modulate(velocity);
        }
    }

    start(): void {
        this.audioService.play(this.soundKey, {
            volume: this.MIN_VOLUME,
            loop: true,
        });
        this.isPlaying = true;
    }

    stop(): void {
        this.audioService.stop(this.soundKey);
        this.isPlaying = false;
    }

    private modulate(velocity: number) {
        const effectiveVelocity = Math.min(Math.abs(velocity), this.maxSpeed);
        const ratio = effectiveVelocity / this.maxSpeed;

        this.modulateVolume(ratio);
        this.modulatePitch(ratio);
    }

    private modulateVolume(ratio: number) {
        const easedRatio = Math.pow(ratio, 0.7);
        const volume =
            this.MIN_VOLUME + (this.MAX_VOLUME - this.MIN_VOLUME) * easedRatio;
        this.audioService.setVolume(this.soundKey, volume);
    }

    private modulatePitch(ratio: number) {
        this.audioService.setSoundPitch(
            this.soundKey,
            this.MIN_PITCH + (this.MAX_PITCH - this.MIN_PITCH) * ratio
        );
    }
}
