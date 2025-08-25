import type { FrameContext } from "zippy-shared-lib";
import type { Scene, InputSystem } from "zippy-game-engine";
import type { TrackBoundary } from "./track-boundary";

export class ArrowPlayer implements Scene {
    name?: string = "Arrow Player";
    displayName?: string = "Arrow Player";
    private trackBoundary?: TrackBoundary;

    setTrackBoundary(trackBoundary: TrackBoundary): void {
        this.trackBoundary = trackBoundary;
    }

    private config = {
        carWidth: 30,
        carHeight: 50,
        carColor: "red",
        moveSpeed: 300, // Pixels per second
        turnSpeed: 180, // Degrees per second
    };

    private state = {
        position: { x: 0, y: 0 },
        rotation: 0,
        velocity: 0,
    };

    get velocity(): number {
        return this.state.velocity;
    }

    set velocity(value: number) {
        this.state.velocity = value;
    }

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly input: InputSystem
    ) {
        this.state.position = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        };
    }

    init(): void {}

    update(context: FrameContext): void {
        this.handleMovement(context.deltaTime);
        if (this.trackBoundary) {
            const isOnTrack = this.trackBoundary.checkCarOnTrack(
                this,
                context.deltaTime
            );
            if (!isOnTrack) {
                // Optional: Handle off-track behavior
            }
        } else {
            this.keepInBounds(); // Fallback to canvas bounds if no track boundary
        }
    }

    private handleMovement(deltaTime: number): void {
        // Use the engine's input system instead of local state
        if (this.input.keyboard.isKeyDown("ArrowUp")) {
            this.state.velocity = this.config.moveSpeed;
        } else if (this.input.keyboard.isKeyDown("ArrowDown")) {
            this.state.velocity = -this.config.moveSpeed * 0.5;
        } else if (this.input.keyboard.isKeyDown(" ")) {
            this.state.velocity = 0;
        }

        // Handle rotation
        if (this.input.keyboard.isKeyDown("ArrowLeft")) {
            this.state.rotation -= this.config.turnSpeed * deltaTime;
        }
        if (this.input.keyboard.isKeyDown("ArrowRight")) {
            this.state.rotation += this.config.turnSpeed * deltaTime;
        }

        // Normalize rotation
        this.state.rotation = ((this.state.rotation % 360) + 360) % 360;

        // Apply movement
        if (this.state.velocity !== 0) {
            const radians = (this.state.rotation * Math.PI) / 180;
            this.state.position.x +=
                Math.sin(radians) * this.state.velocity * deltaTime;
            this.state.position.y +=
                -Math.cos(radians) * this.state.velocity * deltaTime;
        }
    }

    private keepInBounds(): void {
        const halfWidth = this.config.carWidth / 2;
        const halfHeight = this.config.carHeight / 2;

        this.state.position.x = Math.max(
            halfWidth,
            Math.min(this.canvas.width - halfWidth, this.state.position.x)
        );
        this.state.position.y = Math.max(
            halfHeight,
            Math.min(this.canvas.height - halfHeight, this.state.position.y)
        );
    }

    render(context: FrameContext): void {
        const ctx = context.ctx;
        ctx.save();
        ctx.translate(this.state.position.x, this.state.position.y);
        ctx.rotate((this.state.rotation * Math.PI) / 180);

        // Draw car body
        ctx.fillStyle = this.config.carColor;
        ctx.fillRect(
            -this.config.carWidth / 2,
            -this.config.carHeight / 2,
            this.config.carWidth,
            this.config.carHeight
        );

        // Draw windshield
        ctx.fillStyle = "#333";
        ctx.fillRect(
            -this.config.carWidth / 2 + 5,
            -this.config.carHeight / 2 + 5,
            this.config.carWidth - 10,
            this.config.carHeight / 3
        );

        ctx.restore();
    }

    onEnter(): void {
        // Optional: Reset state when entering the scene
        this.state.position = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        };
        this.state.rotation = 0;
        this.state.velocity = 0;
    }

    onExit(): void {
        this.cleanup();
    }

    resize(): void {
        this.keepInBounds();
    }

    private cleanup(): void {}

    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    get rotation(): number {
        return this.state.rotation;
    }
}
