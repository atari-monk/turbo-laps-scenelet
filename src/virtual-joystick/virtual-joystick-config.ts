import type { JoystickAxisMode } from "./joystick-axis-mode";

export interface VirtualJoystickConfig {
    position?: { x: number; y: number };
    relativePosition?: { x: number; y: number };
    axisMode?: JoystickAxisMode;
    identifier?: string;
}
