import type { Scene } from "zippy-game-engine";

export interface IGameBuilder {
    buildGame(): Promise<Scene[]>;
}
