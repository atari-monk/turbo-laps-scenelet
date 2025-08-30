import type { Scene } from "zippy-game-engine";

export interface SceneArrayFactory {
    generateSceneArray(): Scene[];
}
