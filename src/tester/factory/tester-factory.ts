import { CarFactory } from "../../car/car-factory";
import { componentsFactory } from "./components-factory";
import { pcGameFactory } from "./pc-game-factory";
import { multiSceneFactory } from "./multi-scene-factory";
import { singleSceneFactory } from "./single-scene-factory";
import { GameId } from "../const";
import { mobileGameFactory } from "./mobile-game-factory";

export async function testerFactory(): Promise<void> {
    const { gameEngine, canvas, sceneInstanceFactory, urlParamsHandler } =
        componentsFactory();

    const {
        singleScene: sceneId,
        multiScene: multiSceneId,
        game: gameId,
    } = urlParamsHandler;

    const carFactory = new CarFactory(canvas, gameEngine);

    if (sceneId) {
        singleSceneFactory(
            gameEngine,
            canvas,
            sceneInstanceFactory,
            carFactory,
            sceneId
        );
    }

    if (multiSceneId) {
        multiSceneFactory(
            canvas,
            sceneInstanceFactory,
            carFactory,
            gameEngine,
            multiSceneId
        );
    }

    if (gameId === GameId.TURBO_LAPS_PC)
        await pcGameFactory(sceneInstanceFactory, carFactory, gameEngine);
    if (gameId === GameId.TURBO_LAPS_MOBILE)
        await mobileGameFactory(sceneInstanceFactory, carFactory, gameEngine);

    urlParamsHandler.logSelection();
}
