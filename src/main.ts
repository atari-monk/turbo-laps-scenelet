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
import { MenuScene } from "./scenes/menu";

let SCENE_MODE: "all" | "current" = "current";
const TEST_SCENE_INDEX = 0;
const ALL_SCENES = [
    "Menu",
    "Elipse Track",
    "Rectangle Track",
    "Arrow Player",
    "Starting Grid",
    "Track Boundary",
    "Road Markings",
    "Track Grass",
    "Lap Tracker",
    "Game Score",
];

window.addEventListener("load", async () => {
    const gameEngine = setupEngine();
    createGameCanvas("canvas-container", "game-canvas", gameEngine);
    const { canvas } = getCanvasSizeById("game-canvas");

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

function registerScenesForCurrentMode(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);

    gameEngine.registerScene("Menu", new MenuScene(gameEngine.input));
    gameEngine.registerScene("Elipse Track", new ElipseTrack(canvas));
    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene(
        "Arrow Player",
        new ArrowPlayer(canvas, gameEngine.input)
    );
    gameEngine.registerScene("Starting Grid", new StartingGrid(track));
    gameEngine.registerScene("Track Boundary", new TrackBoundary(track));
    gameEngine.registerScene("Road Markings", new RoadMarkings(track));
    gameEngine.registerScene("Track Grass", new TrackGrass(track));
    gameEngine.registerScene(
        "Lap Tracker",
        new LapTracker(track, new ArrowPlayer(canvas, gameEngine.input))
    );
    gameEngine.registerScene(
        "Game Score",
        new GameScore(
            new LapTracker(track, new ArrowPlayer(canvas, gameEngine.input))
        )
    );
}

function registerScenesForAllMode(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement
) {
    const track = new RectangleTrack(canvas);
    const arrowPlayer = new ArrowPlayer(canvas, gameEngine.input);
    const trackBoundary = new TrackBoundary(track);
    const startingGrid = new StartingGrid(track);
    const roadMarkings = new RoadMarkings(track);
    const trackGrass = new TrackGrass(track);
    const lapTracker = new LapTracker(track, arrowPlayer);
    const gameScore = new GameScore(lapTracker);

    arrowPlayer.setTrackBoundary(trackBoundary);
    arrowPlayer.setStartingPosition(startingGrid.getStartingPosition());

    gameEngine.registerScene("Rectangle Track", track);
    gameEngine.registerScene("Track Boundary", trackBoundary);
    gameEngine.registerScene("Starting Grid", startingGrid);
    gameEngine.registerScene("Road Markings", roadMarkings);
    gameEngine.registerScene("Track Grass", trackGrass);
    gameEngine.registerScene("Arrow Player", arrowPlayer);
    gameEngine.registerScene("Lap Tracker", lapTracker);
    gameEngine.registerScene("Game Score", gameScore);
}

function registerScenes(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
    if (SCENE_MODE === "current") {
        registerScenesForCurrentMode(gameEngine, canvas);
    } else {
        registerScenesForAllMode(gameEngine, canvas);
    }
}

function setupEngine() {
    const gameEngineFactory = new GameEngineFactory();
    const gameEngine = gameEngineFactory.getGameEngine();
    return gameEngine;
}

function getCanvasSizeById(canvasId: string): {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
} {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        throw new Error(`Canvas element with ID '${canvasId}' not found`);
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(
            `Element with ID '${canvasId}' is not a canvas element`
        );
    }

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
    };
}
