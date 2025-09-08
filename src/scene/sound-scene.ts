import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { AudioService } from "../type/audio-service";
import type { SoundConfig } from "../type/sound-config";
import { delay } from "../tools";

export class SoundScene implements Scene {
    private soundConfigs: SoundConfig[] = [
        { key: "background-music", path: "/assets/audio/background.mp3" },
        { key: "click-sound", path: "/assets/audio/click.wav" },
        { key: "effect-sound", path: "/assets/audio/effect.mp3" },
    ];

    displayName = "Sound Demonstration Scene";

    constructor(
        private readonly audioService: AudioService,
        private readonly input: InputSystem
    ) {}

    async init(): Promise<void> {
        try {
            await this.audioService.preloadSounds(this.soundConfigs);
            console.log("All sounds preloaded successfully");
        } catch (error) {
            console.error("Failed to preload sounds:", error);
        }
    }

    async onEnter(): Promise<void> {
        await delay(2000);
        this.audioService.playSound("background-music", {
            volume: 1,
            loop: true,
        });
    }

    onExit(): void {
        this.audioService.stopSound("background-music");
        this.audioService.stopSound("click-sound");
        this.audioService.stopSound("effect-sound");
    }

    update(_context: FrameContext): void {
        if (this.input.keyboard.isKeyDown(" ")) {
            this.audioService.playSound("click-sound", {
                volume: 0.5,
                onEnd: () => console.log("Click sound finished playing"),
            });
        }

        if (this.input.keyboard.isKeyDown("e")) {
            this.audioService.playSound("effect-sound", {
                volume: 0.5,
            });
        }
    }

    render(context: FrameContext): void {
        const { ctx, width, height } = context;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText(
            "Sound Scene - Press SPACE for click sound, E for effect",
            50,
            50
        );
        ctx.font = "16px Arial";
        ctx.fillText("Background music is playing on loop", 50, 80);
    }

    resize(): void {
        console.log("Sound scene resized");
    }

    setSoundConfigs(sounds: SoundConfig[]): void {
        this.soundConfigs = sounds;
    }
}
