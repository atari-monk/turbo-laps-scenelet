import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

interface ClickPoint {
    x: number;
    y: number;
}

export class MouseCursor implements Scene {
    private static readonly NAME = "Mouse-Cursor";
    private static readonly DISPLAY_NAME = "Mouse Cursor";
    private static readonly RECT_SIZE = 10;
    private static readonly RECT_COLOR = "red";

    private previousButtonState = false;
    private clickPoints: ClickPoint[] = [];

    readonly name = MouseCursor.NAME;
    readonly displayName = MouseCursor.DISPLAY_NAME;

    constructor(private inputSystem: InputSystem) {}

    update(_context: FrameContext): void {
        const mousePosition = this.inputSystem.mouse.getPosition();
        const currentButtonState = this.inputSystem.mouse.isButtonDown(0);

        if (currentButtonState && !this.previousButtonState) {
            const clickPoint = { x: mousePosition.x, y: mousePosition.y };
            this.clickPoints.push(clickPoint);
            console.log(`Click point: ${clickPoint.x}, ${clickPoint.y}`);
        }

        this.previousButtonState = currentButtonState;
    }

    render(context: FrameContext): void {
        const canvas = context.ctx.canvas;
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        const scaleX = canvas.width / displayWidth;
        const scaleY = canvas.height / displayHeight;
        const halfSize = MouseCursor.RECT_SIZE / 2;

        this.clickPoints.forEach((point) => {
            const scaledX = point.x * scaleX;
            const scaledY = point.y * scaleY;

            context.ctx.fillStyle = MouseCursor.RECT_COLOR;
            context.ctx.fillRect(
                scaledX - halfSize,
                scaledY - halfSize,
                MouseCursor.RECT_SIZE,
                MouseCursor.RECT_SIZE
            );
        });
    }
}
