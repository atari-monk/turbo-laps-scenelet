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

let SCENE_MODE: "all" | "current" = "all";
const TEST_SCENE_INDEX: number = 10; //0-9 single scene test, 10-x multi scene test
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
    //Composite scene tests
    "Boundary Test",
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
    gameEngine.registerScene("Lap Tracker", new LapTracker(track, arrowPlayer));
}

function registerGameScore(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const lapTracker = new LapTracker(track, arrowPlayer);
    gameEngine.registerScene("Game Score", new GameScore(lapTracker));
}

function registerMenu(gameEngine: GameEngine, _canvas: HTMLCanvasElement) {
    gameEngine.registerScene("Menu", new Menu(gameEngine.input));
}

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
    //multi scene tests
    if (TEST_SCENE_INDEX === 10) registerBoundaryTest(gameEngine, canvas);
}

function setupEngine() {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();
    return gameEngine;
}
