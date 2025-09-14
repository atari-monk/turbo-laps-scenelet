import {
    isSceneType,
    isMultiSceneType,
    isGameType,
    logSceneSelection,
} from "../tools";
import type { GameType } from "../type/game-type";
import type { MultiSceneType } from "../type/multi-scene-type";
import { SceneType } from "../type/scene-type";

export class UrlParamsHandler {
    private readonly urlParams: URLSearchParams;

    readonly sceneMode: "current" | "all" | "game";
    readonly sceneName: string;
    readonly currentScene: SceneType | null;
    readonly multiScene: MultiSceneType | null;
    readonly gameType: GameType | null;

    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.sceneMode =
            (this.urlParams.get("mode") as "current" | "all" | "game") ||
            "current";
        this.sceneName = this.urlParams.get("scene") || SceneType.ELIPSE_TRACK;

        this.currentScene = this.determineCurrentScene();
        this.multiScene = this.determineMultiScene();
        this.gameType = this.determineGameType();
    }

    private determineCurrentScene(): SceneType | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "current" &&
            isSceneType(this.sceneName)
        ) {
            return this.sceneName;
        }
        return null;
    }

    private determineMultiScene(): MultiSceneType | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            isMultiSceneType(this.sceneName as MultiSceneType)
        ) {
            return this.sceneName as MultiSceneType;
        }
        return null;
    }

    private determineGameType(): GameType | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            isGameType(this.sceneName as GameType)
        ) {
            return this.sceneName as GameType;
        }
        return null;
    }

    hasSceneSelection(): boolean {
        return (
            this.currentScene !== null ||
            this.multiScene !== null ||
            this.gameType !== null
        );
    }

    logSelection(): void {
        logSceneSelection(
            this.sceneMode,
            this.currentScene,
            this.multiScene,
            this.gameType
        );
    }
}
