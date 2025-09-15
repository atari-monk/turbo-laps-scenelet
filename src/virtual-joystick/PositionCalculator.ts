import type { VirtualJoystickConfig } from "./VirtualJoystickConfig";

export interface PositionCalculator {
    calculatePosition(
        canvas: HTMLCanvasElement,
        config: VirtualJoystickConfig,
        identifier: string
    ): { x: number; y: number };
}
