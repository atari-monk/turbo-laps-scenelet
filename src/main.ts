import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine } from "zippy-game-engine";
import {
    getCanvasSizeById,
    isMultiSceneType,
    isSceneType,
    logSelection,
    logTestUrls,
    setupEngine,
} from "./tools";
import { MultiSceneType, registerScenes, SceneType } from "./scene-factory";

const urlParams = new URLSearchParams(window.location.search);
const SCENE_MODE = (urlParams.get("mode") as "all" | "current") || "current";
const SCENE_NAME =
    urlParams.get("scene") ||
    (SCENE_MODE === "all"
        ? MultiSceneType.TRACK_BOUNDARY_FEATURE
        : SceneType.RECTANGLE_TRACK);

let gameEngine: GameEngine;

let currentScene: SceneType | null = null;
let multiScene: MultiSceneType | null = null;

if (isSceneType(SCENE_NAME)) {
    currentScene = SCENE_NAME;
} else if (isMultiSceneType(SCENE_NAME as MultiSceneType)) {
    multiScene = SCENE_NAME as MultiSceneType;
} else {
    console.warn(`Unknown scene: ${SCENE_NAME}. Using default.`);
    if (SCENE_MODE === "all") {
        multiScene = MultiSceneType.TRACK_BOUNDARY_FEATURE;
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

        registerScenes(
            gameEngine,
            canvas,
            SCENE_MODE,
            currentScene,
            multiScene
        );

        logTestUrls();
        //logAvailableScenes();
        logSelection(SCENE_MODE, currentScene, multiScene);
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
