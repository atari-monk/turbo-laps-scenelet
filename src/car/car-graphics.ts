import type { CarRenderer } from "./car-renderer";

export class CarGraphics {
    constructor(
        public readonly canvas: HTMLCanvasElement,
        public readonly renderer: CarRenderer
    ) {}
}
