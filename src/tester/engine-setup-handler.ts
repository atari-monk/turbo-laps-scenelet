import { createGameCanvas } from "fullscreen-canvas-vanilla";
import type { GameEngine } from "zippy-game-engine";
import { buildMenu } from "../builder/menu-builder";
import { MultiSceneTestFactory } from "../factory/multi-scene-test-factory";
import { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { SingleSceneTestFactory } from "../factory/single-scene-test-factory";
import { setupEngine, getCanvasSizeById, logTestUrls } from "../tools";
import { SceneId } from "./enum/scene-id";
import type { UrlParamsHandler } from "./url-params-handler";

export class EngineSetupHandler {
    private readonly urlParamsHandler: UrlParamsHandler;
    private gameEngine: GameEngine | null = null;

    constructor(urlParamsHandler: UrlParamsHandler) {
        this.urlParamsHandler = urlParamsHandler;
    }

    async initialize(): Promise<void> {
        try {
            this.gameEngine = setupEngine();
            this.setupCanvas();
            await this.setupScenes();
            this.logConfiguration();
        } catch (error) {
            console.error("Failed to initialize:", error);
        }
    }

    private setupCanvas(): void {
        createGameCanvas("canvas-container", "game-canvas", this.gameEngine!);
        const { canvas } = getCanvasSizeById("game-canvas");
        this.gameEngine!.input.setupCanvasEvents(canvas);
        this.gameEngine!.setSceneMode(this.urlParamsHandler.sceneMode as any);
    }

    private async setupScenes(): Promise<void> {
        const { canvas } = getCanvasSizeById("game-canvas");
        const instanceFactory = new SceneInstanceFactory(
            this.gameEngine!,
            canvas
        );

        if (this.urlParamsHandler.gameType) {
            await this.setupGameTypeScene(instanceFactory);
        } else if (this.urlParamsHandler.currentScene) {
            await this.setupSingleScene(instanceFactory, canvas);
        } else if (this.urlParamsHandler.multiScene) {
            await this.setupMultiScene(instanceFactory, canvas);
        } else {
            await this.setupDefaultScene(instanceFactory, canvas);
        }
    }

    private async setupGameTypeScene(
        instanceFactory: SceneInstanceFactory
    ): Promise<void> {
        const menu = buildMenu(
            instanceFactory,
            this.gameEngine!,
            this.urlParamsHandler.gameType!
        );
        this.gameEngine!.registerScene(menu.name!, menu);
        this.gameEngine!.transitionToScene(menu.name!);
    }

    private async setupSingleScene(
        instanceFactory: SceneInstanceFactory,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        const factory = new SingleSceneTestFactory(
            canvas,
            this.gameEngine!,
            instanceFactory
        );
        const scene = await factory.createSingleSceneTest(
            this.urlParamsHandler.currentScene!
        );
        this.gameEngine!.registerScene(scene.name!, scene);
        this.gameEngine!.transitionToScene(scene.name!);
    }

    private async setupMultiScene(
        instanceFactory: SceneInstanceFactory,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        const factory = new MultiSceneTestFactory(canvas, instanceFactory);
        const scenes = await factory.createMultiSceneTest(
            this.urlParamsHandler.multiScene!
        );
        scenes.forEach((scene) => {
            this.gameEngine!.registerScene(scene.name!, scene);
        });
    }

    private async setupDefaultScene(
        instanceFactory: SceneInstanceFactory,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        console.warn(
            `No params, using default scene: ${SceneId.ELIPSE_TRACK}.`
        );
        const factory = new SingleSceneTestFactory(
            canvas,
            this.gameEngine!,
            instanceFactory
        );
        const scene = await factory.createSingleSceneTest(SceneId.ELIPSE_TRACK);
        this.gameEngine!.registerScene(scene.name!, scene);
        this.gameEngine!.transitionToScene(scene.name!);
    }

    private logConfiguration(): void {
        logTestUrls();
        this.urlParamsHandler.logSelection();
    }
}
