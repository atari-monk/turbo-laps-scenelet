import type { JoystickInput } from "../type/JoystickInput";

export interface SteeringControl {
    updateSteering(input: JoystickInput): void;
}
