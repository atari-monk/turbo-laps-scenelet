import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine, GameEngineFactory } from "zippy-game-engine";
import { RectangleTrack } from "./scenes/rectangle-track";
import { ArrowPlayer } from "./scenes/arrow-player";
import { ElipseTrack } from "./scenes/elipse-track";
import { StartingGrid } from "./scenes/starting-grid";

let SCENE_MODE: "all" | "current" = "all";
const TEST_SCENE_INDEX = 3;
const ALL_SCENES = [
    "Elipse Track",
    "Rectangle Track",
    "Arrow Player",
    "Starting Grid",
];

window.addEventListener("load", async () => {
    const gameEngine = setupEngine();
    createGameCanvas("canvas-container", "game-canvas", gameEngine);
    const { canvas } = getCanvasSizeById("game-canvas");

    gameEngine.setSceneMode(SCENE_MODE);
    registerScenes(gameEngine, canvas);

    if ((SCENE_MODE as string) === "current") {
        if (TEST_SCENE_INDEX >= 0 && TEST_SCENE_INDEX < ALL_SCENES.length) {
            gameEngine.transitionToScene(ALL_SCENES[TEST_SCENE_INDEX]);
        } else {
            console.warn(
                `Invalid test scene index: ${TEST_SCENE_INDEX}. Available scenes: ${ALL_SCENES.length}`
            );
        }
    }
});

function registerScenesForCurrentMode(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Elipse Track", new ElipseTrack(canvas));
    const track = new RectangleTrack(canvas);
    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene(
        "Arrow Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
    gameEngine.registerScene("Starting Grid", new StartingGrid(track));
}

function registerScenesForAllMode(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene(
        "Arrow Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
    gameEngine.registerScene("Starting Grid", new StartingGrid(track));
}

function registerScenes(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    if (SCENE_MODE === "current") {
        registerScenesForCurrentMode(gameEngine, canvas);
    } else {
        registerScenesForAllMode(gameEngine, canvas);
    }
}

function setupEngine() {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();
    return gameEngine;
}

function getCanvasSizeById(canvasId: string): {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
} {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        throw new Error(`Canvas element with ID '${canvasId}' not found`);
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(
            `Element with ID '${canvasId}' is not a canvas element`
        );
    }

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
    };
}
