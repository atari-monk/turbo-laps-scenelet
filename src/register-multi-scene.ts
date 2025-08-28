import { GameEngine } from "zippy-game-engine";
import { ArrowPlayer } from "./scenes/arrow-player";
import { Continue } from "./scenes/continue";
import { Countdown } from "./scenes/countdown";
import { LapTracker } from "./scenes/lap-tracker";
import { RectangleTrack } from "./scenes/rectangle-track";
import { StartingGrid } from "./scenes/starting-grid";
import { TrackBoundary } from "./scenes/track-boundary";

export function registerBoundaryTest(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const trackBoundary = new TrackBoundary(track);
    const startingGrid = new StartingGrid(track);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);

    arrowPlayer.setTrackBoundary(trackBoundary);
    arrowPlayer.setStartingPosition(startingGrid.getStartingPosition());

    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene("Track Boundary", trackBoundary);
    gameEngine.registerScene("Starting Grid", startingGrid);
    gameEngine.registerScene("Arrow Player", arrowPlayer);
}

export function registerCountdownTest(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const countdown = new Countdown(
        () => {
            console.log("Countdown complete!");
            arrowPlayer.setInputEnabled(true);
        },
        undefined,
        () => {
            arrowPlayer.setInputEnabled(false);
        }
    );
    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene("Arrow Player", arrowPlayer);
    gameEngine.registerScene("Countdown", countdown);
}

export function registerLapTrackerTest(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const trackBoundary = new TrackBoundary(track);
    const startingGrid = new StartingGrid(track);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const lapTracker = new LapTracker(track, arrowPlayer, startingGrid);
    const continueBtn = new Continue(gameEngine.input);

    arrowPlayer.setTrackBoundary(trackBoundary);
    arrowPlayer.setStartingPosition(startingGrid.getStartingPosition());

    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene("Track Boundary", trackBoundary);
    gameEngine.registerScene("Starting Grid", startingGrid);
    gameEngine.registerScene("Arrow Player", arrowPlayer);
    gameEngine.registerScene("Lap Tracker", lapTracker);
    gameEngine.registerScene("Continue", continueBtn);

    arrowPlayer.setInputEnabled(true);
    lapTracker.start();
}

export function registerContinueBtnTest(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const trackBoundary = new TrackBoundary(track);
    const startingGrid = new StartingGrid(track);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const lapTracker = new LapTracker(track, arrowPlayer, startingGrid);
    const continueBtn = new Continue(gameEngine.input);

    arrowPlayer.setTrackBoundary(trackBoundary);
    arrowPlayer.setStartingPosition(startingGrid.getStartingPosition());

    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene("Track Boundary", trackBoundary);
    gameEngine.registerScene("Starting Grid", startingGrid);
    gameEngine.registerScene("Arrow Player", arrowPlayer);
    gameEngine.registerScene("Lap Tracker", lapTracker);
    gameEngine.registerScene("Continue", continueBtn);

    arrowPlayer.setInputEnabled(true);
    lapTracker.start();
}
