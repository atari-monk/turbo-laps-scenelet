import type { Scene, GameEngine } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { buildGameForMobile, buildGameForPc } from "./game-builder";
import type { IBuilder } from "../type/i-builder";
import { GameType } from "../type/game-type";

export class MenuBuilder implements IBuilder {
    private scene: Scene = {};

    constructor(
        private readonly factory: SceneInstanceFactory,
        private readonly gameEngine: GameEngine
    ) {}

    withStartMenu(gameType: GameType): MenuBuilder {
        const menu = this.factory.createMenu();
        menu.setOnStartGame(async () => {
            let scenes: Scene[] = [];
            if (gameType === GameType.TURBO_LAPS_PC)
                scenes = await buildGameForPc(this.factory);
            if (gameType === GameType.TURBO_LAPS_MOBILE)
                scenes = await buildGameForMobile(this.factory);
            scenes.forEach((scene) => {
                this.gameEngine.registerScene(scene.name!, scene);
            });
            menu.toggle();
            this.gameEngine.setSceneMode("all");
        });
        this.scene = menu;
        return this;
    }

    build(): Scene {
        return this.scene;
    }
}

export function buildMenu(
    factory: SceneInstanceFactory,
    gameEngine: GameEngine,
    gameType: GameType
): Scene {
    const scene = new MenuBuilder(factory, gameEngine)
        .withStartMenu(gameType)
        .build();
    return scene;
}
