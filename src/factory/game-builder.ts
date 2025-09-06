import type { GameEngine, Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";

export interface IBuilder {
    build(): void;
}

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

export class GameBuilder implements IBuilder {
    private scenes: Scene[] = [];

    constructor(private readonly factory: SceneInstanceFactory) {}

    withRectangleTrack(): GameBuilder {
        this.scenes.push(this.factory.createRectangleTrack());
        return this;
    }

    build(): Scene[] {
        return this.scenes;
    }
}

export function buildMenu(factory: SceneInstanceFactory, gameEngine: GameEngine): Scene {
    const scene = new MenuBuilder(factory, gameEngine).withStartMenu().build();
    return scene;
}

export function buildGame(factory: SceneInstanceFactory): Scene[] {
    const scenes = new GameBuilder(factory).withRectangleTrack().build();
    return scenes;
}
