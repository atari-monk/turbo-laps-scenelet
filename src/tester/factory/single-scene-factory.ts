import type { GameEngine } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { SingleSceneTestFactory } from "../../factory/single-scene-test-factory";
import { SingleSceneSetup } from "../single-scene-setup";
import type { SceneId } from "../const";
import type { CarFactory } from "../../car/car-factory";

export function singleSceneFactory(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement,
    sceneInstanceFactory: SceneInstanceFactory,
    carFactory: CarFactory,
    sceneId: SceneId
) {
    const singleSceneSetup = new SingleSceneSetup(
        gameEngine,
        new SingleSceneTestFactory(
            canvas,
            gameEngine,
            sceneInstanceFactory,
            carFactory
        )
    );

    singleSceneSetup.setup(sceneId);
}
