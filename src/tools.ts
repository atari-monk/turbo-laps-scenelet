import { GameEngineFactory } from "zippy-game-engine";
import { SceneId } from "./tester/enum/scene-id";
import { MultiSceneId } from "./tester/enum/multi-scene-id";
import { GameId } from "./tester/enum/game-id";

export function getCanvasSizeById(canvasId: string): {
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

export function setupEngine() {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();
    return gameEngine;
}

export function logTestUrls() {
    console.log("=== Test URLs ===");

    Object.values(SceneId).forEach((scene) => {
        console.log(`Single: ?mode=current&scene=${encodeURIComponent(scene)}`);
    });

    Object.values(MultiSceneId).forEach((scene) => {
        console.log(`Multi: ?mode=all&scene=${encodeURIComponent(scene)}`);
    });

    Object.values(GameId).forEach((scene) => {
        console.log(`Game: ?mode=all&scene=${encodeURIComponent(scene)}`);
    });
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
