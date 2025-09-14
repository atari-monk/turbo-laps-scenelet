import "./style.css";
import "fullscreen-canvas-vanilla";
import { testerFactory } from "./tester/tester-factory";

window.addEventListener("load", async () => {
    testerFactory();
});
