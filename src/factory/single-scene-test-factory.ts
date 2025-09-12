import type { GameEngine, Scene } from "zippy-game-engine";
import { SceneType } from "../type/scene-type";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { MultiSceneTestFactory } from "./multi-scene-test-factory";
import { MultiSceneType } from "../type/multi-scene-type";
import { MockLapTracker } from "../mock/mock-lap-tracker";
import { TrackConfigService } from "../service/track-config.service";
import { SoundSceneFactory } from "./sound-scene-factory";
import { WebAudioService } from "../service/web-audio-service";
import type { SoundConfig } from "../type/sound-config";

export class SingleSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly gameEngine: GameEngine,
        private readonly factory: SceneInstanceFactory
    ) {}

    async createSingleSceneTest(sceneType: SceneType): Promise<Scene> {
        if (sceneType === SceneType.ELIPSE_TRACK)
            return this.factory.createElipseTrack();
        if (sceneType === SceneType.RECTANGLE_TRACK)
            return this.factory.createRectangleTrack();
        if (sceneType === SceneType.CAR)
            return await this.factory.createCar(true);

        if (
            [
                SceneType.TRACK_BOUNDARY,
                SceneType.STARTING_GRID,
                SceneType.ROAD_MARKINGS,
                SceneType.TRACK_GRASS,
            ].includes(sceneType)
        ) {
            TrackConfigService.getInstance().calculateTrackState(this.canvas);
        }

        if (sceneType === SceneType.TRACK_BOUNDARY)
            return this.factory.createTrackBoundary();
        if (sceneType === SceneType.STARTING_GRID)
            return this.factory.createStartingGrid();
        if (sceneType === SceneType.ROAD_MARKINGS)
            return this.factory.createRoadMarkings();
        if (sceneType === SceneType.TRACK_GRASS)
            return this.factory.createTrackGrass();
        if (sceneType === SceneType.LAP_TRACKER)
            return this.factory.createLapTracker(
                {
                    position: { x: 50, y: 500 },
                },
                true
            );
        if (sceneType === SceneType.COUNTDOWN)
            return this.factory.createCountdown(
                () => {
                    console.log("GO GO GO");
                },
                () => {
                    console.log("Countdown done");
                }
            );
        if (sceneType === SceneType.CONTINUE) {
            const continueScene = this.factory.createContinue();
            continueScene.show();
            return continueScene;
        }
        if (sceneType === SceneType.MOUSE_CURSOR)
            return this.factory.createMouseCursor();
        if (sceneType === SceneType.MENU) {
            const menu = this.factory.createMenu();
            menu.setOnStartGame(async () => {
                const factory = new MultiSceneTestFactory(
                    this.canvas,
                    this.factory
                );
                const scenes = await factory.createMultiSceneTest(
                    MultiSceneType.RACE_RESTART
                );
                scenes.forEach((scene) => {
                    this.gameEngine.registerScene(scene.name!, scene);
                });
                menu.toggle();
                this.gameEngine.setSceneMode("all");
            });
            return menu;
        }
        if (sceneType === SceneType.GAME_SCORE) {
            const mockLapTracker = new MockLapTracker();
            mockLapTracker.setMockLapTimes([12000]);
            mockLapTracker.triggerRaceComplete();
            const gameScore = this.factory.createGameScore();
            gameScore.onRaceComplete(mockLapTracker);
            return gameScore;
        }
        if (sceneType === SceneType.SOUND_DEMO) {
            const sounds: SoundConfig[] = [
                { key: "background-music", path: `/assets/audio/melody.wav` },
                { key: "click-sound", path: `/assets/audio/click.wav` },
                { key: "effect-sound", path: `/assets/audio/effect.mp3` },
            ];
            return SoundSceneFactory.createSoundSceneWithCustomSounds(
                sounds,
                new WebAudioService(),
                this.gameEngine.input
            );
        }
        if (sceneType === SceneType.VIRTUAL_JOYSTICK) {
            return this.factory.createVirtualJoystick();
        }
        if (sceneType === SceneType.TEST_CAR) {
            return this.factory.createTestCar();
        }
        if (sceneType === SceneType.STEERABLE_RECT) {
            return this.factory.createSteerableRect();
        }
        throw new Error(`Unknown scene type: ${sceneType}`);
    }
}
