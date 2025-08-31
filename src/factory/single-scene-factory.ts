import { SceneType } from "../types/scene-type";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ElipseTrack } from "../scenes/elipse-track";
import { RectangleTrack } from "../scenes/rectangle-track";
import { ArrowPlayer } from "../scenes/arrow-player";
import { TrackBoundary } from "../scenes/track-boundary";

export function singleSceneFactory(
    gameEngine: GameEngine,
    canvas: HTMLCanvasElement,
    sceneType: SceneType
): Scene {
    if (sceneType === SceneType.ELIPSE_TRACK) return new ElipseTrack(canvas);
    if (sceneType === SceneType.RECTANGLE_TRACK)
        return new RectangleTrack(canvas);
    if (sceneType === SceneType.ARROW_PLAYER)
        return new ArrowPlayer(canvas, gameEngine.input, true);
    if (sceneType === SceneType.TRACK_BOUNDARY)
        return new TrackBoundary(canvas);
    return new ElipseTrack(canvas);
}
