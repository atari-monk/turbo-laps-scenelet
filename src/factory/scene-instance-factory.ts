import type { GameEngine } from "zippy-game-engine";
import { ElipseTrack } from "../scenes/elipse-track";
import { RectangleTrack } from "../scenes/rectangle-track";
import { ArrowPlayer } from "../scenes/arrow-player";
import { TrackBoundary } from "../scenes/track-boundary";
import { StartingGrid } from "../scenes/starting-grid";
import { RoadMarkings } from "../scenes/road-markings";
import { TrackGrass } from "../scenes/track-grass";
import { LapTracker } from "../scenes/lap-tracker";
import { MouseCursor } from "../scenes/mouse-cursor";
import { Countdown } from "../scenes/countdown";
import { Continue } from "../scenes/continue";
import type { PositionProvider } from "../scenes/types/position-provider";

export class SceneInstanceFactory {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly canvas: HTMLCanvasElement
    ) {}

    public createElipseTrack(): ElipseTrack {
        return new ElipseTrack(this.canvas);
    }

    public createRectangleTrack(): RectangleTrack {
        return new RectangleTrack(this.canvas);
    }

    public createArrowPlayer(enableControls = false): ArrowPlayer {
        return new ArrowPlayer(
            this.canvas,
            this.gameEngine.input,
            enableControls
        );
    }

    public createTrackBoundary(): TrackBoundary {
        return new TrackBoundary(this.canvas);
    }

    public createStartingGrid(): StartingGrid {
        return new StartingGrid();
    }

    public createRoadMarkings(): RoadMarkings {
        return new RoadMarkings();
    }

    public createTrackGrass(): TrackGrass {
        return new TrackGrass();
    }

    public createLapTracker(
        positionProvider: PositionProvider,
        turnOn = false,
        sectors = 4
    ): LapTracker {
        return new LapTracker(positionProvider, turnOn, sectors);
    }

    public createCountdown(
        onCountdownGO: () => void,
        onCountdownComplete: () => void
    ): Countdown {
        return new Countdown(onCountdownGO, onCountdownComplete);
    }

    public createContinue(): Continue {
        return new Continue(this.gameEngine.input);
    }

    public createMouseCursor(): MouseCursor {
        return new MouseCursor(this.gameEngine.input);
    }
}
