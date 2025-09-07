import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { TrackConfig } from "./type/track-config";
import type { TrackState } from "./type/track-state";
import { TrackConfigService } from "./service/track-config.service";

interface RoadMarkingsConfig {
    lineWidth: number;
    lineColor: string;
    dashLength: number;
    gapLength: number;
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
            gapLength: 15,
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
        const centerLinePoints = this.calculateCenterLine(
            this.configService.getConfig(),
            this.configService.getState()
        );

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

    private calculateCenterLine(
        trackConfig: TrackConfig,
        trackState: TrackState
    ): { x: number; y: number }[] {
        const halfLength = trackConfig.trackWidth / 2;
        const halfHeight = trackConfig.trackHeight / 2;
        const radius = halfHeight;
        const cx = trackState.centerX;
        const cy = trackState.centerY;
        const points: { x: number; y: number }[] = [];
        const segments = 100;

        for (
            let x = cx - halfLength + radius;
            x <= cx + halfLength - radius;
            x += 5
        ) {
            points.push({ x, y: cy - halfHeight });
        }

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

        for (
            let y = cy - halfHeight + radius;
            y <= cy + halfHeight - radius;
            y += 5
        ) {
            points.push({ x: cx + halfLength, y });
        }

        for (let angle = 0; angle <= Math.PI / 2; angle += Math.PI / segments) {
            points.push({
                x: cx + halfLength - radius + radius * Math.cos(angle),
                y: cy + halfHeight - radius + radius * Math.sin(angle),
            });
        }

        for (
            let x = cx + halfLength - radius;
            x >= cx - halfLength + radius;
            x -= 5
        ) {
            points.push({ x, y: cy + halfHeight });
        }

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

        for (
            let y = cy + halfHeight - radius;
            y >= cy - halfHeight + radius;
            y -= 5
        ) {
            points.push({ x: cx - halfLength, y });
        }

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
