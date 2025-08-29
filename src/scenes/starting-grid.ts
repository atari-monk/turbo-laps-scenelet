import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";

export class StartingGrid implements Scene {
    name: string = "Starting Grid";
    displayName?: string = "Starting Grid";

    private track: RectangleTrack;
    private config: {
        stripeWidth: number;
        stripeLength: number;
        stripeCount: number;
        offset: number;
    };

    constructor(
        track: RectangleTrack,
        config: Partial<typeof this.config> = {}
    ) {
        this.track = track;
        this.config = {
            stripeWidth: 10,
            stripeLength: 50,
            stripeCount: 5,
            offset: 40, // Distance from track edge
            ...config,
        };
    }

    private calculateStartPosition() {
        const trackConfig = this.track.config;
        const trackState = this.track.state;

        // Place starting grid at the beginning of section 0 (top center of track)
        return {
            x: trackState.centerX,
            y:
                trackState.centerY -
                trackConfig.trackHeight / 2 +
                this.config.offset,
            angle: Math.PI / 2, // 90 degrees (pointing downward along the track)
        };
    }

    render(context: FrameContext): void {
        const startPos = this.calculateStartPosition();
        const totalWidth = this.config.stripeWidth * this.config.stripeCount;

        context.ctx.save();

        // Draw alternating stripes
        for (let i = 0; i < this.config.stripeCount; i++) {
            context.ctx.fillStyle = i % 2 === 0 ? "white" : "black";
            context.ctx.fillRect(
                startPos.x - totalWidth / 2 + i * this.config.stripeWidth,
                startPos.y - this.config.stripeLength / 2,
                this.config.stripeWidth,
                this.config.stripeLength
            );
        }

        context.ctx.restore();
    }

    getStartingPosition() {
        return this.calculateStartPosition();
    }

    resize(): void {
        // No specific resize logic needed
    }

    // Scene interface implementation
    init(): void {
        // Initialization logic if needed
    }

    update(_context: FrameContext): void {
        // Update logic if needed
    }

    onEnter(): void {
        // Called when scene enters
    }

    onExit(): void {
        // Called when scene exits
    }
}
