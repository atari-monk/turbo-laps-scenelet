import type { Scene } from "zippy-game-engine";
import { GameBuilder } from "./game-builder";
import type { IGameBuilder } from "./type/i-game-builder";

export class PCGameBuilder implements IGameBuilder {
    constructor(private readonly gameBuilder: GameBuilder) {}

    async buildGame(): Promise<Scene[]> {
        const scenes = await this.gameBuilder
            .withRectangleTrack()
            .then((b) => b.withTrackGrass())
            .then((b) => b.withRoadMarkings())
            .then((b) => b.withStartingGrid())
            .then((b) => b.withTrackBoundary())
            .then((b) => b.withCar())
            .then((b) => b.withGameScore())
            .then((b) => b.withLapTracker())
            .then((b) => b.withCountdown())
            .then((b) => b.withContinueBtn())
            .then((b) => b.build());
        return scenes;
    }
}
