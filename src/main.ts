import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine } from "zippy-game-engine";
import { SceneType } from "./type/scene-type";
import { MultiSceneType } from "./type/multi-scene-type";
import {
    getCanvasSizeById,
    isGameType,
    isMultiSceneType,
    isSceneType,
    logSceneSelection,
    logTestUrls,
    setupEngine,
} from "./tools";
import { MultiSceneTestFactory } from "./factory/multi-scene-test-factory";
import { SingleSceneTestFactory } from "./factory/single-scene-test-factory";
import { SceneInstanceFactory } from "./factory/scene-instance-factory";
import { buildMenu } from "./builder/menu-builder";
import type { GameType } from "./type/game-type";

const urlParams = new URLSearchParams(window.location.search);
const SCENE_MODE =
    (urlParams.get("mode") as "current" | "all" | "game") || "current";
const SCENE_NAME = urlParams.get("scene") || SceneType.ELIPSE_TRACK;

let gameEngine: GameEngine;

let currentScene: SceneType | null = null;
let multiScene: MultiSceneType | null = null;
let gameType: GameType | null = null;

if (urlParams.size > 0 && SCENE_MODE == "current" && isSceneType(SCENE_NAME)) {
    currentScene = SCENE_NAME;
} else if (
    urlParams.size > 0 &&
    SCENE_MODE == "all" &&
    isMultiSceneType(SCENE_NAME as MultiSceneType)
) {
    multiScene = SCENE_NAME as MultiSceneType;
} else if (
    urlParams.size > 0 &&
    SCENE_MODE === "all" &&
    isGameType(SCENE_NAME as GameType)
) {
    gameType = SCENE_NAME as GameType;
} else {
    console.warn(`No params, using default scene: ${SCENE_NAME}.`);
    currentScene = SceneType.ELIPSE_TRACK;
}

window.addEventListener("load", async () => {
    try {
        gameEngine = setupEngine();

        createGameCanvas("canvas-container", "game-canvas", gameEngine);
        const { canvas } = getCanvasSizeById("game-canvas");

        gameEngine.input.setupCanvasEvents(canvas);
        gameEngine.setSceneMode(SCENE_MODE as any);

        const instanceFactory = new SceneInstanceFactory(gameEngine, canvas);

        if (gameType) {
            const menu = buildMenu(instanceFactory, gameEngine, gameType);
            gameEngine.registerScene(menu.name!, menu);
            gameEngine.transitionToScene(menu.name!);
        } else if (currentScene) {
            const factory = new SingleSceneTestFactory(
                canvas,
                gameEngine,
                instanceFactory
            );
            const scene = await factory.createSingleSceneTest(currentScene);
            gameEngine.registerScene(scene.name!, scene);
            gameEngine.transitionToScene(scene.name!);
        } else if (multiScene) {
            const factory = new MultiSceneTestFactory(canvas, instanceFactory);
            const scenes = await factory.createMultiSceneTest(multiScene);
            scenes.forEach((scene) => {
                gameEngine.registerScene(scene.name!, scene);
            });
        }

        logTestUrls();
        logSceneSelection(SCENE_MODE, currentScene, multiScene, gameType);
    } catch (error) {
        console.error("Failed to initialize:", error);
    }
});
