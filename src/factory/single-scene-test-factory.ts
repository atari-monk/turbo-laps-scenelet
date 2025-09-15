import type { GameEngine, Scene } from "zippy-game-engine";
import type { SceneInstanceFactory } from "./scene-instance-factory";
import { MultiSceneTestFactory } from "./multi-scene-test-factory";
import { MockLapTracker } from "../mock/mock-lap-tracker";
import { TrackConfigService } from "../service/track-config.service";
import { SoundSceneFactory } from "./sound-scene-factory";
import { WebAudioService } from "../service/web-audio-service";
import type { SoundConfig } from "../type/sound-config";
import { MultiSceneId, SceneId } from "../tester/const";
import type { CarFactory } from "../car/car-factory";

export class SingleSceneTestFactory {
    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly gameEngine: GameEngine,
        private readonly factory: SceneInstanceFactory,
        private readonly carFactory: CarFactory
    ) {}

    async createSingleSceneTest(sceneType: SceneId): Promise<Scene> {
        if (sceneType === SceneId.ELIPSE_TRACK)
            return this.factory.createElipseTrack();
        if (sceneType === SceneId.RECTANGLE_TRACK)
            return this.factory.createRectangleTrack();
        if (sceneType === SceneId.CAR)
            return await this.carFactory.createCar(true);

        if (
            [
                SceneId.TRACK_BOUNDARY,
                SceneId.STARTING_GRID,
                SceneId.ROAD_MARKINGS,
                SceneId.TRACK_GRASS,
            ].includes(sceneType)
        ) {
            TrackConfigService.getInstance().calculateTrackState(this.canvas);
        }

        if (sceneType === SceneId.TRACK_BOUNDARY)
            return this.factory.createTrackBoundary();
        if (sceneType === SceneId.STARTING_GRID)
            return this.factory.createStartingGrid();
        if (sceneType === SceneId.ROAD_MARKINGS)
            return this.factory.createRoadMarkings();
        if (sceneType === SceneId.TRACK_GRASS)
            return this.factory.createTrackGrass();
        if (sceneType === SceneId.LAP_TRACKER)
            return this.factory.createLapTracker(
                {
                    position: { x: 50, y: 500 },
                },
                true
            );
        if (sceneType === SceneId.COUNTDOWN)
            return this.factory.createCountdown(
                () => {
                    console.log("GO GO GO");
                },
                () => {
                    console.log("Countdown done");
                }
            );
        if (sceneType === SceneId.CONTINUE) {
            const continueScene = this.factory.createContinue();
            continueScene.show();
            return continueScene;
        }
        if (sceneType === SceneId.MOUSE_CURSOR)
            return this.factory.createMouseCursor();
        if (sceneType === SceneId.MENU) {
            const menu = this.factory.createMenu();
            menu.setOnStartGame(async () => {
                const factory = new MultiSceneTestFactory(
                    this.canvas,
                    this.factory,
                    this.carFactory
                );
                const scenes = await factory.createMultiSceneTest(
                    MultiSceneId.RACE_RESTART
                );
                scenes.forEach((scene) => {
                    this.gameEngine.registerScene(scene.name!, scene);
                });
                menu.toggle();
                this.gameEngine.setSceneMode("all");
            });
            return menu;
        }
        if (sceneType === SceneId.GAME_SCORE) {
            const mockLapTracker = new MockLapTracker();
            mockLapTracker.setMockLapTimes([12000]);
            mockLapTracker.triggerRaceComplete();
            const gameScore = this.factory.createGameScore();
            gameScore.onRaceComplete(mockLapTracker);
            return gameScore;
        }
        if (sceneType === SceneId.SOUND_DEMO) {
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
        if (sceneType === SceneId.VIRTUAL_JOYSTICK) {
            return this.factory.createVirtualJoystick();
        }
        if (sceneType === SceneId.TEST_CAR) {
            return this.factory.createTestCar();
        }
        if (sceneType === SceneId.STEERABLE_RECT) {
            return this.factory.createSteerableRect();
        }
        throw new Error(`Unknown scene type: ${sceneType}`);
    }
}
