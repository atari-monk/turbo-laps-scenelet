import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import { TrackConfigService } from "../service/track-config.service";

interface GrassConfig {
    grassColor: string;
}

export class TrackGrass implements Scene {
    name: string = "Track-Grass";
    displayName?: string = "Track Grass";

    private readonly configService = TrackConfigService.getInstance();
    private readonly config: GrassConfig;

    constructor(config: Partial<GrassConfig> = {}) {
        this.config = {
            grassColor: "#2d7d2d",
            ...config,
        };
    }

    onEnter(): void {}
    onExit(): void {}
    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        this.drawRoundedGrass(context.ctx);
    }

    resize(): void {}

    private drawRoundedGrass(ctx: CanvasRenderingContext2D): void {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const centerX = trackState.centerX;
        const centerY = trackState.centerY;

        const innerHalfLength = halfLength - roadWidth / 2;
        const innerHalfHeight = halfHeight - roadWidth / 2;
        const innerRadius = radius - roadWidth / 2;

        ctx.fillStyle = this.config.grassColor;
        ctx.beginPath();

        ctx.moveTo(
            centerX - innerHalfLength + innerRadius,
            centerY - innerHalfHeight
        );
        ctx.lineTo(
            centerX + innerHalfLength - innerRadius,
            centerY - innerHalfHeight
        );

        ctx.arcTo(
            centerX + innerHalfLength,
            centerY - innerHalfHeight,
            centerX + innerHalfLength,
            centerY - innerHalfHeight + innerRadius,
            innerRadius
        );

        ctx.lineTo(
            centerX + innerHalfLength,
            centerY + innerHalfHeight - innerRadius
        );

        ctx.arcTo(
            centerX + innerHalfLength,
            centerY + innerHalfHeight,
            centerX + innerHalfLength - innerRadius,
            centerY + innerHalfHeight,
            innerRadius
        );

        ctx.lineTo(
            centerX - innerHalfLength + innerRadius,
            centerY + innerHalfHeight
        );

        ctx.arcTo(
            centerX - innerHalfLength,
            centerY + innerHalfHeight,
            centerX - innerHalfLength,
            centerY + innerHalfHeight - innerRadius,
            innerRadius
        );

        ctx.lineTo(
            centerX - innerHalfLength,
            centerY - innerHalfHeight + innerRadius
        );

        ctx.arcTo(
            centerX - innerHalfLength,
            centerY - innerHalfHeight,
            centerX - innerHalfLength + innerRadius,
            centerY - innerHalfHeight,
            innerRadius
        );

        ctx.fill();
    }
}
