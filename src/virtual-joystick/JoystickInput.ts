import type { JoystickAxisMode } from "./JoystickAxisMode";

export interface JoystickInput {
    isActive: boolean;
    direction: { x: number; y: number };
    magnitude: number;
    axisMode: JoystickAxisMode;
    identifier: string;
}
