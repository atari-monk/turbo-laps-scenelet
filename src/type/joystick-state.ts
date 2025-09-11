export interface JoystickState {
    isActive: boolean;
    direction: { x: number; y: number };
    magnitude: number;
    centerX: number;
    centerY: number;
    stickX: number;
    stickY: number;
}
