import type { VirtualJoystickConfig } from "./virtual-joystick-config";

export interface PositionCalculator {
    calculatePosition(
        canvas: HTMLCanvasElement,
        config: VirtualJoystickConfig,
        identifier: string
    ): { x: number; y: number };
}
