import { GameEngineFactory } from "zippy-game-engine";
import { CanvasSetup } from "./canvas-setup";
import { UrlParamsHandler } from "./url-params-handler";
import { SingleSceneTestFactory } from "../factory/single-scene-test-factory";
import { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { SingleSceneSetup } from "./single-scene-setup";
import { MultiSceneSetup } from "./multi-scene-setup";
import { MultiSceneTestFactory } from "../factory/multi-scene-test-factory";
import { GameSetup } from "./game-setup";
import { MenuBuilder } from "../builder/menu-builder";
import { PCGameBuilder } from "../builder/pc-game-builder";
import { GameBuilder } from "../builder/game-builder";
import { GameId } from "./const";
import { MobileGameBuilder } from "../builder/mobile-game-builder";
import { CarFactory } from "../car/car-factory";

export async function testerFactory(): Promise<void> {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();

    const canvasComponentFactory = new CanvasSetup(gameEngine);
    const canvas = canvasComponentFactory.setupCanvas(
        "canvas-container",
        "game-canvas"
    );

    const urlParamsHandler = new UrlParamsHandler();
    urlParamsHandler.logOptions();

    gameEngine.setSceneMode(urlParamsHandler.sceneMode);

    const sceneInstanceFactory = new SceneInstanceFactory(gameEngine, canvas);

    const singleSceneSetup = new SingleSceneSetup(
        gameEngine,
        new SingleSceneTestFactory(canvas, gameEngine, sceneInstanceFactory)
    );

    if (urlParamsHandler.singleScene)
        singleSceneSetup.setup(urlParamsHandler.singleScene);

    const carFactory = new CarFactory(gameEngine, canvas);

    const multiSceneTestFactory = new MultiSceneTestFactory(
        canvas,
        sceneInstanceFactory,
        carFactory
    );

    const multiSceneSetup = new MultiSceneSetup(
        gameEngine,
        multiSceneTestFactory
    );

    if (urlParamsHandler.multiScene)
        multiSceneSetup.setup(urlParamsHandler.multiScene);

    const gameBuilder = new GameBuilder(sceneInstanceFactory, carFactory);
    const pcGameSetup = new GameSetup(
        gameEngine,
        new MenuBuilder(
            sceneInstanceFactory,
            gameEngine,
            new PCGameBuilder(gameBuilder)
        )
    );
    const mobileGameSetup = new GameSetup(
        gameEngine,
        new MenuBuilder(
            sceneInstanceFactory,
            gameEngine,
            new MobileGameBuilder(gameBuilder)
        )
    );

    if (urlParamsHandler.game === GameId.TURBO_LAPS_PC)
        await pcGameSetup.setup();
    if (urlParamsHandler.game === GameId.TURBO_LAPS_MOBILE)
        await mobileGameSetup.setup();

    urlParamsHandler.logSelection();
}
