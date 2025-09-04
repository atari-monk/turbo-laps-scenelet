import { MultiSceneType } from "../types/multi-scene-type";
import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";

export class MultiSceneTestFactory {
    constructor(private readonly factory: SceneInstanceFactory) {}

    public createMultiSceneTest(sceneType: MultiSceneType): Scene[] {
        if (sceneType === MultiSceneType.TRACK_CURSOR) {
            return [
                this.factory.createRectangleTrack(),
                this.factory.createMouseCursor(),
            ];
        }
        throw new Error(`Unknown multi-scene type: ${sceneType}`);
    }
}
