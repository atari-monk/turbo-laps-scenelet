import { GameId } from "./enum/game-id";
import { GameTypeDescriptions } from "../type/game-type-descriptions";
import { MultiSceneId } from "./enum/multi-scene-id";
import { SceneId } from "./enum/scene-id";
import { MultiSceneDescriptions } from "./const/multi-scene-descriptions";
import { SceneDescriptions } from "./const/scene-descriptions";

export class UrlParamsHandler {
    private readonly urlParams: URLSearchParams;

    readonly sceneMode: "current" | "all";
    readonly sceneName: string;

    readonly currentScene: SceneId | null;
    readonly multiScene: MultiSceneId | null;
    readonly gameType: GameId | null;

    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);

        this.sceneMode =
            (this.urlParams.get("mode") as "current" | "all") || "current";
        this.sceneName = this.urlParams.get("scene") || SceneId.ELIPSE_TRACK;

        this.currentScene = this.determineCurrentScene();
        this.multiScene = this.determineMultiScene();
        this.gameType = this.determineGameType();
    }

    private determineCurrentScene(): SceneId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "current" &&
            this.isSceneType(this.sceneName)
        ) {
            return this.sceneName;
        }
        return null;
    }

    private isSceneType(value: any): value is SceneId {
        return Object.values(SceneId).includes(value);
    }

    private determineMultiScene(): MultiSceneId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            this.isMultiSceneType(this.sceneName as MultiSceneId)
        ) {
            return this.sceneName as MultiSceneId;
        }
        return null;
    }

    private isMultiSceneType(value: any): value is MultiSceneId {
        return Object.values(MultiSceneId).includes(value);
    }

    private determineGameType(): GameId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            this.isGameType(this.sceneName as GameId)
        ) {
            return this.sceneName as GameId;
        }
        return null;
    }

    private isGameType(value: any): value is GameId {
        return Object.values(GameId).includes(value);
    }

    hasSceneSelection(): boolean {
        return (
            this.currentScene !== null ||
            this.multiScene !== null ||
            this.gameType !== null
        );
    }

    logSelection(): void {
        this.logSceneSelection(
            this.sceneMode,
            this.currentScene,
            this.multiScene,
            this.gameType
        );
    }

    private logSceneSelection(
        mode: "all" | "current" | "game",
        currentScene: SceneId | null,
        multiScene: MultiSceneId | null,
        gameType: GameId | null
    ) {
        console.log(`Scene mode: ${mode}`);

        if (mode === "all" && multiScene) {
            console.log(
                `Testing multi-scene: ${multiScene} - ${MultiSceneDescriptions[multiScene]}`
            );
        } else if (mode === "current" && currentScene) {
            console.log(
                `Testing single scene: ${currentScene} - ${SceneDescriptions[currentScene]}`
            );
        } else if (mode === "game" && gameType) {
            console.log(
                `Playing game: ${gameType} - ${GameTypeDescriptions[gameType]}`
            );
        }
    }
}
