import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";

export class ElipseTrack implements Scene {
    name: string = "Elipse Track";
    displayName?: string = "Elipse Track";

    private config = {
        trackWidth: 800,
        trackHeight: 400,
        roadWidth: 60,
        roadColor: "#555",
        backgroundColor: "#2a2a2a",
    };

    private state = {
        centerX: 0,
        centerY: 0,
        radiusX: 0,
        radiusY: 0,
    };

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
        this.elipse_track(context.ctx, this.config, this.state);
    }

    resize(): void {
        this.state.centerX = this.canvas.width / 2;
        this.state.centerY = this.canvas.height / 2;
        this.state.radiusX = this.config.trackWidth / 2;
        this.state.radiusY = this.config.trackHeight / 2;
    }

    private elipse_track(
        ctx: CanvasRenderingContext2D,
        config: typeof this.config,
        state: typeof this.state
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
