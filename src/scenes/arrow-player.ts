import type { FrameContext } from "zippy-shared-lib";
import type { Scene, InputSystem } from "zippy-game-engine";
import type { ITrackBoundary } from "./track-boundary";
import type { StartingGrid } from "./starting-grid";

export interface IPlayer extends Scene {
    get velocity(): number;
    set velocity(value: number);
    get position(): { x: number; y: number };
}

export class ArrowPlayer implements IPlayer {
    name?: string = "Arrow-Player";
    displayName?: string = "Arrow Player";
    private trackBoundary?: ITrackBoundary;
    private inputEnabled: boolean = false;

    setInputEnabled(enabled: boolean): void {
        this.inputEnabled = enabled;
        if (!enabled) {
            this.state.velocity = 0;
        }
    }

    setTrackBoundary(trackBoundary: ITrackBoundary): void {
        this.trackBoundary = trackBoundary;
    }

    private config = {
        carWidth: 30,
        carHeight: 50,
        carColor: "red",
        moveSpeed: 300,
        turnSpeed: 180,
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

    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly input: InputSystem,
        enableInput = false
    ) {
        if (enableInput) this.setInputEnabled(true);
    }

    setStartingGrid(startingGrid: StartingGrid) {
        const startPos = startingGrid.getStartingPosition();
        this.state.position = { x: startPos.x, y: startPos.y };
        this.state.rotation = startPos.angle * (180 / Math.PI);
    }

    setStartingPosition(position: {
        x: number;
        y: number;
        angle: number;
    }): void {
        this.state.position = { x: position.x, y: position.y };
        this.state.rotation = position.angle * (180 / Math.PI);
        this.state.velocity = 0;
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
            }
        } else {
            this.keepInBounds();
        }
    }

    private handleMovement(deltaTime: number): void {
        if (!this.inputEnabled) {
            return;
        }

        if (this.input.keyboard.isKeyDown("ArrowUp")) {
            this.state.velocity = this.config.moveSpeed;
        } else if (this.input.keyboard.isKeyDown("ArrowDown")) {
            this.state.velocity = -this.config.moveSpeed * 0.5;
        } else if (this.input.keyboard.isKeyDown(" ")) {
            this.state.velocity = 0;
        }

        if (this.input.keyboard.isKeyDown("ArrowLeft")) {
            this.state.rotation -= this.config.turnSpeed * deltaTime;
        }
        if (this.input.keyboard.isKeyDown("ArrowRight")) {
            this.state.rotation += this.config.turnSpeed * deltaTime;
        }

        this.state.rotation = ((this.state.rotation % 360) + 360) % 360;

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

        ctx.fillStyle = this.config.carColor;
        ctx.fillRect(
            -this.config.carWidth / 2,
            -this.config.carHeight / 2,
            this.config.carWidth,
            this.config.carHeight
        );

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

    get rotation(): number {
        return this.state.rotation;
    }
}
