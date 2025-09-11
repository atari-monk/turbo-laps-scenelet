import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine } from "zippy-game-engine";
import { SceneType } from "./type/scene-type";
import { MultiSceneType } from "./type/multi-scene-type";
import {
    getCanvasSizeById,
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

const urlParams = new URLSearchParams(window.location.search);
const SCENE_MODE = (urlParams.get("mode") as "all" | "current") || "current";
const SCENE_NAME =
    urlParams.get("scene") ||
    (SCENE_MODE === "all" ? MultiSceneType.GAME : SceneType.GAME);

let gameEngine: GameEngine;

let currentScene: SceneType | null = null;
let multiScene: MultiSceneType | null = null;

if (SCENE_MODE == "current" && isSceneType(SCENE_NAME)) {
    currentScene = SCENE_NAME;
} else if (
    SCENE_MODE == "all" &&
    isMultiSceneType(SCENE_NAME as MultiSceneType)
) {
    multiScene = SCENE_NAME as MultiSceneType;
} else {
    console.warn(`Unknown scene: ${SCENE_NAME}. Using default.`);
    if (SCENE_MODE === "all") {
        multiScene = MultiSceneType.GAME;
    } else {
        currentScene = SceneType.GAME;
    }
}

window.addEventListener("load", async () => {
    try {
        gameEngine = setupEngine();

        createGameCanvas("canvas-container", "game-canvas", gameEngine);
        const { canvas } = getCanvasSizeById("game-canvas");

        gameEngine.input.setupCanvasEvents(canvas);
        gameEngine.setSceneMode(SCENE_MODE);

        const instanceFactory = new SceneInstanceFactory(gameEngine, canvas);

        if (
            currentScene === SceneType.GAME ||
            multiScene === MultiSceneType.GAME
        ) {
            const menu = buildMenu(instanceFactory, gameEngine);
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
        logSceneSelection(SCENE_MODE, currentScene, multiScene);
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
