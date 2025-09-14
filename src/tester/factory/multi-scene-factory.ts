import type { GameEngine } from "zippy-game-engine";
import type { CarFactory } from "../../car/car-factory";
import { MultiSceneTestFactory } from "../../factory/multi-scene-test-factory";
import type { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { MultiSceneSetup } from "../multi-scene-setup";
import type { MultiSceneId } from "../const";

export function multiSceneFactory(
    canvas: HTMLCanvasElement,
    sceneInstanceFactory: SceneInstanceFactory,
    carFactory: CarFactory,
    gameEngine: GameEngine,
    multiSceneId: MultiSceneId
) {
    const multiSceneTestFactory = new MultiSceneTestFactory(
        canvas,
        sceneInstanceFactory,
        carFactory
    );

    const multiSceneSetup = new MultiSceneSetup(
        gameEngine,
        multiSceneTestFactory
    );

    multiSceneSetup.setup(multiSceneId);
}
