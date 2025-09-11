import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import { TrackConfigService } from "../service/track-config.service";
import type { IStartingGrid } from "./starting-grid";
import type { ICar } from "../car/type/i-car";

interface TrackBoundaryConfig {
    outerBoundaryOffset: number;
    innerBoundaryOffset: number;
    debugOuterColor: string;
    debugInnerColor: string;
    maxOffTrackTime: number;
    offTrackSlowdown: number;
    enableMargins: boolean;
    debugMode: boolean;
}

export interface ITrackBoundary extends Scene {
    checkCarOnTrack(
        car: ICar,
        startingGrid: IStartingGrid,
        deltaTime: number
    ): boolean;
}

export class TrackBoundary implements ITrackBoundary {
    name = "Track-Boundary";
    displayName = "Track Boundary";

    private config: TrackBoundaryConfig;
    private isOnTrack = true;
    private offTrackTimer = 0;
    private hapticFeedback?: (duration: number) => void;
    private readonly configService = TrackConfigService.getInstance();
    private pulseAnimationPhase = 0;
    private enableMargins: boolean;
    private debugMode: boolean;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        config: Partial<TrackBoundaryConfig> = {}
    ) {
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };
        this.enableMargins = this.config.enableMargins;
        this.debugMode = this.config.debugMode;
        this.configService.calculateTrackState(this.canvas);
    }

    private getDefaultConfig(): TrackBoundaryConfig {
        return {
            outerBoundaryOffset: 35,
            innerBoundaryOffset: 35,
            debugOuterColor: "rgba(0, 255, 0, 0.3)",
            debugInnerColor: "rgba(255, 0, 0, 0.3)",
            maxOffTrackTime: 5000,
            offTrackSlowdown: 0.95,
            enableMargins: true,
            debugMode: false,
        };
    }

    toggleMargins(enabled: boolean): void {
        this.enableMargins = enabled;
    }

    setHapticFeedback(callback: (duration: number) => void): void {
        this.hapticFeedback = callback;
    }

    init(): void {}

    onEnter(): void {
        this.isOnTrack = true;
        this.offTrackTimer = 0;
        this.pulseAnimationPhase = 0;
    }

    onExit(): void {}

    update(context: FrameContext): void {
        const deltaTime = context.deltaTime;

        if (this.isOnTrack) {
            this.offTrackTimer = 0;
            this.pulseAnimationPhase = 0;
        } else {
            this.offTrackTimer += deltaTime * 1000;
            this.pulseAnimationPhase += deltaTime / 500;
        }
    }

    render(context: FrameContext): void {
        if (this.debugMode) this.renderDebug(context.ctx);
        if (!this.isOnTrack) {
            const ctx = context.ctx;
            const canvas = context.ctx.canvas;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const pulseIntensity =
                0.5 + Math.abs(Math.sin(this.pulseAnimationPhase)) * 0.5;
            const remainingTime = Math.ceil(
                (this.config.maxOffTrackTime - this.offTrackTimer) / 1000
            );

            ctx.save();

            const opacity = 0.8 + pulseIntensity * 0.2;
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
            ctx.font = "bold 48px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillText("OFF TRACK!", centerX, centerY - 40);

            ctx.font = "bold 36px Arial";
            ctx.shadowBlur = 5;
            ctx.fillText(`Reset in: ${remainingTime}s`, centerX, centerY + 40);

            ctx.restore();
        }
    }

    resize(): void {}

    checkCarOnTrack(
        car: ICar,
        startingGrid: IStartingGrid,
        deltaTime: number
    ): boolean {
        const wasOnTrack = this.isOnTrack;
        this.isOnTrack = this.isCarOnTrack(car);

        if (!this.isOnTrack) {
            this.offTrackTimer += deltaTime * 1000;

            if (this.offTrackTimer >= this.config.maxOffTrackTime) {
                this.resetCar(car, startingGrid);
                return false;
            }

            car.velocity *= this.config.offTrackSlowdown;
        } else {
            this.offTrackTimer = 0;
        }

        if (wasOnTrack && !this.isOnTrack && this.hapticFeedback) {
            this.hapticFeedback(100);
        }

        return this.isOnTrack;
    }

    private resetCar(car: ICar, startingGrid: IStartingGrid): void {
        this.offTrackTimer = 0;
        this.isOnTrack = true;
        car.setStartingPosition(startingGrid.getStartingPosition());
        car.velocity = 0;
    }

    isCarOnTrack(car: ICar): boolean {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        const carWidth = 30;
        const carHeight = 50;

        const points = [
            {
                x: car.position.x - carWidth / 2,
                y: car.position.y - carHeight / 2,
            },
            {
                x: car.position.x + carWidth / 2,
                y: car.position.y + carHeight / 2,
            },
            {
                x: car.position.x - carWidth / 2,
                y: car.position.y + carHeight / 2,
            },
            {
                x: car.position.x + carWidth / 2,
                y: car.position.y + carHeight / 2,
            },
            { x: car.position.x, y: car.position.y },
        ];

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        const outerOffset = this.enableMargins
            ? this.config.outerBoundaryOffset
            : 0;
        const innerOffset = this.enableMargins
            ? this.config.innerBoundaryOffset
            : 0;

        const outerHalfLength = halfLength + roadWidth / 2 + outerOffset;
        const outerHalfHeight = halfHeight + roadWidth / 2 + outerOffset;
        const outerRadius = radius + roadWidth / 2 + outerOffset;

        const innerHalfLength = halfLength - roadWidth / 2 - innerOffset;
        const innerHalfHeight = halfHeight - roadWidth / 2 - innerOffset;
        const innerRadius = radius - roadWidth / 2 - innerOffset;

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

        const outerOffset = this.enableMargins
            ? this.config.outerBoundaryOffset
            : 0;
        const innerOffset = this.enableMargins
            ? this.config.innerBoundaryOffset
            : 0;

        ctx.fillStyle = this.config.debugOuterColor;
        this.drawRoundedRect(
            ctx,
            cx,
            cy,
            halfLength + roadWidth / 2 + outerOffset,
            halfHeight + roadWidth / 2 + outerOffset,
            radius + roadWidth / 2 + outerOffset
        );

        ctx.fillStyle = this.config.debugInnerColor;
        this.drawRoundedRect(
            ctx,
            cx,
            cy,
            halfLength - roadWidth / 2 - innerOffset,
            halfHeight - roadWidth / 2 - innerOffset,
            radius - roadWidth / 2 - innerOffset
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
