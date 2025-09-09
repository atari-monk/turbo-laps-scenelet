import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { ILapTracker } from "./lap-tracker";
import { TrackConfigService } from "../service/track-config.service";

interface GameScoreConfig {
    maxRecords?: number;
    textColor?: string;
    bestTimeColor?: string;
    lastTimeColor?: string;
    fontSize?: number;
    fontFamily?: string;
    title?: string;
    padding?: number;
}

interface GameScoreState {
    bestRaceTimes: number[];
    lastRaceTimeIndex: number | null;
}

export interface IGameScore extends Scene {
    onRaceComplete(lapTracker: ILapTracker): void;
}

export class GameScore implements IGameScore {
    name = "Game-Score";
    displayName = "Game Score";

    private config: Required<GameScoreConfig>;
    private state: GameScoreState;
    private readonly configService = TrackConfigService.getInstance();

    constructor(config: GameScoreConfig = {}) {
        this.config = {
            maxRecords: 5,
            textColor: "white",
            bestTimeColor: "gold",
            lastTimeColor: "red",
            fontSize: 16,
            fontFamily: "Arial",
            title: "Best Race Times",
            padding: 20,
            ...config,
        };

        this.state = {
            bestRaceTimes: [],
            lastRaceTimeIndex: null,
        };
    }

    init(): void {}

    onEnter(): void {}

    onExit(): void {}

    update(_context: FrameContext): void {}

    resize(): void {}

    public onRaceComplete(lapTracker: ILapTracker): void {
        const lapTimes = lapTracker.getLapTimes();
        if (lapTimes.length >= 1) {
            const totalTime = lapTimes.reduce((sum, time) => sum + time, 0);
            this.addRaceTime(totalTime);
        }
    }

    private addRaceTime(time: number): void {
        const previousTimes = [...this.state.bestRaceTimes];
        const newTimes = [...previousTimes, time]
            .sort((a, b) => a - b)
            .slice(0, this.config.maxRecords);

        this.state.lastRaceTimeIndex = newTimes.indexOf(time);
        this.state.bestRaceTimes = newTimes;
    }

    render(context: FrameContext): void {
        if (this.state.bestRaceTimes.length === 0) return;

        const ctx = context.ctx;
        const canvas = context.ctx.canvas;
        const lapConfig = this.configService.getLapConfig();

        ctx.save();
        ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";

        const title = `${this.config.title} (${lapConfig.maxLaps} laps)`;
        const titleMetrics = ctx.measureText(title);
        const titleHeight =
            titleMetrics.actualBoundingBoxAscent +
            titleMetrics.actualBoundingBoxDescent;
        const lineHeight = this.config.fontSize + 5;
        const totalHeight =
            titleHeight + this.state.bestRaceTimes.length * lineHeight;

        const xPos = this.config.padding;
        const yPos = canvas.height - this.config.padding;

        ctx.fillStyle = this.config.textColor;
        ctx.fillText(title, xPos, yPos - totalHeight + titleHeight);

        for (let i = 0; i < this.state.bestRaceTimes.length; i++) {
            const time = this.state.bestRaceTimes[i];
            const textYPos =
                yPos - totalHeight + titleHeight + (i + 1) * lineHeight;

            if (i === 0) {
                ctx.fillStyle = this.config.bestTimeColor;
            } else if (i === this.state.lastRaceTimeIndex) {
                ctx.fillStyle = this.config.lastTimeColor;
            } else {
                ctx.fillStyle = this.config.textColor;
            }

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
        this.state.lastRaceTimeIndex = null;
    }

    getBestTimes(): number[] {
        return [...this.state.bestRaceTimes];
    }
}
