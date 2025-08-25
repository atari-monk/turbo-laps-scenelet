import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";

interface RoadMarkingsConfig {
    lineWidth: number;
    lineColor: string;
    dashLength: number;
    gapLength: number;
}

export class RoadMarkings implements Scene {
    name: string = "Road Markings";
    displayName?: string = "Road Markings";

    private track: RectangleTrack;
    private config: RoadMarkingsConfig;

    constructor(
        track: RectangleTrack,
        config: Partial<RoadMarkingsConfig> = {}
    ) {
        this.track = track;
        this.config = {
            lineWidth: 4,
            lineColor: "#ffffff",
            dashLength: 20,
            gapLength: 15,
            ...config,
        };
    }

    init(): void {}
    onEnter(): void {}
    onExit(): void {}
    resize(): void {}

    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        const centerLinePoints = this.calculateCenterLine();

        context.ctx.save();
        context.ctx.strokeStyle = this.config.lineColor;
        context.ctx.lineWidth = this.config.lineWidth;
        context.ctx.lineCap = "round";

        this.drawDashedLine(context.ctx, centerLinePoints);

        context.ctx.restore();
    }

    private drawDashedLine(
        ctx: CanvasRenderingContext2D,
        points: { x: number; y: number }[]
    ): void {
        ctx.beginPath();
        let drawing = false;
        let distance = 0;

        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const segmentLength = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );

            distance += segmentLength;

            if (drawing) {
                if (distance >= this.config.dashLength) {
                    ctx.stroke();
                    ctx.beginPath();
                    distance = 0;
                    drawing = false;
                } else {
                    ctx.lineTo(curr.x, curr.y);
                }
            } else {
                if (distance >= this.config.gapLength) {
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    distance = 0;
                    drawing = true;
                }
            }
        }

        if (drawing) {
            ctx.stroke();
        }
    }

    private calculateCenterLine(): { x: number; y: number }[] {
        const track = this.track.config;
        const state = this.track.state;
        const halfLength = track.trackWidth / 2;
        const halfHeight = track.trackHeight / 2;
        const radius = halfHeight;
        const cx = state.centerX;
        const cy = state.centerY;
        const points: { x: number; y: number }[] = [];
        const segments = 100;

        // Top straight (left to right)
        for (
            let x = cx - halfLength + radius;
            x <= cx + halfLength - radius;
            x += 5
        ) {
            points.push({ x, y: cy - halfHeight });
        }

        // Top-right curve
        for (
            let angle = -Math.PI / 2;
            angle <= 0;
            angle += Math.PI / segments
        ) {
            points.push({
                x: cx + halfLength - radius + radius * Math.cos(angle),
                y: cy - halfHeight + radius + radius * Math.sin(angle),
            });
        }

        // Right straight (top to bottom)
        for (
            let y = cy - halfHeight + radius;
            y <= cy + halfHeight - radius;
            y += 5
        ) {
            points.push({ x: cx + halfLength, y });
        }

        // Bottom-right curve
        for (let angle = 0; angle <= Math.PI / 2; angle += Math.PI / segments) {
            points.push({
                x: cx + halfLength - radius + radius * Math.cos(angle),
                y: cy + halfHeight - radius + radius * Math.sin(angle),
            });
        }

        // Bottom straight (right to left)
        for (
            let x = cx + halfLength - radius;
            x >= cx - halfLength + radius;
            x -= 5
        ) {
            points.push({ x, y: cy + halfHeight });
        }

        // Bottom-left curve
        for (
            let angle = Math.PI / 2;
            angle <= Math.PI;
            angle += Math.PI / segments
        ) {
            points.push({
                x: cx - halfLength + radius + radius * Math.cos(angle),
                y: cy + halfHeight - radius + radius * Math.sin(angle),
            });
        }

        // Left straight (bottom to top)
        for (
            let y = cy + halfHeight - radius;
            y >= cy - halfHeight + radius;
            y -= 5
        ) {
            points.push({ x: cx - halfLength, y });
        }

        // Top-left curve
        for (
            let angle = Math.PI;
            angle <= Math.PI * 1.5;
            angle += Math.PI / segments
        ) {
            points.push({
                x: cx - halfLength + radius + radius * Math.cos(angle),
                y: cy - halfHeight + radius + radius * Math.sin(angle),
            });
        }

        return points;
    }
}
