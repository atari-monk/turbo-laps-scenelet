import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import { TrackConfigService } from "../service/track-config.service";

export interface StartingGridConfig {
    stripeWidth: number;
    stripeLength: number;
    stripeCount: number;
    offset: number;
}

export interface IStartingGrid extends Scene {
    getStartingPosition(): {
        x: number;
        y: number;
        angle: number;
    };
}

export class StartingGrid implements IStartingGrid {
    name: string = "Starting-Grid";
    displayName?: string = "Starting Grid";

    private readonly configService = TrackConfigService.getInstance();
    private config: StartingGridConfig;

    constructor(config: Partial<StartingGridConfig> = {}) {
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };
    }

    private getDefaultConfig(): StartingGridConfig {
        return {
            stripeWidth: 10,
            stripeLength: 50,
            stripeCount: 11,
            offset: 40,
        };
    }

    setConfig(config: Partial<StartingGridConfig>): void {
        this.config = { ...this.config, ...config };
    }

    private calculateStartPosition() {
        const trackConfig = this.configService.getConfig();
        const trackState = this.configService.getState();

        return {
            x: trackState.centerX,
            y:
                trackState.centerY -
                trackConfig.trackHeight / 2 +
                this.config.offset,
            angle: Math.PI / 2,
        };
    }

    render(context: FrameContext): void {
        const startPos = this.calculateStartPosition();
        const totalWidth = this.config.stripeWidth * this.config.stripeCount;

        context.ctx.save();

        for (let i = 0; i < this.config.stripeCount; i++) {
            context.ctx.globalAlpha = 0.4;
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

    getStartingPosition(): {
        x: number;
        y: number;
        angle: number;
    } {
        return this.calculateStartPosition();
    }

    resize(): void {}

    init(): void {}

    update(_context: FrameContext): void {}

    onEnter(): void {}

    onExit(): void {}
}
