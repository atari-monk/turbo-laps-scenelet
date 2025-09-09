import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { TrackConfig } from "../type/track-config";
import type { TrackState } from "../type/track-state";
import { TrackConfigService } from "../service/track-config.service";

interface RoadMarkingsConfig {
    lineWidth: number;
    lineColor: string;
    dashLength: number;
    gapLength: number;
}

interface TrackSegment {
    type: "straight" | "curve";
    start: number;
    length: number;
    getPoint: (distance: number) => { x: number; y: number };
}

export class RoadMarkings implements Scene {
    name: string = "Road-Markings";
    displayName?: string = "Road Markings";

    private readonly configService = TrackConfigService.getInstance();
    private config: RoadMarkingsConfig;

    constructor(config: Partial<RoadMarkingsConfig> = {}) {
        this.config = {
            lineWidth: 4,
            lineColor: "#ffffff",
            dashLength: 20,
            gapLength: 35,
            ...config,
        };
    }

    setConfig(config: Partial<RoadMarkingsConfig>): void {
        this.config = { ...this.config, ...config };
    }

    init(): void {}
    onEnter(): void {}
    onExit(): void {}

    resize(): void {}

    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        const segments = this.calculateTrackSegments(trackConfig, trackState);
        const totalLength = segments.reduce(
            (sum, segment) => sum + segment.length,
            0
        );

        context.ctx.save();
        context.ctx.strokeStyle = this.config.lineColor;
        context.ctx.lineWidth = this.config.lineWidth;
        context.ctx.lineCap = "round";

        this.drawDashedLineAlongSegments(context.ctx, segments, totalLength);

        context.ctx.restore();
    }

    private drawDashedLineAlongSegments(
        ctx: CanvasRenderingContext2D,
        segments: TrackSegment[],
        totalLength: number
    ): void {
        const patternLength = this.config.dashLength + this.config.gapLength;
        const patternCount = Math.ceil(totalLength / patternLength);

        for (
            let patternIndex = 0;
            patternIndex < patternCount;
            patternIndex++
        ) {
            const patternStart = patternIndex * patternLength;
            const dashStart = patternStart;
            const dashEnd = Math.min(
                patternStart + this.config.dashLength,
                totalLength
            );

            if (dashStart < totalLength) {
                this.drawLineSegment(
                    ctx,
                    segments,
                    dashStart,
                    Math.min(dashEnd, totalLength)
                );
            }
        }
    }

    private drawLineSegment(
        ctx: CanvasRenderingContext2D,
        segments: TrackSegment[],
        startDistance: number,
        endDistance: number
    ): void {
        ctx.beginPath();

        let currentDistance = startDistance;
        let segmentIndex = this.findSegmentAtDistance(
            segments,
            currentDistance
        );

        const startPoint = this.getPointAtDistance(segments, currentDistance);
        ctx.moveTo(startPoint.x, startPoint.y);

        while (
            currentDistance < endDistance &&
            segmentIndex < segments.length
        ) {
            const segment = segments[segmentIndex];
            const segmentEndDistance = segment.start + segment.length;
            const segmentRemaining = segmentEndDistance - currentDistance;
            const neededDistance = endDistance - currentDistance;
            const stepDistance = Math.min(segmentRemaining, neededDistance);

            const endPoint = this.getPointAtDistance(
                segments,
                currentDistance + stepDistance
            );
            ctx.lineTo(endPoint.x, endPoint.y);

            currentDistance += stepDistance;
            segmentIndex++;
        }

        ctx.stroke();
    }

    private findSegmentAtDistance(
        segments: TrackSegment[],
        distance: number
    ): number {
        for (let i = 0; i < segments.length; i++) {
            if (distance <= segments[i].start + segments[i].length) {
                return i;
            }
        }
        return segments.length - 1;
    }

    private getPointAtDistance(
        segments: TrackSegment[],
        distance: number
    ): { x: number; y: number } {
        const segmentIndex = this.findSegmentAtDistance(segments, distance);
        const segment = segments[segmentIndex];
        const segmentDistance = distance - segment.start;
        return segment.getPoint(segmentDistance);
    }

    private calculateTrackSegments(
        trackConfig: TrackConfig,
        trackState: TrackState
    ): TrackSegment[] {
        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const cx = trackState.centerX;
        const cy = trackState.centerY;

        const segments: TrackSegment[] = [];
        let currentDistance = 0;

        const topStraightLength = trackConfig.trackWidth - 2 * radius;
        segments.push({
            type: "straight",
            start: currentDistance,
            length: topStraightLength,
            getPoint: (distance) => ({
                x: cx - halfLength + radius + distance,
                y: cy - halfHeight,
            }),
        });
        currentDistance += topStraightLength;

        const topRightCurveLength = (Math.PI * radius) / 2;
        segments.push({
            type: "curve",
            start: currentDistance,
            length: topRightCurveLength,
            getPoint: (distance) => {
                const angle = -Math.PI / 2 + distance / radius;
                return {
                    x: cx + halfLength - radius + radius * Math.cos(angle),
                    y: cy - halfHeight + radius + radius * Math.sin(angle),
                };
            },
        });
        currentDistance += topRightCurveLength;

        const rightStraightLength = trackConfig.trackHeight - 2 * radius;
        segments.push({
            type: "straight",
            start: currentDistance,
            length: rightStraightLength,
            getPoint: (distance) => ({
                x: cx + halfLength,
                y: cy - halfHeight + radius + distance,
            }),
        });
        currentDistance += rightStraightLength;

        const bottomRightCurveLength = (Math.PI * radius) / 2;
        segments.push({
            type: "curve",
            start: currentDistance,
            length: bottomRightCurveLength,
            getPoint: (distance) => {
                const angle = distance / radius;
                return {
                    x: cx + halfLength - radius + radius * Math.cos(angle),
                    y: cy + halfHeight - radius + radius * Math.sin(angle),
                };
            },
        });
        currentDistance += bottomRightCurveLength;

        const bottomStraightLength = trackConfig.trackWidth - 2 * radius;
        segments.push({
            type: "straight",
            start: currentDistance,
            length: bottomStraightLength,
            getPoint: (distance) => ({
                x: cx + halfLength - radius - distance,
                y: cy + halfHeight,
            }),
        });
        currentDistance += bottomStraightLength;

        const bottomLeftCurveLength = (Math.PI * radius) / 2;
        segments.push({
            type: "curve",
            start: currentDistance,
            length: bottomLeftCurveLength,
            getPoint: (distance) => {
                const angle = Math.PI / 2 + distance / radius;
                return {
                    x: cx - halfLength + radius + radius * Math.cos(angle),
                    y: cy + halfHeight - radius + radius * Math.sin(angle),
                };
            },
        });
        currentDistance += bottomLeftCurveLength;

        const leftStraightLength = trackConfig.trackHeight - 2 * radius;
        segments.push({
            type: "straight",
            start: currentDistance,
            length: leftStraightLength,
            getPoint: (distance) => ({
                x: cx - halfLength,
                y: cy + halfHeight - radius - distance,
            }),
        });
        currentDistance += leftStraightLength;

        const topLeftCurveLength = (Math.PI * radius) / 2;
        segments.push({
            type: "curve",
            start: currentDistance,
            length: topLeftCurveLength,
            getPoint: (distance) => {
                const angle = Math.PI + distance / radius;
                return {
                    x: cx - halfLength + radius + radius * Math.cos(angle),
                    y: cy - halfHeight + radius + radius * Math.sin(angle),
                };
            },
        });

        return segments;
    }
}
