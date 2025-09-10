export interface CarState {
    position: { x: number; y: number };
    rotation: number;
    velocity: number;
    isEnginePlaying: boolean;
    isSkidding: boolean;
    lastVelocity: number;
    wasOnTrack: boolean;
    lastRotation: number;
    inputEnabled: boolean;
    keysEnabled: boolean;
}
