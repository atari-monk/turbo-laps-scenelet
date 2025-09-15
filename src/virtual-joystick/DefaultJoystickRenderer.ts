import type { JoystickRenderer } from "./JoystickRenderer";

export class DefaultJoystickRenderer implements JoystickRenderer {
    renderBase(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        identifier: string
    ): void {
        context.save();
        context.globalAlpha = 0.4;
        context.fillStyle = identifier.includes("acceleration")
            ? "#3498db"
            : "#2c3e50";
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 0.8;
        context.strokeStyle = "#ecf0f1";
        context.lineWidth = 3;
        context.stroke();
        context.restore();
    }

    renderStick(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        identifier: string
    ): void {
        context.save();
        context.globalAlpha = 0.9;
        context.fillStyle = identifier.includes("acceleration")
            ? "#2980b9"
            : "#e74c3c";
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 1;
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();
        context.restore();
    }
}
