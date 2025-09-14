import "./style.css";
import "fullscreen-canvas-vanilla";
import { EngineSetupHandler } from "./tester/EngineSetupHandler";
import { UrlParamsHandler } from "./tester/UrlParamsHandler";

window.addEventListener("load", async () => {
    const urlParamsHandler = new UrlParamsHandler();
    const engineSetupHandler = new EngineSetupHandler(urlParamsHandler);
    await engineSetupHandler.initialize();
});
