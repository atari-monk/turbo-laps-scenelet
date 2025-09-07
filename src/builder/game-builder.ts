import type { GameEngine, Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import type { IBuilder } from "./type/IBuilder";
import { MenuBuilder } from "./menu-builder";
import type { IStartingGrid } from "../scenes/starting-grid";

export class GameBuilder implements IBuilder {
    private scenes: Scene[] = [];
    private startingGrid?: IStartingGrid;

    constructor(private readonly factory: SceneInstanceFactory) {}

    withRectangleTrack(): GameBuilder {
        const track = this.factory.createRectangleTrack();
        this.scenes.push(track);
        return this;
    }

    withStartingGrid(): GameBuilder {
        this.startingGrid = this.factory.createStartingGrid();
        this.scenes.push(this.startingGrid);
        return this;
    }

    withPlayer(): GameBuilder {
        if (!this.startingGrid) {
            throw new Error("Starting grid must be set before adding player");
        }

        const player = this.factory.createArrowPlayer(true);
        player.setStartingPosition(this.startingGrid.getStartingPosition());
        this.scenes.push(player);
        return this;
    }

    build(): Scene[] {
        if (this.scenes.length === 0) {
            throw new Error("No scenes configured");
        }
        this.validateScenes();
        return this.scenes;
    }

    private validateScenes(): void {
        const isStartingGrid = (
            scene: Scene
        ): scene is IStartingGrid & Scene => {
            return "getStartingPosition" in scene;
        };

        const startingGrids = this.scenes.filter(isStartingGrid);

        if (startingGrids.length === 0) {
            console.warn("No starting grid scenes found");
        }
    }
}

export function buildMenu(
    factory: SceneInstanceFactory,
    gameEngine: GameEngine
): Scene {
    const scene = new MenuBuilder(factory, gameEngine).withStartMenu().build();
    return scene;
}

export function buildGame(factory: SceneInstanceFactory): Scene[] {
    const scenes = new GameBuilder(factory)
        .withRectangleTrack()
        .withStartingGrid()
        .withPlayer()
        .build();
    return scenes;
}
