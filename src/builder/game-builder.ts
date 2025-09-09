import type { Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "../factory/scene-instance-factory";
import type { IStartingGrid } from "../scene/starting-grid";
import type { ITrackBoundary } from "../scene/track-boundary";
import type { IPlayer } from "../scene/arrow-player";
import type { ILapTracker } from "../scene/lap-tracker";
import type { ICountdown } from "../scene/countdown";
import type { IContinue } from "../scene/continue";
import type { IGameScore } from "../scene/game-score";
import type { IBuilder } from "../type/i-builder";

export class GameBuilder implements IBuilder {
    private scenes: Scene[] = [];
    private startingGrid?: IStartingGrid;
    private trackBoundary?: ITrackBoundary;
    private player?: IPlayer;
    private lapTracker?: ILapTracker;
    private countdown?: ICountdown;
    private continueBtn?: IContinue;
    private gameScore?: IGameScore;

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

    withRoadMarkings(): GameBuilder {
        const roadMarkings = this.factory.createRoadMarkings();
        this.scenes.push(roadMarkings);
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
        this.player.setStartingGrid(this.startingGrid!);
        this.player.setStartingPosition(
            this.startingGrid.getStartingPosition()
        );
        this.player.setTrackBoundary(this.trackBoundary);
        this.scenes.push(this.player);
        return this;
    }

    withTurboPlayer(): GameBuilder {
        if (!this.startingGrid) {
            throw new Error("Starting grid must be set before adding player");
        }
        if (!this.trackBoundary) {
            throw new Error("Track Boundary must be set before adding player");
        }
        this.player = this.factory.createTurboPlayer(false);
        this.player.setStartingGrid(this.startingGrid!);
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
        if (!this.lapTracker) {
            throw new Error("LapTracker must be set before adding Countdown");
        }
        this.countdown = this.factory.createCountdown(
            () => {
                this.player!.setInputEnabled(true);
                this.lapTracker!.start();
            },
            () => {}
        );
        this.scenes.push(this.countdown);
        return this;
    }

    withLapTracker(): GameBuilder {
        if (!this.player) {
            throw new Error("Player must be set before adding LapTracker");
        }
        if (!this.startingGrid) {
            throw new Error(
                "StartingGrid must be set before adding LapTracker"
            );
        }
        if (!this.gameScore) {
            throw new Error("GameScore must be set before adding LapTracker");
        }
        this.lapTracker = this.factory.createLapTracker(this.player);
        this.lapTracker.setRaceCompleteCallback(() => {
            this.gameScore!.onRaceComplete(this.lapTracker!);
            this.lapTracker!.reset();
            this.player!.setInputEnabled(false);
            this.player!.setStartingPosition(
                this.startingGrid!.getStartingPosition()
            );
            this.continueBtn!.show();
        });
        this.scenes.push(this.lapTracker);
        return this;
    }

    withContinueBtn(): GameBuilder {
        if (!this.countdown) {
            throw new Error("Countdown must be set before adding Continue");
        }
        this.continueBtn = this.factory.createContinue();
        this.continueBtn.setOnRestartRace(() => {
            this.continueBtn!.hide();
            this.countdown!.startAgain();
        });
        this.scenes.push(this.continueBtn);
        return this;
    }

    withGameScore(): GameBuilder {
        this.gameScore = this.factory.createGameScore();
        this.scenes.push(this.gameScore);
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
        .withRoadMarkings()
        .withStartingGrid()
        .withTrackBoundary()
        .withPlayer()
        //.withTurboPlayer()
        .withGameScore()
        .withLapTracker()
        .withCountdown()
        .withContinueBtn()
        .build();
    return scenes;
}
