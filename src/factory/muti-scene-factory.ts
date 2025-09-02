import { MultiSceneType } from "../types/multi-scene-type";
import type { GameEngine, Scene } from "zippy-game-engine";
import { SceneType } from "../types/scene-type";
import { singleSceneFactory } from "./single-scene-factory";

export function multiSceneFactory(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement,
    sceneType: MultiSceneType
): Scene[] {
    if (sceneType === MultiSceneType.TRACK_CURSOR)
        return [
            singleSceneFactory(gameEngine, canvas, SceneType.RECTANGLE_TRACK),
            singleSceneFactory(gameEngine, canvas, SceneType.MOUSE_CURSOR),
        ];
    return [];
}
