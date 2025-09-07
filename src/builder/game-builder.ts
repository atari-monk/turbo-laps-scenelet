import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import type { IBuilder } from "./type/IBuilder";
import type { IStartingGrid } from "../scenes/starting-grid";
import type { ITrackBoundary } from "../scenes/track-boundary";
import type { IPlayer } from "../scenes/arrow-player";

export class GameBuilder implements IBuilder {
    private scenes: Scene[] = [];
    private startingGrid?: IStartingGrid;
    private trackBoundary?: ITrackBoundary;
    private player?: IPlayer;

    constructor(private readonly factory: SceneInstanceFactory) {}

    withRectangleTrack(): GameBuilder {
        const track = this.factory.createRectangleTrack();
        this.scenes.push(track);
        return this;
    }

    withTrackGrass(): GameBuilder {
        const grass = this.factory.createTrackGrass();
        this.scenes.push(grass);
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
        if (!this.trackBoundary) {
            throw new Error("Track Boundary must be set before adding player");
        }

        this.player = this.factory.createArrowPlayer(false);
        this.player.setStartingPosition(
            this.startingGrid.getStartingPosition()
        );
        this.player.setTrackBoundary(this.trackBoundary);
        this.scenes.push(this.player);
        return this;
    }

    withTrackBoundary() {
        this.trackBoundary = this.factory.createTrackBoundary();
        this.scenes.push(this.trackBoundary);
        return this;
    }

    withCountdown(): GameBuilder {
        if (!this.player) {
            throw new Error("Player must be set before adding Countdown");
        }

        const countdown = this.factory.createCountdown(
            () => {
                this.player!.setInputEnabled(true);
                //this.lapTracker.start();
            },
            () => {}
        );
        this.scenes.push(countdown);
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

export function buildGame(factory: SceneInstanceFactory): Scene[] {
    const scenes = new GameBuilder(factory)
        .withRectangleTrack()
        .withTrackGrass()
        .withStartingGrid()
        .withTrackBoundary()
        .withPlayer()
        .withCountdown()
        .build();
    return scenes;
}
