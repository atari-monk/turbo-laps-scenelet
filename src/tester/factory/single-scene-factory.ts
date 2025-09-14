import type { GameEngine } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { SingleSceneTestFactory } from "../../factory/single-scene-test-factory";
import { SingleSceneSetup } from "../single-scene-setup";
import type { SceneId } from "../const";

export function singleSceneFactory(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement,
    sceneInstanceFactory: SceneInstanceFactory,
    sceneId: SceneId
) {
    const singleSceneSetup = new SingleSceneSetup(
        gameEngine,
        new SingleSceneTestFactory(canvas, gameEngine, sceneInstanceFactory)
    );

    singleSceneSetup.setup(sceneId);
}
