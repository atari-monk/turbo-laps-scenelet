import type { GameEngine, Scene } from "zippy-game-engine";
import { ElipseTrack } from "./scenes/elipse-track";
import { RectangleTrack } from "./scenes/rectangle-track";
import { ArrowPlayer } from "./scenes/arrow-player";
import { TrackBoundary } from "./scenes/track-boundary";
import { StartingGrid } from "./scenes/starting-grid";
import { RoadMarkings } from "./scenes/road-markings";
import { TrackGrass } from "./scenes/track-grass";
import { LapTracker } from "./scenes/lap-tracker";
import { GameScore } from "./scenes/game-score";
import { Menu } from "./scenes/menu";
import { Countdown } from "./scenes/countdown";
import { Continue } from "./scenes/continue";

export enum SceneType {
    ELIPSE_TRACK = "Elipse Track",
    RECTANGLE_TRACK = "Rectangle Track",
    ARROW_PLAYER = "Arrow Player",
    TRACK_BOUNDARY = "Track Boundary",
    STARTING_GRID = "Starting Grid",
    ROAD_MARKINGS = "Road Markings",
    TRACK_GRASS = "Track Grass",
    LAP_TRACKER = "Lap Tracker",
    GAME_SCORE = "Game Score",
    MENU = "Menu",
    COUNTDOWN = "Countdown",
    CONTINUE = "Continue",
}

export enum MultiSceneType {
    MULTI_TRACK_BOUNDARY = "Multi Track Boundary",
    MULTI_COUNTDOWN = "Multi Countdown",
    MULTI_LAP_TRACKER = "Multi Lap Tracker",
    MULTI_CONTINUE = "Multi Continue",
}

export class SceneFactory {
    constructor(
        private gameEngine: GameEngine,
        private canvas: HTMLCanvasElement
    ) {}

    createElipseTrack(): ElipseTrack {
        return new ElipseTrack(this.canvas);
    }

    createRectangleTrack(): RectangleTrack {
        return new RectangleTrack(this.canvas);
    }

    createArrowPlayer(): ArrowPlayer {
        return new ArrowPlayer(this.canvas, this.gameEngine.input);
    }

    createTrackBoundary(): TrackBoundary {
        return new TrackBoundary(this.createRectangleTrack());
    }

    createStartingGrid(): StartingGrid {
        return new StartingGrid(this.createRectangleTrack());
    }

    createRoadMarkings(): RoadMarkings {
        return new RoadMarkings(this.createRectangleTrack());
    }

    createTrackGrass(): TrackGrass {
        return new TrackGrass(this.createRectangleTrack());
    }

    createLapTracker(): LapTracker {
        const track = this.createRectangleTrack();
        const arrowPlayer = this.createArrowPlayer();
        const startingGrid = this.createStartingGrid();
        return new LapTracker(track, arrowPlayer, startingGrid);
    }

    createGameScore(): GameScore {
        const lapTracker = this.createLapTracker();
        return new GameScore(lapTracker);
    }

    createMenu(): Menu {
        return new Menu(this.gameEngine.input);
    }

    createCountdown(): Countdown {
        return new Countdown(() => {
            console.log("Countdown complete!");
        });
    }

    createContinue(): Continue {
        const continueBtn = new Continue(this.gameEngine.input);
        continueBtn.show();
        continueBtn.setOnRestartRace(() => {
            console.log("Restart");
        });
        return continueBtn;
    }

    //multi scene

    createMultiTrackBoundary(): {
        track: RectangleTrack;
        boundary: TrackBoundary;
        grid: StartingGrid;
        player: ArrowPlayer;
    } {
        const track = this.createRectangleTrack();
        const boundary = this.createTrackBoundary();
        const grid = this.createStartingGrid();
        const player = this.createArrowPlayer();

        player.setTrackBoundary(boundary);
        player.setStartingPosition(grid.getStartingPosition());

        return { track, boundary, grid, player };
    }

    createMultiCountdown(): {
        track: RectangleTrack;
        player: ArrowPlayer;
        countdown: Countdown;
    } {
        const track = this.createRectangleTrack();
        const player = this.createArrowPlayer();
        const countdown = new Countdown(
            () => {
                console.log("Countdown complete!");
                player.setInputEnabled(true);
            },
            undefined,
            () => {
                player.setInputEnabled(false);
            }
        );

        return { track, player, countdown };
    }

    createMultiLapTracker(): {
        track: RectangleTrack;
        boundary: TrackBoundary;
        grid: StartingGrid;
        player: ArrowPlayer;
        lapTracker: LapTracker;
        continueBtn: Continue;
    } {
        const track = this.createRectangleTrack();
        const boundary = this.createTrackBoundary();
        const grid = this.createStartingGrid();
        const player = this.createArrowPlayer();
        const lapTracker = this.createLapTracker();
        const continueBtn = this.createContinue();

        player.setTrackBoundary(boundary);
        player.setStartingPosition(grid.getStartingPosition());
        player.setInputEnabled(true);
        lapTracker.start();

        return { track, boundary, grid, player, lapTracker, continueBtn };
    }

    createMultiContinueButton(): {
        track: RectangleTrack;
        boundary: TrackBoundary;
        grid: StartingGrid;
        player: ArrowPlayer;
        lapTracker: LapTracker;
        continueBtn: Continue;
    } {
        const { track, boundary, grid, player, lapTracker, continueBtn } =
            this.createMultiLapTracker();
        return { track, boundary, grid, player, lapTracker, continueBtn };
    }

    createScene(sceneType: SceneType | MultiSceneType): any {
        switch (sceneType) {
            case SceneType.ELIPSE_TRACK:
                return this.createElipseTrack();
            case SceneType.RECTANGLE_TRACK:
                return this.createRectangleTrack();
            case SceneType.ARROW_PLAYER:
                return this.createArrowPlayer();
            case SceneType.TRACK_BOUNDARY:
                return this.createTrackBoundary();
            case SceneType.STARTING_GRID:
                return this.createStartingGrid();
            case SceneType.ROAD_MARKINGS:
                return this.createRoadMarkings();
            case SceneType.TRACK_GRASS:
                return this.createTrackGrass();
            case SceneType.LAP_TRACKER:
                return this.createLapTracker();
            case SceneType.GAME_SCORE:
                return this.createGameScore();
            case SceneType.MENU:
                return this.createMenu();
            case SceneType.COUNTDOWN:
                return this.createCountdown();
            case SceneType.CONTINUE:
                return this.createContinue();
            case MultiSceneType.MULTI_TRACK_BOUNDARY:
                return this.createMultiTrackBoundary();
            case MultiSceneType.MULTI_COUNTDOWN:
                return this.createMultiCountdown();
            case MultiSceneType.MULTI_LAP_TRACKER:
                return this.createMultiLapTracker();
            case MultiSceneType.MULTI_CONTINUE:
                return this.createMultiContinueButton();
            default:
                throw new Error(`Unknown scene type: ${sceneType}`);
        }
    }

    registerScene(sceneType: SceneType): void {
        const scene = this.createScene(sceneType);
        this.gameEngine.registerScene(sceneType, scene);
    }

    registerMultiScene(sceneType: MultiSceneType): void {
        const scenes = this.createScene(sceneType);
        if ("track" in scenes)
            this.gameEngine.registerScene(
                SceneType.RECTANGLE_TRACK,
                scenes.track as Scene
            );
        if ("boundary" in scenes)
            this.gameEngine.registerScene(
                SceneType.TRACK_BOUNDARY,
                scenes.boundary as Scene
            );
        if ("grid" in scenes)
            this.gameEngine.registerScene(
                SceneType.STARTING_GRID,
                scenes.grid as Scene
            );
        if ("player" in scenes)
            this.gameEngine.registerScene(
                SceneType.ARROW_PLAYER,
                scenes.player as Scene
            );
        if ("countdown" in scenes)
            this.gameEngine.registerScene(
                SceneType.COUNTDOWN,
                scenes.countdown as Scene
            );
        if ("lapTracker" in scenes)
            this.gameEngine.registerScene(
                SceneType.LAP_TRACKER,
                scenes.lapTracker as Scene
            );
        if ("continueBtn" in scenes)
            this.gameEngine.registerScene(
                SceneType.CONTINUE,
                scenes.continueBtn as Scene
            );
    }

    registerAllScenes(): void {
        Object.values(SceneType).forEach((sceneType) => {
            this.registerScene(sceneType as SceneType);
        });
    }
}

// Convenience function for quick scene creation
export function createScene(
    sceneType: SceneType,
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
): any {
    const factory = new SceneFactory(gameEngine, canvas);
    return factory.createScene(sceneType);
}

// Convenience function for quick scene registration
export function registerScene(
    sceneType: SceneType,
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
): void {
    const factory = new SceneFactory(gameEngine, canvas);
    factory.registerScene(sceneType);
}
