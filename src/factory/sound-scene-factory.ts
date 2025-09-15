import type { InputSystem, Scene } from "zippy-game-engine";
import type { AudioService } from "../audio-service/type/audio-service";
import type { SoundConfig } from "../audio-service/type/sound-config";
import { SoundScene } from "../scene/sound-scene";

export class SoundSceneFactory {
    static createSoundScene(
        audioService: AudioService,
        input: InputSystem
    ): Scene {
        return new SoundScene(audioService, input);
    }

    static createSoundSceneWithCustomSounds(
        sounds: SoundConfig[],
        audioService: AudioService,
        input: InputSystem
    ): Scene {
        const scene = new SoundScene(audioService, input);
        scene.setSoundConfigs(sounds);
        return scene;
    }
}
