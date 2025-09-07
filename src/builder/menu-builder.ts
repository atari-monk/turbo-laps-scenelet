import type { Scene, GameEngine } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { buildGame } from "./game-builder";
import type { IBuilder } from "./type/IBuilder";

export class MenuBuilder implements IBuilder {
    private scene: Scene = {};

    constructor(
        private readonly factory: SceneInstanceFactory,
        private readonly gameEngine: GameEngine
    ) {}

    withStartMenu(): MenuBuilder {
        const menu = this.factory.createMenu();
        menu.setOnStartGame(() => {
            const scenes = buildGame(this.factory);
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
