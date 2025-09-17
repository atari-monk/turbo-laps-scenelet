export interface CarState {
    position: { x: number; y: number };
    rotation: number;
    velocity: number;
    isEnginePlaying: boolean;
    isSkidding: boolean;
    lastVelocity: number;
    isOnTrack: boolean;
    lastRotation: number;
    inputEnabled: boolean;
    keysEnabled: boolean;
}
