import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

export class RaceTrack implements Scene {
    name: string = "Race Track";
    displayName?: string = "Race Track";

    private config = {
        trackWidth: 800,
        trackHeight: 400,
        roadWidth: 60,
        roadColor: "#555",
        backgroundColor: "#2a2a2a",
    };

    private state = {
        centerX: 0,
        centerY: 0,
        radiusX: 0,
        radiusY: 0,
    };

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.init();
    }

    init(): void {
        this.resize();
    }

    onEnter(): void {
        this.resize();
    }

    onExit(): void {}

    update(context: FrameContext): void {
        // Update logic can be added here
    }

    render(context: FrameContext): void {
        //this.elipse_track(context.ctx, this.config, this.state);
        this.rounded_rectangle(context.ctx, this.config, this.state);
    }

    resize(): void {
        this.state.centerX = this.canvas.width / 2;
        this.state.centerY = this.canvas.height / 2;
        this.state.radiusX = this.config.trackWidth / 2;
        this.state.radiusY = this.config.trackHeight / 2;
    }

    private elipse_track(
        ctx: CanvasRenderingContext2D,
        config: typeof this.config,
        state: typeof this.state
    ): void {
        //ctx.fillStyle = config.backgroundColor;
        //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.beginPath();
        ctx.ellipse(
            state.centerX,
            state.centerY,
            state.radiusX,
            state.radiusY,
            0,
            0,
            Math.PI * 2
        );
        ctx.lineWidth = config.roadWidth;
        ctx.strokeStyle = config.roadColor;
        ctx.stroke();
    }

    private rounded_rectangle(
        ctx: CanvasRenderingContext2D,
        config: typeof this.config,
        state: typeof this.state
    ): void {
        //ctx.fillStyle = config.backgroundColor;
        //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const trackLength = config.trackWidth;
        const trackHeight = config.trackHeight;
        const roadWidth = config.roadWidth;

        const halfLength = trackLength / 2;
        const halfHeight = trackHeight / 2;
        const radius = halfHeight;

        const cx = state.centerX;
        const cy = state.centerY;

        ctx.beginPath();
        ctx.moveTo(cx - halfLength + radius, cy - halfHeight);

        ctx.lineTo(cx + halfLength - radius, cy - halfHeight);
        ctx.arcTo(
            cx + halfLength,
            cy - halfHeight,
            cx + halfLength,
            cy - halfHeight + radius,
            radius
        );

        ctx.lineTo(cx + halfLength, cy + halfHeight - radius);
        ctx.arcTo(
            cx + halfLength,
            cy + halfHeight,
            cx + halfLength - radius,
            cy + halfHeight,
            radius
        );

        ctx.lineTo(cx - halfLength + radius, cy + halfHeight);
        ctx.arcTo(
            cx - halfLength,
            cy + halfHeight,
            cx - halfLength,
            cy + halfHeight - radius,
            radius
        );

        ctx.lineTo(cx - halfLength, cy - halfHeight + radius);
        ctx.arcTo(
            cx - halfLength,
            cy - halfHeight,
            cx - halfLength + radius,
            cy - halfHeight,
            radius
        );

        ctx.lineWidth = roadWidth;
        ctx.strokeStyle = config.roadColor;
        ctx.stroke();
    }
}
