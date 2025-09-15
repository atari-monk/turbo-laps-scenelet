import "./style.css";
import "fullscreen-canvas-vanilla";
import { testerFactory } from "./tester/factory/tester-factory";
import { startNavigation } from "./tester/navigation";

window.addEventListener("load", async () => {
    startNavigation();
    testerFactory();
});
