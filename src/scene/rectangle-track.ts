import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { TrackConfig } from "../type/track-config";
import type { TrackState } from "../type/track-state";
import { TrackConfigService } from "../service/track-config.service";

export class RectangleTrack implements Scene {
    name: string = "Rectangle-Track";
    displayName?: string = "Rectangle Track";

    private readonly configService = TrackConfigService.getInstance();

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.configService.calculateTrackState(this.canvas);
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
        this.rounded_rectangle(
            context.ctx,
            this.configService.getConfig(),
            this.configService.getState()
        );
    }

    resize(): void {
        this.configService.calculateTrackState(this.canvas);
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
