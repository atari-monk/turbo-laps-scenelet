import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";

export interface TrackConfig {
    trackWidth: number;
    trackHeight: number;
    roadWidth: number;
    roadColor: string;
    backgroundColor: string;
}

export interface TrackState {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
}

export class RectangleTrack implements Scene {
    name: string = "Rectangle Track";
    displayName?: string = "Rectangle Track";

    // Public properties with readonly access
    public readonly config: TrackConfig;
    public readonly state: TrackState;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.config = {
            trackWidth: 1700,
            trackHeight: 900,
            roadWidth: 160,
            roadColor: "#555",
            backgroundColor: "#2a2a2a",
        };

        this.state = {
            centerX: 0,
            centerY: 0,
            radiusX: 0,
            radiusY: 0,
        };

        this.init();
    }

    init(): void {
        this.resize();
    }

    onEnter(): void {
        this.resize();
    }

    onExit(): void {}

    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        this.rounded_rectangle(context.ctx, this.config, this.state);
    }

    resize(): void {
        this.state.centerX = this.canvas.width / 2;
        this.state.centerY = this.canvas.height / 2;
        this.state.radiusX = this.config.trackWidth / 2;
        this.state.radiusY = this.config.trackHeight / 2;
    }

    private rounded_rectangle(
        ctx: CanvasRenderingContext2D,
        config: TrackConfig,
        state: TrackState
    ): void {
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