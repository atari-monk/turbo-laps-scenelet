import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { type GameEngine } from "zippy-game-engine";

export class CanvasSetup {
    constructor(private readonly gameEngine: GameEngine) {}

    setupCanvas(containerId: string, canvasId: string): HTMLCanvasElement {
        createGameCanvas(containerId, canvasId, this.gameEngine);
        const canvas = this.getCanvasSizeById(canvasId);
        this.gameEngine.input.setupCanvasEvents(canvas);
        return canvas;
    }

    private getCanvasSizeById(canvasId: string): HTMLCanvasElement {
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
            throw new Error(`Canvas element with ID '${canvasId}' not found`);
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(
                `Element with ID '${canvasId}' is not a canvas element`
            );
        }

        return canvas;
    }
}
