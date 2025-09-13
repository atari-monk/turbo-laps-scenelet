import { GameEngineFactory } from "zippy-game-engine";
import { SceneType } from "./type/scene-type";
import { MultiSceneType } from "./type/multi-scene-type";
import { MultiSceneTypeDescriptions } from "./type/multi-scene-type-descriptions";
import { SceneTypeDescriptions } from "./type/scene-type-descriptions";
import { GameType } from "./type/game-type";
import { GameTypeDescriptions } from "./type/game-type-descriptions";

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

    Object.values(SceneType).forEach((scene) => {
        console.log(`Single: ?mode=current&scene=${encodeURIComponent(scene)}`);
    });

    Object.values(MultiSceneType).forEach((scene) => {
        console.log(`Multi: ?mode=all&scene=${encodeURIComponent(scene)}`);
    });

    Object.values(GameType).forEach((scene) => {
        console.log(`Game: ?mode=all&scene=${encodeURIComponent(scene)}`);
    });
}

export function isSceneType(value: any): value is SceneType {
    return Object.values(SceneType).includes(value);
}

export function isMultiSceneType(value: any): value is MultiSceneType {
    return Object.values(MultiSceneType).includes(value);
}

export function isGameType(value: any): value is GameType {
    return Object.values(GameType).includes(value);
}

export function logSceneSelection(
    mode: "all" | "current" | "game",
    currentScene: SceneType | null,
    multiScene: MultiSceneType | null,
    gameType: GameType | null
) {
    console.log(`Scene mode: ${mode}`);

    if (mode === "all" && multiScene) {
        console.log(
            `Testing multi-scene: ${multiScene} - ${MultiSceneTypeDescriptions[multiScene]}`
        );
    } else if (mode === "current" && currentScene) {
        console.log(
            `Testing single scene: ${currentScene} - ${SceneTypeDescriptions[currentScene]}`
        );
    } else if (mode === "game" && gameType) {
        console.log(
            `Playing game: ${gameType} - ${GameTypeDescriptions[gameType]}`
        );
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
