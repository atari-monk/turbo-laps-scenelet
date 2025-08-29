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
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        return new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
    }

    createTrackBoundary(): TrackBoundary {
        return new TrackBoundary(new RectangleTrack(this.canvas));
    }

    createStartingGrid(): StartingGrid {
        return new StartingGrid(new RectangleTrack(this.canvas));
    }

    createRoadMarkings(): RoadMarkings {
        return new RoadMarkings(new RectangleTrack(this.canvas));
    }

    createTrackGrass(): TrackGrass {
        return new TrackGrass(new RectangleTrack(this.canvas));
    }

    createLapTracker(): LapTracker {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        return new LapTracker(track, player, startingGrid);
    }

    createGameScore(): GameScore {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        const lapTracker = new LapTracker(track, player, startingGrid);
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

    createTrackBoundaryFeature(): {
        trackBoundary: TrackBoundary;
        startingGrid: StartingGrid;
        player: ArrowPlayer;
    } {
        const track = new RectangleTrack(this.canvas);
        const trackBoundary = new TrackBoundary(track);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );

        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());
        player.setInputEnabled(true);

        return { trackBoundary, startingGrid, player };
    }

    createCountdownFeature(): {
        track: RectangleTrack;
        startingGrid: StartingGrid;
        player: ArrowPlayer;
        countdown: Countdown;
    } {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        const countdown = new Countdown(
            () => {
                console.log("Countdown complete!");
            },
            (block: boolean) => {
                // This callback handles input blocking/unblocking
                player.setInputEnabled(!block);
            },
            () => {
                player.setInputEnabled(false);
            }
        );

        player.setStartingPosition(startingGrid.getStartingPosition());

        return { track, startingGrid, player, countdown };
    }

    createLapTrackerFeature(): {
        track: RectangleTrack;
        startingGrid: StartingGrid;
        player: ArrowPlayer;
        lapTracker: LapTracker;
        countdown: Countdown;
    } {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        const lapTracker = new LapTracker(track, player, startingGrid);
        const countdown = new Countdown(
            () => {
                console.log("Countdown complete!");
                player.setInputEnabled(true);
                lapTracker.start();
            },
            undefined,
            () => {
                player.setInputEnabled(false);
            }
        );

        player.setStartingPosition(startingGrid.getStartingPosition());

        return { track, startingGrid, player, lapTracker, countdown };
    }

    createContinueFeature(): {
        track: RectangleTrack;
        trackBoundary: TrackBoundary;
        startingGrid: StartingGrid;
        player: ArrowPlayer;
        lapTracker: LapTracker;
        countdown: Countdown;
        continueBtn: Continue;
    } {
        const track = new RectangleTrack(this.canvas);
        const trackBoundary = new TrackBoundary(track);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            startingGrid
        );
        const countdown = new Countdown(
            () => {
                console.log("Countdown complete!");
                player.setInputEnabled(true);
                lapTracker.start();
            },
            undefined,
            () => {
                player.setInputEnabled(false);
            }
        );
        const continueBtn = new Continue(this.gameEngine.input);
        const lapTracker = new LapTracker(track, player, startingGrid);

        player.setTrackBoundary(trackBoundary);
        player.setStartingPosition(startingGrid.getStartingPosition());
        continueBtn.setOnRestartRace(() => {
            console.log("Restart");
            continueBtn.hide();
            countdown.startAgain();
        });
        lapTracker.setRaceCompleteCallback(() => {
            continueBtn.show();
        });

        return {
            track,
            trackBoundary,
            startingGrid,
            player,
            lapTracker,
            countdown,
            continueBtn,
        };
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
                return this.createTrackBoundaryFeature();
            case MultiSceneType.MULTI_COUNTDOWN:
                return this.createCountdownFeature();
            case MultiSceneType.MULTI_LAP_TRACKER:
                return this.createLapTrackerFeature();
            case MultiSceneType.MULTI_CONTINUE:
                return this.createContinueFeature();
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

        Object.values(scenes).forEach((scene: any) => {
            if (scene && scene.name) {
                switch (scene.name) {
                    case SceneType.ARROW_PLAYER:
                        this.gameEngine.registerScene(
                            SceneType.ARROW_PLAYER,
                            scene as Scene
                        );
                        break;
                    case SceneType.RECTANGLE_TRACK:
                        this.gameEngine.registerScene(
                            SceneType.RECTANGLE_TRACK,
                            scene as Scene
                        );
                        break;
                    case SceneType.TRACK_BOUNDARY:
                        this.gameEngine.registerScene(
                            SceneType.TRACK_BOUNDARY,
                            scene as Scene
                        );
                        break;
                    case SceneType.STARTING_GRID:
                        this.gameEngine.registerScene(
                            SceneType.STARTING_GRID,
                            scene as Scene
                        );
                        break;
                    case SceneType.ROAD_MARKINGS:
                        this.gameEngine.registerScene(
                            SceneType.ROAD_MARKINGS,
                            scene as Scene
                        );
                        break;
                    case SceneType.LAP_TRACKER:
                        this.gameEngine.registerScene(
                            SceneType.LAP_TRACKER,
                            scene as Scene
                        );
                        break;
                    case SceneType.COUNTDOWN:
                        this.gameEngine.registerScene(
                            SceneType.COUNTDOWN,
                            scene as Scene
                        );
                        break;
                    case SceneType.CONTINUE:
                        this.gameEngine.registerScene(
                            SceneType.CONTINUE,
                            scene as Scene
                        );
                        break;
                    default:
                        console.warn(`Unknown scene type: ${scene.name}`);
                        break;
                }
            }
        });
    }

    registerAllScenes(): void {
        Object.values(SceneType).forEach((sceneType) => {
            this.registerScene(sceneType as SceneType);
        });
    }
}

export function registerScenes(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement,
    mode: "all" | "current",
    currentScene: SceneType | null,
    multiScene: MultiSceneType | null
) {
    const factory = new SceneFactory(gameEngine, canvas);

    if (mode === "all") {
        if (multiScene) {
            factory.registerMultiScene(multiScene);
        } else {
            console.error("No valid multi-scene specified for 'all' mode");
        }
    } else {
        if (currentScene) {
            factory.registerScene(currentScene);
            gameEngine.transitionToScene(currentScene);
        } else {
            console.error("No valid single scene specified for 'current' mode");
        }
    }
}
