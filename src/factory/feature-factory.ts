import { MultiSceneType } from "../types/multi-scene-type";
import type { GameEngine, Scene } from "zippy-game-engine";
import { TrackBoundaryFactory } from "./track-boundary-factory";
import { CountdownFactory } from "./countdown-factory";
import { LapTrackerFactory } from "./lap-tracker-factory";
import { ContinueFactory } from "./continue-factory";

export class FeatureFactory {
    constructor(
        private gameEngine: GameEngine,
        private canvas: HTMLCanvasElement
    ) {}

    generateSceneArray(scene: MultiSceneType): Scene[] {
        const scenes: Scene[] = [];
        if (scene === MultiSceneType.TRACK_BOUNDARY)
            scenes.push(
                ...new TrackBoundaryFactory(
                    this.gameEngine,
                    this.canvas
                ).generateSceneArray()
            );
        if (scene === MultiSceneType.COUNTDOWN)
            scenes.push(
                ...new CountdownFactory(
                    this.gameEngine,
                    this.canvas
                ).generateSceneArray()
            );
        if (scene === MultiSceneType.LAP_TRACKER)
            scenes.push(
                ...new LapTrackerFactory(
                    this.gameEngine,
                    this.canvas
                ).generateSceneArray()
            );
        if (scene === MultiSceneType.CONTINUE)
            scenes.push(
                ...new ContinueFactory(
                    this.gameEngine,
                    this.canvas
                ).generateSceneArray()
            );
        return scenes;
    }
}
