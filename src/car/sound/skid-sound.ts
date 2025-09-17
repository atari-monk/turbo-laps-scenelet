import type { CarModel } from "../car-model";
import type { AudioService } from "../../audio-service/type/audio-service";
import type { SoundProfileConfig } from "./type/sound-profile-config";

export enum SkidSoundProfile {
    REALISTIC = "realistic",
    COOL = "cool",
}

export class SkidSound {
    private isPlaying: boolean = false;
    private soundKey: string;
    private maxSpeed: number;

    private MIN_PITCH = 0;
    private MAX_PITCH = 0;
    private MIN_VOLUME = 0;
    private MAX_VOLUME = 0;

    private readonly SOUND_PROFILES: Record<
        SkidSoundProfile,
        SoundProfileConfig
    > = {
        [SkidSoundProfile.REALISTIC]: {
            MIN_PITCH: 0.8,
            MAX_PITCH: 1.8,
            MIN_VOLUME: 0.5,
            MAX_VOLUME: 0.5,
        },
        [SkidSoundProfile.COOL]: {
            MIN_PITCH: 4.0,
            MAX_PITCH: 0.1,
            MIN_VOLUME: 0.5,
            MAX_VOLUME: 0.5,
        },
    };

    constructor(
        private readonly carModel: CarModel,
        private readonly audioService: AudioService,
        profile: SkidSoundProfile = SkidSoundProfile.REALISTIC
    ) {
        this.soundKey = carModel.carSoundConfig.skidSoundKey;
        this.maxSpeed = carModel.carConfig.maxSpeed;
        this.setProfile(profile);
    }

    setProfile(profile: SkidSoundProfile): void {
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
        const { velocity, rotationVelocity } = this.carModel.stateContext;
        const rv = Math.abs(rotationVelocity);
        console.log(velocity > 300 && rv > 130);

        if (velocity > 350 && rv > 130 && !this.isPlaying) {
            this.start();
        } else if (velocity < 350 || rv < 130 && this.isPlaying) {
            this.stop();
        }

        if (this.isPlaying) {
            this.modulate(rotationVelocity);
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
