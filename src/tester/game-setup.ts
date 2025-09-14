import type { GameEngine } from "zippy-game-engine";
import type { MenuBuilder } from "../builder/menu-builder";

export class GameSetup {
    constructor(
        private readonly gameEngine: GameEngine,
        private readonly menuBuilder: MenuBuilder
    ) {}

    async setup(): Promise<void> {
        const scene = this.menuBuilder.withStartMenu().build();
        this.gameEngine.registerScene(scene.name!, scene);
        this.gameEngine.transitionToScene(scene.name!);
    }
}
