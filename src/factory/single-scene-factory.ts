import { SceneType } from "../types/scene-type";
import type { GameEngine, Scene } from "zippy-game-engine";
import { ElipseTrack } from "../scenes/elipse-track";
import { RectangleTrack } from "../scenes/rectangle-track";
import { ArrowPlayer } from "../scenes/arrow-player";
import { TrackBoundary } from "../scenes/track-boundary";
import { StartingGrid } from "../scenes/starting-grid";
import { RoadMarkings } from "../scenes/road-markings";
import { TrackConfigService } from "../scenes/service/track-config.service";
import { TrackGrass } from "../scenes/track-grass";
import { LapTracker } from "../scenes/lap-tracker";
import { MouseCursor } from "../scenes/mouse-cursor";

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

    TrackConfigService.getInstance().calculateTrackState(canvas);

    if (sceneType === SceneType.TRACK_BOUNDARY)
        return new TrackBoundary(canvas);
    if (sceneType === SceneType.STARTING_GRID) return new StartingGrid();
    if (sceneType === SceneType.ROAD_MARKINGS) return new RoadMarkings();
    if (sceneType === SceneType.TRACK_GRASS) return new TrackGrass();
    if (sceneType === SceneType.LAP_TRACKER) {
        const tracker = new LapTracker(
            {
                position: { x: 50, y: 500 },
            },
            true
        );
        return tracker;
    }
    if (sceneType === SceneType.MOUSE_CURSOR)
        return new MouseCursor(gameEngine.input);
    return {} as Scene;
}
