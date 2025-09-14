import type { GameEngine } from "zippy-game-engine";
import type { SingleSceneTestFactory } from "../factory/single-scene-test-factory";
import type { SceneId } from "./const";

export class SingleSceneSetup {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly singleSceneTestFactory: SingleSceneTestFactory
    ) {}

    async setup(sceneId: SceneId): Promise<void> {
        if (!sceneId) return;

        const scene = await this.singleSceneTestFactory.createSingleSceneTest(
            sceneId
        );
        this.gameEngine.registerScene(scene.name!, scene);
        this.gameEngine.transitionToScene(scene.name!);
    }
}
