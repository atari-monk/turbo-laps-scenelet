import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { TrackConfig } from "../type/track-config";
import type { TrackState } from "../type/track-state";
import { TrackConfigService } from "../service/track-config.service";

export class ElipseTrack implements Scene {
    name: string = "Elipse-Track";
    displayName?: string = "Elipse Track";

    private readonly configService = TrackConfigService.getInstance();

    constructor(private readonly canvas: HTMLCanvasElement) {
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
        this.elipse_track(
            context.ctx,
            this.configService.getConfig(),
            this.configService.getState()
        );
    }

    resize(): void {
        this.configService.calculateTrackState(this.canvas);
    }

    private elipse_track(
        ctx: CanvasRenderingContext2D,
        config: TrackConfig,
        state: TrackState
    ): void {
        ctx.beginPath();
        ctx.ellipse(
            state.centerX,
            state.centerY,
            state.radiusX,
            state.radiusY,
            0,
            0,
            Math.PI * 2
        );
        ctx.lineWidth = config.roadWidth;
        ctx.strokeStyle = config.roadColor;
        ctx.stroke();
    }
}
