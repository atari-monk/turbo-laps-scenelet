import type { JoystickInput } from "./joystick-input";

export interface SteeringControl {
    updateSteering(input: JoystickInput): void;
}
