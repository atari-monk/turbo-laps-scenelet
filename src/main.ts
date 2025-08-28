import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine } from "zippy-game-engine";
import { getCanvasSizeById, setupEngine } from "./tools";
import { MultiSceneType, SceneFactory, SceneType } from "./scene-factory";

// Get scene configuration from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const SCENE_MODE = (urlParams.get("mode") as "all" | "current") || "current";
const SCENE_NAME =
    urlParams.get("scene") ||
    (SCENE_MODE === "all"
        ? MultiSceneType.MULTI_TRACK_BOUNDARY
        : SceneType.RECTANGLE_TRACK);

let gameEngine: GameEngine;

// Helper functions for type checking
function isSceneType(value: any): value is SceneType {
    return Object.values(SceneType).includes(value);
}

function isMultiSceneType(value: any): value is MultiSceneType {
    return Object.values(MultiSceneType).includes(value);
}

// Determine scene type based on URL parameters
let currentScene: SceneType | null = null;
let multiScene: MultiSceneType | null = null;

if (isSceneType(SCENE_NAME)) {
    currentScene = SCENE_NAME;
} else if (isMultiSceneType(SCENE_NAME as MultiSceneType)) {
    multiScene = SCENE_NAME as MultiSceneType;
} else {
    console.warn(`Unknown scene: ${SCENE_NAME}. Using default.`);
    if (SCENE_MODE === "all") {
        multiScene = MultiSceneType.MULTI_TRACK_BOUNDARY;
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
        registerScenes(gameEngine, canvas);

        console.log(`Scene mode: ${SCENE_MODE}`);
        if (SCENE_MODE === "all" && multiScene) {
            console.log(`Testing multi-scene: ${multiScene}`);
        } else if (SCENE_MODE === "current" && currentScene) {
            console.log(`Testing single scene: ${currentScene}`);
        }

        // Log available scenes for reference
        console.log("Available single scenes:", Object.values(SceneType));
        console.log("Available multi-scenes:", Object.values(MultiSceneType));
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});

function registerScenes(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    const factory = new SceneFactory(gameEngine, canvas);

    if (SCENE_MODE === "all") {
        // All mode - register multi-scene components
        if (multiScene) {
            factory.registerMultiScene(multiScene);
            // No transition needed - all scenes are active in "all" mode
        } else {
            console.error("No valid multi-scene specified for 'all' mode");
        }
    } else {
        // Current mode - register single scene and transition to it
        if (currentScene) {
            factory.registerScene(currentScene);
            gameEngine.transitionToScene(currentScene);
        } else {
            console.error("No valid single scene specified for 'current' mode");
        }
    }
}

// Utility function to generate test URLs (for debugging)
function logTestUrls() {
    console.log("=== Test URLs ===");

    // Single scene tests
    Object.values(SceneType).forEach((scene) => {
        console.log(`Single: ?mode=current&scene=${encodeURIComponent(scene)}`);
    });

    // Multi-scene tests
    Object.values(MultiSceneType).forEach((scene) => {
        console.log(`Multi: ?mode=all&scene=${encodeURIComponent(scene)}`);
    });
}

// Uncomment to see available test URLs in console
logTestUrls();
