import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";

interface GrassConfig {
    grassColor: string;
}

export class TrackGrass implements Scene {
    name: string = "Track Grass";
    displayName?: string = "Track Grass";

    private readonly config: GrassConfig;

    constructor(
        private readonly track: RectangleTrack,
        config: Partial<GrassConfig> = {}
    ) {
        this.config = {
            grassColor: "#2d7d2d",
            ...config,
        };
    }

    onEnter(): void {}
    onExit(): void {}
    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        this.#drawRoundedGrass(context.ctx);
    }

    resize(): void {}

    #drawRoundedGrass(ctx: CanvasRenderingContext2D): void {
        const config = this.track.config;
        const state = this.track.state;

        const halfLength = config.trackWidth / 2;
        const halfHeight = config.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = config.roadWidth;
        const cx = state.centerX;
        const cy = state.centerY;

        // Inner dimensions (where grass should be)
        const innerHalfLength = halfLength - roadWidth / 2;
        const innerHalfHeight = halfHeight - roadWidth / 2;
        const innerRadius = radius - roadWidth / 2;

        ctx.fillStyle = this.config.grassColor;
        ctx.beginPath();

        // Top straight (left to right)
        ctx.moveTo(cx - innerHalfLength + innerRadius, cy - innerHalfHeight);
        ctx.lineTo(cx + innerHalfLength - innerRadius, cy - innerHalfHeight);

        // Top-right curve
        ctx.arcTo(
            cx + innerHalfLength,
            cy - innerHalfHeight,
            cx + innerHalfLength,
            cy - innerHalfHeight + innerRadius,
            innerRadius
        );

        // Right straight (top to bottom)
        ctx.lineTo(cx + innerHalfLength, cy + innerHalfHeight - innerRadius);

        // Bottom-right curve
        ctx.arcTo(
            cx + innerHalfLength,
            cy + innerHalfHeight,
            cx + innerHalfLength - innerRadius,
            cy + innerHalfHeight,
            innerRadius
        );

        // Bottom straight (right to left)
        ctx.lineTo(cx - innerHalfLength + innerRadius, cy + innerHalfHeight);

        // Bottom-left curve
        ctx.arcTo(
            cx - innerHalfLength,
            cy + innerHalfHeight,
            cx - innerHalfLength,
            cy + innerHalfHeight - innerRadius,
            innerRadius
        );

        // Left straight (bottom to top)
        ctx.lineTo(cx - innerHalfLength, cy - innerHalfHeight + innerRadius);

        // Top-left curve
        ctx.arcTo(
            cx - innerHalfLength,
            cy - innerHalfHeight,
            cx - innerHalfLength + innerRadius,
            cy - innerHalfHeight,
            innerRadius
        );

        ctx.fill();
    }
}
