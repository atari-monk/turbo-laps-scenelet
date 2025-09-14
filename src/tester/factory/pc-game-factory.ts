import type { GameEngine } from "zippy-game-engine";
import { GameBuilder } from "../../builder/game-builder";
import { MenuBuilder } from "../../builder/menu-builder";
import { PCGameBuilder } from "../../builder/pc-game-builder";
import type { CarFactory } from "../../car/car-factory";
import type { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { GameSetup } from "../game-setup";

export async function pcGameFactory(
    sceneInstanceFactory: SceneInstanceFactory,
    carFactory: CarFactory,
    gameEngine: GameEngine
) {
    const gameBuilder = new GameBuilder(sceneInstanceFactory, carFactory);
    const gameSetup = new GameSetup(
        gameEngine,
        new MenuBuilder(
            sceneInstanceFactory,
            gameEngine,
            new PCGameBuilder(gameBuilder)
        )
    );
    gameSetup.setup();
}
