import type { CarModel } from "./car-model";
import type { CarStateContext } from "./car-state-context";
import type { CarGraphics } from "./car-graphics";

export class CarBounds {
    private readonly canvas: HTMLCanvasElement;
    private readonly stateContext: CarStateContext;
    private readonly halfWidth: number;
    private readonly halfHeight: number;

    constructor(
        private readonly carGraphics: CarGraphics,
        private readonly carModel: CarModel
    ) {
        this.canvas = this.carGraphics.canvas;
        this.stateContext = this.carModel.stateContext;

        const carConfig = this.carModel.carConfig;
        this.halfWidth = carConfig.width / 2;
        this.halfHeight = carConfig.height / 2;
    }

    public keepInBounds(): void {
        const position = this.stateContext.position;
        const newX = Math.max(
            this.halfWidth,
            Math.min(this.canvas.width - this.halfWidth, position.x)
        );
        const newY = Math.max(
            this.halfHeight,
            Math.min(this.canvas.height - this.halfHeight, position.y)
        );
        if (position.x !== newX || position.y !== newY) {
            this.stateContext.updatePosition({ x: newX, y: newY });
        }
    }
}
