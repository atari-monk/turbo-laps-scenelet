import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngineFactory } from "zippy-game-engine";
import { RaceTrack } from "./scenes/race-track";
import { RacePlayer } from "./scenes/race-player";

window.addEventListener("load", async () => {
    const gameEngine = setupEngine();
    createGameCanvas("canvas-container", "game-canvas", gameEngine);
    const { canvas } = getCanvasSizeById("game-canvas");
    gameEngine.registerScene("Race Track", new RaceTrack(canvas));
    gameEngine.registerScene("Race Player", new RacePlayer(canvas));
    gameEngine.transitionToScene("Race Player");
});

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
