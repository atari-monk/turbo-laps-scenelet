import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

export class MouseCursor implements Scene {
    private static readonly NAME = "Mouse-Cursor";
    private static readonly DISPLAY_NAME = "Mouse Cursor";
    private previousButtonState: boolean = false;

    readonly name = MouseCursor.NAME;
    readonly displayName = MouseCursor.DISPLAY_NAME;

    constructor(private inputSystem: InputSystem) {}

    update(_context: FrameContext): void {
        const mousePosition = this.inputSystem.mouse.getPosition();
        const currentButtonState = this.inputSystem.mouse.isButtonDown(0);

        if (currentButtonState && !this.previousButtonState) {
            console.log(
                `Click at position: X: ${mousePosition.x}, Y: ${mousePosition.y}`
            );
        }

        this.previousButtonState = currentButtonState;
    }
}
