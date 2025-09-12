import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { SteeringControl } from "../type/steering-control";
import type { JoystickInput } from "../type/joystick-input";

interface SteerableRectState {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    maxSpeed: number;
    acceleration: number;
    friction: number;
    width: number;
    height: number;
}

export class SteerableRect implements Scene, SteeringControl {
    private state: SteerableRectState;
    private showDebug: boolean;

    name = "Steerable-Rect";
    displayName = "Steerable Rectangle";

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.state = {
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
            maxSpeed: 8,
            acceleration: 0.3,
            friction: 0.95,
            width: 40,
            height: 20,
        };
        this.showDebug = true;
    }

    updateSteering(input: JoystickInput): void {
        if (!input.isActive) {
            this.applyFriction();
            return;
        }

        const accelerationX = input.direction.x;
        const accelerationY = input.direction.y;

        this.applyAcceleration(accelerationX, accelerationY);
        this.applyFriction();
    }

    private applyAcceleration(
        accelerationX: number,
        accelerationY: number
    ): void {
        this.state.velocityX += accelerationX * this.state.acceleration;
        this.state.velocityY += accelerationY * this.state.acceleration;

        const speed = Math.sqrt(
            this.state.velocityX * this.state.velocityX +
                this.state.velocityY * this.state.velocityY
        );

        if (speed > this.state.maxSpeed) {
            const scale = this.state.maxSpeed / speed;
            this.state.velocityX *= scale;
            this.state.velocityY *= scale;
        }
    }

    private applyFriction(): void {
        this.state.velocityX *= this.state.friction;
        this.state.velocityY *= this.state.friction;

        if (
            Math.abs(this.state.velocityX) < 0.1 &&
            Math.abs(this.state.velocityY) < 0.1
        ) {
            this.state.velocityX = 0;
            this.state.velocityY = 0;
        }
    }

    private updatePosition(): void {
        this.state.x += this.state.velocityX;
        this.state.y += this.state.velocityY;

        this.state.x = (this.state.x + this.canvas.width) % this.canvas.width;
        this.state.y = (this.state.y + this.canvas.height) % this.canvas.height;
    }

    private drawRect(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.state.x, this.state.y);

        ctx.fillStyle = "#3498db";
        ctx.fillRect(
            -this.state.width / 2,
            -this.state.height / 2,
            this.state.width,
            this.state.height
        );

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            -this.state.width / 2,
            -this.state.height / 2,
            this.state.width,
            this.state.height
        );

        // ctx.fillStyle = "#e74c3c";
        // ctx.beginPath();
        // ctx.moveTo(this.state.width / 2, 0);
        // ctx.lineTo(-this.state.width / 4, -this.state.height / 4);
        // ctx.lineTo(-this.state.width / 4, this.state.height / 4);
        // ctx.closePath();
        // ctx.fill();

        ctx.restore();
    }

    private drawDebugInfo(ctx: CanvasRenderingContext2D): void {
        if (!this.showDebug) return;

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const speed = Math.sqrt(
            this.state.velocityX * this.state.velocityX +
                this.state.velocityY * this.state.velocityY
        );

        const info = [
            `Speed: ${speed.toFixed(2)}`,
            `Velocity: (${this.state.velocityX.toFixed(
                2
            )}, ${this.state.velocityY.toFixed(2)})`,
            `Position: (${Math.round(this.state.x)}, ${Math.round(
                this.state.y
            )})`,
        ];

        info.forEach((text, index) => {
            ctx.fillText(text, 10, 10 + index * 20);
        });

        ctx.restore();
    }

    init(): void {
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
    }

    update(_context: FrameContext): void {
        this.updatePosition();
    }

    render(context: FrameContext): void {
        this.drawRect(context.ctx);
        this.drawDebugInfo(context.ctx);
    }

    onEnter(): void {
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
        this.state.velocityX = 0;
        this.state.velocityY = 0;
    }

    onExit(): void {}

    resize(): void {
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
    }

    toggleDebug(): void {
        this.showDebug = !this.showDebug;
    }

    getRectState(): SteerableRectState {
        return { ...this.state };
    }

    setRectPosition(x: number, y: number): void {
        this.state.x = x;
        this.state.y = y;
    }

    resetRect(): void {
        this.state.velocityX = 0;
        this.state.velocityY = 0;
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
    }
}
