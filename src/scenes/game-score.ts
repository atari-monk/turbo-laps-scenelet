import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { ILapTracker } from "./lap-tracker";

interface GameScoreConfig {
    maxRecords?: number;
    textColor?: string;
    bestTimeColor?: string;
    fontSize?: number;
    fontFamily?: string;
    title?: string;
    padding?: number;
}

interface GameScoreState {
    bestRaceTimes: number[];
}

export interface IGameScore extends Scene {
    onRaceComplete(lapTracker: ILapTracker): void;
}

export class GameScore implements IGameScore {
    name = "Game-Score";
    displayName = "Game Score";

    private config: Required<GameScoreConfig>;
    private state: GameScoreState;

    constructor(config: GameScoreConfig = {}) {
        this.config = {
            maxRecords: 5,
            textColor: "white",
            bestTimeColor: "gold",
            fontSize: 16,
            fontFamily: "Arial",
            title: "Best Race Times (5 laps):",
            padding: 20,
            ...config,
        };

        this.state = {
            bestRaceTimes: [],
        };
    }

    init(): void {}

    onEnter(): void {}

    onExit(): void {}

    update(_context: FrameContext): void {}

    resize(): void {}

    public onRaceComplete(lapTracker: ILapTracker): void {
        const lapTimes = lapTracker.getLapTimes();
        if (lapTimes.length === 1) {
            const totalTime = lapTimes.reduce((sum, time) => sum + time, 0);
            this.addRaceTime(totalTime);
        }
    }

    private addRaceTime(time: number): void {
        this.state.bestRaceTimes = [...this.state.bestRaceTimes, time]
            .sort((a, b) => a - b)
            .slice(0, this.config.maxRecords);
    }

    render(context: FrameContext): void {
        if (this.state.bestRaceTimes.length === 0) return;

        const ctx = context.ctx;
        const canvas = context.ctx.canvas;
        ctx.save();
        ctx.fillStyle = this.config.textColor;
        ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";

        const titleMetrics = ctx.measureText(this.config.title);
        const titleHeight =
            titleMetrics.actualBoundingBoxAscent +
            titleMetrics.actualBoundingBoxDescent;
        const lineHeight = this.config.fontSize + 5;
        const totalHeight =
            titleHeight + this.state.bestRaceTimes.length * lineHeight;

        const xPos = this.config.padding;
        const yPos = canvas.height - this.config.padding;

        ctx.fillText(this.config.title, xPos, yPos - totalHeight + titleHeight);

        for (let i = 0; i < this.state.bestRaceTimes.length; i++) {
            const time = this.state.bestRaceTimes[i];
            const textYPos =
                yPos - totalHeight + titleHeight + (i + 1) * lineHeight;

            ctx.fillStyle =
                i === 0 ? this.config.bestTimeColor : this.config.textColor;

            ctx.fillText(
                `${i + 1}. ${(time / 1000).toFixed(2)}s`,
                xPos,
                textYPos
            );
        }

        ctx.restore();
    }

    reset(): void {
        this.state.bestRaceTimes = [];
    }

    getBestTimes(): number[] {
        return [...this.state.bestRaceTimes];
    }
}
