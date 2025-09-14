import { type GameEngine } from "zippy-game-engine";
import { buildMenu } from "../builder/menu-builder";
import { MultiSceneTestFactory } from "../factory/multi-scene-test-factory";
import { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { SingleSceneTestFactory } from "../factory/single-scene-test-factory";
import type { UrlParamsHandler } from "./url-params-handler";
import { SceneId } from "./const";

export class EngineSetupHandler {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly canvas: HTMLCanvasElement,
        private readonly urlParamsHandler: UrlParamsHandler
    ) {}

    async initialize(): Promise<void> {
        try {
            this.gameEngine.setSceneMode(
                this.urlParamsHandler.sceneMode as any
            );
            this.urlParamsHandler.logOptions();
            await this.setupScenes();
            this.urlParamsHandler.logSelection();
        } catch (error) {
            console.error("Failed to initialize:", error);
        }
    }

    private async setupScenes(): Promise<void> {
        const instanceFactory = new SceneInstanceFactory(
            this.gameEngine,
            this.canvas
        );

        if (this.urlParamsHandler.game) {
            await this.setupGameTypeScene(instanceFactory);
        } else if (this.urlParamsHandler.singleScene) {
            await this.setupSingleScene(instanceFactory, this.canvas);
        } else if (this.urlParamsHandler.multiScene) {
            await this.setupMultiScene(instanceFactory, this.canvas);
        } else {
            await this.setupDefaultScene(instanceFactory, this.canvas);
        }
    }

    private async setupGameTypeScene(
        instanceFactory: SceneInstanceFactory
    ): Promise<void> {
        const menu = buildMenu(
            instanceFactory,
            this.gameEngine,
            this.urlParamsHandler.game!
        );
        this.gameEngine.registerScene(menu.name!, menu);
        this.gameEngine.transitionToScene(menu.name!);
    }

    private async setupSingleScene(
        instanceFactory: SceneInstanceFactory,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        const factory = new SingleSceneTestFactory(
            canvas,
            this.gameEngine,
            instanceFactory
        );
        const scene = await factory.createSingleSceneTest(
            this.urlParamsHandler.singleScene!
        );
        this.gameEngine.registerScene(scene.name!, scene);
        this.gameEngine.transitionToScene(scene.name!);
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
            this.gameEngine.registerScene(scene.name!, scene);
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
            this.gameEngine,
            instanceFactory
        );
        const scene = await factory.createSingleSceneTest(SceneId.ELIPSE_TRACK);
        this.gameEngine.registerScene(scene.name!, scene);
        this.gameEngine.transitionToScene(scene.name!);
    }
}
