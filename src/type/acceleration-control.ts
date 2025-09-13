import type { JoystickInput } from "./joystick-input";

export interface AccelerationControl {
    updateAcceleration(input: JoystickInput): void;
}
