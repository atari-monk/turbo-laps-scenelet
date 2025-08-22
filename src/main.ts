import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine, GameEngineFactory } from "zippy-game-engine";
import { RectangleTrack } from "./scenes/rectangle-track";
import { ArrowPlayer } from "./scenes/arrow-player";
import { ElipseTrack } from "./scenes/elipse-track";

window.addEventListener("load", async () => {
    const gameEngine = setupEngine();
    createGameCanvas("canvas-container", "game-canvas", gameEngine);
    const { canvas } = getCanvasSizeById("game-canvas");
    registerScenes(gameEngine, canvas);
    gameEngine.transitionToScene("Race Player");
});

function registerScenes(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    gameEngine.registerScene("Elipse Track", new ElipseTrack(canvas));
    gameEngine.registerScene("Rectangle Track", new RectangleTrack(canvas));
    gameEngine.registerScene(
        "Race Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
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
