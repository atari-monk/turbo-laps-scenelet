import type { GameEngine } from "zippy-game-engine";
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

export function registerElipseTrack(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Elipse Track", new ElipseTrack(canvas));
}

export function registerRectangleTrack(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Rectangle Track", new RectangleTrack(canvas));
}

export function registerArrowPlayer(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Arrow Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
}

export function registerTrackBoundary(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Track Boundary",
        new TrackBoundary(new RectangleTrack(canvas))
    );
}

export function registerStartingGrid(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Starting Grid",
        new StartingGrid(new RectangleTrack(canvas))
    );
}

export function registerRoadMarkings(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Road Markings",
        new RoadMarkings(new RectangleTrack(canvas))
    );
}

export function registerTrackGrass(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Track Grass",
        new TrackGrass(new RectangleTrack(canvas))
    );
}

export function registerLapTracker(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const startingGrid = new StartingGrid(track);
    gameEngine.registerScene(
        "Lap Tracker",
        new LapTracker(track, arrowPlayer, startingGrid)
    );
}

export function registerGameScore(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const startingGrid = new StartingGrid(track);
    const lapTracker = new LapTracker(track, arrowPlayer, startingGrid);
    gameEngine.registerScene("Game Score", new GameScore(lapTracker));
}

export function registerMenu(
    gameEngine: GameEngine,
    _canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Menu", new Menu(gameEngine.input));
}

export function registerCountdown(
    gameEngine: GameEngine,
    _canvas: HTMLCanvasElement
) {
    const countdown = new Countdown(() => {
        console.log("Countdown complete!");
    });
    gameEngine.registerScene("Countdown", countdown);
}

export function registerContinueBtn(
    gameEngine: GameEngine,
    _canvas: HTMLCanvasElement
) {
    const continueBtn = new Continue(gameEngine.input);
    continueBtn.show();
    continueBtn.setOnRestartRace(() => {
        console.log("Restart");
    });
    gameEngine.registerScene("Continue", continueBtn);
}
