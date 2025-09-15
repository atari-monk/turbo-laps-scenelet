import type { GameEngine } from "zippy-game-engine";
import { ElipseTrack } from "../scene/elipse-track";
import { RectangleTrack } from "../scene/rectangle-track";
import { TrackBoundary } from "../scene/track-boundary";
import { StartingGrid } from "../scene/starting-grid";
import { RoadMarkings } from "../scene/road-markings";
import { TrackGrass } from "../scene/track-grass";
import { LapTracker } from "../scene/lap-tracker";
import { MouseCursor } from "../scene/mouse-cursor";
import { Countdown } from "../scene/countdown";
import { Continue } from "../scene/continue";
import { Menu } from "../scene/menu";
import type { PositionProvider } from "../type/position-provider";
import { GameScore } from "../scene/game-score";
import { VirtualJoystick } from "../virtual-joystick/virtual-joystick";
import { type VirtualJoystickConfig } from "../virtual-joystick/VirtualJoystickConfig";
import { TestCar } from "../scene/test-car";
import { SteerableRect } from "../scene/steerable-rect";

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
        turnOn = false
    ): LapTracker {
        return new LapTracker(positionProvider, turnOn);
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

    public createMenu(): Menu {
        return new Menu(this.gameEngine.input);
    }

    public createGameScore(): GameScore {
        return new GameScore();
    }

    public createVirtualJoystick(
        config: VirtualJoystickConfig = {}
    ): VirtualJoystick {
        return new VirtualJoystick(this.canvas, config);
    }

    public createTestCar(): TestCar {
        return new TestCar(this.canvas);
    }

    public createSteerableRect(): SteerableRect {
        return new SteerableRect(this.canvas);
    }
}
