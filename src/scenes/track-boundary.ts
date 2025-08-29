import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";
import type { ArrowPlayer } from "./arrow-player";

interface TrackBoundaryConfig {
    outerBoundaryOffset: number;
    innerBoundaryOffset: number;
    debugOuterColor: string;
    debugInnerColor: string;
    maxOffTrackTime: number;
    offTrackSlowdown: number;
}

export class TrackBoundary implements Scene {
    name: string = "Track-Boundary";
    displayName?: string = "Track Boundary";

    private config: TrackBoundaryConfig;
    private isOnTrack: boolean = true;
    private offTrackTimer: number = 0;
    private hapticFeedback?: (duration: number) => void;

    constructor(
        private readonly track: RectangleTrack,
        config: Partial<TrackBoundaryConfig> = {}
    ) {
        this.config = {
            outerBoundaryOffset: 35,
            innerBoundaryOffset: 35,
            debugOuterColor: "rgba(0, 255, 0, 0.3)",
            debugInnerColor: "rgba(255, 0, 0, 0.3)",
            maxOffTrackTime: 3000, // 3 seconds
            offTrackSlowdown: 0.95,
            ...config,
        };
    }

    setHapticFeedback(callback: (duration: number) => void): void {
        this.hapticFeedback = callback;
    }

    init(): void {
        // No specific initialization needed
    }

    onEnter(): void {
        this.isOnTrack = true;
        this.offTrackTimer = 0;
    }

    onExit(): void {
        // No specific cleanup needed
    }

    update(context: FrameContext): void {
        // Update logic moved from turbo-laps.js
        const deltaTime = context.deltaTime;

        if (this.isOnTrack) {
            this.offTrackTimer = 0;
        } else {
            this.offTrackTimer += deltaTime;
        }
    }

    render(context: FrameContext): void {
        this.renderDebug(context.ctx);
        
        // Render off-track warning if applicable
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

    resize(): void {
        // No specific resize logic needed
    }

    checkCarOnTrack(car: ArrowPlayer, deltaTime: number): boolean {
        const wasOnTrack = this.isOnTrack;
        this.isOnTrack = this.isCarOnTrack(car);

        if (!this.isOnTrack) {
            this.offTrackTimer += deltaTime;

            if (this.offTrackTimer > this.config.maxOffTrackTime) {
                this.offTrackTimer = 0;
                this.isOnTrack = true;
                return false; // Signal that car should be reset
            }

            // Apply slowdown to car
            car.velocity *= this.config.offTrackSlowdown;
        } else {
            this.offTrackTimer = 0;
        }

        // Trigger haptic feedback when going off track
        if (wasOnTrack && !this.isOnTrack && this.hapticFeedback) {
            this.hapticFeedback(100);
        }

        return this.isOnTrack;
    }

    isCarOnTrack(car: ArrowPlayer): boolean {
        const trackConfig = this.track.config;
        const trackState = this.track.state;

        const carWidth = 30; // ArrowPlayer's carWidth from config
        const carHeight = 50; // ArrowPlayer's carHeight from config

        // Check four corners of the car plus center point
        const points = [
            {
                x: car.position.x - carWidth / 2,
                y: car.position.y - carHeight / 2,
            }, // top-left
            {
                x: car.position.x + carWidth / 2,
                y: car.position.y - carHeight / 2,
            }, // top-right
            {
                x: car.position.x - carWidth / 2,
                y: car.position.y + carHeight / 2,
            }, // bottom-left
            {
                x: car.position.x + carWidth / 2,
                y: car.position.y + carHeight / 2,
            }, // bottom-right
            { x: car.position.x, y: car.position.y }, // center for better detection
        ];

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        // Calculate boundaries
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
            // Check if outside outer boundary
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

            // Check if inside inner boundary
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
        // Check central rectangle area
        if (
            Math.abs(point.x - cx) <= halfLength - radius &&
            Math.abs(point.y - cy) <= halfHeight - radius
        ) {
            return true;
        }

        // Check rounded corners
        const dx = Math.abs(point.x - cx) - (halfLength - radius);
        const dy = Math.abs(point.y - cy) - (halfHeight - radius);

        if (dx > 0 && dy > 0) {
            return dx * dx + dy * dy <= radius * radius;
        }

        // Check straight sections
        return (
            Math.abs(point.x - cx) <= halfLength &&
            Math.abs(point.y - cy) <= halfHeight
        );
    }

    renderDebug(ctx: CanvasRenderingContext2D): void {
        const trackConfig = this.track.config;
        const trackState = this.track.state;

        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const roadWidth = trackConfig.roadWidth;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        // Draw outer boundary
        ctx.fillStyle = this.config.debugOuterColor;
        this.drawRoundedRect(
            ctx,
            cx,
            cy,
            halfLength + roadWidth / 2 + this.config.outerBoundaryOffset,
            halfHeight + roadWidth / 2 + this.config.outerBoundaryOffset,
            radius + roadWidth / 2 + this.config.outerBoundaryOffset
        );

        // Draw inner boundary
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

        // Top straight
        ctx.moveTo(cx - halfLength + radius, cy - halfHeight);
        ctx.lineTo(cx + halfLength - radius, cy - halfHeight);

        // Top-right curve
        ctx.arcTo(
            cx + halfLength,
            cy - halfHeight,
            cx + halfLength,
            cy - halfHeight + radius,
            radius
        );

        // Right straight
        ctx.lineTo(cx + halfLength, cy + halfHeight - radius);

        // Bottom-right curve
        ctx.arcTo(
            cx + halfLength,
            cy + halfHeight,
            cx + halfLength - radius,
            cy + halfHeight,
            radius
        );

        // Bottom straight
        ctx.lineTo(cx - halfLength + radius, cy + halfHeight);

        // Bottom-left curve
        ctx.arcTo(
            cx - halfLength,
            cy + halfHeight,
            cx - halfLength,
            cy + halfHeight - radius,
            radius
        );

        // Left straight
        ctx.lineTo(cx - halfLength, cy - halfHeight + radius);

        // Top-left curve
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