import "./style.css";
import "fullscreen-canvas-vanilla";
import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { GameEngine, GameEngineFactory } from "zippy-game-engine";
import { RectangleTrack } from "./scenes/rectangle-track";
import { ArrowPlayer } from "./scenes/arrow-player";
import { ElipseTrack } from "./scenes/elipse-track";
import { StartingGrid } from "./scenes/starting-grid";
import { TrackBoundary } from "./scenes/track-boundary";
import { RoadMarkings } from "./scenes/road-markings";
import { TrackGrass } from "./scenes/track-grass";
import { LapTracker } from "./scenes/lap-tracker";
import { GameScore } from "./scenes/game-score";
import { Menu } from "./scenes/menu";
import { getCanvasSizeById } from "./tools";
import { Countdown } from "./scenes/countdown";
import { Continue } from "./scenes/continue";

let SCENE_MODE: "all" | "current" = "current";
const TEST_SCENE_INDEX: number = 11; //0-11 single scene test, 12-14 multi scene test
const ALL_SCENES = [
    "Elipse Track",
    "Rectangle Track",
    "Arrow Player",
    "Track Boundary",
    "Starting Grid",
    "Road Markings",
    "Track Grass",
    "Lap Tracker",
    "Game Score",
    "Menu",
    "Countdown",
    "Continue",
    //Composite scene tests
    "Track Boundary Test",
    "Countdown Test",
    "Lap Tracker Test",
];

let gameEngine: GameEngine;

window.addEventListener("load", async () => {
    gameEngine = setupEngine();
    createGameCanvas("canvas-container", "game-canvas", gameEngine);
    const { canvas } = getCanvasSizeById("game-canvas");
    gameEngine.input.setupCanvasEvents(canvas);

    gameEngine.setSceneMode(SCENE_MODE);
    registerScenes(gameEngine, canvas);

    if ((SCENE_MODE as string) === "current") {
        if (TEST_SCENE_INDEX >= 0 && TEST_SCENE_INDEX < ALL_SCENES.length) {
            gameEngine.transitionToScene(ALL_SCENES[TEST_SCENE_INDEX]);
        } else {
            console.warn(
                `Invalid test scene index: ${TEST_SCENE_INDEX}. Available scenes: ${ALL_SCENES.length}`
            );
        }
    }
});

function registerElipseTrack(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Elipse Track", new ElipseTrack(canvas));
}

function registerRectangleTrack(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene("Rectangle Track", new RectangleTrack(canvas));
}

function registerArrowPlayer(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Arrow Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
}

function registerTrackBoundary(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Track Boundary",
        new TrackBoundary(new RectangleTrack(canvas))
    );
}

function registerStartingGrid(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Starting Grid",
        new StartingGrid(new RectangleTrack(canvas))
    );
}

function registerRoadMarkings(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    gameEngine.registerScene(
        "Road Markings",
        new RoadMarkings(new RectangleTrack(canvas))
    );
}

function registerTrackGrass(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    gameEngine.registerScene(
        "Track Grass",
        new TrackGrass(new RectangleTrack(canvas))
    );
}

function registerLapTracker(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const startingGrid = new StartingGrid(track);
    gameEngine.registerScene(
        "Lap Tracker",
        new LapTracker(track, arrowPlayer, startingGrid)
    );
}

function registerGameScore(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const startingGrid = new StartingGrid(track);
    const lapTracker = new LapTracker(track, arrowPlayer, startingGrid);
    gameEngine.registerScene("Game Score", new GameScore(lapTracker));
}

function registerMenu(gameEngine: GameEngine, _canvas: HTMLCanvasElement) {
    gameEngine.registerScene("Menu", new Menu(gameEngine.input));
}

function registerCountdown(gameEngine: GameEngine, _canvas: HTMLCanvasElement) {
    const countdown = new Countdown(() => {
        console.log("Countdown complete!");
    });
    gameEngine.registerScene("Countdown", countdown);
}

function registerContinueBtn(
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

// Composite scene test

function registerBoundaryTest(
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

function registerCountdownTest(
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

function registerLapTrackerTest(
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

function registerScenes(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    //single scene tests
    if (TEST_SCENE_INDEX === 0) registerElipseTrack(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 1) registerRectangleTrack(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 2) registerArrowPlayer(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 3) registerTrackBoundary(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 4) registerStartingGrid(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 5) registerRoadMarkings(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 6) registerTrackGrass(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 7) registerLapTracker(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 8) registerGameScore(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 9) registerMenu(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 10) registerCountdown(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 11) registerContinueBtn(gameEngine, canvas);
    //multi scene tests
    if (TEST_SCENE_INDEX === 12) registerBoundaryTest(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 13) registerCountdownTest(gameEngine, canvas);
    if (TEST_SCENE_INDEX === 14) registerLapTrackerTest(gameEngine, canvas);
}

function setupEngine() {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();
    return gameEngine;
}
