export interface CarConfig {
    carWidth: number;
    carHeight: number;
    carColor: string;
    moveSpeed: number;
    turnSpeed: number;
    useSprite: boolean;
    spriteUrl?: string;
    allowStationaryTurning: boolean;
    inputEnabled: boolean;
}
