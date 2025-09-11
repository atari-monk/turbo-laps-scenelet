import type { FrameContext } from "zippy-shared-lib";
import type { CarConfig } from "./type/car-config";
import type { CarStateContext } from "./car-state-context";

export class CarRenderer {
    private carImage?: HTMLImageElement;
    private spriteLoaded: boolean = false;

    constructor(
        private readonly carConfig: CarConfig,
        private readonly stateContext: CarStateContext
    ) {
        this.loadSprite();
    }

    private loadSprite(): void {
        if (!this.carConfig.spriteUrl) return;

        this.carImage = new Image();
        this.carImage.onload = () => {
            this.spriteLoaded = true;
        };
        this.carImage.onerror = () => {
            this.carConfig.useSprite = false;
        };
        this.carImage.src = this.carConfig.spriteUrl;
    }

    render(context: FrameContext): void {
        const ctx = context.ctx;
        ctx.save();
        ctx.translate(
            this.stateContext.position.x,
            this.stateContext.position.y
        );
        ctx.rotate((this.stateContext.rotation * Math.PI) / 180);

        if (this.carConfig.useSprite && this.spriteLoaded && this.carImage) {
            this.renderSprite(ctx);
        } else {
            this.renderGeometricCar(ctx);
        }

        ctx.restore();
    }

    private renderGeometricCar(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.carConfig.carColor;
        ctx.fillRect(
            -this.carConfig.carWidth / 2,
            -this.carConfig.carHeight / 2,
            this.carConfig.carWidth,
            this.carConfig.carHeight
        );

        ctx.fillStyle = "#333";
        ctx.fillRect(
            -this.carConfig.carWidth / 2 + 5,
            -this.carConfig.carHeight / 2 + 5,
            this.carConfig.carWidth - 10,
            this.carConfig.carHeight / 3
        );
    }

    private renderSprite(ctx: CanvasRenderingContext2D): void {
        if (!this.carImage) return;

        ctx.drawImage(
            this.carImage,
            -this.carConfig.carWidth / 2,
            -this.carConfig.carHeight / 2,
            this.carConfig.carWidth,
            this.carConfig.carHeight
        );
    }
}
