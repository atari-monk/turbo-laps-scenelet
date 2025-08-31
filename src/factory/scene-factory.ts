import { SceneType } from "../types/scene-type";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ElipseTrack } from "../scenes/elipse-track";
import { RectangleTrack } from "../scenes/rectangle-track";
import { ArrowPlayer } from "../scenes/arrow-player";
import { TrackBoundary } from "../scenes/track-boundary";
import { StartingGrid } from "../scenes/starting-grid";
import { RoadMarkings } from "../scenes/road-markings";
import { TrackGrass } from "../scenes/track-grass";
import { LapTracker } from "../scenes/lap-tracker";
import { GameScore } from "../scenes/game-score";
import { Menu } from "../scenes/menu";
import { Countdown } from "../scenes/countdown";
import { Continue } from "../scenes/continue";

export class SceneFactory {
    constructor(
        private gameEngine: GameEngine,
        private canvas: HTMLCanvasElement
    ) {}

    getElipseTrack(): ElipseTrack {
        return new ElipseTrack(this.canvas);
    }

    getRectangleTrack(): RectangleTrack {
        return new RectangleTrack(this.canvas);
    }

    getArrowPlayer(): ArrowPlayer {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(this.canvas, this.gameEngine.input);
        player.setInputEnabled(true);
        return player;
    }

    getTrackBoundary(): TrackBoundary {
        return new TrackBoundary();
    }

    getStartingGrid(): StartingGrid {
        return new StartingGrid(new RectangleTrack(this.canvas));
    }

    getRoadMarkings(): RoadMarkings {
        return new RoadMarkings(new RectangleTrack(this.canvas));
    }

    getTrackGrass(): TrackGrass {
        return new TrackGrass(new RectangleTrack(this.canvas));
    }

    getLapTracker(): LapTracker {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input
            //startingGrid
        );
        const lapTracker = new LapTracker(track, player);
        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
        });
        return lapTracker;
    }

    //todo: this needs fix, show, hide
    getGameScore(): GameScore {
        const track = new RectangleTrack(this.canvas);
        const startingGrid = new StartingGrid(track);
        const player = new ArrowPlayer(
            this.canvas,
            this.gameEngine.input
            //startingGrid
        );
        const lapTracker = new LapTracker(track, player);
        lapTracker.setRaceCompleteCallback(() => {
            lapTracker.reset();
            player.setInputEnabled(false);
            player.setStartingPosition(startingGrid.getStartingPosition());
        });
        return new GameScore(lapTracker);
    }

    getMenu(): Menu {
        return new Menu(this.gameEngine.input);
    }

    getCountdown(): Countdown {
        return new Countdown(
            () => {
                console.log("On GO!");
            },
            () => {
                console.log("Countdown complete!");
            }
        );
    }

    getContinue(): Continue {
        const continueBtn = new Continue(this.gameEngine.input);
        continueBtn.show();
        continueBtn.setOnRestartRace(() => {
            console.log("Restart");
        });
        return continueBtn;
    }

    generateScene(sceneType: SceneType): Scene {
        switch (sceneType) {
            case SceneType.ELIPSE_TRACK:
                return this.getElipseTrack();
            case SceneType.RECTANGLE_TRACK:
                return this.getRectangleTrack();
            case SceneType.ARROW_PLAYER:
                return this.getArrowPlayer();
            case SceneType.TRACK_BOUNDARY:
                return this.getTrackBoundary();
            case SceneType.STARTING_GRID:
                return this.getStartingGrid();
            case SceneType.ROAD_MARKINGS:
                return this.getRoadMarkings();
            case SceneType.TRACK_GRASS:
                return this.getTrackGrass();
            case SceneType.LAP_TRACKER:
                return this.getLapTracker();
            case SceneType.GAME_SCORE:
                return this.getGameScore();
            case SceneType.MENU:
                return this.getMenu();
            case SceneType.COUNTDOWN:
                return this.getCountdown();
            case SceneType.CONTINUE:
                return this.getContinue();
            default:
                throw new Error(`Unknown scene type: ${sceneType}`);
        }
    }
}
