import type { Car } from "../car";

export interface ICarFactory {
    createCar(inputEnabled: boolean): Promise<Car>;
}
