export interface CarState {
    position: { x: number; y: number };
    rotation: number;
    lastRotation: number;
    rotationVelocity: number;
    velocity: number;
    lastVelocity: number;
    inputEnabled: boolean;
    keysEnabled: boolean;
    isOnTrack: boolean;
}
