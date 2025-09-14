import type { CarConfig } from "../type/car-config";

export const DEFAULT_CAR_CONFIG: CarConfig = {
    carWidth: 50,
    carHeight: 110,
    carColor: "red",
    moveSpeed: 700,
    turnSpeed: 200,
    useSprite: true,
    spriteUrl: "assets/sprite/race_car.png",
    allowStationaryTurning: false,
    inputEnabled: false,
};
