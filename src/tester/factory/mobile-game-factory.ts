import type { GameEngine } from "zippy-game-engine";
import { GameBuilder } from "../../builder/game-builder";
import { MenuBuilder } from "../../builder/menu-builder";
import { MobileGameBuilder } from "../../builder/mobile-game-builder";
import type { CarFactory } from "../../car/car-factory";
import type { SceneInstanceFactory } from "../../factory/scene-instance-factory";
import { GameSetup } from "../game-setup";

export async function mobileGameFactory(
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
            new MobileGameBuilder(gameBuilder)
        )
    );
    gameSetup.setup();
}
