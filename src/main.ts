import "./style.css";
import "fullscreen-canvas-vanilla";
import { testerFactory } from "./tester/factory/tester-factory";

window.addEventListener("load", async () => {
    testerFactory();
});
