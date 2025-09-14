import { createGameCanvas } from "fullscreen-canvas-vanilla";
import { type GameEngine } from "zippy-game-engine";
import { buildMenu } from "../builder/menu-builder";
import { MultiSceneTestFactory } from "../factory/multi-scene-test-factory";
import { SceneInstanceFactory } from "../factory/scene-instance-factory";
import { SingleSceneTestFactory } from "../factory/single-scene-test-factory";
import type { UrlParamsHandler } from "./url-params-handler";
import { SceneId } from "./const";

export class EngineSetupHandler {
    constructor(
        private readonly urlParamsHandler: UrlParamsHandler,
        private readonly gameEngine: GameEngine
    ) {}

    async initialize(): Promise<void> {
        try {
            this.setupCanvas();
            this.urlParamsHandler.logOptions();
            await this.setupScenes();
            this.urlParamsHandler.logSelection();
        } catch (error) {
            console.error("Failed to initialize:", error);
        }
    }

    private setupCanvas(): void {
        createGameCanvas("canvas-container", "game-canvas", this.gameEngine!);
        const { canvas } = this.getCanvasSizeById("game-canvas");
        this.gameEngine!.input.setupCanvasEvents(canvas);
        this.gameEngine!.setSceneMode(this.urlParamsHandler.sceneMode as any);
    }

    private getCanvasSizeById(canvasId: string): {
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

    private async setupScenes(): Promise<void> {
        const { canvas } = this.getCanvasSizeById("game-canvas");
        const instanceFactory = new SceneInstanceFactory(
            this.gameEngine!,
            canvas
        );

        if (this.urlParamsHandler.game) {
            await this.setupGameTypeScene(instanceFactory);
        } else if (this.urlParamsHandler.singleScene) {
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
            this.urlParamsHandler.game!
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
            this.urlParamsHandler.singleScene!
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
}
