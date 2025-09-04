import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine } from "zippy-game-engine";
import { SceneType } from "./types/scene-type";
import { MultiSceneType } from "./types/multi-scene-type";
import {
    getCanvasSizeById,
    isMultiSceneType,
    isSceneType,
    logSelection,
    logTestUrls,
    setupEngine,
} from "./tools";
import { MultiSceneTestFactory } from "./factory/multi-scene-test-factory";
import { SingleSceneTestFactory } from "./factory/single-scene-test-factory";
import { SceneInstanceFactory } from "./factory/scene-instance-factory";

const urlParams = new URLSearchParams(window.location.search);
const SCENE_MODE = (urlParams.get("mode") as "all" | "current") || "current";
const SCENE_NAME =
    urlParams.get("scene") ||
    (SCENE_MODE === "all"
        ? MultiSceneType.CAR_OUT_OF_TRACK
        : SceneType.RECTANGLE_TRACK);

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
        multiScene = MultiSceneType.CAR_OUT_OF_TRACK;
    } else {
        currentScene = SceneType.RECTANGLE_TRACK;
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

        if (currentScene) {
            const factory = new SingleSceneTestFactory(canvas, instanceFactory);
            const scene = factory.createSingleSceneTest(currentScene);
            gameEngine.registerScene(scene.name!, scene);
            gameEngine.transitionToScene(scene.name!);
        }

        if (multiScene) {
            const factory = new MultiSceneTestFactory(canvas, instanceFactory);
            const scenes = factory.createMultiSceneTest(multiScene);
            scenes.forEach((scene) => {
                gameEngine.registerScene(scene.name!, scene);
            });
        }

        logTestUrls();
        logSelection(SCENE_MODE, currentScene, multiScene);
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
