import type { CarConfig } from "../type/car-config";

export const DEFAULT_CAR_CONFIG: CarConfig = {
    width: 50,
    height: 110,
    color: "red",
    maxSpeed: 400,
    turnSpeed: 100,
    useSprite: true,
    spriteUrl: "assets/sprite/race_car.png",
    allowStationaryTurning: false,
    inputEnabled: false,
};
