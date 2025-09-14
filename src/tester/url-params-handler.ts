import {
    SceneId,
    MultiSceneId,
    GameId,
    SceneDescription,
    MultiSceneDescription,
    GameDescription,
} from "./const";

export class UrlParamsHandler {
    private readonly urlParams: URLSearchParams;

    readonly sceneMode: "current" | "all";
    readonly sceneName: string;

    readonly singleScene: SceneId | null;
    readonly multiScene: MultiSceneId | null;
    readonly game: GameId | null;

    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);

        this.sceneMode =
            (this.urlParams.get("mode") as "current" | "all") || "current";
        this.sceneName = this.urlParams.get("scene") || SceneId.ELIPSE_TRACK;

        this.singleScene = this.determineSingleScene();
        this.multiScene = this.determineMultiScene();
        this.game = this.determineGame();
    }

    private determineSingleScene(): SceneId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "current" &&
            this.isScene(this.sceneName)
        ) {
            return this.sceneName;
        }
        return null;
    }

    private isScene(value: any): value is SceneId {
        return Object.values(SceneId).includes(value);
    }

    private determineMultiScene(): MultiSceneId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            this.isMultiScene(this.sceneName as MultiSceneId)
        ) {
            return this.sceneName as MultiSceneId;
        }
        return null;
    }

    private isMultiScene(value: any): value is MultiSceneId {
        return Object.values(MultiSceneId).includes(value);
    }

    private determineGame(): GameId | null {
        if (
            this.urlParams.size > 0 &&
            this.sceneMode === "all" &&
            this.isGame(this.sceneName as GameId)
        ) {
            return this.sceneName as GameId;
        }
        return null;
    }

    private isGame(value: any): value is GameId {
        return Object.values(GameId).includes(value);
    }

    logOptions() {
        console.log("=== Test URL Options ===");
        console.log("Single Scene:");
        const baseUrl = "http://localhost:5173/";
        Object.values(SceneId).forEach((scene) => {
            console.log(
                `${baseUrl}/?mode=current&scene=${encodeURIComponent(scene)}`
            );
        });
        console.log("Multi Scene:");
        Object.values(MultiSceneId).forEach((scene) => {
            console.log(
                `${baseUrl}/?mode=all&scene=${encodeURIComponent(scene)}`
            );
        });
        console.log("Game:");
        Object.values(GameId).forEach((scene) => {
            console.log(
                `${baseUrl}/?mode=all&scene=${encodeURIComponent(scene)}`
            );
        });
    }

    logSelection(): void {
        console.log(`Scene mode: ${this.sceneMode}`);

        this.logSingleScene();
        this.logMultiScene();
        this.logGame();
    }

    private logSingleScene(): void {
        if (!(this.sceneMode === "current" && this.singleScene)) return;

        console.log(
            `Testing single scene: ${this.singleScene} - ${
                SceneDescription[this.singleScene]
            }`
        );
    }

    private logMultiScene(): void {
        if (!(this.sceneMode === "all" && this.multiScene)) return;

        console.log(
            `Testing multi-scene: ${this.multiScene} - ${
                MultiSceneDescription[this.multiScene]
            }`
        );
    }

    private logGame(): void {
        if (!(this.sceneMode === "all" && this.game)) return;

        console.log(
            `Testing game: ${this.game} - ${GameDescription[this.game]}`
        );
    }
}
