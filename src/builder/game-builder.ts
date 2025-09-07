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
        const player = this.factory.createArrowPlayer(true);
        player.setStartingPosition(this.startingGrid!.getStartingPosition());
        this.scenes.push(player);
        return this;
    }

    build(): Scene[] {
        return this.scenes;
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
