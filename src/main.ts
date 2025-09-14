import "./style.css";
import "fullscreen-canvas-vanilla";
import { UrlParamsHandler } from "./tester/url-params-handler";
import { EngineSetupHandler } from "./tester/engine-setup-handler";
import { GameEngineFactory } from "zippy-game-engine";

window.addEventListener("load", async () => {
    await new EngineSetupHandler(
        new UrlParamsHandler(),
        new GameEngineFactory().getGameEngine()
    ).initialize();
});
