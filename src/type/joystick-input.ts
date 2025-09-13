export interface JoystickInput {
    isActive: boolean;
    direction: { x: number; y: number };
    magnitude: number;
    identifier?: string;
}
