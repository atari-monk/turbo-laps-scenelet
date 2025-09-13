import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { SteeringControl } from "../type/steering-control";
import type { JoystickInput } from "../type/joystick-input";
import type { AccelerationControl } from "../type/acceleration-control";

interface CarState {
    x: number;
    y: number;
    rotation: number;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    steeringSpeed: number;
    friction: number;
}

export class TestCar implements Scene, AccelerationControl, SteeringControl {
    private state: CarState;
    private showDebug: boolean;
    private accelerationInput: number;
    private steeringInput: number;

    name = "Test-Car";
    displayName = "Test Car";

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.state = {
            x: 0,
            y: 0,
            rotation: 0,
            speed: 0,
            maxSpeed: 8,
            acceleration: 0.3,
            steeringSpeed: 0.05,
            friction: 0.95,
        };
        this.showDebug = true;
        this.accelerationInput = 0;
        this.steeringInput = 0;
    }

    updateSteering(input: JoystickInput): void {
        this.steeringInput = input.direction.x * input.magnitude;
    }

    updateAcceleration(input: JoystickInput): void {
        this.accelerationInput = -input.direction.y * input.magnitude;
    }

    private applySteering(): void {
        this.state.rotation += this.steeringInput * this.state.steeringSpeed;
    }

    private applyAcceleration(): void {
        this.state.speed += this.accelerationInput * this.state.acceleration;
        this.state.speed = Math.max(
            -this.state.maxSpeed,
            Math.min(this.state.speed, this.state.maxSpeed)
        );
    }

    private applyFriction(): void {
        this.state.speed *= this.state.friction;
        if (Math.abs(this.state.speed) < 0.1) {
            this.state.speed = 0;
        }
    }

    private updatePosition(): void {
        this.applySteering();
        this.applyAcceleration();
        this.applyFriction();

        this.state.x += Math.cos(this.state.rotation) * this.state.speed;
        this.state.y += Math.sin(this.state.rotation) * this.state.speed;

        this.state.x = (this.state.x + this.canvas.width) % this.canvas.width;
        this.state.y = (this.state.y + this.canvas.height) % this.canvas.height;
    }

    private drawCar(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.state.x, this.state.y);
        ctx.rotate(this.state.rotation);

        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-15, -10);
        ctx.lineTo(-15, 10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    private drawDebugInfo(ctx: CanvasRenderingContext2D): void {
        if (!this.showDebug) return;

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const info = [
            `Speed: ${this.state.speed.toFixed(2)}`,
            `Rotation: ${this.state.rotation.toFixed(2)}`,
            `Position: (${Math.round(this.state.x)}, ${Math.round(
                this.state.y
            )})`,
            `Accel Input: ${this.accelerationInput.toFixed(2)}`,
            `Steer Input: ${this.steeringInput.toFixed(2)}`,
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
        this.drawCar(context.ctx);
        this.drawDebugInfo(context.ctx);
    }

    onEnter(): void {
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
        this.state.rotation = 0;
        this.state.speed = 0;
        this.accelerationInput = 0;
        this.steeringInput = 0;
    }

    onExit(): void {}

    resize(): void {
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
    }

    toggleDebug(): void {
        this.showDebug = !this.showDebug;
    }

    getCarState(): CarState {
        return { ...this.state };
    }

    setCarPosition(x: number, y: number): void {
        this.state.x = x;
        this.state.y = y;
    }

    resetCar(): void {
        this.state.speed = 0;
        this.state.rotation = 0;
        this.state.x = this.canvas.width / 2;
        this.state.y = this.canvas.height / 2;
        this.accelerationInput = 0;
        this.steeringInput = 0;
    }
}
