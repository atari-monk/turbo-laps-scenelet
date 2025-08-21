import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";

export class RacePlayer implements Scene {
    name?: string = "Race Player";
    displayName?: string = "Race Player";

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
        keys: {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            " ": false,
        },
    };

    private handleKeyDown: (e: KeyboardEvent) => void;
    private handleKeyUp: (e: KeyboardEvent) => void;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.state.position = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        };

        // Bind event handlers to maintain proper 'this' context
        this.handleKeyDown = this._handleKeyDown.bind(this);
        this.handleKeyUp = this._handleKeyUp.bind(this);
    }

    init(): void {
        this.setupInputListeners();
    }

    private setupInputListeners(): void {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    private _handleKeyDown(e: KeyboardEvent): void {
        if (e.key in this.state.keys) {
            this.state.keys[e.key as keyof typeof this.state.keys] = true;
            e.preventDefault();
        }
    }

    private _handleKeyUp(e: KeyboardEvent): void {
        if (e.key in this.state.keys) {
            this.state.keys[e.key as keyof typeof this.state.keys] = false;
            e.preventDefault();
        }
    }

    update(context: FrameContext): void {
        this.handleMovement(context.deltaTime);
        this.keepInBounds();
    }

    private handleMovement(deltaTime: number): void {
        // 1. Handle acceleration
        if (this.state.keys.ArrowUp) {
            this.state.velocity = this.config.moveSpeed;
        } else if (this.state.keys.ArrowDown) {
            this.state.velocity = -this.config.moveSpeed * 0.5;
        } else if (this.state.keys[" "]) {
            this.state.velocity = 0;
        }

        // 2. Handle rotation
        if (this.state.keys.ArrowLeft) {
            this.state.rotation -= this.config.turnSpeed * deltaTime;
        }
        if (this.state.keys.ArrowRight) {
            this.state.rotation += this.config.turnSpeed * deltaTime;
        }

        // 3. Normalize rotation (0-360 degrees)
        this.state.rotation = ((this.state.rotation % 360) + 360) % 360;

        // 4. Apply movement if we have velocity
        if (this.state.velocity !== 0) {
            const radians = (this.state.rotation * Math.PI) / 180;

            // Move in facing direction (remember canvas Y is positive downward)
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
        this.setupInputListeners();
    }

    onExit(): void {
        this.cleanup();
    }

    resize(): void {
        // Optional: Handle canvas resize
        this.keepInBounds();
    }

    private cleanup(): void {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
    }

    // Getters for external access
    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    get rotation(): number {
        return this.state.rotation;
    }
}
