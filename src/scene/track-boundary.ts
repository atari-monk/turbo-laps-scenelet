import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { IPlayer } from "./arrow-player";
import { TrackConfigService } from "../service/track-config.service";

interface TrackBoundaryConfig {
    outerBoundaryOffset: number;
    innerBoundaryOffset: number;
    debugOuterColor: string;
    debugInnerColor: string;
    maxOffTrackTime: number;
    offTrackSlowdown: number;
}

export interface ITrackBoundary extends Scene {
    checkCarOnTrack(player: IPlayer, deltaTime: number): boolean;
}

export class TrackBoundary implements ITrackBoundary {
    name = "Track-Boundary";
    displayName = "Track Boundary";

    private config: TrackBoundaryConfig;
    private isOnTrack = true;
    private offTrackTimer = 0;
    private hapticFeedback?: (duration: number) => void;
    private readonly configService = TrackConfigService.getInstance();

    constructor(
        private readonly canvas: HTMLCanvasElement,
        config: Partial<TrackBoundaryConfig> = {}
    ) {
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };
        this.configService.calculateTrackState(this.canvas);
    }

    private getDefaultConfig(): TrackBoundaryConfig {
        return {
            outerBoundaryOffset: 35,
            innerBoundaryOffset: 35,
            debugOuterColor: "rgba(0, 255, 0, 0.3)",
            debugInnerColor: "rgba(255, 0, 0, 0.3)",
            maxOffTrackTime: 3000,
            offTrackSlowdown: 0.95,
        };
    }

    setHapticFeedback(callback: (duration: number) => void): void {
        this.hapticFeedback = callback;
    }

    init(): void {}

    onEnter(): void {
        this.isOnTrack = true;
        this.offTrackTimer = 0;
    }

    onExit(): void {}

    update(context: FrameContext): void {
        const deltaTime = context.deltaTime;

        if (this.isOnTrack) {
            this.offTrackTimer = 0;
        } else {
            this.offTrackTimer += deltaTime;
        }
    }

    render(context: FrameContext): void {
        //this.renderDebug(context.ctx);

        if (!this.isOnTrack) {
            const ctx = context.ctx;
            ctx.save();
            ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("OFF TRACK!", context.ctx.canvas.width / 2, 50);
            ctx.restore();
        }
    }

    resize(): void {}

    checkCarOnTrack(player: IPlayer, deltaTime: number): boolean {
        const wasOnTrack = this.isOnTrack;
        this.isOnTrack = this.isCarOnTrack(player);

        if (!this.isOnTrack) {
            this.offTrackTimer += deltaTime;

            if (this.offTrackTimer > this.config.maxOffTrackTime) {
                this.offTrackTimer = 0;
                this.isOnTrack = true;
                return false;
            }

            player.velocity *= this.config.offTrackSlowdown;
        } else {
            this.offTrackTimer = 0;
        }

        if (wasOnTrack && !this.isOnTrack && this.hapticFeedback) {
            this.hapticFeedback(100);
        }

        return this.isOnTrack;
    }

    isCarOnTrack(player: IPlayer): boolean {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        const carWidth = 30;
        const carHeight = 50;

        const points = [
            {
                x: player.position.x - carWidth / 2,
                y: player.position.y - carHeight / 2,
            },
            {
                x: player.position.x + carWidth / 2,
                y: player.position.y - carHeight / 2,
            },
            {
                x: player.position.x - carWidth / 2,
                y: player.position.y + carHeight / 2,
            },
            {
                x: player.position.x + carWidth / 2,
                y: player.position.y + carHeight / 2,
            },
            { x: player.position.x, y: player.position.y },
        ];

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        const outerHalfLength =
            halfLength + roadWidth / 2 + this.config.outerBoundaryOffset;
        const outerHalfHeight =
            halfHeight + roadWidth / 2 + this.config.outerBoundaryOffset;
        const outerRadius =
            radius + roadWidth / 2 + this.config.outerBoundaryOffset;

        const innerHalfLength =
            halfLength - roadWidth / 2 - this.config.innerBoundaryOffset;
        const innerHalfHeight =
            halfHeight - roadWidth / 2 - this.config.innerBoundaryOffset;
        const innerRadius =
            radius - roadWidth / 2 - this.config.innerBoundaryOffset;

        for (const point of points) {
            if (
                !this.isPointInRoundedRect(
                    point,
                    cx,
                    cy,
                    outerHalfLength,
                    outerHalfHeight,
                    outerRadius
                )
            ) {
                return false;
            }

            if (
                this.isPointInRoundedRect(
                    point,
                    cx,
                    cy,
                    innerHalfLength,
                    innerHalfHeight,
                    innerRadius
                )
            ) {
                return false;
            }
        }

        return true;
    }

    private isPointInRoundedRect(
        point: { x: number; y: number },
        cx: number,
        cy: number,
        halfLength: number,
        halfHeight: number,
        radius: number
    ): boolean {
        if (
            Math.abs(point.x - cx) <= halfLength - radius &&
            Math.abs(point.y - cy) <= halfHeight - radius
        ) {
            return true;
        }

        const dx = Math.abs(point.x - cx) - (halfLength - radius);
        const dy = Math.abs(point.y - cy) - (halfHeight - radius);

        if (dx > 0 && dy > 0) {
            return dx * dx + dy * dy <= radius * radius;
        }

        return (
            Math.abs(point.x - cx) <= halfLength &&
            Math.abs(point.y - cy) <= halfHeight
        );
    }

    renderDebug(ctx: CanvasRenderingContext2D): void {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        ctx.fillStyle = this.config.debugOuterColor;
        this.drawRoundedRect(
            ctx,
            cx,
            cy,
            halfLength + roadWidth / 2 + this.config.outerBoundaryOffset,
            halfHeight + roadWidth / 2 + this.config.outerBoundaryOffset,
            radius + roadWidth / 2 + this.config.outerBoundaryOffset
        );

        ctx.fillStyle = this.config.debugInnerColor;
        this.drawRoundedRect(
            ctx,
            cx,
            cy,
            halfLength - roadWidth / 2 - this.config.innerBoundaryOffset,
            halfHeight - roadWidth / 2 - this.config.innerBoundaryOffset,
            radius - roadWidth / 2 - this.config.innerBoundaryOffset
        );
    }

    private drawRoundedRect(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        halfLength: number,
        halfHeight: number,
        radius: number
    ): void {
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
        ctx.fill();
    }
}
