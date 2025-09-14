import { EngineSetupHandler } from "./engine-setup-handler";
import { GameEngineFactory } from "zippy-game-engine";
import { CanvasSetup } from "./canvas-setup";
import { UrlParamsHandler } from "./url-params-handler";

export function testerFactory(): EngineSetupHandler {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();

    const canvasComponentFactory = new CanvasSetup(gameEngine);
    const canvas = canvasComponentFactory.setupCanvas(
        "canvas-container",
        "game-canvas"
    );

    const engineSetupHandler = new EngineSetupHandler(
        gameEngine,
        canvas,
        new UrlParamsHandler()
    );

    return engineSetupHandler;
}
