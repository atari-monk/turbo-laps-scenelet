import type { JoystickAxisMode } from "./joystick-axis-mode";

export interface JoystickInput {
    isActive: boolean;
    direction: { x: number; y: number };
    magnitude: number;
    axisMode: JoystickAxisMode;
    identifier: string;
}
