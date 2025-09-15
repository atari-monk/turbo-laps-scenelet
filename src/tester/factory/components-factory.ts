import { GameEngineFactory } from "zippy-game-engine";
import { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { CanvasSetup } from "../canvas-setup";
import { UrlParamsHandler } from "../url-params-handler";

export function componentsFactory(logOptions = false) {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();

    const canvasComponentFactory = new CanvasSetup(gameEngine);
    const canvas = canvasComponentFactory.setupCanvas(
        "canvas-container",
        "game-canvas"
    );

    const urlParamsHandler = new UrlParamsHandler();
    if (logOptions) urlParamsHandler.logOptions();

    gameEngine.setSceneMode(urlParamsHandler.sceneMode);

    const sceneInstanceFactory = new SceneInstanceFactory(gameEngine, canvas);
    return { gameEngine, canvas, sceneInstanceFactory, urlParamsHandler };
}
