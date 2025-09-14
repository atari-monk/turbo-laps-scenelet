import "./style.css";
import "fullscreen-canvas-vanilla";
import { testerFactory } from "./tester/tester-factory";

window.addEventListener("load", async () => {
    const tester = testerFactory();

    await tester.initialize();
});
