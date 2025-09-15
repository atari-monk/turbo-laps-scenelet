export interface CarConfig {
    width: number;
    height: number;
    color: string;
    maxSpeed: number;
    turnSpeed: number;
    useSprite: boolean;
    spriteUrl?: string;
    allowStationaryTurning: boolean;
    inputEnabled: boolean;
}
