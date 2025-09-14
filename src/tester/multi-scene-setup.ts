import type { GameEngine } from "zippy-game-engine";
import type { MultiSceneId } from "./const";
import type { MultiSceneTestFactory } from "../factory/multi-scene-test-factory";

export class MultiSceneSetup {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly multiSceneTestFactory: MultiSceneTestFactory
    ) {}

    async setup(multiSceneId: MultiSceneId): Promise<void> {
        if (!multiSceneId) return;
        const scenes = await this.multiSceneTestFactory.createMultiSceneTest(
            multiSceneId
        );
        scenes.forEach((scene) => {
            this.gameEngine.registerScene(scene.name!, scene);
        });
    }
}
