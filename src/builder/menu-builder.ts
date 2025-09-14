import type { Scene, GameEngine } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import type { IBuilder } from "../type/i-builder";
import type { IGameBuilder } from "./type/i-game-builder";

export class MenuBuilder implements IBuilder {
    private scene: Scene = {};

    constructor(
        private readonly factory: SceneInstanceFactory,
        private readonly gameEngine: GameEngine,
        private readonly gameBuilder: IGameBuilder
    ) {}

    withStartMenu(): MenuBuilder {
        const menu = this.factory.createMenu();
        menu.setOnStartGame(async () => {
            const scenes: Scene[] = await this.gameBuilder.buildGame();
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
