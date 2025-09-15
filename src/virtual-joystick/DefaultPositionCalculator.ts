import type { PositionCalculator } from "./PositionCalculator";
import type { VirtualJoystickConfig } from "./VirtualJoystickConfig";

export class DefaultPositionCalculator implements PositionCalculator {
    calculatePosition(
        canvas: HTMLCanvasElement,
        config: VirtualJoystickConfig,
        identifier: string
    ): { x: number; y: number } {
        if (config.position) {
            return config.position;
        }

        if (config.relativePosition) {
            return {
                x: canvas.width * config.relativePosition.x,
                y: canvas.height * config.relativePosition.y,
            };
        }

        return identifier.includes("acceleration")
            ? { x: canvas.width * 0.2, y: canvas.height * 0.8 }
            : { x: canvas.width * 0.8, y: canvas.height * 0.8 };
    }
}
